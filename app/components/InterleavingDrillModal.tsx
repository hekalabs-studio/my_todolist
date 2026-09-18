"use client";

import { useMemo, useState } from "react";
import {
  SUBJECTS,
  type AccentColor,
  type TkaQuestion,
} from "../data/curriculum";
import { isAnswerCorrect } from "./TkaExercise";
import MathText from "./MathText";

export type DrillItem = {
  question: TkaQuestion;
  subtopicId: string;
  subtopicTitle: string;
  subjectId: string;
  subjectTitle: string;
  subjectShortTitle: string;
  accent: AccentColor;
  icon: string;
};

interface InterleavingDrillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAnswers?: (answers: Record<string, string[]>) => void;
}

const ACCENT_CLASSES: Record<
  AccentColor,
  { bg: string; text: string; border: string; lightBg: string }
> = {
  indigo: {
    bg: "bg-indigo-600",
    text: "text-indigo-600",
    border: "border-indigo-200",
    lightBg: "bg-indigo-50",
  },
  rose: {
    bg: "bg-rose-600",
    text: "text-rose-600",
    border: "border-rose-200",
    lightBg: "bg-rose-50",
  },
  sky: {
    bg: "bg-sky-600",
    text: "text-sky-600",
    border: "border-sky-200",
    lightBg: "bg-sky-50",
  },
  amber: {
    bg: "bg-amber-600",
    text: "text-amber-600",
    border: "border-amber-200",
    lightBg: "bg-amber-50",
  },
  emerald: {
    bg: "bg-emerald-600",
    text: "text-emerald-600",
    border: "border-emerald-200",
    lightBg: "bg-emerald-50",
  },
};

/** Ambil seluruh bank soal TKA dari semua mapel. */
function buildAllDrillItems(): DrillItem[] {
  const items: DrillItem[] = [];
  for (const subject of SUBJECTS) {
    for (const chapter of subject.chapters) {
      for (const subtopic of chapter.subtopics) {
        for (const q of subtopic.tkaSoal ?? []) {
          items.push({
            question: q,
            subtopicId: subtopic.id,
            subtopicTitle: subtopic.title,
            subjectId: subject.id,
            subjectTitle: subject.title,
            subjectShortTitle: subject.shortTitle,
            accent: subject.accent,
            icon: subject.icon,
          });
        }
      }
    }
  }
  return items;
}

/**
 * Algoritma Interleaving:
 * Mengambil soal acak dari berbagai mapel secara bergantian (interleaved)
 * agar siswa tidak mengerjakan topik yang sama secara berturut-turut.
 */
function generateInterleavedQuestions(
  allItems: DrillItem[],
  selectedSubjectIds: string[],
  targetCount: number
): DrillItem[] {
  const filtered = allItems.filter((item) =>
    selectedSubjectIds.includes(item.subjectId)
  );

  if (filtered.length === 0) return [];

  // Kelompokkan soal per mapel
  const bySubject: Record<string, DrillItem[]> = {};
  for (const item of filtered) {
    if (!bySubject[item.subjectId]) bySubject[item.subjectId] = [];
    bySubject[item.subjectId].push(item);
  }

  // Acak setiap pool mapel
  for (const key of Object.keys(bySubject)) {
    bySubject[key].sort(() => Math.random() - 0.5);
  }

  const result: DrillItem[] = [];
  const subjectKeys = [...selectedSubjectIds].filter(
    (id) => bySubject[id] && bySubject[id].length > 0
  );

  if (subjectKeys.length === 0) return [];

  let index = 0;
  while (result.length < targetCount) {
    let pickedInThisRound = false;
    // Round-robin lintas mata pelajaran
    for (const subId of subjectKeys) {
      if (result.length >= targetCount) break;
      const pool = bySubject[subId];
      if (pool && pool.length > index) {
        result.push(pool[index]);
        pickedInThisRound = true;
      }
    }
    index++;
    if (!pickedInThisRound) break; // Semua soal sudah habis
  }

  return result;
}

export default function InterleavingDrillModal({
  isOpen,
  onClose,
  onSaveAnswers,
}: InterleavingDrillModalProps) {
  const allItems = useMemo(() => buildAllDrillItems(), []);

  // Mode: 'setup' | 'quiz' | 'result'
  const [step, setStep] = useState<"setup" | "quiz" | "result">("setup");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(() =>
    SUBJECTS.map((s) => s.id)
  );
  const [questionCount, setQuestionCount] = useState<number>(5);

  // State kuis
  const [drillQuestions, setDrillQuestions] = useState<DrillItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [isianDraft, setIsianDraft] = useState<string>("");

  if (!isOpen) return null;

  const toggleSubject = (id: string) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Minimal 1 mapel terpilih
        return prev.filter((s) => s !== id);
      }
      return [...prev, id];
    });
  };

  const startDrill = () => {
    const questions = generateInterleavedQuestions(
      allItems,
      selectedSubjects,
      questionCount
    );
    setDrillQuestions(questions);
    setCurrentIndex(0);
    setUserAnswers({});
    setIsianDraft("");
    setStep("quiz");
  };

  const currentItem = drillQuestions[currentIndex];

  const handleOptionPick = (optionId: string) => {
    if (!currentItem) return;
    const q = currentItem.question;
    const current = userAnswers[q.id] ?? [];

    if (q.bentuk === "pg") {
      setUserAnswers((prev) => ({ ...prev, [q.id]: [optionId] }));
    } else if (q.bentuk === "pgk-mcma") {
      const set = new Set(current);
      if (set.has(optionId)) set.delete(optionId);
      else set.add(optionId);
      setUserAnswers((prev) => ({ ...prev, [q.id]: [...set].sort() }));
    }
  };

  const handleIsianSubmit = () => {
    if (!currentItem) return;
    const q = currentItem.question;
    const trimmed = isianDraft.trim();
    if (trimmed) {
      setUserAnswers((prev) => ({ ...prev, [q.id]: [trimmed] }));
    }
  };

  const finishQuiz = () => {
    if (onSaveAnswers) {
      onSaveAnswers(userAnswers);
    }
    setStep("result");
  };

  // Perhitungan Hasil
  const results = drillQuestions.map((item) => {
    const ans = userAnswers[item.question.id] ?? [];
    const correct = isAnswerCorrect(item.question, ans);
    return { item, ans, correct };
  });

  const correctCount = results.filter((r) => r.correct).length;
  const totalQuestions = drillQuestions.length;
  const scorePercent =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Breakdown skor per mapel
  const subjectStatsMap: Record<
    string,
    { title: string; correct: number; total: number; accent: AccentColor }
  > = {};

  for (const r of results) {
    const id = r.item.subjectId;
    if (!subjectStatsMap[id]) {
      subjectStatsMap[id] = {
        title: r.item.subjectShortTitle,
        correct: 0,
        total: 0,
        accent: r.item.accent,
      };
    }
    subjectStatsMap[id].total += 1;
    if (r.correct) subjectStatsMap[id].correct += 1;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-sm sm:p-6"
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* ================= HEADER MODAL ================= */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-lg text-amber-700">
              ⚡
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Mode Drill Campuran (Interleaving)
              </h2>
              <p className="text-xs text-slate-500">
                Latihan adaptif acak lintas materi & mapel
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Tutup kuis"
          >
            ✕
          </button>
        </div>

        {/* ================= STEP 1: SETUP ================= */}
        {step === "setup" && (
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-xs leading-relaxed text-indigo-950">
              <span className="font-bold text-indigo-700">💡 Mengapa Interleaving?</span>{" "}
              Di UTBK/SNBT sesungguhnya, soal disajikan acak tanpa pengelompokan bab. Latihan
              campuran melatih otak mendiagnosis strategi rumus secara cepat dan akurat,
              menghilangkan ilusi penguasaan sesaat.
            </div>

            {/* Pilih Jumlah Soal */}
            <div className="mt-6">
              <label className="text-xs font-bold tracking-wide text-slate-700 uppercase">
                Pilih Jumlah Soal
              </label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setQuestionCount(5)}
                  className={`flex flex-col items-start rounded-2xl border p-4 text-left transition ${
                    questionCount === 5
                      ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="text-sm font-bold text-slate-900">
                    ⚡ 5 Soal (Sprint)
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    Kuis kilat ~5 menit untuk mengasah insting cepat.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuestionCount(10)}
                  className={`flex flex-col items-start rounded-2xl border p-4 text-left transition ${
                    questionCount === 10
                      ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="text-sm font-bold text-slate-900">
                    🎯 10 Soal (Simulasi Mini)
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    Sesi latihan mendalam ~10-12 menit lintas topik.
                  </span>
                </button>
              </div>
            </div>

            {/* Pilih Mata Pelajaran */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold tracking-wide text-slate-700 uppercase">
                  Pilih Mata Pelajaran
                </label>
                <button
                  type="button"
                  onClick={() => setSelectedSubjects(SUBJECTS.map((s) => s.id))}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Pilih Semua
                </button>
              </div>

              <div className="mt-2.5 flex flex-wrap gap-2">
                {SUBJECTS.map((sub) => {
                  const isChecked = selectedSubjects.includes(sub.id);
                  const accent = ACCENT_CLASSES[sub.accent];
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => toggleSubject(sub.id)}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                        isChecked
                          ? `${accent.lightBg} ${accent.border} ${accent.text} ring-1 ring-current/20`
                          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      <span>{sub.icon}</span>
                      <span>{sub.shortTitle}</span>
                      <span>{isChecked ? "✓" : "+"}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Setup */}
            <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={startDrill}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Mulai Drill Sekarang →
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: QUIZ ================= */}
        {step === "quiz" && currentItem && (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Top Info Bar */}
            <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold ${
                      ACCENT_CLASSES[currentItem.accent].lightBg
                    } ${ACCENT_CLASSES[currentItem.accent].border} ${
                      ACCENT_CLASSES[currentItem.accent].text
                    }`}
                  >
                    <span>{currentItem.icon}</span>
                    <span>{currentItem.subjectShortTitle}</span>
                  </span>

                  <span className="truncate text-xs font-medium text-slate-500">
                    · {currentItem.subtopicTitle}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-slate-200/80 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                    {currentItem.question.level}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {currentItem.question.bentuk === "pg"
                      ? "Pilihan Ganda"
                      : currentItem.question.bentuk === "pgk-mcma"
                        ? "PG Kompleks (Pilih > 1)"
                        : "Isian Singkat"}
                  </span>
                </div>
              </div>

              {/* Progress dots bar */}
              <div className="mt-3 flex items-center gap-1.5">
                {drillQuestions.map((q, idx) => {
                  const hasAnswered =
                    (userAnswers[q.question.id]?.length ?? 0) > 0;
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={q.question.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-2 flex-1 rounded-full transition-all ${
                        isCurrent
                          ? "bg-indigo-600 ring-2 ring-indigo-300"
                          : hasAnswered
                            ? "bg-emerald-400"
                            : "bg-slate-200"
                      }`}
                      title={`Ke nomor ${idx + 1}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Question Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="mb-2 text-xs font-bold text-slate-400 uppercase">
                Soal {currentIndex + 1} dari {drillQuestions.length}
              </div>

              {/* Stimulus Bacaan (jika ada) */}
              {currentItem.question.stimulus && (
                <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">
                  <p className="font-semibold text-slate-500 uppercase tracking-wide mb-1 text-[10px]">
                    Stimulus / Teks Bacaan:
                  </p>
                  <div className="whitespace-pre-line">
                    <MathText text={currentItem.question.stimulus} />
                  </div>
                </div>
              )}

              {/* Pertanyaan */}
              <div className="text-sm font-semibold leading-relaxed text-slate-900 sm:text-base">
                <MathText text={currentItem.question.question} />
              </div>

              {/* Pilihan Jawaban */}
              <div className="mt-5 space-y-2.5">
                {currentItem.question.bentuk === "isian" ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={isianDraft || (userAnswers[currentItem.question.id]?.[0] ?? "")}
                      onChange={(e) => setIsianDraft(e.target.value)}
                      placeholder="Ketik jawabanmu di sini…"
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleIsianSubmit}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      Simpan Jawaban Isian
                    </button>
                  </div>
                ) : (
                  currentItem.question.options?.map((opt) => {
                    const selected = (
                      userAnswers[currentItem.question.id] ?? []
                    ).includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleOptionPick(opt.id)}
                        className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left text-xs transition sm:text-sm ${
                          selected
                            ? "border-indigo-600 bg-indigo-50/70 font-semibold text-indigo-950 ring-1 ring-indigo-500"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/60"
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                            selected
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {opt.id}
                        </span>
                        <span className="flex-1">
                          <MathText text={opt.text} />
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quiz Navigation Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Sebelumnya
              </button>

              <span className="text-xs font-medium text-slate-500">
                {Object.keys(userAnswers).length} dari {drillQuestions.length} Terjawab
              </span>

              {currentIndex < drillQuestions.length - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((prev) =>
                      Math.min(drillQuestions.length - 1, prev + 1)
                    )
                  }
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                >
                  Selanjutnya →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={finishQuiz}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  Selesai & Cek Hasil ✓
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 3: RESULT ================= */}
        {step === "result" && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Score Banner */}
              <div className="rounded-3xl bg-slate-900 p-6 text-center text-white shadow-lg">
                <span className="text-3xl" aria-hidden="true">
                  {scorePercent >= 80 ? "🎉" : scorePercent >= 60 ? "👏" : "💪"}
                </span>
                <h3 className="mt-2 text-xl font-bold tracking-tight">
                  Skor Drill: {scorePercent}%
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Kamu menjawab benar {correctCount} dari {totalQuestions} soal campuran
                </p>

                {/* Breakdown per Mapel */}
                <div className="mt-5 grid grid-cols-2 gap-2 text-left sm:grid-cols-3">
                  {Object.entries(subjectStatsMap).map(([id, stats]) => (
                    <div
                      key={id}
                      className="rounded-xl bg-slate-800/80 p-3 text-xs border border-white/5"
                    >
                      <span className="block font-semibold text-slate-300 truncate">
                        {stats.title}
                      </span>
                      <span className="mt-0.5 block text-sm font-bold text-emerald-400">
                        {stats.correct}/{stats.total} Benar
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pembahasan Soal */}
              <div className="mt-6">
                <h4 className="text-sm font-bold text-slate-900">
                  Ulasan & Pembahasan Soal
                </h4>
                <p className="text-xs text-slate-500">
                  Pelajari konsep di balik setiap soal yang belum kamu kuasai.
                </p>

                <div className="mt-4 space-y-4">
                  {results.map(({ item, ans, correct }, idx) => (
                    <div
                      key={item.question.id}
                      className={`rounded-2xl border p-4 text-xs transition ${
                        correct
                          ? "border-emerald-200 bg-emerald-50/40"
                          : "border-rose-200 bg-rose-50/30"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900">
                          #{idx + 1} · {item.subjectShortTitle} ({item.subtopicTitle})
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 font-bold ${
                            correct
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {correct ? "✓ Benar" : "✕ Belum Tepat"}
                        </span>
                      </div>

                      <div className="mt-2 font-medium text-slate-800">
                        <MathText text={item.question.question} />
                      </div>

                      <div className="mt-2 text-slate-600">
                        <span>Jawabanmu: </span>
                        <span className="font-bold">
                          {ans.length > 0 ? ans.join(", ") : "Tidak dijawab"}
                        </span>
                        {!correct && (
                          <span className="ml-3 text-emerald-700">
                            Kunci:{" "}
                            <span className="font-bold">
                              {item.question.correctIds.join(", ")}
                            </span>
                          </span>
                        )}
                      </div>

                      <div className="mt-3 rounded-xl bg-white/80 p-3 text-slate-700 border border-slate-200/60">
                        <span className="font-bold text-slate-900">Pembahasan: </span>
                        <MathText text={item.question.explanation} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Result Footer Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4">
              <button
                type="button"
                onClick={() => setStep("setup")}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                🔄 Latihan Baru
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-slate-900 px-6 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                Tutup & Kembali
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
