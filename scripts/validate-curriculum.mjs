/**
 * Validasi integritas data kurikulum.
 * Dijalankan dengan: node scripts/validate-curriculum.mjs
 *
 * Memeriksa:
 *  - ID unik (subject / chapter / subtopic)
 *  - setiap subtopic punya materi, flashcards >= 4, quiz >= 4, latihanSoal >= 2
 *  - setiap quiz punya correctIndex yang valid & 4 opsi
 *  - setiap latihanSoal punya langkah & jawaban
 *  - jumlah menit total
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "app", "data", "curriculum.ts"), "utf8");

// Strip TypeScript type annotations agar bisa dievaluasi sebagai JS.
// Hapus blok `export type Name = { ... };` (multi-baris, brace-matching sederhana).
function stripExportTypes(src) {
  let out = src;
  for (;;) {
    const start = out.indexOf("export type ");
    if (start === -1) break;
    const braceStart = out.indexOf("{", start);
    const semi = out.indexOf(";", start);
    // Tipe tanpa body objek (union sederhana) -> hapus sampai titik koma.
    if (braceStart === -1 || (semi !== -1 && semi < braceStart)) {
      out = out.slice(0, start) + out.slice(semi + 1);
      continue;
    }
    let depth = 0;
    let i = braceStart;
    for (; i < out.length; i += 1) {
      if (out[i] === "{") depth += 1;
      else if (out[i] === "}") {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    const end = out.indexOf(";", i);
    out = out.slice(0, start) + out.slice(end + 1);
  }
  return out;
}

const js = stripExportTypes(source)
  .replace(/export const /g, "const ")
  .replace(/export function /g, "function ")
  .replace(/new Set<[^>]*>\(/g, "new Set(")
  .replace(/new Map<[^>]*>\(/g, "new Map(")
  // Hapus anotasi tipe pada parameter & return function.
  .replace(/\(([A-Za-z_]+):\s*[A-Za-z_<>\[\]|\s]+\)/g, "($1)")
  .replace(/\):\s*[A-Za-z_<>\[\]|\s]+\s*\{/g, ") {")
  .replace(/:\s*(Subject|Chapter|Subtopic|FlatSubtopic)\[\](?=\s*=)/g, "")
  .replace(/const ([A-Za-z_]+):\s*[A-Za-z_]+(\[\])? =/g, "const $1 =")
  .replace(/const ([A-Za-z_]+):\s*[A-Za-z_]+<[^>]*> =/g, "const $1 =");

const errors = [];

let data;
try {
  const runner = new Function(
    `${js}\nreturn { SUBJECTS, ALL_SUBTOPICS, ALL_SUBTOPIC_IDS, ALL_CHAPTERS, TOTAL_SUBTOPICS, TOTAL_CHAPTERS };`,
  );
  data = runner();
} catch (err) {
  console.error("GAGAL mengevaluasi kurikulum.ts:", err.message);
  const m = /<anonymous[^>]*>:(\d+)/.exec(err.stack || "");
  if (m) {
    const bad = js.split(/\r?\n/);
    const n = Number(m[1]);
    for (let i = Math.max(0, n - 8); i < Math.min(bad.length, n + 3); i += 1) {
      console.error(`${i + 1}${i + 1 === n ? " >>" : "   "}| ${bad[i]}`);
    }
  } else {
    // Fallback: sintaks gagal dikompilasi sehingga stack kosong.
    const bad = js.split(/\r?\n/);
    for (let i = 6740; i < Math.min(bad.length, 6762); i += 1) {
      console.error(`${i + 1}| ${bad[i]}`);
    }
  }
  process.exit(1);
}

const { SUBJECTS, ALL_SUBTOPICS, ALL_SUBTOPIC_IDS, TOTAL_SUBTOPICS, TOTAL_CHAPTERS } = data;

const seenIds = new Map();
function claim(id, kind, where) {
  if (!id) errors.push(`${kind} tanpa id di ${where}`);
  if (seenIds.has(id)) errors.push(`ID duplikat "${id}" (${kind}) di ${where}`);
  seenIds.set(id, kind);
}

for (const subject of SUBJECTS) {
  claim(subject.id, "subject", subject.title);
  if (!subject.chapters?.length) errors.push(`Subject ${subject.id} tanpa chapters`);
  for (const chapter of subject.chapters) {
    claim(chapter.id, "chapter", subject.id);
    if (typeof chapter.order !== "number") errors.push(`Chapter ${chapter.id} tanpa order`);
    if (!chapter.subtopics?.length) errors.push(`Chapter ${chapter.id} tanpa subtopics`);
    for (const st of chapter.subtopics) {
      claim(st.id, "subtopic", chapter.id);
      const where = `${subject.id} > ${chapter.id} > ${st.id}`;
      if (!st.title) errors.push(`${where}: title kosong`);
      if (typeof st.estimatedMinutes !== "number" || st.estimatedMinutes <= 0)
        errors.push(`${where}: estimatedMinutes tidak valid`);
      if (!st.materi?.ringkasan) errors.push(`${where}: materi.ringkasan kosong`);
      if (!st.materi?.rumus?.length) errors.push(`${where}: materi.rumus kosong`);
      if (!st.materi?.contoh?.length) errors.push(`${where}: materi.contoh kosong`);
      if ((st.flashcards?.length ?? 0) < 4)
        errors.push(`${where}: flashcards hanya ${st.flashcards?.length ?? 0} (min 4)`);
      if ((st.quiz?.length ?? 0) < 4)
        errors.push(`${where}: quiz hanya ${st.quiz?.length ?? 0} (min 4)`);
      if ((st.latihanSoal?.length ?? 0) < 2)
        errors.push(`${where}: latihanSoal hanya ${st.latihanSoal?.length ?? 0} (min 2)`);
      const tkaCount = st.tkaSoal?.length ?? 0;
      // tkaSoal OPSIONAL: subtopik tanpa soal boleh (mis. pengayaan mtl).
      // Bila ada soal, wajib >= 4 dengan komposisi 2 pg + 1 pgk-mcma + 1 isian.
      if (tkaCount > 0) {
        if (tkaCount < 4)
          errors.push(`${where}: tkaSoal hanya ${tkaCount} (min 4)`);

      let tkaPg = 0;
      let tkaMcma = 0;
      let tkaIsian = 0;
      for (const t of st.tkaSoal ?? []) {
        if (!["pg", "pgk-mcma", "isian"].includes(t.bentuk))
          errors.push(`${where}: tka ${t.id} bentuk "${t.bentuk}" tidak valid`);
        if (!["L1", "L2", "L3"].includes(t.level))
          errors.push(`${where}: tka ${t.id} level "${t.level}" tidak valid`);
        if (!t.question) errors.push(`${where}: tka ${t.id} tanpa question`);
        if (!t.explanation) errors.push(`${where}: tka ${t.id} tanpa explanation`);
        if (!Array.isArray(t.correctIds) || t.correctIds.length === 0)
          errors.push(`${where}: tka ${t.id} tanpa correctIds`);

        if (t.bentuk === "isian") {
          tkaIsian += 1;
        } else {
          if (!Array.isArray(t.options) || t.options.length !== 5)
            errors.push(`${where}: tka ${t.id} tidak punya 5 opsi`);
          const ids = new Set((t.options ?? []).map((o) => o.id));
          for (const key of t.correctIds ?? []) {
            if (!ids.has(key))
              errors.push(`${where}: tka ${t.id} kunci "${key}" tidak ada di opsi`);
          }
          if (t.bentuk === "pg" && t.correctIds?.length !== 1)
            errors.push(`${where}: tka ${t.id} bentuk pg harus punya tepat 1 kunci`);
          if (t.bentuk === "pgk-mcma") {
            tkaMcma += 1;
            if ((t.correctIds?.length ?? 0) < 2)
              errors.push(`${where}: tka ${t.id} bentuk pgk-mcma butuh minimal 2 kunci`);
          } else if (t.bentuk === "pg") {
            tkaPg += 1;
          }
        }
      }
      if (tkaPg < 2) errors.push(`${where}: tkaSoal butuh minimal 2 soal pg (ada ${tkaPg})`);
      if (tkaMcma < 1) errors.push(`${where}: tkaSoal butuh minimal 1 soal pgk-mcma (ada ${tkaMcma})`);
      if (tkaIsian < 1) errors.push(`${where}: tkaSoal butuh minimal 1 soal isian (ada ${tkaIsian})`);
      }

      for (const fc of st.flashcards ?? []) {
        if (!fc.front || !fc.back) errors.push(`${where}: flashcard ${fc.id} tidak lengkap`);
      }
      for (const q of st.quiz ?? []) {
        if (!Array.isArray(q.options) || q.options.length !== 4)
          errors.push(`${where}: quiz ${q.id} tidak punya 4 opsi`);
        if (typeof q.correctIndex !== "number" || q.correctIndex < 0 || q.correctIndex >= (q.options?.length ?? 0))
          errors.push(`${where}: quiz ${q.id} correctIndex di luar rentang`);
        if (!q.explanation) errors.push(`${where}: quiz ${q.id} tanpa explanation`);
      }
      for (const l of st.latihanSoal ?? []) {
        if (!["hots", "sulit"].includes(l.level))
          errors.push(`${where}: latihan ${l.id} level "${l.level}" tidak valid`);
        if (!l.langkah?.length) errors.push(`${where}: latihan ${l.id} tanpa langkah`);
        if (!l.jawaban) errors.push(`${where}: latihan ${l.id} tanpa jawaban`);
      }
    }
  }
}

const totalMinutes = ALL_SUBTOPICS.reduce((s, x) => s + x.estimatedMinutes, 0);

console.log("=== VALIDASI KURIKULUM ===");
console.log(`Subjects           : ${SUBJECTS.length}`);
console.log(`Chapters (bab)     : ${TOTAL_CHAPTERS}`);
console.log(`Subtopics          : ${TOTAL_SUBTOPICS}`);
console.log(`ID unik tersimpan  : ${ALL_SUBTOPIC_IDS.length}`);
console.log(`Total menit belajar: ${totalMinutes} (~${(totalMinutes / 60).toFixed(1)} jam)`);
console.log(`Flashcards         : ${ALL_SUBTOPICS.reduce((s, x) => s + x.flashcards.length, 0)}`);
console.log(`Quiz               : ${ALL_SUBTOPICS.reduce((s, x) => s + x.quiz.length, 0)}`);
console.log(`Latihan soal       : ${ALL_SUBTOPICS.reduce((s, x) => s + x.latihanSoal.length, 0)}`);
console.log(
  `Soal TKA           : ${ALL_SUBTOPICS.reduce((s, x) => s + (x.tkaSoal?.length ?? 0), 0)}` +
    ` (pg/mcma/isian = ${ALL_SUBTOPICS.reduce((s, x) => s + (x.tkaSoal?.filter((t) => t.bentuk === "pg").length ?? 0), 0)}` +
    `/${ALL_SUBTOPICS.reduce((s, x) => s + (x.tkaSoal?.filter((t) => t.bentuk === "pgk-mcma").length ?? 0), 0)}` +
    `/${ALL_SUBTOPICS.reduce((s, x) => s + (x.tkaSoal?.filter((t) => t.bentuk === "isian").length ?? 0), 0)})`,
);
console.log("\nPer mata pelajaran:");
for (const subject of SUBJECTS) {
  const subs = ALL_SUBTOPICS.filter((x) => x.subjectId === subject.id);
  const mins = subs.reduce((s, x) => s + x.estimatedMinutes, 0);
  console.log(
    `  ${subject.icon} ${subject.title.padEnd(28)} ${String(subject.chapters.length).padStart(2)} bab, ` +
      `${String(subs.length).padStart(2)} sub-bab, ${mins} menit`,
  );
}

if (errors.length) {
  console.log(`\n❌ ${errors.length} MASALAH DITEMUKAN:`);
  for (const e of errors) console.log("  - " + e);
  process.exit(1);
}
console.log("\n✅ Semua data valid: tidak ada masalah.");
