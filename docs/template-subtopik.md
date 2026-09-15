# Panduan Menambah Subtopik Baru

Semua konten kurikulum berada di **satu file saja**:

```
app/data/curriculum.ts
```

File lain (`app/page.tsx`, `scripts/validate-curriculum.mjs`) **tidak perlu diubah** —
keduanya membaca otomatis dari file ini.

---

## 1. Peta lokasi blok per mata pelajaran

| Baris | Mata Pelajaran | Nama konstanta |
|---|---|---|
| 119 | Matematika Wajib | `MATEMATIKA_WAJIB` |
| 1707 | Bahasa Indonesia | `BAHASA_INDONESIA` |
| 3350 | Bahasa Inggris Wajib | `BAHASA_INGGRIS_WAJIB` |
| 4957 | Matematika Tingkat Lanjut | `MATEMATIKA_TINGKAT_LANJUT` |
| 6345 | Bahasa Inggris Tingkat Lanjut | `BAHASA_INGGRIS_TINGKAT_LANJUT` |

> Baris bisa bergeser setelah kamu menambah konten. Cari dengan `Ctrl+F`:
> `const BAHASA_INGGRIS_TINGKAT_LANJUT` atau komentar `5. BAHASA INGGRIS TINGKAT LANJUT`.

---

## 2. Aturan penulisan ID

ID **wajib unik di seluruh file** dan **stabil selamanya** (ID ini jadi key LocalStorage,
kalau diubah progres user hilang).

```
Subject  : <kode-mapel>                    contoh "matematika-wajib"
Chapter  : <kode-mapel>-<slug-bab>         contoh "mw-aljabar"
Subtopic : <kode-mapel>-<slug-bab>-<slug>  contoh "mw-aljabar-nilai-mutlak"
          ├─ flashcard : <id-subtopik>-fc1, -fc2, ...
          ├─ quiz      : <id-subtopik>-q1,  -q2, ...
          └─ latihan   : <id-subtopik>-l1,  -l2, ...
```

Kode mapel yang dipakai:

| Kode | Mapel |
|---|---|
| `mw` | Matematika Wajib |
| `bi` | Bahasa Indonesia |
| `biw` | Bahasa Inggris Wajib |
| `mtl` | Matematika Tingkat Lanjut |
| `bitl` | Bahasa Inggris Tingkat Lanjut |

---

## 3. Syarat minimum isi (dicek otomatis oleh validator)

| Field | Minimum | Catatan |
|---|---|---|
| `estimatedMinutes` | > 0 | total sekarang 2.470 menit |
| `materi.ringkasan` | 1 paragraf | tidak boleh kosong |
| `materi.rumus` | ≥ 1 | rumus matematika pakai LaTeX `\\( ... \\)` |
| `materi.contoh` | ≥ 1 | ada `soal` + `pembahasan` |
| `flashcards` | ≥ 4 | tiap kartu: `id`, `front`, `back` |
| `quiz` | ≥ 4 | tiap soal: 4 opsi, `correctIndex` 0-3, ada `explanation` |
| `latihanSoal` | ≥ 2 | `level` = `"hots"` atau `"sulit"`, ada `langkah[]` + `jawaban` |

Jalankan `npm run validate:data` untuk memastikan semuanya lolos.

---

## 4. Template siap-tempel

Salin blok di bawah, tempelkan **di dalam array `subtopics: [...]`**
pada chapter yang dituju (perhatikan posisi koma!).

```ts
        {
          id: "<kode-mapel>-<slug-bab>-<slug-subtopik>",
          title: "Judul Subtopik",
          estimatedMinutes: 60,
          materi: {
            ringkasan:
              "Satu paragraf pengantar yang menjelaskan konsep inti dan mengapa ini penting.",
            rumus: [
              "Kaidah atau rumus penting pertama",
              "Kaidah atau rumus penting kedua",
              "Untuk matematika: \\( x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\)",
            ],
            contoh: [
              {
                soal: "Contoh soal ringkas pertama.",
                pembahasan: "Langkah singkat penyelesaiannya.",
              },
              {
                soal: "Contoh soal ringkas kedua.",
                pembahasan: "Langkah singkat penyelesaiannya.",
              },
            ],
          },
          flashcards: [
            {
              id: "<kode-mapel>-<slug-bab>-<slug-subtopik>-fc1",
              front: "Pertanyaan pemicu 1?",
              back: "Jawaban / definisi ringkas.",
            },
            {
              id: "<kode-mapel>-<slug-bab>-<slug-subtopik>-fc2",
              front: "Pertanyaan pemicu 2?",
              back: "Jawaban / definisi ringkas.",
            },
            {
              id: "<kode-mapel>-<slug-bab>-<slug-subtopik>-fc3",
              front: "Pertanyaan pemicu 3?",
              back: "Jawaban / definisi ringkas.",
            },
            {
              id: "<kode-mapel>-<slug-bab>-<slug-subtopik>-fc4",
              front: "Pertanyaan pemicu 4?",
              back: "Jawaban / definisi ringkas.",
            },
          ],
          quiz: [
            {
              id: "<kode-mapel>-<slug-bab>-<slug-subtopik>-q1",
              question: "Pertanyaan pilihan ganda 1 ...",
              options: ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
              correctIndex: 1,
              explanation: "Alasan mengapa Opsi B benar.",
            },
            {
              id: "<kode-mapel>-<slug-bab>-<slug-subtopik>-q2",
              question: "Pertanyaan pilihan ganda 2 ...",
              options: ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
              correctIndex: 0,
              explanation: "Alasan mengapa Opsi A benar.",
            },
            {
              id: "<kode-mapel>-<slug-bab>-<slug-subtopik>-q3",
              question: "Pertanyaan pilihan ganda 3 ...",
              options: ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
              correctIndex: 3,
              explanation: "Alasan mengapa Opsi D benar.",
            },
            {
              id: "<kode-mapel>-<slug-bab>-<slug-subtopik>-q4",
              question: "Pertanyaan pilihan ganda 4 ...",
              options: ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
              correctIndex: 2,
              explanation: "Alasan mengapa Opsi C benar.",
            },
          ],
          latihanSoal: [
            {
              id: "<kode-mapel>-<slug-bab>-<slug-subtopik>-l1",
              level: "hots",
              question: "Soal penalaran tingkat HOTs ...",
              langkah: [
                "Langkah 1: mengidentifikasi informasi yang diberikan.",
                "Langkah 2: memilih konsep atau rumus yang relevan.",
                "Langkah 3: melakukan perhitungan / analisis.",
                "Langkah 4: menarik kesimpulan.",
              ],
              jawaban: "Kunci jawaban akhir yang ringkas dan jelas.",
            },
            {
              id: "<kode-mapel>-<slug-bab>-<slug-subtopik>-l2",
              level: "sulit",
              question: "Soal tingkat sulit dengan analisis mendalam ...",
              langkah: [
                "Langkah 1: memecah soal menjadi bagian-bagian.",
                "Langkah 2: menganalisis setiap bagian secara terpisah.",
                "Langkah 3: menggabungkan hasil analisis.",
                "Langkah 4: mengevaluasi kewajaran jawaban.",
              ],
              jawaban: "Kunci jawaban akhir yang ringkas dan jelas.",
            },
          ],
        },
```

---

## 5. Alur kerja yang disarankan

1. Buka `app/data/curriculum.ts`, cari chapter tujuan.
2. Tempel blok di atas pada posisi yang benar di dalam `subtopics: [...]`.
3. Isi seluruh placeholder, ganti ID sesuai aturan bagian 2.
4. Simpan, lalu jalankan:

   ```bash
   npm run validate:data
   ```

   Harus muncul `✅ Semua data valid: tidak ada masalah.`

5. Jalankan `npx tsc --noEmit` untuk memastikan tidak ada error TypeScript.
6. Lihat hasilnya di browser:

   ```bash
   npm run dev
   ```

   Buka `http://localhost:3000`.

---

## 6. Catatan penting

### LaTeX pada string TypeScript
Backslash **harus di-escape ganda** di dalam string biasa:

```ts
// BENAR — menghasilkan \( x^2 \) saat dirender
rumus: ["\\( x^2 + y^2 = r^2 \\)"],

// SALAH — \x dianggap escape sequence yang tidak dikenal
rumus: ["\( x^2 + y^2 = r^2 \)"],
```

### Tanda kutip di dalam teks
Gunakan tanda kutip tunggal `'` di dalam string berkutip ganda `"`.
Jangan menaruh `"` mentah di tengah string.

### Jangan mengubah ID yang sudah ada
Mengubah ID = progres user yang tersimpan di LocalStorage akan hilang.
Kalau memang harus mengubah, tambahkan ID lama ke logika kompatibilitas
di `ALL_SUBTOPIC_IDS` (lihat blok AGREGASI di baris ~6496).

### Kompatibilitas antarmuka
`app/page.tsx` membaca `SUBJECTS` dari file ini dan otomatis menelusuri
`subject.chapters[].subtopics[]`, jadi subtopik baru langsung muncul di UI
tanpa perlu menyentuh komponen React sama sekali.
