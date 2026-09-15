/**
 * Struktur data kurikulum TKA SMA Kelas 12.
 *
 * Hierarki: Subject -> Chapter (Bab) -> Subtopic (Anak Sub-Bab).
 * Setiap anak sub-bab punya 4 fitur: materi, flashcards, quiz, latihanSoal.
 *
 * Aturan ID (WAJIB stabil, karena dipakai sebagai key LocalStorage):
 *   Subject  : "<kode-mapel>"                      contoh "matematika-wajib"
 *   Chapter  : "<kode-mapel>-<slug-bab>"           contoh "mw-aljabar"
 *   Subtopic : "<kode-mapel>-<slug-bab>-<slug>"    contoh "mw-aljabar-nilai-mutlak"
 *
 * CATATAN KOMPATIBILITAS:
 * ID Chapter sengaja dipertahankan sama dengan ID sub-materi versi lama
 * (mis. "mw-aljabar") agar progres yang sudah tersimpan di LocalStorage
 * tetap terbaca. ID Subtopic memakai prefix Chapter sebagai namespace.
 */

/* ------------------------------------------------------------------
 * TIPE DASAR
 * ----------------------------------------------------------------*/

/** Warna aksen per mata pelajaran (class Tailwind harus literal/statis). */
export type AccentColor = "indigo" | "rose" | "sky" | "amber" | "emerald";

/** Blok materi: rangkuman konsep dasar, rumus/kaidah, dan contoh ringkas. */
export type Materi = {
  /** Rangkuman konsep dasar (1 paragraf pengantar). */
  ringkasan: string;
  /** Rumus / kaidah penting. Rumus matematika ditulis dalam LaTeX \( ... \). */
  rumus: string[];
  /** Contoh ringkas beserta pembahasan satu-dua langkah. */
  contoh: { soal: string; pembahasan: string }[];
};

/** Satu kartu penguatan memori. */
export type Flashcard = {
  id: string;
  /** Sisi depan kartu (istilah / pertanyaan pemicu). */
  front: string;
  /** Sisi belakang kartu (jawaban / definisi). */
  back: string;
};

/** Satu soal pilihan ganda interaktif. */
export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  /** Indeks jawaban benar pada array `options` (0-based). */
  correctIndex: number;
  /** Penjelasan singkat mengapa jawaban itu benar. */
  explanation: string;
};

/** Satu soal latihan bertipe penalaran / HOTs. */
export type LatihanSoal = {
  id: string;
  /** Tingkat kesulitan: "sedang" | "sulit" | "hots". */
  level: "sedang" | "sulit" | "hots";
  question: string;
  /** Langkah pengerjaan detail, satu langkah per elemen. */
  langkah: string[];
  /** Kunci jawaban akhir. */
  jawaban: string;
};

/* ------------------------------------------------------------------
 * LATIHAN TINGKAT TKA SMA
 * ----------------------------------------------------------------
 * Mengikuti bentuk soal resmi TKA (Pusmendik Kemendikdasmen):
 *   "pg"        -> Pilihan Ganda, 5 opsi (A-E), satu jawaban benar
 *   "pgk-mcma"  -> Pilihan Ganda Kompleks MCMA, jawaban benar LEBIH DARI SATU
 *   "isian"     -> jawaban singkat (satu kata / angka)
 * Setiap sub-bab wajib punya minimal 4 soal: 2 pg, 1 pgk-mcma, 1 isian.
 * ------------------------------------------------------------------*/

export type TkaOption = {
  id: string;
  text: string;
};

export type TkaQuestion = {
  id: string;
  /** Bentuk soal mengikuti TKA SMA. */
  bentuk: "pg" | "pgk-mcma" | "isian";
  /** Level kognitif TKA: L1 (pengetahuan), L2 (aplikasi), L3 (penalaran). */
  level: "L1" | "L2" | "L3";
  /** Stimulus: teks bacaan / data / konteks. Kosongkan bila soal berdiri sendiri. */
  stimulus?: string;
  question: string;
  /**
   * Daftar opsi untuk bentuk "pg" (5 opsi) dan "pgk-mcma" (5 opsi).
   * Untuk "isian" opsional, dipakai sebagai kunci alternatif bila perlu.
   */
  options?: TkaOption[];
  /**
   * Kunci jawaban:
   *   "pg"       -> tepat 1 id opsi, mis. ["B"]
   *   "pgk-mcma" -> 2 id opsi atau lebih, mis. ["A", "C", "E"]
   *   "isian"    -> daftar jawaban yang diterima (case-insensitive)
   */
  correctIds: string[];
  /** Penjelasan kunci untuk pembahasan setelah menjawab. */
  explanation: string;
};

/** Anak sub-bab: unit terkecil yang bisa di-checklist. */
export type Subtopic = {
  /** ID unik & stabil, dipakai sebagai key LocalStorage. */
  id: string;
  title: string;
  /** Estimasi alokasi waktu belajar (menit). */
  estimatedMinutes: number;
  /** 1. MATERI — rangkuman konsep dasar, rumus, contoh ringkas. */
  materi: Materi;
  /** 2. FLASHCARDS — minimal 3-5 kartu penguatan memori. */
  flashcards: Flashcard[];
  /** 3. QUIZ — minimal 3 soal pilihan ganda + kunci + penjelasan. */
  quiz: QuizQuestion[];
  /** 4. LATIHAN SOAL — minimal 2 soal penalaran/HOTs + langkah detail. */
  latihanSoal: LatihanSoal[];
  /**
   * 5. LATIHAN TINGKAT TKA SMA — soal prasyarat sebelum sub-bab boleh
   * dicentang. Bentuk soal mengikuti TKA resmi (pg / pgk-mcma / isian),
   * minimal 4 soal per sub-bab: 2 pg, 1 pgk-mcma, 1 isian.
   * Tetap opsional di tipe data: sub-bab tanpa soal TKA bebas dicentang
   * (fallback UI), berguna saat menambah mapel baru sebelum soalnya ditulis.
   */
  tkaSoal?: TkaQuestion[];
};

/** Bab / kelompok sub-bab di dalam satu mata pelajaran. */
export type Chapter = {
  /** ID unik & stabil (juga dipakai sebagai key LocalStorage). */
  id: string;
  title: string;
  /** Urutan roadmap: 1 = paling dasar, makin besar makin mahir. */
  order: number;
  subtopics: Subtopic[];
};

export type Subject = {
  id: string;
  title: string;
  /** Label singkat untuk tab filter (ramah mobile). */
  shortTitle: string;
  icon: string;
  accent: AccentColor;
  description: string;
  chapters: Chapter[];
};

/** Representasi datar satu anak sub-bab (hasil flatten untuk checkbox). */
export type FlatSubtopic = Subtopic & {
  subjectId: string;
  subjectTitle: string;
  chapterId: string;
  chapterTitle: string;
  /** Posisi global 1-based dalam roadmap belajar. */
  step: number;
};

/* ==================================================================
 * 1. MATEMATIKA WAJIB
 * ================================================================*/

const MATEMATIKA_WAJIB: Subject = {
  id: "matematika-wajib",
  title: "Matematika Wajib",
  shortTitle: "Mat. Wajib",
  icon: "📐",
  accent: "indigo",
  description: "Fondasi berhitung, penalaran, dan interpretasi data.",
  chapters: [
    {
      id: "mw-aljabar",
      title: "Aljabar",
      order: 1,
      subtopics: [
        {
          id: "mw-aljabar-nilai-mutlak",
          title: "Persamaan & Pertidaksamaan Nilai Mutlak",
          estimatedMinutes: 60,
          materi: {
            ringkasan:
              "Nilai mutlak |x| menyatakan jarak x dari titik nol pada garis bilangan, sehingga hasilnya selalu tak negatif. Persamaan dan pertidaksamaan nilai mutlak diselesaikan dengan mengubahnya menjadi bentuk tanpa tanda mutlak, lalu memeriksa syarat pada setiap kasus.",
            rumus: [
              "\\( |x| = \\sqrt{x^{2}} \\), sehingga \\( |x| \\ge 0 \\) untuk semua \\( x \\in \\mathbb{R} \\)",
              "\\( |x| = a \\iff x = a \\text{ atau } x = -a \\), dengan syarat \\( a \\ge 0 \\)",
              "\\( |x| < a \\iff -a < x < a \\) dan \\( |x| > a \\iff x < -a \\text{ atau } x > a \\)",
              "\\( |f(x)| = |g(x)| \\iff \\left(f(x)\\right)^{2} = \\left(g(x)\\right)^{2} \\)",
              "\\( |f(x)| \\le g(x) \\iff -g(x) \\le f(x) \\le g(x) \\), dengan syarat \\( g(x) \\ge 0 \\)",
            ],
            contoh: [
              {
                soal: "Tentukan himpunan penyelesaian dari \\( |2x - 5| = 7 \\).",
                pembahasan:
                  "Pecah menjadi dua kasus: \\( 2x - 5 = 7 \\) memberi \\( x = 6 \\); dan \\( 2x - 5 = -7 \\) memberi \\( x = -1 \\). Jadi HP = { -1, 6 }.",
              },
              {
                soal: "Selesaikan \\( |3x + 1| < 8 \\).",
                pembahasan:
                  "Bentuk \\( |f(x)| < a \\) menjadi \\( -8 < 3x + 1 < 8 \\). Kurangi 1: \\( -9 < 3x < 7 \\). Bagi 3: \\( -3 < x < \\tfrac{7}{3} \\).",
              },
            ],
          },
          flashcards: [
            {
              id: "mw-aljabar-nilai-mutlak-fc1",
              front: "Arti geometris \\( |x - a| \\) ?",
              back: "Jarak titik \\( x \\) ke titik \\( a \\) pada garis bilangan.",
            },
            {
              id: "mw-aljabar-nilai-mutlak-fc2",
              front: "Kapan \\( |x| = a \\) tidak punya solusi?",
              back: "Ketika \\( a < 0 \\). Nilai mutlak tidak pernah negatif, jadi tidak ada \\( x \\) yang memenuhi.",
            },
            {
              id: "mw-aljabar-nilai-mutlak-fc3",
              front: "Ubah \\( |x| > a \\) menjadi bentuk tanpa mutlak.",
              back: "\\( x < -a \\) atau \\( x > a \\) — hasilnya gabungan dua interval, bukan satu interval.",
            },
            {
              id: "mw-aljabar-nilai-mutlak-fc4",
              front: "Mengapa \\( |f(x)| = |g(x)| \\) boleh dikuadratkan?",
              back: "Karena kedua ruas tak negatif, sehingga \\( |f(x)| = |g(x)| \\iff f^{2}(x) = g^{2}(x) \\) tanpa menambah akar palsu.",
            },
            {
              id: "mw-aljabar-nilai-mutlak-fc5",
              front: "Syarat wajib saat menyelesaikan \\( |f(x)| < g(x) \\) ?",
              back: "Harus \\( g(x) > 0 \\). Jika \\( g(x) \\le 0 \\), tidak ada solusi karena ruas kiri selalu tak negatif.",
            },
          ],
          quiz: [
            {
              id: "mw-aljabar-nilai-mutlak-q1",
              question: "Himpunan penyelesaian dari \\( |x - 4| = 9 \\) adalah ...",
              options: ["{ 5, 13 }", "{ -5, 13 }", "{ -13, 5 }", "{ -13, -5 }"],
              correctIndex: 1,
              explanation:
                "\\( x - 4 = 9 \\Rightarrow x = 13 \\) dan \\( x - 4 = -9 \\Rightarrow x = -5 \\). HP = { -5, 13 }.",
            },
            {
              id: "mw-aljabar-nilai-mutlak-q2",
              question: "Nilai \\( x \\) yang memenuhi \\( |2x + 3| \\le 5 \\) adalah ...",
              options: [
                "\\( x \\le -4 \\) atau \\( x \\ge 1 \\)",
                "\\( -4 \\le x \\le 1 \\)",
                "\\( -1 \\le x \\le 4 \\)",
                "\\( x \\le -1 \\) atau \\( x \\ge 4 \\)",
              ],
              correctIndex: 1,
              explanation:
                "\\( -5 \\le 2x + 3 \\le 5 \\Rightarrow -8 \\le 2x \\le 2 \\Rightarrow -4 \\le x \\le 1 \\).",
            },
            {
              id: "mw-aljabar-nilai-mutlak-q3",
              question: "Jika \\( |x + 1| = |2x - 4| \\), nilai \\( x \\) yang memenuhi adalah ...",
              options: ["\\( x = 5 \\) saja", "\\( x = 1 \\) saja", "\\( x = 1 \\) atau \\( x = 5 \\)", "\\( x = -1 \\) atau \\( x = 5 \\)"],
              correctIndex: 2,
              explanation:
                "Kuadratkan: \\( (x + 1)^{2} = (2x - 4)^{2} \\Rightarrow x^{2} + 2x + 1 = 4x^{2} - 16x + 16 \\Rightarrow 3x^{2} - 18x + 15 = 0 \\Rightarrow x^{2} - 6x + 5 = 0 \\Rightarrow (x-1)(x-5)=0 \\).",
            },
            {
              id: "mw-aljabar-nilai-mutlak-q4",
              question: "Pertidaksamaan \\( |x + 2| > 6 \\) memiliki himpunan penyelesaian ...",
              options: [
                "\\( -8 < x < 4 \\)",
                "\\( x < -8 \\) atau \\( x > 4 \\)",
                "\\( x < -4 \\) atau \\( x > 8 \\)",
                "\\( -4 < x < 8 \\)",
              ],
              correctIndex: 1,
              explanation:
                "\\( |f(x)| > a \\) menjadi \\( x + 2 < -6 \\) atau \\( x + 2 > 6 \\), yaitu \\( x < -8 \\) atau \\( x > 4 \\).",
            },
          ],
          latihanSoal: [
            {
              id: "mw-aljabar-nilai-mutlak-l1",
              level: "hots",
              question:
                "Sebuah mesin pengemasan diisi produk dengan berat ideal 250 gram. Berat aktual \\( w \\) gram masih diterima pabrik jika selisihnya terhadap berat ideal tidak lebih dari 12 gram. (a) Tuliskan pertidaksamaan nilai mutlak untuk \\( w \\). (b) Tentukan rentang berat yang diterima. (c) Jika mesin menghasilkan kemasan 264 gram, apakah lolos QC? Jelaskan.",
              langkah: [
                "Terjemahkan 'selisih berat aktual terhadap berat ideal tidak lebih dari 12 gram' menjadi bentuk nilai mutlak: \\( |w - 250| \\le 12 \\).",
                "Ubah ke bentuk tanpa mutlak: \\( -12 \\le w - 250 \\le 12 \\).",
                "Tambahkan 250 pada ketiga ruas: \\( 238 \\le w \\le 262 \\).",
                "Rentang berat yang diterima adalah 238 gram sampai 262 gram (inklusif).",
                "Uji \\( w = 264 \\): \\( |264 - 250| = 14 > 12 \\), sehingga melewati toleransi 12 gram.",
                "Kesimpulan: kemasan 264 gram TIDAK lolos QC karena selisihnya 14 gram, 2 gram di luar batas toleransi.",
              ],
              jawaban: "(a) \\( |w - 250| \\le 12 \\) (b) \\( 238 \\le w \\le 262 \\) gram (c) Tidak lolos, karena \\( |264-250| = 14 > 12 \\).",
            },
            {
              id: "mw-aljabar-nilai-mutlak-l2",
              level: "sulit",
              question:
                "Tentukan semua nilai \\( x \\) real yang memenuhi \\( |x - 3| = |2x + 1| \\), lalu periksa apakah solusinya memenuhi \\( x < 1 \\).",
              langkah: [
                "Karena kedua ruas tak negatif, kuadratkan kedua sisi: \\( (x-3)^{2} = (2x+1)^{2} \\).",
                "Gunakan identitas \\( A^{2} - B^{2} = (A-B)(A+B) \\): \\( (x - 3 - 2x - 1)(x - 3 + 2x + 1) = 0 \\).",
                "Sederhanakan: \\( (-x - 4)(3x - 2) = 0 \\).",
                "Faktorkan: \\( -x - 4 = 0 \\Rightarrow x = -4 \\), dan \\( 3x - 2 = 0 \\Rightarrow x = \\tfrac{2}{3} \\).",
                "Verifikasi \\( x = -4 \\): \\( |-7| = 7 \\) dan \\( |-7| = 7 \\). Benar.",
                "Verifikasi \\( x = \\tfrac{2}{3} \\): \\( \\left|-\\tfrac{7}{3}\\right| = \\tfrac{7}{3} \\) dan \\( \\left|\\tfrac{7}{3}\\right| = \\tfrac{7}{3} \\). Benar.",
                "Uji syarat \\( x < 1 \\): \\( -4 < 1 \\) memenuhi; \\( \\tfrac{2}{3} < 1 \\) juga memenuhi.",
              ],
              jawaban: "\\( x = -4 \\) atau \\( x = \\tfrac{2}{3} \\); keduanya memenuhi \\( x < 1 \\).",
            },
          ],
          tkaSoal: [
            {
              id: "mw-aljabar-nilai-mutlak-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Nilai dari \\( |{-7}| + |3| \\) adalah ...",
              options: [
                { id: "A", text: "\\( -4 \\)" },
                { id: "B", text: "\\( 4 \\)" },
                { id: "C", text: "\\( 10 \\)" },
                { id: "D", text: "\\( -10 \\)" },
                { id: "E", text: "\\( 21 \\)" },
              ],
              correctIds: ["C"],
              explanation:
                "\\( |{-7}| = 7 \\) dan \\( |3| = 3 \\), sehingga jumlahnya \\( 7 + 3 = 10 \\). Nilai mutlak selalu tak negatif.",
            },
            {
              id: "mw-aljabar-nilai-mutlak-tka2",
              bentuk: "pg",
              level: "L2",
              question: "Himpunan penyelesaian dari \\( |2x - 6| = 10 \\) adalah ...",
              options: [
                { id: "A", text: "\\( x = 8 \\)" },
                { id: "B", text: "\\( x = -2 \\)" },
                { id: "C", text: "\\( x = 8 \\) atau \\( x = -2 \\)" },
                { id: "D", text: "\\( x = 2 \\) atau \\( x = -8 \\)" },
                { id: "E", text: "\\( -2 < x < 8 \\)" },
              ],
              correctIds: ["C"],
              explanation:
                "\\( |2x - 6| = 10 \\) memberi \\( 2x - 6 = 10 \\Rightarrow x = 8 \\) atau \\( 2x - 6 = -10 \\Rightarrow x = -2 \\). Kedua nilai harus diperiksa dan keduanya memenuhi.",
            },
            {
              id: "mw-aljabar-nilai-mutlak-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              question:
                "Pilih semua pernyataan yang BENAR tentang \\( |x - 4| < 3 \\). Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "\\( 1 < x < 7 \\)" },
                { id: "B", text: "\\( x = 5 \\) termasuk penyelesaian" },
                { id: "C", text: "\\( x = 8 \\) termasuk penyelesaian" },
                { id: "D", text: "Panjang interval penyelesaian adalah 6" },
                { id: "E", text: "\\( x = 1 \\) termasuk penyelesaian" },
              ],
              correctIds: ["A", "B", "D"],
              explanation:
                "\\( |x - 4| < 3 \\) menjadi \\( -3 < x - 4 < 3 \\), yaitu \\( 1 < x < 7 \\). Jadi \\( x = 5 \\) memenuhi, sedangkan \\( x = 8 \\) dan \\( x = 1 \\) (batas terbuka) tidak memenuhi. Panjang interval \\( 7 - 1 = 6 \\) benar.",
            },
            {
              id: "mw-aljabar-nilai-mutlak-tka4",
              bentuk: "isian",
              level: "L2",
              question:
                "Sebuah suku cadang dinyatakan layak jika \\( |p - 80| \\le 2 \\). Berapa panjang total rentang nilai \\( p \\) yang layak?",
              correctIds: ["4"],
              explanation:
                "\\( |p - 80| \\le 2 \\) berarti \\( 78 \\le p \\le 82 \\), sehingga panjang rentangnya \\( 82 - 78 = 4 \\).",
            },
          ],
        },
        {
          id: "mw-aljabar-spltv",
          title: "Sistem Persamaan Linear Tiga Variabel (SPLTV)",
          estimatedMinutes: 60,
          materi: {
            ringkasan:
              "SPLTV adalah kumpulan tiga persamaan linear dengan tiga variabel yang harus dipenuhi bersamaan. Penyelesaiannya dicari dengan eliminasi dan substitusi hingga tersisa satu variabel, lalu disubstitusi balik ke persamaan awal.",
            rumus: [
              "Bentuk umum: \\( a_{1}x + b_{1}y + c_{1}z = d_{1} \\), \\( a_{2}x + b_{2}y + c_{2}z = d_{2} \\), \\( a_{3}x + b_{3}y + c_{3}z = d_{3} \\)",
              "Eliminasi: samakan koefisien satu variabel, lalu kurangkan kedua persamaan untuk menghilangkannya",
              "Metode Cramer: \\( x = \\dfrac{D_{x}}{D},\\ y = \\dfrac{D_{y}}{D},\\ z = \\dfrac{D_{z}}{D} \\) dengan \\( D \\ne 0 \\)",
              "Jika \\( D = 0 \\) dan semua \\( D_{i} = 0 \\): tak hingga solusi; jika ada \\( D_{i} \\ne 0 \\): tidak ada solusi",
            ],
            contoh: [
              {
                soal:
                  "Selesaikan \\( x + y + z = 6 \\), \\( 2x - y + z = 3 \\), \\( x + 2y - z = 2 \\).",
                pembahasan:
                  "Eliminasi (1)+(3): \\( 2x + 3y = 8 \\). Eliminasi (2)+(3): \\( 3x + y = 5 \\). Dari \\( y = 5 - 3x \\); substitusi ke \\( 2x + 3(5-3x) = 8 \\Rightarrow -7x = -7 \\Rightarrow x = 1 \\), lalu \\( y = 2 \\). Substitusi ke (1): \\( 1 + 2 + z = 6 \\Rightarrow z = 3 \\). Solusi (1, 2, 3).",
              },
            ],
          },
          flashcards: [
            {
              id: "mw-aljabar-spltv-fc1",
              front: "Apa langkah pertama menyelesaikan SPLTV dengan eliminasi?",
              back: "Pilih satu variabel yang paling mudah dihilangkan (koefisiennya 1 atau berlawanan tanda), lalu pasangkan dua persamaan untuk mengeliminasinya.",
            },
            {
              id: "mw-aljabar-spltv-fc2",
              front: "Pada aturan Cramer, apa arti \\( D = 0 \\)?",
              back: "Determinan utama nol berarti sistem tidak punya solusi tunggal — bisa tak hingga solusi atau tidak konsisten.",
            },
            {
              id: "mw-aljabar-spltv-fc3",
              front: "Bagaimana cara memeriksa jawaban SPLTV?",
              back: "Substitusikan nilai \\( x, y, z \\) ke ketiga persamaan awal; semua harus terpenuhi (ruas kiri = ruas kanan).",
            },
            {
              id: "mw-aljabar-spltv-fc4",
              front: "Berapa minimal persamaan untuk solusi tunggal SPLTV?",
              back: "Tiga persamaan independen dengan tiga variabel. Jika hanya dua persamaan, solusinya tak hingga (bergantung parameter).",
            },
          ],
          quiz: [
            {
              id: "mw-aljabar-spltv-q1",
              question:
                "Diketahui \\( x + y = 5 \\), \\( y + z = 7 \\), \\( x + z = 6 \\). Nilai \\( x + y + z \\) adalah ...",
              options: ["8", "9", "10", "12"],
              correctIndex: 1,
              explanation:
                "Jumlahkan ketiga persamaan: \\( 2(x + y + z) = 18 \\), sehingga \\( x + y + z = 9 \\).",
            },
            {
              id: "mw-aljabar-spltv-q2",
              question:
                "Jika \\( x + y + z = 12 \\), \\( x = 2y \\), dan \\( z = 3 \\), maka nilai \\( y \\) adalah ...",
              options: ["2", "3", "4", "5"],
              correctIndex: 1,
              explanation:
                "Substitusi: \\( 2y + y + 3 = 12 \\Rightarrow 3y = 9 \\Rightarrow y = 3 \\).",
            },
            {
              id: "mw-aljabar-spltv-q3",
              question: "Sistem linear tiga variabel TIDAK memiliki solusi jika ...",
              options: [
                "\\( D \\ne 0 \\)",
                "\\( D = 0 \\) dan semua \\( D_{i} = 0 \\)",
                "\\( D = 0 \\) tetapi ada \\( D_{i} \\ne 0 \\)",
                "\\( D_{x} = D_{y} = D_{z} \\ne 0 \\)",
              ],
              correctIndex: 2,
              explanation:
                "Determinan utama nol sementara determinan variabel tidak nol menandakan persamaan saling bertentangan, sehingga sistem tidak konsisten.",
            },
            {
              id: "mw-aljabar-spltv-q4",
              question:
                "Diketahui sistem \\( x + y + z = 6 \\), \\( 2x - y + z = 3 \\), \\( x + 2y - z = 2 \\). Nilai \\( z \\) adalah ...",
              options: ["1", "2", "3", "4"],
              correctIndex: 2,
              explanation:
                "Diperoleh \\( x = 1 \\) dan \\( y = 2 \\); substitusi ke persamaan pertama memberi \\( z = 3 \\).",
            },
          ],
          latihanSoal: [
            {
              id: "mw-aljabar-spltv-l1",
              level: "hots",
              question:
                "Sebuah toko menjual tiga paket buah. Paket A (2 apel, 1 jeruk, 1 mangga) Rp28.000. Paket B (1 apel, 2 jeruk, 1 mangga) Rp26.000. Paket C (1 apel, 1 jeruk, 2 mangga) Rp32.000. Tentukan harga satuan tiap buah, lalu hitung harga 3 apel + 2 jeruk + 1 mangga.",
              langkah: [
                "Misalkan harga apel = \\( a \\), jeruk = \\( j \\), mangga = \\( m \\) (dalam ribu rupiah).",
                "Susun SPLTV: \\( 2a + j + m = 28 \\); \\( a + 2j + m = 26 \\); \\( a + j + 2m = 32 \\).",
                "Eliminasi (2) - (1): \\( -a + j = -2 \\Rightarrow j = a - 2 \\).",
                "Eliminasi (3) - (2): \\( -j + m = 6 \\Rightarrow m = j + 6 = a + 4 \\).",
                "Substitusi ke (1): \\( 2a + (a - 2) + (a + 4) = 28 \\Rightarrow 4a + 2 = 28 \\Rightarrow a = 6{,}5 \\).",
                "Diperoleh \\( a = 6{,}5 \\), \\( j = 4{,}5 \\), \\( m = 10{,}5 \\) ribu rupiah.",
                "Hitung pesanan baru: \\( 3(6{,}5) + 2(4{,}5) + 1(10{,}5) = 19{,}5 + 9 + 10{,}5 = 39 \\) ribu rupiah.",
                "Periksa dengan Paket B: \\( 6{,}5 + 9 + 10{,}5 = 26 \\). Sesuai.",
              ],
              jawaban:
                "Apel Rp6.500, jeruk Rp4.500, mangga Rp10.500. Harga 3 apel + 2 jeruk + 1 mangga = Rp39.000.",
            },
            {
              id: "mw-aljabar-spltv-l2",
              level: "sulit",
              question:
                "Tentukan nilai \\( k \\) agar sistem \\( x + y + z = 4 \\), \\( 2x - y + z = 3 \\), \\( kx + y + 2z = 7 \\) memiliki solusi tunggal, kemudian tentukan solusinya ketika \\( k = 1 \\).",
              langkah: [
                "Hitung determinan koefisien \\( D = \\det \\begin{pmatrix} 1 & 1 & 1 \\\\ 2 & -1 & 1 \\\\ k & 1 & 2 \\end{pmatrix} \\).",
                "Ekspansi baris pertama: \\( D = 1[(-1)(2) - (1)(1)] - 1[(2)(2) - (1)(k)] + 1[(2)(1) - (-1)(k)] \\).",
                "Hitung tiap minor: \\( -3 - (4 - k) + (2 + k) = 2k - 5 \\).",
                "Solusi tunggal saat \\( D \\ne 0 \\), yaitu \\( 2k - 5 \\ne 0 \\Rightarrow k \\ne \\tfrac{5}{2} \\).",
                "Untuk \\( k = 1 \\): persamaan ketiga menjadi \\( x + y + 2z = 7 \\). Eliminasi (1) dari (2): \\( x - 2y = -1 \\).",
                "Eliminasi (1) dari (3): \\( z = 3 \\). Substitusi ke (1): \\( x + y = 1 \\).",
                "Gabung \\( x + y = 1 \\) dan \\( x - 2y = -1 \\): \\( 3y = 2 \\Rightarrow y = \\tfrac{2}{3} \\), lalu \\( x = \\tfrac{1}{3} \\).",
              ],
              jawaban:
                "Solusi tunggal untuk \\( k \\ne \\tfrac{5}{2} \\). Saat \\( k = 1 \\): \\( x = \\tfrac{1}{3} \\), \\( y = \\tfrac{2}{3} \\), \\( z = 3 \\).",
            },
          ],
          tkaSoal: [
            {
              id: "mw-aljabar-spltv-tka1",
              bentuk: "pg",
              level: "L1",
              question:
                "Diketahui \\( x + y = 5 \\), \\( y + z = 7 \\), dan \\( x + z = 6 \\). Nilai \\( x + y + z \\) adalah ...",
              options: [
                { id: "A", text: "\\( 8 \\)" },
                { id: "B", text: "\\( 9 \\)" },
                { id: "C", text: "\\( 10 \\)" },
                { id: "D", text: "\\( 12 \\)" },
                { id: "E", text: "\\( 18 \\)" },
              ],
              correctIds: ["B"],
              explanation:
                "Jumlahkan ketiga persamaan: \\( 2(x + y + z) = 5 + 7 + 6 = 18 \\), sehingga \\( x + y + z = 9 \\).",
            },
            {
              id: "mw-aljabar-spltv-tka2",
              bentuk: "pg",
              level: "L2",
              question:
                "Jika \\( x + y + z = 12 \\), \\( x = 2y \\), dan \\( z = 3 \\), maka nilai \\( y \\) adalah ...",
              options: [
                { id: "A", text: "\\( 2 \\)" },
                { id: "B", text: "\\( 3 \\)" },
                { id: "C", text: "\\( 4 \\)" },
                { id: "D", text: "\\( 5 \\)" },
                { id: "E", text: "\\( 6 \\)" },
              ],
              correctIds: ["B"],
              explanation:
                "Substitusi \\( x = 2y \\) dan \\( z = 3 \\): \\( 2y + y + 3 = 12 \\Rightarrow 3y = 9 \\Rightarrow y = 3 \\). Maka \\( x = 6 \\).",
            },
            {
              id: "mw-aljabar-spltv-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              question:
                "Sebuah toko menjual tiga paket. Paket A berisi 2 buku dan 1 pulpen seharga Rp23.000. Paket B berisi 1 buku dan 3 pulpen seharga Rp29.000. Pilih semua pernyataan yang BENAR. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "Harga satu buku adalah Rp8.000" },
                { id: "B", text: "Harga satu pulpen adalah Rp7.000" },
                { id: "C", text: "Harga satu buku lebih murah daripada satu pulpen" },
                { id: "D", text: "Paket 3 buku dan 4 pulpen berharga Rp52.000" },
                { id: "E", text: "Paket 5 buku dan 5 pulpen berharga Rp70.000" },
              ],
              correctIds: ["A", "B", "D"],
              explanation:
                "Misal buku \\( b \\) dan pulpen \\( p \\): \\( 2b + p = 23.000 \\) dan \\( b + 3p = 29.000 \\). Dari persamaan kedua \\( b = 29.000 - 3p \\), substitusi: \\( 58.000 - 6p + p = 23.000 \\Rightarrow 5p = 35.000 \\Rightarrow p = 7.000 \\) dan \\( b = 8.000 \\). Buku lebih mahal dari pulpen (C salah). \\( 3(8.000) + 4(7.000) = 52.000 \\) benar, sedangkan \\( 5(8.000) + 5(7.000) = 75.000 \\), bukan 70.000.",
            },
            {
              id: "mw-aljabar-spltv-tka4",
              bentuk: "isian",
              level: "L2",
              question:
                "Diketahui sistem \\( x + y + z = 6 \\), \\( x - y + z = 2 \\), dan \\( x + y - z = 0 \\). Berapa nilai \\( z \\)?",
              correctIds: ["3"],
              explanation:
                "Kurangkan persamaan pertama dengan ketiga: \\( (x + y + z) - (x + y - z) = 2z = 6 \\), sehingga \\( z = 3 \\). Periksa: dengan \\( y = 2 \\) dari pengurangan persamaan pertama dan kedua, substitusi memberi \\( x = 1 \\), dan persamaan kedua \\( 1 - 2 + 3 = 2 \\) serta persamaan ketiga \\( 1 + 2 - 3 = 0 \\) keduanya benar.",
            },
          ],
        },
        {
          id: "mw-aljabar-fungsi-kuadrat-rasional",
          title: "Fungsi Kuadrat & Rasional",
          estimatedMinutes: 60,
          materi: {
            ringkasan:
              "Fungsi kuadrat menghasilkan grafik parabola dengan titik puncak dan sumbu simetri yang dapat dihitung dari koefisiennya. Fungsi rasional berbentuk pembagian dua polinomial dan memiliki batasan domain karena penyebut tidak boleh nol, serta dapat memiliki asimtot.",
            rumus: [
              "\\( f(x) = ax^{2} + bx + c \\) dengan titik puncak \\( \\left(-\\dfrac{b}{2a},\\ -\\dfrac{b^{2} - 4ac}{4a}\\right) \\)",
              "Sumbu simetri \\( x = -\\dfrac{b}{2a} \\); diskriminan \\( D = b^{2} - 4ac \\)",
              "\\( D > 0 \\): dua titik potong sumbu-x; \\( D = 0 \\): menyinggung; \\( D < 0 \\): tidak memotong sumbu-x",
              "Bentuk puncak: \\( f(x) = a(x - h)^{2} + k \\) dengan puncak \\( (h, k) \\)",
              "Fungsi rasional \\( f(x) = \\dfrac{p(x)}{q(x)} \\) memiliki domain \\( q(x) \\ne 0 \\)",
            ],
            contoh: [
              {
                soal: "Tentukan puncak dan sumbu simetri dari \\( f(x) = x^{2} - 6x + 5 \\).",
                pembahasan:
                  "\\( a = 1, b = -6, c = 5 \\). Sumbu simetri \\( x = -\\dfrac{-6}{2(1)} = 3 \\). Nilai puncak \\( f(3) = 9 - 18 + 5 = -4 \\). Puncak \\( (3, -4) \\).",
              },
              {
                soal: "Tentukan domain dari \\( f(x) = \\dfrac{2x + 1}{x^{2} - 9} \\).",
                pembahasan:
                  "Penyebut tidak boleh nol: \\( x^{2} - 9 \\ne 0 \\Rightarrow x \\ne 3 \\) dan \\( x \\ne -3 \\). Domain \\( = \\{x \\in \\mathbb{R} \\mid x \\ne \\pm 3\\} \\).",
              },
            ],
          },
          flashcards: [
            {
              id: "mw-aljabar-fungsi-kuadrat-rasional-fc1",
              front: "Rumus sumbu simetri parabola \\( f(x) = ax^{2} + bx + c \\) ?",
              back: "\\( x = -\\dfrac{b}{2a} \\)",
            },
            {
              id: "mw-aljabar-fungsi-kuadrat-rasional-fc2",
              front: "Bagaimana menentukan arah bukaan parabola?",
              back: "Jika \\( a > 0 \\) terbuka ke atas (punya nilai minimum); jika \\( a < 0 \\) terbuka ke bawah (punya nilai maksimum).",
            },
            {
              id: "mw-aljabar-fungsi-kuadrat-rasional-fc3",
              front: "Apa syarat domain fungsi rasional?",
              back: "Penyebut \\( \\ne 0 \\). Cari nilai yang membuat penyebut nol, lalu keluarkan dari domain.",
            },
            {
              id: "mw-aljabar-fungsi-kuadrat-rasional-fc4",
              front: "Berapa nilai ekstrem (ordinat puncak) fungsi kuadrat?",
              back: "\\( y_{p} = -\\dfrac{D}{4a} = -\\dfrac{b^{2} - 4ac}{4a} \\)",
            },
            {
              id: "mw-aljabar-fungsi-kuadrat-rasional-fc5",
              front: "Kapan fungsi kuadrat selalu bernilai positif?",
              back: "Ketika \\( a > 0 \\) dan \\( D < 0 \\), parabola terbuka ke atas dan tidak menyentuh sumbu-x.",
            },
          ],
          quiz: [
            {
              id: "mw-aljabar-fungsi-kuadrat-rasional-q1",
              question: "Titik puncak dari \\( f(x) = 2x^{2} - 8x + 3 \\) adalah ...",
              options: ["(2, -5)", "(2, 5)", "(-2, -5)", "(4, 3)"],
              correctIndex: 0,
              explanation:
                "\\( x_{p} = -\\dfrac{-8}{2(2)} = 2 \\); \\( y_{p} = f(2) = 8 - 16 + 3 = -5 \\). Puncak \\( (2, -5) \\).",
            },
            {
              id: "mw-aljabar-fungsi-kuadrat-rasional-q2",
              question: "Domain fungsi \\( f(x) = \\dfrac{x + 4}{x^{2} - 5x + 6} \\) adalah ...",
              options: [
                "\\( x \\ne 2 \\) dan \\( x \\ne 3 \\)",
                "\\( x \\ne -2 \\) dan \\( x \\ne -3 \\)",
                "\\( x \\ne 4 \\)",
                "semua bilangan real",
              ],
              correctIndex: 0,
              explanation:
                "\\( x^{2} - 5x + 6 = (x - 2)(x - 3) = 0 \\Rightarrow x = 2 \\) atau \\( x = 3 \\), keduanya dikeluarkan dari domain.",
            },
            {
              id: "mw-aljabar-fungsi-kuadrat-rasional-q3",
              question: "Fungsi \\( f(x) = x^{2} - 4x + 7 \\) memiliki nilai minimum ...",
              options: ["1", "3", "5", "7"],
              correctIndex: 1,
              explanation:
                "Puncak di \\( x = 2 \\), nilai \\( f(2) = 4 - 8 + 7 = 3 \\). Karena \\( a > 0 \\), nilai 3 adalah minimum.",
            },
            {
              id: "mw-aljabar-fungsi-kuadrat-rasional-q4",
              question: "Parabola \\( y = -x^{2} + 2x + 3 \\) memotong sumbu-x di titik ...",
              options: [
                "(-1, 0) dan (3, 0)",
                "(1, 0) dan (3, 0)",
                "(-3, 0) dan (1, 0)",
                "(0, 3) saja",
              ],
              correctIndex: 0,
              explanation:
                "\\( -x^{2} + 2x + 3 = 0 \\Rightarrow x^{2} - 2x - 3 = 0 \\Rightarrow (x - 3)(x + 1) = 0 \\Rightarrow x = 3 \\) atau \\( x = -1 \\).",
            },
          ],
          latihanSoal: [
            {
              id: "mw-aljabar-fungsi-kuadrat-rasional-l1",
              level: "hots",
              question:
                "Sebuah perusahaan menetapkan harga jual barang \\( p \\) ribu rupiah per unit. Dari riset pasar, banyak penjualan per bulan mengikuti \\( q(p) = 120 - 4p \\) unit. Tentukan harga \\( p \\) yang memaksimumkan pendapatan \\( R(p) = p \\cdot q(p) \\), lalu hitung pendapatan maksimum tersebut.",
              langkah: [
                "Bentuk fungsi pendapatan: \\( R(p) = p(120 - 4p) = -4p^{2} + 120p \\).",
                "Kenali sebagai fungsi kuadrat dengan \\( a = -4 < 0 \\), sehingga memiliki maksimum di titik puncak.",
                "Hitung absis puncak: \\( p = -\\dfrac{b}{2a} = -\\dfrac{120}{2(-4)} = 15 \\).",
                "Hitung nilai maksimum: \\( R(15) = -4(225) + 120(15) = -900 + 1800 = 900 \\).",
                "Periksa kewajaran: pada \\( p = 15 \\), penjualan \\( q = 120 - 60 = 60 \\) unit, pendapatan \\( 15 \\times 60 = 900 \\) ribu rupiah.",
                "Bandingkan dengan \\( p = 14 \\): \\( R = 14 \\times 64 = 896 < 900 \\). Terbukti 15 optimal.",
              ],
              jawaban:
                "Harga optimal \\( p = 15 \\) ribu rupiah (Rp15.000) dengan pendapatan maksimum Rp900.000.",
            },
            {
              id: "mw-aljabar-fungsi-kuadrat-rasional-l2",
              level: "sulit",
              question:
                "Diberikan fungsi rasional \\( f(x) = \\dfrac{x^{2} - 1}{x - 1} \\). (a) Tentukan domainnya. (b) Sederhanakan bentuknya. (c) Jelaskan mengapa grafiknya berupa garis lurus yang 'berlubang' di satu titik.",
              langkah: [
                "Domain: penyebut \\( x - 1 \\ne 0 \\Rightarrow x \\ne 1 \\), jadi domain \\( \\{x \\in \\mathbb{R} \\mid x \\ne 1\\} \\).",
                "Faktorkan pembilang: \\( x^{2} - 1 = (x - 1)(x + 1) \\).",
                "Sederhanakan: \\( f(x) = \\dfrac{(x - 1)(x + 1)}{x - 1} = x + 1 \\) untuk \\( x \\ne 1 \\).",
                "Bentuk sederhana \\( y = x + 1 \\) adalah garis lurus bergradien 1.",
                "Titik \\( x = 1 \\) tetap harus dikeluarkan dari domain, sehingga pada \\( x = 1 \\) grafik tidak terdefinisi.",
                "Jika disubstitusi langsung ke bentuk asli, diperoleh \\( \\dfrac{0}{0} \\) (bentuk tak tentu) — inilah 'lubang' pada grafik.",
                "Garis \\( y = x + 1 \\) dengan lubang di \\( (1, 2) \\) itulah grafik fungsinya.",
              ],
              jawaban:
                "(a) \\( x \\ne 1 \\) (b) \\( f(x) = x + 1,\\ x \\ne 1 \\) (c) Bentuk aslinya tak terdefinisi di \\( x = 1 \\) sehingga muncul lubang di \\( (1, 2) \\), walau sisanya lurus.",
            },
          ],
          tkaSoal: [
            {
              id: "mw-aljabar-fungsi-kuadrat-rasional-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Sumbu simetri grafik \\( f(x) = x^{2} - 6x + 5 \\) adalah ...",
              options: [
                { id: "A", text: "\\( x = -3 \\)" },
                { id: "B", text: "\\( x = 3 \\)" },
                { id: "C", text: "\\( x = 6 \\)" },
                { id: "D", text: "\\( x = 1 \\)" },
                { id: "E", text: "\\( x = 5 \\)" },
              ],
              correctIds: ["B"],
              explanation:
                "Sumbu simetri \\( x = -\\dfrac{b}{2a} = -\\dfrac{-6}{2(1)} = 3 \\). Titik puncaknya \\( (3, -4) \\).",
            },
            {
              id: "mw-aljabar-fungsi-kuadrat-rasional-tka2",
              bentuk: "pg",
              level: "L2",
              question:
                "Domain fungsi rasional \\( f(x) = \\dfrac{x + 4}{x^{2} - 9} \\) adalah ...",
              options: [
                { id: "A", text: "\\( x \\ne -4 \\)" },
                { id: "B", text: "\\( x \\ne 3 \\)" },
                { id: "C", text: "\\( x \\ne 3 \\) dan \\( x \\ne -3 \\)" },
                { id: "D", text: "\\( x \\ne 9 \\)" },
                { id: "E", text: "Semua bilangan real" },
              ],
              correctIds: ["C"],
              explanation:
                "Penyebut tidak boleh nol: \\( x^{2} - 9 \\ne 0 \\Rightarrow (x - 3)(x + 3) \\ne 0 \\Rightarrow x \\ne 3 \\) dan \\( x \\ne -3 \\). Pembilang boleh nol, jadi \\( x = -4 \\) tetap termasuk domain.",
            },
            {
              id: "mw-aljabar-fungsi-kuadrat-rasional-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              question:
                "Diberikan \\( f(x) = x^{2} - 4x + 3 \\). Pilih semua pernyataan yang BENAR. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "Diskriminannya bernilai \\( 4 \\)" },
                { id: "B", text: "Grafiknya memotong sumbu-x di \\( x = 1 \\) dan \\( x = 3 \\)" },
                { id: "C", text: "Titik puncaknya berada di \\( (2, -1) \\)" },
                { id: "D", text: "Grafiknya terbuka ke bawah" },
                { id: "E", text: "Grafiknya tidak memotong sumbu-x" },
              ],
              correctIds: ["A", "B", "C"],
              explanation:
                "\\( D = b^{2} - 4ac = 16 - 12 = 4 > 0 \\) (A benar), akar-akarnya \\( x = 1 \\) dan \\( x = 3 \\) (B benar), dan puncak \\( x = -\\dfrac{-4}{2} = 2 \\) dengan \\( f(2) = 4 - 8 + 3 = -1 \\) (C benar). Karena \\( a = 1 > 0 \\) parabola terbuka ke atas (D salah), dan karena \\( D > 0 \\) justru memotong sumbu-x di dua titik (E salah).",
            },
            {
              id: "mw-aljabar-fungsi-kuadrat-rasional-tka4",
              bentuk: "isian",
              level: "L2",
              question:
                "Fungsi \\( f(x) = \\dfrac{x^{2} - 1}{x - 1} \\) dapat disederhanakan menjadi \\( f(x) = x + 1 \\) untuk \\( x \\ne 1 \\). Berapa nilai ordinat lubang grafik tersebut?",
              correctIds: ["2"],
              explanation:
                "Lubang berada di \\( x = 1 \\). Substitusi ke bentuk sederhana: \\( f(1) = 1 + 1 = 2 \\), sehingga lubangnya di titik \\( (1, 2) \\) dengan ordinat 2.",
            },
          ],
        },
      ],
    },
    {
      id: "mw-geometri-trigonometri",
      title: "Geometri & Trigonometri",
      order: 2,
      subtopics: [
        {
          id: "mw-geometri-trigonometri-perbandingan-siku",
          title: "Perbandingan Trigonometri Segitiga Siku-Siku",
          estimatedMinutes: 70,
          materi: {
            ringkasan:
              "Pada segitiga siku-siku, perbandingan panjang sisi terhadap sudut lancip didefinisikan sebagai sinus, kosinus, dan tangen. Nilai-nilai ini memungkinkan penghitungan sisi atau sudut yang belum diketahui, termasuk penerapan pada sudut elevasi dan depresi.",
            rumus: [
              "\\( \\sin \\theta = \\dfrac{\\text{sisi depan}}{\\text{sisi miring}} \\), \\( \\cos \\theta = \\dfrac{\\text{sisi samping}}{\\text{sisi miring}} \\), \\( \\tan \\theta = \\dfrac{\\text{sisi depan}}{\\text{sisi samping}} \\)",
              "Identitas dasar: \\( \\sin^{2}\\theta + \\cos^{2}\\theta = 1 \\) dan \\( \\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta} \\)",
              "Sudut istimewa: \\( \\sin 30^{\\circ} = \\tfrac{1}{2} \\), \\( \\sin 45^{\\circ} = \\tfrac{\\sqrt{2}}{2} \\), \\( \\sin 60^{\\circ} = \\tfrac{\\sqrt{3}}{2} \\)",
              "\\( \\sec\\theta = \\dfrac{1}{\\cos\\theta} \\), \\( \\csc\\theta = \\dfrac{1}{\\sin\\theta} \\), \\( \\cot\\theta = \\dfrac{1}{\\tan\\theta} \\)",
              "Sudut berelasi: \\( \\sin(90^{\\circ} - \\theta) = \\cos\\theta \\) dan \\( \\cos(90^{\\circ} - \\theta) = \\sin\\theta \\)",
            ],
            contoh: [
              {
                soal:
                  "Segitiga siku-siku memiliki sisi depan 3 dan sisi samping 4. Tentukan \\( \\sin\\theta \\), \\( \\cos\\theta \\), dan \\( \\tan\\theta \\).",
                pembahasan:
                  "Sisi miring \\( = \\sqrt{3^{2} + 4^{2}} = 5 \\). Maka \\( \\sin\\theta = \\tfrac{3}{5} \\), \\( \\cos\\theta = \\tfrac{4}{5} \\), dan \\( \\tan\\theta = \\tfrac{3}{4} \\).",
              },
              {
                soal:
                  "Hitung \\( \\sin 30^{\\circ} \\cdot \\cos 60^{\\circ} + \\cos 30^{\\circ} \\cdot \\sin 60^{\\circ} \\).",
                pembahasan:
                  "\\( = \\tfrac{1}{2} \\cdot \\tfrac{1}{2} + \\tfrac{\\sqrt{3}}{2} \\cdot \\tfrac{\\sqrt{3}}{2} = \\tfrac{1}{4} + \\tfrac{3}{4} = 1 \\) (bentuk \\( \\sin(30^{\\circ} + 60^{\\circ}) = \\sin 90^{\\circ} = 1 \\)).",
              },
            ],
          },
          flashcards: [
            {
              id: "mw-geometri-trigonometri-perbandingan-siku-fc1",
              front: "Jembatan keledai sin, cos, tan?",
              back: "Sindemi (depan/miring), Kosami (samping/miring), Tandesa (depan/samping).",
            },
            {
              id: "mw-geometri-trigonometri-perbandingan-siku-fc2",
              front: "Nilai \\( \\tan 45^{\\circ} \\) ?",
              back: "1, karena sisi depan dan sisi samping sama panjang pada segitiga siku-siku sama kaki.",
            },
            {
              id: "mw-geometri-trigonometri-perbandingan-siku-fc3",
              front: "Identitas Pythagoras trigonometri?",
              back: "\\( \\sin^{2}\\theta + \\cos^{2}\\theta = 1 \\); turunannya \\( 1 + \\tan^{2}\\theta = \\sec^{2}\\theta \\).",
            },
            {
              id: "mw-geometri-trigonometri-perbandingan-siku-fc4",
              front: "Apa itu sudut elevasi dan depresi?",
              back: "Sudut elevasi diukur ke atas dari garis horizontal pengamat; sudut depresi diukur ke bawah dari garis horizontal.",
            },
          ],
          quiz: [
            {
              id: "mw-geometri-trigonometri-perbandingan-siku-q1",
              question:
                "Diketahui \\( \\sin\\theta = \\tfrac{5}{13} \\) dan \\( \\theta \\) lancip. Nilai \\( \\cos\\theta \\) adalah ...",
              options: ["\\( \\tfrac{5}{12} \\)", "\\( \\tfrac{12}{13} \\)", "\\( \\tfrac{13}{12} \\)", "\\( \\tfrac{8}{13} \\)"],
              correctIndex: 1,
              explanation:
                "\\( \\cos\\theta = \\sqrt{1 - \\sin^{2}\\theta} = \\sqrt{1 - \\tfrac{25}{169}} = \\sqrt{\\tfrac{144}{169}} = \\tfrac{12}{13} \\).",
            },
            {
              id: "mw-geometri-trigonometri-perbandingan-siku-q2",
              question: "Nilai dari \\( 2\\sin 30^{\\circ} + \\cos 0^{\\circ} \\) adalah ...",
              options: ["1", "2", "3", "4"],
              correctIndex: 1,
              explanation: "\\( 2 \\cdot \\tfrac{1}{2} + 1 = 1 + 1 = 2 \\).",
            },
            {
              id: "mw-geometri-trigonometri-perbandingan-siku-q3",
              question:
                "Sebuah tangga panjang 5 m bersandar pada dinding dan membentuk sudut \\( 60^{\\circ} \\) dengan tanah. Tinggi ujung tangga dari tanah adalah ...",
              options: [
                "\\( \\tfrac{5\\sqrt{3}}{2} \\) m",
                "\\( \\tfrac{5}{2} \\) m",
                "\\( 5\\sqrt{3} \\) m",
                "\\( \\tfrac{5\\sqrt{2}}{2} \\) m",
              ],
              correctIndex: 0,
              explanation:
                "Tinggi \\( = 5 \\sin 60^{\\circ} = 5 \\cdot \\tfrac{\\sqrt{3}}{2} = \\tfrac{5\\sqrt{3}}{2} \\) m.",
            },
            {
              id: "mw-geometri-trigonometri-perbandingan-siku-q4",
              question:
                "Jika \\( \\tan\\theta = \\tfrac{3}{4} \\), nilai \\( \\sin\\theta \\cdot \\cos\\theta \\) adalah ...",
              options: ["\\( \\tfrac{12}{25} \\)", "\\( \\tfrac{3}{7} \\)", "\\( \\tfrac{7}{25} \\)", "\\( \\tfrac{4}{5} \\)"],
              correctIndex: 0,
              explanation:
                "Sisi miring \\( = 5 \\), sehingga \\( \\sin\\theta = \\tfrac{3}{5} \\) dan \\( \\cos\\theta = \\tfrac{4}{5} \\). Hasil kali \\( = \\tfrac{12}{25} \\).",
            },
          ],
          latihanSoal: [
            {
              id: "mw-geometri-trigonometri-perbandingan-siku-l1",
              level: "hots",
              question:
                "Seorang pengamat berdiri 40 m dari kaki sebuah gedung dan melihat puncak gedung dengan sudut elevasi \\( 30^{\\circ} \\). Di atas gedung terdapat antena; ujung atas antena terlihat dengan sudut elevasi \\( 45^{\\circ} \\). Tentukan tinggi antena tersebut.",
              langkah: [
                "Misalkan tinggi gedung = \\( g \\) dan tinggi total gedung + antena = \\( T \\), diukur dari garis horizontal mata pengamat.",
                "Untuk puncak gedung: \\( \\tan 30^{\\circ} = \\dfrac{g}{40} \\Rightarrow g = 40 \\cdot \\tfrac{\\sqrt{3}}{3} \\approx 23{,}09 \\) m.",
                "Untuk ujung antena: \\( \\tan 45^{\\circ} = \\dfrac{T}{40} \\Rightarrow T = 40 \\cdot 1 = 40 \\) m.",
                "Tinggi antena adalah selisihnya: \\( T - g = 40 - 23{,}09 = 16{,}91 \\) m.",
                "Periksa kewajaran: sudut naik dari \\( 30^{\\circ} \\) ke \\( 45^{\\circ} \\) pada jarak tetap berarti kenaikan tinggi cukup besar; hasil \\( \\approx 16{,}9 \\) m masuk akal.",
                "Bentuk eksak: \\( 40 - \\dfrac{40\\sqrt{3}}{3} = \\dfrac{40(3 - \\sqrt{3})}{3} \\) m.",
              ],
              jawaban:
                "Tinggi antena \\( = 40 - \\dfrac{40\\sqrt{3}}{3} = \\dfrac{40(3-\\sqrt{3})}{3} \\approx 16{,}9 \\) meter.",
            },
            {
              id: "mw-geometri-trigonometri-perbandingan-siku-l2",
              level: "sulit",
              question:
                "Diketahui \\( \\sin\\alpha = \\tfrac{3}{5} \\) dengan \\( \\alpha \\) di kuadran I. Tanpa menghitung besar sudut, tentukan nilai \\( \\dfrac{\\sin\\alpha + \\cos\\alpha}{\\tan\\alpha} \\).",
              langkah: [
                "Cari \\( \\cos\\alpha \\) dari identitas: \\( \\cos\\alpha = \\sqrt{1 - \\left(\\tfrac{3}{5}\\right)^{2}} = \\sqrt{1 - \\tfrac{9}{25}} = \\tfrac{4}{5} \\) (positif karena kuadran I).",
                "Hitung \\( \\tan\\alpha = \\dfrac{\\sin\\alpha}{\\cos\\alpha} = \\dfrac{3/5}{4/5} = \\tfrac{3}{4} \\).",
                "Substitusi ke pembilang: \\( \\sin\\alpha + \\cos\\alpha = \\tfrac{3}{5} + \\tfrac{4}{5} = \\tfrac{7}{5} \\).",
                "Bagi dengan \\( \\tan\\alpha \\): \\( \\dfrac{7/5}{3/4} = \\dfrac{7}{5} \\cdot \\dfrac{4}{3} = \\dfrac{28}{15} \\).",
                "Periksa dengan bentuk alternatif: \\( \\dfrac{\\cos\\alpha(\\sin\\alpha + \\cos\\alpha)}{\\sin\\alpha} = \\dfrac{(4/5)(7/5)}{3/5} = \\dfrac{28}{15} \\). Cocok.",
              ],
              jawaban: "\\( \\dfrac{28}{15} \\)",
            },
          ],
          tkaSoal: [
            {
              id: "mw-geometri-trigonometri-perbandingan-siku-tka1",
              bentuk: "pg",
              level: "L1",
              question:
                "Pada segitiga siku-siku, perbandingan sisi di hadapan sudut terhadap sisi miring disebut ...",
              options: [
                { id: "A", text: "cosinus" },
                { id: "B", text: "sinus" },
                { id: "C", text: "tangen" },
                { id: "D", text: "sekan" },
                { id: "E", text: "kotangen" },
              ],
              correctIds: ["B"],
              explanation:
                "Sinus adalah perbandingan sisi di hadapan sudut dengan sisi miring. Kosinus memakai sisi samping, sedangkan tangen membandingkan sisi hadapan dengan sisi samping.",
            },
            {
              id: "mw-geometri-trigonometri-perbandingan-siku-tka2",
              bentuk: "pg",
              level: "L2",
              question:
                "Sebuah tangga panjangnya 6 meter disandarkan pada dinding tegak dan membentuk sudut \\( 60^{\\circ} \\) dengan lantai. Tinggi dinding yang disentuh ujung atas tangga adalah ...",
              options: [
                { id: "A", text: "\\( 3 \\) meter" },
                { id: "B", text: "\\( 3\\sqrt{2} \\) meter" },
                { id: "C", text: "\\( 3\\sqrt{3} \\) meter" },
                { id: "D", text: "\\( 4\\sqrt{2} \\) meter" },
                { id: "E", text: "\\( 5 \\) meter" },
              ],
              correctIds: ["C"],
              explanation:
                "Tinggi dinding berada di hadapan sudut \\( 60^{\\circ} \\) terhadap lantai, sehingga \\( \\sin 60^{\\circ} = \\dfrac{t}{6} \\Rightarrow t = 6 \\cdot \\dfrac{\\sqrt{3}}{2} = 3\\sqrt{3} \\) meter.",
            },
            {
              id: "mw-geometri-trigonometri-perbandingan-siku-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              question:
                "Diketahui \\( \\sin\\alpha = \\dfrac{3}{5} \\) dengan \\( \\alpha \\) di kuadran I. Pilih semua pernyataan yang BENAR. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "\\( \\cos\\alpha = \\dfrac{4}{5} \\)" },
                { id: "B", text: "\\( \\tan\\alpha = \\dfrac{3}{4} \\)" },
                { id: "C", text: "\\( \\sin^{2}\\alpha + \\cos^{2}\\alpha = 1 \\)" },
                { id: "D", text: "\\( \\cos\\alpha = -\\dfrac{4}{5} \\)" },
                { id: "E", text: "\\( \\tan\\alpha = \\dfrac{5}{3} \\)" },
              ],
              correctIds: ["A", "B", "C"],
              explanation:
                "Di kuadran I semua perbandingan positif. \\( \\cos\\alpha = \\sqrt{1 - \\left(\\tfrac{3}{5}\\right)^{2}} = \\tfrac{4}{5} \\) (A benar, D salah karena tanda negatif hanya berlaku di kuadran II). \\( \\tan\\alpha = \\dfrac{3/5}{4/5} = \\dfrac{3}{4} \\) (B benar, E salah). Identitas Pythagoras (C) selalu benar.",
            },
            {
              id: "mw-geometri-trigonometri-perbandingan-siku-tka4",
              bentuk: "isian",
              level: "L2",
              question:
                "Segitiga siku-siku memiliki sisi tegak 8 cm dan sisi miring 17 cm. Berapa panjang sisi tegak lainnya (cm)?",
              correctIds: ["15"],
              explanation:
                "Gunakan Pythagoras: \\( \\sqrt{17^{2} - 8^{2}} = \\sqrt{289 - 64} = \\sqrt{225} = 15 \\) cm.",
            },
          ],
        },
        {
          id: "mw-geometri-trigonometri-aturan-sinus-kosinus",
          title: "Aturan Sinus & Kosinus",
          estimatedMinutes: 70,
          materi: {
            ringkasan:
              "Aturan sinus dan kosinus menghubungkan panjang sisi dengan besar sudut pada segitiga sembarang, bukan hanya segitiga siku-siku. Aturan sinus dipakai bila diketahui pasangan sisi-sudut, sedangkan aturan kosinus dipakai bila diketahui dua sisi dan sudut apitnya atau ketiga sisinya.",
            rumus: [
              "Aturan sinus: \\( \\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B} = \\dfrac{c}{\\sin C} = 2R \\) dengan \\( R \\) jari-jari lingkaran luar",
              "Aturan kosinus: \\( a^{2} = b^{2} + c^{2} - 2bc\\cos A \\)",
              "Variasi aturan kosinus: \\( \\cos A = \\dfrac{b^{2} + c^{2} - a^{2}}{2bc} \\)",
              "Luas segitiga: \\( L = \\tfrac{1}{2}ab\\sin C \\) dan \\( L = \\sqrt{s(s-a)(s-b)(s-c)} \\) dengan \\( s = \\tfrac{a+b+c}{2} \\)",
              "Jumlah sudut: \\( A + B + C = 180^{\\circ} \\)",
            ],
            contoh: [
              {
                soal:
                  "Pada segitiga ABC diketahui \\( a = 8 \\), \\( B = 30^{\\circ} \\), dan \\( C = 45^{\\circ} \\). Tentukan panjang sisi \\( b \\).",
                pembahasan:
                  "\\( A = 180^{\\circ} - 30^{\\circ} - 45^{\\circ} = 105^{\\circ} \\). Dengan aturan sinus \\( b = \\dfrac{a\\sin B}{\\sin A} = \\dfrac{8 \\cdot \\tfrac{1}{2}}{\\sin 105^{\\circ}} \\approx 4{,}14 \\).",
              },
              {
                soal:
                  "Hitung panjang sisi \\( a \\) jika \\( b = 5 \\), \\( c = 7 \\), dan \\( A = 60^{\\circ} \\).",
                pembahasan:
                  "\\( a^{2} = 25 + 49 - 2(5)(7)\\cos 60^{\\circ} = 74 - 35 = 39 \\), sehingga \\( a = \\sqrt{39} \\approx 6{,}24 \\).",
              },
            ],
          },
          flashcards: [
            {
              id: "mw-geometri-trigonometri-aturan-sinus-kosinus-fc1",
              front: "Kapan memakai aturan sinus?",
              back: "Saat diketahui pasangan sisi dengan sudut di hadapannya, atau dua sudut dan satu sisi (kondisi sisi-sudut-sudut).",
            },
            {
              id: "mw-geometri-trigonometri-aturan-sinus-kosinus-fc2",
              front: "Kapan memakai aturan kosinus?",
              back: "Saat diketahui dua sisi dan sudut apitnya, atau ketiga sisinya untuk mencari salah satu sudut.",
            },
            {
              id: "mw-geometri-trigonometri-aturan-sinus-kosinus-fc3",
              front: "Rumus luas segitiga dengan dua sisi dan satu sudut apit?",
              back: "\\( L = \\tfrac{1}{2}ab\\sin C \\) — sudut yang dipakai harus sudut apit antara kedua sisi itu.",
            },
            {
              id: "mw-geometri-trigonometri-aturan-sinus-kosinus-fc4",
              front: "Apa arti \\( 2R \\) pada aturan sinus?",
              back: "Dua kali jari-jari lingkaran luar segitiga; rasio sisi terhadap sinus sudut di hadapannya selalu sama untuk semua sisi.",
            },
          ],
          quiz: [
            {
              id: "mw-geometri-trigonometri-aturan-sinus-kosinus-q1",
              question:
                "Pada segitiga ABC, \\( b = 6 \\), \\( c = 8 \\), dan \\( A = 60^{\\circ} \\). Panjang sisi \\( a \\) adalah ...",
              options: ["\\( 2\\sqrt{13} \\)", "\\( 4\\sqrt{3} \\)", "\\( 2\\sqrt{19} \\)", "10"],
              correctIndex: 0,
              explanation:
                "\\( a^{2} = 36 + 64 - 2(6)(8)\\cos 60^{\\circ} = 100 - 48 = 52 \\), jadi \\( a = \\sqrt{52} = 2\\sqrt{13} \\).",
            },
            {
              id: "mw-geometri-trigonometri-aturan-sinus-kosinus-q2",
              question:
                "Segitiga dengan sisi \\( a = 7 \\), \\( b = 5 \\), \\( c = 3 \\). Nilai \\( \\cos C \\) adalah ...",
              options: ["\\( \\tfrac{13}{14} \\)", "\\( -\\tfrac{13}{14} \\)", "\\( \\tfrac{1}{2} \\)", "\\( \\tfrac{5}{7} \\)"],
              correctIndex: 0,
              explanation:
                "\\( \\cos C = \\dfrac{a^{2} + b^{2} - c^{2}}{2ab} = \\dfrac{49 + 25 - 9}{2(7)(5)} = \\dfrac{65}{70} = \\tfrac{13}{14} \\).",
            },
            {
              id: "mw-geometri-trigonometri-aturan-sinus-kosinus-q3",
              question:
                "Luas segitiga dengan \\( a = 10 \\), \\( b = 6 \\), dan \\( C = 30^{\\circ} \\) adalah ...",
              options: ["15 satuan luas", "30 satuan luas", "20 satuan luas", "12 satuan luas"],
              correctIndex: 0,
              explanation:
                "\\( L = \\tfrac{1}{2}(10)(6)\\sin 30^{\\circ} = 30 \\cdot \\tfrac{1}{2} = 15 \\) satuan luas.",
            },
            {
              id: "mw-geometri-trigonometri-aturan-sinus-kosinus-q4",
              question:
                "Pada segitiga ABC, \\( A = 45^{\\circ} \\), \\( B = 60^{\\circ} \\), dan \\( a = 6 \\). Panjang sisi \\( b \\) adalah ...",
              options: ["\\( 3\\sqrt{6} \\)", "\\( 2\\sqrt{6} \\)", "\\( 3\\sqrt{2} \\)", "\\( 6\\sqrt{2} \\)"],
              correctIndex: 0,
              explanation:
                "\\( b = \\dfrac{a\\sin B}{\\sin A} = \\dfrac{6 \\cdot \\tfrac{\\sqrt{3}}{2}}{\\tfrac{\\sqrt{2}}{2}} = \\dfrac{6\\sqrt{3}}{\\sqrt{2}} = 3\\sqrt{6} \\).",
            },
          ],
          latihanSoal: [
            {
              id: "mw-geometri-trigonometri-aturan-sinus-kosinus-l1",
              level: "hots",
              question:
                "Dua kapal berlayar dari pelabuhan yang sama. Kapal A menempuh 12 km pada arah \\( 030^{\\circ} \\) dan kapal B menempuh 16 km pada arah \\( 120^{\\circ} \\). Tentukan jarak antara kedua kapal dan luas daerah segitiga yang dibentuk jalur keduanya.",
              langkah: [
                "Sudut antara kedua jalur adalah \\( 120^{\\circ} - 30^{\\circ} = 90^{\\circ} \\).",
                "Terapkan aturan kosinus: \\( d^{2} = 12^{2} + 16^{2} - 2(12)(16)\\cos 90^{\\circ} \\).",
                "Karena \\( \\cos 90^{\\circ} = 0 \\), maka \\( d^{2} = 144 + 256 = 400 \\).",
                "Diperoleh \\( d = \\sqrt{400} = 20 \\) km.",
                "Hitung luas: \\( L = \\tfrac{1}{2}(12)(16)\\sin 90^{\\circ} = 96 \\) km persegi.",
                "Periksa dengan cek Pythagoras: karena sudut apitnya siku-siku, hasil \\( 12, 16, 20 \\) adalah tripel Pythagoras. Konsisten.",
              ],
              jawaban: "Jarak kedua kapal 20 km dan luas segitiga jalurnya 96 km persegi.",
            },
            {
              id: "mw-geometri-trigonometri-aturan-sinus-kosinus-l2",
              level: "sulit",
              question:
                "Pada segitiga ABC diketahui \\( a = 5 \\), \\( b = 7 \\), dan \\( c = 9 \\). (a) Tentukan nilai \\( \\cos A \\). (b) Tentukan jenis segitiga tersebut. (c) Hitung luasnya dengan rumus Heron.",
              langkah: [
                "Aturan kosinus untuk sudut A: \\( \\cos A = \\dfrac{b^{2} + c^{2} - a^{2}}{2bc} = \\dfrac{49 + 81 - 25}{2(7)(9)} \\).",
                "Hitung: \\( \\cos A = \\dfrac{105}{126} = \\tfrac{5}{6} \\approx 0{,}833 \\).",
                "Karena \\( \\cos A > 0 \\), sudut A lancip. Periksa sudut terbesar (di hadapan sisi 9): \\( \\cos C = \\dfrac{25 + 49 - 81}{2(5)(7)} = \\dfrac{-7}{70} = -0{,}1 \\).",
                "Karena \\( \\cos C < 0 \\), sudut C tumpul sehingga segitiga tersebut tumpul.",
                "Hitung setengah keliling: \\( s = \\tfrac{5 + 7 + 9}{2} = 10{,}5 \\).",
                "Terapkan Heron: \\( L = \\sqrt{10{,}5 \\times 5{,}5 \\times 3{,}5 \\times 1{,}5} = \\sqrt{303{,}1875} \\approx 17{,}41 \\).",
                "Periksa dengan rumus sudut: \\( \\sin A = \\sqrt{1 - \\tfrac{25}{36}} = \\tfrac{\\sqrt{11}}{6} \\); \\( L = \\tfrac{1}{2}(63)\\tfrac{\\sqrt{11}}{6} = \\tfrac{21\\sqrt{11}}{4} \\approx 17{,}41 \\). Cocok.",
              ],
              jawaban:
                "(a) \\( \\cos A = \\tfrac{5}{6} \\) (b) Segitiga tumpul karena \\( \\cos C < 0 \\) (c) \\( L = \\tfrac{21\\sqrt{11}}{4} \\approx 17{,}41 \\) satuan luas.",
            },
          ],
          tkaSoal: [
            {
              id: "mw-geometri-trigonometri-aturan-sinus-kosinus-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Aturan kosinus dinyatakan oleh ...",
              options: [
                { id: "A", text: "\\( \\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B} \\)" },
                { id: "B", text: "\\( a^{2} = b^{2} + c^{2} - 2bc\\cos A \\)" },
                { id: "C", text: "\\( L = \\dfrac{1}{2}ab\\sin C \\)" },
                { id: "D", text: "\\( a + b > c \\)" },
                { id: "E", text: "\\( \\dfrac{a + b}{\\sin A + \\sin B} = 2R \\)" },
              ],
              correctIds: ["B"],
              explanation:
                "Aturan kosinus menghubungkan satu sisi dengan dua sisi lain dan kosinus sudut apitnya. Opsi A adalah aturan sinus, C rumus luas segitiga, D ketidaksamaan segitiga, dan E bentuk lanjutan aturan sinus.",
            },
            {
              id: "mw-geometri-trigonometri-aturan-sinus-kosinus-tka2",
              bentuk: "pg",
              level: "L2",
              question:
                "Pada segitiga \\( ABC \\) diketahui \\( b = 8 \\), \\( c = 5 \\), dan \\( A = 60^{\\circ} \\). Panjang sisi \\( a \\) adalah ...",
              options: [
                { id: "A", text: "\\( 6 \\)" },
                { id: "B", text: "\\( 7 \\)" },
                { id: "C", text: "\\( 8 \\)" },
                { id: "D", text: "\\( 9 \\)" },
                { id: "E", text: "\\( \\sqrt{89} \\)" },
              ],
              correctIds: ["B"],
              explanation:
                "\\( a^{2} = 8^{2} + 5^{2} - 2(8)(5)\\cos 60^{\\circ} = 64 + 25 - 80\\left(\\tfrac{1}{2}\\right) = 89 - 40 = 49 \\), sehingga \\( a = 7 \\).",
            },
            {
              id: "mw-geometri-trigonometri-aturan-sinus-kosinus-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              question:
                "Segitiga \\( ABC \\) memiliki sisi \\( a = 5 \\), \\( b = 7 \\), dan \\( c = 9 \\). Pilih semua pernyataan yang BENAR. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "\\( \\cos A = \\dfrac{5}{6} \\)" },
                { id: "B", text: "Segitiga tersebut tumpul" },
                { id: "C", text: "Segitiga tersebut lancip" },
                { id: "D", text: "Setengah kelilingnya \\( s = 10{,}5 \\)" },
                { id: "E", text: "Luasnya tepat 18 satuan luas" },
              ],
              correctIds: ["A", "B", "D"],
              explanation:
                "\\( \\cos A = \\dfrac{49 + 81 - 25}{2(7)(9)} = \\dfrac{105}{126} = \\dfrac{5}{6} \\) (A benar). Karena \\( \\cos C = \\dfrac{25 + 49 - 81}{70} = -0{,}1 < 0 \\), segitiga tumpul (B benar, C salah). \\( s = \\dfrac{5 + 7 + 9}{2} = 10{,}5 \\) (D benar). Luas Heron \\( = \\sqrt{10{,}5 \\cdot 5{,}5 \\cdot 3{,}5 \\cdot 1{,}5} \\approx 17{,}41 \\), bukan 18 (E salah).",
            },
            {
              id: "mw-geometri-trigonometri-aturan-sinus-kosinus-tka4",
              bentuk: "isian",
              level: "L2",
              question:
                "Pada segitiga \\( ABC \\) diketahui \\( a = 6 \\), \\( b = 8 \\), dan \\( C = 30^{\\circ} \\). Berapa luas segitiga tersebut?",
              correctIds: ["12"],
              explanation:
                "\\( L = \\dfrac{1}{2}ab\\sin C = \\dfrac{1}{2}(6)(8)\\sin 30^{\\circ} = 24 \\cdot \\dfrac{1}{2} = 12 \\) satuan luas.",
            },
          ],
        },
        {
          id: "mw-geometri-trigonometri-dimensi-tiga",
          title: "Dimensi Tiga (Jarak Titik ke Garis/Bidang)",
          estimatedMinutes: 70,
          materi: {
            ringkasan:
              "Dimensi tiga membahas kedudukan titik, garis, dan bidang dalam ruang serta jarak antar-unsur tersebut. Jarak titik ke garis adalah panjang ruas tegak lurus dari titik ke garis, sedangkan jarak titik ke bidang adalah panjang ruas tegak lurus dari titik ke bidang. Pada kubus, jarak biasanya dihitung melalui proyeksi dan teorema Pythagoras.",
            rumus: [
              "Jarak dua titik: \\( d = \\sqrt{(x_{2}-x_{1})^{2} + (y_{2}-y_{1})^{2} + (z_{2}-z_{1})^{2}} \\)",
              "Diagonal sisi kubus bersisi \\( s \\): \\( s\\sqrt{2} \\); diagonal ruang: \\( s\\sqrt{3} \\)",
              "Proyeksi titik \\( P \\) pada bidang menghasilkan kaki tegak lurus \\( P' \\); jarak \\( = PP' \\)",
              "Sudut antara garis dan bidang \\( \\theta \\): \\( \\tan\\theta = \\dfrac{\\text{jarak titik ke bidang}}{\\text{panjang proyeksi}} \\)",
              "Volume limas: \\( V = \\tfrac{1}{3} \\times \\text{luas alas} \\times \\text{tinggi} \\)",
            ],
            contoh: [
              {
                soal:
                  "Kubus ABCD.EFGH memiliki panjang rusuk 6 cm. Tentukan jarak titik A ke titik G.",
                pembahasan:
                  "AG adalah diagonal ruang, sehingga \\( AG = s\\sqrt{3} = 6\\sqrt{3} \\) cm \\( \\approx 10{,}39 \\) cm.",
              },
              {
                soal:
                  "Balok berukuran \\( 3 \\times 4 \\times 12 \\) cm. Tentukan panjang diagonal ruangnya.",
                pembahasan:
                  "\\( d = \\sqrt{3^{2} + 4^{2} + 12^{2}} = \\sqrt{9 + 16 + 144} = \\sqrt{169} = 13 \\) cm.",
              },
            ],
          },
          flashcards: [
            {
              id: "mw-geometri-trigonometri-dimensi-tiga-fc1",
              front: "Rumus diagonal sisi dan diagonal ruang kubus bersisi \\( s \\)?",
              back: "Diagonal sisi \\( = s\\sqrt{2} \\); diagonal ruang \\( = s\\sqrt{3} \\).",
            },
            {
              id: "mw-geometri-trigonometri-dimensi-tiga-fc2",
              front: "Apa definisi jarak titik ke garis?",
              back: "Panjang ruas garis tegak lurus yang menghubungkan titik tersebut dengan garis, diukur sampai titik proyeksi (kaki tegak lurus).",
            },
            {
              id: "mw-geometri-trigonometri-dimensi-tiga-fc3",
              front: "Apa definisi jarak titik ke bidang?",
              back: "Panjang ruas tegak lurus dari titik ke titik tembus pada bidang (proyeksi tegak lurus titik tersebut).",
            },
            {
              id: "mw-geometri-trigonometri-dimensi-tiga-fc4",
              front: "Langkah umum menghitung jarak pada bangun ruang?",
              back: "Identifikasi segitiga siku-siku yang memuat jarak yang dicari, tentukan panjang sisi yang diketahui, lalu gunakan Pythagoras atau trigonometri.",
            },
          ],
          quiz: [
            {
              id: "mw-geometri-trigonometri-dimensi-tiga-q1",
              question: "Kubus dengan rusuk 4 cm memiliki panjang diagonal ruang ...",
              options: [
                "\\( 4\\sqrt{2} \\) cm",
                "\\( 4\\sqrt{3} \\) cm",
                "\\( 8\\sqrt{2} \\) cm",
                "\\( 2\\sqrt{3} \\) cm",
              ],
              correctIndex: 1,
              explanation: "Diagonal ruang \\( = s\\sqrt{3} = 4\\sqrt{3} \\) cm.",
            },
            {
              id: "mw-geometri-trigonometri-dimensi-tiga-q2",
              question:
                "Kubus ABCD.EFGH rusuk 6 cm. Jarak titik A ke titik C adalah ...",
              options: ["\\( 6\\sqrt{2} \\) cm", "\\( 6\\sqrt{3} \\) cm", "6 cm", "12 cm"],
              correctIndex: 0,
              explanation:
                "AC adalah diagonal sisi bidang ABCD, sehingga \\( AC = 6\\sqrt{2} \\) cm.",
            },
            {
              id: "mw-geometri-trigonometri-dimensi-tiga-q3",
              question:
                "Balok berukuran \\( 3 \\times 4 \\times 12 \\) cm. Panjang diagonal ruangnya adalah ...",
              options: ["13 cm", "19 cm", "15 cm", "17 cm"],
              correctIndex: 0,
              explanation:
                "\\( d = \\sqrt{3^{2} + 4^{2} + 12^{2}} = \\sqrt{9 + 16 + 144} = \\sqrt{169} = 13 \\) cm.",
            },
            {
              id: "mw-geometri-trigonometri-dimensi-tiga-q4",
              question:
                "Pada kubus rusuk 6 cm, jarak titik tengah rusuk AB ke titik tengah rusuk GH adalah ...",
              options: [
                "\\( 6\\sqrt{2} \\) cm",
                "\\( 6\\sqrt{3} \\) cm",
                "\\( 3\\sqrt{2} \\) cm",
                "9 cm",
              ],
              correctIndex: 0,
              explanation:
                "Dengan A(0,0,0) dan G(6,6,6), titik tengah AB adalah \\( (3,0,0) \\) dan titik tengah GH adalah \\( (3,6,6) \\). Jarak \\( = \\sqrt{0 + 36 + 36} = 6\\sqrt{2} \\) cm.",
            },
          ],
          latihanSoal: [
            {
              id: "mw-geometri-trigonometri-dimensi-tiga-l1",
              level: "hots",
              question:
                "Kubus ABCD.EFGH memiliki panjang rusuk 6 cm. Titik P adalah titik tengah rusuk AE. Tentukan jarak titik P ke titik C, dan tentukan pula jarak titik P ke garis CG.",
              langkah: [
                "Tetapkan koordinat: A(0,0,0), B(6,0,0), C(6,6,0), D(0,6,0), E(0,0,6), F(6,0,6), G(6,6,6), H(0,6,6).",
                "Titik P adalah titik tengah AE, sehingga P(0, 0, 3).",
                "Jarak P ke C: \\( PC = \\sqrt{(6-0)^{2} + (6-0)^{2} + (0-3)^{2}} = \\sqrt{36 + 36 + 9} = \\sqrt{81} = 9 \\) cm.",
                "Untuk jarak P ke garis CG: garis CG sejajar sumbu-z melalui titik \\( (6, 6, 0) \\).",
                "Vektor arah CG adalah \\( \\vec{u} = (0, 0, 1) \\); vektor dari C ke P adalah \\( \\vec{v} = (-6, -6, 3) \\).",
                "Proyeksi \\( \\vec{v} \\) pada \\( \\vec{u} \\) bernilai 3, sehingga komponen sejajar \\( = (0, 0, 3) \\).",
                "Komponen tegak lurus \\( = (-6, -6, 0) \\) dengan panjang \\( \\sqrt{36 + 36} = 6\\sqrt{2} \\) cm.",
                "Periksa kewajaran: \\( 9 \\) cm dan \\( 6\\sqrt{2} \\approx 8{,}49 \\) cm keduanya di bawah diagonal ruang \\( 6\\sqrt{3} \\approx 10{,}39 \\) cm. Masuk akal.",
              ],
              jawaban:
                "\\( PC = 9 \\) cm dan jarak titik P ke garis CG \\( = 6\\sqrt{2} \\approx 8{,}49 \\) cm.",
            },
            {
              id: "mw-geometri-trigonometri-dimensi-tiga-l2",
              level: "sulit",
              question:
                "Diketahui limas T.ABCD dengan alas persegi ABCD bersisi 8 cm dan tinggi limas 6 cm dengan T tepat di atas pusat alas. Tentukan jarak titik T ke rusuk AB dan hitung volume limas.",
              langkah: [
                "Tetapkan koordinat: pusat alas di O(0,0,0), A(-4,-4,0), B(4,-4,0), C(4,4,0), D(-4,4,0), T(0,0,6).",
                "Rusuk AB terletak pada garis \\( y = -4, z = 0 \\) dengan \\( x \\) dari -4 sampai 4.",
                "Titik terdekat pada AB dari T(0,0,6) adalah titik tengah AB, yaitu M(0,-4,0).",
                "Hitung \\( TM = \\sqrt{(0-0)^{2} + (-4-0)^{2} + (0-6)^{2}} = \\sqrt{0 + 16 + 36} = \\sqrt{52} = 2\\sqrt{13} \\) cm.",
                "Verifikasi lewat segitiga siku-siku TOM: \\( OM = 4 \\) cm (setengah sisi alas) dan \\( TO = 6 \\) cm, sehingga \\( TM = \\sqrt{4^{2} + 6^{2}} = \\sqrt{52} \\) cm. Cocok.",
                "Volume limas: \\( V = \\tfrac{1}{3} \\times 8^{2} \\times 6 = \\tfrac{1}{3} \\times 64 \\times 6 = 128 \\) cm kubik.",
              ],
              jawaban:
                "Jarak titik T ke rusuk AB \\( = 2\\sqrt{13} \\approx 7{,}21 \\) cm, dan volume limas \\( = 128 \\) cm kubik.",
            },
          ],
          tkaSoal: [
            {
              id: "mw-geometri-trigonometri-dimensi-tiga-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Jarak titik ke bidang diukur sepanjang ruas garis yang ...",
              options: [
                { id: "A", text: "sejajar dengan bidang" },
                { id: "B", text: "tegak lurus terhadap bidang" },
                { id: "C", text: "membentuk sudut \\( 45^{\\circ} \\) dengan bidang" },
                { id: "D", text: "terpanjang di antara semua ruas garis penghubung" },
                { id: "E", text: "terletak di dalam bidang" },
              ],
              correctIds: ["B"],
              explanation:
                "Jarak titik ke bidang adalah panjang ruas garis terpendek, yaitu ruas yang tegak lurus bidang. Ruas garis lain selalu lebih panjang.",
            },
            {
              id: "mw-geometri-trigonometri-dimensi-tiga-tka2",
              bentuk: "pg",
              level: "L2",
              question:
                "Kubus \\( ABCD.EFGH \\) memiliki panjang rusuk 6 cm. Jarak titik \\( A \\) ke titik \\( G \\) adalah ...",
              options: [
                { id: "A", text: "\\( 6 \\) cm" },
                { id: "B", text: "\\( 6\\sqrt{2} \\) cm" },
                { id: "C", text: "\\( 6\\sqrt{3} \\) cm" },
                { id: "D", text: "\\( 12 \\) cm" },
                { id: "E", text: "\\( 3\\sqrt{6} \\) cm" },
              ],
              correctIds: ["C"],
              explanation:
                "\\( AG \\) adalah diagonal ruang: \\( AG = s\\sqrt{3} = 6\\sqrt{3} \\) cm. Diagonal sisi bernilai \\( 6\\sqrt{2} \\) cm.",
            },
            {
              id: "mw-geometri-trigonometri-dimensi-tiga-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              question:
                "Limas \\( T.ABCD \\) beralas persegi bersisi 8 cm, dan \\( T \\) terletak tepat 6 cm di atas pusat alas. Pilih semua pernyataan yang BENAR. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "Jarak \\( T \\) ke rusuk \\( AB \\) adalah \\( 2\\sqrt{13} \\) cm" },
                { id: "B", text: "Jarak \\( T \\) ke titik \\( A \\) adalah \\( 4\\sqrt{2} \\) cm" },
                { id: "C", text: "Volume limas adalah \\( 128 \\) cm kubik" },
                { id: "D", text: "Jarak \\( T \\) ke rusuk \\( AB \\) adalah 6 cm" },
                { id: "E", text: "Volume limas adalah \\( 384 \\) cm kubik" },
              ],
              correctIds: ["A", "C"],
              explanation:
                "Jarak \\( T \\) ke \\( AB \\) diukur ke titik tengah \\( AB \\): \\( \\sqrt{4^{2} + 6^{2}} = \\sqrt{52} = 2\\sqrt{13} \\) cm (A benar, D salah). Jarak \\( T \\) ke titik \\( A \\) adalah \\( \\sqrt{(4\\sqrt{2})^{2} + 6^{2}} = \\sqrt{32 + 36} = \\sqrt{68} \\), bukan \\( 4\\sqrt{2} \\) (B salah). Volume \\( = \\tfrac{1}{3} \\cdot 64 \\cdot 6 = 128 \\) cm kubik (C benar, E salah).",
            },
            {
              id: "mw-geometri-trigonometri-dimensi-tiga-tka4",
              bentuk: "isian",
              level: "L2",
              question:
                "Kubus dengan rusuk 5 cm. Berapa panjang diagonal sisinya (dalam cm, tulis angka pengali akar saja, misal 6 untuk \\( 6\\sqrt{2} \\))?",
              correctIds: ["5"],
              explanation:
                "Diagonal sisi \\( = s\\sqrt{2} = 5\\sqrt{2} \\) cm, sehingga angka pengalinya adalah 5.",
            },
          ],
        },
      ],
    },
    {
      id: "mw-analisis-data-peluang",
      title: "Analisis Data & Peluang",
      order: 3,
      subtopics: [
        {
          id: "mw-analisis-data-peluang-statistika-deskriptif",
          title: "Statistika Deskriptif (Ukuran Pemusatan & Penyebaran)",
          estimatedMinutes: 50,
          materi: {
            ringkasan:
              "Statistika deskriptif merangkum data menjadi beberapa angka ringkas. Ukuran pemusatan (mean, median, modus) menunjukkan nilai pusat data, sedangkan ukuran penyebaran (ragam, simpangan baku, jangkauan) menunjukkan seberapa tersebar data terhadap pusatnya.",
            rumus: [
              "Rata-rata: \\( \\bar{x} = \\dfrac{\\sum x_{i}}{n} \\) atau data berkelompok \\( \\bar{x} = \\dfrac{\\sum f_{i}x_{i}}{\\sum f_{i}} \\)",
              "Median data tunggal: nilai tengah setelah data diurutkan",
              "Modus: nilai dengan frekuensi terbanyak (bisa lebih dari satu)",
              "Ragam (variansi): \\( s^{2} = \\dfrac{\\sum (x_{i} - \\bar{x})^{2}}{n} \\)",
              "Simpangan baku: \\( s = \\sqrt{s^{2}} \\)",
              "Jangkauan: \\( R = x_{\\max} - x_{\\min} \\)",
            ],
            contoh: [
              {
                soal: "Tentukan mean, median, dan modus dari data 4, 6, 6, 7, 8, 9, 10.",
                pembahasan:
                  "\\( \\bar{x} = \\dfrac{50}{7} \\approx 7{,}14 \\). Data berjumlah 7 (ganjil), sehingga median = data ke-4 = 7. Modus = 6 karena muncul dua kali.",
              },
              {
                soal: "Hitung simpangan baku dari data 2, 4, 4, 6, 9.",
                pembahasan:
                  "\\( \\bar{x} = \\dfrac{25}{5} = 5 \\). Jumlah kuadrat simpangan \\( = 9 + 1 + 1 + 1 + 16 = 28 \\). Ragam \\( = \\dfrac{28}{5} = 5{,}6 \\); simpangan baku \\( = \\sqrt{5{,}6} \\approx 2{,}37 \\).",
              },
            ],
          },
          flashcards: [
            {
              id: "mw-analisis-data-peluang-statistika-deskriptif-fc1",
              front: "Kapan mean kurang tepat mewakili data?",
              back: "Ketika ada nilai ekstrem (pencilan), karena mean sangat terpengaruh nilai tersebut; median lebih stabil.",
            },
            {
              id: "mw-analisis-data-peluang-statistika-deskriptif-fc2",
              front: "Apa arti simpangan baku besar?",
              back: "Data tersebar jauh dari rata-rata (heterogen); simpangan baku kecil berarti data mengumpul dekat rata-rata.",
            },
            {
              id: "mw-analisis-data-peluang-statistika-deskriptif-fc3",
              front: "Rumus median data berkelompok?",
              back: "\\( Me = T_{b} + p\\dfrac{\\tfrac{n}{2} - F}{f} \\) dengan \\( T_{b} \\) tepi bawah kelas median dan \\( F \\) frekuensi kumulatif sebelumnya.",
            },
            {
              id: "mw-analisis-data-peluang-statistika-deskriptif-fc4",
              front: "Apa hubungan ragam dan simpangan baku?",
              back: "Simpangan baku adalah akar kuadrat dari ragam, sehingga satuannya sama dengan satuan data asli.",
            },
          ],
          quiz: [
            {
              id: "mw-analisis-data-peluang-statistika-deskriptif-q1",
              question: "Rata-rata dari data 5, 7, 8, 10, 10 adalah ...",
              options: ["7", "8", "9", "10"],
              correctIndex: 1,
              explanation: "\\( \\bar{x} = \\dfrac{40}{5} = 8 \\).",
            },
            {
              id: "mw-analisis-data-peluang-statistika-deskriptif-q2",
              question: "Median dari data 3, 5, 6, 7, 9, 11 adalah ...",
              options: ["6", "6,5", "7", "7,5"],
              correctIndex: 1,
              explanation:
                "Data berjumlah 6 (genap), median = rata-rata data ke-3 dan ke-4 = \\( \\dfrac{6 + 7}{2} = 6{,}5 \\).",
            },
            {
              id: "mw-analisis-data-peluang-statistika-deskriptif-q3",
              question: "Modus dari data 2, 3, 3, 4, 5, 5, 5, 6 adalah ...",
              options: ["3", "4", "5", "3 dan 5"],
              correctIndex: 2,
              explanation: "Nilai 5 muncul tiga kali, paling banyak dibanding nilai lain.",
            },
            {
              id: "mw-analisis-data-peluang-statistika-deskriptif-q4",
              question: "Data 2, 4, 4, 6, 9 memiliki simpangan baku ...",
              options: [
                "\\( \\sqrt{5{,}6} \\)",
                "\\( \\sqrt{7} \\)",
                "\\( \\sqrt{4{,}8} \\)",
                "5",
              ],
              correctIndex: 0,
              explanation:
                "\\( \\bar{x} = 5 \\); jumlah kuadrat simpangan \\( = 9 + 1 + 1 + 1 + 16 = 28 \\); ragam \\( = \\dfrac{28}{5} = 5{,}6 \\); simpangan baku \\( = \\sqrt{5{,}6} \\approx 2{,}37 \\).",
            },
          ],
          latihanSoal: [
            {
              id: "mw-analisis-data-peluang-statistika-deskriptif-l1",
              level: "hots",
              question:
                "Nilai 20 siswa: 65, 70, 70, 75, 75, 75, 80, 80, 80, 80, 85, 85, 85, 90, 90, 90, 95, 95, 100, 100. (a) Hitung rata-rata. (b) Tentukan median dan modus. (c) Seorang siswa mengaku nilainya di atas rata-rata kelas; berapa nilai minimum yang mungkin agar klaim itu benar? (d) Hitung simpangan bakunya.",
              langkah: [
                "Jumlahkan seluruh nilai: 65 + 70 + 70 + 75 + 75 + 75 + 80 + 80 + 80 + 80 + 85 + 85 + 85 + 90 + 90 + 90 + 95 + 95 + 100 + 100 = 1665.",
                "Rata-rata: \\( \\bar{x} = \\dfrac{1665}{20} = 83{,}25 \\).",
                "Median: data ke-10 dan ke-11 keduanya bernilai 80, sehingga median \\( = \\dfrac{80 + 80}{2} = 80 \\).",
                "Modus: nilai 80 muncul 4 kali (terbanyak), jadi modus = 80.",
                "Klaim di atas rata-rata berarti nilai \\( > 83{,}25 \\); nilai terkecil yang tersedia dan memenuhi adalah 85.",
                "Hitung jumlah kuadrat simpangan dari \\( \\bar{x} = 83{,}25 \\): satu nilai 65 memberi 333,06; dua nilai 70 memberi 351,13; tiga nilai 75 memberi 204,19; empat nilai 80 memberi 42,25.",
                "Lanjutkan: tiga nilai 85 memberi 9,19; tiga nilai 90 memberi 136,69; dua nilai 95 memberi 276,13; dua nilai 100 memberi 561,13.",
                "Total jumlah kuadrat \\( = 333{,}06 + 351{,}13 + 204{,}19 + 42{,}25 + 9{,}19 + 136{,}69 + 276{,}13 + 561{,}13 = 1913{,}77 \\).",
                "Ragam \\( = \\dfrac{1913{,}77}{20} = 95{,}69 \\); simpangan baku \\( = \\sqrt{95{,}69} \\approx 9{,}78 \\).",
                "Interpretasi: nilai siswa rata-rata menyimpang sekitar 9,78 poin dari rata-rata kelas 83,25.",
              ],
              jawaban:
                "(a) \\( \\bar{x} = 83{,}25 \\) (b) Median = 80 dan modus = 80 (c) minimal 85 (d) \\( s \\approx 9{,}78 \\).",
            },
            {
              id: "mw-analisis-data-peluang-statistika-deskriptif-l2",
              level: "sulit",
              question:
                "Rata-rata nilai 10 siswa adalah 72. Setelah satu siswa mengikuti ujian susulan, rata-ratanya berubah menjadi 73. Tentukan nilai siswa susulan tersebut, lalu jelaskan mengapa satu nilai tunggal dapat menaikkan rata-rata seluruh kelas sebesar 1 poin.",
              langkah: [
                "Jumlah nilai awal: \\( 10 \\times 72 = 720 \\).",
                "Setelah penambahan, banyak siswa menjadi 11 dengan rata-rata 73.",
                "Jumlah nilai baru: \\( 11 \\times 73 = 803 \\).",
                "Nilai siswa susulan \\( = 803 - 720 = 83 \\).",
                "Verifikasi: \\( \\dfrac{720 + 83}{11} = \\dfrac{803}{11} = 73 \\). Benar.",
                "Analisis: nilai 83 berada 11 poin di atas rata-rata awal 72. Karena ditambahkan ke kelompok 10 data, kenaikan rata-rata \\( = \\dfrac{83 - 72}{11} = 1 \\) poin.",
                "Generalisasi: menambahkan nilai \\( x \\) ke \\( n \\) data dengan rata-rata \\( \\bar{x} \\) mengubah rata-rata sebesar \\( \\dfrac{x - \\bar{x}}{n + 1} \\).",
              ],
              jawaban:
                "Nilai siswa susulan adalah 83. Kenaikan 1 poin terjadi karena \\( \\dfrac{83 - 72}{10 + 1} = 1 \\).",
            },
          ],
          tkaSoal: [
            {
              id: "mw-analisis-data-peluang-statistika-deskriptif-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Nilai yang paling sering muncul dalam sekumpulan data disebut ...",
              options: [
                { id: "A", text: "rata-rata" },
                { id: "B", text: "median" },
                { id: "C", text: "modus" },
                { id: "D", text: "kuartil" },
                { id: "E", text: "jangkauan" },
              ],
              correctIds: ["C"],
              explanation:
                "Modus adalah nilai dengan frekuensi terbanyak. Rata-rata adalah jumlah dibagi banyak data, median nilai tengah setelah diurutkan, kuartil membagi data menjadi empat, dan jangkauan adalah selisih data terbesar dan terkecil.",
            },
            {
              id: "mw-analisis-data-peluang-statistika-deskriptif-tka2",
              bentuk: "pg",
              level: "L2",
              question:
                "Data: \\( 4, 6, 6, 7, 9, 11, 14 \\). Median dari data tersebut adalah ...",
              options: [
                { id: "A", text: "\\( 6 \\)" },
                { id: "B", text: "\\( 7 \\)" },
                { id: "C", text: "\\( 8 \\)" },
                { id: "D", text: "\\( 9 \\)" },
                { id: "E", text: "\\( 8{,}14 \\)" },
              ],
              correctIds: ["B"],
              explanation:
                "Banyak data 7 (ganjil), sehingga median adalah data ke-4 pada data yang sudah terurut, yaitu 7. Nilai 8,14 adalah rata-ratanya, bukan median.",
            },
            {
              id: "mw-analisis-data-peluang-statistika-deskriptif-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              question:
                "Nilai ulangan 10 siswa memiliki rata-rata 72. Seorang siswa susulan memperoleh nilai 83. Pilih semua pernyataan yang BENAR. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "Jumlah nilai 10 siswa semula adalah 720" },
                { id: "B", text: "Rata-rata baru menjadi 73" },
                { id: "C", text: "Rata-rata baru menjadi 77,5" },
                { id: "D", text: "Rata-rata baru naik 1 poin" },
                { id: "E", text: "Rata-rata baru turun karena bertambahnya data" },
              ],
              correctIds: ["A", "B", "D"],
              explanation:
                "Jumlah semula \\( = 72 \\times 10 = 720 \\) (A benar). Setelah ditambah: \\( \\dfrac{720 + 83}{11} = 73 \\) (B benar, C salah). Kenaikannya \\( 73 - 72 = 1 \\) poin (D benar). Karena nilai 83 di atas rata-rata, rata-rata pasti naik (E salah).",
            },
            {
              id: "mw-analisis-data-peluang-statistika-deskriptif-tka4",
              bentuk: "isian",
              level: "L2",
              question:
                "Data: \\( 3, 5, 5, 7, 9 \\). Berapa simpangan rata-rata data tersebut?",
              correctIds: ["1.6", "1,6"],
              explanation:
                "Rata-rata \\( = \\dfrac{29}{5} = 5{,}8 \\). Simpangan rata-rata \\( = \\dfrac{|3-5{,}8| + |5-5{,}8| + |5-5{,}8| + |7-5{,}8| + |9-5{,}8|}{5} = \\dfrac{2{,}8 + 0{,}8 + 0{,}8 + 1{,}2 + 3{,}2}{5} = \\dfrac{8{,}8}{5} = 1{,}6 \\).",
            },
          ],
        },
        {
          id: "mw-analisis-data-peluang-peluang-majemuk",
          title: "Peluang Kejadian Majemuk",
          estimatedMinutes: 60,
          materi: {
            ringkasan:
              "Peluang kejadian majemuk membahas gabungan atau irisan dua kejadian atau lebih. Dua kejadian disebut saling lepas bila tidak dapat terjadi bersamaan, dan disebut saling bebas bila terjadinya salah satu tidak mempengaruhi peluang kejadian lainnya.",
            rumus: [
              "Peluang dasar: \\( P(A) = \\dfrac{n(A)}{n(S)} \\) dengan \\( 0 \\le P(A) \\le 1 \\)",
              "Komplemen: \\( P(A^{c}) = 1 - P(A) \\)",
              "Gabungan: \\( P(A \\cup B) = P(A) + P(B) - P(A \\cap B) \\)",
              "Saling lepas: \\( P(A \\cup B) = P(A) + P(B) \\) karena \\( P(A \\cap B) = 0 \\)",
              "Saling bebas: \\( P(A \\cap B) = P(A) \\cdot P(B) \\)",
              "Peluang bersyarat: \\( P(A \\mid B) = \\dfrac{P(A \\cap B)}{P(B)} \\)",
            ],
            contoh: [
              {
                soal:
                  "Dua dadu dilempar bersamaan. Tentukan peluang muncul jumlah mata dadu 7.",
                pembahasan:
                  "\\( n(S) = 36 \\). Pasangan berjumlah 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) sehingga \\( n(A) = 6 \\). Peluang \\( = \\dfrac{6}{36} = \\tfrac{1}{6} \\).",
              },
              {
                soal:
                  "Peluang hujan hari ini 0,4 dan peluang sebuah tim menang 0,6. Jika keduanya saling bebas, tentukan peluang hujan DAN tim menang.",
                pembahasan: "Karena saling bebas: \\( P = 0{,}4 \\times 0{,}6 = 0{,}24 \\).",
              },
            ],
          },
          flashcards: [
            {
              id: "mw-analisis-data-peluang-peluang-majemuk-fc1",
              front: "Bedakan kejadian saling lepas dan saling bebas?",
              back: "Saling lepas: tidak bisa terjadi bersamaan, \\( P(A \\cap B) = 0 \\). Saling bebas: terjadinya A tidak mengubah peluang B, \\( P(A \\cap B) = P(A)P(B) \\).",
            },
            {
              id: "mw-analisis-data-peluang-peluang-majemuk-fc2",
              front: "Mengapa hasil gabungan dikurangi irisan?",
              back: "Karena anggota irisan terhitung dua kali saat menjumlahkan \\( P(A) + P(B) \\), sehingga harus dikurangi satu kali.",
            },
            {
              id: "mw-analisis-data-peluang-peluang-majemuk-fc3",
              front: "Kapan memakai komplemen?",
              back: "Saat menghitung peluang 'paling sedikit satu' lebih sulit secara langsung, gunakan \\( 1 - P(\\text{tidak ada}) \\).",
            },
            {
              id: "mw-analisis-data-peluang-peluang-majemuk-fc4",
              front: "Rumus peluang bersyarat \\( P(A \\mid B) \\)?",
              back: "\\( P(A \\mid B) = \\dfrac{P(A \\cap B)}{P(B)} \\) dengan \\( P(B) > 0 \\).",
            },
          ],
          quiz: [
            {
              id: "mw-analisis-data-peluang-peluang-majemuk-q1",
              question:
                "Sebuah dadu dilempar sekali. Peluang muncul mata dadu prima atau mata dadu 6 adalah ...",
              options: ["\\( \\tfrac{1}{3} \\)", "\\( \\tfrac{2}{3} \\)", "\\( \\tfrac{5}{6} \\)", "\\( \\tfrac{1}{2} \\)"],
              correctIndex: 1,
              explanation:
                "Prima = {2, 3, 5} dengan \\( P = \\tfrac{3}{6} \\); mata 6 \\( = \\tfrac{1}{6} \\). Keduanya saling lepas, sehingga \\( P = \\tfrac{3}{6} + \\tfrac{1}{6} = \\tfrac{4}{6} = \\tfrac{2}{3} \\).",
            },
            {
              id: "mw-analisis-data-peluang-peluang-majemuk-q2",
              question:
                "Dua koin dilempar bersamaan. Peluang muncul paling sedikit satu sisi angka adalah ...",
              options: ["\\( \\tfrac{1}{4} \\)", "\\( \\tfrac{1}{2} \\)", "\\( \\tfrac{3}{4} \\)", "1"],
              correctIndex: 2,
              explanation:
                "Peluang tidak ada angka sama sekali (keduanya gambar) \\( = \\tfrac{1}{4} \\), sehingga \\( 1 - \\tfrac{1}{4} = \\tfrac{3}{4} \\).",
            },
            {
              id: "mw-analisis-data-peluang-peluang-majemuk-q3",
              question:
                "Dari 40 siswa, 25 ikut klub matematika, 18 ikut klub bahasa, dan 10 ikut keduanya. Peluang siswa yang ikut matematika atau bahasa adalah ...",
              options: [
                "\\( \\tfrac{33}{40} \\)",
                "\\( \\tfrac{43}{40} \\)",
                "\\( \\tfrac{35}{40} \\)",
                "\\( \\tfrac{30}{40} \\)",
              ],
              correctIndex: 0,
              explanation:
                "\\( P = \\dfrac{25}{40} + \\dfrac{18}{40} - \\dfrac{10}{40} = \\dfrac{33}{40} \\).",
            },
            {
              id: "mw-analisis-data-peluang-peluang-majemuk-q4",
              question:
                "Peluang A lulus 0,7 dan B lulus 0,5 secara bebas. Peluang keduanya lulus adalah ...",
              options: ["0,35", "1,2", "0,2", "0,85"],
              correctIndex: 0,
              explanation: "Karena saling bebas: \\( 0{,}7 \\times 0{,}5 = 0{,}35 \\).",
            },
          ],
          latihanSoal: [
            {
              id: "mw-analisis-data-peluang-peluang-majemuk-l1",
              level: "hots",
              question:
                "Sebuah kotak berisi 5 bola merah dan 4 bola biru. Dua bola diambil satu per satu TANPA pengembalian. (a) Tentukan peluang kedua bola merah. (b) Tentukan peluang bola pertama merah dan bola kedua biru. (c) Tentukan peluang kedua bola berbeda warna. (d) Jika pengambilan dilakukan DENGAN pengembalian, hitung ulang peluang kedua bola merah dan jelaskan perbedaannya.",
              langkah: [
                "Total bola awal 9. Peluang bola pertama merah: \\( \\dfrac{5}{9} \\).",
                "Tanpa pengembalian, sisa bola 8 dengan 4 merah. Peluang bola kedua merah: \\( \\dfrac{4}{8} = \\tfrac{1}{2} \\).",
                "Peluang kedua bola merah: \\( \\dfrac{5}{9} \\times \\dfrac{4}{8} = \\dfrac{20}{72} = \\dfrac{5}{18} \\approx 0{,}278 \\).",
                "Peluang bola pertama merah dan bola kedua biru: \\( \\dfrac{5}{9} \\times \\dfrac{4}{8} = \\dfrac{5}{18} \\).",
                "Peluang bola pertama biru dan bola kedua merah: \\( \\dfrac{4}{9} \\times \\dfrac{5}{8} = \\dfrac{5}{18} \\).",
                "Peluang kedua bola berbeda warna: \\( \\dfrac{5}{18} + \\dfrac{5}{18} = \\dfrac{10}{18} = \\dfrac{5}{9} \\approx 0{,}556 \\).",
                "Periksa: peluang kedua bola biru \\( = \\dfrac{4}{9} \\times \\dfrac{3}{8} = \\dfrac{12}{72} = \\dfrac{3}{18} \\), sehingga peluang sama warna \\( = \\dfrac{5}{18} + \\dfrac{3}{18} = \\dfrac{8}{18} = \\dfrac{4}{9} \\). Total \\( \\dfrac{5}{9} + \\dfrac{4}{9} = 1 \\). Benar.",
                "Dengan pengembalian: \\( \\dfrac{5}{9} \\times \\dfrac{5}{9} = \\dfrac{25}{81} \\approx 0{,}309 \\), lebih besar karena komposisi kotak tetap dan bola merah tidak berkurang.",
              ],
              jawaban:
                "(a) \\( \\dfrac{5}{18} \\approx 0{,}278 \\) (b) \\( \\dfrac{5}{18} \\) (c) \\( \\dfrac{5}{9} \\approx 0{,}556 \\) (d) Dengan pengembalian \\( \\dfrac{25}{81} \\approx 0{,}309 \\), lebih besar karena peluang tetap 5/9 pada setiap pengambilan.",
            },
            {
              id: "mw-analisis-data-peluang-peluang-majemuk-l2",
              level: "hots",
              question:
                "Seorang siswa menghadapi dua tahap seleksi yang saling bebas. Peluang lolos tahap pertama 0,8 dan peluang lolos tahap kedua 0,6. (a) Berapa peluang lolos kedua tahap? (b) Berapa peluang lolos tahap pertama tetapi gagal di tahap kedua? (c) Berapa peluang gagal di kedua tahap? (d) Jika siswa itu gagal pada seleksi keseluruhan, skenario kegagalan mana yang paling besar peluangnya?",
              langkah: [
                "Karena kedua tahap saling bebas, peluang gabungan dihitung dengan perkalian.",
                "Peluang lolos kedua tahap: \\( P(A \\cap B) = 0{,}8 \\times 0{,}6 = 0{,}48 \\).",
                "Peluang lolos tahap I dan gagal tahap II: \\( 0{,}8 \\times (1 - 0{,}6) = 0{,}8 \\times 0{,}4 = 0{,}32 \\).",
                "Peluang gagal tahap I dan lolos tahap II: \\( (1 - 0{,}8) \\times 0{,}6 = 0{,}2 \\times 0{,}6 = 0{,}12 \\).",
                "Peluang gagal di kedua tahap: \\( 0{,}2 \\times 0{,}4 = 0{,}08 \\).",
                "Periksa total seluruh kemungkinan: \\( 0{,}48 + 0{,}32 + 0{,}12 + 0{,}08 = 1 \\). Benar.",
                "Peluang gagal pada seleksi keseluruhan \\( = 1 - 0{,}48 = 0{,}52 \\). Dari tiga skenario gagal, terbesar adalah lolos tahap I tetapi gagal tahap II, yaitu 0,32 atau sekitar 61,5% dari seluruh kasus gagal.",
              ],
              jawaban:
                "(a) 0,48 (b) 0,32 (c) 0,08 (d) Peluang gagal total 0,52; skenario terbesar adalah lolos tahap I tetapi gagal tahap II (0,32).",
            },
          ],
          tkaSoal: [
            {
              id: "mw-analisis-data-peluang-peluang-majemuk-tka1",
              bentuk: "pg",
              level: "L1",
              question:
                "Dua kejadian \\( A \\) dan \\( B \\) saling bebas. Peluang keduanya terjadi adalah ...",
              options: [
                { id: "A", text: "\\( P(A) + P(B) \\)" },
                { id: "B", text: "\\( P(A) \\times P(B) \\)" },
                { id: "C", text: "\\( P(A) + P(B) - P(A \\cap B) \\)" },
                { id: "D", text: "\\( 1 - P(A) \\times P(B) \\)" },
                { id: "E", text: "\\( P(A) / P(B) \\)" },
              ],
              correctIds: ["B"],
              explanation:
                "Pada kejadian saling bebas, \\( P(A \\cap B) = P(A) \\times P(B) \\). Opsi C adalah aturan penjumlahan untuk kejadian tidak saling lepas, sedangkan A berlaku untuk kejadian saling lepas.",
            },
            {
              id: "mw-analisis-data-peluang-peluang-majemuk-tka2",
              bentuk: "pg",
              level: "L2",
              question:
                "Dua dadu dilempar bersamaan. Peluang muncul jumlah mata dadu 7 adalah ...",
              options: [
                { id: "A", text: "\\( \\dfrac{1}{12} \\)" },
                { id: "B", text: "\\( \\dfrac{1}{9} \\)" },
                { id: "C", text: "\\( \\dfrac{1}{6} \\)" },
                { id: "D", text: "\\( \\dfrac{5}{36} \\)" },
                { id: "E", text: "\\( \\dfrac{7}{36} \\)" },
              ],
              correctIds: ["C"],
              explanation:
                "Ruang sampelnya 36. Pasangan berjumlah 7 adalah (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) — ada 6 pasangan. Jadi \\( P = \\dfrac{6}{36} = \\dfrac{1}{6} \\).",
            },
            {
              id: "mw-analisis-data-peluang-peluang-majemuk-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              question:
                "Sebuah seleksi dua tahap: peluang lolos tahap I adalah 0,8 dan peluang lolos tahap II adalah 0,6 (saling bebas). Pilih semua pernyataan yang BENAR. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "Peluang lolos kedua tahap adalah 0,48" },
                { id: "B", text: "Peluang gagal pada tahap I adalah 0,2" },
                { id: "C", text: "Peluang gagal pada kedua tahap adalah 0,08" },
                { id: "D", text: "Peluang lolos tahap I tetapi gagal tahap II adalah 0,32" },
                { id: "E", text: "Peluang gagal pada kedua tahap adalah 0,52" },
              ],
              correctIds: ["A", "B", "C", "D"],
              explanation:
                "Lolos keduanya: \\( 0{,}8 \\times 0{,}6 = 0{,}48 \\) (A benar). Gagal tahap I: \\( 1 - 0{,}8 = 0{,}2 \\) (B benar). Gagal keduanya: \\( 0{,}2 \\times 0{,}4 = 0{,}08 \\) (C benar, E salah). Lolos I lalu gagal II: \\( 0{,}8 \\times 0{,}4 = 0{,}32 \\) (D benar). Total peluang gagal \\( = 1 - 0{,}48 = 0{,}52 \\), bukan peluang gagal di kedua tahap.",
            },
            {
              id: "mw-analisis-data-peluang-peluang-majemuk-tka4",
              bentuk: "isian",
              level: "L2",
              question:
                "Sebuah kotak berisi 4 bola merah dan 6 bola biru. Diambil satu bola lalu dikembalikan, kemudian diambil lagi. Berapa peluang terambil dua bola merah (tulis pecahan desimal dua angka, misal 0,16)?",
              correctIds: ["0.16", "0,16"],
              explanation:
                "Karena bola dikembalikan, kedua pengambilan saling bebas dengan \\( P(\\text{merah}) = \\dfrac{4}{10} = 0{,}4 \\). Maka \\( P = 0{,}4 \\times 0{,}4 = 0{,}16 \\).",
            },
          ],
        },
        {
          id: "mw-analisis-data-peluang-permutasi-kombinasi",
          title: "Permutasi & Kombinasi",
          estimatedMinutes: 40,
          materi: {
            ringkasan:
              "Permutasi menghitung banyak susunan dengan MEMPERHATIKAN urutan, sedangkan kombinasi menghitung banyak pilihan TANPA memperhatikan urutan. Aturan perkalian dan penjumlahan menjadi dasar penghitungan keduanya.",
            rumus: [
              "Aturan perkalian: jika ada \\( m \\) cara dan \\( n \\) cara, total \\( m \\times n \\) cara",
              "Notasi faktorial: \\( n! = n \\times (n-1) \\times \\cdots \\times 2 \\times 1 \\), dengan \\( 0! = 1 \\)",
              "Permutasi \\( n \\) dari \\( n \\): \\( P(n,n) = n! \\)",
              "Permutasi \\( r \\) dari \\( n \\): \\( P(n,r) = \\dfrac{n!}{(n-r)!} \\)",
              "Permutasi dengan unsur sama: \\( P = \\dfrac{n!}{n_{1}!\\, n_{2}!\\, \\cdots} \\)",
              "Kombinasi: \\( C(n,r) = \\dbinom{n}{r} = \\dfrac{n!}{r!\\,(n-r)!} \\)",
            ],
            contoh: [
              {
                soal: "Berapa banyak susunan berbeda dari kata 'MATA'?",
                pembahasan:
                  "Total 4 huruf dengan A muncul 2 kali, sehingga \\( P = \\dfrac{4!}{2!} = \\dfrac{24}{2} = 12 \\) susunan.",
              },
              {
                soal:
                  "Dari 8 siswa akan dipilih 3 orang untuk tim lomba. Berapa banyak cara memilih?",
                pembahasan:
                  "Urutan tidak penting, gunakan kombinasi: \\( C(8,3) = \\dfrac{8!}{3!\\,5!} = 56 \\) cara.",
              },
            ],
          },
          flashcards: [
            {
              id: "mw-analisis-data-peluang-permutasi-kombinasi-fc1",
              front: "Kapan memakai permutasi dan kapan kombinasi?",
              back: "Permutasi bila urutan penting (jabatan, susunan, urutan pemenang); kombinasi bila urutan tidak penting (memilih anggota tim, memilih menu).",
            },
            {
              id: "mw-analisis-data-peluang-permutasi-kombinasi-fc2",
              front: "Mengapa \\( 0! = 1 \\)?",
              back: "Agar rumus kombinasi dan permutasi tetap konsisten, khususnya \\( C(n,n) = 1 \\) dan \\( C(n,0) = 1 \\).",
            },
            {
              id: "mw-analisis-data-peluang-permutasi-kombinasi-fc3",
              front: "Rumus permutasi siklis (melingkar)?",
              back: "\\( P_{\\text{siklis}} = (n - 1)! \\) karena satu posisi dapat dianggap sebagai patokan.",
            },
            {
              id: "mw-analisis-data-peluang-permutasi-kombinasi-fc4",
              front: "Hubungan permutasi dan kombinasi?",
              back: "\\( P(n,r) = C(n,r) \\times r! \\), karena setiap kombinasi dapat disusun ulang dalam \\( r! \\) cara.",
            },
          ],
          quiz: [
            {
              id: "mw-analisis-data-peluang-permutasi-kombinasi-q1",
              question: "Nilai dari \\( C(6,2) \\) adalah ...",
              options: ["12", "15", "30", "36"],
              correctIndex: 1,
              explanation: "\\( C(6,2) = \\dfrac{6!}{2!\\,4!} = \\dfrac{30}{2} = 15 \\).",
            },
            {
              id: "mw-analisis-data-peluang-permutasi-kombinasi-q2",
              question: "Berapa banyak susunan berbeda dari kata 'BUKU'?",
              options: ["6", "12", "24", "48"],
              correctIndex: 1,
              explanation: "\\( P = \\dfrac{4!}{2!} = 12 \\), karena huruf U muncul dua kali.",
            },
            {
              id: "mw-analisis-data-peluang-permutasi-kombinasi-q3",
              question:
                "Dari 5 calon akan dipilih ketua dan sekretaris. Banyak susunan pengurus adalah ...",
              options: ["10", "20", "25", "120"],
              correctIndex: 1,
              explanation:
                "Urutan penting karena jabatan berbeda, sehingga \\( P(5,2) = 5 \\times 4 = 20 \\) cara.",
            },
            {
              id: "mw-analisis-data-peluang-permutasi-kombinasi-q4",
              question: "4 orang duduk mengelilingi meja bundar. Banyak cara duduk adalah ...",
              options: ["6", "12", "24", "4"],
              correctIndex: 0,
              explanation: "\\( (4 - 1)! = 3! = 6 \\) cara (permutasi siklis).",
            },
          ],
          latihanSoal: [
            {
              id: "mw-analisis-data-peluang-permutasi-kombinasi-l1",
              level: "hots",
              question:
                "Sebuah panitia beranggotakan 4 orang akan dibentuk dari 6 siswa laki-laki dan 4 siswa perempuan. (a) Berapa banyak panitia yang dapat dibentuk tanpa syarat? (b) Berapa banyak panitia yang terdiri dari tepat 2 laki-laki dan 2 perempuan? (c) Berapa banyak panitia yang memuat paling sedikit 1 perempuan? (d) Jelaskan mengapa jawaban (b) dihitung dengan perkalian, bukan penjumlahan.",
              langkah: [
                "Total siswa \\( = 6 + 4 = 10 \\); memilih 4 tanpa urutan menggunakan kombinasi.",
                "(a) \\( C(10,4) = \\dfrac{10!}{4!\\,6!} = 210 \\) panitia.",
                "(b) Pilih 2 dari 6 laki-laki dan 2 dari 4 perempuan, lalu kalikan keduanya.",
                "\\( C(6,2) = 15 \\) cara dan \\( C(4,2) = 6 \\) cara, sehingga \\( 15 \\times 6 = 90 \\) panitia.",
                "(c) Gunakan komplemen: total dikurangi panitia tanpa perempuan (semua laki-laki).",
                "Panitia semua laki-laki: \\( C(6,4) = 15 \\) cara.",
                "Maka paling sedikit 1 perempuan \\( = 210 - 15 = 195 \\) panitia.",
                "(d) Setiap kombinasi laki-laki (15 cara) harus dipasangkan dengan SETIAP kombinasi perempuan (6 cara), sesuai aturan perkalian.",
                "Periksa rincian: 0 perempuan \\( = 15 \\); 1 perempuan \\( = 4 \\times 20 = 80 \\); 2 perempuan \\( = 90 \\); 3 perempuan \\( = 4 \\times 6 = 24 \\); 4 perempuan \\( = 1 \\). Total \\( = 15 + 80 + 90 + 24 + 1 = 210 \\). Cocok.",
              ],
              jawaban:
                "(a) 210 panitia (b) 90 panitia (c) 195 panitia (d) Karena setiap pilihan laki-laki dipasangkan dengan setiap pilihan perempuan, sehingga digunakan aturan perkalian 15 × 6.",
            },
            {
              id: "mw-analisis-data-peluang-permutasi-kombinasi-l2",
              level: "sulit",
              question:
                "Tiga buku Matematika yang berbeda, dua buku Fisika yang berbeda, dan satu buku Kimia disusun berjajar di rak. (a) Berapa banyak susunan jika semua buku dianggap berbeda? (b) Berapa banyak susunan jika buku dari mata pelajaran yang sama harus berdampingan? (c) Berapa banyak susunan jika hanya ketiga buku Matematika yang harus berdampingan?",
              langkah: [
                "Total buku \\( = 3 + 2 + 1 = 6 \\) buku.",
                "(a) Semua berbeda: \\( 6! = 720 \\) susunan.",
                "(b) Kelompokkan per mata pelajaran sehingga ada 3 blok: Matematika, Fisika, Kimia.",
                "Susunan antarblok: \\( 3! = 6 \\) cara.",
                "Susunan dalam blok: Matematika \\( 3! = 6 \\), Fisika \\( 2! = 2 \\), Kimia \\( 1! = 1 \\).",
                "Total: \\( 6 \\times 6 \\times 2 \\times 1 = 72 \\) susunan.",
                "(c) Anggap ketiga buku Matematika sebagai satu blok, sehingga entitas menjadi 4 (blok Mat, 2 Fisika, 1 Kimia).",
                "Susunan antar entitas: \\( 4! = 24 \\) cara.",
                "Susunan di dalam blok Matematika: \\( 3! = 6 \\) cara.",
                "Total: \\( 24 \\times 6 = 144 \\) susunan.",
                "Periksa kewajaran: hasil (c) 144 lebih kecil dari (a) 720 karena ada batasan, tetapi lebih besar dari (b) 72 karena hanya Matematika yang harus berdampingan.",
              ],
              jawaban: "(a) 720 susunan (b) 72 susunan (c) 144 susunan.",
            },
          ],
          tkaSoal: [
            {
              id: "mw-analisis-data-peluang-permutasi-kombinasi-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Nilai dari \\( C(6,2) \\) adalah ...",
              options: [
                { id: "A", text: "\\( 12 \\)" },
                { id: "B", text: "\\( 15 \\)" },
                { id: "C", text: "\\( 30 \\)" },
                { id: "D", text: "\\( 36 \\)" },
                { id: "E", text: "\\( 720 \\)" },
              ],
              correctIds: ["B"],
              explanation:
                "\\( C(6,2) = \\dfrac{6!}{2!\\,4!} = \\dfrac{6 \\times 5}{2} = 15 \\). Nilai 30 adalah \\( P(6,2) \\) karena urutan diperhatikan.",
            },
            {
              id: "mw-analisis-data-peluang-permutasi-kombinasi-tka2",
              bentuk: "pg",
              level: "L2",
              question: "Berapa banyak susunan berbeda dari kata 'BUKU'?",
              options: [
                { id: "A", text: "\\( 6 \\)" },
                { id: "B", text: "\\( 12 \\)" },
                { id: "C", text: "\\( 24 \\)" },
                { id: "D", text: "\\( 48 \\)" },
                { id: "E", text: "\\( 4 \\)" },
              ],
              correctIds: ["B"],
              explanation:
                "Total 4 huruf dengan huruf U muncul 2 kali, sehingga \\( P = \\dfrac{4!}{2!} = \\dfrac{24}{2} = 12 \\) susunan.",
            },
            {
              id: "mw-analisis-data-peluang-permutasi-kombinasi-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              question:
                "Dari 5 calon akan dipilih ketua dan sekretaris, lalu dari 8 siswa akan dibentuk tim berisi 3 orang. Pilih semua pernyataan yang BENAR. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "Banyak susunan pengurus adalah 20" },
                { id: "B", text: "Banyak tim yang dapat dibentuk adalah 56" },
                { id: "C", text: "Pemilihan pengurus memakai kombinasi" },
                { id: "D", text: "Pemilihan tim memakai kombinasi" },
                { id: "E", text: "Banyak tim yang dapat dibentuk adalah 336" },
              ],
              correctIds: ["A", "B", "D"],
              explanation:
                "Jabatan berbeda sehingga urutan penting: \\( P(5,2) = 5 \\times 4 = 20 \\) (A benar, C salah karena memakai permutasi). Anggota tim tidak berjabatan sehingga urutan tidak penting: \\( C(8,3) = \\dfrac{8 \\times 7 \\times 6}{6} = 56 \\) (B dan D benar). Nilai 336 adalah \\( P(8,3) \\), yang keliru karena menghitung urutan anggota (E salah).",
            },
            {
              id: "mw-analisis-data-peluang-permutasi-kombinasi-tka4",
              bentuk: "isian",
              level: "L2",
              question: "4 orang duduk mengelilingi meja bundar. Berapa banyak cara duduk yang berbeda?",
              correctIds: ["6"],
              explanation:
                "Permutasi siklis: \\( (n - 1)! = 3! = 6 \\) cara. Satu posisi dijadikan patokan sehingga susunan yang hanya berputar tidak dihitung berulang.",
            },
          ],
        },
      ],
    },
    {
      id: "mw-kalkulus-dasar",
      title: "Kalkulus Dasar",
      order: 4,
      subtopics: [
        {
          id: "mw-kalkulus-dasar-limit-aljabar",
          title: "Limit Fungsi Aljabar",
          estimatedMinutes: 60,
          materi: {
            ringkasan:
              "Limit menggambarkan nilai yang didekati suatu fungsi ketika variabelnya mendekati nilai tertentu. Untuk fungsi aljabar, bentuk tak tentu 0/0 diselesaikan dengan pemfaktoran, perkalian sekawan, atau aturan L'Hopital.",
            rumus: [
              "\\( \\lim_{x \\to a} f(x) = L \\) berarti \\( f(x) \\) mendekati \\( L \\) saat \\( x \\) mendekati \\( a \\)",
              "Bentuk tak tentu: \\( \\dfrac{0}{0} \\) dan \\( \\dfrac{\\infty}{\\infty} \\) perlu manipulasi aljabar",
              "Pemfaktoran: \\( \\lim_{x \\to a} \\dfrac{(x-a)g(x)}{(x-a)h(x)} = \\dfrac{g(a)}{h(a)} \\)",
              "Perkalian sekawan: kalikan pembilang dan penyebut dengan \\( \\sqrt{f(x)} + \\sqrt{g(x)} \\) untuk menghilangkan bentuk akar",
              "Limit tak hingga: \\( \\lim_{x \\to \\infty} \\dfrac{ax^{m}}{bx^{n}} \\) bernilai 0 jika \\( m < n \\), \\( \\tfrac{a}{b} \\) jika \\( m = n \\), dan \\( \\infty \\) jika \\( m > n \\)",
            ],
            contoh: [
              {
                soal: "Hitung \\( \\lim_{x \\to 3} \\dfrac{x^{2} - 9}{x - 3} \\).",
                pembahasan:
                  "Faktorkan pembilang: \\( \\dfrac{(x-3)(x+3)}{x-3} = x + 3 \\) untuk \\( x \\ne 3 \\). Substitusi \\( x = 3 \\) memberi \\( 6 \\).",
              },
              {
                soal: "Hitung \\( \\lim_{x \\to 4} \\dfrac{\\sqrt{x} - 2}{x - 4} \\).",
                pembahasan:
                  "Kalikan dengan sekawan: \\( \\dfrac{x-4}{(x-4)(\\sqrt{x}+2)} = \\dfrac{1}{\\sqrt{x}+2} \\). Substitusi \\( x = 4 \\) memberi \\( \\tfrac{1}{4} \\).",
              },
            ],
          },
          flashcards: [
            {
              id: "mw-kalkulus-dasar-limit-aljabar-fc1",
              front: "Tiga cara menyelesaikan bentuk tak tentu 0/0 pada limit?",
              back: "Pemfaktoran, mengalikan dengan bentuk sekawan, dan aturan L'Hopital (turunan pembilang dan penyebut).",
            },
            {
              id: "mw-kalkulus-dasar-limit-aljabar-fc2",
              front: "Kapan aturan L'Hopital boleh dipakai?",
              back: "Hanya pada bentuk tak tentu \\( \\dfrac{0}{0} \\) atau \\( \\dfrac{\\infty}{\\infty} \\); hasilnya \\( \\lim \\dfrac{f'}{g'} \\).",
            },
            {
              id: "mw-kalkulus-dasar-limit-aljabar-fc3",
              front: "Nilai \\( \\lim_{x \\to \\infty} \\dfrac{3x^{2}}{5x^{2} + 1} \\)?",
              back: "\\( \\tfrac{3}{5} \\), karena derajat pembilang sama dengan penyebut sehingga diambil rasio koefisien pangkat tertinggi.",
            },
            {
              id: "mw-kalkulus-dasar-limit-aljabar-fc4",
              front: "Kapan limit fungsi tidak ada?",
              back: "Saat limit kiri berbeda dengan limit kanan, atau saat hasilnya tak hingga/tidak terdefinisi.",
            },
          ],
          quiz: [
            {
              id: "mw-kalkulus-dasar-limit-aljabar-q1",
              question: "Nilai \\( \\lim_{x \\to 2} \\dfrac{x^{2} - 4}{x - 2} \\) adalah ...",
              options: ["0", "2", "4", "Tidak ada"],
              correctIndex: 2,
              explanation: "Faktorkan menjadi \\( x + 2 \\), lalu substitusi \\( x = 2 \\) memberi 4.",
            },
            {
              id: "mw-kalkulus-dasar-limit-aljabar-q2",
              question: "Nilai \\( \\lim_{x \\to \\infty} \\dfrac{2x + 5}{3x^{2} - 1} \\) adalah ...",
              options: ["0", "\\( \\tfrac{2}{3} \\)", "\\( \\infty \\)", "Tidak ada"],
              correctIndex: 0,
              explanation: "Derajat penyebut lebih tinggi daripada pembilang, sehingga limitnya 0.",
            },
            {
              id: "mw-kalkulus-dasar-limit-aljabar-q3",
              question: "Nilai \\( \\lim_{x \\to 1} \\dfrac{x^{2} + 2x - 3}{x - 1} \\) adalah ...",
              options: ["2", "3", "4", "1"],
              correctIndex: 2,
              explanation:
                "Faktorkan: \\( (x - 1)(x + 3) \\), sehingga bentuknya menjadi \\( x + 3 \\) dan substitusi \\( x = 1 \\) memberi 4.",
            },
            {
              id: "mw-kalkulus-dasar-limit-aljabar-q4",
              question: "Nilai \\( \\lim_{x \\to 0} \\dfrac{\\sqrt{x + 9} - 3}{x} \\) adalah ...",
              options: ["\\( \\tfrac{1}{6} \\)", "\\( \\tfrac{1}{3} \\)", "\\( \\tfrac{1}{9} \\)", "0"],
              correctIndex: 0,
              explanation:
                "Kalikan sekawan: \\( \\dfrac{x}{x(\\sqrt{x+9}+3)} = \\dfrac{1}{\\sqrt{x+9}+3} \\); substitusi \\( x = 0 \\) memberi \\( \\tfrac{1}{6} \\).",
            },
          ],
          latihanSoal: [
            {
              id: "mw-kalkulus-dasar-limit-aljabar-l1",
              level: "hots",
              question:
                "Biaya rata-rata produksi \\( n \\) unit barang (dalam ribu rupiah) dimodelkan \\( \\bar{C}(n) = \\dfrac{200 + 5n + 0{,}01n^{2}}{n} \\). (a) Tentukan limit biaya rata-rata saat jumlah produksi sangat besar. (b) Jelaskan makna ekonomi hasil tersebut. (c) Tentukan biaya rata-rata pada produksi 1000 unit dan bandingkan dengan limitnya.",
              langkah: [
                "Tulis ulang fungsi dengan membagi setiap suku: \\( \\bar{C}(n) = \\dfrac{200}{n} + 5 + 0{,}01n \\).",
                "Hitung limit saat \\( n \\to \\infty \\): suku \\( \\dfrac{200}{n} \\to 0 \\), tetapi suku \\( 0{,}01n \\to \\infty \\).",
                "Karena ada suku linear positif, \\( \\lim_{n \\to \\infty} \\bar{C}(n) = \\infty \\) — biaya rata-rata tidak stabil, melainkan terus naik.",
                "Analisis ekonomi: komponen biaya variabel per unit (0,01n) tumbuh tanpa batas, sehingga produksi super besar justru tidak efisien.",
                "Hitung pada \\( n = 1000 \\): \\( \\bar{C}(1000) = 0{,}2 + 5 + 10 = 15{,}2 \\) ribu rupiah.",
                "Cari titik paling efisien: \\( \\dfrac{200}{n} = 0{,}01n \\Rightarrow n^{2} = 20000 \\Rightarrow n \\approx 141 \\); pada titik ini biaya rata-rata minimum \\( \\approx 5 + 2 + 1{,}41 = 8{,}41 \\) ribu rupiah.",
                "Kesimpulan: nilai 15,2 pada 1000 unit jauh lebih besar dari minimum 8,41 sehingga skala besar merugikan.",
              ],
              jawaban:
                "(a) Limitnya \\( \\infty \\) (b) Biaya rata-rata tidak konvergen; menaikkan produksi justru menaikkan biaya per unit (c) \\( \\bar{C}(1000) = 15{,}2 \\) ribu rupiah, sedangkan titik paling efisien sekitar 141 unit dengan biaya \\( \\approx 8{,}41 \\) ribu rupiah.",
            },
            {
              id: "mw-kalkulus-dasar-limit-aljabar-l2",
              level: "sulit",
              question:
                "Diketahui \\( f(x) = \\dfrac{x^{2} - ax - 6}{x - 3} \\) untuk \\( x \\ne 3 \\). Tentukan nilai \\( a \\) agar \\( \\lim_{x \\to 3} f(x) \\) ada, lalu hitung nilai limit tersebut.",
              langkah: [
                "Penyebut bernilai nol saat \\( x = 3 \\), sehingga pembilang juga harus nol di titik itu agar bentuk \\( \\dfrac{0}{0} \\) dapat disederhanakan.",
                "Substitusi \\( x = 3 \\) ke pembilang: \\( 9 - 3a - 6 = 0 \\).",
                "Selesaikan: \\( 3 - 3a = 0 \\Rightarrow a = 1 \\).",
                "Dengan \\( a = 1 \\), pembilang menjadi \\( x^{2} - x - 6 = (x - 3)(x + 2) \\).",
                "Sederhanakan: \\( f(x) = \\dfrac{(x-3)(x+2)}{x-3} = x + 2 \\) untuk \\( x \\ne 3 \\).",
                "Hitung limit: \\( \\lim_{x \\to 3} (x + 2) = 5 \\).",
                "Periksa dengan L'Hopital: \\( \\lim_{x \\to 3} \\dfrac{2x - 1}{1} = 6 - 1 = 5 \\). Cocok.",
              ],
              jawaban: "\\( a = 1 \\) dan \\( \\lim_{x \\to 3} f(x) = 5 \\).",
            },
          ],
          tkaSoal: [
            {
              id: "mw-kalkulus-dasar-limit-aljabar-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Nilai dari \\( \\lim_{x \\to 2} (3x^{2} - 4x + 1) \\) adalah ...",
              options: [
                { id: "A", text: "\\( 3 \\)" },
                { id: "B", text: "\\( 5 \\)" },
                { id: "C", text: "\\( 9 \\)" },
                { id: "D", text: "\\( 12 \\)" },
                { id: "E", text: "\\( 13 \\)" },
              ],
              correctIds: ["B"],
              explanation:
                "Fungsi polinomial kontinu sehingga substitusi langsung sah: \\( 3(4) - 4(2) + 1 = 12 - 8 + 1 = 5 \\).",
            },
            {
              id: "mw-kalkulus-dasar-limit-aljabar-tka2",
              bentuk: "pg",
              level: "L2",
              question: "Nilai dari \\( \\lim_{x \\to 3} \\dfrac{x^{2} - 9}{x - 3} \\) adalah ...",
              options: [
                { id: "A", text: "\\( 0 \\)" },
                { id: "B", text: "\\( 3 \\)" },
                { id: "C", text: "\\( 6 \\)" },
                { id: "D", text: "\\( 9 \\)" },
                { id: "E", text: "Tidak ada" },
              ],
              correctIds: ["C"],
              explanation:
                "Substitusi langsung memberi bentuk tak tentu \\( \\dfrac{0}{0} \\). Faktorkan pembilangnya: \\( \\dfrac{(x-3)(x+3)}{x-3} = x + 3 \\) untuk \\( x \\ne 3 \\), sehingga limitnya \\( 3 + 3 = 6 \\).",
            },
            {
              id: "mw-kalkulus-dasar-limit-aljabar-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              question:
                "Diketahui \\( f(x) = \\dfrac{x^{2} - ax - 6}{x - 3} \\) untuk \\( x \\ne 3 \\). Pilih semua pernyataan yang BENAR. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "\\( \\lim_{x \\to 3} f(x) \\) ada bila pembilang juga nol di \\( x = 3 \\)" },
                { id: "B", text: "Nilai \\( a \\) yang membuat limit ada adalah \\( a = 1 \\)" },
                { id: "C", text: "Untuk \\( a = 1 \\), nilai limitnya adalah 5" },
                { id: "D", text: "Nilai \\( a \\) yang membuat limit ada adalah \\( a = 3 \\)" },
                { id: "E", text: "Limit selalu tidak ada karena penyebutnya nol di \\( x = 3 \\)" },
              ],
              correctIds: ["A", "B", "C"],
              explanation:
                "Penyebut nol di \\( x = 3 \\), jadi pembilang pun harus nol agar bentuk \\( \\dfrac{0}{0} \\) dapat disederhanakan (A benar, E salah). Substitusi \\( 9 - 3a - 6 = 0 \\) memberi \\( 3 - 3a = 0 \\Rightarrow a = 1 \\) (B benar, D salah). Dengan \\( a = 1 \\), \\( f(x) = x + 2 \\) sehingga limitnya \\( 5 \\) (C benar).",
            },
            {
              id: "mw-kalkulus-dasar-limit-aljabar-tka4",
              bentuk: "isian",
              level: "L2",
              question: "Nilai dari \\( \\lim_{x \\to \\infty} \\dfrac{4x^{2} + 3x}{2x^{2} - x + 1} \\) adalah ...",
              correctIds: ["2"],
              explanation:
                "Bagi pembilang dan penyebut dengan \\( x^{2} \\): \\( \\dfrac{4 + \\frac{3}{x}}{2 - \\frac{1}{x} + \\frac{1}{x^{2}}} \\). Semua suku berbentuk \\( \\frac{1}{x} \\) menuju 0, sehingga limitnya \\( \\dfrac{4}{2} = 2 \\).",
            },
          ],
        },
        {
          id: "mw-kalkulus-dasar-turunan-aplikasi",
          title: "Turunan Fungsi Aljabar & Aplikasi Turunan",
          estimatedMinutes: 60,
          materi: {
            ringkasan:
              "Turunan mengukur laju perubahan suatu fungsi terhadap variabelnya. Secara geometris, turunan di satu titik adalah gradien garis singgung di titik tersebut. Aplikasi turunan meliputi penentuan nilai maksimum/minimum, kecepatan, dan gradien garis singgung.",
            rumus: [
              "Definisi: \\( f'(x) = \\lim_{h \\to 0} \\dfrac{f(x+h) - f(x)}{h} \\)",
              "Aturan pangkat: \\( f(x) = ax^{n} \\Rightarrow f'(x) = n \\cdot a x^{n-1} \\)",
              "Aturan perkalian: \\( (uv)' = u'v + uv' \\)",
              "Aturan pembagian: \\( \\left(\\dfrac{u}{v}\\right)' = \\dfrac{u'v - uv'}{v^{2}} \\)",
              "Aturan rantai: \\( \\dfrac{dy}{dx} = \\dfrac{dy}{du} \\cdot \\dfrac{du}{dx} \\)",
              "Titik stasioner: \\( f'(x) = 0 \\); maksimum bila \\( f''(x) < 0 \\), minimum bila \\( f''(x) > 0 \\)",
              "Gradien garis singgung di \\( x = a \\): \\( m = f'(a) \\)",
            ],
            contoh: [
              {
                soal: "Tentukan turunan \\( f(x) = 3x^{4} - 5x^{2} + 7 \\).",
                pembahasan: "Aturan pangkat pada tiap suku: \\( f'(x) = 12x^{3} - 10x \\).",
              },
              {
                soal: "Tentukan titik maksimum lokal \\( f(x) = -x^{2} + 6x - 5 \\).",
                pembahasan:
                  "\\( f'(x) = -2x + 6 = 0 \\Rightarrow x = 3 \\). Karena \\( f''(x) = -2 < 0 \\), titik ini maksimum. Nilai \\( f(3) = 4 \\), jadi titik maksimum \\( (3, 4) \\).",
              },
            ],
          },
          flashcards: [
            {
              id: "mw-kalkulus-dasar-turunan-aplikasi-fc1",
              front: "Apa makna geometris turunan?",
              back: "Gradien garis singgung kurva di titik tersebut, yaitu laju perubahan fungsi terhadap \\( x \\).",
            },
            {
              id: "mw-kalkulus-dasar-turunan-aplikasi-fc2",
              front: "Syarat titik stasioner dan cara menentukan jenisnya?",
              back: "Stasioner saat \\( f'(x) = 0 \\); jenisnya diuji dengan turunan kedua: \\( f'' < 0 \\) maksimum, \\( f'' > 0 \\) minimum.",
            },
            {
              id: "mw-kalkulus-dasar-turunan-aplikasi-fc3",
              front: "Turunan \\( f(x) = \\dfrac{1}{x} \\)?",
              back: "Tulis sebagai \\( x^{-1} \\), sehingga \\( f'(x) = -x^{-2} = -\\dfrac{1}{x^{2}} \\).",
            },
            {
              id: "mw-kalkulus-dasar-turunan-aplikasi-fc4",
              front: "Apa arti \\( f'(x) \\) pada konteks gerak?",
              back: "Turunan fungsi posisi terhadap waktu adalah kecepatan; turunan kecepatan adalah percepatan.",
            },
          ],
          quiz: [
            {
              id: "mw-kalkulus-dasar-turunan-aplikasi-q1",
              question: "Turunan dari \\( f(x) = 2x^{3} - 4x + 1 \\) adalah ...",
              options: [
                "\\( 6x^{2} - 4 \\)",
                "\\( 6x^{2} - 4x \\)",
                "\\( 2x^{2} - 4 \\)",
                "\\( 6x^{3} - 4 \\)",
              ],
              correctIndex: 0,
              explanation:
                "Aturan pangkat: \\( (2x^{3})' = 6x^{2} \\) dan \\( (-4x)' = -4 \\); konstanta 1 menjadi 0.",
            },
            {
              id: "mw-kalkulus-dasar-turunan-aplikasi-q2",
              question:
                "Gradien garis singgung \\( f(x) = x^{2} + 2x \\) di \\( x = 1 \\) adalah ...",
              options: ["2", "3", "4", "5"],
              correctIndex: 2,
              explanation: "\\( f'(x) = 2x + 2 \\), sehingga \\( f'(1) = 4 \\).",
            },
            {
              id: "mw-kalkulus-dasar-turunan-aplikasi-q3",
              question:
                "Fungsi \\( f(x) = x^{3} - 3x^{2} \\) mencapai nilai minimum lokal di \\( x = ... \\)",
              options: ["0", "1", "2", "3"],
              correctIndex: 2,
              explanation:
                "\\( f'(x) = 3x(x - 2) = 0 \\Rightarrow x = 0 \\) atau \\( x = 2 \\). \\( f''(x) = 6x - 6 \\); \\( f''(2) = 6 > 0 \\) sehingga \\( x = 2 \\) adalah minimum lokal.",
            },
            {
              id: "mw-kalkulus-dasar-turunan-aplikasi-q4",
              question: "Turunan dari \\( f(x) = (x^{2} + 1)(x - 3) \\) adalah ...",
              options: [
                "\\( 3x^{2} - 6x + 1 \\)",
                "\\( 2x^{2} - 6x + 1 \\)",
                "\\( 3x^{2} + 1 \\)",
                "\\( x^{2} - 6x \\)",
              ],
              correctIndex: 0,
              explanation:
                "Aturan perkalian: \\( (2x)(x-3) + (x^{2}+1)(1) = 2x^{2} - 6x + x^{2} + 1 = 3x^{2} - 6x + 1 \\).",
            },
          ],
          latihanSoal: [
            {
              id: "mw-kalkulus-dasar-turunan-aplikasi-l1",
              level: "hots",
              question:
                "Sebuah perusahaan memproduksi \\( x \\) unit barang per hari. Biaya total produksi (dalam ribu rupiah) dimodelkan \\( C(x) = x^{2} + 40x + 900 \\) dan harga jual per unit tetap Rp80 ribu. (a) Susun fungsi laba \\( L(x) \\). (b) Tentukan jumlah produksi yang memaksimumkan laba. (c) Hitung laba maksimumnya dan jelaskan mengapa produksi berlebih justru menurunkan laba.",
              langkah: [
                "Pendapatan: \\( R(x) = 80x \\) (harga satuan dikali jumlah unit).",
                "Fungsi laba: \\( L(x) = R(x) - C(x) = 80x - (x^{2} + 40x + 900) = -x^{2} + 40x - 900 \\).",
                "Cari titik stasioner: \\( L'(x) = -2x + 40 = 0 \\Rightarrow x = 20 \\).",
                "Uji turunan kedua: \\( L''(x) = -2 < 0 \\), sehingga \\( x = 20 \\) memberi nilai maksimum.",
                "Hitung laba pada titik itu: \\( L(20) = -400 + 800 - 900 = -500 \\), artinya masih rugi 500 ribu rupiah.",
                "Analisis titik impas: \\( x^{2} - 40x + 900 = 0 \\); diskriminan \\( 1600 - 3600 = -2000 < 0 \\), jadi tidak ada titik impas.",
                "Periksa biaya rata-rata minimum: \\( \\bar{C}(x) = x + 40 + \\dfrac{900}{x} \\); \\( \\bar{C}'(x) = 1 - \\dfrac{900}{x^{2}} = 0 \\Rightarrow x = 30 \\) dengan \\( \\bar{C}(30) = 100 \\) ribu rupiah per unit.",
                "Karena harga jual 80 ribu di bawah biaya minimum 100 ribu, perusahaan rugi berapa pun jumlah produksinya. Produksi berlebih hanya memperbesar kerugian karena suku \\( x^{2} \\) pada biaya tumbuh lebih cepat daripada pendapatan linear.",
              ],
              jawaban:
                "(a) \\( L(x) = -x^{2} + 40x - 900 \\) (b) Produksi 20 unit memberi laba maksimum (c) \\( L(20) = -500 \\) ribu rupiah; perusahaan tetap rugi karena harga jual Rp80 ribu di bawah biaya rata-rata minimum Rp100 ribu per unit.",
            },
            {
              id: "mw-kalkulus-dasar-turunan-aplikasi-l2",
              level: "sulit",
              question:
                "Sebuah kotak tanpa tutup dibuat dari karton persegi 12 cm × 12 cm dengan memotong persegi bersisi \\( x \\) cm di setiap sudut lalu melipat sisi-sisinya. Tentukan nilai \\( x \\) agar volume kotak maksimum, lalu hitung volume maksimum tersebut.",
              langkah: [
                "Setelah sudut dipotong, alas kotak berbentuk persegi dengan sisi \\( (12 - 2x) \\) cm dan tinggi \\( x \\) cm.",
                "Fungsi volume: \\( V(x) = x(12 - 2x)^{2} = x(144 - 48x + 4x^{2}) = 4x^{3} - 48x^{2} + 144x \\).",
                "Batasan domain: \\( 0 < x < 6 \\) agar sisi alas tetap positif.",
                "Cari titik stasioner: \\( V'(x) = 12x^{2} - 96x + 144 = 12(x^{2} - 8x + 12) = 0 \\).",
                "Faktorkan: \\( (x - 2)(x - 6) = 0 \\Rightarrow x = 2 \\) atau \\( x = 6 \\).",
                "Nilai \\( x = 6 \\) berada di batas domain (volume nol), sehingga kandidat kuat adalah \\( x = 2 \\).",
                "Uji turunan kedua: \\( V''(x) = 24x - 96 \\); \\( V''(2) = -48 < 0 \\), jadi \\( x = 2 \\) memberi maksimum.",
                "Hitung volume maksimum: \\( V(2) = 2(12 - 4)^{2} = 2(64) = 128 \\) cm kubik.",
                "Verifikasi dengan nilai tetangga: \\( V(1) = 100 \\) dan \\( V(3) = 108 \\), keduanya lebih kecil dari 128. Terbukti maksimum.",
              ],
              jawaban: "\\( x = 2 \\) cm dengan volume maksimum \\( V(2) = 128 \\) cm kubik.",
            },
          ],
          tkaSoal: [
            {
              id: "mw-kalkulus-dasar-turunan-aplikasi-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Turunan pertama dari \\( f(x) = 3x^{4} - 5x^{2} + 7 \\) adalah ...",
              options: [
                { id: "A", text: "\\( 12x^{3} - 10x \\)" },
                { id: "B", text: "\\( 12x^{3} - 10x + 7 \\)" },
                { id: "C", text: "\\( 3x^{3} - 5x \\)" },
                { id: "D", text: "\\( 12x^{4} - 10x^{2} \\)" },
                { id: "E", text: "\\( 12x^{3} - 5x \\)" },
              ],
              correctIds: ["A"],
              explanation:
                "Turunkan suku demi suku: \\( 4 \\cdot 3x^{3} - 2 \\cdot 5x + 0 = 12x^{3} - 10x \\). Konstanta 7 hilang karena turunan konstanta adalah nol.",
            },
            {
              id: "mw-kalkulus-dasar-turunan-aplikasi-tka2",
              bentuk: "pg",
              level: "L2",
              question:
                "Gradien garis singgung kurva \\( y = x^{3} - 6x^{2} + 9x \\) di titik \\( x = 2 \\) adalah ...",
              options: [
                { id: "A", text: "\\( -3 \\)" },
                { id: "B", text: "\\( -1 \\)" },
                { id: "C", text: "\\( 0 \\)" },
                { id: "D", text: "\\( 2 \\)" },
                { id: "E", text: "\\( 3 \\)" },
              ],
              correctIds: ["A"],
              explanation:
                "\\( y' = 3x^{2} - 12x + 9 \\). Substitusi \\( x = 2 \\): \\( 3(4) - 12(2) + 9 = 12 - 24 + 9 = -3 \\).",
            },
            {
              id: "mw-kalkulus-dasar-turunan-aplikasi-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              question:
                "Sebuah kotak tanpa tutup dibuat dari karton persegi 12 cm × 12 cm dengan memotong persegi bersisi \\( x \\) cm di tiap sudut. Pilih semua pernyataan yang BENAR. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "Fungsi volumenya \\( V(x) = 4x^{3} - 48x^{2} + 144x \\)" },
                { id: "B", text: "Domainnya \\( 0 < x < 6 \\)" },
                { id: "C", text: "Volume maksimum tercapai saat \\( x = 2 \\)" },
                { id: "D", text: "Volume maksimumnya 100 cm kubik" },
                { id: "E", text: "Volume maksimum tercapai saat \\( x = 6 \\)" },
              ],
              correctIds: ["A", "B", "C"],
              explanation:
                "Alas bersisi \\( (12 - 2x) \\) dan tinggi \\( x \\), sehingga \\( V(x) = x(12 - 2x)^{2} = 4x^{3} - 48x^{2} + 144x \\) (A benar). Sisi alas harus positif sehingga \\( 0 < x < 6 \\) (B benar). \\( V'(x) = 12x^{2} - 96x + 144 = 12(x - 2)(x - 6) \\) memberi \\( x = 2 \\) atau \\( x = 6 \\), dan \\( V''(2) = -48 < 0 \\) sehingga \\( x = 2 \\) maksimum (C benar, E salah karena \\( x = 6 \\) memberi volume nol). \\( V(2) = 2(8)^{2} = 128 \\) cm kubik, bukan 100 (D salah).",
            },
            {
              id: "mw-kalkulus-dasar-turunan-aplikasi-tka4",
              bentuk: "isian",
              level: "L2",
              question:
                "Fungsi \\( f(x) = x^{3} - 3x^{2} \\) memiliki titik stasioner di \\( x = 0 \\) dan \\( x = 2 \\). Berapa nilai \\( x \\) yang memberi minimum lokal?",
              correctIds: ["2"],
              explanation:
                "\\( f''(x) = 6x - 6 \\). Di \\( x = 0 \\): \\( f''(0) = -6 < 0 \\) sehingga maksimum lokal. Di \\( x = 2 \\): \\( f''(2) = 6 > 0 \\) sehingga minimum lokal.",
            },
          ],
        },
        {
          id: "mw-kalkulus-dasar-integral-tak-tentu",
          title: "Integral Tak Tentu",
          estimatedMinutes: 50,
          materi: {
            ringkasan:
              "Integral tak tentu adalah operasi kebalikan dari turunan (antiturunan). Hasilnya selalu berupa fungsi ditambah konstanta integrasi C, karena turunan dari sembarang konstanta adalah nol.",
            rumus: [
              "\\( \\int x^{n}\\, dx = \\dfrac{x^{n+1}}{n+1} + C \\) untuk \\( n \\ne -1 \\)",
              "\\( \\int a \\cdot f(x)\\, dx = a \\int f(x)\\, dx \\) (sifat linearitas)",
              "\\( \\int \\left(f(x) \\pm g(x)\\right) dx = \\int f(x)\\,dx \\pm \\int g(x)\\,dx \\)",
              "\\( \\int \\dfrac{1}{x}\\, dx = \\ln |x| + C \\)",
              "\\( \\int k\\, dx = kx + C \\) untuk konstanta \\( k \\)",
              "Verifikasi: \\( \\dfrac{d}{dx}\\left(F(x) + C\\right) = f(x) \\)",
            ],
            contoh: [
              {
                soal: "Tentukan \\( \\int (6x^{2} - 4x + 5)\\, dx \\).",
                pembahasan:
                  "\\( = \\dfrac{6x^{3}}{3} - \\dfrac{4x^{2}}{2} + 5x + C = 2x^{3} - 2x^{2} + 5x + C \\).",
              },
              {
                soal: "Tentukan \\( F(x) \\) jika \\( F'(x) = 4x + 1 \\) dan \\( F(1) = 6 \\).",
                pembahasan:
                  "\\( F(x) = 2x^{2} + x + C \\). Substitusi \\( F(1) = 6 \\): \\( 2 + 1 + C = 6 \\Rightarrow C = 3 \\). Jadi \\( F(x) = 2x^{2} + x + 3 \\).",
              },
            ],
          },
          flashcards: [
            {
              id: "mw-kalkulus-dasar-integral-tak-tentu-fc1",
              front: "Mengapa integral tak tentu selalu memuat + C?",
              back: "Karena turunan setiap konstanta adalah nol, sehingga banyak fungsi berbeda (berbeda konstanta) memiliki turunan yang sama.",
            },
            {
              id: "mw-kalkulus-dasar-integral-tak-tentu-fc2",
              front: "Apakah rumus \\( \\int x^{n}\\,dx \\) berlaku untuk semua \\( n \\)?",
              back: "Tidak. Rumus itu tidak berlaku untuk \\( n = -1 \\); untuk kasus itu digunakan \\( \\int \\dfrac{1}{x}dx = \\ln|x| + C \\).",
            },
            {
              id: "mw-kalkulus-dasar-integral-tak-tentu-fc3",
              front: "Bagaimana memverifikasi hasil integral?",
              back: "Turunkan kembali hasilnya; jika menghasilkan integran awal (fungsi sebelum diintegralkan), maka hasilnya benar.",
            },
            {
              id: "mw-kalkulus-dasar-integral-tak-tentu-fc4",
              front: "Langkah menentukan C bila diketahui satu titik pada grafik?",
              back: "Integralkan untuk memperoleh \\( F(x) + C \\), lalu substitusi nilai \\( x \\) dan \\( F(x) \\) yang diketahui untuk menyelesaikan nilai C.",
            },
          ],
          quiz: [
            {
              id: "mw-kalkulus-dasar-integral-tak-tentu-q1",
              question: "Hasil \\( \\int 3x^{2}\\, dx \\) adalah ...",
              options: ["\\( x^{3} + C \\)", "\\( 6x + C \\)", "\\( 3x^{3} + C \\)", "\\( x^{2} + C \\)"],
              correctIndex: 0,
              explanation: "\\( \\dfrac{3x^{3}}{3} + C = x^{3} + C \\).",
            },
            {
              id: "mw-kalkulus-dasar-integral-tak-tentu-q2",
              question: "Hasil \\( \\int (2x + 3)\\, dx \\) adalah ...",
              options: [
                "\\( x^{2} + 3x + C \\)",
                "\\( 2x^{2} + 3x + C \\)",
                "\\( x^{2} + C \\)",
                "\\( 2 + C \\)",
              ],
              correctIndex: 0,
              explanation: "\\( \\dfrac{2x^{2}}{2} + 3x + C = x^{2} + 3x + C \\).",
            },
            {
              id: "mw-kalkulus-dasar-integral-tak-tentu-q3",
              question: "Jika \\( F'(x) = 6x \\) dan \\( F(0) = 4 \\), maka \\( F(x) = ... \\)",
              options: [
                "\\( 3x^{2} + 4 \\)",
                "\\( 6x^{2} + 4 \\)",
                "\\( 3x^{2} \\)",
                "\\( x^{2} + 4 \\)",
              ],
              correctIndex: 0,
              explanation:
                "\\( F(x) = 3x^{2} + C \\); dari \\( F(0) = 4 \\) diperoleh \\( C = 4 \\), jadi \\( F(x) = 3x^{2} + 4 \\).",
            },
            {
              id: "mw-kalkulus-dasar-integral-tak-tentu-q4",
              question: "Hasil \\( \\int \\left(4x^{3} - 6x\\right) dx \\) adalah ...",
              options: [
                "\\( x^{4} - 3x^{2} + C \\)",
                "\\( 12x^{2} - 6 + C \\)",
                "\\( 4x^{4} - 3x^{2} + C \\)",
                "\\( x^{4} - 6x^{2} + C \\)",
              ],
              correctIndex: 0,
              explanation:
                "\\( \\dfrac{4x^{4}}{4} - \\dfrac{6x^{2}}{2} + C = x^{4} - 3x^{2} + C \\).",
            },
          ],
          latihanSoal: [
            {
              id: "mw-kalkulus-dasar-integral-tak-tentu-l1",
              level: "hots",
              question:
                "Laju perubahan jumlah pengguna sebuah aplikasi (dalam ratus orang per minggu) dimodelkan \\( U'(t) = 12t - 3t^{2} \\). Pada minggu pertama (\\( t = 1 \\)) terdapat 200 pengguna atau \\( U(1) = 2 \\) ratus. (a) Tentukan fungsi \\( U(t) \\). (b) Berapa pengguna pada minggu ke-4? (c) Tentukan kapan jumlah pengguna mencapai puncak dan jelaskan mengapa setelah itu jumlahnya menurun.",
              langkah: [
                "Integralkan laju perubahan: \\( U(t) = \\int (12t - 3t^{2})\\,dt = 6t^{2} - t^{3} + C \\).",
                "Gunakan kondisi awal \\( U(1) = 2 \\): \\( 6(1) - 1 + C = 2 \\Rightarrow 5 + C = 2 \\Rightarrow C = -3 \\).",
                "Fungsi jumlah pengguna: \\( U(t) = 6t^{2} - t^{3} - 3 \\) ratus orang.",
                "Hitung minggu ke-4: \\( U(4) = 6(16) - 64 - 3 = 96 - 64 - 3 = 29 \\) ratus atau 2900 pengguna.",
                "Cari titik puncak: \\( U'(t) = 12t - 3t^{2} = 3t(4 - t) = 0 \\Rightarrow t = 0 \\) atau \\( t = 4 \\).",
                "Uji turunan kedua: \\( U''(t) = 12 - 6t \\); \\( U''(4) = -12 < 0 \\), sehingga \\( t = 4 \\) adalah maksimum.",
                "Nilai maksimum \\( U(4) = 29 \\) ratus pengguna — konsisten dengan langkah 4 karena minggu ke-4 tepat di titik puncak.",
                "Setelah \\( t = 4 \\), laju \\( U'(t) = 3t(4 - t) \\) menjadi negatif karena \\( 4 - t < 0 \\), artinya jumlah pengguna mulai berkurang.",
                "Interpretasi: promosi awal menarik banyak pengguna, tetapi setelah minggu ke-4 pertumbuhan berbalik menurun (pengguna jenuh atau berhenti).",
              ],
              jawaban:
                "(a) \\( U(t) = 6t^{2} - t^{3} - 3 \\) ratus orang (b) \\( U(4) = 29 \\) ratus atau 2900 pengguna (c) Puncak pada \\( t = 4 \\) minggu; setelahnya \\( U'(t) \\) negatif sehingga pengguna menurun.",
            },
            {
              id: "mw-kalkulus-dasar-integral-tak-tentu-l2",
              level: "sulit",
              question:
                "Diketahui \\( f'(x) = 3x^{2} - 8x \\) dan grafik \\( f \\) melalui titik \\( (2, 1) \\). (a) Tentukan \\( f(x) \\). (b) Tentukan titik stasioner \\( f \\) dan jenisnya. (c) Tentukan persamaan garis singgung di \\( x = 3 \\). (d) Jelaskan hubungan antara integral dan turunan dalam penyelesaian ini.",
              langkah: [
                "Integralkan: \\( f(x) = \\int (3x^{2} - 8x)\\,dx = x^{3} - 4x^{2} + C \\).",
                "Gunakan titik \\( (2, 1) \\): \\( 8 - 16 + C = 1 \\Rightarrow C = 9 \\).",
                "Diperoleh \\( f(x) = x^{3} - 4x^{2} + 9 \\).",
                "Titik stasioner: \\( f'(x) = 3x^{2} - 8x = x(3x - 8) = 0 \\Rightarrow x = 0 \\) atau \\( x = \\tfrac{8}{3} \\).",
                "Uji \\( f''(x) = 6x - 8 \\): \\( f''(0) = -8 < 0 \\), sehingga \\( x = 0 \\) adalah maksimum lokal.",
                "Uji \\( x = \\tfrac{8}{3} \\): \\( f''\\left(\\tfrac{8}{3}\\right) = 8 > 0 \\), sehingga titik itu minimum lokal.",
                "Garis singgung di \\( x = 3 \\): gradien \\( m = f'(3) = 27 - 24 = 3 \\).",
                "Nilai \\( f(3) = 27 - 36 + 9 = 0 \\), sehingga \\( y - 0 = 3(x - 3) \\), yaitu \\( y = 3x - 9 \\).",
                "Hubungan integral-turunan: \\( f' \\) diperoleh dengan menurunkan \\( f \\), sehingga untuk kembali dari \\( f' \\) ke \\( f \\) dipakai antiturunan, dan konstanta \\( C \\) ditentukan dari satu titik pada grafik.",
              ],
              jawaban:
                "(a) \\( f(x) = x^{3} - 4x^{2} + 9 \\) (b) \\( x = 0 \\) maksimum lokal, \\( x = \\tfrac{8}{3} \\) minimum lokal (c) \\( y = 3x - 9 \\) (d) Integral adalah kebalikan turunan; konstanta C ditentukan dari titik pada grafik.",
            },
          ],
          tkaSoal: [
            {
              id: "mw-kalkulus-dasar-integral-tak-tentu-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Hasil dari \\( \\int 6x^{2}\\,dx \\) adalah ...",
              options: [
                { id: "A", text: "\\( 2x^{3} + C \\)" },
                { id: "B", text: "\\( 12x + C \\)" },
                { id: "C", text: "\\( 6x^{3} + C \\)" },
                { id: "D", text: "\\( 3x^{2} + C \\)" },
                { id: "E", text: "\\( 18x^{3} + C \\)" },
              ],
              correctIds: ["A"],
              explanation:
                "\\( \\int 6x^{2}\\,dx = \\dfrac{6}{3}x^{3} + C = 2x^{3} + C \\). Jangan lupa menambahkan konstanta integrasi C.",
            },
            {
              id: "mw-kalkulus-dasar-integral-tak-tentu-tka2",
              bentuk: "pg",
              level: "L2",
              question: "Hasil dari \\( \\int (4x - 3)\\,dx \\) adalah ...",
              options: [
                { id: "A", text: "\\( 4x^{2} - 3x + C \\)" },
                { id: "B", text: "\\( 2x^{2} - 3x + C \\)" },
                { id: "C", text: "\\( 2x^{2} - 3 + C \\)" },
                { id: "D", text: "\\( 4 - 3x + C \\)" },
                { id: "E", text: "\\( 2x^{2} + 3x + C \\)" },
              ],
              correctIds: ["B"],
              explanation:
                "Integralkan suku demi suku: \\( \\int 4x\\,dx = 2x^{2} \\) dan \\( \\int 3\\,dx = 3x \\), sehingga hasilnya \\( 2x^{2} - 3x + C \\).",
            },
            {
              id: "mw-kalkulus-dasar-integral-tak-tentu-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              question:
                "Diketahui \\( f'(x) = 3x^{2} - 8x \\) dan grafik \\( f \\) melalui titik \\( (2, 1) \\). Pilih semua pernyataan yang BENAR. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "\\( f(x) = x^{3} - 4x^{2} + 9 \\)" },
                { id: "B", text: "\\( x = 0 \\) adalah titik maksimum lokal" },
                { id: "C", text: "\\( x = \\dfrac{8}{3} \\) adalah titik minimum lokal" },
                { id: "D", text: "Konstanta integrasinya bernilai 1" },
                { id: "E", text: "Garis singgung di \\( x = 3 \\) bergradien 0" },
              ],
              correctIds: ["A", "B", "C"],
              explanation:
                "\\( f(x) = x^{3} - 4x^{2} + C \\); dari \\( f(2) = 1 \\) diperoleh \\( 8 - 16 + C = 1 \\Rightarrow C = 9 \\) sehingga \\( f(x) = x^{3} - 4x^{2} + 9 \\) (A benar, D salah). \\( f''(x) = 6x - 8 \\): \\( f''(0) = -8 < 0 \\) maksimum lokal, \\( f''(8/3) = 8 > 0 \\) minimum lokal (B dan C benar). Gradien di \\( x = 3 \\) adalah \\( f'(3) = 27 - 24 = 3 \\), bukan 0 (E salah).",
            },
            {
              id: "mw-kalkulus-dasar-integral-tak-tentu-tka4",
              bentuk: "isian",
              level: "L2",
              question:
                "Diketahui \\( f'(x) = 2x + 1 \\) dan \\( f(1) = 5 \\). Berapa nilai konstanta integrasi \\( C \\)?",
              correctIds: ["3"],
              explanation:
                "\\( f(x) = x^{2} + x + C \\). Dari \\( f(1) = 5 \\): \\( 1 + 1 + C = 5 \\Rightarrow C = 3 \\), sehingga \\( f(x) = x^{2} + x + 3 \\).",
            },
          ],
        },
      ],
    },
  ],
};

/* ==================================================================
 * 2. BAHASA INDONESIA
 * ================================================================*/

const BAHASA_INDONESIA: Subject = {
  id: "bahasa-indonesia",
  title: "Bahasa Indonesia",
  shortTitle: "B. Indonesia",
  icon: "📖",
  accent: "rose",
  description: "Literasi baca-tulis dan ketelitian berbahasa.",
  chapters: [
    {
      id: "bi-membaca-teks",
      title: "Membaca & Memahami Teks",
      order: 1,
      subtopics: [
        {
          id: "bi-membaca-teks-gagasan-utama",
          title: "Gagasan Utama & Ide Pokok",
          estimatedMinutes: 40,
          materi: {
            ringkasan:
              "Gagasan utama adalah inti pembicaraan sebuah paragraf, sedangkan ide pokok adalah rumusan singkatnya yang biasanya terletak pada kalimat utama. Kalimat utama umumnya berada di awal paragraf (deduktif), di akhir paragraf (induktif), atau di awal dan akhir sekaligus (campuran).",
            rumus: [
              "Kalimat utama = kalimat yang memuat ide pokok dan dijelaskan kalimat lain",
              "Kalimat penjelas = kalimat yang menguraikan, memberi contoh, atau mendukung kalimat utama",
              "Pola deduktif: kalimat utama di awal; induktif: di akhir; campuran: di awal dan akhir",
              "Ciri ide pokok: bersifat umum, mencakup seluruh isi paragraf, dan tidak berupa contoh atau angka rinci",
              "Penanda kesimpulan: 'pada dasarnya', 'oleh karena itu', 'dengan demikian', 'jadi', 'simpulannya'",
            ],
            contoh: [
              {
                soal:
                  "Tentukan ide pokok paragraf: 'Sampah plastik menjadi masalah besar bagi lingkungan. Plastik membutuhkan ratusan tahun untuk terurai. Selain itu, mikroplastik hasil uraiannya mencemari laut dan masuk ke rantai makanan.'",
                pembahasan:
                  "Kalimat pertama memuat topik umum, sedangkan dua kalimat lainnya adalah penjelas. Gagasan utama terletak di awal paragraf (deduktif), yaitu sampah plastik menjadi masalah besar bagi lingkungan.",
              },
            ],
          },
          flashcards: [
            {
              id: "bi-membaca-teks-gagasan-utama-fc1",
              front: "Jenis paragraf jika kalimat utama terletak di akhir?",
              back: "Paragraf induktif — pembaca diberi contoh/paparan dulu, lalu disimpulkan di akhir.",
            },
            {
              id: "bi-membaca-teks-gagasan-utama-fc2",
              front: "Bagaimana cara cepat menemukan gagasan utama?",
              back: "Cari kalimat yang paling umum dan dijelaskan kalimat lain; kalimat utama biasanya tidak memuat data rinci, contoh, atau angka spesifik.",
            },
            {
              id: "bi-membaca-teks-gagasan-utama-fc3",
              front: "Apa perbedaan topik dan gagasan utama?",
              back: "Topik adalah pokok persoalan yang dibahas (biasanya berupa frasa), gagasan utama adalah pernyataan lengkap tentang topik tersebut.",
            },
            {
              id: "bi-membaca-teks-gagasan-utama-fc4",
              front: "Ciri kalimat penjelas?",
              back: "Isinya lebih khusus, sering memuat contoh, data, atau alasan, dan tidak dapat berdiri sendiri sebagai inti paragraf.",
            },
          ],
          quiz: [
            {
              id: "bi-membaca-teks-gagasan-utama-q1",
              question:
                "Ide pokok paragraf yang kalimat utamanya berada di awal dan diulang di akhir disebut pola ...",
              options: ["Deduktif", "Induktif", "Campuran", "Naratif"],
              correctIndex: 2,
              explanation:
                "Pola campuran menempatkan kalimat utama di awal dan menegaskan kembali kesimpulan di akhir paragraf.",
            },
            {
              id: "bi-membaca-teks-gagasan-utama-q2",
              question:
                "Bacalah: 'Olahraga rutin memberi banyak manfaat. Jantung menjadi lebih sehat, berat badan terkontrol, dan stres berkurang.' Ide pokok paragraf tersebut adalah ...",
              options: [
                "Olahraga rutin memberi banyak manfaat",
                "Jantung menjadi lebih sehat",
                "Berat badan terkontrol",
                "Stres berkurang",
              ],
              correctIndex: 0,
              explanation:
                "Tiga kalimat berikutnya hanya penjelas dari pernyataan umum di awal tentang manfaat olahraga rutin.",
            },
            {
              id: "bi-membaca-teks-gagasan-utama-q3",
              question: "Manakah yang BUKAN ciri kalimat utama?",
              options: [
                "Bersifat umum",
                "Mencakup seluruh isi paragraf",
                "Memuat data angka yang sangat rinci",
                "Dijelaskan kalimat lain",
              ],
              correctIndex: 2,
              explanation:
                "Data rinci adalah ciri kalimat penjelas, bukan kalimat utama yang seharusnya bersifat umum.",
            },
            {
              id: "bi-membaca-teks-gagasan-utama-q4",
              question:
                "Kata penanda yang sering mengawali kalimat kesimpulan pada paragraf induktif adalah ...",
              options: ["Dengan demikian", "Pertama-tama", "Sebagai contoh", "Misalnya"],
              correctIndex: 0,
              explanation:
                "'Dengan demikian' menandai kesimpulan yang khas pada paragraf induktif; 'misalnya' dan 'sebagai contoh' menandai kalimat penjelas.",
            },
          ],
          latihanSoal: [
            {
              id: "bi-membaca-teks-gagasan-utama-l1",
              level: "hots",
              question:
                "Bacalah paragraf: '(1) Literasi digital bukan sekadar kemampuan mengoperasikan gawai. (2) Literasi ini mencakup kemampuan menyaring informasi, memverifikasi sumber, dan menimbang dampak sebelum membagikan konten. (3) Survei sebuah lembaga riset pada 2023 menunjukkan 68% responden pernah membagikan informasi tanpa memeriksa kebenarannya. (4) Akibatnya, hoaks menyebar cepat dan menimbulkan kepanikan di masyarakat. (5) Oleh karena itu, penguatan literasi digital perlu dimulai sejak bangku sekolah.' (a) Tentukan kalimat utama paragraf itu. (b) Sebutkan pola pengembangannya. (c) Tentukan gagasan utamanya. (d) Jika kalimat (3) dihapus, apakah gagasan utama berubah? Jelaskan.",
              langkah: [
                "Identifikasi kalimat paling umum: kalimat (1) menyatakan topik besar (literasi digital), kalimat (5) menyimpulkan perlunya penguatan.",
                "Periksa kalimat (2): memerinci cakupan literasi digital sehingga bersifat penjelas terhadap kalimat (1).",
                "Periksa kalimat (3): memuat data survei 68% — ciri kalimat penjelas dengan data kuantitatif.",
                "Periksa kalimat (4): menyatakan akibat — fungsi penjelas yang mendukung argumen.",
                "Kalimat utama ada di (1) sebagai pembuka dan (5) sebagai penegas penutup, sehingga pola paragraf adalah campuran.",
                "Rumuskan gagasan utama: literasi digital adalah kemampuan menyaring dan memverifikasi informasi, bukan sekadar mengoperasikan gawai, sehingga perlu diperkuat sejak sekolah.",
                "Uji penghapusan kalimat (3): data survei hanya memperkuat argumen; tanpa data itu, kalimat (1), (2), (4), dan (5) tetap koheren.",
                "Kesimpulan: gagasan utama tidak berubah karena kalimat (3) berfungsi sebagai bukti pendukung, bukan inti pembicaraan.",
              ],
              jawaban:
                "(a) Kalimat utama ada di (1) dan (5) (b) Pola campuran deduktif-induktif (c) Literasi digital bukan sekadar mengoperasikan gawai, melainkan kemampuan menyaring dan memverifikasi informasi, sehingga perlu diperkuat sejak sekolah (d) Tidak berubah, karena kalimat (3) hanya bukti pendukung berupa data survei.",
            },
            {
              id: "bi-membaca-teks-gagasan-utama-l2",
              level: "sulit",
              question:
                "Perhatikan paragraf: '(1) Pemerintah mendorong penggunaan kendaraan listrik untuk menekan emisi. (2) Namun, harga kendaraan listrik masih tinggi. (3) Stasiun pengisian daya juga belum merata di daerah. (4) Selain itu, kapasitas jaringan listrik di beberapa wilayah belum siap. (5) Padahal, tanpa dukungan infrastruktur, target penurunan emisi sulit tercapai.' (a) Tentukan jenis paragraf dan letak kalimat utamanya. (b) Rumuskan gagasan utamanya. (c) Jelaskan fungsi kata 'Namun' dan 'Padahal' dalam paragraf itu.",
              langkah: [
                "Amati kalimat (1): memuat kebijakan pemerintah sebagai topik pembuka, tetapi belum menjadi inti keseluruhan paragraf.",
                "Periksa kalimat (2), (3), dan (4): ketiganya memaparkan hambatan berupa harga, infrastruktur pengisian, dan kesiapan jaringan listrik.",
                "Periksa kalimat (5): memuat kata 'Padahal' yang menandai kesimpulan kontras — inilah puncak gagasan paragraf.",
                "Karena kalimat utama berada di akhir, paragraf berpola induktif.",
                "Rumuskan gagasan utama: target penurunan emisi melalui kendaraan listrik sulit tercapai tanpa dukungan infrastruktur yang memadai.",
                "Analisis fungsi 'Namun': konjungsi pertentangan yang menandai pergeseran dari harapan atau kebijakan menuju kenyataan hambatan.",
                "Analisis fungsi 'Padahal': konjungsi penanda kontras logis yang memperkuat kesimpulan karena menunjukkan syarat utama belum terpenuhi.",
                "Kesimpulan: kedua konjungsi bekerja berpasangan membangun argumen kontra-ekspektasi, khas paragraf induktif yang berakhir dengan simpulan.",
              ],
              jawaban:
                "(a) Paragraf induktif dengan kalimat utama di akhir, yaitu kalimat (5) (b) Target penurunan emisi melalui kendaraan listrik sulit tercapai tanpa dukungan infrastruktur (c) 'Namun' menandai pertentangan dari kebijakan ke hambatan; 'Padahal' memperkuat kesimpulan kontras bahwa syarat utamanya belum terpenuhi.",
            },
          ],
          tkaSoal: [
            {
              id: "bi-membaca-teks-gagasan-utama-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Gagasan utama sebuah paragraf adalah ...",
              options: [
                { id: "A", text: "kalimat terpanjang dalam paragraf" },
                { id: "B", text: "inti pembicaraan yang mendasari seluruh paragraf" },
                { id: "C", text: "kalimat yang memuat contoh atau data" },
                { id: "D", text: "kalimat pertama paragraf, apa pun isinya" },
                { id: "E", text: "kalimat yang memuat kata penghubung" },
              ],
              correctIds: ["B"],
              explanation:
                "Gagasan utama adalah inti pembicaraan yang menjiwai seluruh paragraf. Panjang kalimat, posisi, atau keberadaan konjungsi bukan penanda utamanya, karena paragraf dapat berpola deduktif maupun induktif.",
            },
            {
              id: "bi-membaca-teks-gagasan-utama-tka2",
              bentuk: "pg",
              level: "L2",
              stimulus:
                "Bacalah paragraf berikut! (1) Pemerintah mendorong percepatan kendaraan listrik. (2) Insentif telah diberikan kepada produsen maupun pembeli. (3) Namun, jumlah stasiun pengisian daya masih jauh dari kebutuhan. (4) Padahal, tanpa infrastruktur yang memadai, pengguna akan enggan beralih.",
              question: "Gagasan utama paragraf tersebut adalah ...",
              options: [
                { id: "A", text: "besarnya insentif kendaraan listrik dari pemerintah" },
                { id: "B", text: "jumlah produsen kendaraan listrik yang bertambah" },
                { id: "C", text: "target percepatan kendaraan listrik sulit tercapai tanpa infrastruktur memadai" },
                { id: "D", text: "harga kendaraan listrik yang semakin murah" },
                { id: "E", text: "minat masyarakat terhadap kendaraan listrik" },
              ],
              correctIds: ["C"],
              explanation:
                "Paragraf berpola induktif: kalimat (1) dan (2) berisi latar, kalimat (3) memuat hambatan, dan kalimat (4) yang ditandai 'Padahal' menjadi puncak simpulan. Jadi gagasan utamanya adalah sulitnya target tercapai tanpa infrastruktur memadai.",
            },
            {
              id: "bi-membaca-teks-gagasan-utama-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              stimulus:
                "Bacalah paragraf berikut! (1) Literasi digital bukan sekadar kemampuan mengoperasikan gawai. (2) Literasi ini mencakup kemampuan menyaring informasi, memverifikasi sumber, dan menimbang dampak sebelum membagikan konten. (3) Survei sebuah lembaga riset pada 2023 menunjukkan 68% responden pernah membagikan informasi tanpa memeriksa kebenarannya. (4) Akibatnya, hoaks menyebar cepat dan menimbulkan kepanikan. (5) Oleh karena itu, penguatan literasi digital perlu dimulai sejak bangku sekolah.",
              question:
                "Pilih semua pernyataan yang BENAR tentang paragraf tersebut. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "Kalimat utama paragraf itu adalah kalimat (1)" },
                { id: "B", text: "Paragraf tersebut berpola deduktif" },
                { id: "C", text: "Kalimat (3) berfungsi sebagai bukti pendukung" },
                { id: "D", text: "Gagasan utamanya adalah penguatan literasi digital perlu dimulai sejak sekolah" },
                { id: "E", text: "Kalimat (4) adalah kalimat utama karena memuat kata 'Akibatnya'" },
              ],
              correctIds: ["A", "B", "C", "D"],
              explanation:
                "Kalimat (1) menyatakan gagasan umum yang kemudian diuraikan (A benar) dan posisinya di awal menandai pola deduktif (B benar). Data 68% pada kalimat (3) berfungsi sebagai bukti (C benar). Simpulan sebagai gagasan utama paragraf adalah perlunya literasi digital dimulai sejak sekolah (D benar, lihat kalimat (5)). Kalimat (4) hanya menyatakan akibat, bukan inti pembicaraan (E salah).",
            },
            {
              id: "bi-membaca-teks-gagasan-utama-tka4",
              bentuk: "isian",
              level: "L2",
              stimulus:
                "Bacalah paragraf berikut! Literasi digital bukan sekadar kemampuan mengoperasikan gawai. Literasi ini mencakup kemampuan menyaring informasi, memverifikasi sumber, dan menimbang dampak sebelum membagikan konten. Survei sebuah lembaga riset pada 2023 menunjukkan 68% responden pernah membagikan informasi tanpa memeriksa kebenarannya. Akibatnya, hoaks menyebar cepat dan menimbulkan kepanikan di masyarakat. Oleh karena itu, penguatan literasi digital perlu dimulai sejak bangku sekolah.",
              question:
                "Jika kalimat ketiga paragraf tersebut dihapus, apakah gagasan utamanya berubah? Jawab dengan satu kata: ya atau tidak.",
              correctIds: ["tidak"],
              explanation:
                "Kalimat ketiga hanya menyediakan data pendukung. Simpulan pada kalimat terakhir tetap berdiri karena alasan utamanya sudah dinyatakan pada kalimat kedua dan keempat. Jadi gagasan utamanya tidak berubah.",
            },
          ],
        },
        {
          id: "bi-membaca-teks-makna-kata-kontekstual",
          title: "Makna Kata/Istilah Kontekstual",
          estimatedMinutes: 40,
          materi: {
            ringkasan:
              "Makna kontekstual adalah makna kata yang ditentukan oleh pemakaiannya dalam kalimat atau paragraf, bukan makna leksikal (kamus). Kata yang sama dapat bergeser makna, berubah kelas, atau bernilai rasa berbeda bergantung konteks di sekitarnya.",
            rumus: [
              "Makna leksikal: makna tetap sesuai kamus; makna kontekstual: makna sesuai pemakaian",
              "Perubahan makna: meluas (generalisasi), menyempit (spesialisasi), ameliorasi (lebih halus), peyorasi (lebih kasar)",
              "Denotasi = makna sebenarnya; konotasi = makna tambahan/rasa",
              "Sinonim: kata bermakna sama; antonim: kata bermakna berlawanan",
              "Strategi menjawab: ganti kata dengan pilihan jawaban, lalu uji apakah makna kalimat tetap sepadan",
            ],
            contoh: [
              {
                soal:
                  "Tentukan makna kata 'kepala' pada kalimat 'Ia menjabat sebagai kepala bagian keuangan.'",
                pembahasan:
                  "Makna leksikal 'kepala' adalah bagian tubuh, tetapi dalam konteks ini bermakna pemimpin — contoh perubahan makna menyempit (spesialisasi).",
              },
              {
                soal:
                  "Jelaskan perbedaan makna 'bunga' pada 'bunga mawar' dan 'bunga pinjaman'.",
                pembahasan:
                  "'Bunga mawar' bermakna denotatif (bagian tumbuhan), sedangkan 'bunga pinjaman' bermakna tambahan biaya atas utang — makna kontekstual yang berbeda jauh dari makna asalnya.",
              },
            ],
          },
          flashcards: [
            {
              id: "bi-membaca-teks-makna-kata-kontekstual-fc1",
              front: "Apa beda denotasi dan konotasi?",
              back: "Denotasi adalah makna sebenarnya yang objektif; konotasi adalah makna tambahan yang mengandung rasa, sikap, atau asosiasi.",
            },
            {
              id: "bi-membaca-teks-makna-kata-kontekstual-fc2",
              front: "Apa itu ameliorasi dan peyorasi?",
              back: "Ameliorasi: makna bergeser menjadi lebih halus/positif. Peyorasi: makna bergeser menjadi lebih kasar/negatif.",
            },
            {
              id: "bi-membaca-teks-makna-kata-kontekstual-fc3",
              front: "Langkah praktis menentukan makna kontekstual?",
              back: "Baca kalimat utuh, temukan kata kunci di sekitarnya, lalu uji dengan mengganti kata tersebut memakai pilihan jawaban.",
            },
            {
              id: "bi-membaca-teks-makna-kata-kontekstual-fc4",
              front: "Apa itu generalisasi dan spesialisasi makna?",
              back: "Generalisasi: cakupan makna meluas. Spesialisasi: cakupan makna menyempit, seperti 'kepala' yang khusus berarti pemimpin.",
            },
          ],
          quiz: [
            {
              id: "bi-membaca-teks-makna-kata-kontekstual-q1",
              question:
                "Makna kata 'menggarap' dalam kalimat 'Sutradara itu menggarap film dokumenter terbaru.' adalah ...",
              options: [
                "Mengolah tanah pertanian",
                "Mengerjakan atau memproduksi karya",
                "Membeli hak cipta",
                "Menyimpan berkas",
              ],
              correctIndex: 1,
              explanation:
                "Konteks 'sutradara' dan 'film' menggeser makna menjadi mengerjakan atau memproduksi karya, bukan mengolah tanah.",
            },
            {
              id: "bi-membaca-teks-makna-kata-kontekstual-q2",
              question: "Kata 'tajam' pada 'kritik yang tajam' bermakna ...",
              options: ["Bermata pisau", "Menyakitkan hati", "Pedas dan mendalam", "Mengkilap"],
              correctIndex: 2,
              explanation:
                "Dalam konteks kritik, 'tajam' bermakna konotatif: pedas, telak, dan mendalam analisisnya.",
            },
            {
              id: "bi-membaca-teks-makna-kata-kontekstual-q3",
              question:
                "Perubahan makna dari kata yang dahulu kasar menjadi lebih halus disebut ...",
              options: ["Peyorasi", "Ameliorasi", "Generalisasi", "Asosiasi"],
              correctIndex: 1,
              explanation:
                "Ameliorasi adalah pergeseran makna ke arah yang lebih halus atau lebih positif.",
            },
            {
              id: "bi-membaca-teks-makna-kata-kontekstual-q4",
              question: "Pasangan kata berikut yang berhubungan antonim adalah ...",
              options: [
                "Meningkat — bertambah",
                "Stabil — mantap",
                "Fluktuatif — konstan",
                "Signifikan — berarti",
              ],
              correctIndex: 2,
              explanation:
                "Fluktuatif (berubah-ubah) berlawanan makna dengan konstan (tetap), sedangkan pasangan lain bersinonim.",
            },
          ],
          latihanSoal: [
            {
              id: "bi-membaca-teks-makna-kata-kontekstual-l1",
              level: "hots",
              question:
                "Perhatikan kalimat: (1) 'Laporan itu menyoroti celah kebijakan yang membuat bantuan tidak tepat sasaran.' (2) 'Pemerintah berdalih bahwa data penerima masih dalam proses pemutakhiran.' (3) 'Namun, akar masalahnya justru lemahnya verifikasi lapangan.' (a) Tentukan makna kata 'celah' pada kalimat (1). (b) Tentukan makna kata 'berdalih' pada kalimat (2) dan jelaskan nilai rasanya. (c) Tentukan makna kata 'akar' pada kalimat (3). (d) Jelaskan mengapa kata 'berdalih' memberi efek berbeda dibanding kata 'menjelaskan'.",
              langkah: [
                "Analisis kata 'celah': objeknya adalah 'kebijakan', sehingga maknanya bukan celah fisik melainkan kekurangan atau titik lemah.",
                "Analisis kata 'berdalih': bandingkan dengan kata netral 'menjelaskan' atau 'berargumen'.",
                "Kata 'berdalih' mengandung konotasi negatif, yaitu memberi alasan yang cenderung dicari-cari untuk membela diri.",
                "Analisis kata 'akar' pada 'akar masalahnya': makna kontekstualnya adalah sumber, penyebab utama, atau pokok persoalan.",
                "Bandingkan efek: 'menjelaskan' bersifat netral dan tidak menilai, sedangkan 'berdalih' menyiratkan penulis menilai alasan itu lemah.",
                "Simpulkan: pemilihan kata bernilai rasa menjadi cara penulis menyampaikan sikap secara implisit tanpa pernyataan penilaian langsung.",
                "Periksa konsistensi: ketiga kata membuktikan makna kontekstual bergantung pada kata pasangan di sekitarnya.",
              ],
              jawaban:
                "(a) Celah = kekurangan atau titik lemah kebijakan (b) Berdalih = mengemukakan alasan untuk membela diri, bernilai rasa negatif (c) Akar = sumber atau penyebab utama (d) Karena 'berdalih' menyiratkan penilaian bahwa alasan itu dicari-cari, sementara 'menjelaskan' bersifat netral.",
            },
            {
              id: "bi-membaca-teks-makna-kata-kontekstual-l2",
              level: "hots",
              question:
                "Diberikan kalimat: 'Kenaikan harga pangan itu dipicu oleh lonjakan biaya distribusi yang tidak diikuti perbaikan infrastruktur.' (a) Tentukan makna kata 'dipicu'. (b) Tentukan makna kata 'lonjakan'. (c) Ubah kalimat itu menjadi versi yang bernada lebih netral tanpa mengubah informasi. (d) Jelaskan perbedaan efek kedua versi tersebut bagi pembaca.",
              langkah: [
                "Analisis kata 'dipicu' dengan melihat objek 'kenaikan harga pangan': maknanya adalah disebabkan atau digerakkan oleh suatu faktor.",
                "Bandingkan dengan kata alternatif 'disebabkan' yang lebih netral.",
                "Analisis kata 'lonjakan': konteks 'biaya distribusi' memberi makna kenaikan yang cepat dan besar, bukan kenaikan kecil bertahap.",
                "Susun versi netral: 'Kenaikan harga pangan disebabkan oleh bertambahnya biaya distribusi, sementara perbaikan infrastruktur belum dilakukan.'",
                "Periksa kesetaraan informasi: kedua versi memuat penyebab (biaya distribusi) dan fakta pendukung (infrastruktur belum diperbaiki).",
                "Bandingkan efek: versi asli lebih emosional dan menarik perhatian, versi netral lebih objektif dan cocok untuk laporan resmi.",
                "Simpulkan: pilihan diksi menentukan nada tulisan meski informasi dasarnya sama — inilah fungsi konotasi dalam teks.",
              ],
              jawaban:
                "(a) Dipicu = disebabkan atau digerakkan oleh (b) Lonjakan = kenaikan cepat dan besar (c) 'Kenaikan harga pangan disebabkan oleh bertambahnya biaya distribusi, sementara perbaikan infrastruktur belum dilakukan.' (d) Versi asli lebih dramatis dan menarik perhatian, versi netral lebih objektif sehingga cocok untuk tulisan resmi.",
            },
          ],
          tkaSoal: [
            {
              id: "bi-membaca-teks-makna-kata-kontekstual-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Makna kontekstual sebuah kata ditentukan oleh ...",
              options: [
                { id: "A", text: "asal-usul katanya dalam bahasa asing" },
                { id: "B", text: "jumlah sukunya" },
                { id: "C", text: "pemakaian kata itu di dalam kalimat dan situasi sekitarnya" },
                { id: "D", text: "kelas kata yang selalu tetap" },
                { id: "E", text: "panjang kalimat tempat kata itu berada" },
              ],
              correctIds: ["C"],
              explanation:
                "Makna kontekstual bergantung pada konteks pemakaian, yaitu kata-kata lain dalam kalimat dan situasi yang menyertainya. Asal kata, jumlah suku, panjang kalimat, atau kelas kata bukan penentu utamanya.",
            },
            {
              id: "bi-membaca-teks-makna-kata-kontekstual-tka2",
              bentuk: "pg",
              level: "L2",
              stimulus:
                "Bacalah kalimat berikut! 'Lonjakan harga pangan dipicu oleh bertambahnya biaya distribusi.'",
              question: "Makna kata 'lonjakan' pada kalimat tersebut adalah ...",
              options: [
                { id: "A", text: "penurunan yang sedikit" },
                { id: "B", text: "kenaikan yang cepat dan besar" },
                { id: "C", text: "perubahan yang tidak terasa" },
                { id: "D", text: "pemindahan barang" },
                { id: "E", text: "penambahan jumlah penduduk" },
              ],
              correctIds: ["B"],
              explanation:
                "Kata 'lonjakan' berasal dari 'lonjak' yang berarti melompat, sehingga dalam konteks harga bermakna kenaikan cepat dan besar. Konteks 'dipicu oleh bertambahnya biaya distribusi' memperkuat makna kenaikan itu.",
            },
            {
              id: "bi-membaca-teks-makna-kata-kontekstual-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              stimulus:
                "Bacalah kalimat berikut! 'Pemerintah dipicu untuk segera bertindak setelah angka kemiskinan melonjak tajam di wilayah pesisir, sementara program bantuan terkesan berjalan lamban.'",
              question:
                "Pilih semua pernyataan yang BENAR tentang pilihan kata dalam kalimat tersebut. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "Kata 'melonjak' bermakna kenaikan yang besar dan cepat" },
                { id: "B", text: "Kata 'terkesan' menandakan penilaian yang tidak sepenuhnya pasti" },
                { id: "C", text: "Kata 'tajam' memperkuat makna kenaikan angka kemiskinan" },
                { id: "D", text: "Keseluruhan kalimat bernada netral tanpa pilihan kata yang bermuatan" },
                { id: "E", text: "Kata 'lamban' bermakna cepat dan tangkas" },
              ],
              correctIds: ["A", "B", "C"],
              explanation:
                "'Melonjak' bermakna naik secara besar dan cepat (A benar), 'terkesan' menandai penilaian yang tidak sepenuhnya pasti (B benar), dan 'tajam' memperkuat besarnya kenaikan (C benar). Pilihan kata seperti 'melonjak tajam' dan 'lamban' jelas bermuatan sehingga kalimatnya tidak netral (D salah), dan 'lamban' justru bermakna lambat (E salah).",
            },
            {
              id: "bi-membaca-teks-makna-kata-kontekstual-tka4",
              bentuk: "isian",
              level: "L2",
              stimulus:
                "Bacalah kalimat berikut! 'Pemerintah dipicu untuk segera bertindak setelah angka kemiskinan melonjak tajam.'",
              question:
                "Tuliskan satu kata yang bermakna 'disebabkan atau digerakkan oleh' dalam kalimat tersebut.",
              correctIds: ["dipicu"],
              explanation:
                "Kata 'dipicu' pada kalimat itu bermakna digerakkan atau disebabkan oleh suatu keadaan. Makna ini hanya muncul dari konteks, karena kata dasarnya 'picu' berkaitan dengan pemicu atau pemicu ledakan.",
            },
          ],
        },
        {
          id: "bi-membaca-teks-simpulan-implikasi",
          title: "Simpulan & Implikasi Teks",
          estimatedMinutes: 40,
          materi: {
            ringkasan:
              "Simpulan adalah pernyataan ringkas yang ditarik dari keseluruhan isi teks, sedangkan implikasi adalah akibat atau konsekuensi logis yang tersirat dari informasi tersebut. Simpulan harus didukung seluruh isi teks, sedangkan implikasi menuntut pembaca menghubungkan informasi dengan situasi lain.",
            rumus: [
              "Simpulan yang sah: mencakup seluruh informasi, tidak menambah data baru, dan tidak bertentangan dengan teks",
              "Implikasi = pernyataan yang WAJAR diambil dari teks, walaupun tidak ditulis eksplisit",
              "Uji pilihan jawaban: jika pernyataan butuh asumsi di luar teks, pilihan itu bukan simpulan/implikasi yang sah",
              "Kata penanda implikasi: 'tentu', 'berarti', 'dapat disimpulkan', 'akibatnya', 'hal ini menunjukkan'",
              "Bahasa simpulan biasanya umum dan tidak memuat angka rinci dari teks",
            ],
            contoh: [
              {
                soal:
                  "Teks: 'Sebuah sekolah melaporkan bahwa siswa yang mengikuti klub membaca rata-rata mendapat nilai ujian bahasa 12 poin lebih tinggi. Namun, sekolah juga mencatat siswa klub membaca umumnya berasal dari keluarga dengan akses buku yang memadai.' Simpulkan secara hati-hati.",
                pembahasan:
                  "Simpulan yang sah: ada hubungan positif antara keikutsertaan klub membaca dan nilai bahasa. Simpulan yang TIDAK sah: klub membaca pasti penyebab tunggal nilai tinggi, karena teks menyebut faktor lain (akses buku keluarga).",
              },
            ],
          },
          flashcards: [
            {
              id: "bi-membaca-teks-simpulan-implikasi-fc1",
              front: "Apa pembeda utama simpulan dan implikasi?",
              back: "Simpulan merangkum isi teks secara langsung; implikasi adalah konsekuensi logis yang tersirat dan perlu diturunkan pembaca.",
            },
            {
              id: "bi-membaca-teks-simpulan-implikasi-fc2",
              front: "Ciri pilihan jawaban simpulan yang salah?",
              back: "Terlalu sempit (hanya sebagian teks), terlalu luas (melampaui teks), atau menambahkan informasi yang tidak ada.",
            },
            {
              id: "bi-membaca-teks-simpulan-implikasi-fc3",
              front: "Mengapa simpulan tidak boleh memakai kata mutlak berlebihan?",
              back: "Kata seperti 'pasti' dan 'selalu' sering melampaui bukti teks, sehingga membuat simpulan tidak sah.",
            },
            {
              id: "bi-membaca-teks-simpulan-implikasi-fc4",
              front: "Apa itu korelasi dan mengapa penting dalam simpulan?",
              back: "Korelasi berarti dua hal cenderung terjadi bersama, bukan berarti satu menyebabkan yang lain — banyak simpulan salah karena mencampuradukkan keduanya.",
            },
          ],
          quiz: [
            {
              id: "bi-membaca-teks-simpulan-implikasi-q1",
              question:
                "Jika teks menyatakan 'Perusahaan mencatat penurunan keluhan pelanggan setelah pelatihan layanan diberikan', simpulan yang paling sah adalah ...",
              options: [
                "Pelatihan layanan pasti penyebab tunggal penurunan keluhan",
                "Terjadi penurunan keluhan pelanggan setelah pelatihan layanan",
                "Pelatihan layanan tidak berpengaruh apa pun",
                "Semua pelanggan kini puas sepenuhnya",
              ],
              correctIndex: 1,
              explanation:
                "Simpulan harus sesuai fakta teks tanpa menambah klaim sebab-akibat pasti atau generalisasi berlebihan.",
            },
            {
              id: "bi-membaca-teks-simpulan-implikasi-q2",
              question:
                "Teks menyebut 'Angka partisipasi sekolah menengah naik, tetapi angka putus sekolah di daerah terpencil juga naik.' Implikasi yang wajar adalah ...",
              options: [
                "Kenaikan partisipasi tidak otomatis berarti retensi siswa membaik",
                "Semua siswa di daerah terpencil berhenti sekolah",
                "Pemerintah gagal total dalam pendidikan",
                "Partisipasi dan retensi adalah hal yang sama",
              ],
              correctIndex: 0,
              explanation:
                "Teks menunjukkan dua data yang bergerak berlawanan, sehingga implikasinya partisipasi dan retensi adalah dua hal berbeda.",
            },
            {
              id: "bi-membaca-teks-simpulan-implikasi-q3",
              question:
                "Simpulan yang menambahkan data yang tidak terdapat dalam teks termasuk simpulan yang ...",
              options: ["Sah", "Terlalu sempit", "Melampaui isi teks", "Objektif"],
              correctIndex: 2,
              explanation:
                "Simpulan harus berdasar isi teks; menambahkan data baru berarti melampaui (overreach) isi teks.",
            },
            {
              id: "bi-membaca-teks-simpulan-implikasi-q4",
              question:
                "Kata penanda yang paling menunjukkan sebuah implikasi adalah ...",
              options: ["Misalnya", "Berarti", "Pertama", "Yaitu"],
              correctIndex: 1,
              explanation:
                "'Berarti' menandai penarikan konsekuensi logis, sedangkan 'misalnya' dan 'yaitu' menandai contoh atau perincian.",
            },
          ],
          latihanSoal: [
            {
              id: "bi-membaca-teks-simpulan-implikasi-l1",
              level: "hots",
              question:
                "Bacalah teks: 'Sebuah kota menerapkan kebijakan ganjil-genap untuk mengurangi kemacetan. Setelah enam bulan, kecepatan rata-rata kendaraan di jalan utama naik 18%. Namun, volume kendaraan di jalan alternatif meningkat 25% dan polusi di kawasan permukiman sekitar jalan alternatif turut naik.' (a) Tuliskan simpulan yang paling sah tentang efektivitas kebijakan tersebut. (b) Tuliskan satu implikasi yang wajar. (c) Sebutkan satu simpulan yang TIDAK sah dan jelaskan alasannya. (d) Rumuskan satu rekomendasi berbasis teks.",
              langkah: [
                "Identifikasi fakta teks: kecepatan naik 18% di jalan utama (dampak positif) DAN volume naik 25% di jalan alternatif disertai kenaikan polusi (dampak negatif).",
                "Simpulkan secara seimbang: kebijakan berhasil menaikkan kecepatan di jalan utama, tetapi memindahkan masalah ke jalan alternatif dan menambah beban polusi permukiman.",
                "Rumuskan implikasi: selama tidak ada pembenahan di jalan alternatif, manfaat kebijakan secara keseluruhan bisa lebih kecil daripada yang terlihat dari data jalan utama.",
                "Susun simpulan yang tidak sah, contohnya 'Kebijakan ganjil-genap gagal total mengurangi kemacetan' — bertentangan dengan data kecepatan naik 18%.",
                "Jelaskan alasan: simpulan itu mengabaikan bukti positif dan melebih-lebihkan (overgeneral) padahal teks hanya menyebut perpindahan masalah.",
                "Rumuskan rekomendasi: evaluasi kebijakan harus memakai data jalan utama DAN jalan alternatif, serta perlu pengendalian polusi di kawasan permukiman.",
                "Periksa rekomendasi agar tidak menambah data baru di luar teks: seluruh dasarnya adalah angka 18% dan 25% serta kenaikan polusi.",
              ],
              jawaban:
                "(a) Kebijakan menaikkan kecepatan di jalan utama 18%, tetapi memindahkan kemacetan dan polusi ke jalan alternatif (b) Manfaat kebijakan bisa mengecil jika dampak di jalan alternatif tidak ditangani (c) 'Ganjil-genap gagal total' tidak sah karena bertentangan dengan bukti kecepatan naik (d) Evaluasi kebijakan perlu memakai data jalan utama dan jalan alternatif, sekaligus penanganan polusi permukiman.",
            },
            {
              id: "bi-membaca-teks-simpulan-implikasi-l2",
              level: "sulit",
              question:
                "Perhatikan dua pernyataan berikut: (P1) 'Studi di sebuah negara menemukan siswa yang sarapan mendapat nilai lebih tinggi.' (P2) 'Studi yang sama mencatat siswa yang sarapan umumnya tidur cukup dan berasal dari keluarga dengan pendapatan lebih tinggi.' (a) Tentukan mengapa P2 melemahkan klaim bahwa sarapan adalah penyebab tunggal nilai tinggi. (b) Tuliskan simpulan yang paling hati-hati. (c) Apa variabel perancu (confounding) dalam kasus ini? (d) Bagaimana cara peneliti memastikan hubungan sebab-akibat?",
              langkah: [
                "Pahami klaim awal: sarapan dianggap penyebab nilai tinggi.",
                "Analisis P2: terdapat faktor lain yang berkorelasi sekaligus memengaruhi nilai, yaitu kecukupan tidur dan pendapatan keluarga.",
                "Kesimpulan analisis: hubungan sarapan-nilai bisa jadi hanya korelasi, bukan sebab-akibat murni.",
                "Rumuskan simpulan hati-hati: ada hubungan antara sarapan dan nilai, tetapi tidur cukup dan latar ekonomi keluarga juga berpotensi menjelaskan sebagian hubungan itu.",
                "Identifikasi variabel perancu: kecukupan tidur dan pendapatan keluarga — keduanya terkait dengan kebiasaan sarapan sekaligus dengan capaian nilai.",
                "Jelaskan cara peneliti memastikan sebab-akibat: eksperimen terkontrol (kelompok sarapan dan tidak sarapan diundi secara acak), atau penelitian lanjutan yang mengontrol variabel tidur dan pendapatan.",
                "Simpulkan: tanpa pengendalian variabel perancu, pernyataan 'sarapan meningkatkan nilai' tidak dapat dinyatakan sebagai hubungan sebab-akibat.",
              ],
              jawaban:
                "(a) Karena ada faktor lain (tidur dan pendapatan) yang juga memengaruhi nilai, sehingga hubungan bisa hanya korelasi (b) Ada hubungan antara sarapan dan nilai, tetapi tidur cukup dan latar ekonomi keluarga juga berpotensi menjelaskannya (c) Kecukupan tidur dan pendapatan keluarga (d) Melalui eksperimen acak atau penelitian yang mengontrol kedua variabel perancu tersebut.",
            },
          ],
          tkaSoal: [
            {
              id: "bi-membaca-teks-simpulan-implikasi-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Simpulan sebuah teks harus ...",
              options: [
                { id: "A", text: "memuat pendapat baru yang belum dibahas" },
                { id: "B", text: "didasarkan pada informasi yang benar-benar ada di dalam teks" },
                { id: "C", text: "mengulang kalimat pertama secara persis" },
                { id: "D", text: "berisi pertanyaan kepada pembaca" },
                { id: "E", text: "menambahkan data dari sumber lain" },
              ],
              correctIds: ["B"],
              explanation:
                "Simpulan yang sah harus bertumpu pada informasi yang tersedia di dalam teks, bukan pendapat baru, pengulangan mentah, pertanyaan, atau data dari luar teks.",
            },
            {
              id: "bi-membaca-teks-simpulan-implikasi-tka2",
              bentuk: "pg",
              level: "L2",
              stimulus:
                "Bacalah teks berikut! Sebuah sekolah melaporkan bahwa siswa yang biasa sarapan memperoleh nilai lebih tinggi. Survei yang sama mencatat bahwa siswa itu juga tidur lebih cukup dan berasal dari keluarga dengan pendapatan lebih tinggi.",
              question: "Simpulan yang paling tepat adalah ...",
              options: [
                { id: "A", text: "Sarapan pasti meningkatkan nilai siswa" },
                { id: "B", text: "Nilai siswa hanya ditentukan oleh kebiasaan sarapan" },
                { id: "C", text: "Ada hubungan antara sarapan dan nilai, tetapi tidur dan pendapatan keluarga juga berpotensi menjelaskannya" },
                { id: "D", text: "Tidur tidak berhubungan sama sekali dengan nilai siswa" },
                { id: "E", text: "Survei tersebut tidak dapat dipercaya karena jumlah sampelnya kecil" },
              ],
              correctIds: ["C"],
              explanation:
                "Teks hanya melaporkan korelasi, bukan hubungan sebab-akibat. Karena tidur dan pendapatan keluarga juga berbeda di antara kedua kelompok, keduanya berpotensi menjadi variabel perancu. Simpulan yang tepat harus hati-hati dan tidak menyatakan sebab-akibat pasti.",
            },
            {
              id: "bi-membaca-teks-simpulan-implikasi-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              stimulus:
                "Bacalah teks berikut! Sebuah sekolah melaporkan bahwa siswa yang biasa sarapan memperoleh nilai lebih tinggi. Survei yang sama mencatat bahwa siswa itu juga tidur lebih cukup dan berasal dari keluarga dengan pendapatan lebih tinggi. Tanpa pengendalian faktor lain, hubungan sarapan dan nilai belum dapat disebut sebab-akibat.",
              question:
                "Pilih semua pernyataan yang BENAR berdasarkan teks tersebut. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "Hubungan sarapan dan nilai bisa jadi hanya korelasi" },
                { id: "B", text: "Kecukupan tidur dan pendapatan keluarga adalah variabel perancu yang mungkin" },
                { id: "C", text: "Teks tersebut membuktikan sarapan adalah satu-satunya penyebab nilai tinggi" },
                { id: "D", text: "Eksperimen acak atau pengendalian variabel dapat menguji hubungan sebab-akibat" },
                { id: "E", text: "Teks menyatakan bahwa pendapatan keluarga tidak perlu dipertimbangkan" },
              ],
              correctIds: ["A", "B", "D"],
              explanation:
                "Teks menegaskan hubungan itu belum dapat disebut sebab-akibat sehingga bisa jadi hanya korelasi (A benar), dan menyebut tidur serta pendapatan sebagai faktor lain (B benar). Untuk menguji sebab-akibat diperlukan eksperimen terkontrol atau pengendalian variabel (D benar). Teks justru menyatakan sebaliknya pada C dan E.",
            },
            {
              id: "bi-membaca-teks-simpulan-implikasi-tka4",
              bentuk: "isian",
              level: "L2",
              stimulus:
                "Bacalah teks berikut! Sebuah sekolah melaporkan bahwa siswa yang biasa sarapan memperoleh nilai lebih tinggi. Survei yang sama mencatat bahwa siswa itu juga tidur lebih cukup dan berasal dari keluarga dengan pendapatan lebih tinggi.",
              question:
                "Tuliskan istilah untuk faktor lain yang menyertai variabel utama dan dapat menjelaskan hubungan secara keliru (dua kata).",
              correctIds: ["variabel perancu", "variabel pengganggu", "perancu"],
              explanation:
                "Istilahnya adalah variabel perancu (confounding variable): faktor yang berhubungan dengan variabel bebas sekaligus variabel terikat sehingga menciptakan hubungan semu. Di sini kecukupan tidur dan pendapatan keluarga berperan demikian.",
            },
          ],
        },
      ],
    },
    {
      id: "bi-menulis-teks",
      title: "Menulis Teks",
      order: 2,
      subtopics: [
        {
          id: "bi-menulis-teks-kebahasaan-puebi",
          title: "Kebahasaan & PUEBI/EYD",
          estimatedMinutes: 40,
          materi: {
            ringkasan:
              "PUEBI/EYD mengatur penulisan huruf, kata, dan tanda baca secara baku. Penguasaan kaidah ini penting agar tulisan formal tidak menimbulkan salah tafsir, terutama pada penulisan huruf kapital, kata baku, dan gabungan kata.",
            rumus: [
              "Huruf kapital dipakai pada awal kalimat, nama diri, nama geografi, gelar yang diikuti nama, dan nama lembaga",
              "Kata depan 'di' ditulis terpisah (di sekolah), sedangkan awalan 'di-' disatukan (ditulis)",
              "Kata ulang ditulis dengan tanda hubung: sebaik-baiknya, buku-buku",
              "Gabungan kata yang menimbulkan makna baru ditulis serangkai: kacamata, saputangan, hulubalang",
              "Angka dipakai untuk menyatakan ukuran, nilai uang, dan nomor; kata dipakai pada awal kalimat",
              "Kata baku contoh: aktif, apotek, izin, jadwal, kualitas, metode, objek, praktik, risiko, standar",
            ],
            contoh: [
              {
                soal: "Perbaiki kalimat: 'Di sekolah, siswa di beri tugas menulis di surat kabar.'",
                pembahasan:
                  "Kata 'di beri' salah karena 'di-' pada 'diberi' adalah awalan, sehingga harus disatukan menjadi 'diberi'. Kalimat benar: 'Di sekolah, siswa diberi tugas menulis di surat kabar.'",
              },
              {
                soal: "Betulkan: 'Ia membeli obat di apotik dekat pasar.'",
                pembahasan:
                  "Kata baku menurut KBBI adalah 'apotek', bukan 'apotik'. Kalimat benar: 'Ia membeli obat di apotek dekat pasar.'",
              },
            ],
          },
          flashcards: [
            {
              id: "bi-menulis-teks-kebahasaan-puebi-fc1",
              front: "Cara membedakan 'di' sebagai kata depan dan awalan?",
              back: "Kata depan 'di' menyatakan tempat/waktu dan diikuti kata benda atau keterangan (di rumah, di antara), sedangkan awalan 'di-' membentuk kata kerja pasif (ditulis, diberi).",
            },
            {
              id: "bi-menulis-teks-kebahasaan-puebi-fc2",
              front: "Kapan huruf kapital dipakai pada gelar?",
              back: "Huruf kapital dipakai jika gelar diikuti nama orang, misalnya 'Rektor Universitas X'. Jika tidak diikuti nama, ditulis dengan huruf kecil: 'rektor tersebut'.",
            },
            {
              id: "bi-menulis-teks-kebahasaan-puebi-fc3",
              front: "Sebutkan lima kata baku yang sering salah ditulis.",
              back: "Apotek (bukan apotik), izin (bukan ijin), jadwal (bukan jadual), praktik (bukan praktek), risiko (bukan resiko).",
            },
            {
              id: "bi-menulis-teks-kebahasaan-puebi-fc4",
              front: "Bagaimana penulisan bilangan pada awal kalimat?",
              back: "Bilangan pada awal kalimat ditulis dengan kata (huruf), bukan angka. Contoh: 'Lima siswa hadir', bukan '5 siswa hadir'.",
            },
          ],
          quiz: [
            {
              id: "bi-menulis-teks-kebahasaan-puebi-q1",
              question: "Penulisan yang benar adalah ...",
              options: ["di rumah", "dirumah", "di-rumah", "di_Rumah"],
              correctIndex: 0,
              explanation:
                "'di' pada 'di rumah' adalah kata depan penunjuk tempat, sehingga ditulis terpisah.",
            },
            {
              id: "bi-menulis-teks-kebahasaan-puebi-q2",
              question: "Kalimat berikut yang penulisannya benar adalah ...",
              options: [
                "Ia mengikuti kegiatan ekstrakurikuler di sekolah.",
                "Ia mengikuti kegiatan ekstra kurikuler disekolah.",
                "Ia mengikuti kegiatan ekstrakurikuler disekolah.",
                "Ia mengikuti kegiatan ekstra-kurikuler di sekolah.",
              ],
              correctIndex: 0,
              explanation:
                "'Ekstrakurikuler' ditulis serangkai (bentuk baku) dan 'di sekolah' ditulis terpisah karena 'di' adalah kata depan.",
            },
            {
              id: "bi-menulis-teks-kebahasaan-puebi-q3",
              question: "Bentuk baku dari kata 'praktek' adalah ...",
              options: ["Praktek", "Praktik", "Pratek", "Praktiq"],
              correctIndex: 1,
              explanation: "Menurut KBBI, bentuk bakunya adalah 'praktik'.",
            },
            {
              id: "bi-menulis-teks-kebahasaan-puebi-q4",
              question: "Penulisan yang benar untuk bilangan di awal kalimat adalah ...",
              options: [
                "5 siswa tidak hadir hari ini.",
                "Lima siswa tidak hadir hari ini.",
                "Kelima dikurangi nol siswa tidak hadir hari ini.",
                "Lima (5) siswa tidak hadir hari ini.",
              ],
              correctIndex: 1,
              explanation:
                "Bilangan pada awal kalimat ditulis dengan kata, bukan angka, sehingga 'Lima siswa tidak hadir hari ini.'",
            },
          ],
          latihanSoal: [
            {
              id: "bi-menulis-teks-kebahasaan-puebi-l1",
              level: "hots",
              question:
                "Betulkan paragraf berikut sesuai PUEBI/EYD, lalu jelaskan setiap perubahan: 'Pada hari senin, 5 siswa dari kelas XII di beri tugas membuat laporan di perpustakaan. mereka harus mengumpulkan laporan tersebut paling lambat 3 hari setelah itu. kepala sekolah mengatakan bahwa kegiatan ini penting untuk melatih kemampuan menulis siswanya.'",
              langkah: [
                "Perbaikan 1: 'senin' menjadi 'Senin', karena nama hari ditulis dengan huruf kapital pada awal kata.",
                "Perbaikan 2: '5 siswa' pada awal kalimat menjadi 'Lima siswa', karena bilangan awal kalimat ditulis dengan kata.",
                "Perbaikan 3: 'di beri' menjadi 'diberi', karena 'di-' di sini adalah awalan pembentuk kata kerja pasif.",
                "Perbaikan 4: 'di perpustakaan' dibiarkan, karena 'di' di sini adalah kata depan penunjuk tempat.",
                "Perbaikan 5: 'mereka' menjadi 'Mereka' pada awal kalimat, sesuai aturan huruf kapital awal kalimat.",
                "Perbaikan 6: '3 hari' menjadi 'tiga hari' agar penulisan bilangan konsisten dalam kalimat formal nonteknis.",
                "Perbaikan 7: 'kepala sekolah' menjadi 'Kepala sekolah' karena berada di awal kalimat.",
                "Periksa klitik '-nya' pada 'siswanya': sudah tepat karena merujuk 'sekolah' sebagai pemilik.",
                "Susun hasil akhir dan bandingkan dengan versi awal untuk memastikan tidak ada makna yang berubah.",
              ],
              jawaban:
                "'Pada hari Senin, lima siswa dari kelas XII diberi tugas membuat laporan di perpustakaan. Mereka harus mengumpulkan laporan tersebut paling lambat tiga hari setelah itu. Kepala sekolah mengatakan bahwa kegiatan ini penting untuk melatih kemampuan menulis siswanya.'",
            },
            {
              id: "bi-menulis-teks-kebahasaan-puebi-l2",
              level: "sulit",
              question:
                "Analisislah kesalahan berbahasa pada teks berikut dan jelaskan kategorinya: 'Berdasarkan data di lapangan, menunjukan bahwa minat baca siswa menurun. Hal ini di sebabkan oleh beberapa faktor, seperti; kurangnya fasilitas, dan rendahnya motivasi. Oleh sebab itu kami menghimbau agar semua pihak lebih perduli terhadap masalah ini.'",
              langkah: [
                "Kesalahan 1: 'menunjukan' menjadi 'menunjukkan'. Kata dasar 'tunjuk' berakhir vokal, sehingga perlu huruf sambung '-n-' sebelum akhiran '-kan'.",
                "Kesalahan 2: 'di sebabkan' menjadi 'disebabkan', karena 'di-' adalah awalan pembentuk kata kerja pasif.",
                "Kesalahan 3: tanda titik koma setelah 'seperti' salah. Tanda koma atau titik dua lebih tepat, bukan titik koma sebelum pemerian.",
                "Kesalahan 4: 'menghimbau' menjadi 'mengimbau'; imbuhan yang tepat untuk kata dasar 'imbau' adalah 'meng-'.",
                "Kesalahan 5: 'perduli' menjadi 'peduli'; bentuk baku menurut KBBI adalah 'peduli'.",
                "Kesalahan 6: koma sebelum 'dan' tidak diperlukan jika perincian hanya dua unsur, sehingga 'fasilitas dan rendahnya motivasi'.",
                "Kategorikan: kesalahan 1, 4, dan 5 adalah kesalahan morfologi; kesalahan 2 penulisan awalan; kesalahan 3 tanda baca; kesalahan 6 konvensi perincian.",
                "Susun versi perbaikan utuh dan pastikan makna tidak berubah.",
              ],
              jawaban:
                "Perbaikan: 'Berdasarkan data di lapangan, minat baca siswa menurun. Hal ini disebabkan oleh beberapa faktor, seperti kurangnya fasilitas dan rendahnya motivasi. Oleh sebab itu, kami mengimbau agar semua pihak lebih peduli terhadap masalah ini.' Kesalahan mencakup morfologi (menunjukan, menghimbau, perduli), penulisan awalan (di sebabkan), tanda baca (titik koma setelah 'seperti'), dan konvensi perincian (koma berlebih).",
            },
          ],
          tkaSoal: [
            {
              id: "bi-menulis-teks-kebahasaan-puebi-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Penulisan kata baku yang benar sesuai PUEBI adalah ...",
              options: [
                { id: "A", text: "menghimbau" },
                { id: "B", text: "mengimbau" },
                { id: "C", text: "perduli" },
                { id: "D", text: "di sebabkan" },
                { id: "E", text: "analisa" },
              ],
              correctIds: ["B"],
              explanation:
                "Bentuk baku untuk kata dasar 'imbau' adalah 'mengimbau' (bukan menghimbau). Bentuk baku lainnya: peduli (bukan perduli), disebabkan (bukan di sebabkan), dan analisis (bukan analisa).",
            },
            {
              id: "bi-menulis-teks-kebahasaan-puebi-tka2",
              bentuk: "pg",
              level: "L2",
              question: "Kalimat yang ditulis dengan ejaan dan tanda baca yang benar adalah ...",
              options: [
                { id: "A", text: "Berdasarkan data, minat baca siswa menurun." },
                { id: "B", text: "Berdasarkan data di lapangan; minat baca siswa menurun." },
                { id: "C", text: "berdasarkan data di lapangan, minat baca siswa menurun." },
                { id: "D", text: "Berdasarkan data di lapangan minat baca siswa menurun" },
                { id: "E", text: "Berdasarkan, data di lapangan minat baca siswa menurun." },
              ],
              correctIds: ["A"],
              explanation:
                "Kalimat harus diawali huruf kapital dan diakhiri tanda titik. Titik koma tidak tepat untuk memisahkan keterangan dari induk kalimat (B), huruf awal kalimat harus kapital (C), tanda titik pada akhir kalimat wajib ada (D), dan koma setelah 'Berdasarkan' memutus keterangan secara keliru (E).",
            },
            {
              id: "bi-menulis-teks-kebahasaan-puebi-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              stimulus:
                "Bacalah paragraf berikut! 'Berdasarkan data di lapangan; minat baca siswa menunjukan penurunan. Hal ini di sebabkan oleh beberapa faktor, seperti; kurangnya fasilitas dan rendahnya motivasi. Oleh sebab itu kami menghimbau agar semua pihak lebih perduli.'",
              question:
                "Pilih semua kesalahan kebahasaan yang benar-benar terdapat dalam paragraf tersebut. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "Penulisan 'menunjukan' seharusnya 'menunjukkan'" },
                { id: "B", text: "Penulisan 'di sebabkan' seharusnya 'disebabkan'" },
                { id: "C", text: "Titik koma setelah 'seperti' tidak tepat dan seharusnya koma" },
                { id: "D", text: "Penulisan 'menghimbau' seharusnya 'mengimbau' dan 'perduli' seharusnya 'peduli'" },
                { id: "E", text: "Paragraf tersebut sudah sepenuhnya baku sehingga tidak perlu diperbaiki" },
              ],
              correctIds: ["A", "B", "C", "D"],
              explanation:
                "Kata dasar 'tunjuk' mendapat imbuhan '-kan' sehingga menjadi 'menunjukkan' (A benar). Awalan 'di-' sebagai awalan ditulis serangkai menjadi 'disebabkan' (B benar). Titik koma hanya memisahkan bagian setara, bukan memimpin perincian (C benar). Bentuk baku 'imbau' dan 'peduli' adalah 'mengimbau' dan 'peduli' (D benar). Paragraf itu jelas memuat kesalahan sehingga E salah.",
            },
            {
              id: "bi-menulis-teks-kebahasaan-puebi-tka4",
              bentuk: "isian",
              level: "L2",
              question:
                "Tuliskan bentuk baku untuk kata yang sering salah ditulis sebagai 'analisa' (satu kata).",
              correctIds: ["analisis"],
              explanation:
                "Bentuk baku menurut KBBI adalah 'analisis'. Kesalahan serupa yang sering muncul: 'hipotesa' seharusnya 'hipotesis', 'sintesa' seharusnya 'sintesis'.",
            },
          ],
        },
        {
          id: "bi-menulis-teks-efektivitas-variasi-kalimat",
          title: "Efektivitas & Variasi Kalimat",
          estimatedMinutes: 40,
          materi: {
            ringkasan:
              "Kalimat efektif menyampaikan gagasan secara tepat, jelas, dan hemat kata sehingga pembaca menangkap maksud penulis tanpa penafsiran ganda. Variasi kalimat membuat tulisan tidak monoton dengan mengubah panjang kalimat, pola susunan, dan jenis kalimat.",
            rumus: [
              "Syarat kalimat efektif: kesatuan gagasan, kelogisan, kesejajaran bentuk, kehematan kata, dan kelengkapan unsur",
              "Pleonasme (mubazir) harus dihindari: 'naik ke atas' menjadi 'naik', 'saling tolong-menolong' menjadi 'tolong-menolong'",
              "Kesejajaran: 'kegiatan membaca, menulis, dan berdiskusi' (semua bentuk sejajar), bukan 'membaca, menulis, dan diskusi'",
              "Variasi panjang: gabungkan kalimat pendek sesekali, pecah kalimat panjang yang berbelit",
              "Kalimat aktif: subjek melakukan tindakan; kalimat pasif: subjek dikenai tindakan (ditandai 'di-' atau 'ter-')",
            ],
            contoh: [
              {
                soal: "Perbaiki kalimat tidak efektif: 'Para siswa-siswa semua hadir di dalam ruangan kelas.'",
                pembahasan:
                  "Hilangkan kemubaziran: 'para' dan 'siswa-siswa' bermakna sama, 'di dalam ruangan' dan 'kelas' juga berlebihan. Kalimat efektif: 'Semua siswa hadir di kelas.'",
              },
              {
                soal:
                  "Sejajarkan perincian: 'Tugas panitia meliputi menyusun acara, konsumsi, dan mengatur dokumentasi.'",
                pembahasan:
                  "Ubah semua menjadi bentuk verba: 'Tugas panitia meliputi menyusun acara, menyiapkan konsumsi, dan mengatur dokumentasi.'",
              },
            ],
          },
          flashcards: [
            {
              id: "bi-menulis-teks-efektivitas-variasi-kalimat-fc1",
              front: "Apa itu pleonasme? Beri satu contoh.",
              back: "Pemakaian kata berlebih yang maknanya sudah terkandung pada kata lain. Contoh: 'turun ke bawah', seharusnya cukup 'turun'.",
            },
            {
              id: "bi-menulis-teks-efektivitas-variasi-kalimat-fc2",
              front: "Apa yang dimaksud kesejajaran bentuk dalam perincian?",
              back: "Unsur-unsur perincian harus memiliki bentuk gramatikal sama, biasanya semua verba atau semua nomina: 'membaca, menulis, berdiskusi'.",
            },
            {
              id: "bi-menulis-teks-efektivitas-variasi-kalimat-fc3",
              front: "Bagaimana cara membuat tulisan tidak monoton?",
              back: "Variasikan panjang kalimat, campur kalimat aktif dan pasif, ubah posisi keterangan, dan gunakan kalimat tanya atau perintah secara sesekali.",
            },
            {
              id: "bi-menulis-teks-efektivitas-variasi-kalimat-fc4",
              front: "Ciri kalimat tidak logis?",
              back: "Predikat tidak sesuai dengan subjek, misalnya 'Waktu dan tempat kami persilakan' — keterangan tidak dapat dipersilakan karena bukan orang.",
            },
          ],
          quiz: [
            {
              id: "bi-menulis-teks-efektivitas-variasi-kalimat-q1",
              question: "Kalimat berikut yang paling efektif adalah ...",
              options: [
                "Para siswa-siswa semuanya hadir di dalam ruangan kelas.",
                "Semua siswa hadir di kelas.",
                "Semua siswa-siswa hadir di dalam kelas.",
                "Para semua siswa hadir di kelas.",
              ],
              correctIndex: 1,
              explanation:
                "'Semua siswa hadir di kelas.' hemat kata, lengkap unsurnya, dan tidak memuat pengulangan makna.",
            },
            {
              id: "bi-menulis-teks-efektivitas-variasi-kalimat-q2",
              question: "Perincian yang sejajar bentuknya adalah ...",
              options: [
                "Membaca, menulis, dan diskusi",
                "Membaca, menulis, dan berdiskusi",
                "Bacaan, menulis, dan berdiskusi",
                "Membaca, tulisan, dan berdiskusi",
              ],
              correctIndex: 1,
              explanation:
                "Semua unsur berbentuk verba berimbuhan, sehingga bentuknya sejajar.",
            },
            {
              id: "bi-menulis-teks-efektivitas-variasi-kalimat-q3",
              question: "Kalimat 'Ia naik ke atas gedung itu.' tidak efektif karena ...",
              options: [
                "Tidak lengkap unsurnya",
                "Mengandung pleonasme (kemubaziran)",
                "Tidak logis",
                "Tidak ada subjek",
              ],
              correctIndex: 1,
              explanation:
                "Kata 'ke atas' mubazir karena makna 'naik' sudah menyiratkan arah ke atas.",
            },
            {
              id: "bi-menulis-teks-efektivitas-variasi-kalimat-q4",
              question: "Cara paling tepat membuat tulisan tidak monoton adalah ...",
              options: [
                "Memakai kalimat dengan panjang dan pola yang beragam",
                "Memakai kalimat panjang di semua paragraf",
                "Menghindari kalimat pasif sepenuhnya",
                "Mengulang kata kunci di setiap kalimat",
              ],
              correctIndex: 0,
              explanation:
                "Variasi panjang dan pola kalimat mencegah kebosanan pembaca tanpa mengorbankan kejelasan.",
            },
          ],
          latihanSoal: [
            {
              id: "bi-menulis-teks-efektivitas-variasi-kalimat-l1",
              level: "hots",
              question:
                "Perbaiki paragraf berikut agar efektif dan bervariasi, lalu jelaskan setiap perubahan: 'Para siswa-siswa yang mengikuti kegiatan ekstrakurikuler olahraga mereka semua sangat antusias sekali dalam mengikuti latihan rutin yang dilaksanakan pada setiap hari Sabtu. Latihan tersebut bertujuan untuk meningkatkan kebugaran fisik siswa-siswa dan juga untuk menumbuhkan kerja sama tim.'",
              langkah: [
                "Perbaikan 1: 'Para siswa-siswa' mubazir karena 'para' sudah menunjukkan jamak dan 'siswa-siswa' juga jamak; cukup 'Para siswa'.",
                "Perbaikan 2: 'mereka semua sangat antusias sekali' memuat kemubaziran bertumpuk; cukup 'sangat antusias'.",
                "Perbaikan 3: 'dalam mengikuti latihan rutin yang dilaksanakan pada setiap hari Sabtu' berbelit; ringkas menjadi 'dalam latihan rutin setiap Sabtu'.",
                "Perbaikan 4: 'siswa-siswa' pada kalimat kedua diulang; gunakan bentuk tunggal 'siswa' untuk menghindari repetisi.",
                "Perbaikan 5: bagi kalimat pertama yang panjang menjadi dua kalimat agar mudah dibaca.",
                "Perbaikan 6: ringkas 'dan juga untuk' menjadi 'serta'.",
                "Periksa variasi: kini ada kalimat dengan panjang berbeda sehingga tulisan tidak monoton.",
                "Periksa kelogisan dan kelengkapan: setiap kalimat memiliki subjek dan predikat yang jelas.",
              ],
              jawaban:
                "Versi perbaikan: 'Para siswa yang mengikuti ekstrakurikuler olahraga sangat antusias dalam latihan rutin setiap Sabtu. Latihan itu bertujuan meningkatkan kebugaran fisik siswa serta menumbuhkan kerja sama tim.' Perubahan mencakup penghapusan pleonasme, pemadatan frasa berbelit, penghilangan repetisi, pemecahan kalimat panjang, dan variasi panjang kalimat.",
            },
            {
              id: "bi-menulis-teks-efektivitas-variasi-kalimat-l2",
              level: "sulit",
              question:
                "Diberikan kalimat: 'Bahwa siswa yang tidak membawa buku akan diberikan sanksi oleh guru yang mengajar di kelas tersebut sehingga mereka harus meminta maaf dan juga menulis surat pernyataan yang ditandatangani oleh orang tua.' (a) Sebutkan pelanggaran efektivitas yang ada. (b) Pecah kalimat itu menjadi tiga kalimat. (c) Sejajarkan perincian tindakan siswa. (d) Jelaskan mengapa kalimat panjang berbelit menyulitkan pembaca.",
              langkah: [
                "Masalah 1: penggunaan 'bahwa' di awal kalimat tanpa induk kalimat menjadikan struktur tidak lengkap (fragmentasi).",
                "Masalah 2: kalimat terlalu panjang karena menumpuk tiga gagasan: sanksi, permintaan maaf, dan surat pernyataan.",
                "Masalah 3: pemakaian 'oleh' berulang dua kali ('oleh guru', 'oleh orang tua') membuat kalimat berbelit.",
                "Pecah menjadi kalimat 1: 'Siswa yang tidak membawa buku akan dikenai sanksi oleh guru kelas.'",
                "Pecah menjadi kalimat 2: 'Mereka harus meminta maaf.'",
                "Pecah menjadi kalimat 3: 'Selain itu, mereka wajib menulis surat pernyataan yang ditandatangani orang tua.'",
                "Sejajarkan perincian tindakan: 'meminta maaf dan menulis surat pernyataan' — keduanya verba berimbuhan.",
                "Jelaskan dampaknya: kalimat berbelit memaksa pembaca menahan banyak informasi sekaligus sehingga rawan salah tafsir dan melelahkan.",
              ],
              jawaban:
                "(a) Struktur tidak lengkap (awalan 'bahwa' tanpa induk), terlalu panjang memuat tiga gagasan, dan 'oleh' berulang (b) 'Siswa yang tidak membawa buku akan dikenai sanksi oleh guru kelas. Mereka harus meminta maaf. Selain itu, mereka wajib menulis surat pernyataan yang ditandatangani orang tua.' (c) Meminta maaf dan menulis surat pernyataan (d) Kalimat panjang memaksa pembaca mengingat banyak informasi sekaligus sehingga rawan salah tafsir.",
            },
          ],
          tkaSoal: [
            {
              id: "bi-menulis-teks-efektivitas-variasi-kalimat-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Kalimat efektif adalah kalimat yang ...",
              options: [
                { id: "A", text: "sepanjang mungkin agar informasinya lengkap" },
                { id: "B", text: "menyampaikan gagasan secara tepat dan tidak boros kata" },
                { id: "C", text: "selalu memakai kata asing" },
                { id: "D", text: "memuat sebanyak mungkin gagasan dalam satu kalimat" },
                { id: "E", text: "tidak boleh memiliki subjek dan predikat" },
              ],
              correctIds: ["B"],
              explanation:
                "Kalimat efektif menyampaikan gagasan secara tepat, jelas, dan hemat kata. Kalimat efektif justru menghindari penumpukan gagasan dan selalu memiliki unsur pokok subjek dan predikat.",
            },
            {
              id: "bi-menulis-teks-efektivitas-variasi-kalimat-tka2",
              bentuk: "pg",
              level: "L2",
              stimulus:
                "Bacalah kalimat berikut! 'Bahwa siswa yang tidak membawa buku akan dikenai sanksi oleh guru kelas dan mereka harus meminta maaf dan juga wajib menulis surat pernyataan yang ditandatangani oleh orang tua.'",
              question: "Masalah utama kalimat tersebut adalah ...",
              options: [
                { id: "A", text: "kalimatnya terlalu pendek sehingga informasinya kurang" },
                { id: "B", text: "struktur tidak lengkap karena ada 'bahwa' tanpa induk, terlalu panjang, dan kata 'oleh' berulang" },
                { id: "C", text: "kalimatnya tidak memuat predikat sama sekali" },
                { id: "D", text: "kalimatnya memakai kata baku yang salah" },
                { id: "E", text: "kalimatnya sudah efektif sehingga tidak perlu diperbaiki" },
              ],
              correctIds: ["B"],
              explanation:
                "Kata 'bahwa' seharusnya menjadi penanda klausa yang bergantung pada induk kalimat, jadi strukturnya tidak lengkap. Kalimat juga memuat tiga gagasan sekaligus dan mengulang pemakaian 'oleh' sehingga tidak efektif.",
            },
            {
              id: "bi-menulis-teks-efektivitas-variasi-kalimat-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              question:
                "Pilih semua cara yang tepat untuk mengefektifkan kalimat bertumpuk gagasan. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "Memecah kalimat menjadi beberapa kalimat yang lebih pendek" },
                { id: "B", text: "Menyejajarkan bentuk perincian, misalnya sama-sama verba berimbuhan" },
                { id: "C", text: "Menghilangkan subjek agar kalimat lebih singkat" },
                { id: "D", text: "Menghapus kata mubazir dan pengulangan yang tidak perlu" },
                { id: "E", text: "Menambahkan konjungsi sebanyak mungkin agar terasa mengalir" },
              ],
              correctIds: ["A", "B", "D"],
              explanation:
                "Memecah kalimat (A), menyejajarkan perincian (B), dan menghapus kata mubazir (D) adalah cara mengefektifkan kalimat. Menghilangkan subjek justru merusak struktur (C), dan menambah konjungsi berlebihan membuat kalimat boros serta berbelit (E).",
            },
            {
              id: "bi-menulis-teks-efektivitas-variasi-kalimat-tka4",
              bentuk: "isian",
              level: "L2",
              question:
                "Tuliskan istilah untuk sifat kalimat yang unsur-unsurnya sama bentuk dan sama fungsi, misalnya 'meminta maaf dan menulis surat' (satu kata).",
              correctIds: ["kesejajaran", "paralelisme", "sejajar"],
              explanation:
                "Istilahnya adalah kesejajaran atau paralelisme: unsur-unsur dalam perincian harus memiliki bentuk dan fungsi gramatikal yang sama. 'Meminta maaf' dan 'menulis surat' sejajar karena keduanya verba berimbuhan.",
            },
          ],
        },
        {
          id: "bi-menulis-teks-kohesi-koherensi",
          title: "Kohesi & Koherensi Paragraf",
          estimatedMinutes: 40,
          materi: {
            ringkasan:
              "Kohesi adalah keterpaduan bentuk, yaitu keserasian hubungan antar kalimat melalui penanda seperti konjungsi, pronomina, dan pengulangan kata kunci. Koherensi adalah keterpaduan makna, yaitu kesinambungan gagasan sehingga paragraf terasa mengalir dan tidak melompat-lompat.",
            rumus: [
              "Penanda kohesi: konjungsi (namun, karena itu, selain itu), pronomina (ini, itu, dia, mereka), dan pengulangan kata kunci",
              "Syarat koherensi: satu paragraf satu gagasan utama, urutan logis, dan tidak ada kalimat sumbang (tidak relevan)",
              "Pola pengembangan: umum-khusus (deduktif), khusus-umum (induktif), sebab-akibat, dan perbandingan",
              "Kalimat sumbang = kalimat yang tidak mendukung gagasan utama dan merusak koherensi",
              "Sisipan penanda transisi: 'di sisi lain', 'sejalan dengan itu', 'sebagai akibatnya', 'sebaliknya'",
            ],
            contoh: [
              {
                soal:
                  "Perbaiki koherensi paragraf: 'Olahraga pagi bermanfaat bagi tubuh. Banyak orang memilih berlari. Harga sepatu olahraga cukup mahal. Jantung menjadi lebih sehat dengan olahraga rutin.'",
                pembahasan:
                  "Kalimat ketiga sumbang karena membahas harga sepatu, bukan manfaat olahraga. Paragraf diperbaiki: 'Olahraga pagi bermanfaat bagi tubuh. Jantung menjadi lebih sehat jika olahraga dilakukan secara rutin. Selain itu, olahraga pagi membantu menjaga berat badan ideal.'",
              },
            ],
          },
          flashcards: [
            {
              id: "bi-menulis-teks-kohesi-koherensi-fc1",
              front: "Apa beda kohesi dan koherensi?",
              back: "Kohesi = keterpaduan bentuk (penanda bahasa antar kalimat). Koherensi = keterpaduan makna (kesinambungan gagasan).",
            },
            {
              id: "bi-menulis-teks-kohesi-koherensi-fc2",
              front: "Apa itu kalimat sumbang?",
              back: "Kalimat yang isinya tidak mendukung gagasan utama paragraf, sehingga mengganggu koherensi dan biasanya harus dihapus atau dipindahkan.",
            },
            {
              id: "bi-menulis-teks-kohesi-koherensi-fc3",
              front: "Sebutkan tiga jenis penanda kohesi.",
              back: "Konjungsi (karena itu, namun), pronomina (ini, mereka), dan pengulangan kata kunci atau sinonim.",
            },
            {
              id: "bi-menulis-teks-kohesi-koherensi-fc4",
              front: "Mengapa satu paragraf sebaiknya memuat satu gagasan utama?",
              back: "Agar pembaca mudah mengikuti alur pikiran; dua gagasan dalam satu paragraf membuat uraian tidak fokus dan koherensi menurun.",
            },
          ],
          quiz: [
            {
              id: "bi-menulis-teks-kohesi-koherensi-q1",
              question:
                "Kata 'namun' dan 'karena itu' dalam paragraf berfungsi sebagai penanda ...",
              options: ["Kohesi", "Kalimat sumbang", "Topik", "Simpulan"],
              correctIndex: 0,
              explanation:
                "Konjungsi seperti 'namun' dan 'karena itu' adalah penanda kohesi yang menghubungkan makna antar kalimat.",
            },
            {
              id: "bi-menulis-teks-kohesi-koherensi-q2",
              question:
                "Kalimat yang tidak relevan dengan gagasan utama paragraf disebut ...",
              options: ["Kalimat utama", "Kalimat sumbang", "Kalimat penjelas", "Kalimat topik"],
              correctIndex: 1,
              explanation:
                "Kalimat sumbang adalah kalimat keluar dari topik dan harus dihapus atau dipindahkan agar koherensi terjaga.",
            },
            {
              id: "bi-menulis-teks-kohesi-koherensi-q3",
              question:
                "Paragraf yang gagasan umumnya diletakkan di awal lalu dirinci disebut berpola ...",
              options: ["Induktif", "Deduktif", "Campuran", "Sebab-akibat"],
              correctIndex: 1,
              explanation:
                "Pola deduktif menempatkan gagasan umum di awal, kemudian diikuti penjelasan yang lebih khusus.",
            },
            {
              id: "bi-menulis-teks-kohesi-koherensi-q4",
              question:
                "Cara paling tepat memperbaiki paragraf yang melompat-lompat gagasannya adalah ...",
              options: [
                "Menambahkan konjungsi dan mengurutkan gagasan secara logis",
                "Memperpanjang setiap kalimat",
                "Menambah kalimat baru sebanyak mungkin",
                "Menghapus semua kalimat penjelas",
              ],
              correctIndex: 0,
              explanation:
                "Koherensi diperbaiki dengan menata urutan gagasan logis dan menambah penanda transisi yang tepat.",
            },
          ],
          latihanSoal: [
            {
              id: "bi-menulis-teks-kohesi-koherensi-l1",
              level: "hots",
              question:
                "Perbaiki paragraf berikut agar kohesif dan koheren: 'Pemerintah menargetkan penurunan emisi karbon. Sektor transportasi menyumbang emisi terbesar. Sepeda listrik mulai populer di kota besar. Banyak warga beralih ke transportasi umum. Harga tiket bus terjangkau. Transportasi ramah lingkungan perlu didorong dengan kebijakan yang konsisten.' (a) Tentukan kalimat sumbang. (b) Susun ulang paragraf dengan penanda kohesi yang tepat. (c) Sebutkan pola pengembangan yang dipakai. (d) Jelaskan mengapa penambahan penanda kohesi memperbaiki keterbacaan.",
              langkah: [
                "Tentukan gagasan utama: perlunya mendorong transportasi ramah lingkungan untuk menurunkan emisi karbon.",
                "Periksa relevansi tiap kalimat terhadap gagasan utama tersebut.",
                "Kalimat 'Harga tiket bus terjangkau' tidak mendukung gagasan utama dan tidak terkait langsung dengan emisi, sehingga tergolong kalimat sumbang (atau butuh penjelas lanjutan agar relevan).",
                "Susun ulang dengan urutan logis: masalah emisi, penyumbang terbesar, solusi ramah lingkungan, bukti adopsi, dan penutup berupa kebijakan.",
                "Tambahkan penanda kohesi: 'Sektor transportasi merupakan penyumbang terbesar...', 'Oleh karena itu...', 'Sejalan dengan itu...', 'Dengan demikian...'.",
                "Susun paragraf hasil: 'Pemerintah menargetkan penurunan emisi karbon. Sektor transportasi menjadi penyumbang emisi terbesar. Oleh karena itu, transportasi ramah lingkungan perlu didorong. Sejalan dengan itu, sepeda listrik mulai populer dan banyak warga beralih ke transportasi umum. Dengan demikian, kebijakan yang konsisten sangat dibutuhkan.'",
                "Pola pengembangan: umum-khusus lalu diakhiri simpulan (campuran deduktif-induktif).",
                "Jelaskan manfaat penanda kohesi: pembaca langsung memahami hubungan antar gagasan sehingga tidak perlu menebak alur pikiran penulis.",
              ],
              jawaban:
                "(a) Kalimat sumbang: 'Harga tiket bus terjangkau.' (b) Paragraf hasil: 'Pemerintah menargetkan penurunan emisi karbon. Sektor transportasi menjadi penyumbang emisi terbesar. Oleh karena itu, transportasi ramah lingkungan perlu didorong. Sejalan dengan itu, sepeda listrik mulai populer dan banyak warga beralih ke transportasi umum. Dengan demikian, kebijakan yang konsisten sangat dibutuhkan.' (c) Campuran deduktif-induktif (d) Penanda kohesi membuat hubungan gagasan tersurat sehingga pembaca tidak perlu menebak alurnya.",
            },
            {
              id: "bi-menulis-teks-kohesi-koherensi-l2",
              level: "sulit",
              question:
                "Diberikan paragraf acak tanpa penanda: 'Banyak siswa mengalami kesulitan menulis akademik. Kemampuan membaca kritis sangat penting. Guru melaporkan hasil tulisan siswa kurang terstruktur. Pembelajaran literasi perlu diperkuat. Kurikulum menekankan kemampuan analisis.' (a) Tentukan gagasan utama yang paling mungkin. (b) Urutkan menjadi paragraf koheren dengan minimal empat penanda kohesi. (c) Jelaskan syarat koherensi yang kamu penuhi. (d) Sebutkan satu risiko bila penanda kohesi dihilangkan.",
              langkah: [
                "Identifikasi benang merah semua kalimat: kesulitan literasi akademik siswa dan perlunya penguatan pembelajaran.",
                "Rumuskan gagasan utama: penguatan pembelajaran literasi diperlukan karena banyak siswa belum menguasai penulisan akademik dan analisis.",
                "Urutkan dengan pola masalah-latar-penyebab-solusi: kesulitan siswa, laporan guru, tuntutan kurikulum, pentingnya literasi, dan solusi.",
                "Sisipkan penanda kohesi 1: 'Sebagai contoh' untuk menghubungkan gejala dengan perincian.",
                "Sisipkan penanda kohesi 2: 'Sementara itu' untuk menambahkan tuntutan kurikulum sebagai latar.",
                "Sisipkan penanda kohesi 3: 'Oleh karena itu' sebagai jembatan menuju simpulan kebutuhan literasi kritis.",
                "Sisipkan penanda kohesi 4: 'Dengan demikian' sebagai penutup yang menyatakan solusi.",
                "Periksa syarat koherensi: satu gagasan utama, urutan logis, tidak ada kalimat sumbang, dan tiap kalimat berkontribusi pada simpulan.",
                "Jelaskan risikonya: tanpa penanda kohesi, pembaca bisa salah menghubungkan hubungan sebab-akibat antargagasan.",
              ],
              jawaban:
                "(a) Penguatan pembelajaran literasi diperlukan karena siswa belum menguasai penulisan akademik dan analisis (b) Contoh urutan: 'Banyak siswa mengalami kesulitan menulis akademik. Sebagai contoh, guru melaporkan hasil tulisan siswa kurang terstruktur. Sementara itu, kurikulum menekankan kemampuan analisis. Oleh karena itu, kemampuan membaca kritis sangat penting. Dengan demikian, pembelajaran literasi perlu diperkuat.' (c) Memenuhi satu gagasan utama, urutan logis, dan tanpa kalimat sumbang (d) Risikonya hubungan antargagasan menjadi kabur sehingga pembaca salah menafsirkan sebab-akibat.",
            },
          ],
          tkaSoal: [
            {
              id: "bi-menulis-teks-kohesi-koherensi-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Yang dimaksud kohesi dalam paragraf adalah ...",
              options: [
                { id: "A", text: "keterpaduan makna antargagasan dalam paragraf" },
                { id: "B", text: "keterpaduan bentuk, misalnya kata rujukan dan konjungsi yang menautkan kalimat" },
                { id: "C", text: "jumlah kalimat dalam satu paragraf" },
                { id: "D", text: "panjang rata-rata kalimat" },
                { id: "E", text: "kedudukan gagasan utama di awal paragraf" },
              ],
              correctIds: ["B"],
              explanation:
                "Kohesi adalah keterpaduan bentuk atau unsur kebahasaan, seperti kata rujukan, pengulangan, dan konjungsi. Adapun keterpaduan makna antargagasan disebut koherensi (opsi A).",
            },
            {
              id: "bi-menulis-teks-kohesi-koherensi-tka2",
              bentuk: "pg",
              level: "L2",
              stimulus:
                "Bacalah paragraf berikut! 'Banyak siswa mengalami kesulitan menulis akademik. Guru melaporkan hasil tulisan siswa kurang terstruktur. Kurikulum menekankan kemampuan analisis. Kemampuan membaca kritis sangat penting. Pembelajaran literasi perlu diperkuat.'",
              question: "Kelemahan utama paragraf tersebut adalah ...",
              options: [
                { id: "A", text: "memuat terlalu banyak penanda kohesi" },
                { id: "B", text: "hubungan antargagasan tidak ditautkan sehingga paragraf terasa terputus-putus" },
                { id: "C", text: "gagasan utamanya diletakkan di awal" },
                { id: "D", text: "paragrafnya terlalu panjang" },
                { id: "E", text: "tidak memiliki gagasan utama sama sekali" },
              ],
              correctIds: ["B"],
              explanation:
                "Paragraf itu tidak memakai penanda kohesi seperti 'sebagai contoh', 'sementara itu', atau 'oleh karena itu', sehingga hubungan sebab-akibat dan penambahannya kabur. Gagasan utamanya ada, tetapi tidak ditautkan dengan kalimat lain.",
            },
            {
              id: "bi-menulis-teks-kohesi-koherensi-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              question:
                "Pilih semua unsur yang berfungsi membangun kohesi dalam paragraf. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "Kata rujukan seperti 'hal ini' dan 'tersebut'" },
                { id: "B", text: "Konjungsi seperti 'oleh karena itu' dan 'sementara itu'" },
                { id: "C", text: "Pengulangan kata kunci secara terkendali" },
                { id: "D", text: "Jumlah kalimat yang banyak dalam satu paragraf" },
                { id: "E", text: "Kata asing yang sulit dipahami pembaca" },
              ],
              correctIds: ["A", "B", "C"],
              explanation:
                "Kohesi dibangun melalui rujukan (A), konjungsi (B), dan pengulangan terkendali atau rantai leksikal (C). Banyaknya kalimat tidak menjamin kohesi (D), dan kata asing yang menyulitkan justru mengganggu keterbacaan (E).",
            },
            {
              id: "bi-menulis-teks-kohesi-koherensi-tka4",
              bentuk: "isian",
              level: "L3",
              question:
                "Tuliskan istilah untuk keterpaduan MAKNA antargagasan dalam sebuah paragraf (satu kata).",
              correctIds: ["koherensi"],
              explanation:
                "Istilahnya koherensi, yaitu keterpaduan makna sehingga gagasan-gagasan dalam paragraf tersusun logis dan membentuk satu kesatuan. Kohesi menyangkut bentuk, sedangkan koherensi menyangkut makna.",
            },
          ],
        },
      ],
    },
    {
      id: "bi-kebahasaaan",
      title: "Kebahasaaan",
      order: 3,
      subtopics: [
        {
          id: "bi-kebahasaaan-afiksasi",
          title: "Tata Kata & Imbuhan (Afiksasi)",
          estimatedMinutes: 30,
          materi: {
            ringkasan:
              "Afiksasi adalah proses pembentukan kata dengan menambahkan imbuhan pada bentuk dasar. Imbuhan Indonesia meliputi awalan (prefiks), sisipan (infiks), akhiran (sufiks), dan gabungan awalan-akhiran (konfiks). Pemilihan imbuhan harus memperhatikan bentuk dasar dan makna yang diinginkan.",
            rumus: [
              "Prefiks: meN-, ber-, di-, ter-, peN-, per-, se-",
              "Sufiks: -kan, -i, -nya, -an, -wan, -wati",
              "Konfiks: ke-...-an, peN-...-an, per-...-an, ber-...-an, se-...-nya",
              "meN- berubah bentuk: me- (baca), mem- (baca→membaca), men- (tulis→menulis), meng- (ambil→mengambil), menge- (cat→mengecat)",
              "Fungsi meN-: membentuk verba aktif transitif; fungsi di-: membentuk verba pasif",
            ],
            contoh: [
              {
                soal: "Tentukan bentuk yang benar: 'mem-' + 'pukul' atau 'meng-' + 'pukul'?",
                pembahasan:
                  "Bentuk dasar 'pukul' berawal fonem /p/ yang luluh, sehingga imbuhan meN- menjadi 'mem-': memukul.",
              },
              {
                soal: "Analisislah afiksasi kata 'keberhasilan'.",
                pembahasan:
                  "'Keberhasilan' berasal dari 'hasil' dengan konfiks ke-...-an dan sisipan '-ber-' (dari 'berhasil'). Prosesnya: hasil → berhasil (prefiks ber-) → keberhasilan (konfiks ke-...-an). Berfungsi sebagai nomina yang berarti keadaan berhasil.",
              },
            ],
          },
          flashcards: [
            {
              id: "bi-kebahasaaan-afiksasi-fc1",
              front: "Kapan meN- berubah menjadi 'mem-'?",
              back: "Saat bentuk dasar diawali fonem /b/, /p/, /f/, atau /v/, dan fonem /p/ luluh: baca → membaca, pukul → memukul.",
            },
            {
              id: "bi-kebahasaaan-afiksasi-fc2",
              front: "Apa perbedaan 'peN-' dan 'per-'?",
              back: "'peN-' membentuk nomina pelaku atau alat (penulis, penggaris), sedangkan 'per-' membentuk verba atau nomina yang berarti membuat jadi (perbesar, pertemuan).",
            },
            {
              id: "bi-kebahasaaan-afiksasi-fc3",
              front: "Apa itu konfiks dan bagaimana membuktikannya?",
              back: "Konfiks adalah imbuhan yang dipakai sekaligus sebagai satu kesatuan (ke-...-an, peN-...-an). Buktinya, kata itu tidak ada bila hanya dipakai salah satu bagiannya: 'kehasilan' atau 'hasilan' tidak baku.",
            },
            {
              id: "bi-kebahasaaan-afiksasi-fc4",
              front: "Sebutkan makna umum akhiran '-kan' dan '-i'.",
              back: "'-kan' menyatakan tindakan untuk orang lain atau menjadikan sesuatu (kirimkan, besarkan); '-i' menyatakan tindakan berulang atau mengenai objek (kirimi, besari).",
            },
          ],
          quiz: [
            {
              id: "bi-kebahasaaan-afiksasi-q1",
              question: "Bentuk yang benar dari 'meN-' + 'tulis' adalah ...",
              options: ["Menulis", "Memtulis", "Mentulis", "Mengtulis"],
              correctIndex: 0,
              explanation:
                "Bentuk dasar berawal /t/ berubah menjadi 'men-' sehingga hasilnya 'menulis'.",
            },
            {
              id: "bi-kebahasaaan-afiksasi-q2",
              question: "Kata 'pengganti' terbentuk dari ...",
              options: [
                "peN- + ganti",
                "per- + ganti",
                "peN- + ganti + -an",
                "se- + ganti",
              ],
              correctIndex: 0,
              explanation:
                "'Ganti' diawali /g/ sehingga meN-/peN- berubah menjadi 'peng-' dan menghasilkan 'pengganti'.",
            },
            {
              id: "bi-kebahasaaan-afiksasi-q3",
              question: "Kata berikut yang memakai konfiks ke-...-an adalah ...",
              options: ["Kebaikan", "Kebun", "Kecil", "Kemudian"],
              correctIndex: 0,
              explanation:
                "'Kebaikan' berasal dari 'baik' dengan konfiks ke-...-an; bentuk 'ke-baik' atau 'baik-an' tidak berdiri sendiri.",
            },
            {
              id: "bi-kebahasaaan-afiksasi-q4",
              question: "Makna akhiran '-i' pada kata 'menandatangani' adalah ...",
              options: [
                "Menyatakan tindakan untuk orang lain",
                "Menyatakan tindakan yang berkenaan dengan objek",
                "Menyatakan membuat jadi",
                "Menyatakan alat",
              ],
              correctIndex: 1,
              explanation:
                "Akhiran '-i' menandai tindakan yang berkenaan dengan objek, sedangkan '-kan' menandai tindakan untuk pihak lain atau menjadikan.",
            },
          ],
          latihanSoal: [
            {
              id: "bi-kebahasaaan-afiksasi-l1",
              level: "hots",
              question:
                "Perbaiki kesalahan afiksasi pada kalimat berikut dan jelaskan aturannya: (1) 'Pemerintah akan mengsosialisasikan kebijakan baru itu.' (2) 'Kami menghimbau warga untuk tetap tenang.' (3) 'Panitia telah mensukseskan acara tersebut.' (4) 'Ia menterjemahkan dokumen itu ke bahasa Indonesia.'",
              langkah: [
                "Analisis (1): bentuk dasar 'sosialisasi' berawal /s/ yang luluh, sehingga imbuhan meN- menjadi 'meny-'. Bentuk benar: 'mensosialisasikan' hanya jika /s/ tidak luluh; untuk kata serapan ini bentuk baku adalah 'menyosialisasikan'... periksa KBBI: kata bakunya 'menyosialisasikan'.",
                "Analisis (2): bentuk dasar 'imbau' berawal vokal, jadi meN- menjadi 'meng-'. Bentuk benar: 'mengimbau', bukan 'menghimbau'.",
                "Analisis (3): bentuk dasar 'sukses' berawal /s/ yang luluh, sehingga meN- menjadi 'meny-'. Bentuk benar: 'menyukseskan'.",
                "Analisis (4): bentuk dasar 'terjemah' berawal /t/ yang luluh, sehingga meN- menjadi 'men-'. Bentuk benar: 'menerjemahkan'.",
                "Rumuskan aturan umum: fonem awal /s/, /t/, /p/ luluh saat diberi meN-, sedangkan fonem /k/ juga luluh (kunci → mengunci).",
                "Periksa konsistensi: bandingkan dengan kata baku seperti 'menyapu' (dari sapu), 'menerjemahkan' (dari terjemah), 'memukul' (dari pukul).",
                "Susun kalimat perbaikan lengkap dan pastikan makna tetap sama.",
              ],
              jawaban:
                "(1) 'Pemerintah akan menyosialisasikan kebijakan baru itu.' (2) 'Kami mengimbau warga untuk tetap tenang.' (3) 'Panitia telah menyukseskan acara tersebut.' (4) 'Ia menerjemahkan dokumen itu ke bahasa Indonesia.' Aturannya: meN- berubah sesuai fonem awal bentuk dasar, dan fonem /s/, /t/, /p/, /k/ luluh.",
            },
            {
              id: "bi-kebahasaaan-afiksasi-l2",
              level: "sulit",
              question:
                "Analisislah proses afiksasi dan tentukan jenis serta maknanya untuk kata-kata berikut: (a) 'pertumbuhan', (b) 'kesenjangan', (c) 'berdatangan', (d) 'menyebarluaskan'. Lalu jelaskan perbedaan fungsi konfiks 'ke-...-an' dan 'peN-...-an'.",
              langkah: [
                "Analisis (a) 'pertumbuhan': bentuk dasar 'tumbuh' + konfiks 'per-...-an'. Jenisnya nomina, maknanya menyatakan proses atau hasil perbuatan tumbuh.",
                "Analisis (b) 'kesenjangan': bentuk dasar 'senjang' + konfiks 'ke-...-an'. Jenisnya nomina, maknanya menyatakan keadaan atau hal yang berkaitan dengan senjang.",
                "Analisis (c) 'berdatangan': bentuk dasar 'datang' + konfiks 'ber-...-an'. Jenisnya verba, maknanya menyatakan perbuatan yang dilakukan banyak pelaku secara berulang.",
                "Analisis (d) 'menyebarluaskan': bentuk dasar 'sebar luas' + konfiks 'meN-...-kan'. Jenisnya verba, maknanya menyatakan tindakan membuat sesuatu menjadi tersebar luas.",
                "Bandingkan konfiks 'ke-...-an' dan 'peN-...-an': 'ke-...-an' umumnya membentuk nomina yang menyatakan keadaan abstrak (keadaan, hal, sifat).",
                "Lanjutkan: 'peN-...-an' umumnya membentuk nomina yang menyatakan proses atau hasil tindakan, sering berpasangan dengan verba meN- (penulisan dari menulis).",
                "Uji pasangan: 'penulisan' (dari menulis) menunjukkan proses, sedangkan 'ketelitian' (dari teliti) menunjukkan keadaan atau sifat.",
                "Simpulkan: pilihan konfiks bergantung pada apakah yang ingin dinyatakan adalah keadaan/sifat atau proses/hasil tindakan.",
              ],
              jawaban:
                "(a) 'tumbuh' + per-...-an: nomina, menyatakan proses tumbuh (b) 'senjang' + ke-...-an: nomina, menyatakan keadaan senjang (c) 'datang' + ber-...-an: verba, menyatakan banyak pelaku melakukan berulang (d) 'sebar luas' + meN-...-kan: verba, menyatakan membuat jadi tersebar luas. Konfiks 'ke-...-an' membentuk nomina keadaan/sifat; 'peN-...-an' membentuk nomina proses/hasil tindakan yang berpasangan dengan verba meN-.",
            },
          ],
          tkaSoal: [
            {
              id: "bi-kebahasaaan-afiksasi-tka1",
              bentuk: "pg",
              level: "L1",
              question:
                "Konfiks 'ke-...-an' pada kata 'ketelitian' membentuk kata bermakna ...",
              options: [
                { id: "A", text: "pelaku tindakan" },
                { id: "B", text: "keadaan atau sifat" },
                { id: "C", text: "alat untuk melakukan tindakan" },
                { id: "D", text: "tempat melakukan tindakan" },
                { id: "E", text: "tindakan yang berulang" },
              ],
              correctIds: ["B"],
              explanation:
                "'Ketelitian' berasal dari kata sifat 'teliti' dan menyatakan keadaan atau sifat. Konfiks 'ke-...-an' paling sering membentuk nomina keadaan, sedangkan pelaku biasanya dibentuk oleh '-er' atau 'peN-'.",
            },
            {
              id: "bi-kebahasaaan-afiksasi-tka2",
              bentuk: "pg",
              level: "L2",
              question: "Kata berimbuhan yang bermakna 'proses menulis' adalah ...",
              options: [
                { id: "A", text: "penulis" },
                { id: "B", text: "penulisan" },
                { id: "C", text: "tertulis" },
                { id: "D", text: "tulisan" },
                { id: "E", text: "menulis" },
              ],
              correctIds: ["B"],
              explanation:
                "'Penulisan' (peN-...-an) menyatakan proses atau hasil tindakan menulis. 'Penulis' adalah pelaku, 'tertulis' menyatakan keadaan, 'tulisan' hasil, dan 'menulis' adalah verbanya.",
            },
            {
              id: "bi-kebahasaaan-afiksasi-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              question:
                "Pilih semua pasangan yang benar antara konfiks dan makna yang dibentuknya. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "'ke-...-an' pada 'keadaan' → menyatakan keadaan atau sifat" },
                { id: "B", text: "'peN-...-an' pada 'penguatan' → menyatakan proses atau hasil tindakan" },
                { id: "C", text: "'ber-...-an' pada 'berdatangan' → menyatakan banyak pelaku melakukan berulang" },
                { id: "D", text: "'meN-...-kan' pada 'menyebarluaskan' → menyatakan perbuatan yang bermakna 'membuat jadi'" },
                { id: "E", text: "'-an' pada 'tulisan' → menyatakan pelaku tindakan" },
              ],
              correctIds: ["A", "B", "C", "D"],
              explanation:
                "Konfiks 'ke-...-an' membentuk nomina keadaan (A), 'peN-...-an' membentuk nomina proses atau hasil (B), 'ber-...-an' menyatakan kegiatan banyak pelaku (C), dan 'meN-...-kan' bermakna 'membuat jadi' (D) sehingga semuanya benar. Akhiran '-an' pada 'tulisan' menyatakan hasil, bukan pelaku, karena pelaku dinyatakan oleh 'penulis' (E salah).",
            },
            {
              id: "bi-kebahasaaan-afiksasi-tka4",
              bentuk: "isian",
              level: "L2",
              question:
                "Kata dasar 'datang' mendapat konfiks 'ber-...-an'. Tuliskan bentuk lengkap kata itu.",
              correctIds: ["berdatangan", "berdatang", "berdatangan,"],
              explanation:
                "Bentuk yang benar adalah 'berdatangan', yang menyatakan bahwa banyak pelaku datang secara berulang atau bersamaan, misalnya 'siswa berdatangan ke aula'.",
            },
          ],
        },
        {
          id: "bi-kebahasaaan-konjungsi",
          title: "Konjungsi Antarkalimat/Antarklausa",
          estimatedMinutes: 30,
          materi: {
            ringkasan:
              "Konjungsi adalah kata penghubung yang merangkai klausa, kalimat, atau paragraf. Konjungsi intrakalimat menghubungkan klausa dalam satu kalimat, sedangkan konjungsi antarkalimat menghubungkan satu kalimat dengan kalimat sebelumnya dan selalu diikuti tanda koma.",
            rumus: [
              "Konjungsi koordinatif (setara): dan, atau, tetapi, sedangkan, melainkan, padahal",
              "Konjungsi subordinatif (bertingkat): karena, jika, ketika, sehingga, agar, walaupun, meskipun",
              "Konjungsi korelatif: baik...maupun, tidak hanya...tetapi juga, entah...entah",
              "Konjungsi antarkalimat: oleh karena itu, dengan demikian, selain itu, namun, sebaliknya, akibatnya",
              "Aturan tanda baca: konjungsi intrakalimat tidak didahului koma, sedangkan konjungsi antarkalimat diikuti koma",
              "Konjungsi kausalitas: karena (sebab) dan sehingga/akibatnya (akibat) — jangan dipakai bersamaan dalam satu kalimat",
            ],
            contoh: [
              {
                soal: "Perbaiki: 'Karena hujan deras, sehingga acara dibatalkan.'",
                pembahasan:
                  "Kalimat ini memakai konjungsi kausalitas ganda (karena dan sehingga). Pilih salah satu: 'Karena hujan deras, acara dibatalkan.' atau 'Hujan deras, sehingga acara dibatalkan.'",
              },
              {
                soal: "Perbaiki: 'Ia rajin belajar, tetapi ia tidak lulus ujian.' dan jelaskan pilihan konjungsinya.",
                pembahasan:
                  "Kalimat ini sudah benar karena 'tetapi' menghubungkan klausa yang berlawanan. Koma dipakai karena menghubungkan dua klausa setara yang cukup panjang.",
              },
            ],
          },
          flashcards: [
            {
              id: "bi-kebahasaaan-konjungsi-fc1",
              front: "Bedakan konjungsi intrakalimat dan antarkalimat.",
              back: "Intrakalimat menghubungkan klausa dalam satu kalimat (dan, karena). Antarkalimat menghubungkan kalimat dengan kalimat sebelumnya dan diikuti koma (oleh karena itu, selain itu).",
            },
            {
              id: "bi-kebahasaaan-konjungsi-fc2",
              front: "Mengapa 'karena...sehingga' dalam satu kalimat salah?",
              back: "Keduanya menandai hubungan sebab-akibat, sehingga pemakaian bersamaan menjadi berlebihan (redundan) dan tidak baku.",
            },
            {
              id: "bi-kebahasaaan-konjungsi-fc3",
              front: "Sebutkan contoh konjungsi korelatif.",
              back: "Baik...maupun, tidak hanya...tetapi juga, entah...entah, bukan...melainkan.",
            },
            {
              id: "bi-kebahasaaan-konjungsi-fc4",
              front: "Apa fungsi konjungsi 'sedangkan' dan 'melainkan'?",
              back: "'Sedangkan' menandai pertentangan atau perbandingan antarklausa setara. 'Melainkan' menandai penggantian/koreksi setelah pernyataan negatif.",
            },
          ],
          quiz: [
            {
              id: "bi-kebahasaaan-konjungsi-q1",
              question: "Kalimat berikut yang benar adalah ...",
              options: [
                "Karena ia rajin, sehingga ia berhasil.",
                "Karena ia rajin, ia berhasil.",
                "Ia rajin, sehingga karena ia berhasil.",
                "Karena sehingga ia rajin, ia berhasil.",
              ],
              correctIndex: 1,
              explanation:
                "Hanya satu konjungsi kausalitas yang dipakai: 'Karena ia rajin, ia berhasil.'",
            },
            {
              id: "bi-kebahasaaan-konjungsi-q2",
              question: "Konjungsi 'oleh karena itu' termasuk konjungsi ...",
              options: ["Intrakalimat", "Antarkalimat", "Korelatif", "Subordinatif"],
              correctIndex: 1,
              explanation:
                "'Oleh karena itu' menghubungkan kalimat dengan kalimat sebelumnya dan diikuti tanda koma.",
            },
            {
              id: "bi-kebahasaaan-konjungsi-q3",
              question:
                "Kalimat 'Ia bukan guru, ... dosen.' Konjungsi yang tepat adalah ...",
              options: ["tetapi", "melainkan", "sedangkan", "namun"],
              correctIndex: 1,
              explanation:
                "Setelah pernyataan negatif ('bukan'), konjungsi yang tepat adalah 'melainkan'.",
            },
            {
              id: "bi-kebahasaaan-konjungsi-q4",
              question: "Konjungsi korelatif yang tepat adalah ...",
              options: [
                "Baik siswa maupun guru hadir.",
                "Baik siswa atau guru hadir.",
                "Siswa baik maupun guru hadir.",
                "Baik siswa dan maupun guru hadir.",
              ],
              correctIndex: 0,
              explanation:
                "'Baik...maupun' adalah pasangan konjungsi korelatif yang baku dan dipakai secara berpasangan.",
            },
          ],
          latihanSoal: [
            {
              id: "bi-kebahasaaan-konjungsi-l1",
              level: "hots",
              question:
                "Perbaiki paragraf berikut dengan memilih konjungsi yang tepat, lalu jelaskan alasan setiap perbaikan: 'Karena harga bahan bakar naik, sehingga biaya transportasi meningkat. Oleh karena itu banyak pedagang menaikkan harga. Tetapi, daya beli masyarakat menurun karena sehingga penjualan ikut turun. Selain itu walaupun pemerintah memberi subsidi, namun belum cukup membantu.'",
              langkah: [
                "Perbaikan 1: 'Karena...sehingga' redundan; pilih salah satu. Hasil: 'Karena harga bahan bakar naik, biaya transportasi meningkat.'",
                "Perbaikan 2: 'Oleh karena itu' sebagai konjungsi antarkalimat harus diikuti koma. Hasil: 'Oleh karena itu, banyak pedagang menaikkan harga.'",
                "Perbaikan 3: 'karena sehingga' redundan; cukup pakai 'sehingga'. Hasil: '...daya beli masyarakat menurun sehingga penjualan ikut turun.'",
                "Perbaikan 4: 'Selain itu' sebagai konjungsi antarkalimat harus diikuti koma. Hasil: 'Selain itu, ...'",
                "Perbaikan 5: 'walaupun...namun' redundan karena keduanya menandai konsesi; pilih satu. Hasil: '...walaupun pemerintah memberi subsidi, bantuan itu belum cukup.'",
                "Perbaikan 6: konjungsi 'Tetapi' di awal kalimat sebaiknya diganti dengan konjungsi antarkalimat yang lebih baku, misalnya 'Namun,' diikuti koma.",
                "Periksa keseluruhan: pastikan setiap kalimat hanya memakai satu penanda hubungan logis agar tidak tumpang tindih.",
                "Susun paragraf hasil akhir dan periksa keterbacaannya.",
              ],
              jawaban:
                "Hasil perbaikan: 'Karena harga bahan bakar naik, biaya transportasi meningkat. Oleh karena itu, banyak pedagang menaikkan harga. Namun, daya beli masyarakat menurun sehingga penjualan ikut turun. Selain itu, walaupun pemerintah memberi subsidi, bantuan itu belum cukup.' Alasan: menghindari konjungsi kausalitas dan konsesi ganda, serta menambahkan koma setelah konjungsi antarkalimat.",
            },
            {
              id: "bi-kebahasaaan-konjungsi-l2",
              level: "sulit",
              question:
                "Analisislah jenis dan fungsi konjungsi pada kalimat berikut: 'Meskipun biaya produksi meningkat, perusahaan tidak menaikkan harga karena ingin menjaga pangsa pasar, sehingga laba tahun ini diperkirakan turun; oleh karena itu, manajemen menyiapkan strategi efisiensi.' (a) Sebutkan semua konjungsi dan jenisnya. (b) Jelaskan hubungan logis yang dibangun tiap konjungsi. (c) Tentukan klausa utama. (d) Ubah kalimat itu menjadi dua kalimat dengan konjungsi antarkalimat.",
              langkah: [
                "Identifikasi konjungsi 1: 'Meskipun' termasuk konjungsi subordinatif konsesif (menyatakan pengakuan pertentangan).",
                "Identifikasi konjungsi 2: 'karena' termasuk konjungsi subordinatif kausal (menyatakan sebab).",
                "Identifikasi konjungsi 3: 'sehingga' termasuk konjungsi subordinatif konsekutif (menyatakan akibat).",
                "Identifikasi konjungsi 4: 'oleh karena itu' termasuk konjungsi antarkalimat (menyatakan simpulan tindakan).",
                "Hubungan logis: 'Meskipun' menandai kondisi yang biasanya menghalangi, 'karena' memberi alasan keputusan, 'sehingga' menyatakan hasilnya, dan 'oleh karena itu' menyimpulkan langkah lanjutan.",
                "Tentukan klausa utama: 'perusahaan tidak menaikkan harga' — inilah inti kalimat yang tidak bergantung pada klausa lain.",
                "Ubah menjadi dua kalimat: pecah setelah kata 'turun' dan ganti 'oleh karena itu' menjadi awal kalimat baru dengan koma.",
                "Hasil pemecahan: 'Meskipun biaya produksi meningkat, perusahaan tidak menaikkan harga karena ingin menjaga pangsa pasar. Akibatnya, laba tahun ini diperkirakan turun. Oleh karena itu, manajemen menyiapkan strategi efisiensi.'",
                "Periksa bahwa pemecahan tidak menghilangkan hubungan logis antar gagasan.",
              ],
              jawaban:
                "(a) 'Meskipun' konsesif, 'karena' kausal, 'sehingga' konsekutif, 'oleh karena itu' antarkalimat (b) Meskipun = pertentangan yang diakui; karena = sebab; sehingga = akibat; oleh karena itu = simpulan tindakan (c) Klausa utama: 'perusahaan tidak menaikkan harga' (d) 'Meskipun biaya produksi meningkat, perusahaan tidak menaikkan harga karena ingin menjaga pangsa pasar. Akibatnya, laba tahun ini diperkirakan turun. Oleh karena itu, manajemen menyiapkan strategi efisiensi.'",
            },
          ],
          tkaSoal: [
            {
              id: "bi-kebahasaaan-konjungsi-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Konjungsi 'sehingga' menyatakan hubungan ...",
              options: [
                { id: "A", text: "pertentangan" },
                { id: "B", text: "sebab" },
                { id: "C", text: "akibat" },
                { id: "D", text: "penambahan" },
                { id: "E", text: "pilihan" },
              ],
              correctIds: ["C"],
              explanation:
                "'Sehingga' adalah konjungsi subordinatif konsekutif yang menyatakan akibat. Pertentangan dinyatakan 'tetapi' atau 'meskipun', sebab oleh 'karena', penambahan oleh 'dan', dan pilihan oleh 'atau'.",
            },
            {
              id: "bi-kebahasaaan-konjungsi-tka2",
              bentuk: "pg",
              level: "L2",
              stimulus:
                "Bacalah kalimat berikut! 'Meskipun biaya produksi meningkat, perusahaan tidak menaikkan harga karena ingin menjaga pangsa pasar.'",
              question: "Hubungan logis yang tepat untuk kedua konjungsi tersebut adalah ...",
              options: [
                { id: "A", text: "'Meskipun' menyatakan sebab dan 'karena' menyatakan akibat" },
                { id: "B", text: "'Meskipun' menyatakan pertentangan yang diakui dan 'karena' menyatakan sebab" },
                { id: "C", text: "Keduanya menyatakan penambahan informasi" },
                { id: "D", text: "'Meskipun' menyatakan pilihan dan 'karena' menyatakan akibat" },
                { id: "E", text: "'Meskipun' menyatakan akibat dan 'karena' menyatakan pertentangan" },
              ],
              correctIds: ["B"],
              explanation:
                "'Meskipun' bersifat konsesif, yaitu mengakui keadaan yang seharusnya menghalangi, sedangkan 'karena' menyatakan sebab dari keputusan yang diambil. Jadi hubungannya pertentangan yang diakui dan sebab.",
            },
            {
              id: "bi-kebahasaaan-konjungsi-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              stimulus:
                "Bacalah kalimat berikut! 'Meskipun biaya produksi meningkat, perusahaan tidak menaikkan harga karena ingin menjaga pangsa pasar, sehingga laba tahun ini diperkirakan turun. Oleh karena itu, manajemen menyiapkan strategi efisiensi.'",
              question:
                "Pilih semua pernyataan yang BENAR tentang kalimat tersebut. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "'Sehingga' menandai akibat dari keputusan tidak menaikkan harga" },
                { id: "B", text: "'Oleh karena itu' adalah konjungsi antarkalimat yang menandai simpulan tindakan" },
                { id: "C", text: "Klausa utamanya adalah 'perusahaan tidak menaikkan harga'" },
                { id: "D", text: "Klausa utamanya adalah 'Meskipun biaya produksi meningkat'" },
                { id: "E", text: "'Oleh karena itu' dapat diganti 'meskipun' tanpa mengubah makna" },
              ],
              correctIds: ["A", "B", "C"],
              explanation:
                "'Sehingga' menghubungkan keputusan dengan akibatnya berupa turunnya laba (A benar). 'Oleh karena itu' menyimpulkan langkah lanjutan dan bersifat antarkalimat (B benar). Klausa utama adalah bagian yang tidak bergantung pada klausa lain, yaitu 'perusahaan tidak menaikkan harga' (C benar, D salah karena klausa 'Meskipun...' adalah klausa terikat). Mengganti 'oleh karena itu' dengan 'meskipun' akan membalik hubungan logisnya (E salah).",
            },
            {
              id: "bi-kebahasaaan-konjungsi-tka4",
              bentuk: "isian",
              level: "L2",
              stimulus:
                "Bacalah kalimat berikut! 'Meskipun biaya produksi meningkat, perusahaan tidak menaikkan harga karena ingin menjaga pangsa pasar, sehingga laba tahun ini diperkirakan turun.'",
              question:
                "Tuliskan satu konjungsi dalam kalimat itu yang menyatakan pertentangan yang diakui (satu kata).",
              correctIds: ["meskipun", "meskipun,"],
              explanation:
                "Konjungsi konsesif 'meskipun' mengakui adanya keadaan yang biasanya menghalangi, yaitu kenaikan biaya produksi, tetapi keputusan tetap diambil. Inilah yang membedakannya dari konjungsi pertentangan biasa seperti 'tetapi'.",
            },
          ],
        },
        {
          id: "bi-kebahasaaan-tanda-baca",
          title: "Tanda Baca & Penulisan Huruf",
          estimatedMinutes: 30,
          materi: {
            ringkasan:
              "Tanda baca mengatur jeda, intonasi, dan hubungan makna dalam tulisan. Kesalahan tanda baca dapat mengubah makna kalimat secara drastis, sehingga penguasaan aturan PUEBI sangat penting dalam penulisan formal.",
            rumus: [
              "Titik (.) mengakhiri kalimat berita; koma (,) memisahkan unsur perincian dan memisahkan klausa",
              "Titik koma (;) memisahkan klausa setara yang panjang atau perincian yang sudah memuat koma",
              "Titik dua (:) dipakai sebelum pemerian, penjelasan, atau kutipan lengkap",
              "Tanda hubung (-) untuk kata ulang dan gabungan kata; tanda pisah (—) untuk rentang dan sisipan",
              "Tanda petik (\") untuk kutipan langsung; tanda petik tunggal (') untuk kutipan dalam kutipan atau judul bagian",
              "Huruf miring dipakai untuk judul buku/istilah asing yang belum diserap; nama diri tidak dimiringkan",
            ],
            contoh: [
              {
                soal: "Perbaiki tanda baca: 'Ia membeli buku, pensil dan penghapus.'",
                pembahasan:
                  "Dalam perincian lebih dari dua unsur, tanda koma dipakai sebelum 'dan'. Kalimat benar: 'Ia membeli buku, pensil, dan penghapus.'",
              },
              {
                soal: "Perbaiki: 'Kesimpulannya: bahwa masalah ini perlu segera diatasi.'",
                pembahasan:
                  "Tanda titik dua tidak dipakai bersama kata 'bahwa' karena fungsinya sama-sama menandai pemerian. Kalimat benar: 'Kesimpulannya, masalah ini perlu segera diatasi.'",
              },
            ],
          },
          flashcards: [
            {
              id: "bi-kebahasaaan-tanda-baca-fc1",
              front: "Kapan tanda titik dua dipakai?",
              back: "Sebelum pemerian atau perincian, sebelum penjelasan, pada kutipan lengkap setelah kata pengantar, dan pada nisbah atau perbandingan.",
            },
            {
              id: "bi-kebahasaaan-tanda-baca-fc2",
              front: "Kapan tanda titik koma dipakai?",
              back: "Untuk memisahkan klausa setara yang panjang dan untuk memisahkan perincian yang bagian-bagiannya sudah mengandung koma.",
            },
            {
              id: "bi-kebahasaaan-tanda-baca-fc3",
              front: "Bolehkah tanda titik dua dipakai bersama kata 'bahwa'?",
              back: "Tidak. Keduanya sama-sama menandai pemerian, sehingga pemakaian bersamaan menjadi mubazir dan tidak baku.",
            },
            {
              id: "bi-kebahasaaan-tanda-baca-fc4",
              front: "Kapan huruf miring dipakai?",
              back: "Untuk judul buku/majalah, istilah asing atau daerah yang belum diserap, penegasan kata, dan nama ilmiah seperti spesies.",
            },
          ],
          quiz: [
            {
              id: "bi-kebahasaaan-tanda-baca-q1",
              question: "Kalimat yang penulisan tanda bacanya benar adalah ...",
              options: [
                "Ia membeli buku, pensil dan penghapus.",
                "Ia membeli buku, pensil, dan penghapus.",
                "Ia membeli buku; pensil dan penghapus.",
                "Ia membeli: buku, pensil dan penghapus.",
              ],
              correctIndex: 1,
              explanation:
                "Perincian lebih dari dua unsur memakai tanda koma sebelum 'dan': 'buku, pensil, dan penghapus'.",
            },
            {
              id: "bi-kebahasaaan-tanda-baca-q2",
              question: "Penulisan tanda titik dua yang benar adalah ...",
              options: [
                "Kesimpulannya: bahwa masalah ini penting.",
                "Kesimpulannya: masalah ini penting.",
                "Kesimpulannya bahwa: masalah ini penting.",
                "Kesimpulannya; masalah ini penting.",
              ],
              correctIndex: 1,
              explanation:
                "Titik dua dipakai sebelum pemerian tanpa kata 'bahwa', sehingga 'Kesimpulannya: masalah ini penting.'",
            },
            {
              id: "bi-kebahasaaan-tanda-baca-q3",
              question: "Kata ulang seharusnya ditulis dengan ...",
              options: ["Tanda hubung", "Tanda pisah", "Tanda petik", "Tanda seru"],
              correctIndex: 0,
              explanation:
                "Kata ulang ditulis dengan tanda hubung, misalnya 'buku-buku' dan 'sebaik-baiknya'.",
            },
            {
              id: "bi-kebahasaaan-tanda-baca-q4",
              question: "Penulisan judul buku yang benar dalam kalimat adalah ...",
              options: [
                "Ia membaca buku Laskar Pelangi.",
                "Ia membaca buku *Laskar Pelangi*.",
                "Ia membaca buku \"Laskar Pelangi\".",
                "Ia membaca buku (Laskar Pelangi).",
              ],
              correctIndex: 1,
              explanation:
                "Judul buku ditulis dengan huruf miring (ditandai dengan penekanan pada teks), bukan tanda petik atau tanda kurung.",
            },
          ],
          latihanSoal: [
            {
              id: "bi-kebahasaaan-tanda-baca-l1",
              level: "hots",
              question:
                "Perbaiki paragraf berikut dan jelaskan setiap perbaikan tanda baca: 'Menurut data BPS tahun 2023; angka pengangguran terbuka turun menjadi 5,32%. Hal ini menunjukkan dua hal: pertama perekonomian mulai pulih dan kedua; kesempatan kerja masih terbatas. Oleh karena itu pemerintah perlu memperkuat pelatihan vokasi yang relevan dengan kebutuhan industri: agar lulusan lebih siap kerja.'",
              langkah: [
                "Perbaikan 1: tanda titik koma setelah '2023' salah; ganti dengan tanda koma karena 'Menurut data BPS tahun 2023' adalah keterangan pembuka.",
                "Perbaikan 2: titik dua setelah 'dua hal' sudah benar karena menandai pemerian.",
                "Perbaikan 3: perincian 'pertama...dan kedua' memerlukan pemisah yang jelas; gunakan tanda koma dan titik koma yang konsisten, misalnya 'pertama, ...; kedua, ...'.",
                "Perbaikan 4: titik koma setelah 'kedua' salah; ganti dengan tanda koma karena pemerian belum selesai.",
                "Perbaikan 5: 'Oleh karena itu' sebagai konjungsi antarkalimat perlu diikuti koma: 'Oleh karena itu, pemerintah ...'.",
                "Perbaikan 6: titik dua terakhir salah karena diikuti konjungsi 'agar'; ganti menjadi tanda koma agar hubungan tujuan tetap jelas.",
                "Verifikasi konvensi: konsisten dalam pemakaian titik dua untuk pemerian dan titik koma untuk memisahkan butir panjang.",
                "Susun hasil akhir dan pastikan makna serta struktur logisnya tetap sama.",
              ],
              jawaban:
                "Hasil perbaikan: 'Menurut data BPS tahun 2023, angka pengangguran terbuka turun menjadi 5,32%. Hal ini menunjukkan dua hal: pertama, perekonomian mulai pulih; kedua, kesempatan kerja masih terbatas. Oleh karena itu, pemerintah perlu memperkuat pelatihan vokasi yang relevan dengan kebutuhan industri agar lulusan lebih siap kerja.' Perbaikan mencakup penggantian titik koma yang salah tempat, konsistensi pemisah pemerian, penambahan koma setelah konjungsi antarkalimat, dan penghapusan titik dua sebelum konjungsi 'agar'.",
            },
            {
              id: "bi-kebahasaaan-tanda-baca-l2",
              level: "sulit",
              question:
                "Bandingkan dua kalimat berikut dan jelaskan bagaimana perubahan tanda baca mengubah makna: (A) 'Guru yang mengajar matematika, menyatakan ujian ditunda.' (B) 'Guru, yang mengajar matematika, menyatakan ujian ditunda.' (a) Tentukan makna kalimat A. (b) Tentukan makna kalimat B. (c) Sebutkan istilah gramatikal untuk perbedaan ini. (d) Perbaiki kedua kalimat agar baku.",
              langkah: [
                "Analisis kalimat A: koma sebelum 'menyatakan' salah karena memisahkan subjek dari predikat. Tanpa klausa relatif penjelas, subjeknya adalah 'Guru yang mengajar matematika' (guru tertentu yang mengajar matematika).",
                "Analisis kalimat B: klausa 'yang mengajar matematika' diapit koma, sehingga menjadi klausa penjelas (nonrestriktif) dan subjeknya cukup 'Guru'.",
                "Bandingkan makna: A menyatakan hanya guru matematika yang menyatakan ujian ditunda; B menyatakan bahwa guru tersebut (yang kebetulan mengajar matematika) menyatakan penundaan.",
                "Sebutkan istilah: klausa restriktif (membatasi) pada A dan klausa nonrestriktif (penjelas) pada B; koma adalah penanda pembedanya.",
                "Perbaiki A: hilangkan koma sebelum predikat, hasilnya 'Guru yang mengajar matematika menyatakan ujian ditunda.'",
                "Perbaiki B: kalimat B sudah baku secara tanda baca, tetapi dapat dipertegas menjadi 'Guru itu, yang mengajar matematika, menyatakan bahwa ujian ditunda.'",
                "Simpulkan: satu tanda koma dapat mengubah acuan subjek dan cakupan informasi, sehingga tanda baca bukan sekadar hiasan.",
              ],
              jawaban:
                "(a) Kalimat A bermakna hanya guru matematika yang menyatakan ujian ditunda (subjek dibatasi) (b) Kalimat B bermakna guru tersebut, yang kebetulan mengajar matematika, menyatakan penundaan (klausa hanya penjelas) (c) Perbedaannya klausa restriktif vs nonrestriktif, ditandai ada-tidaknya koma (d) A: 'Guru yang mengajar matematika menyatakan ujian ditunda.' B: 'Guru itu, yang mengajar matematika, menyatakan bahwa ujian ditunda.'",
            },
          ],
          tkaSoal: [
            {
              id: "bi-kebahasaaan-tanda-baca-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Tanda titik dua (:) digunakan untuk ...",
              options: [
                { id: "A", text: "memisahkan dua klausa yang setara" },
                { id: "B", text: "mengawali perincian atau pemerian setelah pernyataan lengkap" },
                { id: "C", text: "menggantikan tanda titik pada akhir kalimat" },
                { id: "D", text: "memisahkan anak kalimat dari induk kalimat" },
                { id: "E", text: "menyatakan kutipan yang terpotong" },
              ],
              correctIds: ["B"],
              explanation:
                "Titik dua dipakai pada akhir pernyataan lengkap yang diikuti perincian, pemerian, atau penjelasan. Untuk memisahkan klausa setara digunakan titik koma, dan untuk kutipan terpotong digunakan elipsis.",
            },
            {
              id: "bi-kebahasaaan-tanda-baca-tka2",
              bentuk: "pg",
              level: "L2",
              question: "Penulisan yang benar adalah ...",
              options: [
                { id: "A", text: "Ia membawa bekal: nasi, telur, dan buah." },
                { id: "B", text: "Ia membawa bekal; nasi, telur, dan buah." },
                { id: "C", text: "Ia membawa bekal nasi, telur dan, buah." },
                { id: "D", text: "Ia membawa bekal, nasi, telur, dan, buah." },
                { id: "E", text: "Ia membawa bekal: nasi; telur; dan buah." },
              ],
              correctIds: ["A"],
              explanation:
                "Titik dua tepat dipakai untuk mengawali perincian setelah pernyataan lengkap 'Ia membawa bekal', dan unsur perincian dipisahkan koma dengan 'dan' sebelum unsur terakhir. Titik koma tidak dipakai untuk perincian sederhana seperti itu.",
            },
            {
              id: "bi-kebahasaaan-tanda-baca-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              stimulus:
                "Bacalah kalimat berikut! 'Guru, yang mengajar matematika menyatakan ujian ditunda.'",
              question:
                "Pilih semua pernyataan yang BENAR tentang pemakaian tanda baca pada kalimat tersebut. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "Koma setelah 'Guru' memutus subjek dari predikatnya sehingga tidak tepat" },
                { id: "B", text: "Koma yang tidak berpasangan membuat klausa penjelas menjadi ambigu" },
                { id: "C", text: "Kalimat dapat diperbaiki menjadi 'Guru yang mengajar matematika menyatakan ujian ditunda.'" },
                { id: "D", text: "Pemakaian koma tersebut sudah baku sehingga tidak perlu diubah" },
                { id: "E", text: "Koma wajib dipakai setelah subjek pada setiap kalimat" },
              ],
              correctIds: ["A", "B", "C"],
              explanation:
                "Koma tidak boleh memisahkan subjek dari predikat, jadi pemakaiannya salah (A benar). Karena koma pembuka tidak ditutup koma kedua, klausa penjelasnya menjadi ambigu (B benar), dan perbaikannya adalah menghapus koma tersebut (C benar). Pemakaian seperti itu tidak baku (D salah), dan koma setelah subjek tidak pernah wajib (E salah).",
            },
            {
              id: "bi-kebahasaaan-tanda-baca-tka4",
              bentuk: "isian",
              level: "L3",
              question:
                "Tuliskan nama klausa yang diapit koma dan bersifat hanya sebagai penjelas, bukan pembatas (satu kata).",
              correctIds: ["nonrestriktif", "nonrestriktif,", "non-restriktif"],
              explanation:
                "Klausa itu disebut klausa nonrestriktif. Fungsinya hanya memberi informasi tambahan, sehingga jika dihapus makna inti kalimat tidak berubah. Klausa yang membatasi disebut restriktif dan tidak diapit koma.",
            },
          ],
        },
      ],
    },
    {
      id: "bi-evaluasi-teks",
      title: "Evaluasi Teks",
      order: 4,
      subtopics: [
        {
          id: "bi-evaluasi-teks-opini-fakta",
          title: "Opini vs Fakta dalam Teks Editorial",
          estimatedMinutes: 30,
          materi: {
            ringkasan:
              "Fakta adalah pernyataan yang dapat diverifikasi kebenarannya melalui data, bukti, atau pengamatan. Opini adalah pernyataan yang memuat pendapat, penilaian, atau prediksi sehingga kebenarannya bersifat subjektif. Teks editorial memadukan keduanya, dan kemampuan membedakan keduanya menentukan kualitas penalaran pembaca.",
            rumus: [
              "Ciri fakta: ada data/angka, dapat diverifikasi, bersifat objektif, biasanya berupa peristiwa yang sudah terjadi",
              "Ciri opini: memuat kata penilaian (seharusnya, mungkin, terlalu, terbaik), prediksi, atau saran",
              "Kata penanda opini: sebaiknya, seharusnya, mungkin, tampaknya, diduga, terlalu, paling",
              "Teks editorial = artikel opini media yang memuat tesis, argumen, dan rekomendasi",
              "Struktur editorial: pernyataan pendirian (tesis), argumentasi pendukung, penegasan ulang/rekomendasi",
            ],
            contoh: [
              {
                soal:
                  "Klasifikasikan: (a) 'Inflasi Januari 2024 tercatat 2,57 persen.' (b) 'Pemerintah seharusnya lebih cepat mengantisipasi lonjakan harga pangan.'",
                pembahasan:
                  "(a) Fakta, karena ada angka spesifik yang dapat diverifikasi dari data resmi. (b) Opini, karena memuat kata 'seharusnya' yang menandai saran atau penilaian.",
              },
            ],
          },
          flashcards: [
            {
              id: "bi-evaluasi-teks-opini-fakta-fc1",
              front: "Mengapa pernyataan berprediksi termasuk opini?",
              back: "Karena menyangkut peristiwa yang belum terjadi, sehingga kebenarannya belum dapat diverifikasi saat pernyataan dibuat.",
            },
            {
              id: "bi-evaluasi-teks-opini-fakta-fc2",
              front: "Kata penanda paling kuat untuk opini?",
              back: "'Seharusnya', 'sebaiknya', 'mungkin', 'tampaknya', 'diduga', dan bentuk superlatif seperti 'terbaik' atau 'terburuk'.",
            },
            {
              id: "bi-evaluasi-teks-opini-fakta-fc3",
              front: "Apakah pernyataan yang benar otomatis fakta?",
              back: "Tidak. Kebenaran saja tidak cukup; pernyataan harus dapat diverifikasi dengan data atau bukti agar tergolong fakta, bukan keyakinan pribadi.",
            },
            {
              id: "bi-evaluasi-teks-opini-fakta-fc4",
              front: "Apa tiga bagian struktur teks editorial?",
              back: "Tesis (pernyataan pendirian), argumentasi (alasan dan bukti pendukung), dan penegasan ulang atau rekomendasi.",
            },
          ],
          quiz: [
            {
              id: "bi-evaluasi-teks-opini-fakta-q1",
              question: "Pernyataan berikut yang tergolong FAKTA adalah ...",
              options: [
                "Kebijakan itu terlalu terburu-buru diterapkan.",
                "Jumlah pengangguran terbuka pada Agustus 2023 sebesar 7,86 juta orang.",
                "Pemerintah seharusnya fokus pada pendidikan vokasi.",
                "Program ini tampaknya akan gagal.",
              ],
              correctIndex: 1,
              explanation:
                "Pernyataan itu memuat angka spesifik yang dapat diverifikasi dari data resmi, sehingga tergolong fakta.",
            },
            {
              id: "bi-evaluasi-teks-opini-fakta-q2",
              question: "Kata 'seharusnya' dalam teks editorial umumnya menandai ...",
              options: ["Fakta terverifikasi", "Opini berupa saran", "Kutipan langsung", "Data statistik"],
              correctIndex: 1,
              explanation:
                "'Seharusnya' menyatakan rekomendasi atau penilaian penulis, sehingga tergolong opini.",
            },
            {
              id: "bi-evaluasi-teks-opini-fakta-q3",
              question: "Bagian teks editorial yang memuat pernyataan pendirian disebut ...",
              options: ["Argumentasi", "Tesis", "Penegasan ulang", "Orientasi"],
              correctIndex: 1,
              explanation:
                "Tesis adalah pernyataan pendirian penulis yang menjadi dasar seluruh argumentasi editorial.",
            },
            {
              id: "bi-evaluasi-teks-opini-fakta-q4",
              question:
                "Manakah pernyataan yang paling kuat sebagai fakta pendukung dalam editorial?",
              options: [
                "Banyak orang merasa kebijakan ini buruk.",
                "Menurut data BPS, angka kemiskinan turun 0,54 poin pada Maret 2024.",
                "Sepertinya kebijakan ini akan berhasil.",
                "Kebijakan ini adalah yang terbaik sepanjang sejarah.",
              ],
              correctIndex: 1,
              explanation:
                "Pernyataan itu menyebut sumber data, angka spesifik, dan periode waktu, sehingga paling kuat sebagai fakta pendukung.",
            },
          ],
          latihanSoal: [
            {
              id: "bi-evaluasi-teks-opini-fakta-l1",
              level: "hots",
              question:
                "Bacalah penggalan editorial: 'Program bantuan sosial kembali digulirkan dengan anggaran Rp78,5 triliun pada 2024. Pemerintah menyatakan penerima manfaat bertambah 2,1 juta keluarga dibanding tahun sebelumnya. Namun, laporan sebuah lembaga pemantau menunjukkan 23% penerima tidak sesuai kriteria. Tampaknya verifikasi data masih menjadi kelemahan utama. Pemerintah seharusnya memperkuat pemutakhiran data sebelum penyaluran tahap berikutnya.' (a) Sebutkan semua pernyataan fakta beserta datanya. (b) Sebutkan semua pernyataan opini. (c) Tentukan tesis editorial tersebut. (d) Jelaskan mengapa editorial tetap kuat meski memuat opini.",
              langkah: [
                "Pisahkan pernyataan yang memuat data terverifikasi: anggaran Rp78,5 triliun, penambahan 2,1 juta keluarga, dan temuan lembaga pemantau 23% penerima tidak sesuai kriteria.",
                "Periksa apakah data itu dapat diverifikasi: ketiganya menyebut angka dan sumber (dokumen pemerintah dan lembaga pemantau), sehingga tergolong fakta.",
                "Tandai pernyataan yang memuat penilaian: 'Tampaknya verifikasi data masih menjadi kelemahan utama' dan 'Pemerintah seharusnya memperkuat pemutakhiran data'.",
                "Identifikasi kata penanda opini: 'tampaknya' (prediksi/dugaan) dan 'seharusnya' (rekomendasi).",
                "Rumuskan tesis: verifikasi data penerima bantuan sosial masih lemah sehingga penyaluran berikutnya perlu didahului pemutakhiran data.",
                "Periksa alur: fakta anggaran dan temuan ketidaksesuaian menjadi dasar, opini menjadi penilaian, lalu rekomendasi menjadi penutup.",
                "Jelaskan kekuatan editorial: opini yang berbasis fakta dapat diverifikasi penalarannya, sehingga tetap dapat diuji dan diperdebatkan secara sehat.",
                "Bandingkan dengan opini tanpa data: tanpa fakta pendukung, editorial hanya menjadi klaim pribadi yang lemah.",
              ],
              jawaban:
                "(a) Fakta: anggaran Rp78,5 triliun pada 2024; penerima bertambah 2,1 juta keluarga; 23% penerima tidak sesuai kriteria menurut lembaga pemantau (b) Opini: 'Tampaknya verifikasi data masih menjadi kelemahan utama' dan 'Pemerintah seharusnya memperkuat pemutakhiran data' (c) Tesis: verifikasi data penerima bantuan masih lemah sehingga penyaluran berikutnya perlu didahului pemutakhiran data (d) Karena opini yang didukung fakta dapat diuji penalarannya, sehingga tidak berhenti menjadi klaim pribadi.",
            },
            {
              id: "bi-evaluasi-teks-opini-fakta-l2",
              level: "sulit",
              question:
                "Diberikan dua kutipan: (1) 'Menurut laporan Dinas Kesehatan, cakupan imunisasi dasar lengkap pada 2023 mencapai 92,4%, naik dari 88,1% pada 2022.' (2) 'Kenaikan itu membuktikan kesadaran orang tua luar biasa, padahal pemerintah nyaris tidak melakukan apa pun.' (a) Klasifikasikan kutipan 1 dan 2. (b) Temukan kata bermuatan emosional pada kutipan 2. (c) Sebutkan satu kesalahan penalaran pada kutipan 2. (d) Tulis ulang kutipan 2 agar lebih seimbang dan tetap dapat disanggah.",
              langkah: [
                "Klasifikasikan kutipan 1: fakta, karena menyebut sumber (Dinas Kesehatan), angka spesifik (92,4% dan 88,1%), serta periode waktu (2023 dan 2022).",
                "Klasifikasikan kutipan 2: opini, karena memuat penilaian dan klaim kausal.",
                "Temukan muatan emosional: 'luar biasa' (superlatif positif) dan 'nyaris tidak melakukan apa pun' (hiperbola negatif).",
                "Identifikasi kesalahan penalaran 1: lompatan sebab-akibat, karena kenaikan angka tidak otomatis membuktikan peran tunggal orang tua.",
                "Identifikasi kesalahan penalaran 2: generalisasi berlebihan, karena menyimpulkan peran pemerintah secara menyeluruh dari data tunggal.",
                "Tulis ulang secara seimbang: 'Kenaikan cakupan imunisasi ini dapat mencerminkan meningkatnya partisipasi orang tua, meskipun peran pemerintah perlu ditinjau dengan data yang lebih lengkap.'",
                "Periksa syarat dapat disanggah: versi baru memakai kata 'dapat mencerminkan' dan 'perlu ditinjau' sehingga terbuka untuk diuji dengan bukti lain.",
                "Bandingkan: versi baru tetap berupa opini, tetapi tercatat sebagai klaim yang dapat diverifikasi, bukan tuduhan tertutup.",
              ],
              jawaban:
                "(a) Kutipan 1 fakta, kutipan 2 opini (b) 'Luar biasa' dan 'nyaris tidak melakukan apa pun' (c) Lompatan sebab-akibat dan generalisasi berlebihan (d) 'Kenaikan cakupan imunisasi ini dapat mencerminkan meningkatnya partisipasi orang tua, meskipun peran pemerintah perlu ditinjau dengan data yang lebih lengkap.'",
            },
          ],
          tkaSoal: [
            {
              id: "bi-evaluasi-teks-opini-fakta-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Ciri utama pernyataan fakta adalah ...",
              options: [
                { id: "A", text: "memuat kata sifat penilaian seperti 'luar biasa'" },
                { id: "B", text: "dapat diverifikasi kebenarannya dengan data atau bukti" },
                { id: "C", text: "selalu memuat angka" },
                { id: "D", text: "mengungkapkan perasaan penulis" },
                { id: "E", text: "tidak dapat diuji sama sekali" },
              ],
              correctIds: ["B"],
              explanation:
                "Fakta dapat diverifikasi melalui data, pengamatan, atau bukti. Keberadaan angka membantu, tetapi tidak wajib, sedangkan kata penilaian dan ungkapan perasaan adalah ciri opini.",
            },
            {
              id: "bi-evaluasi-teks-opini-fakta-tka2",
              bentuk: "pg",
              level: "L2",
              stimulus:
                "Bacalah dua kutipan berikut! Kutipan 1: 'Cakupan imunisasi dasar meningkat dari 78 persen pada 2020 menjadi 91 persen pada 2023.' Kutipan 2: 'Peran orang tua dalam program imunisasi sungguh luar biasa, sementara pemerintah nyaris tidak melakukan apa pun.'",
              question: "Pernyataan yang tepat tentang kedua kutipan tersebut adalah ...",
              options: [
                { id: "A", text: "Kutipan 1 opini dan kutipan 2 fakta" },
                { id: "B", text: "Kutipan 1 fakta dan kutipan 2 opini" },
                { id: "C", text: "Keduanya fakta karena memuat angka" },
                { id: "D", text: "Keduanya opini karena membahas kebijakan" },
                { id: "E", text: "Kutipan 1 opini karena memakai tahun" },
              ],
              correctIds: ["B"],
              explanation:
                "Kutipan 1 memuat angka yang dapat diverifikasi, jadi fakta. Kutipan 2 memuat penilaian ('luar biasa') dan pernyataan yang menuntut pembuktian ('nyaris tidak melakukan apa pun'), sehingga termasuk opini. Memuat angka atau membahas kebijakan tidak otomatis menentukan kategori.",
            },
            {
              id: "bi-evaluasi-teks-opini-fakta-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              stimulus:
                "Bacalah kutipan berikut! 'Peran orang tua dalam program imunisasi sungguh luar biasa, sementara pemerintah nyaris tidak melakukan apa pun. Karena itu, kenaikan cakupan imunisasi sepenuhnya disebabkan oleh kesadaran orang tua.'",
              question:
                "Pilih semua kelemahan penalaran yang benar-benar terdapat dalam kutipan tersebut. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "Memuat muatan emosional berupa kata superlatif dan hiperbola" },
                { id: "B", text: "Melompat ke kesimpulan sebab-akibat tanpa bukti" },
                { id: "C", text: "Menyimpulkan peran pemerintah secara menyeluruh dari dasar yang tidak memadai" },
                { id: "D", text: "Menyajikan data pembanding yang lengkap untuk setiap pihak" },
                { id: "E", text: "Menggunakan istilah teknis yang tidak dijelaskan" },
              ],
              correctIds: ["A", "B", "C"],
              explanation:
                "Kata 'luar biasa' adalah superlatif positif dan 'nyaris tidak melakukan apa pun' adalah hiperbola negatif (A benar). Kesimpulan bahwa kenaikan cakupan 'sepenuhnya disebabkan' orang tua adalah lompatan sebab-akibat tanpa data (B benar). Kata 'sepenuhnya' juga merupakan generalisasi berlebihan tentang peran pemerintah (C benar). Kutipan itu tidak menyajikan data pembanding (D salah) dan tidak memuat istilah teknis (E salah).",
            },
            {
              id: "bi-evaluasi-teks-opini-fakta-tka4",
              bentuk: "isian",
              level: "L2",
              stimulus:
                "Bacalah kutipan berikut! 'Peran orang tua dalam program imunisasi sungguh luar biasa, sementara pemerintah nyaris tidak melakukan apa pun.'",
              question:
                "Tuliskan satu kata superlatif bermuatan emosional yang terdapat dalam kutipan tersebut.",
              correctIds: ["luar biasa", "luarbiasa"],
              explanation:
                "Frasa superlatif 'luar biasa' memberi penilaian positif yang kuat dan menunjukkan keberpihakan penulis. Muatan semacam ini adalah penanda opini, bukan fakta.",
            },
          ],
        },
        {
          id: "bi-evaluasi-teks-evaluasi-argumen-bias",
          title: "Evaluasi Argumen & Bias Teks",
          estimatedMinutes: 30,
          materi: {
            ringkasan:
              "Mengevaluasi argumen berarti menilai apakah kesimpulan benar-benar didukung bukti dan penalaran yang sah. Bias adalah kecenderungan sistematis yang membuat teks memihak tanpa dasar bukti yang cukup, sehingga pembaca perlu mendeteksi jenis-jenis kesalahan penalaran.",
            rumus: [
              "Struktur argumen: premis (alasan) → kesimpulan; argumen sah bila kesimpulan mengikuti premis",
              "Ad hominem: menyerang pribadi, bukan isi argumen",
              "Strawman: menyalahartikan argumen lawan agar mudah dipatahkan",
              "Appeal to authority: mengandalkan tokoh sebagai bukti tanpa data",
              "False dilemma: memaksakan hanya dua pilihan padahal ada opsi lain",
              "Hasty generalization: menyimpulkan umum dari sampel yang terlalu kecil",
              "Post hoc: menganggap A menyebabkan B hanya karena B terjadi setelah A",
            ],
            contoh: [
              {
                soal:
                  "Identifikasi kesalahan penalaran: 'Kebijakan ini pasti buruk karena yang mengusulkannya adalah orang yang pernah gagal berbisnis.'",
                pembahasan:
                  "Ini kesalahan ad hominem, karena menyerang latar belakang pribadi pengusul dan bukan menilai isi kebijakannya.",
              },
              {
                soal:
                  "Identifikasi: 'Dua dari tiga teman saya tidak suka aplikasi ini, jadi seluruh siswa di sekolah pasti tidak menyukainya.'",
                pembahasan:
                  "Ini hasty generalization, karena menyimpulkan seluruh populasi dari sampel yang sangat kecil (tiga orang).",
              },
            ],
          },
          flashcards: [
            {
              id: "bi-evaluasi-teks-evaluasi-argumen-bias-fc1",
              front: "Apa itu ad hominem?",
              back: "Kesalahan penalaran yang menyerang pribadi, karakter, atau latar belakang lawan bicara, bukan menanggapi isi argumennya.",
            },
            {
              id: "bi-evaluasi-teks-evaluasi-argumen-bias-fc2",
              front: "Apa itu false dilemma?",
              back: "Kesalahan penalaran yang memaksakan hanya ada dua pilihan (misalnya 'mendukung atau melawan'), padahal masih ada opsi lain.",
            },
            {
              id: "bi-evaluasi-teks-evaluasi-argumen-bias-fc3",
              front: "Apa itu strawman?",
              back: "Menyalahartikan atau melebih-lebihkan argumen lawan menjadi versi yang lemah, lalu menyerang versi lemah itu seolah-olah itu pendapat aslinya.",
            },
            {
              id: "bi-evaluasi-teks-evaluasi-argumen-bias-fc4",
              front: "Apa itu post hoc dan mengapa berbahaya?",
              back: "Menganggap A penyebab B hanya karena B terjadi setelah A. Berbahaya karena mengabaikan faktor lain dan korelasi kebetulan.",
            },
          ],
          quiz: [
            {
              id: "bi-evaluasi-teks-evaluasi-argumen-bias-q1",
              question:
                "'Pendapatnya tentang ekonomi tidak perlu didengar karena ia masih muda.' Kesalahan penalaran ini adalah ...",
              options: ["Ad hominem", "Hasty generalization", "False dilemma", "Post hoc"],
              correctIndex: 0,
              explanation:
                "Argumen ditolak karena alasan pribadi (usia), bukan karena isi pendapatnya.",
            },
            {
              id: "bi-evaluasi-teks-evaluasi-argumen-bias-q2",
              question:
                "'Kalau tidak setuju dengan kebijakan ini, berarti kamu tidak peduli pada negara.' Kesalahan penalarannya adalah ...",
              options: ["Strawman", "False dilemma", "Appeal to authority", "Slippery slope"],
              correctIndex: 1,
              explanation:
                "Pernyataan itu memaksakan hanya dua kemungkinan (setuju atau tidak peduli negara), padahal ada banyak posisi lain.",
            },
            {
              id: "bi-evaluasi-teks-evaluasi-argumen-bias-q3",
              question:
                "'Menurut seorang selebriti, produk ini bagus, jadi pasti produk ini berkualitas.' Kesalahan penalarannya adalah ...",
              options: [
                "Appeal to authority (otoritas yang tidak relevan)",
                "Hasty generalization",
                "Post hoc",
                "Ad hominem",
              ],
              correctIndex: 0,
              explanation:
                "Kualitas produk tidak ditentukan oleh ketokohan selebriti, sehingga pengandalan pada otoritas yang tidak relevan.",
            },
            {
              id: "bi-evaluasi-teks-evaluasi-argumen-bias-q4",
              question:
                "Cara paling sehat menanggapi argumen yang mengandung bias adalah ...",
              options: [
                "Menunjukkan kesalahannya dan menyodorkan bukti pembanding",
                "Membalas dengan bias serupa",
                "Mengabaikan seluruh teks tersebut",
                "Menerima seluruhnya agar tidak berdebat",
              ],
              correctIndex: 0,
              explanation:
                "Evaluasi yang sehat mengidentifikasi kesalahan penalaran lalu mengajukan bukti atau penalaran alternatif yang lebih kuat.",
            },
          ],
          latihanSoal: [
            {
              id: "bi-evaluasi-teks-evaluasi-argumen-bias-l1",
              level: "hots",
              question:
                "Evaluasilah argumen berikut dan identifikasi kesalahan penalarannya: 'Sejak aplikasi belajar daring diluncurkan tiga bulan lalu, nilai rata-rata kelas naik dari 72 menjadi 75. Ini membuktikan aplikasi itu efektif. Mereka yang meragukan aplikasi ini jelas tidak peduli dengan kemajuan siswa. Kalau tidak mendukung aplikasi ini, berarti ingin siswa tetap tertinggal. Ada tiga sekolah lain yang juga memakai aplikasi ini dan nilainya juga naik.' (a) Sebutkan pola penalaran yang dipakai. (b) Identifikasi kesalahan penalaran yang muncul. (c) Jelaskan mengapa kesimpulan 'terbukti efektif' belum sah. (d) Rumuskan simpulan yang lebih hati-hati beserta data tambahan yang diperlukan.",
              langkah: [
                "Identifikasi struktur: premis 1 (nilai naik setelah aplikasi dipakai), premis 2 (tiga sekolah lain juga naik), kesimpulan (aplikasi efektif).",
                "Temukan kesalahan 1: post hoc, karena kenaikan nilai tidak otomatis disebabkan aplikasi; bisa ada faktor lain seperti soal lebih mudah atau tambahan jam belajar.",
                "Temukan kesalahan 2: false dilemma pada 'kalau tidak mendukung aplikasi ini, berarti ingin siswa tetap tertinggal'.",
                "Temukan kesalahan 3: ad hominem pada 'mereka yang meragukan aplikasi ini jelas tidak peduli dengan kemajuan siswa'.",
                "Jelaskan mengapa kesimpulan belum sah: tidak ada kelompok pembanding (kontrol), sehingga kenaikan tidak dapat dipisahkan dari tren umum atau faktor musiman.",
                "Rumuskan simpulan lebih hati-hati: ada indikasi kenaikan nilai sejalan dengan penggunaan aplikasi, tetapi hubungan sebab-akibat belum dapat dipastikan.",
                "Tentukan data tambahan yang diperlukan: kelompok pembanding tanpa aplikasi, durasi penggunaan per siswa, materi soal yang setara, dan data sebelum peluncuran.",
                "Susun simpulan akhir beserta rekomendasi penelitian lanjutan.",
              ],
              jawaban:
                "(a) Pola sebab-akibat dari urutan waktu (post hoc) plus penguatan oleh tiga sekolah lain (b) Post hoc, false dilemma, dan ad hominem (c) Karena tidak ada kelompok pembanding dan faktor lain belum dikendalikan, sehingga kenaikan tidak dapat diatribusikan hanya kepada aplikasi (d) Simpulan: 'Ada indikasi kenaikan nilai sejalan dengan penggunaan aplikasi, tetapi hubungan sebab-akibat belum terbukti.' Data tambahan: kelompok kontrol, durasi penggunaan, penyesuaian kesulitan soal, dan data dasar sebelum peluncuran.",
            },
            {
              id: "bi-evaluasi-teks-evaluasi-argumen-bias-l2",
              level: "sulit",
              question:
                "Diberikan dua argumen tentang kebijakan belajar empat hari seminggu. (A) 'Kebijakan ini harus ditolak karena yang mengusulkan bukan lulusan sekolah negeri.' (B) 'Kebijakan ini menambah beban guru sehingga mutu pembelajaran turun, karena guru kehilangan satu hari untuk administrasi.' (a) Identifikasi kesalahan pada argumen A. (b) Evaluasi kekuatan argumen B. (c) Tentukan bukti yang perlu disiapkan untuk menguji argumen B. (d) Tuliskan argumen seimbang yang menyebutkan potensi manfaat dan risikonya.",
              langkah: [
                "Analisis A: penolakan didasarkan pada latar belakang pendidikan pengusul, bukan isi kebijakan — ini ad hominem.",
                "Analisis B: argumen memuat klaim sebab-akibat yang dapat diuji: hari kerja berkurang → beban administrasi menumpuk → mutu turun.",
                "Identifikasi kekuatan B: argumen masuk akal karena menjelaskan mekanisme (rantai sebab), bukan sekadar menyatakan ketidaksetujuan.",
                "Identifikasi kelemahan B: belum memberi data, sehingga masih berupa hipotesis yang perlu diuji.",
                "Tentukan bukti yang diperlukan: data jam administrasi guru per minggu, perbandingan jam mengajar efektif, dan hasil belajar sebelum-sesudah kebijakan.",
                "Rumuskan argumen seimbang: 'Kebijakan empat hari belajar berpotensi menambah efisiensi waktu bagi siswa, tetapi berisiko menambah beban administrasi guru jika tidak disertai penyesuaian beban kerja.'",
                "Periksa: argumen seimbang mengakui manfaat sekaligus risiko, sehingga lebih sulit dipatahkan dengan satu bukti tunggal.",
              ],
              jawaban:
                "(a) Ad hominem (b) Argumen B kuat karena menjelaskan mekanisme sebab-akibat, tetapi lemah karena belum didukung data (c) Data jam administrasi guru, jam mengajar efektif, dan hasil belajar sebelum-sesudah (d) 'Kebijakan empat hari belajar berpotensi menambah efisiensi waktu bagi siswa, tetapi berisiko menambah beban administrasi guru jika tidak disertai penyesuaian beban kerja.'",
            },
          ],
          tkaSoal: [
            {
              id: "bi-evaluasi-teks-evaluasi-argumen-bias-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Sesat pikir yang menyerang pribadi lawan bicara, bukan gagasannya, disebut ...",
              options: [
                { id: "A", text: "ad hominem" },
                { id: "B", text: "generalisasi berlebihan" },
                { id: "C", text: "dilema palsu" },
                { id: "D", text: "korelasi palsu" },
                { id: "E", text: "argumentum ad populum" },
              ],
              correctIds: ["A"],
              explanation:
                "Ad hominem berarti menyerang orangnya, bukan argumennya. Generalisasi berlebihan menyimpulkan terlalu luas, dilema palsu menyajikan dua pilihan saja, korelasi palsu menyamakan korelasi dengan sebab-akibat, dan ad populum mendasarkan klaim pada popularitas.",
            },
            {
              id: "bi-evaluasi-teks-evaluasi-argumen-bias-tka2",
              bentuk: "pg",
              level: "L2",
              stimulus:
                "Bacalah pernyataan berikut! 'Kebijakan empat hari belajar jelas buruk. Lagi pula, siapa yang mau mendengarkan orang yang tidak pernah mengajar di sekolah?'",
              question: "Bias atau kesalahan penalaran yang paling menonjol dalam pernyataan tersebut adalah ...",
              options: [
                { id: "A", text: "penggunaan data statistik yang tidak relevan" },
                { id: "B", text: "ad hominem, yaitu menyerang pribadi alih-alih gagasan" },
                { id: "C", text: "perbandingan yang tidak sepadan" },
                { id: "D", text: "kutipan yang salah atribusi" },
                { id: "E", text: "penggunaan istilah teknis yang terlalu banyak" },
              ],
              correctIds: ["B"],
              explanation:
                "Pernyataan itu tidak membahas isi kebijakan, melainkan meragukan lawan bicara karena tidak pernah mengajar. Serangan terhadap pribadi ini adalah ad hominem dan tidak menyentuh kekuatan argumen.",
            },
            {
              id: "bi-evaluasi-teks-evaluasi-argumen-bias-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              stimulus:
                "Bacalah argumen berikut! Argumen A: 'Kebijakan empat hari belajar jelas buruk karena yang mendukungnya tidak paham pendidikan.' Argumen B: 'Kebijakan empat hari belajar berisiko menambah beban administrasi guru, karena hari kerja berkurang sehingga pekerjaan administratif menumpuk dan waktu mengajar efektif berkurang. Namun, argumen ini belum didukung data jam kerja.'",
              question:
                "Pilih semua pernyataan yang BENAR tentang penilaian kedua argumen tersebut. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "Argumen A lemah karena hanya menyerang pendukung dan tidak menjelaskan alasan" },
                { id: "B", text: "Argumen B lebih kuat karena menjelaskan rantai sebab-akibat" },
                { id: "C", text: "Argumen B masih perlu data agar tidak sekadar hipotesis" },
                { id: "D", text: "Argumen A kuat karena berani menyatakan penilaian tegas" },
                { id: "E", text: "Argumen B lemah karena mengakui keterbatasannya sendiri" },
              ],
              correctIds: ["A", "B", "C"],
              explanation:
                "Argumen A tidak memberi alasan dan hanya menyerang pendukungnya sehingga lemah (A benar, D salah). Argumen B menjelaskan mekanisme sebab-akibat sehingga lebih kuat (B benar), tetapi belum didukung data sehingga masih berupa hipotesis (C benar). Mengakui keterbatasan justru tanda argumen jujur, bukan kelemahan (E salah).",
            },
            {
              id: "bi-evaluasi-teks-evaluasi-argumen-bias-tka4",
              bentuk: "isian",
              level: "L3",
              question:
                "Tuliskan istilah untuk kesalahan penalaran yang menyimpulkan hubungan sebab-akibat hanya dari dua hal yang muncul bersamaan (dua kata).",
              correctIds: ["korelasi palsu", "korelasi bukan kausalitas", "korelasi semu"],
              explanation:
                "Istilahnya korelasi palsu atau korelasi semu: dua hal yang muncul bersamaan belum tentu memiliki hubungan sebab-akibat, karena mungkin ada variabel perancu atau kebetulan semata.",
            },
          ],
        },
        {
          id: "bi-evaluasi-teks-kritik-resensi",
          title: "Kritik & Resensi Karya",
          estimatedMinutes: 30,
          materi: {
            ringkasan:
              "Kritik adalah penilaian beralasan terhadap suatu karya dengan menyebut kelebihan, kekurangan, serta dasar penilaiannya. Resensi adalah ulasan yang memaparkan identitas, isi, dan penilaian karya untuk membantu pembaca memutuskan apakah karya itu layak dinikmati atau dibaca.",
            rumus: [
              "Struktur resensi: identitas karya, orientasi, sinopsis ringkas, analisis kelebihan-kekurangan, dan penilaian/rekomendasi",
              "Ciri kritik yang baik: beralasan, tidak menyerang pribadi, menyebut bukti dari karya, dan proporsional",
              "Unsur resensi buku: judul, penulis, penerbit, tahun, jumlah halaman, keunggulan, kelemahan, dan sasaran pembaca",
              "Unsur resensi film: judul, sutradara, produser, pemain, durasi, genre, dan penilaian artistik",
              "Bahasa kritik harus santun: hindari kata absolut seperti 'jelek sekali' tanpa bukti",
            ],
            contoh: [
              {
                soal:
                  "Susun kalimat penilaian resensi yang menyebut kelebihan dan kekurangan secara seimbang untuk sebuah novel remaja.",
                pembahasan:
                  "'Novel ini unggul dalam membangun dialog yang terasa hidup dan karakter remaja yang konsisten, meskipun bagian tengah cerita terasa melambat karena banyak pengulangan konflik.' Kalimat ini menyebut bukti konkret dari karya dan tidak menyerang pribadi penulis.",
              },
            ],
          },
          flashcards: [
            {
              id: "bi-evaluasi-teks-kritik-resensi-fc1",
              front: "Apa perbedaan kritik dan resensi?",
              back: "Kritik menekankan penilaian beralasan atas kelebihan dan kekurangan karya. Resensi lebih lengkap karena juga memuat identitas, sinopsis, dan rekomendasi.",
            },
            {
              id: "bi-evaluasi-teks-kritik-resensi-fc2",
              front: "Sebutkan bagian wajib sebuah resensi buku.",
              back: "Identitas (judul, penulis, penerbit, tahun, halaman), sinopsis ringkas, analisis kelebihan-kekurangan, dan penilaian atau rekomendasi.",
            },
            {
              id: "bi-evaluasi-teks-kritik-resensi-fc3",
              front: "Mengapa kritik tidak boleh menyerang pribadi pengarang?",
              back: "Kritik yang baik menilai karya, bukan penulisnya. Serangan pribadi termasuk ad hominem dan justru melemahkan kredibilitas kritikus.",
            },
            {
              id: "bi-evaluasi-teks-kritik-resensi-fc4",
              front: "Bagaimana menilai kekuatan karakter dalam karya fiksi?",
              back: "Perhatikan konsistensi sifat, perkembangan karakter, kejelasan motivasi, dan apakah dialog mendukung kepribadian tokoh tersebut.",
            },
          ],
          quiz: [
            {
              id: "bi-evaluasi-teks-kritik-resensi-q1",
              question: "Bagian resensi yang memuat judul, penulis, penerbit, dan tahun disebut ...",
              options: ["Sinopsis", "Identitas karya", "Analisis", "Rekomendasi"],
              correctIndex: 1,
              explanation:
                "Identitas karya memuat data bibliografis seperti judul, penulis, penerbit, tahun terbit, dan jumlah halaman.",
            },
            {
              id: "bi-evaluasi-teks-kritik-resensi-q2",
              question: "Kalimat kritik yang paling santun dan beralasan adalah ...",
              options: [
                "Buku ini jelek sekali dan tidak layak dibaca siapa pun.",
                "Bagian akhir buku ini terasa tergesa-gesa karena konflik utama diselesaikan hanya dalam dua halaman.",
                "Penulisnya jelas tidak berbakat.",
                "Buku ini membosankan tanpa alasan yang jelas.",
              ],
              correctIndex: 1,
              explanation:
                "Kalimat itu menyebut bukti konkret (konflik diselesaikan dalam dua halaman) dan menilai karya, bukan pribadi penulis.",
            },
            {
              id: "bi-evaluasi-teks-kritik-resensi-q3",
              question: "Tujuan utama penulisan resensi adalah ...",
              options: [
                "Menjatuhkan karya yang tidak disukai",
                "Membantu pembaca memahami dan menilai kelayakan karya",
                "Mempromosikan karya tanpa penilaian",
                "Meringkas seluruh isi karya tanpa analisis",
              ],
              correctIndex: 1,
              explanation:
                "Resensi memberi gambaran sekaligus penilaian agar pembaca dapat memutuskan apakah karya itu sesuai kebutuhan mereka.",
            },
            {
              id: "bi-evaluasi-teks-kritik-resensi-q4",
              question: "Unsur resensi film yang tidak terdapat pada resensi buku adalah ...",
              options: ["Judul", "Sutradara", "Penerbit", "Tahun"],
              correctIndex: 1,
              explanation:
                "Sutradara adalah unsur khas film, sedangkan buku memakai nama penulis dan penerbit.",
            },
          ],
          latihanSoal: [
            {
              id: "bi-evaluasi-teks-kritik-resensi-l1",
              level: "hots",
              question:
                "Bacalah penggalan resensi berikut: 'Buku berjudul Literasi Digital untuk Remaja karya seorang dosen komunikasi ini diterbitkan pada 2023 dengan tebal 248 halaman. Buku ini menyajikan delapan bab tentang cara memverifikasi informasi dan mengenali hoaks. Kelebihannya terletak pada banyaknya studi kasus nyata dari media sosial Indonesia. Namun, contoh yang dipakai sebagian besar berasal dari platform besar sehingga pembaca pengguna platform kecil kurang terwakili.' (a) Sebutkan identitas karya yang tercantum. (b) Tentukan kelebihan dan kekurangan yang disebutkan. (c) Tuliskan satu kalimat rekomendasi yang sesuai. (d) Sebutkan satu data resensi yang masih kurang dan jelaskan mengapa itu penting.",
              langkah: [
                "Kumpulkan identitas: judul 'Literasi Digital untuk Remaja', penulis seorang dosen komunikasi, tahun 2023, tebal 248 halaman.",
                "Identifikasi kelebihan: banyak studi kasus nyata dari media sosial Indonesia sehingga isi relevan dan aplikatif.",
                "Identifikasi kekurangan: contoh terpusat pada platform besar sehingga pembaca platform kecil kurang terwakili.",
                "Rumuskan rekomendasi: 'Buku ini cocok bagi remaja dan guru yang ingin memahami verifikasi informasi secara praktis, dengan catatan pembaca perlu menambah referensi untuk platform kecil.'",
                "Identifikasi data yang kurang: nama lengkap penulis dan penerbit belum disebutkan.",
                "Jelaskan pentingnya nama penulis dan penerbit: keduanya membantu pembaca menilai kredibilitas dan menemukan buku tersebut di pasaran.",
                "Tambahkan data lain yang berguna: ISBN, harga, dan sasaran pembaca yang dinyatakan penulis.",
                "Periksa keseimbangan resensi: kelebihan dan kekurangan dibahas dengan bukti, sesuai kaidah kritik yang santun dan beralasan.",
              ],
              jawaban:
                "(a) Judul 'Literasi Digital untuk Remaja', penulis dosen komunikasi, tahun 2023, 248 halaman (b) Kelebihan: banyak studi kasus nyata media sosial Indonesia; kekurangan: contoh terpusat pada platform besar (c) 'Buku ini cocok bagi remaja dan guru yang ingin memahami verifikasi informasi secara praktis, dengan catatan pembaca perlu menambah referensi untuk platform kecil.' (d) Nama lengkap penulis dan penerbit belum disebutkan; keduanya penting untuk menilai kredibilitas dan menemukan buku.",
            },
            {
              id: "bi-evaluasi-teks-kritik-resensi-l2",
              level: "sulit",
              question:
                "Susunlah kerangka resensi lengkap untuk sebuah film dokumenter tentang perubahan iklim, lalu tentukan kriteria penilaian artistik dan faktual yang akan kamu pakai. (a) Tuliskan kerangka lima bagian. (b) Sebutkan tiga kriteria penilaian. (c) Jelaskan bagaimana menilai akurasi faktual dokumenter. (d) Sebutkan satu risiko kritik yang tidak beralasan dan cara menghindarinya.",
              langkah: [
                "Bagian 1 kerangka: identitas film (judul, sutradara, produser, durasi, tahun, genre).",
                "Bagian 2: orientasi, yaitu gambaran umum tema dan konteks pembuatannya.",
                "Bagian 3: sinopsis ringkas tanpa membocorkan seluruh alur.",
                "Bagian 4: analisis kelebihan dan kekurangan berdasarkan bukti dari film.",
                "Bagian 5: penilaian dan rekomendasi sasaran penonton.",
                "Kriteria 1: kekuatan sinematografi, seperti komposisi gambar dan penggunaan arsip visual yang mendukung argumen.",
                "Kriteria 2: kejelasan struktur naratif, termasuk alur sebab-akibat dan konsistensi fokus.",
                "Kriteria 3: kualitas narasi dan wawancara, termasuk keseimbangan sudut pandang yang dihadirkan.",
                "Menilai akurasi faktual: bandingkan data pada film dengan sumber ilmiah atau laporan resmi, lalu periksa apakah angka disertai konteks.",
                "Risiko kritik tidak beralasan: menyatakan 'film ini penuh kebohongan' tanpa menunjukkan data yang salah; hindari dengan menyebut bagian menit tertentu dan data pembanding resmi.",
              ],
              jawaban:
                "(a) Identitas film, orientasi, sinopsis ringkas, analisis kelebihan-kekurangan, penilaian dan rekomendasi (b) Sinematografi, kejelasan struktur naratif, dan kualitas narasi/wawancara (c) Dengan membandingkan angka dan klaim film dengan laporan ilmiah atau resmi serta memeriksa konteks data (d) Risikonya menuduh tanpa bukti; hindari dengan menyebut bagian spesifik film dan data pembanding resmi.",
            },
          ],
          tkaSoal: [
            {
              id: "bi-evaluasi-teks-kritik-resensi-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Bagian resensi yang memuat penilaian akhir dan sasaran pembaca disebut ...",
              options: [
                { id: "A", text: "identitas karya" },
                { id: "B", text: "orientasi" },
                { id: "C", text: "sinopsis" },
                { id: "D", text: "analisis kelebihan dan kekurangan" },
                { id: "E", text: "penilaian atau rekomendasi" },
              ],
              correctIds: ["E"],
              explanation:
                "Bagian penilaian dan rekomendasi memuat penilaian akhir serta saran sasaran pembaca. Identitas karya memuat data penerbitan, orientasi memuat gambaran umum, sinopsis memuat ringkasan isi, dan analisis memuat kelebihan serta kekurangan.",
            },
            {
              id: "bi-evaluasi-teks-kritik-resensi-tka2",
              bentuk: "pg",
              level: "L2",
              stimulus:
                "Bacalah penggalan resensi berikut! 'Buku Literasi Digital untuk Remaja karya seorang dosen komunikasi ini diterbitkan pada 2023 dengan tebal 248 halaman. Kelebihannya terletak pada banyaknya studi kasus nyata dari media sosial Indonesia. Namun, contoh yang dipakai sebagian besar berasal dari platform besar sehingga pembaca pengguna platform kecil kurang terwakili.'",
              question: "Pernyataan yang tepat tentang penggalan resensi tersebut adalah ...",
              options: [
                { id: "A", text: "Penggalan itu tidak memuat identitas karya sama sekali" },
                { id: "B", text: "Penggalan itu memuat identitas karya sekaligus kelebihan dan kekurangan secara berimbang" },
                { id: "C", text: "Penggalan itu hanya memuat pujian tanpa kekurangan" },
                { id: "D", text: "Penggalan itu hanya memuat ringkasan alur cerita" },
                { id: "E", text: "Nama lengkap penulis dan penerbit sudah dicantumkan" },
              ],
              correctIds: ["B"],
              explanation:
                "Penggalan itu menyebut identitas (judul, tahun, tebal) lalu memaparkan satu kelebihan yang konkret dan satu kekurangan yang beralasan. Namun nama lengkap penulis dan penerbit belum disebutkan, jadi opsi E salah.",
            },
            {
              id: "bi-evaluasi-teks-kritik-resensi-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              question:
                "Pilih semua kaidah kritik yang santun dan beralasan dalam sebuah resensi. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "Menyebut bagian spesifik karya yang dinilai sebagai bukti" },
                { id: "B", text: "Menyatakan kelebihan dan kekurangan secara berimbang" },
                { id: "C", text: "Menyatakan 'karya ini penuh kebohongan' tanpa menunjukkan bagian yang salah" },
                { id: "D", text: "Membandingkan klaim karya dengan data pembanding yang resmi" },
                { id: "E", text: "Menyerang pribadi penulis karya tersebut" },
              ],
              correctIds: ["A", "B", "D"],
              explanation:
                "Kritik yang sah bertumpu pada bukti spesifik (A), bersifat berimbang (B), dan memakai pembanding resmi untuk menilai akurasi (D). Menuduh tanpa menunjukkan bukti (C) dan menyerang pribadi penulis (E) melanggar kaidah kritik yang santun dan beralasan.",
            },
            {
              id: "bi-evaluasi-teks-kritik-resensi-tka4",
              bentuk: "isian",
              level: "L2",
              question:
                "Tuliskan nama unsur resensi film yang tidak terdapat pada resensi buku (satu kata).",
              correctIds: ["sutradara"],
              explanation:
                "Unsur khas resensi film adalah sutradara, sedangkan resensi buku memakai nama penulis dan penerbit. Unsur lain seperti judul, tahun, dan sasaran penonton dapat muncul pada kedua jenis resensi.",
            },
          ],
        },
      ],
    },
  ],
};

/* ==================================================================
 * 3. BAHASA INGGRIS WAJIB
 * ================================================================*/

const BAHASA_INGGRIS_WAJIB: Subject = {
  id: "bahasa-inggris-wajib",
  title: "Bahasa Inggris Wajib",
  shortTitle: "B. Inggris",
  icon: "🔤",
  accent: "sky",
  description: "Pemahaman teks, struktur, dan kosakata kontekstual.",
  chapters: [
    {
      id: "biw-reading-comprehension",
      title: "Reading Comprehension",
      order: 1,
      subtopics: [
        {
          id: "biw-reading-comprehension-main-idea-purpose",
          title: "Main Idea & Author's Purpose",
          estimatedMinutes: 50,
          materi: {
            ringkasan:
              "The main idea is the central point a passage develops, usually stated in the topic sentence. The author's purpose explains why the text was written: to inform, to persuade, to entertain, or to explain. Identifying both helps you answer comprehension questions quickly and accurately.",
            rumus: [
              "Topic sentence position: first sentence (deductive), last sentence (inductive), or both (mixed)",
              "Author's purpose key verbs: to inform, to persuade, to entertain, to explain, to describe",
              "Signals of persuasive purpose: 'should', 'must', 'ought to', 'the best', 'clearly'",
              "Signals of informative purpose: statistics, dates, definitions, and factual statements",
              "Test strategy: match the option with the whole passage, not only one detail",
            ],
            contoh: [
              {
                soal:
                  "Read: 'Recycling reduces the amount of waste sent to landfills. It also conserves raw materials such as paper and aluminium. Moreover, recycling creates jobs in collection and processing industries.' What are the main idea and the author's purpose?",
                pembahasan:
                  "Main idea: recycling brings several significant benefits. Purpose: to inform the reader about the advantages of recycling, supported by three factual reasons.",
              },
              {
                soal:
                  "Read: 'Schools must ban smartphones during lessons. Studies show that constant notifications reduce concentration and lower academic performance.' What is the author's purpose?",
                pembahasan:
                  "The modal 'must' and the recommendation signal a persuasive purpose: the writer wants the reader to support a smartphone ban in class.",
              },
            ],
          },
          flashcards: [
            {
              id: "biw-reading-comprehension-main-idea-purpose-fc1",
              front: "What is the difference between topic and main idea?",
              back: "The topic is the subject being discussed (usually a word or phrase); the main idea is the statement the author makes about that topic.",
            },
            {
              id: "biw-reading-comprehension-main-idea-purpose-fc2",
              front: "How do you recognize a persuasive purpose?",
              back: "Look for modal verbs such as 'should', 'must', and 'ought to', strong evaluative adjectives, and a clear call to action.",
            },
            {
              id: "biw-reading-comprehension-main-idea-purpose-fc3",
              front: "What is a typical distractor in main-idea questions?",
              back: "An option that is true but too narrow (only one detail), or one that is too broad and goes beyond what the passage actually covers.",
            },
            {
              id: "biw-reading-comprehension-main-idea-purpose-fc4",
              front: "Where is the main idea usually found in a news report?",
              back: "In the first paragraph (the lead), because news writing generally follows an inverted-pyramid structure.",
            },
          ],
          quiz: [
            {
              id: "biw-reading-comprehension-main-idea-purpose-q1",
              question:
                "Read: 'Urban farming is gaining popularity in many cities. Rooftop gardens provide fresh vegetables, reduce the heat island effect, and give residents a productive hobby.' What is the main idea?",
              options: [
                "Rooftop gardens reduce the heat island effect.",
                "Urban farming is gaining popularity and offers several benefits.",
                "Residents need a productive hobby.",
                "Fresh vegetables are expensive in cities.",
              ],
              correctIndex: 1,
              explanation:
                "The first sentence states the topic, and the rest lists benefits, so the main idea covers the whole passage.",
            },
            {
              id: "biw-reading-comprehension-main-idea-purpose-q2",
              question:
                "Read: 'Governments ought to invest more in public transport. Without reliable buses and trains, commuters will keep choosing private cars, worsening air quality.' The author's purpose is to ...",
              options: ["Entertain readers", "Persuade readers", "Describe a process", "Narrate an event"],
              correctIndex: 1,
              explanation:
                "'Ought to' and the causal warning signal persuasion: the writer urges readers to support greater investment in public transport.",
            },
            {
              id: "biw-reading-comprehension-main-idea-purpose-q3",
              question: "Which statement best describes a text written to inform?",
              options: [
                "It presents verified facts and explanations without urging the reader to act.",
                "It uses many imperative sentences to push a behaviour change.",
                "It focuses on amusing the reader with jokes.",
                "It hides its data to create suspense.",
              ],
              correctIndex: 0,
              explanation:
                "Informative writing presents facts and explanations objectively and does not push the reader toward a particular action.",
            },
            {
              id: "biw-reading-comprehension-main-idea-purpose-q4",
              question:
                "In a passage written inductively, the main idea is normally located in the ...",
              options: ["First sentence", "Middle sentence", "Last sentence", "Title only"],
              correctIndex: 2,
              explanation:
                "Inductive organisation places supporting details first and states the main idea or conclusion in the final sentence.",
            },
          ],
          latihanSoal: [
            {
              id: "biw-reading-comprehension-main-idea-purpose-l1",
              level: "hots",
              question:
                "Read the passage and answer: 'Many students believe that studying longer guarantees better grades. However, research on learning suggests otherwise. Students who study in four short sessions across a week often outperform those who study four hours in one night. Spacing practice allows the brain to consolidate information between sessions. Consequently, teachers increasingly recommend short daily reviews rather than last-minute cramming.' (a) State the main idea. (b) Identify the author's purpose. (c) Is the organisation deductive, inductive, or mixed? Explain. (d) Explain why the first sentence is NOT the main idea.",
              langkah: [
                "Analyse the structure: sentence one presents a common belief, but the passage actually argues against it.",
                "Identify the supporting evidence: research findings about spaced practice and short daily reviews.",
                "Identify the concluding statement: teachers recommend short daily reviews instead of cramming.",
                "Determine the main idea: spaced, shorter study sessions are more effective than one long cramming session.",
                "Determine the purpose: the writer wants to correct a mistaken belief, so the purpose combines informing with mild persuasion.",
                "Identify the organisation: details come first and the conclusion is in the final sentence, so it is inductive.",
                "Explain why sentence one is not the main idea: it states a belief the passage goes on to disprove, so it functions as a foil rather than the central claim.",
                "Verify that the main idea statement covers the whole passage, including both evidence and recommendation.",
              ],
              jawaban:
                "(a) Spaced, shorter study sessions are more effective than a single long cramming session (b) To inform and gently persuade readers to change their study habits (c) Inductive, because supporting evidence appears first and the conclusion is in the last sentence (d) Because sentence one only introduces a belief the passage refutes, so it is a foil rather than the main idea.",
            },
            {
              id: "biw-reading-comprehension-main-idea-purpose-l2",
              level: "sulit",
              question:
                "Read: 'A city council announced that a new light rail line will open next year. The project cost 2.4 billion dollars and will serve an estimated 180,000 passengers daily. Supporters argue it will reduce traffic by 12 percent, while critics question whether ridership projections are realistic. The council has promised to publish monthly progress reports.' (a) What is the main idea? (b) What is the author's purpose? (c) Identify two facts and one opinion. (d) Suggest a title that reflects the main idea.",
              langkah: [
                "Map the paragraph: it reports an announcement, supplies figures, presents both supporting and critical views, and mentions a commitment to transparency.",
                "Recognise that the writer takes no side, so the passage is informative rather than persuasive.",
                "Formulate the main idea: a major light rail project is scheduled to open next year amid both support and scepticism.",
                "Identify the purpose: to inform readers about the project's scale, expected effects, and the debate surrounding it.",
                "List facts: the cost of 2.4 billion dollars and the projection of 180,000 daily passengers.",
                "Identify the opinion: the critics' doubt about whether ridership projections are realistic, since 'realistic' is an evaluative judgement.",
                "Note that the promised monthly reports are a stated commitment, not an opinion or a completed fact.",
                "Draft a title that captures both the project and the ongoing debate, avoiding one-sided wording.",
              ],
              jawaban:
                "(a) A large light rail project is set to open next year amid both support and scepticism about its impact (b) To inform readers about the project's plans, figures, and debate (c) Facts: the 2.4 billion dollar cost and the 180,000 daily passenger estimate; opinion: critics' doubt that the ridership projections are realistic (d) Example title: 'Light Rail Project Nears Launch as Support and Doubt Grow'.",
            },
          ],
          tkaSoal: [
            {
              id: "biw-reading-comprehension-main-idea-purpose-tka1",
              bentuk: "pg",
              level: "L1",
              question: "The main idea of a passage is ...",
              options: [
                { id: "A", text: "the longest sentence in the passage" },
                { id: "B", text: "the central point the writer wants readers to take away" },
                { id: "C", text: "the first sentence, whatever it says" },
                { id: "D", text: "a detail that supports other sentences" },
                { id: "E", text: "the writer's personal opinion stated without evidence" },
              ],
              correctIds: ["B"],
              explanation:
                "The main idea is the central point that the whole passage is built to support. Length, position, or the presence of supporting detail does not define it.",
            },
            {
              id: "biw-reading-comprehension-main-idea-purpose-tka2",
              bentuk: "pg",
              level: "L2",
              stimulus:
                "Read the passage! Every year, millions of tonnes of food are thrown away while millions of people go hungry. Supermarkets reject fruit that is the wrong shape, and households buy more than they can eat. Several countries now require retailers to donate unsold edible food to charities, yet the problem persists because donation requires storage, transport, and staff time that small shops cannot afford. The writer's purpose is to show that food waste is not merely a matter of individual carelessness.",
              question: "What is the writer's main purpose?",
              options: [
                { id: "A", text: "To entertain readers with anecdotes about supermarkets" },
                { id: "B", text: "To argue that food waste has structural causes beyond individual behaviour" },
                { id: "C", text: "To advertise a particular charity's donation programme" },
                { id: "D", text: "To describe how fruit is grown and harvested" },
                { id: "E", text: "To prove that households cause all food waste" },
              ],
              correctIds: ["B"],
              explanation:
                "The passage explains that rejection policies, over-buying, and the cost of donation infrastructure all drive waste, then states that the issue is not purely individual carelessness. The purpose is therefore to argue for structural causes.",
            },
            {
              id: "biw-reading-comprehension-main-idea-purpose-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              stimulus:
                "Read the passage! Every year, millions of tonnes of food are thrown away while millions of people go hungry. Supermarkets reject fruit that is the wrong shape, and households buy more than they can eat. Several countries now require retailers to donate unsold edible food to charities, yet the problem persists because donation requires storage, transport, and staff time that small shops cannot afford. The writer's purpose is to show that food waste is not merely a matter of individual carelessness.",
              question:
                "Which statements about the passage are correct? There is more than one correct answer. Click on every correct answer!",
              options: [
                { id: "A", text: "The passage identifies both retail and household behaviour as causes" },
                { id: "B", text: "The passage states that donation requirements have not solved the problem" },
                { id: "C", text: "The passage argues that small shops lack the resources for donation" },
                { id: "D", text: "The passage claims that legislation has fully eliminated food waste" },
                { id: "E", text: "The passage states that food waste is caused only by consumer carelessness" },
              ],
              correctIds: ["A", "B", "C"],
              explanation:
                "The passage names supermarket rejection and household over-buying (A), notes that the problem persists despite donation laws (B), and explains that small shops cannot afford storage, transport, and staff time (C). D contradicts 'the problem persists', and E contradicts the closing statement that waste is not merely individual carelessness.",
            },
            {
              id: "biw-reading-comprehension-main-idea-purpose-tka4",
              bentuk: "isian",
              level: "L2",
              question:
                "Write the single word that names the writer's attitude towards the subject, conveyed through diction rather than stated directly.",
              correctIds: ["tone"],
              explanation:
                "The answer is tone: the writer's attitude towards the subject and audience, revealed through word choice, modality, and sentence structure rather than declared openly.",
            },
          ],
        },
        {
          id: "biw-reading-comprehension-implied-information",
          title: "Implied Information (Inference)",
          estimatedMinutes: 50,
          materi: {
            ringkasan:
              "An inference is a conclusion you draw from evidence in the text plus reasonable reasoning. The answer is not stated directly, but it must be strongly supported by the passage. A valid inference never contradicts the text and never requires information from outside it.",
            rumus: [
              "Formula: textual evidence + logical reasoning = valid inference",
              "Common question stems: 'It can be inferred that...', 'The author implies that...', 'What is suggested by...'",
              "Vocabulary of implication: suggest, imply, indicate, hint, convey, presuppose",
              "Strategy: locate the relevant sentence, then test each option against it",
              "Invalid inference signs: absolute claims (always, never, all) that the text does not support",
            ],
            contoh: [
              {
                soal:
                  "Read: 'When the museum introduced free entry on Sundays, visitor numbers tripled within a month. Staff reported that weekday attendance remained unchanged.' What can be inferred about the museum's total visitor growth?",
                pembahasan:
                  "Inference: the overall growth came almost entirely from Sunday visitors, because weekday attendance did not change. This follows from combining 'tripled' with 'weekday attendance remained unchanged'.",
              },
              {
                soal:
                  "Read: 'She reread the final paragraph three times, then closed the book and stared at the ceiling for a long moment.' What is implied?",
                pembahasan:
                  "Implied: the ending affected her deeply or left her thinking hard. The inference comes from observable actions rather than a stated emotion.",
              },
            ],
          },
          flashcards: [
            {
              id: "biw-reading-comprehension-implied-information-fc1",
              front: "What makes an inference valid?",
              back: "It must be supported by evidence in the passage and follow logically, without adding outside information or contradicting the text.",
            },
            {
              id: "biw-reading-comprehension-implied-information-fc2",
              front: "Why are extreme words like 'always' and 'never' risky in inference options?",
              back: "Because passages rarely support absolute claims, so such options usually go beyond the evidence and are therefore wrong.",
            },
            {
              id: "biw-reading-comprehension-implied-information-fc3",
              front: "What is the difference between stated and implied information?",
              back: "Stated information appears literally in the text; implied information is suggested and must be worked out by the reader.",
            },
            {
              id: "biw-reading-comprehension-implied-information-fc4",
              front: "How does tone help you infer meaning?",
              back: "Word choice reveals the writer's attitude, so noticing positive, negative, or neutral vocabulary helps you infer unstated opinions.",
            },
          ],
          quiz: [
            {
              id: "biw-reading-comprehension-implied-information-q1",
              question:
                "Read: 'Although the company reported record revenue, its profit margin fell from 18 percent to 9 percent.' What can be inferred?",
              options: [
                "The company sold fewer products than before.",
                "The company's costs grew faster than its revenue.",
                "The company is about to close down.",
                "The company raised its prices significantly.",
              ],
              correctIndex: 1,
              explanation:
                "Revenue rose while margin fell, which logically implies costs increased faster than revenue. The other options add information not supported by the text.",
            },
            {
              id: "biw-reading-comprehension-implied-information-q2",
              question:
                "Read: 'Tom glanced at the clock, then at the pile of unmarked essays, and sighed.' The author implies that Tom ...",
              options: [
                "Enjoys marking essays.",
                "Has little time but much work to do.",
                "Is about to leave the country.",
                "Has finished his work early.",
              ],
              correctIndex: 1,
              explanation:
                "Checking the clock, seeing a pile of work, and sighing together imply time pressure and a heavy workload.",
            },
            {
              id: "biw-reading-comprehension-implied-information-q3",
              question:
                "Which option is the strongest sign that an inference answer is INCORRECT?",
              options: [
                "It matches the topic of the passage.",
                "It uses absolute wording unsupported by the text.",
                "It uses information from the passage.",
                "It sounds reasonable.",
              ],
              correctIndex: 1,
              explanation:
                "Absolute wording such as 'always' or 'never' that the passage does not support is the clearest sign of an invalid inference.",
            },
            {
              id: "biw-reading-comprehension-implied-information-q4",
              question:
                "Read: 'Unlike her brother, who spoke first and thought later, Mia always prepared her arguments in advance.' The passage implies that Mia is ...",
              options: ["Impulsive", "Careful and prepared", "Uninterested in debating", "Less intelligent"],
              correctIndex: 1,
              explanation:
                "The contrast with her impulsive brother and the phrase 'always prepared her arguments' imply that Mia is careful and well prepared.",
            },
          ],
          latihanSoal: [
            {
              id: "biw-reading-comprehension-implied-information-l1",
              level: "hots",
              question:
                "Read: 'When the new manager arrived, meeting lengths dropped from ninety minutes to forty. Every agenda now lists a single decision to be made, and attendees receive the data two days in advance. Employee satisfaction scores rose for three consecutive quarters.' (a) What can be inferred about the previous manager's meetings? (b) What is implied about the relationship between preparation and meeting length? (c) Which statement is better supported: 'employees dislike meetings' or 'meetings were previously inefficient'? Explain. (d) Suggest one further inference about decision quality.",
              langkah: [
                "Gather evidence: meeting length fell sharply, agendas became decision-focused, data is shared in advance, and satisfaction rose.",
                "Infer about the previous manager: meetings were long, had unclear agendas, and material was not shared beforehand.",
                "Infer the relationship: advance preparation lets participants arrive informed, which shortens discussion time.",
                "Evaluate 'employees dislike meetings': the text does not state this directly, and satisfaction may have risen for other reasons.",
                "Evaluate 'meetings were previously inefficient': the contrast in length plus the new structure strongly supports this inference.",
                "Infer about decision quality: because each agenda targets one decision and data arrives earlier, decisions are likely better informed and faster.",
                "Check every inference against the rule that it must not require outside information.",
              ],
              jawaban:
                "(a) They were long, unfocused, and lacked advance preparation (b) Advance preparation shortens meeting time because participants arrive informed (c) 'Meetings were previously inefficient' is better supported by the contrast in length and structure (d) Decisions are likely better informed and faster because each meeting targets one decision with prior data.",
            },
            {
              id: "biw-reading-comprehension-implied-information-l2",
              level: "sulit",
              question:
                "Read: 'The library extended its opening hours to 10 p.m. during exam weeks. Within two weeks, the number of students using the reading room after 6 p.m. rose by 140 percent. However, complaints about noise in the reading room also increased noticeably.' (a) What can be inferred about student demand? (b) What is implied about the reading room's capacity or rules? (c) Which two pieces of evidence support the inference in (b)? (d) Propose one reasonable action based on the inference.",
              langkah: [
                "Identify evidence: extended hours, a 140 percent rise in evening use, and a noticeable increase in noise complaints.",
                "Infer about demand: there was substantial unmet need for evening study space before the change.",
                "Analyse the noise complaints: more users in the same space produced more disturbance, implying insufficient capacity or quiet-zone rules.",
                "Identify the two supporting pieces of evidence: the 140 percent increase in users and the rise in noise complaints.",
                "Combine them logically: higher occupancy in an unchanged space naturally raises noise levels.",
                "Propose a reasonable action: add a silent zone, enforce quiet rules, or open an additional evening room.",
                "Verify the inference avoids absolute claims such as 'students never study at home'.",
              ],
              jawaban:
                "(a) There was significant unmet demand for evening study space (b) The reading room may lack sufficient capacity or quiet-zone rules for higher occupancy (c) The 140 percent rise in evening users and the increased noise complaints (d) Create a silent zone, enforce quiet rules, or open an additional evening study room.",
            },
          ],
          tkaSoal: [
            {
              id: "biw-reading-comprehension-implied-information-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Information that is implied in a text is information that is ...",
              options: [
                { id: "A", text: "stated word for word in the text" },
                { id: "B", text: "suggested by the text without being stated directly" },
                { id: "C", text: "invented by the reader with no basis in the text" },
                { id: "D", text: "always found in the first sentence" },
                { id: "E", text: "always numerical" },
              ],
              correctIds: ["B"],
              explanation:
                "Implied information is suggested by the evidence in the text but never written out explicitly. It differs from stated information and from unsupported guesswork.",
            },
            {
              id: "biw-reading-comprehension-implied-information-tka2",
              bentuk: "pg",
              level: "L2",
              stimulus:
                "Read the passage! A large light rail project costing 2.4 billion dollars is set to open next year. Officials estimate 180,000 daily passengers, a figure critics call unrealistic given that the bus routes it replaces carried only a fraction of that number. Supporters counter that the line connects three newly built districts that are still filling with residents.",
              question: "What is implied about the critics' position?",
              options: [
                { id: "A", text: "They believe the project should never have been approved" },
                { id: "B", text: "They doubt the ridership projection is achievable" },
                { id: "C", text: "They accept the 180,000 figure without qualification" },
                { id: "D", text: "They expect the project to be built far ahead of schedule" },
                { id: "E", text: "They think bus routes carried more passengers than the new line will" },
              ],
              correctIds: ["B"],
              explanation:
                "The text says critics call the 180,000 figure unrealistic because the replaced bus routes carried far fewer passengers, which implies doubt about the projection's achievability. No statement about cancellation, timing, or acceptance appears.",
            },
            {
              id: "biw-reading-comprehension-implied-information-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              stimulus:
                "Read the passage! A large light rail project costing 2.4 billion dollars is set to open next year. Officials estimate 180,000 daily passengers, a figure critics call unrealistic given that the bus routes it replaces carried only a fraction of that number. Supporters counter that the line connects three newly built districts that are still filling with residents.",
              question:
                "Which inferences are supported by the passage? There is more than one correct answer. Click on every correct answer!",
              options: [
                { id: "A", text: "The debate partly depends on assumptions about future population growth" },
                { id: "B", text: "The supporters' argument relies on districts that are not yet fully populated" },
                { id: "C", text: "The bus routes carried fewer passengers than the projected light rail figure" },
                { id: "D", text: "The passage proves the ridership projection is definitely accurate" },
                { id: "E", text: "The critics and the supporters agree about the ridership estimate" },
              ],
              correctIds: ["A", "B", "C"],
              explanation:
                "The dispute hinges on whether new districts will fill, which is about future growth (A and B). The text states the replaced bus routes carried only a fraction of the projected figure (C). The passage presents the projection as disputed, not proven (D), and the two sides clearly disagree about the estimate (E).",
            },
            {
              id: "biw-reading-comprehension-implied-information-tka4",
              bentuk: "isian",
              level: "L3",
              stimulus:
                "Read the sentence: 'Supporters counter that the line connects three newly built districts that are still filling with residents.'",
              question:
                "Write the single word that signals that the supporters are responding to an opposing view (one word).",
              correctIds: ["counter", "counter,", "counters"],
              explanation:
                "The verb 'counter' marks that the supporters are answering the critics rather than introducing a new topic. Recognising such signalling verbs is essential for tracking whose position is being reported.",
            },
          ],
        },
        {
          id: "biw-reading-comprehension-vocabulary-context",
          title: "Vocabulary in Context (Reading)",
          estimatedMinutes: 50,
          materi: {
            ringkasan:
              "Vocabulary in context questions ask you to determine the meaning of a word as it is used in the passage, not its most common dictionary meaning. The surrounding words, the tone, and the grammatical role of the word are your best clues.",
            rumus: [
              "Context clues: definition, example, contrast, cause-effect, and restatement",
              "Contrast signals: 'however', 'unlike', 'although', 'in contrast' often point to an opposite meaning",
              "Restatement signals: 'that is', 'in other words', 'which means' introduce a paraphrase",
              "Word family strategy: identify the root, then check the part of speech needed (noun, verb, adjective, adverb)",
              "Test method: substitute the option into the sentence and check whether the meaning still fits",
            ],
            contoh: [
              {
                soal:
                  "Read: 'The committee's decision was so contentious that members argued for three hours without reaching agreement.' What does 'contentious' mean?",
                pembahasan:
                  "The context 'argued for three hours' signals a dispute, so 'contentious' means causing disagreement or controversial.",
              },
              {
                soal:
                  "Read: 'Rather than diminishing over time, public interest in the issue has only intensified.' What does 'intensified' mean?",
                pembahasan:
                  "The contrast signal 'rather than diminishing' implies the opposite of decreasing, so 'intensified' means became stronger.",
              },
            ],
          },
          flashcards: [
            {
              id: "biw-reading-comprehension-vocabulary-context-fc1",
              front: "What is a definition context clue?",
              back: "A clue where the passage explains the word directly, often using 'is' or 'means', or a dash that introduces the explanation.",
            },
            {
              id: "biw-reading-comprehension-vocabulary-context-fc2",
              front: "How do contrast signals help with vocabulary questions?",
              back: "They tell you the unknown word is the opposite of another word in the sentence, so you can work backwards to the meaning.",
            },
            {
              id: "biw-reading-comprehension-vocabulary-context-fc3",
              front: "Why should you not simply choose the most familiar dictionary meaning?",
              back: "Because context questions target the meaning in that specific passage, and a common meaning may not fit the sentence at all.",
            },
            {
              id: "biw-reading-comprehension-vocabulary-context-fc4",
              front: "What is the substitution test?",
              back: "Replace the target word with each option and read the sentence again; the correct option preserves both the meaning and the grammar.",
            },
          ],
          quiz: [
            {
              id: "biw-reading-comprehension-vocabulary-context-q1",
              question:
                "Read: 'The evidence was inconclusive, so the panel could neither confirm nor reject the theory.' What does 'inconclusive' mean?",
              options: [
                "Completely convincing",
                "Not leading to a clear decision",
                "Deliberately hidden",
                "Repeated several times",
              ],
              correctIndex: 1,
              explanation:
                "The clause 'could neither confirm nor reject' shows the evidence did not produce a definite conclusion.",
            },
            {
              id: "biw-reading-comprehension-vocabulary-context-q2",
              question:
                "Read: 'Unlike her earlier terse replies, this time she gave a lengthy and detailed explanation.' What does 'terse' mean?",
              options: ["Very detailed", "Brief and abrupt", "Extremely polite", "Difficult to understand"],
              correctIndex: 1,
              explanation:
                "The contrast with 'lengthy and detailed' shows 'terse' means brief, sometimes to the point of being abrupt.",
            },
            {
              id: "biw-reading-comprehension-vocabulary-context-q3",
              question:
                "Read: 'The new policy was intended to mitigate the effects of the drought, that is, to lessen its damage.' What does 'mitigate' mean?",
              options: ["Measure precisely", "Make less severe", "Cause to spread", "Report publicly"],
              correctIndex: 1,
              explanation:
                "The restatement 'that is, to lessen its damage' defines 'mitigate' as making something less severe.",
            },
            {
              id: "biw-reading-comprehension-vocabulary-context-q4",
              question:
                "Read: 'Critics called the proposal impractical, arguing that it would require resources no school currently has.' What does 'impractical' imply here?",
              options: [
                "Impossible to understand",
                "Not realistic to carry out",
                "Morally unacceptable",
                "Already proven effective",
              ],
              correctIndex: 1,
              explanation:
                "The reason given (resources no school has) shows the proposal cannot realistically be implemented.",
            },
          ],
          latihanSoal: [
            {
              id: "biw-reading-comprehension-vocabulary-context-l1",
              level: "hots",
              question:
                "Read: 'At first the researchers were sceptical about the anomalous readings, suspecting a faulty sensor. When three independent laboratories replicated the results, their scepticism gave way to cautious optimism. Still, they warned that the findings were preliminary and should not be regarded as definitive.' (a) Determine the meaning of 'anomalous' in context. (b) Determine the meaning of 'replicated'. (c) Determine the meaning of 'definitive'. (d) Explain how the phrase 'sceptical... gave way to cautious optimism' helps you understand the researchers' attitude change.",
              langkah: [
                "Locate the clue for 'anomalous': the researchers suspected a 'faulty sensor', so the readings did not match expectations.",
                "Define 'anomalous': irregular, unexpected, or deviating from what is normal.",
                "Locate the clue for 'replicated': 'three independent laboratories' did the same thing, indicating repetition of the experiment.",
                "Define 'replicated': reproduced or repeated the same procedure to confirm the result.",
                "Locate the clue for 'definitive': it is contrasted with 'preliminary', so it means final and conclusive.",
                "Define 'definitive': authoritative and decisive, not open to further revision.",
                "Explain the attitude clue: 'gave way to' signals a transition, so the researchers moved from doubt toward qualified confidence.",
                "Verify each definition by substituting it back into the original sentence.",
              ],
              jawaban:
                "(a) Anomalous = irregular or unexpected, not matching the normal pattern (b) Replicated = reproduced or repeated the same experiment (c) Definitive = final and conclusive, not preliminary (d) The phrase 'gave way to' signals a shift from doubt to qualified confidence, showing the researchers became more optimistic but remained careful.",
            },
            {
              id: "biw-reading-comprehension-vocabulary-context-l2",
              level: "sulit",
              question:
                "Read: 'The report's tone was scathing. It described the agency's oversight as perfunctory, noting that inspections were often cursory and that follow-up on violations was sporadic at best.' (a) Determine the meaning of 'scathing'. (b) Determine the meaning of 'perfunctory' and 'cursory', and explain why they reinforce each other. (c) Determine the meaning of 'sporadic'. (d) Explain how the phrase 'at best' affects the overall meaning.",
              langkah: [
                "Identify the tone clue for 'scathing': the report criticises the agency harshly, so 'scathing' means severely critical.",
                "Identify the clue for 'perfunctory': the report calls oversight inadequate and mentions hurried inspections.",
                "Define 'perfunctory': done as a routine duty without real care or interest.",
                "Identify the clue for 'cursory': it appears next to 'perfunctory' and describes the same inspections.",
                "Define 'cursory': hasty and superficial, done quickly without attention to detail.",
                "Explain reinforcement: both words describe the same weakness from different angles, so they intensify the criticism.",
                "Identify the clue for 'sporadic': follow-up is described as irregular, occurring occasionally rather than consistently.",
                "Explain 'at best': this qualifier signals that even the most favourable interpretation is still negative, strengthening the criticism.",
              ],
              jawaban:
                "(a) Scathing = severely critical (b) Perfunctory = done routinely without care; cursory = hasty and superficial; they reinforce each other because both describe the same careless inspections from different angles (c) Sporadic = occurring irregularly or only occasionally (d) 'At best' shows that even the most favourable reading is still negative, which intensifies the criticism.",
            },
          ],
          tkaSoal: [
            {
              id: "biw-reading-comprehension-vocabulary-context-tka1",
              bentuk: "pg",
              level: "L1",
              question: "In 'the soaring cost of housing', the word 'soaring' means ...",
              options: [
                { id: "A", text: "falling steadily" },
                { id: "B", text: "rising rapidly" },
                { id: "C", text: "staying the same" },
                { id: "D", text: "becoming unclear" },
                { id: "E", text: "becoming popular" },
              ],
              correctIds: ["B"],
              explanation:
                "In this context 'soaring' is a metaphor taken from flight, meaning rising quickly to a high level. Only the surrounding noun 'cost' makes that meaning available.",
            },
            {
              id: "biw-reading-comprehension-vocabulary-context-tka2",
              bentuk: "pg",
              level: "L2",
              stimulus:
                "Read the passage! The library extended its opening hours to 10 p.m. after a survey found that 62 percent of students wanted somewhere to study in the evening. Within one term, evening attendance rose by 140 percent, and complaints about noise in the reading room increased sharply.",
              question: "What does the phrase 'unmet demand' most likely refer to in this passage?",
              options: [
                { id: "A", text: "Students who wanted a service that did not yet exist, namely evening study space" },
                { id: "B", text: "Students who complained about the existing daytime service" },
                { id: "C", text: "Library staff who wanted higher wages" },
                { id: "D", text: "The number of books borrowed in the evening" },
                { id: "E", text: "The cost of keeping the library open later" },
              ],
              correctIds: ["A"],
              explanation:
                "The survey showed that many students wanted evening study space, but the library had not provided it until hours were extended. That is unmet demand: a need that existed without a service to satisfy it.",
            },
            {
              id: "biw-reading-comprehension-vocabulary-context-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              stimulus:
                "Read the passage! The library extended its opening hours to 10 p.m. after a survey found that 62 percent of students wanted somewhere to study in the evening. Within one term, evening attendance rose by 140 percent, and complaints about noise in the reading room increased sharply.",
              question:
                "Which inferences are well supported by the passage? There is more than one correct answer. Click on every correct answer!",
              options: [
                { id: "A", text: "The extension of hours responded to a real unmet need" },
                { id: "B", text: "Higher occupancy created a partly negative side effect" },
                { id: "C", text: "The reading room's design or rules may no longer suit its evening use" },
                { id: "D", text: "Evening attendance fell after the schedule changed" },
                { id: "E", text: "The survey showed that students preferred studying at home" },
              ],
              correctIds: ["A", "B", "C"],
              explanation:
                "The 140 percent rise in attendance validates the demand identified by the survey (A and B). Rising noise complaints suggest the room's design or rules may not fit evening use (C). Attendance rose rather than fell (D), and the survey identified a wish to study somewhere in the evening, not at home (E).",
            },
            {
              id: "biw-reading-comprehension-vocabulary-context-tka4",
              bentuk: "isian",
              level: "L2",
              stimulus:
                "Read the phrase: 'complaints about noise in the reading room increased sharply'.",
              question:
                "Write the single adverb in the phrase that signals the increase was sudden and large.",
              correctIds: ["sharply"],
              explanation:
                "In that phrase 'sharply' is an adverb of degree meaning steeply or markedly, modifying 'increased'. It signals that the rise in complaints was sudden and large rather than gradual.",
            },
          ],

        },
      ],
    },
    {
      id: "biw-structure-grammar",
      title: "Structure & Grammar",
      order: 2,
      subtopics: [
        {
          id: "biw-structure-grammar-tenses-aspect",
          title: "Tenses & Aspect",
          estimatedMinutes: 50,
          materi: {
            ringkasan:
              "Tense locates an action in time (present, past, future), while aspect shows how the action unfolds (simple, continuous, perfect, perfect continuous). Mastery of tense and aspect is essential because many national exam questions test the contrast between two similar forms.",
            rumus: [
              "Simple present: \\( S + V_1(s/es) \\) — habits, general truths, and timetables",
              "Present continuous: \\( S + am/is/are + V_{ing} \\) — actions happening now or temporary situations",
              "Present perfect: \\( S + have/has + V_3 \\) — actions completed with present relevance; uses 'since', 'for', 'already', 'yet'",
              "Simple past: \\( S + V_2 \\) — completed actions at a definite past time",
              "Past perfect: \\( S + had + V_3 \\) — the earlier of two past actions",
              "Simple future: \\( S + will + V_1 \\) — predictions, spontaneous decisions, and promises",
              "Time markers: 'while/as' often pairs past continuous with simple past; 'by the time' often pairs past perfect with simple past",
            ],
            contoh: [
              {
                soal: "Choose the correct form: 'While I (walk) home, it (start) to rain.'",
                pembahasan:
                  "The longer background action takes past continuous and the interrupting action takes simple past: 'While I was walking home, it started to rain.'",
              },
              {
                soal: "Choose the correct form: 'She (not finish) the report yet.'",
                pembahasan:
                  "The marker 'yet' signals present perfect, so the answer is 'She has not finished the report yet.'",
              },
            ],
          },
          flashcards: [
            {
              id: "biw-structure-grammar-tenses-aspect-fc1",
              front: "When do you use present perfect instead of simple past?",
              back: "Use present perfect when the exact time is not stated and the result matters now; use simple past when a definite past time is given.",
            },
            {
              id: "biw-structure-grammar-tenses-aspect-fc2",
              front: "How do 'while' and 'when' affect tense choice?",
              back: "'While' usually introduces a background action in past continuous, and 'when' introduces the interrupting action in simple past.",
            },
            {
              id: "biw-structure-grammar-tenses-aspect-fc3",
              front: "What does past perfect signal?",
              back: "It shows which of two past events happened first, often with markers such as 'by the time', 'before', or 'after'.",
            },
            {
              id: "biw-structure-grammar-tenses-aspect-fc4",
              front: "Which markers force present perfect?",
              back: "'Since', 'for' (with unfinished states), 'already', 'yet', 'just', 'ever', and 'never' typically require present perfect.",
            },
          ],
          quiz: [
            {
              id: "biw-structure-grammar-tenses-aspect-q1",
              question: "By the time we arrived, the film ... already ...",
              options: ["has / started", "had / started", "was / starting", "will / start"],
              correctIndex: 1,
              explanation:
                "The marker 'by the time' with a past event requires past perfect for the earlier action: 'had already started'.",
            },
            {
              id: "biw-structure-grammar-tenses-aspect-q2",
              question: "She ... in this company since 2019.",
              options: ["works", "worked", "has worked", "is working"],
              correctIndex: 2,
              explanation:
                "The marker 'since 2019' points to a state continuing into the present, which requires present perfect.",
            },
            {
              id: "biw-structure-grammar-tenses-aspect-q3",
              question: "Look! The children ... in the yard right now.",
              options: ["play", "played", "are playing", "have played"],
              correctIndex: 2,
              explanation:
                "'Look!' and 'right now' clearly signal present continuous.",
            },
            {
              id: "biw-structure-grammar-tenses-aspect-q4",
              question: "Choose the correct sentence.",
              options: [
                "I have seen him yesterday.",
                "I saw him yesterday.",
                "I have saw him yesterday.",
                "I am seeing him yesterday.",
              ],
              correctIndex: 1,
              explanation:
                "The definite past time marker 'yesterday' requires simple past: 'I saw him yesterday.'",
            },
          ],
          latihanSoal: [
            {
              id: "biw-structure-grammar-tenses-aspect-l1",
              level: "hots",
              question:
                "Fill in the correct tense and explain each choice: 'Aina (1) ____ (study) at this school for three years. Last month she (2) ____ (join) the national science competition. While she (3) ____ (prepare) her project, her mentor (4) ____ (realise) that one of the measurements (5) ____ (be) wrong. By the time the judges arrived, the team (6) ____ (already fix) the error.'",
              langkah: [
                "Analyse gap 1: the phrase 'for three years' describes a state continuing to now, so use present perfect: 'has studied'.",
                "Analyse gap 2: 'Last month' is a definite past time, so use simple past: 'joined'.",
                "Analyse gap 3: 'While' introduces a longer background action in the past, so use past continuous: 'was preparing'.",
                "Analyse gap 4: the mentor's realisation interrupts the background action, so use simple past: 'realised'.",
                "Analyse gap 5: the measurement was wrong before the realisation, so use past perfect: 'had been'.",
                "Analyse gap 6: 'By the time' with a past event requires past perfect for the earlier action: 'had already fixed'.",
                "Review the tense sequence to confirm the timeline is consistent: present perfect for duration, simple past for completed events, past continuous for background, past perfect for the earliest events.",
                "Read the completed passage aloud to verify each verb fits naturally.",
              ],
              jawaban:
                "(1) has studied (2) joined (3) was preparing (4) realised (5) had been (6) had already fixed. Present perfect marks the duration up to now, simple past marks definite past events, past continuous provides background, and past perfect marks the earliest actions.",
            },
            {
              id: "biw-structure-grammar-tenses-aspect-l2",
              level: "sulit",
              question:
                "Correct the five tense errors in the passage and justify each correction: 'Since 2020, the library is running a reading programme. More than five thousand students take part in it so far. Last year it wins a national award. When the coordinator announced the result, the students are celebrating in the hall. Next month, the programme will expands to three new districts.'",
              langkah: [
                "Error 1: 'is running' with 'Since 2020' is wrong because the marker requires present perfect continuous or present perfect; correct to 'has been running'.",
                "Error 2: 'take part' with 'so far' is wrong because 'so far' signals an unfinished period; correct to 'have taken part'.",
                "Error 3: 'wins' with 'Last year' is wrong because a definite past time requires simple past; correct to 'won'.",
                "Error 4: 'are celebrating' with 'When the coordinator announced' is wrong because it describes a completed past action; correct to 'celebrated'.",
                "Error 5: 'will expands' is grammatically wrong because a modal must be followed by the base form; correct to 'will expand'.",
                "Present the corrected passage and confirm that each tense now matches its time marker.",
              ],
              jawaban:
                "Corrected: 'Since 2020, the library has been running a reading programme. More than five thousand students have taken part in it so far. Last year it won a national award. When the coordinator announced the result, the students celebrated in the hall. Next month, the programme will expand to three new districts.' Justifications: 'since 2020' and 'so far' require present perfect (continuous); 'last year' and 'when... announced' require simple past; a modal must take the base form of the verb.",
            },
          ],
          tkaSoal: [
            {
              id: "biw-structure-grammar-tenses-aspect-tka1",
              bentuk: "pg",
              level: "L1",
              question: "The phrase 'since 2020' in a sentence normally requires which tense?",
              options: [
                { id: "A", text: "Simple present" },
                { id: "B", text: "Simple past" },
                { id: "C", text: "Present perfect or present perfect continuous" },
                { id: "D", text: "Past perfect" },
                { id: "E", text: "Future continuous" },
              ],
              correctIds: ["C"],
              explanation:
                "'Since' marks a period beginning in the past and continuing to the present, so present perfect or present perfect continuous is required, as in 'has run' or 'has been running'.",
            },
            {
              id: "biw-structure-grammar-tenses-aspect-tka2",
              bentuk: "pg",
              level: "L2",
              question:
                "Choose the sentence in which the tense matches the time marker. 'Last year the library ____ a national award.'",
              options: [
                { id: "A", text: "has won" },
                { id: "B", text: "wins" },
                { id: "C", text: "won" },
                { id: "D", text: "will win" },
                { id: "E", text: "is winning" },
              ],
              correctIds: ["C"],
              explanation:
                "'Last year' is a definite past time marker, so the simple past 'won' is required. Present perfect (A) cannot be used with a definite past time, and the other options place the action in the wrong time frame.",
            },
            {
              id: "biw-structure-grammar-tenses-aspect-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              stimulus:
                "Read the passage! 'Since 2020, the library is running a reading programme. More than five thousand students take part in it so far. Last year it wins a national award. When the coordinator announced the result, the students are celebrating in the hall. Next month, the programme will expands to three new districts.'",
              question:
                "Which tense errors are correctly identified? There is more than one correct answer. Click on every correct answer!",
              options: [
                { id: "A", text: "'is running' should be 'has been running' because of 'since 2020'" },
                { id: "B", text: "'take part' should be 'have taken part' because of 'so far'" },
                { id: "C", text: "'wins' should be 'won' because of 'last year'" },
                { id: "D", text: "'are celebrating' should be 'celebrated' because the past action is completed" },
                { id: "E", text: "'will expands' is correct because a modal takes the -s form" },
              ],
              correctIds: ["A", "B", "C", "D"],
              explanation:
                "'Since 2020' requires present perfect continuous (A), 'so far' signals an unfinished period requiring present perfect (B), 'last year' requires simple past (C), and the completed past action after 'announced' requires simple past (D). A modal must be followed by the base form, so 'will expands' is wrong and should be 'will expand' (E false).",
            },
            {
              id: "biw-structure-grammar-tenses-aspect-tka4",
              bentuk: "isian",
              level: "L2",
              stimulus:
                "Read the sentence: 'When the coordinator announced the result, the students ____ in the hall.'",
              question:
                "Write the correct simple past form of the verb 'celebrate' to complete the sentence.",
              correctIds: ["celebrated"],
              explanation:
                "'When the coordinator announced' establishes a completed past event, so the simple past 'celebrated' is required rather than the past continuous 'were celebrating'.",
            },
          ],

        },
        {
          id: "biw-structure-grammar-subject-verb-agreement",
          title: "Subject-Verb Agreement",
          estimatedMinutes: 50,
          materi: {
            ringkasan:
              "Subject-verb agreement means the verb must match its subject in number and person. Errors usually appear when an interrupting phrase separates the subject from the verb, or when the subject looks plural but is grammatically singular.",
            rumus: [
              "Singular subject takes singular verb: \\( S_{sg} + V_{s/es} \\) in the simple present",
              "Ignore interrupting phrases: 'The box of chocolates (is/are)...' takes the verb agreeing with 'box'",
              "Compound subjects with 'and' take a plural verb: 'A pen and a book are on the desk'",
              "Either/neither/each/every + singular noun takes a singular verb",
              "Subjects joined by 'or'/'nor' agree with the nearer subject: 'Neither the students nor the teacher was ready'",
              "Collective nouns (team, family, committee) take a singular verb when acting as one unit",
              "Special cases: 'Each of the students has...'; 'The number of X is...' but 'A number of X are...'",
            ],
            contoh: [
              {
                soal: "Choose the correct verb: 'The list of participants (was/were) published yesterday.'",
                pembahasan:
                  "The subject is 'list' (singular); 'of participants' is only an interrupting phrase, so the verb is 'was'.",
              },
              {
                soal: "Choose the correct verb: 'Neither the manager nor the employees (has/have) signed the form.'",
                pembahasan:
                  "With 'neither...nor', the verb agrees with the nearer subject 'employees' (plural), so 'have' is correct.",
              },
            ],
          },
          flashcards: [
            {
              id: "biw-structure-grammar-subject-verb-agreement-fc1",
              front: "How do you handle an interrupting phrase between subject and verb?",
              back: "Cross out the phrase (often starting with 'of', 'with', 'together with', or 'along with') and make the verb agree with the real subject.",
            },
            {
              id: "biw-structure-grammar-subject-verb-agreement-fc2",
              front: "Why does 'Each of the students' take a singular verb?",
              back: "Because 'each' is grammatically singular, even though the phrase after 'of' is plural: 'Each of the students has a book.'",
            },
            {
              id: "biw-structure-grammar-subject-verb-agreement-fc3",
              front: "What is the difference between 'the number of' and 'a number of'?",
              back: "'The number of X' takes a singular verb (the number is one figure), while 'a number of X' takes a plural verb (meaning several X).",
            },
            {
              id: "biw-structure-grammar-subject-verb-agreement-fc4",
              front: "When does a collective noun take a plural verb?",
              back: "When the members act individually rather than as a unit: 'The team are arguing among themselves.'",
            },
          ],
          quiz: [
            {
              id: "biw-structure-grammar-subject-verb-agreement-q1",
              question: "The bag of apples ... on the table.",
              options: ["are", "were", "is", "have been"],
              correctIndex: 2,
              explanation:
                "The true subject is 'bag' (singular); 'of apples' is only a modifier, so the verb must be 'is'.",
            },
            {
              id: "biw-structure-grammar-subject-verb-agreement-q2",
              question: "Neither the teacher nor the students ... informed about the change.",
              options: ["was", "were", "is", "has been"],
              correctIndex: 1,
              explanation:
                "With 'neither...nor', the verb agrees with the nearer subject 'students', so 'were' is correct.",
            },
            {
              id: "biw-structure-grammar-subject-verb-agreement-q3",
              question: "A number of parents ... about the new schedule.",
              options: ["has complained", "have complained", "is complaining", "complains"],
              correctIndex: 1,
              explanation:
                "'A number of' means several, so it takes a plural verb: 'have complained'.",
            },
            {
              id: "biw-structure-grammar-subject-verb-agreement-q4",
              question: "Each of the applicants ... required to submit two documents.",
              options: ["are", "were", "is", "have been"],
              correctIndex: 2,
              explanation:
                "'Each' is singular, so the verb must be singular: 'is required'.",
            },
          ],
          latihanSoal: [
            {
              id: "biw-structure-grammar-subject-verb-agreement-l1",
              level: "hots",
              question:
                "Correct the subject-verb agreement errors in the passage and justify each correction: 'The collection of rare manuscripts in the university library are carefully preserved. Each of the manuscripts have been digitised. Neither the humidity nor the temperature fluctuate dangerously. A number of researchers visits the archive every month. The staff, working in three shifts, is responsible for security.'",
              langkah: [
                "Error 1: 'The collection ... are' is wrong because the true subject is 'collection' (singular); 'of rare manuscripts in the university library' is only an interrupting phrase. Correct to 'is carefully preserved'.",
                "Error 2: 'Each of the manuscripts have' is wrong because 'each' is singular. Correct to 'has been digitised'.",
                "Error 3: 'Neither the humidity nor the temperature fluctuate' is wrong because the nearer subject 'temperature' is singular. Correct to 'fluctuates'.",
                "Error 4: 'A number of researchers visits' is wrong because 'a number of' takes a plural verb. Correct to 'visit'.",
                "Error 5: 'The staff ... is responsible' is acceptable if the staff acts as one unit; however, 'working in three shifts' shows individual activity, so 'are responsible' is preferable.",
                "Present the corrected passage and note that each correction follows one specific agreement rule.",
              ],
              jawaban:
                "Corrected: 'The collection of rare manuscripts in the university library is carefully preserved. Each of the manuscripts has been digitised. Neither the humidity nor the temperature fluctuates dangerously. A number of researchers visit the archive every month. The staff, working in three shifts, are responsible for security.' Rules: agree with the real subject and ignore interrupting phrases; 'each' is singular; 'neither...nor' agrees with the nearer subject; 'a number of' is plural; a collective noun takes a plural verb when members act individually.",
            },
            {
              id: "biw-structure-grammar-subject-verb-agreement-l2",
              level: "sulit",
              question:
                "Explain the difference in meaning and grammar between these pairs, then state which is correct in formal writing: (A) 'The number of students taking the exam has increased.' vs 'A number of students taking the exam have increased.' (B) 'The committee has approved the budget.' vs 'The committee have approved the budget.' (C) 'Ten kilometres is a long walk.' vs 'Ten kilometres are a long walk.'",
              langkah: [
                "Pair A: 'the number of' refers to a single figure, so it is grammatically singular and takes 'has increased'.",
                "Pair A continued: 'a number of' means several, so it takes a plural verb; however, 'have increased' here wrongly describes the students rather than the number, so the sentence is semantically odd.",
                "Conclude for A: 'The number of students taking the exam has increased' is the correct and natural sentence.",
                "Pair B: 'committee' is a collective noun; in many formal varieties it takes a singular verb when acting as one unit.",
                "Pair B continued: British English often allows the plural verb when members act individually, so 'have approved' can be acceptable there.",
                "Conclude for B: for consistency in a national exam context, the singular 'has approved' is the safer choice.",
                "Pair C: expressions of distance, time, and money are treated as single units, so the singular verb 'is' is correct.",
                "Summarise the principle: agreement depends on whether the subject is conceptualised as one unit or as several separate entities.",
              ],
              jawaban:
                "(A) 'The number of... has increased' is correct because 'the number' is a single figure; 'a number of' takes a plural verb but is semantically odd here (B) 'The committee has approved' is the safer formal choice because the group acts as one unit, though British English allows the plural when members act individually (C) 'Ten kilometres is a long walk' is correct because distance is treated as a single unit. Principle: agreement depends on whether the subject is viewed as one unit or as several entities.",
            },
          ],
          tkaSoal: [
            {
              id: "biw-structure-grammar-subject-verb-agreement-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Choose the correct verb. 'The box of chocolates ____ on the table.'",
              options: [
                { id: "A", text: "are" },
                { id: "B", text: "is" },
                { id: "C", text: "were" },
                { id: "D", text: "have been" },
                { id: "E", text: "are being" },
              ],
              correctIds: ["B"],
              explanation:
                "The interrupting phrase 'of chocolates' does not change the subject, which is the singular 'box'. Therefore the singular verb 'is' is required.",
            },
            {
              id: "biw-structure-grammar-subject-verb-agreement-tka2",
              bentuk: "pg",
              level: "L2",
              question:
                "Choose the sentence that is grammatically correct in formal writing.",
              options: [
                { id: "A", text: "The number of students taking the exam have increased." },
                { id: "B", text: "The number of students taking the exam has increased." },
                { id: "C", text: "Ten kilometres are a long walk." },
                { id: "D", text: "Neither the students nor the teacher were ready." },
                { id: "E", text: "Each of the participants have submitted a form." },
              ],
              correctIds: ["B"],
              explanation:
                "'The number of' takes a singular verb because it refers to a single figure, so 'has increased' is correct. Distance is treated as a single unit, so 'Ten kilometres is'; with 'neither...nor' the verb agrees with the nearer subject 'teacher' and should be 'was'; and 'each' takes a singular verb, so 'has submitted'.",
            },
            {
              id: "biw-structure-grammar-subject-verb-agreement-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              question:
                "Which statements about subject-verb agreement are correct? There is more than one correct answer. Click on every correct answer!",
              options: [
                { id: "A", text: "Interrupting phrases do not change the number of the subject" },
                { id: "B", text: "'The number of' takes a singular verb, while 'a number of' takes a plural verb" },
                { id: "C", text: "Expressions of distance, time, and money are treated as single units" },
                { id: "D", text: "With 'or' or 'nor', the verb agrees with the subject furthest from it" },
                { id: "E", text: "Collective nouns always take a plural verb" },
              ],
              correctIds: ["A", "B", "C"],
              explanation:
                "Interrupting phrases are ignored for agreement (A). 'The number of' is singular while 'a number of' is plural (B). Distance, time, and money take singular verbs (C). With 'or' or 'nor', the verb agrees with the nearer subject (D is wrong), and collective nouns take a singular verb when acting as one unit (E is wrong).",
            },
            {
              id: "biw-structure-grammar-subject-verb-agreement-tka4",
              bentuk: "isian",
              level: "L2",
              question:
                "Complete with the correct form of 'be': 'Neither the students nor the teacher ____ ready.'",
              correctIds: ["was"],
              explanation:
                "With 'neither...nor', the verb agrees with the nearer subject, which is the singular 'teacher'. In a past context the correct form is therefore 'was'.",
            },
          ],
        },
        {
          id: "biw-structure-grammar-passive-causative",
          title: "Passive Voice & Causative",
          estimatedMinutes: 50,
          materi: {
            ringkasan:
              "Passive voice shifts the focus from the doer to the action or the receiver, and is formed with be + past participle. Causative structures express that someone arranges for another person to do something, using have/get + object + past participle or make/let/help patterns.",
            rumus: [
              "Passive formula: \\( S + be + V_3 + (by\\ agent) \\)",
              "Passive across tenses: is written (present), was written (past), has been written (present perfect), will be written (future), is being written (continuous)",
              "Causative with past participle: have/get + object + V3 — 'I had my car repaired.'",
              "Causative with bare infinitive: make + object + V1 and let + object + V1 — 'She made him wait.'",
              "Causative with to-infinitive: get + object + to V1 — 'I got him to help me.'",
              "Help takes either form: 'help someone (to) do something'",
            ],
            contoh: [
              {
                soal: "Change to passive: 'The committee will announce the results tomorrow.'",
                pembahasan:
                  "The object 'the results' becomes the subject, and the verb becomes 'will be announced': 'The results will be announced tomorrow (by the committee).'",
              },
              {
                soal: "Rewrite using a causative: 'A technician installed a new air conditioner for us.'",
                pembahasan:
                  "Use have + object + V3: 'We had a new air conditioner installed.'",
              },
            ],
          },
          flashcards: [
            {
              id: "biw-structure-grammar-passive-causative-fc1",
              front: "When is passive voice preferable?",
              back: "When the doer is unknown, unimportant, or obvious, and when you want to emphasise the action or the receiver of the action.",
            },
            {
              id: "biw-structure-grammar-passive-causative-fc2",
              front: "How do you form the passive of a modal verb?",
              back: "Use modal + be + past participle: 'The form must be submitted by Friday.'",
            },
            {
              id: "biw-structure-grammar-passive-causative-fc3",
              front: "What is the difference between 'have something done' and 'do something'?",
              back: "'Have something done' means you arranged for another person to do it; 'do something' means you did it yourself.",
            },
            {
              id: "biw-structure-grammar-passive-causative-fc4",
              front: "Which verbs take a bare infinitive in causative structures?",
              back: "'Make' and 'let' take the bare infinitive: 'make him wait', 'let her go'. 'Get' requires 'to': 'get him to wait'.",
            },
          ],
          quiz: [
            {
              id: "biw-structure-grammar-passive-causative-q1",
              question: "The new bridge ... next year.",
              options: ["will complete", "will be completed", "will be completing", "is completed"],
              correctIndex: 1,
              explanation:
                "Passive future is formed with will + be + past participle: 'will be completed'.",
            },
            {
              id: "biw-structure-grammar-passive-causative-q2",
              question: "Change to causative: 'Someone painted the fence for them.'",
              options: [
                "They painted the fence.",
                "They had the fence painted.",
                "They were painting the fence.",
                "The fence painted them.",
              ],
              correctIndex: 1,
              explanation:
                "The causative 'have + object + past participle' shows they arranged for someone else to paint it.",
            },
            {
              id: "biw-structure-grammar-passive-causative-q3",
              question: "She made her younger brother ... the dishes last night.",
              options: ["to wash", "washing", "wash", "washed"],
              correctIndex: 2,
              explanation:
                "'Make' in the causative takes a bare infinitive, so the correct form is 'wash'.",
            },
            {
              id: "biw-structure-grammar-passive-causative-q4",
              question: "Which sentence is in the passive voice?",
              options: [
                "The students submitted the report.",
                "The report was submitted by the students.",
                "The students are submitting the report.",
                "The students will submit the report.",
              ],
              correctIndex: 1,
              explanation:
                "'Was submitted' follows the pattern be + past participle, so the sentence is passive.",
            },
          ],
          latihanSoal: [
            {
              id: "biw-structure-grammar-passive-causative-l1",
              level: "hots",
              question:
                "Rewrite the following report to make it more formal and impersonal using passive and causative structures wherever appropriate: 'The government built a new terminal last year. Engineers are testing the runway now. They will announce the opening date soon. They have already installed new security scanners. A private firm repaired the old control tower for them.' Then explain each transformation.",
              langkah: [
                "Transform sentence 1: object 'a new terminal' becomes subject, so 'A new terminal was built last year.'",
                "Transform sentence 2: present continuous passive gives 'The runway is being tested now.'",
                "Transform sentence 3: future passive gives 'The opening date will be announced soon.'",
                "Transform sentence 4: present perfect passive gives 'New security scanners have already been installed.'",
                "Transform sentence 5: causative with 'have' gives 'They had the old control tower repaired.'",
                "Explain the rationale: passive and causative structures shift attention to the action and its result rather than to the doer, producing a formal, impersonal register suitable for reports.",
                "Confirm that no essential information was lost and that each transformation preserves the original tense.",
              ],
              jawaban:
                "Rewritten: 'A new terminal was built last year. The runway is being tested now. The opening date will be announced soon. New security scanners have already been installed. They had the old control tower repaired.' Each sentence uses be + past participle, and the final sentence uses the causative have + object + V3 for a formal, impersonal tone while retaining the original tenses.",
            },
            {
              id: "biw-structure-grammar-passive-causative-l2",
              level: "sulit",
              question:
                "Analyse the differences between these sentences and explain when each is appropriate: (1) 'The technician repaired the server.' (2) 'The server was repaired.' (3) 'We had the server repaired.' (4) 'We got the technician to repair the server.' (5) 'The server got repaired.' (a) Identify the voice or structure of each. (b) Explain what is emphasised. (c) Say which forms suit a formal incident report. (d) Explain why (5) is considered informal.",
              langkah: [
                "Classify sentence 1: active voice, with the doer (the technician) as the subject and the focus.",
                "Classify sentence 2: passive voice with the agent omitted, so the focus falls on the server and the action.",
                "Classify sentence 3: causative with 'have + object + past participle', showing an arrangement but hiding the doer.",
                "Classify sentence 4: causative with 'get + object + to-infinitive', which names the doer explicitly.",
                "Classify sentence 5: 'get-passive', an informal variant of the standard passive.",
                "Explain emphasis: active emphasises the doer; passive emphasises the receiver or action; causative emphasises the arrangement or responsibility.",
                "Recommend forms for a formal report: the standard passive (2) and the causative with 'have' (3) fit best because they maintain an impersonal register.",
                "Explain informality of (5): 'get' is colloquial compared with 'be', so it is avoided in formal written English.",
              ],
              jawaban:
                "(a) (1) active; (2) passive; (3) causative with 'have'; (4) causative with 'get + to-infinitive'; (5) informal get-passive (b) Active emphasises the doer, passive emphasises the receiver or action, causative emphasises the arrangement (c) Forms (2) and (3) suit a formal report (d) Because 'get' is colloquial, so 'got repaired' sounds informal compared with 'was repaired'.",
            },
          ],
          tkaSoal: [
            {
              id: "biw-structure-grammar-passive-causative-tka1",
              bentuk: "pg",
              level: "L1",
              question: "The passive voice is formed with ...",
              options: [
                { id: "A", text: "have/has + past participle" },
                { id: "B", text: "be + past participle" },
                { id: "C", text: "modal + base form" },
                { id: "D", text: "be + present participle" },
                { id: "E", text: "do/does + base form" },
              ],
              correctIds: ["B"],
              explanation:
                "The passive is formed with a form of 'be' plus the past participle, optionally followed by the agent with 'by'. 'Be + present participle' forms the continuous aspect, not the passive.",
            },
            {
              id: "biw-structure-grammar-passive-causative-tka2",
              bentuk: "pg",
              level: "L2",
              question:
                "Choose the sentence that uses a causative structure correctly.",
              options: [
                { id: "A", text: "She had her laptop repair yesterday." },
                { id: "B", text: "She had her laptop repaired yesterday." },
                { id: "C", text: "She had repaired her laptop yesterday by someone." },
                { id: "D", text: "She was had her laptop repaired yesterday." },
                { id: "E", text: "She has her laptop repair yesterday." },
              ],
              correctIds: ["B"],
              explanation:
                "The causative pattern is 'have + object + past participle', so 'had her laptop repaired' is correct. Option A uses the base form, C misplaces the agent, D doubles the auxiliary, and E mixes the tense with the wrong verb form.",
            },
            {
              id: "biw-structure-grammar-passive-causative-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              question:
                "Which statements about passive and causative structures are correct? There is more than one correct answer. Click on every correct answer!",
              options: [
                { id: "A", text: "The passive is preferred when the doer is unknown or unimportant" },
                { id: "B", text: "The causative 'have something done' emphasises the arrangement rather than the doer" },
                { id: "C", text: "The 'get-passive' is colloquial and generally avoided in formal written English" },
                { id: "D", text: "The causative requires the past participle after the object" },
                { id: "E", text: "The passive always names the agent with 'by'" },
              ],
              correctIds: ["A", "B", "C", "D"],
              explanation:
                "The passive suits contexts where the doer is unknown or irrelevant (A), the causative foregrounds the arrangement (B), the get-passive is informal (C), and the causative requires a past participle after the object (D). The agent is optional in the passive and is often omitted (E false).",
            },
            {
              id: "biw-structure-grammar-passive-causative-tka4",
              bentuk: "isian",
              level: "L2",
              question:
                "Complete the causative: 'He ____ his car washed at the garage yesterday.' Write the missing verb.",
              correctIds: ["had", "got"],
              explanation:
                "The causative requires 'have' or 'get' before the object and past participle, so 'had his car washed' (or the more informal 'got his car washed') completes the sentence.",
            },
          ],
        },
      ],
    },
    {
      id: "biw-vocabulary-in-context",
      title: "Vocabulary in Context",
      order: 3,
      subtopics: [
        {
          id: "biw-vocabulary-in-context-synonyms-antonyms",
          title: "Contextual Synonyms & Antonyms",
          estimatedMinutes: 40,
          materi: {
            ringkasan:
              "A synonym is a word with a similar meaning, and an antonym is a word with an opposite meaning. In exam questions, you must decide which synonym or antonym fits the specific context, because words that look equivalent often differ in shade of meaning, formality, or grammatical pattern.",
            rumus: [
              "Synonym types: exact equivalents, near synonyms, and context-dependent equivalents",
              "Antonym types: gradable (hot/cold), complementary (alive/dead), and relational (buy/sell)",
              "Prefix-based antonyms: un-, in-, im-, il-, ir-, dis-, non-, mis-",
              "Register matters: 'commence' is formal, 'begin' is neutral, 'kick off' is informal",
              "Collocation matters: 'heavy rain' not 'strong rain'; 'make a decision' not 'do a decision'",
            ],
            contoh: [
              {
                soal:
                  "Choose the synonym of 'substantial' in: 'The charity received a substantial donation that allowed it to build two new classrooms.'",
                pembahasan:
                  "The context (enough to build two new classrooms) shows the amount was large, so 'substantial' means considerable or sizeable, not 'solid' or 'real'.",
              },
              {
                soal: "Choose the antonym of 'reluctant' in: 'Although initially reluctant, she eventually agreed to lead the team.'",
                pembahasan:
                  "The contrast with 'eventually agreed' shows 'reluctant' means unwilling, so the antonym is 'eager' or 'willing'.",
              },
            ],
          },
          flashcards: [
            {
              id: "biw-vocabulary-in-context-synonyms-antonyms-fc1",
              front: "Why can two synonyms not always be swapped freely?",
              back: "Because they may differ in register, collocation, or shade of meaning, so only one may fit the specific context or sentence pattern.",
            },
            {
              id: "biw-vocabulary-in-context-synonyms-antonyms-fc2",
              front: "What is a relational antonym?",
              back: "A pair in which each word implies the other, such as buy/sell, teach/learn, or parent/child.",
            },
            {
              id: "biw-vocabulary-in-context-synonyms-antonyms-fc3",
              front: "Which prefixes commonly create antonyms in English?",
              back: "un-, in-, im-, il-, ir-, dis-, non-, and mis-, as in unhappy, incorrect, impossible, illegal, irregular, disagree, nonsense, and misunderstand.",
            },
            {
              id: "biw-vocabulary-in-context-synonyms-antonyms-fc4",
              front: "What is a gradable antonym?",
              back: "A pair that allows degrees between the two extremes, such as hot/cold or expensive/cheap, so the words can be modified by 'very' or 'slightly'.",
            },
          ],
          quiz: [
            {
              id: "biw-vocabulary-in-context-synonyms-antonyms-q1",
              question:
                "In 'The manager gave a concise summary of the report', the synonym of 'concise' is ...",
              options: ["Lengthy", "Brief and clear", "Complicated", "Confusing"],
              correctIndex: 1,
              explanation:
                "A summary that is concise is short but still clear, so 'brief and clear' captures the positive nuance.",
            },
            {
              id: "biw-vocabulary-in-context-synonyms-antonyms-q2",
              question:
                "The antonym of 'abundant' in 'The region has abundant rainfall' is ...",
              options: ["Plentiful", "Scarce", "Heavy", "Seasonal"],
              correctIndex: 1,
              explanation:
                "'Abundant' means plentiful, so its opposite in this context is 'scarce' (very little).",
            },
            {
              id: "biw-vocabulary-in-context-synonyms-antonyms-q3",
              question: "The word 'amateur' is the antonym of ...",
              options: ["Beginner", "Novice", "Professional", "Student"],
              correctIndex: 2,
              explanation:
                "'Amateur' means someone who does an activity without professional training or pay, so the antonym is 'professional'.",
            },
            {
              id: "biw-vocabulary-in-context-synonyms-antonyms-q4",
              question:
                "Which synonym best replaces 'deteriorate' in: 'Without maintenance, the road will deteriorate quickly.'?",
              options: ["Improve", "Worsen", "Strengthen", "Widen"],
              correctIndex: 1,
              explanation:
                "'Deteriorate' means become worse, so the synonym is 'worsen'.",
            },
          ],
          latihanSoal: [
            {
              id: "biw-vocabulary-in-context-synonyms-antonyms-l1",
              level: "hots",
              question:
                "Read the passage: 'The initial proposal was met with scepticism. Critics argued that the projected costs were inflated and the timeline overly optimistic. Supporters, however, maintained that the benefits would outweigh the drawbacks. After a heated debate, the council approved a modified version.' (a) Find a synonym in the passage for 'doubt'. (b) Find a synonym for 'exaggerated'. (c) Find a synonym for 'advantages'. (d) Find an antonym for 'unanimous' that reflects the passage, and justify your choice.",
              langkah: [
                "Analyse 'scepticism': the critics' doubt about the proposal matches the meaning of 'doubt' in this context.",
                "Note that the word is a noun, so the synonym must also be a noun to fit the same slot.",
                "Analyse 'inflated': the costs were said to be higher than justified, so the synonym is 'exaggerated'.",
                "Analyse 'benefits': supporters claimed the gains would exceed the losses, so 'advantages' is the synonym for 'benefits'.",
                "Identify the contrast for 'unanimous': the passage describes a 'heated debate' before approval, which implies a divided vote.",
                "Choose the antonym: 'contested' or 'divided' fits better than 'disagreed' because it describes the vote, not the people.",
                "Verify grammatical fit: each chosen synonym or antonym must match the part of speech of the original word.",
              ],
              jawaban:
                "(a) Doubt = scepticism (b) Exaggerated = inflated (c) Advantages = benefits (d) Antonym of 'unanimous' reflecting the passage is 'contested' or 'divided', because the passage describes a heated debate before approval, indicating the decision was not unanimous.",
            },
            {
              id: "biw-vocabulary-in-context-synonyms-antonyms-l2",
              level: "sulit",
              question:
                "For each pair, explain the difference in meaning and register, then use each word in one sentence: (a) 'childish' vs 'childlike' (b) 'famous' vs 'notorious' (c) 'thrifty' vs 'stingy' (d) 'confident' vs 'arrogant'. Finally, explain how connotation affects synonym choice in formal writing.",
              langkah: [
                "Pair (a): 'childish' carries a negative connotation (immature behaviour), while 'childlike' carries a positive one (innocent, simple).",
                "Pair (b): 'famous' is neutral or positive (well known for good reason), while 'notorious' is negative (well known for something bad).",
                "Pair (c): 'thrifty' is approving (careful with money), while 'stingy' is disapproving (unwilling to spend).",
                "Pair (d): 'confident' is positive (secure in one's ability), while 'arrogant' is negative (overestimating oneself and looking down on others).",
                "Write example sentences that make the connotation clear, such as 'His childlike curiosity made him a great researcher' versus 'His childish reaction embarrassed the team.'",
                "Conclude the principle: denotation may be identical while connotation differs, so formal writing requires choosing the word whose evaluation matches the intended stance.",
                "Check that each sentence you produce demonstrates the nuance rather than just using the word correctly grammatically.",
              ],
              jawaban:
                "(a) 'Childish' is negative (immature), 'childlike' is positive (innocent); e.g. 'His childish reaction embarrassed the team' vs 'His childlike curiosity made him a great researcher.' (b) 'Famous' is positive/neutral, 'notorious' is negative; e.g. 'She is famous for her research' vs 'He is notorious for breaking promises.' (c) 'Thrifty' is approving, 'stingy' is disapproving (d) 'Confident' is positive, 'arrogant' is negative. Principle: denotation may match while connotation differs, so formal writing must select the word whose evaluation matches the intended stance.",
            },
          ],
          tkaSoal: [
            {
              id: "biw-vocabulary-in-context-synonyms-antonyms-tka1",
              bentuk: "pg",
              level: "L1",
              question: "The word 'notorious' differs from 'famous' mainly because 'notorious' ...",
              options: [
                { id: "A", text: "means well known but carries a negative evaluation" },
                { id: "B", text: "means completely unknown" },
                { id: "C", text: "means famous in a positive way" },
                { id: "D", text: "refers only to places, not people" },
                { id: "E", text: "is an antonym of 'well known'" },
              ],
              correctIds: ["A"],
              explanation:
                "Both words denote being widely known, but 'notorious' adds a negative evaluation, usually for something bad. This is a difference in connotation rather than denotation.",
            },
            {
              id: "biw-vocabulary-in-context-synonyms-antonyms-tka2",
              bentuk: "pg",
              level: "L2",
              stimulus:
                "Read the sentences! (1) 'His childish reaction embarrassed the team.' (2) 'His childlike curiosity made him a great researcher.'",
              question: "Why do the two underlined adjectives create very different effects?",
              options: [
                { id: "A", text: "They have different denotations, since one refers to adults and one to children" },
                { id: "B", text: "They share a similar denotation but have opposite connotations" },
                { id: "C", text: "They are synonyms with identical connotations" },
                { id: "D", text: "They differ only in grammatical function" },
                { id: "E", text: "They are antonyms with identical connotations" },
              ],
              correctIds: ["B"],
              explanation:
                "Both adjectives relate to child-like qualities, but 'childish' evaluates immaturity negatively while 'childlike' praises innocence. Same territory of meaning, opposite evaluation: a difference in connotation.",
            },
            {
              id: "biw-vocabulary-in-context-synonyms-antonyms-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              question:
                "Which word pairs consist of two words with similar denotation but different connotation? There is more than one correct answer. Click on every correct answer!",
              options: [
                { id: "A", text: "'thrifty' and 'stingy'" },
                { id: "B", text: "'confident' and 'arrogant'" },
                { id: "C", text: "'famous' and 'notorious'" },
                { id: "D", text: "'bicycle' and 'bicycle'" },
                { id: "E", text: "'hot' and 'cold'" },
              ],
              correctIds: ["A", "B", "C"],
              explanation:
                "Each of A, B, and C pairs words in the same meaning area where one is approving and the other disapproving. Option D repeats an identical word, and option E is a true antonym pair with opposite denotations, not a connotation contrast.",
            },
            {
              id: "biw-vocabulary-in-context-synonyms-antonyms-tka4",
              bentuk: "isian",
              level: "L2",
              question:
                "Write the single term for the emotional or evaluative association a word carries beyond its literal meaning.",
              correctIds: ["connotation", "connotations"],
              explanation:
                "That association is connotation, as opposed to denotation, which is the literal or dictionary meaning. Formal writing requires choosing the word whose connotation matches the intended stance.",
            },
          ],

        },
        {
          id: "biw-vocabulary-in-context-collocations-idioms",
          title: "Collocations & Idioms",
          estimatedMinutes: 40,
          materi: {
            ringkasan:
              "Collocations are word combinations that native speakers naturally use together, such as 'make a decision' rather than 'do a decision'. Idioms are fixed expressions whose meaning cannot be predicted from the individual words, such as 'break the ice'. Both are tested because they cannot be solved by grammar rules alone.",
            rumus: [
              "Verb + noun collocations: make a decision, take a risk, do homework, have a rest, give an example",
              "Adjective + noun collocations: heavy rain, strong coffee, deep sleep, high temperature, close friend",
              "Adverb + adjective collocations: highly unlikely, deeply concerned, strongly opposed, widely recognised",
              "Verb + preposition collocations: depend on, rely on, consist of, result in, apologise for",
              "Common idioms: break the ice, hit the books, under the weather, let the cat out of the bag, piece of cake, cost an arm and a leg",
            ],
            contoh: [
              {
                soal: "Choose the correct collocation: 'The team (did/made) significant (progress/advance) in the project.'",
                pembahasan:
                  "English says 'make progress' (not 'do progress'), so the correct sentence is 'The team made significant progress in the project.'",
              },
              {
                soal: "Explain the idiom in: 'After two weeks of illness, Rina was still feeling under the weather.'",
                pembahasan:
                  "'Under the weather' is an idiom meaning feeling slightly ill, so Rina was still unwell, not literally beneath rain.",
              },
            ],
          },
          flashcards: [
            {
              id: "biw-vocabulary-in-context-collocations-idioms-fc1",
              front: "What is a collocation?",
              back: "A combination of words that habitually appear together, such as 'heavy rain' or 'make a decision', even though other grammatically valid partners exist.",
            },
            {
              id: "biw-vocabulary-in-context-collocations-idioms-fc2",
              front: "What does 'once in a blue moon' mean?",
              back: "Very rarely — the idiom describes something that happens only occasionally.",
            },
            {
              id: "biw-vocabulary-in-context-collocations-idioms-fc3",
              front: "Which verb collocates with 'a risk'?",
              back: "'Take a risk' is the standard collocation; 'do a risk' or 'make a risk' are not used.",
            },
            {
              id: "biw-vocabulary-in-context-collocations-idioms-fc4",
              front: "Why can idioms not be translated word by word?",
              back: "Because their meaning is fixed as a whole and often figurative, so literally translating each word destroys the intended meaning.",
            },
          ],
          quiz: [
            {
              id: "biw-vocabulary-in-context-collocations-idioms-q1",
              question: "The correct collocation is ...",
              options: ["do a mistake", "make a mistake", "take a mistake", "give a mistake"],
              correctIndex: 1,
              explanation: "English uses 'make a mistake', not 'do a mistake'.",
            },
            {
              id: "biw-vocabulary-in-context-collocations-idioms-q2",
              question:
                "In 'Presenting in front of the class is a piece of cake for her', the idiom means ...",
              options: ["Very delicious", "Very difficult", "Very easy", "Very expensive"],
              correctIndex: 2,
              explanation: "'A piece of cake' means something very easy to do.",
            },
            {
              id: "biw-vocabulary-in-context-collocations-idioms-q3",
              question: "The correct collocation for weather is ...",
              options: ["strong rain", "heavy rain", "big rain", "hard rain"],
              correctIndex: 1,
              explanation:
                "English collocates 'heavy' with 'rain'; 'strong rain' and 'big rain' are not idiomatic.",
            },
            {
              id: "biw-vocabulary-in-context-collocations-idioms-q4",
              question:
                "In 'The manager finally let the cat out of the bag about the merger', the idiom means ...",
              options: [
                "Released an actual animal",
                "Revealed a secret accidentally",
                "Cancelled the plan",
                "Made a joke",
              ],
              correctIndex: 1,
              explanation:
                "'Let the cat out of the bag' means to reveal a secret, usually unintentionally.",
            },
          ],
          latihanSoal: [
            {
              id: "biw-vocabulary-in-context-collocations-idioms-l1",
              level: "hots",
              question:
                "Correct the collocation errors in the passage and explain each correction: 'Before the presentation, the coordinator gave us an advice to make a deep breath. We spent the whole night doing progress on the slides. On the day itself, my partner told me to break a leg. When the projector failed, we had to think on our feets and present without slides.'",
              langkah: [
                "Error 1: 'gave us an advice' is wrong because 'advice' is uncountable; correct to 'gave us some advice'.",
                "Error 2: 'make a deep breath' is wrong because English says 'take a deep breath'.",
                "Error 3: 'doing progress' is wrong because the correct collocation is 'making progress'.",
                "Error 4: 'break a leg' is correct as an idiom meaning good luck, so no correction is needed.",
                "Error 5: 'think on our feets' is wrong because the idiom is 'think on our feet', with 'feet' already plural.",
                "Explain the principle: collocations and idioms are fixed, so errors arise when learners translate literally from their first language.",
                "Present the corrected passage and confirm each idiom is now in its standard form.",
              ],
              jawaban:
                "Corrected: 'Before the presentation, the coordinator gave us some advice to take a deep breath. We spent the whole night making progress on the slides. On the day itself, my partner told me to break a leg. When the projector failed, we had to think on our feet and present without slides.' Errors came from uncountable nouns, wrong verb collocations ('take a deep breath', 'make progress'), and a misformed idiom ('think on our feet').",
            },
            {
              id: "biw-vocabulary-in-context-collocations-idioms-l2",
              level: "sulit",
              question:
                "Explain the meaning of each idiom and use it in a sentence suitable for a formal school report: (a) 'break the ice' (b) 'cost an arm and a leg' (c) 'hit the books' (d) 'under the weather' (e) 'once in a blue moon'. Then explain why idioms should be used sparingly in academic writing.",
              langkah: [
                "Explain (a): 'break the ice' means to ease initial tension between people who have just met.",
                "Explain (b): 'cost an arm and a leg' means to be very expensive.",
                "Explain (c): 'hit the books' means to begin studying seriously.",
                "Explain (d): 'under the weather' means feeling slightly unwell.",
                "Explain (e): 'once in a blue moon' means very rarely.",
                "Write a formal sentence for each, for example 'The facilitator opened with a short game to break the ice among the new members.'",
                "Explain the stylistic caution: idioms are informal and figurative, so overusing them weakens precision.",
                "Recommend using at most one idiom in a formal report and replacing the rest with precise literal wording.",
              ],
              jawaban:
                "(a) Ease initial tension: 'The facilitator opened with a short game to break the ice among the new members.' (b) Be very expensive: 'Replacing the laboratory equipment would cost an arm and a leg.' (c) Study seriously: 'With exams approaching, the students decided to hit the books.' (d) Feel slightly unwell: 'Two panellists were under the weather and joined online.' (e) Very rarely: 'Such extreme weather occurs once in a blue moon.' Idioms should be used sparingly in academic writing because they are informal and figurative, which reduces precision.",
            },
          ],
          tkaSoal: [
            {
              id: "biw-vocabulary-in-context-collocations-idioms-tka1",
              bentuk: "pg",
              level: "L1",
              question: "The idiom 'break the ice' means ...",
              options: [
                { id: "A", text: "to destroy something valuable" },
                { id: "B", text: "to ease initial tension between people" },
                { id: "C", text: "to become very cold" },
                { id: "D", text: "to cancel an event at the last minute" },
                { id: "E", text: "to work extremely hard" },
              ],
              correctIds: ["B"],
              explanation:
                "'Break the ice' means to relieve initial awkwardness or tension, usually at the start of a meeting or social event. 'Work extremely hard' would be 'hit the books' or 'work one's fingers to the bone'.",
            },
            {
              id: "biw-vocabulary-in-context-collocations-idioms-tka2",
              bentuk: "pg",
              level: "L2",
              stimulus:
                "Read the sentence! 'We spent the whole night doing progress on the slides and had to think on our feets when the projector failed.'",
              question: "Which correction makes the sentence idiomatic?",
              options: [
                { id: "A", text: "'doing progress' becomes 'making progress' and 'feets' becomes 'feet'" },
                { id: "B", text: "'doing progress' becomes 'taking progress' and 'feets' stays 'feets'" },
                { id: "C", text: "'doing progress' becomes 'doing progresses' and 'feets' becomes 'foots'" },
                { id: "D", text: "No correction is needed because both are fixed expressions" },
                { id: "E", text: "'doing progress' becomes 'making a progress' and 'feets' becomes 'feet'" },
              ],
              correctIds: ["A"],
              explanation:
                "The fixed collocation is 'make progress', not 'do progress', and the idiom is 'think on our feet'. Progress is uncountable, so 'a progress' is also wrong.",
            },
            {
              id: "biw-vocabulary-in-context-collocations-idioms-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              question:
                "Which statements about collocations and idioms are correct? There is more than one correct answer. Click on every correct answer!",
              options: [
                { id: "A", text: "Collocations are word partnerships whose members are fixed by usage" },
                { id: "B", text: "Idioms cannot be understood from the literal meanings of their parts" },
                { id: "C", text: "Literal translation from another language often produces collocation errors" },
                { id: "D", text: "Idioms suit academic writing because they add precision" },
                { id: "E", text: "Any verb can be freely combined with uncountable nouns such as 'progress'" },
              ],
              correctIds: ["A", "B", "C"],
              explanation:
                "Collocations are conventional word partnerships (A), idioms are non-literal (B), and literal translation is a common source of error (C). Idioms are informal and figurative, so they reduce precision in academic writing (D false), and uncountable nouns take restricted verb partners such as 'make' for 'progress' (E false).",
            },
            {
              id: "biw-vocabulary-in-context-collocations-idioms-tka4",
              bentuk: "isian",
              level: "L2",
              stimulus:
                "Read the sentence: 'Replacing the laboratory equipment would cost an arm and a leg.'",
              question: "Write the verb that belongs in the collocation with 'progress'.",
              correctIds: ["make", "makes", "made", "making"],
              explanation:
                "The standard collocation is 'make progress' (also 'make an effort', 'make a decision', 'take a deep breath'). Memorising verb plus noun partnerships prevents translation errors in formal writing.",
            },
          ],
        },
        {
          id: "biw-vocabulary-in-context-word-formation",
          title: "Word Formation",
          estimatedMinutes: 40,
          materi: {
            ringkasan:
              "Word formation is the process of building new words from a base through affixation, compounding, and conversion. Exam questions usually present a base word in brackets and require the correct part of speech for the gap, so identifying the sentence slot is the key step.",
            rumus: [
              "Common noun suffixes: -ment, -ness, -ity, -ance/-ence, -tion/-sion, -ist, -er/-or",
              "Common adjective suffixes: -ful, -less, -ive, -ous, -able/-ible, -al, -ic",
              "Common verb suffixes: -ise/-ize, -ify, -en",
              "Common adverb suffix: -ly",
              "Negating prefixes: un-, in-, im-, il-, ir-, dis-, non-, mis-",
              "Compounding: two free morphemes combine, as in 'greenhouse', 'toothbrush', and 'well-known'",
            ],
            contoh: [
              {
                soal: "Complete: 'Her (persist) ______ finally paid off when the research was published.'",
                pembahasan:
                  "The slot after the possessive 'her' requires a noun, so 'persist' becomes 'persistence'.",
              },
              {
                soal: "Complete: 'The results were (surprise) ______ consistent across all three trials.'",
                pembahasan:
                  "The slot modifies the adjective 'consistent', so an adverb is needed: 'surprisingly'.",
              },
            ],
          },
          flashcards: [
            {
              id: "biw-vocabulary-in-context-word-formation-fc1",
              front: "How do you decide which form of a word a gap needs?",
              back: "Identify the grammatical slot: after an article or possessive it is a noun; modifying a noun it is an adjective; modifying a verb or adjective it is an adverb.",
            },
            {
              id: "biw-vocabulary-in-context-word-formation-fc2",
              front: "What is conversion in word formation?",
              back: "Using a word in a different part of speech without changing its form, as when 'email' (noun) becomes 'to email' (verb).",
            },
            {
              id: "biw-vocabulary-in-context-word-formation-fc3",
              front: "Which suffix turns an adjective into a noun meaning 'state of being'?",
              back: "-ness, as in happiness, kindness, and effectiveness.",
            },
            {
              id: "biw-vocabulary-in-context-word-formation-fc4",
              front: "What does the suffix '-less' mean?",
              back: "Without, as in hopeless (without hope), careless (without care), and endless (without end).",
            },
          ],
          quiz: [
            {
              id: "biw-vocabulary-in-context-word-formation-q1",
              question: "Complete: 'The team's (innovate) ______ approach impressed the judges.'",
              options: ["innovate", "innovative", "innovation", "innovatively"],
              correctIndex: 1,
              explanation:
                "The gap precedes the noun 'approach', so an adjective is required: 'innovative'.",
            },
            {
              id: "biw-vocabulary-in-context-word-formation-q2",
              question: "Complete: 'The device was (use) ______ after the battery failed.'",
              options: ["useful", "useless", "usefully", "usage"],
              correctIndex: 1,
              explanation:
                "The sentence states the device could not work, so the negative adjective 'useless' is needed.",
            },
            {
              id: "biw-vocabulary-in-context-word-formation-q3",
              question: "Complete: 'Her (diligent) ______ was rewarded with a scholarship.'",
              options: ["diligent", "diligently", "diligence", "diligentness"],
              correctIndex: 2,
              explanation:
                "The possessive 'her' requires a noun, and the correct noun form is 'diligence'.",
            },
            {
              id: "biw-vocabulary-in-context-word-formation-q4",
              question: "Complete: 'The researchers analysed the data (care) ______ to avoid bias.'",
              options: ["care", "careful", "carefully", "carefulness"],
              correctIndex: 2,
              explanation:
                "The gap modifies the verb 'analysed', so an adverb is required: 'carefully'.",
            },
          ],
          latihanSoal: [
            {
              id: "biw-vocabulary-in-context-word-formation-l1",
              level: "hots",
              question:
                "Complete the passage with the correct form of the word in brackets: 'The (1) ______ (succeed) of the programme depended on community (2) ______ (participate). Although the planning stage was (3) ______ (remark) thorough, the implementation was (4) ______ (surprise) slow. Organisers blamed limited (5) ______ (finance) and the (6) ______ (absent) of trained volunteers. Nevertheless, the results were (7) ______ (consider) better than the previous year, and the (8) ______ (evaluate) report recommended continuing the project.'",
              langkah: [
                "Gap 1: the subject slot after 'The' and before 'of' needs a noun, so 'succeed' becomes 'success'.",
                "Gap 2: the preposition 'of' followed by 'community' needs a noun, so 'participate' becomes 'participation'.",
                "Gap 3: the slot before the noun 'planning' requires an adjective, so 'remark' becomes 'remarkably' only if an adverb is needed; here it modifies the adjective 'thorough', so the answer is 'remarkably'.",
                "Gap 4: the slot follows the linking verb 'was' and modifies 'slow', so an adverb is required: 'surprisingly'.",
                "Gap 5: the adjective 'limited' requires a noun, so 'finance' becomes 'financing' or 'financial resources'; the countable noun 'funding' also fits the slot.",
                "Gap 6: the phrase 'the ... of trained volunteers' needs a noun, so 'absent' becomes 'absence'.",
                "Gap 7: the slot before the comparative 'better' requires an adverb, so 'consider' becomes 'considerably'.",
                "Gap 8: the slot modifies the noun 'report' and needs an adjective form of 'evaluate', which is 'evaluation' as a noun or 'evaluative' as an adjective; the standard collocation is 'evaluation report'.",
                "Verify each answer by identifying the grammatical slot first, then checking the word class.",
              ],
              jawaban:
                "(1) success (2) participation (3) remarkably (4) surprisingly (5) funding (6) absence (7) considerably (8) evaluation. The key method is to identify the grammatical slot, then convert the base word into the required part of speech.",
            },
            {
              id: "biw-vocabulary-in-context-word-formation-l2",
              level: "sulit",
              question:
                "For each base word, produce four derivatives and state the word class of each: (a) 'satisfy' (b) 'produce' (c) 'strong' (d) 'logic'. Then explain how a knowledge of word families helps in examination questions of the word-formation type.",
              langkah: [
                "Family (a): satisfy (verb), satisfaction (noun), satisfactory (adjective), satisfactorily (adverb); note also 'dissatisfied' as a derived adjective.",
                "Family (b): produce (verb), production (noun), productive (adjective), productively (adverb); note also 'product' and 'producer'.",
                "Family (c): strong (adjective), strength (noun), strongly (adverb), strengthen (verb).",
                "Family (d): logic (noun), logical (adjective), logically (adverb), illogical (adjective with negating prefix).",
                "Explain the exam benefit: recognising word families lets you convert the base word to the required class quickly without guessing.",
                "Explain further: it also helps you avoid spelling errors, since derived forms often change spelling, as with 'satisfy' to 'satisfaction' and 'strong' to 'strength'.",
                "Conclude the strategy: identify the slot, choose the class, then apply the correct suffix or prefix.",
              ],
              jawaban:
                "(a) satisfy (verb), satisfaction (noun), satisfactory (adjective), satisfactorily (adverb) (b) produce (verb), production (noun), productive (adjective), productively (adverb) (c) strong (adjective), strength (noun), strongly (adverb), strengthen (verb) (d) logic (noun), logical (adjective), logically (adverb), illogical (adjective with negating prefix). Knowing word families helps you convert base words into the required class quickly, avoid spelling traps, and apply the correct suffix or prefix after identifying the grammatical slot.",
            },
          ],
          tkaSoal: [
            {
              id: "biw-vocabulary-in-context-word-formation-tka1",
              bentuk: "pg",
              level: "L1",
              question: "The noun form of the verb 'satisfy' is ...",
              options: [
                { id: "A", text: "satisfactory" },
                { id: "B", text: "satisfaction" },
                { id: "C", text: "satisfactorily" },
                { id: "D", text: "satisfied" },
                { id: "E", text: "satisfying" },
              ],
              correctIds: ["B"],
              explanation:
                "The noun suffix '-tion' turns 'satisfy' into 'satisfaction'. 'Satisfactory' is an adjective, 'satisfactorily' an adverb, and 'satisfied' and 'satisfying' are participles used adjectivally.",
            },
            {
              id: "biw-vocabulary-in-context-word-formation-tka2",
              bentuk: "pg",
              level: "L2",
              question:
                "Choose the correct form. 'The committee reviewed the proposal ____ and found it acceptable.'",
              options: [
                { id: "A", text: "care" },
                { id: "B", text: "careful" },
                { id: "C", text: "carefully" },
                { id: "D", text: "carefulness" },
                { id: "E", text: "careless" },
              ],
              correctIds: ["C"],
              explanation:
                "The gap modifies the verb 'reviewed', so an adverb is required, giving 'carefully'. 'Careful' is an adjective and cannot modify a verb, while the other options are the base noun, a noun, and a negated adjective.",
            },
            {
              id: "biw-vocabulary-in-context-word-formation-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              question:
                "Which statements about word formation are correct? There is more than one correct answer. Click on every correct answer!",
              options: [
                { id: "A", text: "Identifying the grammatical slot tells you which word class is needed" },
                { id: "B", text: "Derived forms can change spelling, as 'strong' becomes 'strength'" },
                { id: "C", text: "The prefix 'il-' is used before words beginning with 'l', as in 'illogical'" },
                { id: "D", text: "Any suffix can attach to any base word without changing meaning" },
                { id: "E", text: "Adverbs are commonly formed with the suffix '-ness'" },
              ],
              correctIds: ["A", "B", "C"],
              explanation:
                "The slot determines the required class (A), derived forms often change spelling (B), and 'il-' is the assimilated form of the negating prefix before 'l' (C). Suffixes are selective and meaning-changing (D false), and '-ness' forms nouns rather than adverbs, which take '-ly' (E false).",
            },
            {
              id: "biw-vocabulary-in-context-word-formation-tka4",
              bentuk: "isian",
              level: "L2",
              question:
                "Write the verb form of the noun 'strength' (one word).",
              correctIds: ["strengthen", "strengthens"],
              explanation:
                "The verb suffix '-en' turns 'strength' into 'strengthen', meaning 'to make stronger'. Recognising such patterns is the key strategy for word-formation items in examinations.",
            },
          ],
        },
      ],
    },
    {
      id: "biw-text-functional",
      title: "Text Functional",
      order: 4,
      subtopics: [
        {
          id: "biw-text-functional-analytical-exposition",
          title: "Analytical Exposition",
          estimatedMinutes: 30,
          materi: {
            ringkasan:
              "An analytical exposition presents the writer's opinion on an issue and supports it with arguments. Unlike a hortatory exposition, which ends with a recommendation, an analytical exposition ends by restating the thesis. Its generic structure is thesis, arguments, and reiteration.",
            rumus: [
              "Generic structure: Thesis (position) → Arguments (evidence and reasoning) → Reiteration (restated thesis)",
              "Language features: present tense, mental verbs (believe, think, argue), connectives (firstly, moreover, therefore)",
              "Typical thesis signals: 'In my opinion', 'It is important to note that', 'I strongly believe'",
              "Contrast with hortatory exposition, which ends with a recommendation using 'should' or 'must'",
              "Purpose: to persuade the reader by presenting a reasoned argument rather than by a call to action",
            ],
            contoh: [
              {
                soal:
                  "Identify the structure of: 'Recycling should be mandatory in every school. Firstly, it reduces waste significantly. Secondly, it builds lifelong habits. Therefore, schools play a key role in environmental education.'",
                pembahasan:
                  "Thesis: recycling should be mandatory in schools. Arguments: waste reduction and habit formation. Reiteration: schools play a key role in environmental education.",
              },
            ],
          },
          flashcards: [
            {
              id: "biw-text-functional-analytical-exposition-fc1",
              front: "What is the difference between analytical and hortatory exposition?",
              back: "Analytical exposition ends by restating the thesis; hortatory exposition ends with a recommendation or call to action.",
            },
            {
              id: "biw-text-functional-analytical-exposition-fc2",
              front: "Which tense dominates an analytical exposition?",
              back: "Simple present tense, because the writer presents general opinions and facts rather than past events.",
            },
            {
              id: "biw-text-functional-analytical-exposition-fc3",
              front: "What are mental verbs and why are they used?",
              back: "Verbs such as believe, think, argue, and assume express the writer's stance and signal that the text presents an opinion.",
            },
            {
              id: "biw-text-functional-analytical-exposition-fc4",
              front: "Which connectives typically sequence arguments?",
              back: "Firstly, secondly, furthermore, moreover, in addition, and finally are used to order and add arguments.",
            },
          ],
          quiz: [
            {
              id: "biw-text-functional-analytical-exposition-q1",
              question: "The generic structure of an analytical exposition is ...",
              options: [
                "Orientation, complication, resolution",
                "Thesis, arguments, reiteration",
                "Goal, materials, steps",
                "Newsworthy event, background, sources",
              ],
              correctIndex: 1,
              explanation:
                "An analytical exposition begins with a thesis, develops arguments, then restates the thesis in a reiteration.",
            },
            {
              id: "biw-text-functional-analytical-exposition-q2",
              question: "Text that ends with a recommendation is called ...",
              options: [
                "Analytical exposition",
                "Hortatory exposition",
                "Report text",
                "Narrative text",
              ],
              correctIndex: 1,
              explanation:
                "A hortatory exposition closes with a recommendation or call to action, whereas analytical exposition restates the thesis.",
            },
            {
              id: "biw-text-functional-analytical-exposition-q3",
              question: "The sentence 'I strongly believe that homework should be limited' functions as ...",
              options: ["An argument", "A reiteration", "A thesis", "A recommendation"],
              correctIndex: 2,
              explanation:
                "It states the writer's position at the beginning, which is the function of a thesis.",
            },
            {
              id: "biw-text-functional-analytical-exposition-q4",
              question: "Which phrase best introduces a second argument?",
              options: ["Therefore", "Moreover", "In conclusion", "For example"],
              correctIndex: 1,
              explanation:
                "'Moreover' adds another argument; 'therefore' marks a conclusion and 'for example' introduces illustration.",
            },
          ],
          latihanSoal: [
            {
              id: "biw-text-functional-analytical-exposition-l1",
              level: "hots",
              question:
                "Read: 'Many people argue that online learning cannot replace face-to-face instruction. I believe this view is too simplistic. Firstly, online platforms allow students in remote areas to access qualified teachers they could never reach otherwise. Secondly, recorded lessons let learners review difficult material repeatedly, which is impossible in a live classroom. Moreover, digital tools provide instant feedback on exercises. Therefore, online learning should be seen as a complement to, not a replacement for, classroom teaching.' (a) Identify the thesis. (b) List the arguments. (c) Identify the reiteration. (d) Explain whether the writer rejects online learning entirely.",
              langkah: [
                "Locate the thesis: the writer's position is that the view that online learning cannot replace face-to-face instruction is too simplistic.",
                "Identify argument 1: online platforms give students in remote areas access to qualified teachers.",
                "Identify argument 2: recorded lessons allow repeated review, which a live classroom cannot offer.",
                "Identify argument 3: digital tools provide instant feedback on exercises.",
                "Identify the reiteration: online learning should be treated as a complement, not a replacement.",
                "Answer the final question: the writer does not reject online learning but rejects the extreme claim that it is useless.",
                "Note the contrast with hortatory exposition: this text restates a position rather than issuing a call to action.",
              ],
              jawaban:
                "(a) Thesis: the claim that online learning cannot replace face-to-face instruction is too simplistic (b) Arguments: access to qualified teachers for remote students; repeated review through recordings; instant feedback from digital tools (c) Reiteration: online learning should complement, not replace, classroom teaching (d) No, the writer accepts online learning but positions it as a complement rather than a full replacement.",
            },
            {
              id: "biw-text-functional-analytical-exposition-l2",
              level: "sulit",
              question:
                "Write a complete analytical exposition outline on the topic 'Should schools start later in the morning?' including (a) a thesis, (b) three arguments with the type of evidence each needs, (c) a reiteration, and (d) an explanation of how your text differs from a hortatory exposition on the same topic.",
              langkah: [
                "Draft the thesis: schools should start later in the morning because adolescent sleep cycles require later wake times.",
                "Draft argument 1: adolescent biology shifts sleep onset later. Evidence needed: sleep research on circadian rhythms in teenagers.",
                "Draft argument 2: later starts correlate with better attendance and concentration. Evidence needed: data from schools that have changed their schedules.",
                "Draft argument 3: improved sleep supports mental health. Evidence needed: studies linking sleep duration to adolescent wellbeing.",
                "Draft the reiteration: later start times are a reasonable, evidence-based adjustment rather than a concession to laziness.",
                "Explain the difference from a hortatory exposition: the hortatory version would close with a direct recommendation such as 'Therefore, the ministry must immediately revise school start times.'",
                "Note that the analytical version restates the position instead of issuing an instruction.",
              ],
              jawaban:
                "(a) Thesis: schools should start later because adolescent sleep cycles require later wake times (b) Arguments: circadian biology (sleep research), improved attendance and concentration (school schedule data), better mental health (sleep duration studies) (c) Reiteration: later start times are an evidence-based adjustment, not a concession to laziness (d) A hortatory exposition would end with a call to action such as 'the ministry must revise start times immediately', while this analytical exposition restates the position without an instruction.",
            },
          ],
      tkaSoal: [
        {
          id: "biw-text-functional-analytical-exposition-tka1",
          bentuk: "pg",
          level: "L1",
          question: "The structure of an analytical exposition is ...",
          options: [
            { id: "A", text: "orientation, complication, resolution" },
            { id: "B", text: "thesis, arguments, reiteration" },
            { id: "C", text: "goal, materials, steps" },
            { id: "D", text: "newsworthy event, background, sources" },
            { id: "E", text: "identification, description" },
          ],
          correctIds: ["B"],
          explanation:
            "An analytical exposition moves from a thesis through supporting arguments to a reiteration of the position. The other options describe narrative, procedure, news, and report texts respectively.",
        },
        {
          id: "biw-text-functional-analytical-exposition-tka2",
          bentuk: "pg",
          level: "L2",
          stimulus:
            "Read the conclusion! 'Later start times are an evidence-based adjustment to adolescent sleep needs, not a concession to laziness.'",
          question: "How does an analytical exposition differ from a hortatory exposition at this point?",
          options: [
            { id: "A", text: "A hortatory exposition would restate the position; an analytical one would call for action" },
            { id: "B", text: "A hortatory exposition would end with a call to action, while an analytical exposition restates the position" },
            { id: "C", text: "Both end with a call to action" },
            { id: "D", text: "An analytical exposition has no conclusion at all" },
            { id: "E", text: "Both end with a reiteration and no recommendation" },
          ],
          correctIds: ["B"],
          explanation:
            "An analytical exposition closes by restating the position, whereas a hortatory exposition closes by urging the reader to act, for example 'the ministry must revise start times immediately'.",
        },
        {
          id: "biw-text-functional-analytical-exposition-tka3",
          bentuk: "pgk-mcma",
          level: "L3",
          stimulus:
            "Read the plan! Thesis: schools should start later because adolescent sleep cycles require later wake times. Arguments: circadian biology (sleep research), improved attendance and concentration (school schedule data), better mental health (sleep duration studies). Reiteration: later start times are an evidence-based adjustment, not a concession to laziness.",
          question:
            "Which statements about this text plan are correct? There is more than one correct answer. Click on every correct answer!",
          options: [
            { id: "A", text: "The thesis states a position that the arguments must support" },
            { id: "B", text: "Each argument is supported by a different kind of evidence" },
            { id: "C", text: "The reiteration restates the position rather than calling for action" },
            { id: "D", text: "The plan uses the structure of a procedure text" },
            { id: "E", text: "The reiteration introduces a new argument not mentioned earlier" },
          ],
          correctIds: ["A", "B", "C"],
          explanation:
            "The thesis is the position the arguments support (A), and the three arguments draw on sleep research, schedule data, and sleep duration studies respectively (B). The reiteration restates rather than commands, which marks the analytical type (C). A procedure text would have goal, materials, and steps (D false), and a reiteration must not introduce new arguments (E false).",
        },
        {
          id: "biw-text-functional-analytical-exposition-tka4",
          bentuk: "isian",
          level: "L2",
          question:
            "Write the single word naming the part of an analytical exposition that states the writer's position at the beginning.",
          correctIds: ["thesis"],
          explanation:
            "That part is the thesis: it announces the writer's position on the issue and orients the reader for the arguments that follow.",
        },
      ],
        },
        {
          id: "biw-text-functional-procedural-report",
          title: "Procedural & Report Text",
          estimatedMinutes: 30,
          materi: {
            ringkasan:
              "A procedure text explains how to make or do something through a sequence of steps, while a report text describes something as it is, based on observation and general classification. Recognising the purpose and structure of each type is essential for functional text questions.",
            rumus: [
              "Procedure structure: Goal (title/purpose) → Materials (ingredients/tools) → Steps (methods in order)",
              "Procedure language: imperative verbs, adverbials of sequence (first, then, next, finally), precise measurements",
              "Report structure: General classification → Description (parts, qualities, habits, or uses)",
              "Report language: simple present tense, general nouns, technical terms, and no temporal sequence",
              "Key contrast: procedure answers 'how', while report answers 'what is'",
            ],
            contoh: [
              {
                soal:
                  "Classify: 'Water is a transparent liquid that covers about 71 percent of the Earth's surface. It exists in three states: solid, liquid, and gas.'",
                pembahasan:
                  "This is a report text: it describes water in general using simple present tense and a general classification followed by descriptions, with no steps to follow.",
              },
              {
                soal: "Identify the structure of a recipe for fried rice.",
                pembahasan:
                  "Goal: how to make fried rice; Materials: rice, eggs, garlic, seasoning; Steps: heat the oil, sauté the garlic, add the rice, and so on.",
              },
            ],
          },
          flashcards: [
            {
              id: "biw-text-functional-procedural-report-fc1",
              front: "What is the main difference between procedure and report text?",
              back: "Procedure text tells how to do or make something through ordered steps; report text describes something as it is, without instructions.",
            },
            {
              id: "biw-text-functional-procedural-report-fc2",
              front: "What verb form dominates a procedure text?",
              back: "The imperative form begins each step, as in 'Heat the oil', 'Add the garlic', and 'Serve immediately'.",
            },
            {
              id: "biw-text-functional-procedural-report-fc3",
              front: "Why does a report text use general nouns?",
              back: "Because it describes a whole class of things, not one specific individual, so it uses general rather than particular reference.",
            },
            {
              id: "biw-text-functional-procedural-report-fc4",
              front: "Which text type would describe the life cycle of a butterfly?",
              back: "A report text, because it presents a factual description of a phenomenon rather than instructions to be followed.",
            },
          ],
          quiz: [
            {
              id: "biw-text-functional-procedural-report-q1",
              question: "The structure of a procedure text is ...",
              options: [
                "Thesis, arguments, reiteration",
                "Goal, materials, steps",
                "General classification, description",
                "Orientation, complication, resolution",
              ],
              correctIndex: 1,
              explanation:
                "A procedure text begins with a goal, lists materials, then gives ordered steps.",
            },
            {
              id: "biw-text-functional-procedural-report-q2",
              question: "Which sentence most likely comes from a report text?",
              options: [
                "First, boil the water for five minutes.",
                "Add two tablespoons of sugar and stir well.",
                "Orangutans are large primates native to the rainforests of Borneo and Sumatra.",
                "Serve the dish while it is still warm.",
              ],
              correctIndex: 2,
              explanation:
                "The sentence describes a class of animals using simple present tense, which is characteristic of a report text.",
            },
            {
              id: "biw-text-functional-procedural-report-q3",
              question: "Language that characterises a procedure text is ...",
              options: [
                "Imperative verbs and sequencing adverbials",
                "Past tense with temporal conjunctions",
                "Direct speech and quoted statements",
                "Mental verbs expressing opinion",
              ],
              correctIndex: 0,
              explanation:
                "Procedure text relies on imperative verbs and sequencers such as 'first', 'then', and 'finally'.",
            },
            {
              id: "biw-text-functional-procedural-report-q4",
              question: "A text explaining how to operate a fire extinguisher is best classified as ...",
              options: ["Report text", "Procedure text", "News item", "Analytical exposition"],
              correctIndex: 1,
              explanation:
                "It explains how to do something through ordered steps, so it is a procedure text.",
            },
          ],
          latihanSoal: [
            {
              id: "biw-text-functional-procedural-report-l1",
              level: "hots",
              question:
                "Read the text: 'How to Make a Simple Water Filter. You will need: a plastic bottle, clean sand, gravel, activated charcoal, a cloth, and a container. First, cut the bottle in half and invert the top part into the bottom. Next, place the cloth inside the neck. Then, layer the charcoal, sand, and gravel on top of the cloth. After that, pour dirty water slowly into the top. Finally, collect the filtered water in the container below.' (a) Classify the text type. (b) Identify the goal, materials, and steps. (c) Explain why 'finally' appears where it does. (d) State one language feature that proves the classification.",
              langkah: [
                "Classify the text: it explains how to make something, so it is a procedure text.",
                "Identify the goal: how to make a simple water filter.",
                "List materials: plastic bottle, clean sand, gravel, activated charcoal, cloth, and container.",
                "Identify the steps: cutting the bottle, placing the cloth, layering materials, pouring water, collecting filtered water.",
                "Explain 'finally': it marks the last action in the sequence, where the intended result is obtained, which is typical of procedure texts.",
                "State a language feature: the steps begin with imperative verbs ('cut', 'place', 'layer', 'pour', 'collect'), which is characteristic of procedure text.",
                "Confirm the structure matches Goal, Materials, Steps in that order.",
              ],
              jawaban:
                "(a) Procedure text (b) Goal: how to make a simple water filter; Materials: bottle, sand, gravel, charcoal, cloth, container; Steps: cut the bottle, place the cloth, layer the materials, pour water, collect the result (c) Because 'finally' signals the last step, in which the intended result is obtained (d) The steps use imperative verbs such as 'cut', 'place', 'pour', and 'collect'.",
            },
            {
              id: "biw-text-functional-procedural-report-l2",
              level: "sulit",
              question:
                "Compare these two texts about bees. Text A: 'Bees are flying insects known for their role in pollination. They live in colonies with a single queen, thousands of workers, and a few drones.' Text B: 'How to Care for a Beehive. First, choose a sunny location. Then, install the hive box. Next, introduce the colony gently. After that, inspect the frames weekly.' (a) Classify each text. (b) Explain how tense and verb type differ. (c) Explain what would happen if the labels were swapped. (d) Write one sentence that would fit Text A about bee communication.",
              langkah: [
                "Classify Text A: it describes bees as a class of insects with general facts, so it is a report text.",
                "Classify Text B: it explains how to do something through ordered steps, so it is a procedure text.",
                "Compare tense: Text A uses simple present for general truths; Text B uses imperative verbs for instructions.",
                "Compare structure: Text A uses general classification plus description; Text B uses goal, materials, and steps in sequence.",
                "Explain the swap problem: readers would look for steps in Text A (which has none) and expect general facts in Text B (which is action-oriented).",
                "Write a sentence for Text A about communication: 'Bees communicate the location of food sources through a waggle dance.'",
                "Confirm the new sentence uses simple present and describes the class generally, matching report-text features.",
              ],
              jawaban:
                "(a) Text A is a report text; Text B is a procedure text (b) Text A uses simple present for general facts; Text B uses imperative verbs for instructions (c) The structures would mismatch readers' expectations, so readers would fail to find steps in A or general facts in B (d) Example: 'Bees communicate the location of food sources through a waggle dance.'",
            },
          ],
          tkaSoal: [
            {
              id: "biw-text-functional-procedural-report-tka1",
              bentuk: "pg",
              level: "L1",
              question: "A procedure text typically uses ...",
              options: [
                { id: "A", text: "the simple past to narrate events" },
                { id: "B", text: "imperative verbs to give instructions" },
                { id: "C", text: "the passive voice throughout" },
                { id: "D", text: "rhetorical questions to persuade" },
                { id: "E", text: "quotation marks to report speech" },
              ],
              correctIds: ["B"],
              explanation:
                "Procedure texts give instructions, so they rely on imperative verbs such as 'mix', 'pour', and 'leave'. A report text instead uses the simple present for general facts.",
            },
            {
              id: "biw-text-functional-procedural-report-tka2",
              bentuk: "pg",
              level: "L2",
              stimulus:
                "Read the extract! 'Bees communicate the location of food sources through a waggle dance. The direction of the dance indicates the angle of the food relative to the sun, and the duration indicates distance.'",
              question: "This extract belongs to which text type, and why?",
              options: [
                { id: "A", text: "A procedure text, because it gives steps to follow" },
                { id: "B", text: "A report text, because it states general facts in the simple present" },
                { id: "C", text: "A news item, because it reports a recent event" },
                { id: "D", text: "An analytical exposition, because it argues a position" },
                { id: "E", text: "A narrative, because it tells a story with a complication" },
              ],
              correctIds: ["B"],
              explanation:
                "The extract describes how bees behave in general, using the simple present with no imperatives and no steps to follow. That is the profile of a report text.",
            },
            {
              id: "biw-text-functional-procedural-report-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              stimulus:
                "Text A: 'Bees communicate the location of food sources through a waggle dance. The direction of the dance indicates the angle of the food relative to the sun.' Text B: 'First, dissolve the sugar in warm water. Then add the yeast and stir gently. Finally, leave the mixture in a warm place for two hours.'",
              question:
                "Which statements comparing Text A and Text B are correct? There is more than one correct answer. Click on every correct answer!",
              options: [
                { id: "A", text: "Text A is a report; Text B is a procedure" },
                { id: "B", text: "Text A uses the simple present for general facts" },
                { id: "C", text: "Text B uses imperative verbs to give instructions" },
                { id: "D", text: "Swapping the two structures would not affect readers' expectations" },
                { id: "E", text: "Text A contains a goal, materials, and steps" },
              ],
              correctIds: ["A", "B", "C"],
              explanation:
                "Text A describes general facts about bees while Text B gives steps, so A is a report and B a procedure (A, B, C). Swapping them would mismatch readers' expectations, because readers of a procedure look for steps (D false), and the goal-materials-steps structure belongs to Text B (E false).",
            },
            {
              id: "biw-text-functional-procedural-report-tka4",
              bentuk: "isian",
              level: "L2",
              question:
                "Write the single word naming the structure step that begins a procedure text and states what will be made or done.",
              correctIds: ["goal", "aim", "purpose"],
              explanation:
                "That step is the goal (also called aim or purpose): it states what the reader will achieve by following the materials and steps that come next.",
            },
          ],
        },
        {
          id: "biw-text-functional-news-announcement",
          title: "News Item & Announcement",
          estimatedMinutes: 30,
          materi: {
            ringkasan:
              "A news item reports newsworthy events to readers, while an announcement informs a specific audience about an upcoming event, rule, or change. Both are functional texts, but they differ in structure, audience, and typical language.",
            rumus: [
              "News item structure: Newsworthy event → Background events (elaboration) → Sources (comments from authorities or witnesses)",
              "News item language: past tense for events, direct and indirect speech for sources, action verbs, and a headline",
              "Announcement structure: Title or heading → Content (what, when, where, who) → Contact or signature",
              "Announcement language: simple present and future tense, formal register, clear details, and sometimes imperatives",
              "Key contrast: a news item reports something that has happened; an announcement informs about something that will happen",
            ],
            contoh: [
              {
                soal:
                  "Identify the structure of: 'Heavy rain caused flooding in three districts yesterday. According to the local agency, 400 families were evacuated. The agency head said, \"We have distributed clean water and blankets.\"'",
                pembahasan:
                  "Newsworthy event: flooding in three districts. Background: 400 families evacuated. Sources: statement from the agency head, using direct speech.",
              },
              {
                soal: "Write a one-line announcement for a school science fair registration deadline.",
                pembahasan:
                  "Example: 'All students are hereby informed that science fair registration closes on Friday, 15 March, at 3 p.m. at the student affairs office.'",
              },
            ],
          },
          flashcards: [
            {
              id: "biw-text-functional-news-announcement-fc1",
              front: "What are the three parts of a news item?",
              back: "Newsworthy event, background events that elaborate on it, and sources that provide comments from authorities or witnesses.",
            },
            {
              id: "biw-text-functional-news-announcement-fc2",
              front: "Which tense dominates a news item?",
              back: "Simple past tense, because the text reports events that have already happened.",
            },
            {
              id: "biw-text-functional-news-announcement-fc3",
              front: "What details must an announcement always include?",
              back: "What the event or change is, when it happens, where it takes place, and who is affected or should act.",
            },
            {
              id: "biw-text-functional-news-announcement-fc4",
              front: "Why do news items use direct speech?",
              back: "Direct speech from sources adds credibility and authenticity, and lets readers hear the statement in the speaker's own words.",
            },
          ],
          quiz: [
            {
              id: "biw-text-functional-news-announcement-q1",
              question: "The structure of a news item is ...",
              options: [
                "Goal, materials, steps",
                "Newsworthy event, background events, sources",
                "Thesis, arguments, reiteration",
                "General classification, description",
              ],
              correctIndex: 1,
              explanation:
                "A news item presents the newsworthy event, then elaborates with background, then quotes sources.",
            },
            {
              id: "biw-text-functional-news-announcement-q2",
              question: "Which sentence most likely belongs to an announcement?",
              options: [
                "The earthquake struck at 4 a.m. local time.",
                "Witnesses reported seeing smoke above the building.",
                "Students are required to submit the form by 20 April.",
                "Officials confirmed the damage was extensive.",
              ],
              correctIndex: 2,
              explanation:
                "The sentence states a requirement for a specific audience about a future deadline, which is characteristic of an announcement.",
            },
            {
              id: "biw-text-functional-news-announcement-q3",
              question: "The dominant tense in a news item's event report is ...",
              options: ["Simple present", "Simple past", "Present perfect", "Future continuous"],
              correctIndex: 1,
              explanation:
                "News items report completed events, so the simple past tense dominates the event section.",
            },
            {
              id: "biw-text-functional-news-announcement-q4",
              question: "Quoted statements from officials in a news item function as ...",
              options: ["The newsworthy event", "The background", "The sources", "The headline"],
              correctIndex: 2,
              explanation:
                "Quoted statements provide the sources element, which lends credibility by attributing information to named authorities.",
            },
          ],
          latihanSoal: [
            {
              id: "biw-text-functional-news-announcement-l1",
              level: "hots",
              question:
                "Read: 'A fire broke out on the third floor of a shopping centre on Tuesday evening. According to the fire department, the blaze started in a storage room and was extinguished within forty minutes. No injuries were reported. \"We evacuated about six hundred visitors as a precaution,\" said the fire department chief. The management has announced that the building will reopen on Thursday.' (a) Identify the newsworthy event. (b) Identify the background events. (c) Identify the sources and their function. (d) Explain how the final sentence differs in text type from the rest of the passage.",
              langkah: [
                "Identify the newsworthy event: a fire broke out on the third floor of a shopping centre on Tuesday evening.",
                "Identify background events: the fire started in a storage room, was extinguished in forty minutes, and caused no injuries.",
                "Identify the source: the fire department chief, quoted in direct speech about evacuating six hundred visitors.",
                "Explain the source's function: direct quotation adds credibility and provides details that readers would otherwise have to take on trust.",
                "Examine the final sentence: the management's announcement about reopening on Thursday states a future action.",
                "Explain the type difference: the final sentence functions like an announcement because it informs about an upcoming event, whereas the rest reports a completed event.",
                "Note that news items regularly include such forward-looking statements, but structurally they belong to the announcement function.",
              ],
              jawaban:
                "(a) A fire broke out on the third floor of a shopping centre on Tuesday evening (b) The fire started in a storage room, was extinguished in forty minutes, and caused no injuries (c) The fire department chief, whose direct quotation adds credibility and supplies evacuation details (d) The final sentence informs about a future reopening, so it functions like an announcement, while the rest of the passage reports an event that has already happened.",
            },
            {
              id: "biw-text-functional-news-announcement-l2",
              level: "sulit",
              question:
                "Write a news item outline AND a matching announcement on this situation: a school will hold a science fair next month, and last year the event attracted national media coverage. (a) Write the news item outline with all three parts. (b) Write the announcement with a title and all required details. (c) Explain the tense differences between your two texts. (d) Explain why the same event requires two different text types.",
              langkah: [
                "Plan the news item's newsworthy event: last year's science fair attracted national media coverage, which makes it newsworthy.",
                "Plan the background events: the number of participants, the winning projects, and the media outlets that covered it.",
                "Plan the sources: quotations from the principal or the event coordinator about the impact of the coverage.",
                "Use past tense throughout the news item and include a headline such as 'School Science Fair Draws National Attention'.",
                "Plan the announcement: state the upcoming science fair with title, date, venue, participants, and registration procedure.",
                "Use present and future tense in the announcement and include a contact or signature line as required.",
                "Compare tenses: the news item reports completed events in the past, while the announcement refers to a future event using present and future forms.",
                "Explain the dual purpose: the news item informs the public about something that happened, whereas the announcement gives specific instructions to an identified audience about what will happen.",
              ],
              jawaban:
                "(a) News item: newsworthy event (last year's fair drew national coverage), background (participant numbers, winning projects, media outlets), sources (quotations from the principal or coordinator) (b) Announcement: 'Science Fair 2025' with date, venue, participant requirements, registration deadline, and contact person (c) The news item uses past tense to report completed events, while the announcement uses present and future tense to describe an upcoming event (d) Because the two texts serve different audiences and purposes: one reports publicly on what happened, the other instructs a specific audience about what will happen.",
            },
          ],
          tkaSoal: [
            {
              id: "biw-text-functional-news-announcement-tka1c",
              bentuk: "pg",
              level: "L1",
              question: "A news item mainly reports ...",
              options: [
                { id: "A", text: "general facts about a topic" },
                { id: "B", text: "a newsworthy event that has happened" },
                { id: "C", text: "steps for completing a task" },
                { id: "D", text: "the writer's opinion on an issue" },
                { id: "E", text: "an imaginary sequence of events" },
              ],
              correctIds: ["B"],
              explanation:
                "A news item reports a newsworthy event to readers, then supplies background and sources. General facts belong to reports, steps to procedures, and opinions to expositions.",
            },
            {
              id: "biw-text-functional-news-announcement-tka2c",
              bentuk: "pg",
              level: "L2",
              stimulus:
                "Read the announcement! 'Science Fair 2025 will be held on 12 October in the main hall. Participants must submit a project abstract by 5 October. For further information, contact the science coordinator.'",
              question: "Which language feature is typical of this announcement?",
              options: [
                { id: "A", text: "Past tense verbs reporting completed events" },
                { id: "B", text: "Present and future tense plus a modal of obligation" },
                { id: "C", text: "A thesis followed by arguments and reiteration" },
                { id: "D", text: "Concrete nouns listed as material requirements" },
                { id: "E", text: "Dialogue between named characters" },
              ],
              correctIds: ["B"],
              explanation:
                "The announcement describes a future event ('will be held') and imposes a requirement ('must submit'). Past tense reporting belongs to a news item, and thesis-arguments-reiteration belongs to an analytical exposition.",
            },
            {
              id: "biw-text-functional-news-announcement-tka3c",
              bentuk: "pgk-mcma",
              level: "L3",
              question:
                "Which statements correctly distinguish news items from announcements? There is more than one correct answer. Click on every correct answer!",
              options: [
                { id: "A", text: "A news item reports on events that have already happened" },
                { id: "B", text: "An announcement informs a specific audience about what will happen" },
                { id: "C", text: "A news item usually names its sources, while an announcement names a contact person" },
                { id: "D", text: "Both texts are structured as goal, materials, and steps" },
                { id: "E", text: "An announcement reports a completed event to the general public" },
              ],
              correctIds: ["A", "B", "C"],
              explanation:
                "News items report completed events (A), announcements inform a target audience about future events (B), and both name the party responsible for the information, namely sources or a contact person (C). Goal-materials-steps is the procedure structure (D false), and reporting completed events publicly is the news item's role, not the announcement's (E false).",
            },
            {
              id: "biw-text-functional-news-announcement-tka4c",
              bentuk: "isian",
              level: "L2",
              question:
                "Write the role that an announcement lists so readers know whom to approach for further information (two words).",
              correctIds: ["contact person", "contact", "contact-person"],
              explanation:
                "That is the contact person: a named individual or office readers can approach for clarification, which is typical of announcements but not of news items.",
            },
          ],
        },
      ],
    },
  ],
};

/* ==================================================================
 * 4. MATEMATIKA TINGKAT LANJUT
 * ================================================================*/

const MATEMATIKA_TINGKAT_LANJUT: Subject = {
  id: "matematika-tingkat-lanjut",
  title: "Matematika Tingkat Lanjut",
  shortTitle: "Mat. Lanjut",
  icon: "🧮",
  accent: "amber",
  description: "Materi pengayaan untuk soal-soal tingkat lanjut.",
  chapters: [
    {
      id: "mtl-polinomial",
      title: "Polinomial",
      order: 1,
      subtopics: [
        {
          id: "mtl-polinomial-operasi-sifat",
          title: "Operasi & Sifat Polinomial",
          estimatedMinutes: 60,
          materi: {
            ringkasan:
              "Polinomial adalah bentuk aljabar dengan suku-suku berpangkat bilangan bulat tak negatif. Operasi penjumlahan, pengurangan, dan perkalian dapat dilakukan langsung pada suku-suku sejenis, sementara pembagian memerlukan metode khusus.",
            rumus: [
              "Bentuk umum: \\( P(x) = a_{n}x^{n} + a_{n-1}x^{n-1} + \\cdots + a_{1}x + a_{0} \\) dengan \\( a_{n} \\ne 0 \\)",
              "Derajat polinomial adalah pangkat tertinggi variabelnya, yaitu \\( n \\)",
              "Penjumlahan/pengurangan hanya dapat dilakukan pada suku sejenis",
              "Perkalian: derajat hasil = jumlah derajat kedua polinomial",
              "Kesamaan polinomial: dua polinomial sama jika koefisien suku sejenisnya sama",
            ],
            contoh: [
              {
                soal:
                  "Diketahui \\( P(x) = 2x^{3} - 5x + 1 \\) dan \\( Q(x) = x^{3} + 4x^{2} - 3 \\). Tentukan \\( P(x) + Q(x) \\) dan derajatnya.",
                pembahasan:
                  "Jumlahkan suku sejenis: \\( 3x^{3} + 4x^{2} - 5x - 2 \\). Derajatnya 3 karena pangkat tertinggi adalah 3.",
              },
              {
                soal:
                  "Tentukan koefisien \\( x^{2} \\) pada hasil \\( (x^{2} + 3x - 1)(2x - 5) \\).",
                pembahasan:
                  "Kalikan tiap suku: \\( x^{2} \\cdot 2x = 2x^{3} \\), \\( x^{2}(-5) = -5x^{2} \\), \\( 3x \\cdot 2x = 6x^{2} \\). Koefisien \\( x^{2} \\) adalah \\( -5 + 6 = 1 \\).",
              },
            ],
          },
          flashcards: [
            {
              id: "mtl-polinomial-operasi-sifat-fc1",
              front: "Bagaimana menentukan derajat hasil perkalian dua polinomial?",
              back: "Jumlahkan derajat kedua polinomial: jika \\( \\deg P = m \\) dan \\( \\deg Q = n \\), maka \\( \\deg(PQ) = m + n \\).",
            },
            {
              id: "mtl-polinomial-operasi-sifat-fc2",
              front: "Apa syarat dua polinomial disebut sama?",
              back: "Koefisien setiap suku sejenis harus sama, yaitu \\( a_{k} = b_{k} \\) untuk semua \\( k \\).",
            },
            {
              id: "mtl-polinomial-operasi-sifat-fc3",
              front: "Apakah \\( x^{-2} + 3x \\) termasuk polinomial?",
              back: "Bukan, karena pangkat negatif tidak diperbolehkan. Polinomial hanya memuat pangkat bilangan bulat tak negatif.",
            },
            {
              id: "mtl-polinomial-operasi-sifat-fc4",
              front: "Berapa derajat polinomial konstan bukan nol?",
              back: "Derajat 0, karena dapat ditulis sebagai \\( a_{0}x^{0} \\) dengan \\( a_{0} \\ne 0 \\).",
            },
          ],
          quiz: [
            {
              id: "mtl-polinomial-operasi-sifat-q1",
              question: "Derajat dari \\( (2x^{2} - 1)(x^{3} + 4) \\) adalah ...",
              options: ["3", "5", "6", "2"],
              correctIndex: 1,
              explanation: "Derajat hasil perkalian adalah jumlah derajat: \\( 2 + 3 = 5 \\).",
            },
            {
              id: "mtl-polinomial-operasi-sifat-q2",
              question:
                "Jika \\( P(x) = 3x^{2} + ax - 4 \\) sama dengan \\( Q(x) = bx^{2} + 5x - 4 \\), maka \\( a + b = ... \\)",
              options: ["5", "6", "7", "8"],
              correctIndex: 3,
              explanation:
                "Kesamaan koefisien memberi \\( a = 5 \\) dan \\( b = 3 \\), sehingga \\( a + b = 8 \\).",
            },
            {
              id: "mtl-polinomial-operasi-sifat-q3",
              question: "Hasil \\( (x - 3)(x^{2} + 2x - 1) \\) adalah ...",
              options: [
                "\\( x^{3} - x^{2} - 7x + 3 \\)",
                "\\( x^{3} + x^{2} - 7x + 3 \\)",
                "\\( x^{3} - x^{2} + 7x + 3 \\)",
                "\\( x^{3} - x^{2} - 7x - 3 \\)",
              ],
              correctIndex: 0,
              explanation:
                "Kalikan: \\( x^{3} + 2x^{2} - x - 3x^{2} - 6x + 3 = x^{3} - x^{2} - 7x + 3 \\).",
            },
            {
              id: "mtl-polinomial-operasi-sifat-q4",
              question: "Manakah yang BUKAN polinomial?",
              options: [
                "\\( 4x^{3} - 2x + 7 \\)",
                "\\( \\sqrt{3}\\,x^{2} + 1 \\)",
                "\\( x^{2} + 2x^{-1} \\)",
                "\\( -5x^{4} \\)",
              ],
              correctIndex: 2,
              explanation:
                "Suku \\( 2x^{-1} \\) memuat pangkat negatif, sehingga bukan polinomial. Koefisien berupa akar tetap diperbolehkan.",
            },
          ],
          latihanSoal: [
            {
              id: "mtl-polinomial-operasi-sifat-l1",
              level: "hots",
              question:
                "Sebuah kotak berbentuk balok dibuat dari karton. Panjangnya \\( (x + 3) \\) cm, lebarnya \\( (x - 1) \\) cm, dan tingginya \\( (2x + 1) \\) cm. (a) Susun polinomial volume \\( V(x) \\). (b) Tentukan derajat dan koefisien \\( x^{2} \\) dari \\( V(x) \\). (c) Hitung volume saat \\( x = 4 \\). (d) Tentukan nilai \\( x \\) minimum yang membuat semua dimensi positif.",
              langkah: [
                "Susun volume: \\( V(x) = (x+3)(x-1)(2x+1) \\).",
                "Kalikan dua faktor pertama: \\( (x+3)(x-1) = x^{2} + 2x - 3 \\).",
                "Kalikan dengan faktor ketiga: \\( (x^{2} + 2x - 3)(2x + 1) \\).",
                "Jabarkan: \\( 2x^{3} + x^{2} + 4x^{2} + 2x - 6x - 3 \\).",
                "Sederhanakan: \\( V(x) = 2x^{3} + 5x^{2} - 4x - 3 \\).",
                "Derajatnya 3 (pangkat tertinggi), dan koefisien \\( x^{2} \\) adalah 5.",
                "Hitung \\( V(4) = 2(64) + 5(16) - 4(4) - 3 = 128 + 80 - 16 - 3 = 189 \\) cm kubik.",
                "Tentukan syarat dimensi positif: \\( x + 3 > 0 \\) selalu benar untuk \\( x \\) positif; \\( x - 1 > 0 \\Rightarrow x > 1 \\); \\( 2x + 1 > 0 \\) selalu benar. Jadi syaratnya \\( x > 1 \\).",
              ],
              jawaban:
                "(a) \\( V(x) = 2x^{3} + 5x^{2} - 4x - 3 \\) (b) Derajat 3, koefisien \\( x^{2} \\) adalah 5 (c) \\( V(4) = 189 \\) cm kubik (d) \\( x > 1 \\) cm.",
            },
            {
              id: "mtl-polinomial-operasi-sifat-l2",
              level: "sulit",
              question:
                "Diketahui \\( P(x) = x^{3} + ax^{2} - 3x + b \\) dan \\( Q(x) = x^{3} + 2x^{2} + cx - 5 \\). Jika \\( P(x) - Q(x) = -x^{2} + dx + 8 \\), tentukan nilai \\( a, b, c \\) dan \\( d \\), lalu hitung \\( P(2) \\).",
              langkah: [
                "Susun selisih: \\( P(x) - Q(x) = (a - 2)x^{2} + (-3 - c)x + (b + 5) \\).",
                "Samakan koefisien \\( x^{2} \\): \\( a - 2 = -1 \\Rightarrow a = 1 \\).",
                "Samakan koefisien \\( x \\): \\( -3 - c = d \\).",
                "Samakan konstanta: \\( b + 5 = 8 \\Rightarrow b = 3 \\).",
                "Tentukan \\( c \\) dan \\( d \\): dari pernyataan soal, selisih koefisien \\( x \\) adalah \\( d \\); karena \\( -3 - c = d \\), nilai \\( c \\) dan \\( d \\) saling menentukan. Dengan menetapkan \\( d = 1 \\), diperoleh \\( -3 - c = 1 \\Rightarrow c = -4 \\).",
                "Substitusi ke \\( P(x) \\): \\( P(x) = x^{3} + x^{2} - 3x + 3 \\).",
                "Hitung \\( P(2) = 8 + 4 - 6 + 3 = 9 \\).",
                "Verifikasi dengan \\( Q(2) = 8 + 8 + (-8) - 5 = 3 \\), sehingga \\( P(2) - Q(2) = 6 \\); uji dengan ekspresi selisih \\( -x^{2} + dx + 8 \\) pada \\( x = 2 \\): \\( -4 + 2 + 8 = 6 \\). Cocok.",
              ],
              jawaban:
                "\\( a = 1 \\), \\( b = 3 \\), \\( c = -4 \\), \\( d = 1 \\), dan \\( P(2) = 9 \\).",
            },
          ],
          tkaSoal: [
            {
              id: "mtl-polinomial-operasi-sifat-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Manakah bentuk berikut yang merupakan polinomial?",
              options: [
                { id: "A", text: "\\( x^{-2} + 3x - 1 \\)" },
                { id: "B", text: "\\( \\sqrt{x} + 2x \\)" },
                { id: "C", text: "\\( 2x^{3} - 5x + 1 \\)" },
                { id: "D", text: "\\( \\dfrac{3}{x} + 5 \\)" },
                { id: "E", text: "\\( |2x| + 7 \\)" },
              ],
              correctIds: ["C"],
              explanation:
                "Polinomial hanya memuat pangkat bilangan bulat tak negatif pada variabelnya. Pangkat negatif (A), bentuk akar (B), pecahan 1/x (D), dan nilai mutlak (E) bukan polinomial.",
            },
            {
              id: "mtl-polinomial-operasi-sifat-tka2",
              bentuk: "pg",
              level: "L2",
              question:
                "Koefisien \\( x^{2} \\) pada hasil kali \\( (x^{2} + 2x - 3)(3x - 1) \\) adalah ...",
              options: [
                { id: "A", text: "\\( 3 \\)" },
                { id: "B", text: "\\( 5 \\)" },
                { id: "C", text: "\\( 6 \\)" },
                { id: "D", text: "\\( -1 \\)" },
                { id: "E", text: "\\( -11 \\)" },
              ],
              correctIds: ["B"],
              explanation:
                "Suku \\( x^{2} \\) berasal dari \\( x^{2} \\cdot (-1) = -x^{2} \\) dan \\( 2x \\cdot 3x = 6x^{2} \\), sehingga koefisiennya \\( -1 + 6 = 5 \\).",
            },
            {
              id: "mtl-polinomial-operasi-sifat-tka3",
              bentuk: "pgk-mcma",
              level: "L2",
              question:
                "Pilih semua pernyataan yang BENAR tentang operasi dan sifat polinomial. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "Jumlah dua polinomial berderajat tiga selalu berderajat tiga" },
                { id: "B", text: "Derajat hasil kali dua polinomial sama dengan jumlah derajat kedua polinomial" },
                { id: "C", text: "Suku sejenis \\( 4x^{2} \\) dan \\( -2x^{2} \\) dapat dijumlahkan menjadi \\( 2x^{2} \\)" },
                { id: "D", text: "Dua polinomial dikatakan sama jika koefisien setiap suku sejenisnya sama" },
                { id: "E", text: "\\( \\dfrac{1}{x} + 2 \\) adalah polinomial berderajat satu" },
              ],
              correctIds: ["B", "C", "D"],
              explanation:
                "A salah karena suku berderajat tiga dapat saling menghapus, misalnya \\( x^{3} + (-x^{3} + 2x) = 2x \\). E salah karena \\( 1/x = x^{-1} \\) berpangkat negatif sehingga bukan polinomial.",
            },
            {
              id: "mtl-polinomial-operasi-sifat-tka4",
              bentuk: "isian",
              level: "L2",
              question:
                "Jika \\( (x + 2)(x - 3) = x^{2} + px - 6 \\), maka nilai \\( p \\) adalah ...",
              correctIds: ["-1"],
              explanation:
                "\\( (x + 2)(x - 3) = x^{2} - x - 6 \\), sehingga \\( p = -1 \\).",
            },
          ],
        },
        {
          id: "mtl-polinomial-teorema-sisa-faktor",
          title: "Teorema Sisa & Teorema Faktor",
          estimatedMinutes: 60,
          materi: {
            ringkasan:
              "Teorema sisa menyatakan bahwa sisa pembagian polinomial oleh (x - k) sama dengan nilai polinomial di k. Teorema faktor adalah konsekuensinya: (x - k) merupakan faktor jika dan hanya jika nilai polinomial di k adalah nol.",
            rumus: [
              "Teorema sisa: jika \\( P(x) \\) dibagi \\( (x - k) \\), maka sisanya \\( P(k) \\)",
              "Pembagian oleh \\( (ax + b) \\): sisanya \\( P\\left(-\\dfrac{b}{a}\\right) \\)",
              "Teorema faktor: \\( (x - k) \\) faktor dari \\( P(x) \\iff P(k) = 0 \\)",
              "Bentuk pembagian: \\( P(x) = (x - k) \\cdot H(x) + S \\) dengan \\( S \\) konstanta sisa",
              "Jika dibagi oleh faktor kuadrat, sisa berbentuk \\( ax + b \\)",
            ],
            contoh: [
              {
                soal:
                  "Tentukan sisa pembagian \\( P(x) = 2x^{3} - 4x^{2} + 3x - 5 \\) oleh \\( (x - 2) \\).",
                pembahasan:
                  "Sisa \\( = P(2) = 2(8) - 4(4) + 3(2) - 5 = 16 - 16 + 6 - 5 = 1 \\).",
              },
              {
                soal:
                  "Tentukan nilai \\( m \\) agar \\( (x - 3) \\) menjadi faktor dari \\( P(x) = x^{3} - 2x^{2} + mx - 6 \\).",
                pembahasan:
                  "Syaratnya \\( P(3) = 0 \\): \\( 27 - 18 + 3m - 6 = 0 \\Rightarrow 3m = -3 \\Rightarrow m = -1 \\).",
              },
            ],
          },
          flashcards: [
            {
              id: "mtl-polinomial-teorema-sisa-faktor-fc1",
              front: "Apa isi teorema sisa?",
              back: "Sisa pembagian \\( P(x) \\) oleh \\( (x - k) \\) sama dengan nilai \\( P(k) \\), tanpa perlu melakukan pembagian panjang.",
            },
            {
              id: "mtl-polinomial-teorema-sisa-faktor-fc2",
              front: "Bagaimana bentuk sisa jika pembagi berderajat dua?",
              back: "Sisanya berbentuk linear \\( ax + b \\), karena derajat sisa selalu kurang dari derajat pembagi.",
            },
            {
              id: "mtl-polinomial-teorema-sisa-faktor-fc3",
              front: "Apa hubungan teorema faktor dan akar polinomial?",
              back: "\\( (x - k) \\) faktor dari \\( P(x) \\) tepat ketika \\( k \\) adalah akar, yaitu \\( P(k) = 0 \\).",
            },
            {
              id: "mtl-polinomial-teorema-sisa-faktor-fc4",
              front: "Sisa pembagian \\( P(x) \\) oleh \\( (ax + b) \\)?",
              back: "\\( P\\left(-\\dfrac{b}{a}\\right) \\), karena akar pembaginya adalah \\( x = -\\dfrac{b}{a} \\).",
            },
          ],
          quiz: [
            {
              id: "mtl-polinomial-teorema-sisa-faktor-q1",
              question:
                "Sisa pembagian \\( P(x) = x^{3} + 2x - 7 \\) oleh \\( (x - 1) \\) adalah ...",
              options: ["-4", "-2", "0", "2"],
              correctIndex: 0,
              explanation: "\\( P(1) = 1 + 2 - 7 = -4 \\).",
            },
            {
              id: "mtl-polinomial-teorema-sisa-faktor-q2",
              question:
                "\\( (x + 2) \\) merupakan faktor dari \\( P(x) = x^{3} + kx^{2} - 4x - 8 \\). Nilai \\( k \\) adalah ...",
              options: ["1", "2", "3", "4"],
              correctIndex: 1,
              explanation:
                "Syaratnya \\( P(-2) = 0 \\): \\( -8 + 4k + 8 - 8 = 0 \\Rightarrow 4k = 8 \\Rightarrow k = 2 \\).",
            },
            {
              id: "mtl-polinomial-teorema-sisa-faktor-q3",
              question:
                "Sisa pembagian \\( P(x) = 3x^{3} + x^{2} + 4 \\) oleh \\( (3x - 1) \\) adalah ...",
              options: ["\\( \\tfrac{14}{3} \\)", "\\( \\tfrac{38}{9} \\)", "4", "\\( \\tfrac{10}{3} \\)"],
              correctIndex: 1,
              explanation:
                "Akar pembagi: \\( 3x - 1 = 0 \\Rightarrow x = \\tfrac{1}{3} \\). Substitusi ke \\( P(x) = 3x^{3} + x^{2} + 4 \\): \\( P\\left(\\tfrac{1}{3}\\right) = 3\\left(\\tfrac{1}{27}\\right) + \\left(\\tfrac{1}{9}\\right) + 4 = \\tfrac{1}{9} + \\tfrac{1}{9} + 4 = \\tfrac{2}{9} + \\tfrac{36}{9} = \\tfrac{38}{9} \\).",
            },
            {
              id: "mtl-polinomial-teorema-sisa-faktor-q4",
              question:
                "Jika \\( P(x) \\) dibagi \\( (x - 1) \\) bersisa 5 dan dibagi \\( (x - 2) \\) bersisa 11, maka sisa pembagian oleh \\( (x-1)(x-2) \\) adalah ...",
              options: ["\\( 6x - 1 \\)", "\\( 6x + 1 \\)", "\\( 5x + 1 \\)", "\\( x + 6 \\)"],
              correctIndex: 0,
              explanation:
                "Misalkan sisa \\( ax + b \\). Dari \\( a + b = 5 \\) dan \\( 2a + b = 11 \\) diperoleh \\( a = 6 \\) dan \\( b = -1 \\), sehingga sisanya \\( 6x - 1 \\).",
            },
          ],
          latihanSoal: [
            {
              id: "mtl-polinomial-teorema-sisa-faktor-l1",
              level: "hots",
              question:
                "Polinomial \\( P(x) = x^{4} - 3x^{3} + ax^{2} + bx - 12 \\) habis dibagi \\( (x - 1) \\) dan bersisa 24 ketika dibagi \\( (x + 2) \\). (a) Susun dua persamaan dari syarat tersebut. (b) Tentukan nilai \\( a \\) dan \\( b \\). (c) Faktorkan \\( P(x) \\) sepenuhnya. (d) Tentukan semua akarnya.",
              langkah: [
                "Gunakan syarat habis dibagi \\( (x-1) \\): \\( P(1) = 0 \\Rightarrow 1 - 3 + a + b - 12 = 0 \\Rightarrow a + b = 14 \\).",
                "Gunakan syarat sisa 24 saat dibagi \\( (x+2) \\): \\( P(-2) = 24 \\Rightarrow 16 + 24 + 4a - 2b - 12 = 24 \\Rightarrow 4a - 2b = -4 \\Rightarrow 2a - b = -2 \\).",
                "Selesaikan sistem: dari \\( a + b = 14 \\) dan \\( 2a - b = -2 \\), jumlahkan menjadi \\( 3a = 12 \\Rightarrow a = 4 \\), sehingga \\( b = 10 \\).",
                "Susun polinomial: \\( P(x) = x^{4} - 3x^{3} + 4x^{2} + 10x - 12 \\).",
                "Bagi dengan \\( (x - 1) \\) memakai skema Horner untuk memperoleh hasil bagi \\( x^{3} - 2x^{2} + 2x + 12 \\).",
                "Cari akar lain: uji \\( x = -2 \\) memberi \\( -8 - 8 - 4 + 12 = -8 \\), belum nol; uji \\( x = 2 \\) memberi \\( 8 - 8 + 4 + 12 = 16 \\).",
                "Coba faktor \\( (x + 2) \\) pada hasil bagi: \\( -8 - 8 - 4 + 12 \\ne 0 \\). Uji \\( x = -3 \\): \\( -27 - 18 - 6 + 12 = -39 \\). Uji \\( x = -1 \\): \\( -1 - 2 - 2 + 12 = 7 \\).",
                "Karena tidak ada akar rasional lain yang sederhana, periksa kembali perhitungan Horner dengan pembagian langsung \\( (x^{4} - 3x^{3} + 4x^{2} + 10x - 12) \\div (x - 1) \\) menghasilkan \\( x^{3} - 2x^{2} + 2x + 12 \\) dengan sisa 0. Benar.",
                "Simpulkan: \\( P(x) = (x - 1)(x^{3} - 2x^{2} + 2x + 12) \\), dengan akar real \\( x = 1 \\) dan akar lain dari faktor kubik.",
              ],
              jawaban:
                "(a) \\( a + b = 14 \\) dan \\( 2a - b = -2 \\) (b) \\( a = 4 \\), \\( b = 10 \\) (c) \\( P(x) = (x - 1)(x^{3} - 2x^{2} + 2x + 12) \\) (d) Satu akar rasional yang jelas adalah \\( x = 1 \\); akar lainnya berasal dari faktor kubik tersebut.",
            },
            {
              id: "mtl-polinomial-teorema-sisa-faktor-l2",
              level: "sulit",
              question:
                "Polinomial \\( P(x) \\) berderajat tiga dengan koefisien utama 1. Diketahui \\( P(1) = 6 \\), \\( P(2) = 17 \\), dan \\( P(3) = 42 \\). (a) Susun polinomial \\( P(x) \\). (b) Tentukan sisa pembagian \\( P(x) \\) oleh \\( (x - 4) \\). (c) Periksa apakah \\( P(x) \\) memiliki faktor \\( (x + 1) \\). (d) Jelaskan mengapa tiga nilai diketahui cukup untuk menentukan polinomial berderajat tiga koefisien utama 1.",
              langkah: [
                "Tulis bentuk umum: \\( P(x) = x^{3} + ax^{2} + bx + c \\).",
                "Gunakan \\( P(1) = 6 \\): \\( 1 + a + b + c = 6 \\Rightarrow a + b + c = 5 \\).",
                "Gunakan \\( P(2) = 17 \\): \\( 8 + 4a + 2b + c = 17 \\Rightarrow 4a + 2b + c = 9 \\).",
                "Gunakan \\( P(3) = 42 \\): \\( 27 + 9a + 3b + c = 42 \\Rightarrow 9a + 3b + c = 15 \\).",
                "Kurangkan persamaan kedua dengan pertama: \\( 3a + b = 4 \\).",
                "Kurangkan persamaan ketiga dengan kedua: \\( 5a + b = 6 \\).",
                "Selesaikan: \\( 2a = 2 \\Rightarrow a = 1 \\), lalu \\( b = 4 - 3 = 1 \\).",
                "Hitung \\( c = 5 - a - b = 5 - 1 - 1 = 3 \\).",
                "Polinomialnya \\( P(x) = x^{3} + x^{2} + x + 3 \\).",
                "Sisa pembagian oleh \\( (x - 4) \\): \\( P(4) = 64 + 16 + 4 + 3 = 87 \\).",
                "Periksa faktor \\( (x + 1) \\): \\( P(-1) = -1 + 1 - 1 + 3 = 2 \\ne 0 \\), jadi bukan faktor.",
                "Jelaskan kecukupan data: polinomial berderajat tiga dengan koefisien utama diketahui hanya punya tiga koefisien tak diketahui, sehingga tiga persamaan sudah cukup untuk menentukan secara tunggal.",
              ],
              jawaban:
                "(a) \\( P(x) = x^{3} + x^{2} + x + 3 \\) (b) \\( P(4) = 87 \\) (c) Bukan faktor, karena \\( P(-1) = 2 \\ne 0 \\) (d) Karena dengan koefisien utama diketahui, tersisa tiga koefisien tak diketahui, sehingga tiga nilai fungsi cukup untuk menentukan polinomial secara tunggal.",
            },
          ],
          tkaSoal: [
            {
              id: "mtl-polinomial-teorema-sisa-faktor-tka1",
              bentuk: "pg",
              level: "L1",
              question:
                "Sisa pembagian \\( P(x) = x^{3} + 2x^{2} - x + 5 \\) oleh \\( (x - 1) \\) adalah ...",
              options: [
                { id: "A", text: "3" },
                { id: "B", text: "5" },
                { id: "C", text: "6" },
                { id: "D", text: "7" },
                { id: "E", text: "9" },
              ],
              correctIds: ["D"],
              explanation:
                "Berdasarkan teorema sisa, sisa = \\( P(1) = 1 + 2 - 1 + 5 = 7 \\), tanpa perlu pembagian panjang.",
            },
            {
              id: "mtl-polinomial-teorema-sisa-faktor-tka2",
              bentuk: "pg",
              level: "L2",
              question:
                "Nilai \\( k \\) agar \\( (x + 3) \\) menjadi faktor dari \\( P(x) = x^{3} + 4x^{2} + kx - 6 \\) adalah ...",
              options: [
                { id: "A", text: "-2" },
                { id: "B", text: "-1" },
                { id: "C", text: "0" },
                { id: "D", text: "1" },
                { id: "E", text: "2" },
              ],
              correctIds: ["D"],
              explanation:
                "Syarat faktor: \\( P(-3) = 0 \\). Diperoleh \\( -27 + 36 - 3k - 6 = 3 - 3k = 0 \\), sehingga \\( k = 1 \\).",
            },
            {
              id: "mtl-polinomial-teorema-sisa-faktor-tka3",
              bentuk: "pgk-mcma",
              level: "L2",
              question:
                "Pilih semua pernyataan yang BENAR tentang teorema sisa dan teorema faktor. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "Sisa pembagian \\( P(x) \\) oleh \\( (x - k) \\) sama dengan \\( P(k) \\)" },
                { id: "B", text: "\\( (x - k) \\) merupakan faktor dari \\( P(x) \\) jika dan hanya jika \\( P(k) = 0 \\)" },
                { id: "C", text: "Sisa pembagian oleh pembagi berderajat dua selalu berupa konstanta" },
                { id: "D", text: "Sisa pembagian \\( P(x) \\) oleh \\( (2x - 4) \\) sama dengan \\( P(2) \\)" },
                { id: "E", text: "Jika \\( P(k) = 0 \\) maka \\( (x + k) \\) pasti merupakan faktor dari \\( P(x) \\)" },
              ],
              correctIds: ["A", "B", "D"],
              explanation:
                "C salah karena sisa dari pembagi berderajat dua berbentuk \\( ax + b \\), bukan konstanta. E salah karena faktor yang bersesuaian adalah \\( (x - k) \\) bukan \\( (x + k) \\). D benar karena akar dari \\( 2x - 4 \\) adalah \\( x = 2 \\).",
            },
            {
              id: "mtl-polinomial-teorema-sisa-faktor-tka4",
              bentuk: "isian",
              level: "L2",
              question:
                "Sisa pembagian \\( P(x) = 2x^{3} - 3x^{2} + x - 1 \\) oleh \\( (x - 2) \\) adalah ...",
              correctIds: ["5"],
              explanation:
                "\\( P(2) = 2(8) - 3(4) + 2 - 1 = 16 - 12 + 2 - 1 = 5 \\).",
            },
          ],
        },
        {
          id: "mtl-polinomial-pembagian-akar",
          title: "Pembagian Polinomial & Akar-Akar Persamaan",
          estimatedMinutes: 60,
          materi: {
            ringkasan:
              "Pembagian polinomial dapat dilakukan dengan pembagian panjang atau skema Horner. Setelah polinomial difaktorkan, akar-akarnya dapat ditentukan, dan hubungan antara akar dan koefisien (rumus Vieta) memungkinkan penghitungan jumlah, hasil kali, dan kombinasi akar tanpa mencari akarnya satu per satu.",
            rumus: [
              "Bentuk pembagian: \\( P(x) = Q(x) \\cdot H(x) + S(x) \\) dengan \\( \\deg S < \\deg Q \\)",
              "Skema Horner: menuliskan koefisien secara berurutan dan mengalikan secara berulang dengan akar pembagi",
              "Vieta derajat 2: \\( x_{1} + x_{2} = -\\dfrac{b}{a} \\) dan \\( x_{1}x_{2} = \\dfrac{c}{a} \\)",
              "Vieta derajat 3: \\( x_{1}+x_{2}+x_{3} = -\\dfrac{b}{a} \\), \\( x_{1}x_{2}+x_{1}x_{3}+x_{2}x_{3} = \\dfrac{c}{a} \\), \\( x_{1}x_{2}x_{3} = -\\dfrac{d}{a} \\)",
              "Jumlah akar berpasangan: \\( \\sum x_{i}x_{j} = \\dfrac{c}{a} \\) untuk polinomial derajat tiga",
            ],
            contoh: [
              {
                soal:
                  "Tentukan hasil bagi dan sisa pembagian \\( P(x) = x^{3} - 4x^{2} + 5x - 2 \\) oleh \\( (x - 1) \\).",
                pembahasan:
                  "Koefisien 1, -4, 5, -2 dibagi dengan akar 1 memberi hasil bagi \\( x^{2} - 3x + 2 \\) dan sisa 0. Jadi \\( P(x) = (x - 1)(x^{2} - 3x + 2) = (x-1)(x-1)(x-2) \\).",
              },
              {
                soal:
                  "Akar-akar \\( 2x^{3} - 5x^{2} + 4x - 3 = 0 \\) adalah \\( x_{1}, x_{2}, x_{3} \\). Tentukan \\( x_{1} + x_{2} + x_{3} \\) dan \\( x_{1}x_{2}x_{3} \\).",
                pembahasan:
                  "Dengan \\( a = 2, b = -5, d = -3 \\): jumlah akar \\( = \\dfrac{5}{2} \\) dan hasil kali akar \\( = -\\dfrac{-3}{2} = \\dfrac{3}{2} \\).",
              },
            ],
          },
          flashcards: [
            {
              id: "mtl-polinomial-pembagian-akar-fc1",
              front: "Kapan skema Horner lebih praktis daripada pembagian panjang?",
              back: "Saat pembaginya berbentuk \\( (x - k) \\) atau \\( (ax + b) \\) dengan akar sederhana, karena hanya melibatkan perkalian dan penjumlahan koefisien.",
            },
            {
              id: "mtl-polinomial-pembagian-akar-fc2",
              front: "Tuliskan rumus Vieta untuk jumlah akar polinomial derajat tiga.",
              back: "\\( x_{1} + x_{2} + x_{3} = -\\dfrac{b}{a} \\) untuk polinomial \\( ax^{3} + bx^{2} + cx + d \\).",
            },
            {
              id: "mtl-polinomial-pembagian-akar-fc3",
              front: "Mengapa derajat sisa selalu lebih kecil dari derajat pembagi?",
              back: "Karena proses pembagian berhenti tepat saat sisa tidak lagi dapat dibagi oleh pembagi, sehingga derajatnya harus lebih rendah.",
            },
            {
              id: "mtl-polinomial-pembagian-akar-fc4",
              front: "Apa manfaat rumus Vieta dalam soal ujian?",
              back: "Memungkinkan penghitungan jumlah, hasil kali, atau kombinasi akar tanpa harus menentukan nilai setiap akar terlebih dahulu.",
            },
          ],
          quiz: [
            {
              id: "mtl-polinomial-pembagian-akar-q1",
              question:
                "Hasil bagi pembagian \\( x^{3} + 2x^{2} - 5x - 6 \\) oleh \\( (x - 2) \\) adalah ...",
              options: [
                "\\( x^{2} + 4x + 3 \\)",
                "\\( x^{2} + 4x - 3 \\)",
                "\\( x^{2} - 4x + 3 \\)",
                "\\( x^{2} + 2x - 3 \\)",
              ],
              correctIndex: 0,
              explanation:
                "Dengan Horner pada akar 2: \\( 1, 4, 3, 0 \\), sehingga hasil baginya \\( x^{2} + 4x + 3 \\) dan sisanya 0.",
            },
            {
              id: "mtl-polinomial-pembagian-akar-q2",
              question:
                "Akar-akar \\( x^{3} - 6x^{2} + 11x - 6 = 0 \\) adalah ...",
              options: ["1, 2, 3", "1, 2, 6", "-1, 2, 3", "1, -2, 3"],
              correctIndex: 0,
              explanation:
                "Uji \\( x = 1 \\) memberi 0, dan hasil baginya \\( x^{2} - 5x + 6 = (x-2)(x-3) \\), sehingga akarnya 1, 2, dan 3.",
            },
            {
              id: "mtl-polinomial-pembagian-akar-q3",
              question:
                "Jika \\( x_{1}, x_{2}, x_{3} \\) adalah akar-akar \\( x^{3} - 3x^{2} + 4x - 5 = 0 \\), nilai \\( x_{1}x_{2} + x_{1}x_{3} + x_{2}x_{3} \\) adalah ...",
              options: ["-5", "4", "3", "-3"],
              correctIndex: 1,
              explanation:
                "Rumus Vieta memberi \\( \\sum x_{i}x_{j} = \\dfrac{c}{a} = \\dfrac{4}{1} = 4 \\).",
            },
            {
              id: "mtl-polinomial-pembagian-akar-q4",
              question:
                "Sisa pembagian \\( P(x) = x^{4} - 3x^{2} + 2 \\) oleh \\( (x^{2} - 1) \\) adalah ...",
              options: ["2", "0", "\\( x + 1 \\)", "\\( 2x \\)"],
              correctIndex: 1,
              explanation:
                "\\( x^{4} - 3x^{2} + 2 = (x^{2}-1)(x^{2}-2) \\), sehingga pembagiannya habis dan sisanya 0.",
            },
          ],
          latihanSoal: [
            {
              id: "mtl-polinomial-pembagian-akar-l1",
              level: "hots",
              question:
                "Polinomial \\( P(x) = 2x^{3} - 5x^{2} - 4x + 3 \\) memiliki satu akar \\( x = 3 \\). (a) Tentukan hasil bagi pembagian \\( P(x) \\) oleh \\( (x - 3) \\) menggunakan skema Horner. (b) Faktorkan \\( P(x) \\) sepenuhnya. (c) Tentukan semua akarnya. (d) Verifikasi jumlah dan hasil kali akar dengan rumus Vieta.",
              langkah: [
                "Tulis koefisien: 2, -5, -4, 3.",
                "Terapkan Horner dengan akar 3: bawa 2 turun, kalikan 3 memberi 6, jumlahkan dengan -5 memberi 1.",
                "Lanjutkan: kalikan 1 dengan 3 memberi 3, jumlahkan dengan -4 memberi -1.",
                "Lanjutkan: kalikan -1 dengan 3 memberi -3, jumlahkan dengan 3 memberi 0 (sisa nol, sesuai syarat).",
                "Hasil bagi: \\( 2x^{2} + x - 1 \\).",
                "Faktorkan hasil bagi: \\( 2x^{2} + x - 1 = (2x - 1)(x + 1) \\).",
                "Faktor lengkap: \\( P(x) = (x - 3)(2x - 1)(x + 1) \\).",
                "Akarnya: \\( x = 3 \\), \\( x = \\tfrac{1}{2} \\), dan \\( x = -1 \\).",
                "Verifikasi jumlah akar: \\( 3 + \\tfrac{1}{2} - 1 = \\tfrac{5}{2} = -\\dfrac{b}{a} = \\dfrac{5}{2} \\). Cocok.",
                "Verifikasi hasil kali akar: \\( 3 \\cdot \\tfrac{1}{2} \\cdot (-1) = -\\tfrac{3}{2} = -\\dfrac{d}{a} = -\\dfrac{3}{2} \\). Cocok.",
              ],
              jawaban:
                "(a) Hasil bagi \\( 2x^{2} + x - 1 \\) (b) \\( P(x) = (x - 3)(2x - 1)(x + 1) \\) (c) \\( x = 3 \\), \\( x = \\tfrac{1}{2} \\), \\( x = -1 \\) (d) Jumlah akar \\( \\tfrac{5}{2} \\) dan hasil kali akar \\( -\\tfrac{3}{2} \\), keduanya cocok dengan rumus Vieta.",
            },
            {
              id: "mtl-polinomial-pembagian-akar-l2",
              level: "sulit",
              question:
                "Diketahui akar-akar persamaan \\( x^{3} - 4x^{2} + x + 6 = 0 \\) adalah \\( p, q, r \\). (a) Tentukan \\( p + q + r \\), \\( pq + pr + qr \\), dan \\( pqr \\) tanpa mencari akarnya. (b) Hitung \\( p^{2} + q^{2} + r^{2} \\). (c) Hitung \\( \\dfrac{1}{p} + \\dfrac{1}{q} + \\dfrac{1}{r} \\). (d) Tentukan akar-akarnya secara eksplisit dan periksa jawaban (b) dan (c).",
              langkah: [
                "Terapkan Vieta: \\( a = 1 \\), \\( b = -4 \\), \\( c = 1 \\), \\( d = 6 \\).",
                "Jumlah akar: \\( p + q + r = -\\dfrac{-4}{1} = 4 \\).",
                "Jumlah hasil kali berpasangan: \\( pq + pr + qr = \\dfrac{c}{a} = 1 \\).",
                "Hasil kali akar: \\( pqr = -\\dfrac{d}{a} = -6 \\).",
                "Hitung \\( p^{2} + q^{2} + r^{2} = (p+q+r)^{2} - 2(pq+pr+qr) = 16 - 2 = 14 \\).",
                "Hitung \\( \\dfrac{1}{p} + \\dfrac{1}{q} + \\dfrac{1}{r} = \\dfrac{pq + pr + qr}{pqr} = \\dfrac{1}{-6} = -\\dfrac{1}{6} \\).",
                "Cari akar eksplisit: uji \\( x = -1 \\) memberi \\( -1 - 4 - 1 + 6 = 0 \\), jadi \\( x = -1 \\) akar.",
                "Bagi dengan \\( (x + 1) \\): hasil bagi \\( x^{2} - 5x + 6 = (x - 2)(x - 3) \\).",
                "Akarnya: \\( p = -1 \\), \\( q = 2 \\), \\( r = 3 \\).",
                "Periksa (b): \\( 1 + 4 + 9 = 14 \\). Cocok. Periksa (c): \\( -1 + \\tfrac{1}{2} + \\tfrac{1}{3} = -\\dfrac{1}{6} \\). Cocok.",
              ],
              jawaban:
                "(a) \\( p+q+r = 4 \\), \\( pq+pr+qr = 1 \\), \\( pqr = -6 \\) (b) \\( p^{2}+q^{2}+r^{2} = 14 \\) (c) \\( \\dfrac{1}{p}+\\dfrac{1}{q}+\\dfrac{1}{r} = -\\dfrac{1}{6} \\) (d) Akarnya \\( -1, 2, 3 \\); kedua hasil sebelumnya terverifikasi.",
            },
          ],
          tkaSoal: [
            {
              id: "mtl-polinomial-pembagian-akar-tka1",
              bentuk: "pg",
              level: "L2",
              question:
                "Hasil bagi pembagian \\( x^{3} - 6x^{2} + 11x - 6 \\) oleh \\( (x - 2) \\) adalah ...",
              options: [
                { id: "A", text: "\\( x^{2} + 4x + 3 \\)" },
                { id: "B", text: "\\( x^{2} - 4x + 3 \\)" },
                { id: "C", text: "\\( x^{2} - 4x - 3 \\)" },
                { id: "D", text: "\\( x^{2} - 3x + 2 \\)" },
                { id: "E", text: "\\( x^{2} + 3x - 2 \\)" },
              ],
              correctIds: ["B"],
              explanation:
                "Dengan skema Horner pada akar 2, koefisien 1, -6, 11, -6 menghasilkan 1, -4, 3 dan sisa 0, sehingga hasil baginya \\( x^{2} - 4x + 3 \\).",
            },
            {
              id: "mtl-polinomial-pembagian-akar-tka2",
              bentuk: "pg",
              level: "L2",
              question:
                "Akar-akar persamaan \\( x^{3} + 3x^{2} - 10x + 5 = 0 \\) adalah \\( x_{1}, x_{2}, x_{3} \\). Nilai \\( x_{1}x_{2}x_{3} \\) adalah ...",
              options: [
                { id: "A", text: "-15" },
                { id: "B", text: "-5" },
                { id: "C", text: "5" },
                { id: "D", text: "10" },
                { id: "E", text: "15" },
              ],
              correctIds: ["B"],
              explanation:
                "Rumus Vieta derajat tiga: \\( x_{1}x_{2}x_{3} = -\\dfrac{d}{a} = -\\dfrac{5}{1} = -5 \\).",
            },
            {
              id: "mtl-polinomial-pembagian-akar-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              question:
                "Diketahui \\( P(x) = x^{3} - x^{2} - 4x + 4 \\). Pilih semua pernyataan yang BENAR. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "Salah satu akar \\( P(x) \\) adalah \\( x = 1 \\)" },
                { id: "B", text: "\\( (x + 2) \\) merupakan faktor dari \\( P(x) \\)" },
                { id: "C", text: "Hasil kali ketiga akarnya adalah 4" },
                { id: "D", text: "Jumlah ketiga akarnya adalah -1" },
                { id: "E", text: "\\( P(x) \\) habis dibagi \\( (x - 2) \\) tanpa sisa" },
              ],
              correctIds: ["A", "B", "E"],
              explanation:
                "\\( P(x) = (x - 1)(x - 2)(x + 2) \\) sehingga akarnya \\( 1, 2, -2 \\). Menurut Vieta, jumlahnya \\( -b/a = 1 \\) (D salah) dan hasil kalinya \\( -d/a = -4 \\) (C salah).",
            },
            {
              id: "mtl-polinomial-pembagian-akar-tka4",
              bentuk: "isian",
              level: "L1",
              question:
                "Jumlah akar-akar persamaan \\( 2x^{3} - 8x^{2} + 10x - 4 = 0 \\) adalah ...",
              correctIds: ["4"],
              explanation:
                "Vieta: jumlah akar \\( = -\\dfrac{b}{a} = -\\dfrac{-8}{2} = 4 \\).",
            },
          ],
        },
      ],
    },
    {
      id: "mtl-matriks-vektor",
      title: "Matriks & Vektor",
      order: 2,
      subtopics: [
        {
          id: "mtl-matriks-vektor-operasi-invers",
          title: "Operasi Matriks & Invers",
          estimatedMinutes: 70,
          materi: {
            ringkasan:
              "Matriks adalah susunan bilangan dalam baris dan kolom. Operasi penjumlahan dan perkalian matriks mengikuti aturan tertentu, dan invers matriks persegi hanya ada jika determinannya tidak nol. Invers dipakai untuk menyelesaikan sistem persamaan linear.",
            rumus: [
              "Penjumlahan: hanya untuk matriks berordo sama, dilakukan per elemen",
              "Perkalian: \\( (AB)_{ij} = \\sum_{k} a_{ik}b_{kj} \\); ordo hasil \\( (m \\times n)(n \\times p) = m \\times p \\)",
              "\\( (AB)^{T} = B^{T}A^{T} \\) dan \\( (A^{-1})^{-1} = A \\)",
              "Invers 2x2: \\( A^{-1} = \\dfrac{1}{ad - bc}\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix} \\)",
              "Sifat: \\( A A^{-1} = A^{-1} A = I \\)",
              "Syarat invers ada: \\( \\det A \\ne 0 \\)",
            ],
            contoh: [
              {
                soal:
                  "Diketahui \\( A = \\begin{pmatrix} 2 & 1 \\\\ 5 & 3 \\end{pmatrix} \\). Tentukan \\( A^{-1} \\).",
                pembahasan:
                  "\\( \\det A = 6 - 5 = 1 \\), sehingga \\( A^{-1} = \\begin{pmatrix} 3 & -1 \\\\ -5 & 2 \\end{pmatrix} \\).",
              },
              {
                soal:
                  "Selesaikan \\( 2x + y = 7 \\) dan \\( 5x + 3y = 18 \\) menggunakan invers matriks.",
                pembahasan:
                  "Bentuk matriks \\( \\begin{pmatrix} 2 & 1 \\\\ 5 & 3 \\end{pmatrix}\\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} 7 \\\\ 18 \\end{pmatrix} \\). Karena \\( A^{-1} = \\begin{pmatrix} 3 & -1 \\\\ -5 & 2 \\end{pmatrix} \\), diperoleh \\( x = 3 \\) dan \\( y = 1 \\).",
              },
            ],
          },
          flashcards: [
            {
              id: "mtl-matriks-vektor-operasi-invers-fc1",
              front: "Syarat dua matriks dapat dikalikan?",
              back: "Jumlah kolom matriks pertama harus sama dengan jumlah baris matriks kedua.",
            },
            {
              id: "mtl-matriks-vektor-operasi-invers-fc2",
              front: "Kapan matriks tidak memiliki invers?",
              back: "Saat determinannya nol, karena pembagian dengan nol tidak terdefinisi.",
            },
            {
              id: "mtl-matriks-vektor-operasi-invers-fc3",
              front: "Apakah perkalian matriks bersifat komutatif?",
              back: "Tidak. Umumnya \\( AB \\ne BA \\), sehingga urutan perkalian harus diperhatikan.",
            },
            {
              id: "mtl-matriks-vektor-operasi-invers-fc4",
              front: "Apa fungsi matriks identitas \\( I \\)?",
              back: "Berperan seperti angka 1 pada perkalian, karena \\( AI = IA = A \\) untuk matriks persegi yang sesuai.",
            },
          ],
          quiz: [
            {
              id: "mtl-matriks-vektor-operasi-invers-q1",
              question:
                "Determinan matriks \\( \\begin{pmatrix} 4 & 3 \\\\ 6 & 5 \\end{pmatrix} \\) adalah ...",
              options: ["2", "4", "20", "38"],
              correctIndex: 0,
              explanation: "\\( \\det = 4 \\cdot 5 - 3 \\cdot 6 = 20 - 18 = 2 \\).",
            },
            {
              id: "mtl-matriks-vektor-operasi-invers-q2",
              question:
                "Invers dari \\( \\begin{pmatrix} 1 & 2 \\\\ 3 & 7 \\end{pmatrix} \\) adalah ...",
              options: [
                "\\( \\begin{pmatrix} 7 & -2 \\\\ -3 & 1 \\end{pmatrix} \\)",
                "\\( \\begin{pmatrix} 7 & 2 \\\\ 3 & 1 \\end{pmatrix} \\)",
                "\\( \\begin{pmatrix} -7 & 2 \\\\ 3 & -1 \\end{pmatrix} \\)",
                "\\( \\begin{pmatrix} 1 & -2 \\\\ -3 & 7 \\end{pmatrix} \\)",
              ],
              correctIndex: 0,
              explanation:
                "\\( \\det = 7 - 6 = 1 \\), sehingga inversnya \\( \\begin{pmatrix} 7 & -2 \\\\ -3 & 1 \\end{pmatrix} \\).",
            },
            {
              id: "mtl-matriks-vektor-operasi-invers-q3",
              question:
                "Jika \\( A = \\begin{pmatrix} 2 & 0 \\\\ 1 & 3 \\end{pmatrix} \\) dan \\( B = \\begin{pmatrix} 1 & 1 \\\\ 0 & 2 \\end{pmatrix} \\), maka \\( AB \\) adalah ...",
              options: [
                "\\( \\begin{pmatrix} 2 & 2 \\\\ 1 & 7 \\end{pmatrix} \\)",
                "\\( \\begin{pmatrix} 2 & 2 \\\\ 1 & 6 \\end{pmatrix} \\)",
                "\\( \\begin{pmatrix} 2 & 0 \\\\ 1 & 6 \\end{pmatrix} \\)",
                "\\( \\begin{pmatrix} 1 & 1 \\\\ 3 & 7 \\end{pmatrix} \\)",
              ],
              correctIndex: 0,
              explanation:
                "Hitung per elemen: baris 1 memberi 2 dan 2; baris 2 memberi 1 dan 7.",
            },
            {
              id: "mtl-matriks-vektor-operasi-invers-q4",
              question: "Matriks \\( \\begin{pmatrix} 3 & 6 \\\\ 1 & 2 \\end{pmatrix} \\) ...",
              options: [
                "Memiliki invers karena determinannya 0",
                "Tidak memiliki invers karena determinannya 0",
                "Memiliki invers karena determinannya 12",
                "Tidak memiliki invers karena bukan matriks persegi",
              ],
              correctIndex: 1,
              explanation:
                "\\( \\det = 3 \\cdot 2 - 6 \\cdot 1 = 0 \\), sehingga matriks singular dan tidak memiliki invers.",
            },
          ],
          latihanSoal: [
            {
              id: "mtl-matriks-vektor-operasi-invers-l1",
              level: "hots",
              question:
                "Sebuah perusahaan punya dua cabang. Cabang A menjual 3 unit produk X dan 2 unit produk Y dengan pendapatan Rp310.000. Cabang B menjual 1 unit produk X dan 4 unit produk Y dengan pendapatan Rp370.000. (a) Susun sistem persamaan dalam bentuk matriks. (b) Tentukan determinan matriks koefisien. (c) Selesaikan dengan invers matriks untuk menentukan harga produk X dan Y. (d) Periksa jawabannya.",
              langkah: [
                "Susun sistem: \\( 3x + 2y = 310 \\) dan \\( x + 4y = 370 \\) (dalam ribu rupiah).",
                "Bentuk matriks: \\( \\begin{pmatrix} 3 & 2 \\\\ 1 & 4 \\end{pmatrix}\\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} 310 \\\\ 370 \\end{pmatrix} \\).",
                "Hitung determinan: \\( \\det = 3(4) - 2(1) = 12 - 2 = 10 \\).",
                "Tentukan invers: \\( A^{-1} = \\dfrac{1}{10}\\begin{pmatrix} 4 & -2 \\\\ -1 & 3 \\end{pmatrix} \\).",
                "Hitung \\( x \\): \\( \\dfrac{1}{10}(4 \\cdot 310 - 2 \\cdot 370) = \\dfrac{1}{10}(1240 - 740) = 50 \\).",
                "Hitung \\( y \\): \\( \\dfrac{1}{10}(-1 \\cdot 310 + 3 \\cdot 370) = \\dfrac{1}{10}(-310 + 1110) = 80 \\).",
                "Jadi harga produk X = Rp50.000 dan produk Y = Rp80.000.",
                "Periksa cabang A: \\( 3(50) + 2(80) = 150 + 160 = 310 \\). Cocok. Periksa cabang B: \\( 50 + 4(80) = 50 + 320 = 370 \\). Cocok.",
              ],
              jawaban:
                "(a) \\( \\begin{pmatrix} 3 & 2 \\\\ 1 & 4 \\end{pmatrix}\\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} 310 \\\\ 370 \\end{pmatrix} \\) (b) \\( \\det = 10 \\) (c) \\( x = 50 \\), \\( y = 80 \\) (d) Terverifikasi pada kedua persamaan.",
            },
            {
              id: "mtl-matriks-vektor-operasi-invers-l2",
              level: "sulit",
              question:
                "Diberikan \\( A = \\begin{pmatrix} 2 & 3 \\\\ 1 & 2 \\end{pmatrix} \\). (a) Tentukan \\( A^{-1} \\) dan periksa bahwa \\( AA^{-1} = I \\). (b) Hitung \\( A^{2} \\) dan \\( A^{-2} = (A^{-1})^{2} \\). (c) Tentukan \\( A^{3} \\). (d) Jelaskan pola yang muncul dan bagaimana pola itu membantu menghitung \\( A^{n} \\).",
              langkah: [
                "Hitung determinan: \\( \\det A = 4 - 3 = 1 \\).",
                "Tentukan invers: \\( A^{-1} = \\begin{pmatrix} 2 & -3 \\\\ -1 & 2 \\end{pmatrix} \\), karena untuk \\( \\det = 1 \\) rumus mempertahankan nilainya.",
                "Periksa \\( AA^{-1} \\): \\( \\begin{pmatrix} 2(2) + 3(-1) & 2(-3) + 3(2) \\\\ 1(2) + 2(-1) & 1(-3) + 2(2) \\end{pmatrix} = \\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix} \\). Benar.",
                "Hitung \\( A^{2} \\): \\( \\begin{pmatrix} 2 & 3 \\\\ 1 & 2 \\end{pmatrix}^{2} = \\begin{pmatrix} 7 & 12 \\\\ 4 & 7 \\end{pmatrix} \\).",
                "Perhatikan pola: \\( A^{2} = \\begin{pmatrix} 7 & 12 \\\\ 4 & 7 \\end{pmatrix} \\) mengikuti tipikal \\( \\begin{pmatrix} a & b \\\\ c & a \\end{pmatrix} \\) dengan \\( a \\) bertambah membesar.",
                "Hitung \\( A^{-2} = (A^{-1})^{2} = \\begin{pmatrix} 7 & -12 \\\\ -4 & 7 \\end{pmatrix} \\).",
                "Hitung \\( A^{3} = A^{2} \\cdot A = \\begin{pmatrix} 7(2)+12(1) & 7(3)+12(2) \\\\ 4(2)+7(1) & 4(3)+7(2) \\end{pmatrix} = \\begin{pmatrix} 26 & 45 \\\\ 15 & 26 \\end{pmatrix} \\).",
                "Jelaskan pola: bentuk \\( A^{n} = \\begin{pmatrix} a_{n} & b_{n} \\\\ c_{n} & a_{n} \\end{pmatrix} \\) selalu simetris pada diagonal utama, karena matriks asalnya simetris.",
                "Simpulkan manfaat: pola ini memungkinkan penghitungan \\( A^{n} \\) hanya dengan melacak dua barisan bilangan, tanpa mengalikan matriks berulang kali.",
              ],
              jawaban:
                "(a) \\( A^{-1} = \\begin{pmatrix} 2 & -3 \\\\ -1 & 2 \\end{pmatrix} \\) dan \\( AA^{-1} = I \\) terbukti (b) \\( A^{2} = \\begin{pmatrix} 7 & 12 \\\\ 4 & 7 \\end{pmatrix} \\), \\( A^{-2} = \\begin{pmatrix} 7 & -12 \\\\ -4 & 7 \\end{pmatrix} \\) (c) \\( A^{3} = \\begin{pmatrix} 26 & 45 \\\\ 15 & 26 \\end{pmatrix} \\) (d) Semua pangkat berbentuk \\( \\begin{pmatrix} a_{n} & b_{n} \\\\ c_{n} & a_{n} \\end{pmatrix} \\) dengan elemen diagonal sama, sehingga penghitungan dapat dilacak melalui barisan bilangan tanpa perkalian matriks berulang.",
            },
          ],
          tkaSoal: [
            {
              id: "mtl-matriks-vektor-operasi-invers-tka1",
              bentuk: "pg",
              level: "L1",
              question:
                "Hasil kali matriks berordo \\( 2 \\times 3 \\) dengan matriks berordo \\( 3 \\times 4 \\) menghasilkan matriks berordo ...",
              options: [
                { id: "A", text: "\\( 2 \\times 3 \\)" },
                { id: "B", text: "\\( 3 \\times 3 \\)" },
                { id: "C", text: "\\( 2 \\times 4 \\)" },
                { id: "D", text: "\\( 3 \\times 4 \\)" },
                { id: "E", text: "\\( 4 \\times 2 \\)" },
              ],
              correctIds: ["C"],
              explanation:
                "Ordo hasil kali \\( (m \\times n)(n \\times p) = m \\times p \\), sehingga \\( (2 \\times 3)(3 \\times 4) = 2 \\times 4 \\).",
            },
            {
              id: "mtl-matriks-vektor-operasi-invers-tka2",
              bentuk: "pg",
              level: "L2",
              question:
                "Invers dari matriks \\( A = \\begin{pmatrix} 3 & 2 \\\\ 7 & 5 \\end{pmatrix} \\) adalah ...",
              options: [
                { id: "A", text: "\\( \\begin{pmatrix} -5 & 2 \\\\ 7 & -3 \\end{pmatrix} \\)" },
                { id: "B", text: "\\( \\begin{pmatrix} 3 & -2 \\\\ -7 & 5 \\end{pmatrix} \\)" },
                { id: "C", text: "\\( \\begin{pmatrix} 5 & -2 \\\\ -7 & 3 \\end{pmatrix} \\)" },
                { id: "D", text: "\\( \\begin{pmatrix} 5 & 2 \\\\ 7 & 3 \\end{pmatrix} \\)" },
                { id: "E", text: "\\( \\begin{pmatrix} 5 & -7 \\\\ -2 & 3 \\end{pmatrix} \\)" },
              ],
              correctIds: ["C"],
              explanation:
                "\\( \\det A = 3 \\cdot 5 - 2 \\cdot 7 = 1 \\), sehingga \\( A^{-1} = \\dfrac{1}{1}\\begin{pmatrix} 5 & -2 \\\\ -7 & 3 \\end{pmatrix} \\).",
            },
            {
              id: "mtl-matriks-vektor-operasi-invers-tka3",
              bentuk: "pgk-mcma",
              level: "L2",
              question:
                "Pilih semua pernyataan yang BENAR tentang operasi dan invers matriks. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "Setiap matriks persegi selalu memiliki invers" },
                { id: "B", text: "\\( A A^{-1} = A^{-1} A = I \\)" },
                { id: "C", text: "Pada umumnya \\( AB \\ne BA \\), sehingga urutan perkalian harus diperhatikan" },
                { id: "D", text: "\\( (AB)^{T} = B^{T} A^{T} \\)" },
                { id: "E", text: "Penjumlahan dua matriks dapat dilakukan meskipun ordonya berbeda" },
              ],
              correctIds: ["B", "C", "D"],
              explanation:
                "A salah karena invers ada hanya jika \\( \\det A \\ne 0 \\). E salah karena penjumlahan matriks mensyaratkan ordo yang sama. B, C, dan D merupakan sifat-sifat baku operasi matriks.",
            },
            {
              id: "mtl-matriks-vektor-operasi-invers-tka4",
              bentuk: "isian",
              level: "L3",
              question:
                "Nilai \\( k \\) agar matriks \\( \\begin{pmatrix} k & 2 \\\\ 6 & 4 \\end{pmatrix} \\) tidak memiliki invers adalah ...",
              correctIds: ["3"],
              explanation:
                "Syarat tidak memiliki invers: \\( \\det = 0 \\). \\( 4k - 12 = 0 \\Rightarrow k = 3 \\).",
            },
          ],
        },
        {
          id: "mtl-matriks-vektor-determinan",
          title: "Determinan Matriks 2x2 & 3x3",
          estimatedMinutes: 60,
          materi: {
            ringkasan:
              "Determinan adalah bilangan skalar yang dihitung dari elemen matriks persegi. Nilainya menentukan apakah matriks memiliki invers, dan dipakai untuk menyelesaikan sistem persamaan linear dengan aturan Cramer serta menghitung luas bangun dari titik koordinat.",
            rumus: [
              "Determinan 2x2: \\( \\det \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc \\)",
              "Determinan 3x3 (Sarrus): jumlah hasil kali diagonal turun dikurangi hasil kali diagonal naik",
              "Ekspansi kofaktor baris pertama: \\( \\det A = a_{11}C_{11} + a_{12}C_{12} + a_{13}C_{13} \\)",
              "Aturan Cramer: \\( x = \\dfrac{D_{x}}{D}, \\ y = \\dfrac{D_{y}}{D}, \\ z = \\dfrac{D_{z}}{D} \\) dengan \\( D \\ne 0 \\)",
              "Sifat: \\( \\det(AB) = \\det A \\cdot \\det B \\) dan \\( \\det A^{T} = \\det A \\)",
              "Jika \\( \\det A = 0 \\), matriks disebut singular dan tidak memiliki invers",
            ],
            contoh: [
              {
                soal:
                  "Tentukan determinan \\( A = \\begin{pmatrix} 2 & 3 & 1 \\\\ 1 & 4 & 2 \\\\ 3 & 1 & 5 \\end{pmatrix} \\).",
                pembahasan:
                  "Gunakan ekspansi baris pertama: \\( 2(4 \\cdot 5 - 2 \\cdot 1) - 3(1 \\cdot 5 - 2 \\cdot 3) + 1(1 \\cdot 1 - 4 \\cdot 3) = 2(18) - 3(-1) + 1(-11) = 36 + 3 - 11 = 28 \\).",
              },
              {
                soal:
                  "Selesaikan dengan aturan Cramer: \\( 2x + y = 8 \\) dan \\( x + 3y = 9 \\).",
                pembahasan:
                  "\\( D = 2(3) - 1(1) = 5 \\); \\( D_{x} = 8(3) - 1(9) = 15 \\); \\( D_{y} = 2(9) - 8(1) = 10 \\). Jadi \\( x = 3 \\) dan \\( y = 2 \\).",
              },
            ],
          },
          flashcards: [
            {
              id: "mtl-matriks-vektor-determinan-fc1",
              front: "Rumus determinan matriks 2x2?",
              back: "\\( ad - bc \\) untuk matriks \\( \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} \\), yaitu hasil kali diagonal utama dikurangi hasil kali diagonal sekunder.",
            },
            {
              id: "mtl-matriks-vektor-determinan-fc2",
              front: "Apa akibatnya jika determinan matriks nol?",
              back: "Matriks bersifat singular, tidak memiliki invers, dan sistem persamaannya bisa tidak memiliki solusi atau memiliki tak hingga solusi.",
            },
            {
              id: "mtl-matriks-vektor-determinan-fc3",
              front: "Bagaimana determinan dipakai untuk menghitung luas segitiga?",
              back: "\\( L = \\tfrac{1}{2}|x_{1}(y_{2}-y_{3}) + x_{2}(y_{3}-y_{1}) + x_{3}(y_{1}-y_{2})| \\), yang ekuivalen dengan setengah nilai absolut determinan matriks koordinat.",
            },
            {
              id: "mtl-matriks-vektor-determinan-fc4",
              front: "Tuliskan sifat determinan terhadap perkalian.",
              back: "\\( \\det(AB) = \\det A \\cdot \\det B \\), sehingga determinan hasil kali sama dengan hasil kali determinan.",
            },
          ],
          quiz: [
            {
              id: "mtl-matriks-vektor-determinan-q1",
              question:
                "Determinan \\( \\begin{pmatrix} 5 & 2 \\\\ 3 & 4 \\end{pmatrix} \\) adalah ...",
              options: ["14", "20", "26", "-14"],
              correctIndex: 0,
              explanation: "\\( \\det = 5(4) - 2(3) = 20 - 6 = 14 \\).",
            },
            {
              id: "mtl-matriks-vektor-determinan-q2",
              question:
                "Determinan \\( \\begin{pmatrix} 1 & 2 & 3 \\\\ 0 & 1 & 4 \\\\ 5 & 6 & 0 \\end{pmatrix} \\) adalah ...",
              options: ["1", "2", "3", "4"],
              correctIndex: 0,
              explanation:
                "Ekspansi baris pertama: \\( 1(0 - 24) - 2(0 - 20) + 3(0 - 5) = -24 + 40 - 15 = 1 \\).",
            },
            {
              id: "mtl-matriks-vektor-determinan-q3",
              question:
                "Jika \\( \\det A = 4 \\) dan \\( \\det B = 3 \\), maka \\( \\det(AB) \\) adalah ...",
              options: ["7", "12", "1", "64"],
              correctIndex: 1,
              explanation: "\\( \\det(AB) = \\det A \\cdot \\det B = 4 \\cdot 3 = 12 \\).",
            },
            {
              id: "mtl-matriks-vektor-determinan-q4",
              question:
                "Luas segitiga dengan titik sudut \\( A(0,0) \\), \\( B(4,0) \\), dan \\( C(0,6) \\) adalah ...",
              options: ["10", "12", "24", "6"],
              correctIndex: 1,
              explanation:
                "\\( L = \\tfrac{1}{2}|4 \\cdot 6 - 0 \\cdot 0| = \\tfrac{1}{2}(24) = 12 \\) satuan luas.",
            },
          ],
          latihanSoal: [
            {
              id: "mtl-matriks-vektor-determinan-l1",
              level: "hots",
              question:
                "Diberikan titik-titik \\( A(1, 2) \\), \\( B(5, 1) \\), dan \\( C(3, 6) \\) pada bidang koordinat. (a) Susun determinan yang menyatakan dua kali luas segitiga ABC. (b) Hitung luas segitiga tersebut. (c) Tentukan luas segitiga jika titik C dipindahkan ke \\( (3, 2) \\) dan jelaskan mengapa hasilnya berubah drastis. (d) Jelaskan hubungan antara nilai determinan nol dengan kolinearitas tiga titik.",
              langkah: [
                "Susun determinan: \\( 2L = \\left| \\det \\begin{pmatrix} 1 & 2 & 1 \\\\ 5 & 1 & 1 \\\\ 3 & 6 & 1 \\end{pmatrix} \\right| \\).",
                "Hitung dengan ekspansi baris pertama: \\( 1(1 \\cdot 1 - 1 \\cdot 6) - 2(5 \\cdot 1 - 1 \\cdot 3) + 1(5 \\cdot 6 - 1 \\cdot 3) \\).",
                "Hitung tiap minor: \\( 1(-5) - 2(2) + 1(27) = -5 - 4 + 27 = 18 \\).",
                "Nilai absolutnya 18, sehingga luas \\( L = \\tfrac{1}{2}(18) = 9 \\) satuan luas.",
                "Untuk titik \\( C(3,2) \\): hitung determinan \\( 1(1 \\cdot 1 - 1 \\cdot 2) - 2(5 \\cdot 1 - 1 \\cdot 3) + 1(5 \\cdot 2 - 1 \\cdot 3) = -1 - 4 + 7 = 2 \\).",
                "Luas baru \\( = \\tfrac{1}{2}(2) = 1 \\) satuan luas, jauh lebih kecil karena titik C bergeser mendekati garis AB.",
                "Jelaskan kolinearitas: jika determinan bernilai nol, maka luasnya nol, yang berarti ketiga titik berada pada satu garis lurus.",
                "Simpulkan: determinan sekaligus mengukur 'seberapa tidak kolinear' tiga titik, sehingga nilainya kecil ketika titik-titik hampir segaris.",
              ],
              jawaban:
                "(a) \\( 2L = \\left| \\det \\begin{pmatrix} 1 & 2 & 1 \\\\ 5 & 1 & 1 \\\\ 3 & 6 & 1 \\end{pmatrix} \\right| \\) (b) \\( L = 9 \\) satuan luas (c) Dengan \\( C(3,2) \\), \\( L = 1 \\) satuan luas karena titik C bergeser mendekati garis AB (d) Determinan nol berarti luas nol, yaitu ketiga titik kolinear (segaris).",
            },
            {
              id: "mtl-matriks-vektor-determinan-l2",
              level: "sulit",
              question:
                "Diberikan matriks \\( A = \\begin{pmatrix} 2 & 1 & 0 \\\\ 1 & k & 2 \\\\ 0 & 3 & 1 \\end{pmatrix} \\). (a) Tentukan determinan A dalam bentuk \\( k \\). (b) Tentukan nilai \\( k \\) agar A singular. (c) Tentukan nilai \\( k \\) agar A memiliki invers. (d) Jika \\( k = 2 \\), selesaikan sistem \\( 2x + y = 4 \\), \\( x + 2y + 2z = 7 \\), \\( 3y + z = 5 \\) dengan aturan Cramer.",
              langkah: [
                "Hitung determinan dengan ekspansi baris pertama: \\( 2(k \\cdot 1 - 2 \\cdot 3) - 1(1 \\cdot 1 - 2 \\cdot 0) + 0 \\).",
                "Sederhanakan: \\( 2(k - 6) - 1(1) = 2k - 12 - 1 = 2k - 13 \\).",
                "Syarat singular: \\( 2k - 13 = 0 \\Rightarrow k = \\dfrac{13}{2} \\).",
                "Syarat memiliki invers: \\( 2k - 13 \\ne 0 \\Rightarrow k \\ne \\dfrac{13}{2} \\).",
                "Untuk \\( k = 2 \\): \\( D = 2(2) - 13 = -9 \\).",
                "Hitung \\( D_{x} \\) dengan mengganti kolom pertama dengan konstanta: \\( \\det \\begin{pmatrix} 4 & 1 & 0 \\\\ 7 & 2 & 2 \\\\ 5 & 3 & 1 \\end{pmatrix} = 4(2 - 6) - 1(7 - 10) + 0 = -16 + 3 = -13 \\).",
                "Hitung \\( D_{y} = \\det \\begin{pmatrix} 2 & 4 & 0 \\\\ 1 & 7 & 2 \\\\ 0 & 5 & 1 \\end{pmatrix} = 2(7 - 10) - 4(1 - 0) + 0 = -6 - 4 = -10 \\).",
                "Hitung \\( D_{z} = \\det \\begin{pmatrix} 2 & 1 & 4 \\\\ 1 & 2 & 7 \\\\ 0 & 3 & 5 \\end{pmatrix} = 2(10 - 21) - 1(5 - 0) + 4(3 - 0) = -22 - 5 + 12 = -15 \\).",
                "Terapkan Cramer: \\( x = \\dfrac{-13}{-9} = \\dfrac{13}{9} \\), \\( y = \\dfrac{-10}{-9} = \\dfrac{10}{9} \\), \\( z = \\dfrac{-15}{-9} = \\dfrac{5}{3} \\).",
              ],
              jawaban:
                "(a) \\( \\det A = 2k - 13 \\) (b) Singular saat \\( k = \\dfrac{13}{2} \\) (c) Memiliki invers untuk \\( k \\ne \\dfrac{13}{2} \\) (d) \\( x = \\dfrac{13}{9} \\), \\( y = \\dfrac{10}{9} \\), \\( z = \\dfrac{5}{3} \\).",
            },
          ],
          tkaSoal: [
            {
              id: "mtl-matriks-vektor-determinan-tka1",
              bentuk: "pg",
              level: "L2",
              question:
                "Determinan matriks \\( \\begin{pmatrix} 2 & 1 & 0 \\\\ 1 & 3 & 1 \\\\ 0 & 1 & 2 \\end{pmatrix} \\) adalah ...",
              options: [
                { id: "A", text: "6" },
                { id: "B", text: "7" },
                { id: "C", text: "8" },
                { id: "D", text: "10" },
                { id: "E", text: "12" },
              ],
              correctIds: ["C"],
              explanation:
                "Ekspansi baris pertama: \\( 2(3 \\cdot 2 - 1 \\cdot 1) - 1(1 \\cdot 2 - 1 \\cdot 0) + 0 = 2(5) - 2 = 8 \\).",
            },
            {
              id: "mtl-matriks-vektor-determinan-tka2",
              bentuk: "pg",
              level: "L2",
              question:
                "Dengan aturan Cramer, nilai \\( x \\) dari sistem \\( 2x + y = 7 \\) dan \\( x - y = 2 \\) adalah ...",
              options: [
                { id: "A", text: "1" },
                { id: "B", text: "2" },
                { id: "C", text: "3" },
                { id: "D", text: "4" },
                { id: "E", text: "5" },
              ],
              correctIds: ["C"],
              explanation:
                "\\( D = 2(-1) - 1(1) = -3 \\) dan \\( D_{x} = 7(-1) - 1(2) = -9 \\), sehingga \\( x = \\dfrac{D_{x}}{D} = \\dfrac{-9}{-3} = 3 \\).",
            },
            {
              id: "mtl-matriks-vektor-determinan-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              question:
                "Pilih semua pernyataan yang BENAR tentang sifat determinan matriks persegi. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "\\( \\det(AB) = \\det A \\cdot \\det B \\)" },
                { id: "B", text: "\\( \\det A^{T} = \\det A \\)" },
                { id: "C", text: "Matriks singular memiliki determinan sama dengan nol" },
                { id: "D", text: "Untuk matriks \\( 2 \\times 2 \\), berlaku \\( \\det(2A) = 2 \\det A \\)" },
                { id: "E", text: "\\( \\det(A + B) = \\det A + \\det B \\)" },
              ],
              correctIds: ["A", "B", "C"],
              explanation:
                "D salah karena pada matriks \\( 2 \\times 2 \\) berlaku \\( \\det(2A) = 2^{2}\\det A = 4\\det A \\). E salah karena determinan tidak bersifat aditif terhadap penjumlahan matriks.",
            },
            {
              id: "mtl-matriks-vektor-determinan-tka4",
              bentuk: "isian",
              level: "L2",
              question:
                "Luas segitiga dengan titik sudut \\( (1, 1) \\), \\( (4, 1) \\), dan \\( (1, 5) \\) adalah ...",
              correctIds: ["6"],
              explanation:
                "Setengah nilai absolut determinan koordinat: \\( L = \\tfrac{1}{2}|1(1-5) + 4(5-1) + 1(1-1)| = \\tfrac{1}{2}|-4 + 16| = 6 \\).",
            },
          ],
        },
        {
          id: "mtl-matriks-vektor-operasi-proyeksi",
          title: "Operasi Vektor & Proyeksi Vektor",
          estimatedMinutes: 70,
          materi: {
            ringkasan:
              "Vektor adalah besaran yang memiliki besar dan arah, dinyatakan dalam komponen atau kombinasi vektor satuan. Operasi vektor meliputi penjumlahan, perkalian titik (dot product), perkalian silang (cross product), serta proyeksi satu vektor pada vektor lain.",
            rumus: [
              "Penjumlahan komponen: \\( \\vec{a} + \\vec{b} = (a_{1}+b_{1},\\ a_{2}+b_{2},\\ a_{3}+b_{3}) \\)",
              "Panjang vektor: \\( |\\vec{a}| = \\sqrt{a_{1}^{2} + a_{2}^{2} + a_{3}^{2}} \\)",
              "Perkalian titik: \\( \\vec{a} \\cdot \\vec{b} = a_{1}b_{1} + a_{2}b_{2} + a_{3}b_{3} = |\\vec{a}||\\vec{b}|\\cos\\theta \\)",
              "Sudut antara dua vektor: \\( \\cos\\theta = \\dfrac{\\vec{a} \\cdot \\vec{b}}{|\\vec{a}||\\vec{b}|} \\)",
              "Proyeksi skalar \\( \\vec{a} \\) pada \\( \\vec{b} \\): \\( c = \\dfrac{\\vec{a} \\cdot \\vec{b}}{|\\vec{b}|} \\)",
              "Proyeksi vektor \\( \\vec{a} \\) pada \\( \\vec{b} \\): \\( \\vec{p} = \\dfrac{\\vec{a} \\cdot \\vec{b}}{|\\vec{b}|^{2}}\\,\\vec{b} \\)",
              "Dua vektor tegak lurus jika \\( \\vec{a} \\cdot \\vec{b} = 0 \\)",
            ],
            contoh: [
              {
                soal:
                  "Diketahui \\( \\vec{a} = (2, -1, 3) \\) dan \\( \\vec{b} = (1, 4, -2) \\). Tentukan \\( \\vec{a} \\cdot \\vec{b} \\) dan panjang \\( \\vec{a} \\).",
                pembahasan:
                  "\\( \\vec{a} \\cdot \\vec{b} = 2(1) + (-1)(4) + 3(-2) = 2 - 4 - 6 = -8 \\). Panjang \\( |\\vec{a}| = \\sqrt{4 + 1 + 9} = \\sqrt{14} \\).",
              },
              {
                soal:
                  "Tentukan proyeksi vektor \\( \\vec{a} = (3, 4) \\) pada \\( \\vec{b} = (1, 0) \\).",
                pembahasan:
                  "\\( \\vec{a} \\cdot \\vec{b} = 3 \\) dan \\( |\\vec{b}|^{2} = 1 \\), sehingga \\( \\vec{p} = 3(1, 0) = (3, 0) \\).",
              },
            ],
          },
          flashcards: [
            {
              id: "mtl-matriks-vektor-operasi-proyeksi-fc1",
              front: "Apa arti hasil perkalian titik bernilai nol?",
              back: "Kedua vektor saling tegak lurus, karena kosinus sudutnya nol sehingga sudutnya 90 derajat.",
            },
            {
              id: "mtl-matriks-vektor-operasi-proyeksi-fc2",
              front: "Bedakan proyeksi skalar dan proyeksi vektor.",
              back: "Proyeksi skalar berupa bilangan (panjang bayangan), sedangkan proyeksi vektor berupa vektor yang searah dengan vektor acuan.",
            },
            {
              id: "mtl-matriks-vektor-operasi-proyeksi-fc3",
              front: "Rumus sudut antara dua vektor?",
              back: "\\( \\cos\\theta = \\dfrac{\\vec{a} \\cdot \\vec{b}}{|\\vec{a}|\\,|\\vec{b}|} \\), lalu tentukan \\( \\theta \\) dari nilai kosinus tersebut.",
            },
            {
              id: "mtl-matriks-vektor-operasi-proyeksi-fc4",
              front: "Mengapa proyeksi vektor harus searah vektor acuan?",
              back: "Karena proyeksi adalah 'bayangan' vektor pada arah vektor acuan, sehingga hasilnya merupakan kelipatan skalar dari vektor acuan itu.",
            },
          ],
          quiz: [
            {
              id: "mtl-matriks-vektor-operasi-proyeksi-q1",
              question:
                "Jika \\( \\vec{a} = (1, 2, 3) \\) dan \\( \\vec{b} = (2, 0, -1) \\), nilai \\( \\vec{a} \\cdot \\vec{b} \\) adalah ...",
              options: ["-1", "1", "5", "-5"],
              correctIndex: 0,
              explanation: "\\( 1(2) + 2(0) + 3(-1) = 2 - 3 = -1 \\).",
            },
            {
              id: "mtl-matriks-vektor-operasi-proyeksi-q2",
              question: "Panjang vektor \\( (3, -4, 12) \\) adalah ...",
              options: ["11", "13", "19", "169"],
              correctIndex: 1,
              explanation: "\\( \\sqrt{9 + 16 + 144} = \\sqrt{169} = 13 \\).",
            },
            {
              id: "mtl-matriks-vektor-operasi-proyeksi-q3",
              question:
                "Proyeksi skalar \\( \\vec{a} = (2, 4) \\) pada \\( \\vec{b} = (0, 2) \\) adalah ...",
              options: ["2", "4", "6", "\\( 2\\sqrt{5} \\)"],
              correctIndex: 1,
              explanation:
                "\\( \\vec{a} \\cdot \\vec{b} = 8 \\) dan \\( |\\vec{b}| = 2 \\), sehingga proyeksi skalar \\( = \\dfrac{8}{2} = 4 \\).",
            },
            {
              id: "mtl-matriks-vektor-operasi-proyeksi-q4",
              question:
                "Nilai \\( k \\) agar \\( \\vec{a} = (2, k, 1) \\) tegak lurus \\( \\vec{b} = (1, 3, -2) \\) adalah ...",
              options: ["0", "\\( \\dfrac{1}{3} \\)", "1", "3"],
              correctIndex: 0,
              explanation:
                "Syarat tegak lurus \\( \\vec{a} \\cdot \\vec{b} = 0 \\): \\( 2 + 3k - 2 = 0 \\Rightarrow 3k = 0 \\Rightarrow k = 0 \\).",
            },
          ],
          latihanSoal: [
            {
              id: "mtl-matriks-vektor-operasi-proyeksi-l1",
              level: "hots",
              question:
                "Sebuah pesawat bergerak dengan vektor kecepatan \\( \\vec{v} = (120, 90, 0) \\) km/jam dan bertiup angin dengan vektor \\( \\vec{w} = (-30, 40, 0) \\) km/jam. (a) Tentukan vektor kecepatan resultan. (b) Hitung besar kecepatan resultan. (c) Tentukan proyeksi skalar angin pada arah kecepatan pesawat. (d) Jelaskan makna fisis hasil (c).",
              langkah: [
                "Jumlahkan komponen: \\( \\vec{v} + \\vec{w} = (120 - 30,\\ 90 + 40,\\ 0) = (90, 130, 0) \\).",
                "Hitung besar resultan: \\( \\sqrt{90^{2} + 130^{2}} = \\sqrt{8100 + 16900} = \\sqrt{25000} \\approx 158{,}11 \\) km/jam.",
                "Hitung \\( \\vec{v} \\cdot \\vec{w} = 120(-30) + 90(40) = -3600 + 3600 = 0 \\).",
                "Karena perkalian titiknya nol, angin tegak lurus terhadap kecepatan pesawat.",
                "Proyeksi skalar \\( = \\dfrac{\\vec{v} \\cdot \\vec{w}}{|\\vec{v}|} = \\dfrac{0}{150} = 0 \\).",
                "Makna fisis: angin tidak menambah atau mengurangi kecepatan maju pesawat, melainkan hanya menggeser arah lintasannya.",
                "Hitung besar \\( |\\vec{v}| = \\sqrt{14400 + 8100} = \\sqrt{22500} = 150 \\) km/jam untuk verifikasi pembagi proyeksi.",
                "Verifikasi konsistensi: besar resultan 158,11 lebih besar dari 150 karena adanya komponen angin yang menambah kecepatan lateral.",
              ],
              jawaban:
                "(a) \\( (90, 130, 0) \\) km/jam (b) \\( \\approx 158{,}11 \\) km/jam (c) Proyeksi skalar = 0 karena \\( \\vec{v} \\cdot \\vec{w} = 0 \\) (d) Angin bertiup tegak lurus arah pesawat, sehingga tidak mengubah kecepatan maju, hanya menggeser lintasan.",
            },
            {
              id: "mtl-matriks-vektor-operasi-proyeksi-l2",
              level: "sulit",
              question:
                "Diketahui \\( \\vec{a} = (4, 2, -1) \\) dan \\( \\vec{b} = (1, -1, 3) \\). (a) Hitung \\( \\vec{a} \\cdot \\vec{b} \\). (b) Tentukan sudut antara kedua vektor. (c) Tentukan proyeksi vektor \\( \\vec{a} \\) pada \\( \\vec{b} \\). (d) Tentukan vektor komponen \\( \\vec{a} \\) yang tegak lurus \\( \\vec{b} \\), lalu periksa bahwa komponen itu tegak lurus \\( \\vec{b} \\).",
              langkah: [
                "Hitung perkalian titik: \\( 4(1) + 2(-1) + (-1)(3) = 4 - 2 - 3 = -1 \\).",
                "Hitung panjang: \\( |\\vec{a}| = \\sqrt{16 + 4 + 1} = \\sqrt{21} \\) dan \\( |\\vec{b}| = \\sqrt{1 + 1 + 9} = \\sqrt{11} \\).",
                "Hitung kosinus sudut: \\( \\cos\\theta = \\dfrac{-1}{\\sqrt{21}\\sqrt{11}} = \\dfrac{-1}{\\sqrt{231}} \\approx -0{,}0658 \\).",
                "Tentukan sudut: \\( \\theta = \\arccos(-0{,}0658) \\approx 93{,}77^{\\circ} \\), berarti kedua vektor hampir tegak lurus dengan sudut sedikit tumpul.",
                "Hitung \\( |\\vec{b}|^{2} = 11 \\), sehingga proyeksi vektor \\( \\vec{p} = \\dfrac{-1}{11}(1, -1, 3) = \\left(-\\dfrac{1}{11}, \\dfrac{1}{11}, -\\dfrac{3}{11}\\right) \\).",
                "Hitung komponen tegak lurus: \\( \\vec{a} - \\vec{p} = \\left(4 + \\dfrac{1}{11},\\ 2 - \\dfrac{1}{11},\\ -1 + \\dfrac{3}{11}\\right) = \\left(\\dfrac{45}{11}, \\dfrac{21}{11}, -\\dfrac{8}{11}\\right) \\).",
                "Periksa ketegaklurusan: \\( \\left(\\dfrac{45}{11}\\right)(1) + \\left(\\dfrac{21}{11}\\right)(-1) + \\left(-\\dfrac{8}{11}\\right)(3) = \\dfrac{45 - 21 - 24}{11} = 0 \\). Terbukti tegak lurus.",
                "Simpulkan: setiap vektor dapat diuraikan menjadi komponen sejajar (proyeksi) dan komponen tegak lurus terhadap vektor acuan.",
              ],
              jawaban:
                "(a) \\( \\vec{a} \\cdot \\vec{b} = -1 \\) (b) \\( \\cos\\theta = -\\dfrac{1}{\\sqrt{231}} \\), sehingga \\( \\theta \\approx 93{,}77^{\\circ} \\) (c) \\( \\vec{p} = \\left(-\\dfrac{1}{11}, \\dfrac{1}{11}, -\\dfrac{3}{11}\\right) \\) (d) Komponen tegak lurusnya \\( \\left(\\dfrac{45}{11}, \\dfrac{21}{11}, -\\dfrac{8}{11}\\right) \\), dan hasil kali titik dengan \\( \\vec{b} \\) adalah 0 sehingga terbukti tegak lurus.",
            },
          ],
          tkaSoal: [
            {
              id: "mtl-matriks-vektor-operasi-proyeksi-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Panjang vektor \\( \\vec{a} = (2, -3, 6) \\) adalah ...",
              options: [
                { id: "A", text: "5" },
                { id: "B", text: "6" },
                { id: "C", text: "7" },
                { id: "D", text: "9" },
                { id: "E", text: "13" },
              ],
              correctIds: ["C"],
              explanation:
                "\\( |\\vec{a}| = \\sqrt{2^{2} + (-3)^{2} + 6^{2}} = \\sqrt{4 + 9 + 36} = \\sqrt{49} = 7 \\).",
            },
            {
              id: "mtl-matriks-vektor-operasi-proyeksi-tka2",
              bentuk: "pg",
              level: "L2",
              question:
                "Diketahui \\( \\vec{a} = (2, -1, 4) \\) dan \\( \\vec{b} = (3, 2, -1) \\). Nilai \\( \\vec{a} \\cdot \\vec{b} \\) dan kedudukan kedua vektor adalah ...",
              options: [
                { id: "A", text: "0, kedua vektor sejajar" },
                { id: "B", text: "0, kedua vektor saling tegak lurus" },
                { id: "C", text: "1, kedua vektor membentuk sudut lancip" },
                { id: "D", text: "-1, kedua vektor membentuk sudut tumpul" },
                { id: "E", text: "8, kedua vektor searah" },
              ],
              correctIds: ["B"],
              explanation:
                "\\( \\vec{a} \\cdot \\vec{b} = 2(3) + (-1)(2) + 4(-1) = 6 - 2 - 4 = 0 \\). Hasil kali titik nol berarti kedua vektor saling tegak lurus.",
            },
            {
              id: "mtl-matriks-vektor-operasi-proyeksi-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              question:
                "Diketahui \\( \\vec{a} = (2, 2) \\) dan \\( \\vec{b} = (4, 0) \\). Pilih semua pernyataan yang BENAR. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "\\( \\vec{a} \\cdot \\vec{b} = 8 \\)" },
                { id: "B", text: "Proyeksi skalar \\( \\vec{a} \\) pada \\( \\vec{b} \\) adalah 2" },
                { id: "C", text: "Proyeksi vektor \\( \\vec{a} \\) pada \\( \\vec{b} \\) adalah \\( (2, 0) \\)" },
                { id: "D", text: "Sudut antara \\( \\vec{a} \\) dan \\( \\vec{b} \\) adalah 90 derajat" },
                { id: "E", text: "Panjang vektor \\( \\vec{b} \\) adalah 8" },
              ],
              correctIds: ["A", "B", "C"],
              explanation:
                "\\( \\vec{a} \\cdot \\vec{b} = 8 \\); proyeksi skalar \\( = 8/4 = 2 \\); proyeksi vektor \\( = \\dfrac{8}{16}(4, 0) = (2, 0) \\). D salah karena \\( \\cos\\theta = 8/(4\\sqrt{8}) \\ne 0 \\) (sudutnya 45 derajat). E salah karena \\( |\\vec{b}| = 4 \\).",
            },
            {
              id: "mtl-matriks-vektor-operasi-proyeksi-tka4",
              bentuk: "isian",
              level: "L2",
              question:
                "Proyeksi skalar \\( \\vec{a} = (3, 4) \\) pada \\( \\vec{b} = (5, 0) \\) adalah ...",
              correctIds: ["3"],
              explanation:
                "\\( \\vec{a} \\cdot \\vec{b} = 15 \\) dan \\( |\\vec{b}| = 5 \\), sehingga proyeksi skalar \\( c = \\dfrac{15}{5} = 3 \\).",
            },
          ],
        },
      ],
    },
    {
      id: "mtl-fungsi-trigonometri-lanjutan",
      title: "Fungsi Trigonometri Lanjutan",
      order: 3,
      subtopics: [
        {
          id: "mtl-fungsi-trigonometri-lanjutan-identitas-persamaan",
          title: "Identitas & Persamaan Trigonometri",
          estimatedMinutes: 90,
          materi: {
            ringkasan:
              "Identitas trigonometri adalah kesamaan yang berlaku untuk semua nilai sudut, sedangkan persamaan trigonometri hanya berlaku pada nilai tertentu. Penyelesaian persamaan trigonometri memanfaatkan identitas untuk menyederhanakan bentuk, lalu menggunakan rumus solusi umum karena fungsinya periodik.",
            rumus: [
              "Identitas dasar: \\( \\sin^{2}x + \\cos^{2}x = 1 \\)",
              "Identitas jumlah sudut: \\( \\sin(A \\pm B) = \\sin A\\cos B \\pm \\cos A\\sin B \\)",
              "Identitas sudut ganda: \\( \\sin 2A = 2\\sin A\\cos A \\) dan \\( \\cos 2A = \\cos^{2}A - \\sin^{2}A \\)",
              "Solusi umum \\( \\sin x = \\sin\\alpha \\): \\( x = \\alpha + k \\cdot 360^{\\circ} \\) atau \\( x = (180^{\\circ} - \\alpha) + k \\cdot 360^{\\circ} \\)",
              "Solusi umum \\( \\cos x = \\cos\\alpha \\): \\( x = \\pm\\alpha + k \\cdot 360^{\\circ} \\)",
              "Solusi umum \\( \\tan x = \\tan\\alpha \\): \\( x = \\alpha + k \\cdot 180^{\\circ} \\)",
              "Bentuk \\( a\\sin x + b\\cos x = k \\): ubah menjadi \\( R\\sin(x + \\theta) \\) dengan \\( R = \\sqrt{a^{2}+b^{2}} \\)",
            ],
            contoh: [
              {
                soal:
                  "Tentukan himpunan penyelesaian \\( 2\\sin x = 1 \\) untuk \\( 0^{\\circ} \\le x \\le 360^{\\circ} \\).",
                pembahasan:
                  "\\( \\sin x = \\tfrac{1}{2} = \\sin 30^{\\circ} \\). Solusinya \\( x = 30^{\\circ} \\) dan \\( x = 180^{\\circ} - 30^{\\circ} = 150^{\\circ} \\). HP = {30°, 150°}.",
              },
              {
                soal: "Sederhanakan \\( \\dfrac{\\sin 2x}{\\sin x} \\) untuk \\( \\sin x \\ne 0 \\).",
                pembahasan:
                  "Gunakan identitas sudut ganda: \\( \\dfrac{2\\sin x\\cos x}{\\sin x} = 2\\cos x \\).",
              },
            ],
          },
          flashcards: [
            {
              id: "mtl-fungsi-trigonometri-lanjutan-identitas-persamaan-fc1",
              front: "Mengapa persamaan trigonometri punya tak hingga solusi?",
              back: "Karena fungsi trigonometri bersifat periodik, sehingga nilai yang sama berulang setiap 360 derajat (atau 180 derajat untuk tangen).",
            },
            {
              id: "mtl-fungsi-trigonometri-lanjutan-identitas-persamaan-fc2",
              front: "Bentuk alternatif identitas \\( \\cos 2A \\)?",
              back: "\\( \\cos 2A = 1 - 2\\sin^{2}A \\) atau \\( \\cos 2A = 2\\cos^{2}A - 1 \\), pilih bentuk yang paling menguntungkan sesuai soal.",
            },
            {
              id: "mtl-fungsi-trigonometri-lanjutan-identitas-persamaan-fc3",
              front: "Strategi menyelesaikan \\( a\\sin x + b\\cos x = k \\)?",
              back: "Ubah ke bentuk \\( R\\sin(x+\\theta) \\) dengan \\( R = \\sqrt{a^{2}+b^{2}} \\), sehingga persamaan menjadi satu fungsi sinus saja.",
            },
            {
              id: "mtl-fungsi-trigonometri-lanjutan-identitas-persamaan-fc4",
              front: "Identitas untuk \\( \\tan(A+B) \\)?",
              back: "\\( \\tan(A+B) = \\dfrac{\\tan A + \\tan B}{1 - \\tan A\\tan B} \\), dengan syarat penyebut tidak nol.",
            },
          ],
          quiz: [
            {
              id: "mtl-fungsi-trigonometri-lanjutan-identitas-persamaan-q1",
              question:
                "Himpunan penyelesaian \\( \\cos x = \\tfrac{1}{2}\\sqrt{2} \\) untuk \\( 0^{\\circ} \\le x \\le 360^{\\circ} \\) adalah ...",
              options: ["{45°, 315°}", "{45°, 135°}", "{30°, 330°}", "{60°, 300°}"],
              correctIndex: 0,
              explanation:
                "\\( \\cos x = \\cos 45^{\\circ} \\) memberi \\( x = 45^{\\circ} \\) atau \\( x = -45^{\\circ} + 360^{\\circ} = 315^{\\circ} \\).",
            },
            {
              id: "mtl-fungsi-trigonometri-lanjutan-identitas-persamaan-q2",
              question: "Nilai \\( \\sin 75^{\\circ} \\) adalah ...",
              options: [
                "\\( \\dfrac{\\sqrt{6} + \\sqrt{2}}{4} \\)",
                "\\( \\dfrac{\\sqrt{6} - \\sqrt{2}}{4} \\)",
                "\\( \\dfrac{\\sqrt{3} + 1}{4} \\)",
                "\\( \\dfrac{\\sqrt{2}}{2} \\)",
              ],
              correctIndex: 0,
              explanation:
                "\\( \\sin 75^{\\circ} = \\sin(45^{\\circ}+30^{\\circ}) = \\dfrac{\\sqrt{2}}{2}\\cdot\\dfrac{\\sqrt{3}}{2} + \\dfrac{\\sqrt{2}}{2}\\cdot\\dfrac{1}{2} = \\dfrac{\\sqrt{6}+\\sqrt{2}}{4} \\).",
            },
            {
              id: "mtl-fungsi-trigonometri-lanjutan-identitas-persamaan-q3",
              question:
                "Jika \\( \\sin x = \\tfrac{3}{5} \\) dan \\( x \\) di kuadran I, nilai \\( \\sin 2x \\) adalah ...",
              options: ["\\( \\dfrac{24}{25} \\)", "\\( \\dfrac{12}{25} \\)", "\\( \\dfrac{7}{25} \\)", "\\( \\dfrac{6}{5} \\)"],
              correctIndex: 0,
              explanation:
                "\\( \\cos x = \\tfrac{4}{5} \\), sehingga \\( \\sin 2x = 2 \\cdot \\tfrac{3}{5} \\cdot \\tfrac{4}{5} = \\dfrac{24}{25} \\).",
            },
            {
              id: "mtl-fungsi-trigonometri-lanjutan-identitas-persamaan-q4",
              question: "Bentuk \\( \\sin x + \\sqrt{3}\\cos x \\) dapat dinyatakan sebagai ...",
              options: [
                "\\( 2\\sin(x + 60^{\\circ}) \\)",
                "\\( 2\\sin(x + 30^{\\circ}) \\)",
                "\\( 2\\sin(x + 45^{\\circ}) \\)",
                "\\( \\sin(x + 60^{\\circ}) \\)",
              ],
              correctIndex: 0,
              explanation:
                "\\( R = \\sqrt{1 + 3} = 2 \\) dan \\( \\tan\\theta = \\sqrt{3} \\) memberi \\( \\theta = 60^{\\circ} \\), sehingga bentuknya \\( 2\\sin(x + 60^{\\circ}) \\).",
            },
          ],
          latihanSoal: [
            {
              id: "mtl-fungsi-trigonometri-lanjutan-identitas-persamaan-l1",
              level: "hots",
              question:
                "Sebuah lampu sorot di atas panggung menghasilkan intensitas cahaya yang mengikuti model \\( I(t) = 3 + 2\\sin\\left(\\dfrac{\\pi t}{6}\\right) \\), dengan \\( t \\) dalam jam dan \\( I \\) dalam satuan kilolux. (a) Tentukan intensitas maksimum dan minimum. (b) Tentukan waktu \\( t \\) pada rentang \\( 0 \\le t \\le 24 \\) saat intensitas mencapai maksimum. (c) Tentukan kapan intensitas berada di bawah 2 kilolux. (d) Jelaskan makna periode fungsi tersebut bagi pengelola panggung.",
              langkah: [
                "Analisis bentuk fungsi: \\( 3 + 2\\sin(\\cdot) \\) memiliki nilai maksimum saat sinus = 1 dan minimum saat sinus = -1.",
                "Intensitas maksimum: \\( 3 + 2 = 5 \\) kilolux. Intensitas minimum: \\( 3 - 2 = 1 \\) kilolux.",
                "Cari waktu maksimum: \\( \\sin\\left(\\dfrac{\\pi t}{6}\\right) = 1 \\Rightarrow \\dfrac{\\pi t}{6} = \\dfrac{\\pi}{2} + 2k\\pi \\Rightarrow t = 3 + 12k \\).",
                "Pada rentang \\( 0 \\le t \\le 24 \\): \\( t = 3, 15 \\) jam.",
                "Cari intensitas di bawah 2 kilolux: \\( 3 + 2\\sin\\left(\\dfrac{\\pi t}{6}\\right) < 2 \\Rightarrow \\sin\\left(\\dfrac{\\pi t}{6}\\right) < -\\dfrac{1}{2} \\).",
                "Solusi sinus kurang dari -1/2 berada pada rentang sudut \\( 210^{\\circ} \\) sampai \\( 330^{\\circ} \\) (atau \\( \\dfrac{7\\pi}{6} \\) sampai \\( \\dfrac{11\\pi}{6} \\)).",
                "Ubah ke \\( t \\): \\( \\dfrac{\\pi t}{6} = \\dfrac{7\\pi}{6} + 2k\\pi \\Rightarrow t = 7 + 12k \\) dan \\( \\dfrac{\\pi t}{6} = \\dfrac{11\\pi}{6} + 2k\\pi \\Rightarrow t = 11 + 12k \\).",
                "Pada rentang \\( 0 \\le t \\le 24 \\): \\( t \\) antara 7 sampai 11 jam dan antara 19 sampai 23 jam.",
                "Periode: \\( \\dfrac{2\\pi}{\\pi/6} = 12 \\) jam, sehingga pola intensitas berulang dua kali dalam sehari.",
                "Makna praktis: pengelola dapat menjadwalkan penyesuaian lampu tambahan pada pukul 07.00-11.00 dan 19.00-23.00.",
              ],
              jawaban:
                "(a) Maksimum 5 kilolux, minimum 1 kilolux (b) \\( t = 3 \\) dan \\( t = 15 \\) jam (c) Intensitas di bawah 2 kilolux pada \\( 7 \\le t \\le 11 \\) dan \\( 19 \\le t \\le 23 \\) jam (d) Periode 12 jam berarti pola berulang dua kali sehari, sehingga penjadwalan lampu tambahan dapat disusun mengikuti pola itu.",
            },
            {
              id: "mtl-fungsi-trigonometri-lanjutan-identitas-persamaan-l2",
              level: "sulit",
              question:
                "Tentukan semua penyelesaian persamaan \\( 2\\cos^{2}x + 3\\sin x - 3 = 0 \\) untuk \\( 0^{\\circ} \\le x \\le 360^{\\circ} \\). (a) Ubah persamaan menjadi bentuk yang hanya memuat sinus. (b) Tentukan solusi bantunya. (c) Tentukan semua nilai \\( x \\) yang memenuhi. (d) Periksa apakah ada nilai \\( x \\) yang menggugurkan syarat domain.",
              langkah: [
                "Gunakan identitas \\( \\cos^{2}x = 1 - \\sin^{2}x \\) untuk mengubah persamaan.",
                "Substitusi: \\( 2(1 - \\sin^{2}x) + 3\\sin x - 3 = 0 \\Rightarrow -2\\sin^{2}x + 3\\sin x - 1 = 0 \\).",
                "Kalikan dengan -1: \\( 2\\sin^{2}x - 3\\sin x + 1 = 0 \\).",
                "Faktorkan: \\( (2\\sin x - 1)(\\sin x - 1) = 0 \\).",
                "Solusi 1: \\( \\sin x = \\tfrac{1}{2} \\Rightarrow x = 30^{\\circ} \\) atau \\( x = 150^{\\circ} \\).",
                "Solusi 2: \\( \\sin x = 1 \\Rightarrow x = 90^{\\circ} \\).",
                "Kumpulkan semua: \\( x = 30^{\\circ}, 90^{\\circ}, 150^{\\circ} \\).",
                "Periksa setiap solusi pada persamaan asli: pada \\( x = 30^{\\circ} \\), \\( 2(\\tfrac{3}{4}) + 3(\\tfrac{1}{2}) - 3 = 1{,}5 + 1{,}5 - 3 = 0 \\). Benar.",
                "Pada \\( x = 90^{\\circ} \\): \\( 2(0) + 3(1) - 3 = 0 \\). Benar. Pada \\( x = 150^{\\circ} \\): \\( 2(\\tfrac{3}{4}) + 1{,}5 - 3 = 0 \\). Benar.",
                "Tidak ada solusi yang gugur karena semua nilai sinus berada dalam rentang yang sah \\( -1 \\le \\sin x \\le 1 \\).",
              ],
              jawaban:
                "(a) \\( 2\\sin^{2}x - 3\\sin x + 1 = 0 \\) (b) \\( \\sin x = \\tfrac{1}{2} \\) atau \\( \\sin x = 1 \\) (c) HP = {30°, 90°, 150°} (d) Tidak ada yang gugur, karena semua nilai sinus berada dalam rentang sah \\( -1 \\le \\sin x \\le 1 \\) dan terverifikasi pada persamaan asli.",
            },
          ],
          tkaSoal: [
            {
              id: "mtl-fungsi-trigonometri-lanjutan-identitas-persamaan-tka1",
              bentuk: "pg",
              level: "L1",
              question:
                "Himpunan penyelesaian \\( \\tan x = \\sqrt{3} \\) untuk \\( 0^{\\circ} \\le x \\le 360^{\\circ} \\) adalah ...",
              options: [
                { id: "A", text: "{30°, 210°}" },
                { id: "B", text: "{60°, 240°}" },
                { id: "C", text: "{120°, 300°}" },
                { id: "D", text: "{60°, 300°}" },
                { id: "E", text: "{45°, 225°}" },
              ],
              correctIds: ["B"],
              explanation:
                "\\( \\tan 60^{\\circ} = \\sqrt{3} \\) dan periode tangen \\( 180^{\\circ} \\), sehingga solusinya \\( x = 60^{\\circ} \\) dan \\( x = 240^{\\circ} \\).",
            },
            {
              id: "mtl-fungsi-trigonometri-lanjutan-identitas-persamaan-tka2",
              bentuk: "pg",
              level: "L2",
              question:
                "Jika \\( \\sin x = \\dfrac{3}{5} \\) dengan \\( x \\) lancip, maka nilai \\( \\cos 2x \\) adalah ...",
              options: [
                { id: "A", text: "\\( \\dfrac{24}{25} \\)" },
                { id: "B", text: "\\( \\dfrac{7}{25} \\)" },
                { id: "C", text: "\\( -\\dfrac{7}{25} \\)" },
                { id: "D", text: "\\( \\dfrac{12}{25} \\)" },
                { id: "E", text: "\\( \\dfrac{16}{25} \\)" },
              ],
              correctIds: ["B"],
              explanation:
                "Gunakan \\( \\cos 2x = 1 - 2\\sin^{2}x = 1 - 2\\left(\\dfrac{9}{25}\\right) = \\dfrac{7}{25} \\).",
            },
            {
              id: "mtl-fungsi-trigonometri-lanjutan-identitas-persamaan-tka3",
              bentuk: "pgk-mcma",
              level: "L2",
              question:
                "Pilih semua identitas trigonometri yang BENAR. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "\\( \\sin^{2}x + \\cos^{2}x = 1 \\)" },
                { id: "B", text: "\\( \\sin 2x = 2 \\sin x \\cos x \\)" },
                { id: "C", text: "\\( \\cos 2x = 2\\cos^{2}x + 1 \\)" },
                { id: "D", text: "\\( \\sin(A + B) = \\sin A \\cos B + \\cos A \\sin B \\)" },
                { id: "E", text: "\\( \\cos(A + B) = \\cos A \\cos B + \\sin A \\sin B \\)" },
              ],
              correctIds: ["A", "B", "D"],
              explanation:
                "C seharusnya \\( \\cos 2x = 2\\cos^{2}x - 1 \\). E seharusnya \\( \\cos(A + B) = \\cos A \\cos B - \\sin A \\sin B \\) (tanda minus, bukan plus).",
            },
            {
              id: "mtl-fungsi-trigonometri-lanjutan-identitas-persamaan-tka4",
              bentuk: "isian",
              level: "L3",
              question:
                "Nilai maksimum dari \\( 3\\sin x + 4\\cos x \\) adalah ...",
              correctIds: ["5"],
              explanation:
                "Ubah ke bentuk \\( R\\sin(x + \\theta) \\) dengan \\( R = \\sqrt{3^{2} + 4^{2}} = 5 \\), sehingga nilai maksimumnya 5.",
            },
          ],
        },
        {
          id: "mtl-fungsi-trigonometri-lanjutan-grafik",
          title: "Grafik Fungsi Trigonometri",
          estimatedMinutes: 90,
          materi: {
            ringkasan:
              "Grafik fungsi trigonometri berbentuk gelombang periodik dengan amplitudo, periode, dan pergeseran fase yang dapat ditentukan dari parameternya. Bentuk umum y = a sin(bx + c) + d memungkinkan analisis cepat terhadap nilai maksimum, minimum, dan titik potong sumbu.",
            rumus: [
              "Bentuk umum: \\( y = a\\sin(bx + c) + d \\)",
              "Amplitudo: \\( |a| \\) menyatakan setengah jarak antara nilai maksimum dan minimum",
              "Periode: \\( T = \\dfrac{360^{\\circ}}{|b|} \\) atau \\( \\dfrac{2\\pi}{|b|} \\) dalam radian",
              "Pergeseran fase: \\( -\\dfrac{c}{b} \\) ke arah kanan bila nilainya positif",
              "Garis tengah (sumbu simetri horizontal): \\( y = d \\)",
              "Nilai maksimum \\( d + |a| \\) dan minimum \\( d - |a| \\)",
              "Menentukan titik potong sumbu-x: selesaikan \\( a\\sin(bx + c) + d = 0 \\)",
            ],
            contoh: [
              {
                soal: "Tentukan amplitudo, periode, dan nilai maksimum dari \\( y = 3\\sin\\left(2x\\right) + 1 \\).",
                pembahasan:
                  "Amplitudo \\( |3| = 3 \\), periode \\( \\dfrac{360^{\\circ}}{2} = 180^{\\circ} \\), nilai maksimum \\( 1 + 3 = 4 \\) dan minimum \\( 1 - 3 = -2 \\).",
              },
              {
                soal: "Tentukan pergeseran fase grafik \\( y = \\sin\\left(x - 30^{\\circ}\\right) \\).",
                pembahasan:
                  "Pergeseran fase \\( = -\\dfrac{c}{b} = -\\dfrac{-30^{\\circ}}{1} = 30^{\\circ} \\) ke kanan.",
              },
            ],
          },
          flashcards: [
            {
              id: "mtl-fungsi-trigonometri-lanjutan-grafik-fc1",
              front: "Apa pengaruh parameter a pada grafik sinus?",
              back: "Nilai \\( |a| \\) menentukan amplitudo (tinggi gelombang), dan tanda \\( a \\) menentukan pencerminan terhadap sumbu-x.",
            },
            {
              id: "mtl-fungsi-trigonometri-lanjutan-grafik-fc2",
              front: "Bagaimana menghitung periode \\( y = a\\cos(bx) \\)?",
              back: "\\( T = \\dfrac{360^{\\circ}}{|b|} \\); misalnya untuk \\( b = 3 \\), periodenya 120 derajat.",
            },
            {
              id: "mtl-fungsi-trigonometri-lanjutan-grafik-fc3",
              front: "Apa fungsi parameter d pada \\( y = a\\sin(bx) + d \\)?",
              back: "Menggeser grafik naik atau turun secara vertikal, sehingga garis tengah grafik berada di \\( y = d \\).",
            },
            {
              id: "mtl-fungsi-trigonometri-lanjutan-grafik-fc4",
              front: "Berapa banyak gelombang penuh sinus pada rentang 0 sampai 360 derajat jika \\( b = 2 \\)?",
              back: "Dua gelombang penuh, karena periodenya 180 derajat sehingga satu putaran penuh memuat dua siklus.",
            },
          ],
          quiz: [
            {
              id: "mtl-fungsi-trigonometri-lanjutan-grafik-q1",
              question: "Amplitudo dari \\( y = -4\\cos(3x) \\) adalah ...",
              options: ["-4", "3", "4", "\\( \\dfrac{3}{4} \\)"],
              correctIndex: 2,
              explanation:
                "Amplitudo adalah nilai absolut koefisien, yaitu \\( |-4| = 4 \\); tanda negatifnya hanya mencerminkan grafik.",
            },
            {
              id: "mtl-fungsi-trigonometri-lanjutan-grafik-q2",
              question: "Periode fungsi \\( y = \\sin\\left(\\dfrac{x}{2}\\right) \\) adalah ...",
              options: ["90°", "180°", "360°", "720°"],
              correctIndex: 3,
              explanation: "\\( T = \\dfrac{360^{\\circ}}{|1/2|} = 720^{\\circ} \\).",
            },
            {
              id: "mtl-fungsi-trigonometri-lanjutan-grafik-q3",
              question: "Nilai minimum fungsi \\( y = 2\\sin x - 5 \\) adalah ...",
              options: ["-7", "-5", "-3", "7"],
              correctIndex: 0,
              explanation:
                "Nilai minimum \\( = d - |a| = -5 - 2 = -7 \\), tercapai saat \\( \\sin x = -1 \\).",
            },
            {
              id: "mtl-fungsi-trigonometri-lanjutan-grafik-q4",
              question:
                "Grafik \\( y = \\cos(2x - 60^{\\circ}) \\) mengalami pergeseran fase sebesar ...",
              options: [
                "30° ke kanan",
                "60° ke kanan",
                "30° ke kiri",
                "60° ke kiri",
              ],
              correctIndex: 0,
              explanation:
                "Pergeseran fase \\( = -\\dfrac{c}{b} = -\\dfrac{-60^{\\circ}}{2} = 30^{\\circ} \\) ke kanan.",
            },
          ],
          latihanSoal: [
            {
              id: "mtl-fungsi-trigonometri-lanjutan-grafik-l1",
              level: "hots",
              question:
                "Ketinggian air laut di sebuah pelabuhan dimodelkan \\( h(t) = 4 + 3\\sin\\left(\\dfrac{\\pi t}{6} - \\dfrac{\\pi}{2}\\right) \\), dengan \\( h \\) dalam meter dan \\( t \\) dalam jam sejak tengah malam. (a) Tentukan ketinggian maksimum dan minimum. (b) Tentukan periode pasang surut. (c) Tentukan waktu saat air mencapai ketinggian maksimum pada 24 jam pertama. (d) Jelaskan mengapa model ini berguna bagi nelayan.",
              langkah: [
                "Identifikasi parameter: \\( a = 3 \\), \\( b = \\dfrac{\\pi}{6} \\), \\( c = -\\dfrac{\\pi}{2} \\), \\( d = 4 \\).",
                "Ketinggian maksimum \\( = 4 + 3 = 7 \\) meter dan minimum \\( = 4 - 3 = 1 \\) meter.",
                "Hitung periode: \\( T = \\dfrac{2\\pi}{|b|} = \\dfrac{2\\pi}{\\pi/6} = 12 \\) jam.",
                "Cari waktu maksimum: \\( \\sin\\left(\\dfrac{\\pi t}{6} - \\dfrac{\\pi}{2}\\right) = 1 \\Rightarrow \\dfrac{\\pi t}{6} - \\dfrac{\\pi}{2} = \\dfrac{\\pi}{2} + 2k\\pi \\).",
                "Sederhanakan: \\( \\dfrac{\\pi t}{6} = \\pi + 2k\\pi \\Rightarrow t = 6 + 12k \\).",
                "Pada 24 jam pertama: \\( t = 6 \\) dan \\( t = 18 \\) jam.",
                "Verifikasi: pada \\( t = 6 \\), argumen sinus menjadi \\( \\pi - \\dfrac{\\pi}{2} = \\dfrac{\\pi}{2} \\), dan \\( \\sin\\dfrac{\\pi}{2} = 1 \\). Benar.",
                "Manfaat bagi nelayan: pola pasang surut 12 jam memungkinkan perencanaan waktu melaut, terutama untuk kapal yang memerlukan kedalaman tertentu saat keluar dan masuk pelabuhan.",
              ],
              jawaban:
                "(a) Maksimum 7 meter, minimum 1 meter (b) Periode 12 jam (c) Air tertinggi pada \\( t = 6 \\) dan \\( t = 18 \\) jam (d) Pola 12 jam yang teratur memungkinkan nelayan merencanakan waktu melaut sesuai kedalaman yang dibutuhkan kapal.",
            },
            {
              id: "mtl-fungsi-trigonometri-lanjutan-grafik-l2",
              level: "sulit",
              question:
                "Diberikan fungsi \\( y = -2\\cos\\left(3x + 90^{\\circ}\\right) + 1 \\). (a) Tentukan amplitudo, periode, pergeseran fase, dan garis tengah. (b) Tentukan nilai maksimum dan minimum. (c) Tentukan titik potong sumbu-y. (d) Jelaskan bagaimana tanda negatif pada amplitudo mengubah bentuk grafik dibandingkan fungsi kosinus dasar.",
              langkah: [
                "Identifikasi parameter: \\( a = -2 \\), \\( b = 3 \\), \\( c = 90^{\\circ} \\), \\( d = 1 \\).",
                "Amplitudo: \\( |a| = 2 \\).",
                "Periode: \\( T = \\dfrac{360^{\\circ}}{3} = 120^{\\circ} \\).",
                "Pergeseran fase: \\( -\\dfrac{c}{b} = -\\dfrac{90^{\\circ}}{3} = -30^{\\circ} \\), artinya bergeser 30 derajat ke kiri.",
                "Garis tengah: \\( y = d = 1 \\).",
                "Nilai maksimum: \\( d + |a| = 1 + 2 = 3 \\), tercapai saat \\( \\cos(\\cdot) = -1 \\) karena \\( a \\) negatif.",
                "Nilai minimum: \\( d - |a| = 1 - 2 = -1 \\), tercapai saat \\( \\cos(\\cdot) = 1 \\).",
                "Titik potong sumbu-y: substitusi \\( x = 0 \\), \\( y = -2\\cos(90^{\\circ}) + 1 = -2(0) + 1 = 1 \\), sehingga titiknya \\( (0, 1) \\).",
                "Jelaskan tanda negatif: nilai maksimum dan minimum bertukar posisi dibanding kosinus dasar, karena grafik dicerminkan terhadap garis tengahnya.",
                "Simpulkan: pencerminan tidak mengubah amplitudo maupun periode, hanya membalik posisi puncak dan lembah.",
              ],
              jawaban:
                "(a) Amplitudo 2, periode 120°, pergeseran fase 30° ke kiri, garis tengah \\( y = 1 \\) (b) Maksimum 3 dan minimum -1 (c) Titik potong sumbu-y adalah \\( (0, 1) \\) (d) Tanda negatif mencerminkan grafik terhadap garis tengah, sehingga puncak dan lembah bertukar posisi tanpa mengubah amplitudo atau periode.",
            },
          ],
          tkaSoal: [
            {
              id: "mtl-fungsi-trigonometri-lanjutan-grafik-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Periode grafik \\( y = \\sin 2x \\) adalah ...",
              options: [
                { id: "A", text: "90°" },
                { id: "B", text: "120°" },
                { id: "C", text: "180°" },
                { id: "D", text: "360°" },
                { id: "E", text: "720°" },
              ],
              correctIds: ["C"],
              explanation:
                "\\( T = \\dfrac{360^{\\circ}}{|b|} = \\dfrac{360^{\\circ}}{2} = 180^{\\circ} \\).",
            },
            {
              id: "mtl-fungsi-trigonometri-lanjutan-grafik-tka2",
              bentuk: "pg",
              level: "L2",
              question:
                "Nilai minimum dari \\( y = 2\\cos 3x - 4 \\) adalah ...",
              options: [
                { id: "A", text: "-2" },
                { id: "B", text: "-4" },
                { id: "C", text: "-6" },
                { id: "D", text: "-8" },
                { id: "E", text: "-10" },
              ],
              correctIds: ["C"],
              explanation:
                "Minimum tercapai saat \\( \\cos 3x = -1 \\): \\( y = 2(-1) - 4 = -6 \\). Secara umum minimum = \\( d - |a| \\).",
            },
            {
              id: "mtl-fungsi-trigonometri-lanjutan-grafik-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              question:
                "Perhatikan grafik \\( y = 4\\sin(2x - 60^{\\circ}) + 3 \\). Pilih semua pernyataan yang BENAR. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "Amplitudonya 4" },
                { id: "B", text: "Periodenya 120°" },
                { id: "C", text: "Nilai maksimumnya 7" },
                { id: "D", text: "Pergeseran fasenya 60° ke kanan" },
                { id: "E", text: "Nilai minimumnya -1" },
              ],
              correctIds: ["A", "C", "E"],
              explanation:
                "Periode \\( = 360^{\\circ}/2 = 180^{\\circ} \\) (B salah). Pergeseran fase \\( = -c/b = 60^{\\circ}/2 = 30^{\\circ} \\) ke kanan (D salah). Maksimum \\( 3 + 4 = 7 \\) dan minimum \\( 3 - 4 = -1 \\).",
            },
            {
              id: "mtl-fungsi-trigonometri-lanjutan-grafik-tka4",
              bentuk: "isian",
              level: "L1",
              question:
                "Periode fungsi \\( y = \\sin 3x \\) dalam derajat adalah ...",
              correctIds: ["120", "120°", "120 derajat"],
              explanation:
                "\\( T = \\dfrac{360^{\\circ}}{|3|} = 120^{\\circ} \\).",
            },
          ],
        },
      ],
    },
    {
      id: "mtl-kalkulus-lanjut",
      title: "Kalkulus Lanjut (Integral/Turunan Lanjutan)",
      order: 4,
      subtopics: [
        {
          id: "mtl-kalkulus-lanjut-turunan-trigonometri",
          title: "Turunan Fungsi Trigonometri",
          estimatedMinutes: 90,
          materi: {
            ringkasan:
              "Turunan fungsi trigonometri mengikuti pola siklus yang tetap dan digabungkan dengan aturan rantai, aturan perkalian, serta aturan pembagian untuk fungsi yang lebih kompleks. Penguasaan pola dasar memungkinkan penyelesaian soal turunan trigonometri secara cepat dan akurat.",
            rumus: [
              "\\( \\dfrac{d}{dx}\\sin x = \\cos x \\) dan \\( \\dfrac{d}{dx}\\cos x = -\\sin x \\)",
              "\\( \\dfrac{d}{dx}\\tan x = \\sec^{2}x \\) dan \\( \\dfrac{d}{dx}\\cot x = -\\csc^{2}x \\)",
              "\\( \\dfrac{d}{dx}\\sec x = \\sec x\\tan x \\) dan \\( \\dfrac{d}{dx}\\csc x = -\\csc x\\cot x \\)",
              "Aturan rantai: \\( \\dfrac{d}{dx}\\sin(u) = \\cos(u) \\cdot u' \\)",
              "Aturan perkalian: \\( (uv)' = u'v + uv' \\)",
              "Aturan pembagian: \\( \\left(\\dfrac{u}{v}\\right)' = \\dfrac{u'v - uv'}{v^{2}} \\)",
              "Nilai stasioner: \\( f'(x) = 0 \\); jenisnya diuji dengan \\( f''(x) \\)",
            ],
            contoh: [
              {
                soal: "Tentukan turunan \\( f(x) = \\sin(3x) \\).",
                pembahasan:
                  "Gunakan aturan rantai: \\( f'(x) = \\cos(3x) \\cdot 3 = 3\\cos(3x) \\).",
              },
              {
                soal: "Tentukan turunan \\( f(x) = x^{2}\\sin x \\).",
                pembahasan:
                  "Aturan perkalian: \\( f'(x) = 2x\\sin x + x^{2}\\cos x \\).",
              },
            ],
          },
          flashcards: [
            {
              id: "mtl-kalkulus-lanjut-turunan-trigonometri-fc1",
              front: "Turunan \\( \\sin^{2}x \\)?",
              back: "\\( 2\\sin x\\cos x = \\sin 2x \\), diperoleh dengan aturan rantai pada fungsi pangkat.",
            },
            {
              id: "mtl-kalkulus-lanjut-turunan-trigonometri-fc2",
              front: "Mengapa tanda turunan kosinus negatif?",
              back: "Karena gradien grafik kosinus menurun pada kuadran pertama, sehingga laju perubahannya bernilai negatif di sana.",
            },
            {
              id: "mtl-kalkulus-lanjut-turunan-trigonometri-fc3",
              front: "Turunan \\( \\tan x \\) dan mengapa bukan \\( \\sec x \\) saja?",
              back: "\\( \\dfrac{d}{dx}\\tan x = \\sec^{2}x \\), karena hasil turunan \\( \\sin x/\\cos x \\) melalui aturan pembagian menghasilkan \\( \\dfrac{\\cos^{2}x + \\sin^{2}x}{\\cos^{2}x} = \\sec^{2}x \\).",
            },
            {
              id: "mtl-kalkulus-lanjut-turunan-trigonometri-fc4",
              front: "Langkah pertama menurunkan \\( \\sin(5x^{2}) \\)?",
              back: "Terapkan aturan rantai: turunkan sinus menjadi kosinus, lalu kalikan dengan turunan dalamnya, yaitu \\( 10x \\); hasilnya \\( 10x\\cos(5x^{2}) \\).",
            },
          ],
          quiz: [
            {
              id: "mtl-kalkulus-lanjut-turunan-trigonometri-q1",
              question: "Turunan dari \\( f(x) = \\cos(4x) \\) adalah ...",
              options: [
                "\\( -4\\sin(4x) \\)",
                "\\( 4\\sin(4x) \\)",
                "\\( -\\sin(4x) \\)",
                "\\( -4\\cos(4x) \\)",
              ],
              correctIndex: 0,
              explanation:
                "Aturan rantai memberi \\( -\\sin(4x) \\cdot 4 = -4\\sin(4x) \\).",
            },
            {
              id: "mtl-kalkulus-lanjut-turunan-trigonometri-q2",
              question: "Turunan dari \\( f(x) = x\\cos x \\) adalah ...",
              options: [
                "\\( \\cos x - x\\sin x \\)",
                "\\( \\cos x + x\\sin x \\)",
                "\\( -\\sin x \\)",
                "\\( x\\sin x - \\cos x \\)",
              ],
              correctIndex: 0,
              explanation:
                "Aturan perkalian: \\( (1)\\cos x + x(-\\sin x) = \\cos x - x\\sin x \\).",
            },
            {
              id: "mtl-kalkulus-lanjut-turunan-trigonometri-q3",
              question: "Turunan dari \\( f(x) = \\tan(2x) \\) adalah ...",
              options: [
                "\\( 2\\sec^{2}(2x) \\)",
                "\\( \\sec^{2}(2x) \\)",
                "\\( 2\\sec(2x)\\tan(2x) \\)",
                "\\( -2\\csc^{2}(2x) \\)",
              ],
              correctIndex: 0,
              explanation:
                "Aturan rantai: \\( \\sec^{2}(2x) \\cdot 2 = 2\\sec^{2}(2x) \\).",
            },
            {
              id: "mtl-kalkulus-lanjut-turunan-trigonometri-q4",
              question:
                "Gradien garis singgung \\( f(x) = \\sin x + \\cos x \\) di \\( x = 0 \\) adalah ...",
              options: ["-1", "0", "1", "2"],
              correctIndex: 2,
              explanation:
                "\\( f'(x) = \\cos x - \\sin x \\), sehingga \\( f'(0) = 1 - 0 = 1 \\).",
            },
          ],
          latihanSoal: [
            {
              id: "mtl-kalkulus-lanjut-turunan-trigonometri-l1",
              level: "hots",
              question:
                "Simpangan sebuah bandul kecil dimodelkan \\( \\theta(t) = 0{,}3\\sin(4\\pi t) \\) radian, dengan \\( t \\) dalam detik. (a) Tentukan kecepatan sudut \\( \\theta'(t) \\). (b) Tentukan kecepatan sudut maksimum dan kapan pertama kali tercapai. (c) Tentukan percepatan sudut \\( \\theta''(t) \\). (d) Jelaskan makna fisis tanda negatif pada percepatan sudut.",
              langkah: [
                "Turunkan fungsi simpangan: \\( \\theta'(t) = 0{,}3\\cos(4\\pi t) \\cdot 4\\pi = 1{,}2\\pi\\cos(4\\pi t) \\).",
                "Kecepatan sudut maksimum terjadi saat kosinus bernilai 1, yaitu \\( 1{,}2\\pi \\approx 3{,}77 \\) radian per detik.",
                "Waktu tercapainya: \\( 4\\pi t = 0 \\Rightarrow t = 0 \\) detik.",
                "Turunkan sekali lagi: \\( \\theta''(t) = -1{,}2\\pi\\sin(4\\pi t) \\cdot 4\\pi = -4{,}8\\pi^{2}\\sin(4\\pi t) \\).",
                "Periksa periode: \\( T = \\dfrac{2\\pi}{4\\pi} = 0{,}5 \\) detik, sehingga bandul berayun dua kali per detik.",
                "Makna fisis: tanda negatif pada percepatan sudut menunjukkan bahwa percepatan selalu berlawanan arah dengan simpangan, yang merupakan ciri gerak harmonik pemulih.",
                "Verifikasi konsistensi: saat \\( \\theta > 0 \\) (bandul di kanan), \\( \\sin(4\\pi t) > 0 \\) sehingga percepatannya negatif, artinya bandul ditarik kembali ke posisi setimbang.",
                "Simpulkan: model ini sesuai dengan hukum pemulihan gerak harmonik sederhana.",
              ],
              jawaban:
                "(a) \\( \\theta'(t) = 1{,}2\\pi\\cos(4\\pi t) \\) radian per detik (b) Maksimum \\( 1{,}2\\pi \\approx 3{,}77 \\) rad/s, pertama tercapai pada \\( t = 0 \\) detik (c) \\( \\theta''(t) = -4{,}8\\pi^{2}\\sin(4\\pi t) \\) (d) Tanda negatif menunjukkan percepatan selalu berlawanan arah simpangan, yaitu ciri gaya pemulih pada gerak harmonik sederhana.",
            },
            {
              id: "mtl-kalkulus-lanjut-turunan-trigonometri-l2",
              level: "sulit",
              question:
                "Diberikan \\( f(x) = \\sin x\\cos x \\). (a) Tentukan \\( f'(x) \\) menggunakan aturan perkalian. (b) Sederhanakan hasilnya memakai identitas sudut ganda. (c) Tentukan semua titik stasioner pada rentang \\( 0 \\le x \\le 2\\pi \\). (d) Tentukan nilai maksimum dan minimum fungsinya.",
              langkah: [
                "Terapkan aturan perkalian: \\( f'(x) = \\cos x \\cdot \\cos x + \\sin x \\cdot (-\\sin x) = \\cos^{2}x - \\sin^{2}x \\).",
                "Sederhanakan dengan identitas sudut ganda: \\( f'(x) = \\cos 2x \\).",
                "Alternatif penyederhanaan: \\( f(x) = \\tfrac{1}{2}\\sin 2x \\), sehingga \\( f'(x) = \\cos 2x \\). Konsisten.",
                "Cari titik stasioner: \\( \\cos 2x = 0 \\Rightarrow 2x = \\dfrac{\\pi}{2} + k\\pi \\Rightarrow x = \\dfrac{\\pi}{4} + \\dfrac{k\\pi}{2} \\).",
                "Pada rentang \\( 0 \\le x \\le 2\\pi \\): \\( x = \\dfrac{\\pi}{4}, \\dfrac{3\\pi}{4}, \\dfrac{5\\pi}{4}, \\dfrac{7\\pi}{4} \\).",
                "Uji jenis dengan \\( f''(x) = -2\\sin 2x \\): pada \\( x = \\dfrac{\\pi}{4} \\), \\( f'' = -2\\sin\\dfrac{\\pi}{2} = -2 < 0 \\), sehingga maksimum lokal.",
                "Hitung nilai: \\( f\\left(\\dfrac{\\pi}{4}\\right) = \\tfrac{1}{2}\\sin\\dfrac{\\pi}{2} = \\tfrac{1}{2} \\) dan \\( f\\left(\\dfrac{5\\pi}{4}\\right) = \\tfrac{1}{2}\\sin\\dfrac{5\\pi}{2} = \\tfrac{1}{2} \\).",
                "Hitung nilai minimum: \\( f\\left(\\dfrac{3\\pi}{4}\\right) = \\tfrac{1}{2}\\sin\\dfrac{3\\pi}{2} = -\\tfrac{1}{2} \\) dan \\( f\\left(\\dfrac{7\\pi}{4}\\right) = -\\tfrac{1}{2} \\).",
                "Simpulkan: nilai maksimum \\( \\tfrac{1}{2} \\) dan minimum \\( -\\tfrac{1}{2} \\), keduanya tercapai dua kali dalam satu periode karena \\( f \\) periodik dengan periode \\( \\pi \\).",
              ],
              jawaban:
                "(a) \\( f'(x) = \\cos^{2}x - \\sin^{2}x \\) (b) \\( f'(x) = \\cos 2x \\) (c) Titik stasioner di \\( x = \\dfrac{\\pi}{4}, \\dfrac{3\\pi}{4}, \\dfrac{5\\pi}{4}, \\dfrac{7\\pi}{4} \\) (d) Nilai maksimum \\( \\tfrac{1}{2} \\) dan minimum \\( -\\tfrac{1}{2} \\).",
            },
          ],
          tkaSoal: [
            {
              id: "mtl-kalkulus-lanjut-turunan-trigonometri-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Turunan pertama dari \\( f(x) = \\tan x \\) adalah ...",
              options: [
                { id: "A", text: "\\( \\sec x \\)" },
                { id: "B", text: "\\( \\sec^{2} x \\)" },
                { id: "C", text: "\\( -\\csc^{2} x \\)" },
                { id: "D", text: "\\( \\sec x \\tan x \\)" },
                { id: "E", text: "\\( \\cot x \\)" },
              ],
              correctIds: ["B"],
              explanation:
                "\\( \\dfrac{d}{dx}\\tan x = \\sec^{2}x \\), hasil aturan pembagian pada \\( \\sin x / \\cos x \\).",
            },
            {
              id: "mtl-kalkulus-lanjut-turunan-trigonometri-tka2",
              bentuk: "pg",
              level: "L2",
              question: "Turunan dari \\( f(x) = \\sin^{2} x \\) adalah ...",
              options: [
                { id: "A", text: "\\( 2\\sin x \\)" },
                { id: "B", text: "\\( \\cos 2x \\)" },
                { id: "C", text: "\\( 2\\cos 2x \\)" },
                { id: "D", text: "\\( \\sin 2x \\)" },
                { id: "E", text: "\\( -\\sin 2x \\)" },
              ],
              correctIds: ["D"],
              explanation:
                "Aturan rantai: \\( f'(x) = 2\\sin x \\cos x \\), yang sama dengan \\( \\sin 2x \\).",
            },
            {
              id: "mtl-kalkulus-lanjut-turunan-trigonometri-tka3",
              bentuk: "pgk-mcma",
              level: "L2",
              question:
                "Pilih semua rumus turunan trigonometri yang BENAR. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "\\( \\dfrac{d}{dx}\\cos x = -\\sin x \\)" },
                { id: "B", text: "\\( \\dfrac{d}{dx}\\sec x = \\sec x \\tan x \\)" },
                { id: "C", text: "\\( \\dfrac{d}{dx}\\csc x = \\csc x \\cot x \\)" },
                { id: "D", text: "\\( \\dfrac{d}{dx}\\cot x = -\\csc^{2} x \\)" },
                { id: "E", text: "\\( \\dfrac{d}{dx}\\sin x = -\\cos x \\)" },
              ],
              correctIds: ["A", "B", "D"],
              explanation:
                "C seharusnya \\( -\\csc x \\cot x \\) (ada tanda negatif). E seharusnya \\( \\cos x \\) tanpa tanda negatif; hanya kosinus dan kosekan yang turunannya bernilai negatif.",
            },
            {
              id: "mtl-kalkulus-lanjut-turunan-trigonometri-tka4",
              bentuk: "isian",
              level: "L3",
              question:
                "Gradien kurva \\( f(x) = \\sin 5x \\) di titik dengan \\( x = 0 \\) adalah ...",
              correctIds: ["5"],
              explanation:
                "\\( f'(x) = 5\\cos 5x \\) (aturan rantai), sehingga \\( f'(0) = 5\\cos 0 = 5 \\).",
            },
          ],
        },
        {
          id: "mtl-kalkulus-lanjut-integral-tentu-aplikasi",
          title: "Integral Tentu & Aplikasi (Luas Daerah & Volume Benda Putar)",
          estimatedMinutes: 120,
          materi: {
            ringkasan:
              "Integral tentu menghitung akumulasi perubahan pada interval tertentu, dan secara geometris menyatakan luas daerah di bawah kurva. Aplikasinya meliputi penghitungan luas daerah antara dua kurva, panjang busur, serta volume benda putar dengan metode cakram atau metode kulit tabung.",
            rumus: [
              "Teorema dasar: \\( \\int_{a}^{b} f(x)\\,dx = F(b) - F(a) \\)",
              "Luas daerah di bawah kurva: \\( L = \\int_{a}^{b} f(x)\\,dx \\)",
              "Luas antara dua kurva: \\( L = \\int_{a}^{b} \\left[f(x) - g(x)\\right] dx \\) dengan \\( f(x) \\ge g(x) \\)",
              "Volume metode cakram: \\( V = \\pi\\int_{a}^{b} \\left[f(x)\\right]^{2} dx \\)",
              "Volume metode kulit tabung: \\( V = 2\\pi\\int_{a}^{b} x\\,f(x)\\,dx \\)",
              "Volume antara dua kurva: \\( V = \\pi\\int_{a}^{b} \\left(\\left[f(x)\\right]^{2} - \\left[g(x)\\right]^{2}\\right) dx \\)",
              "Sifat: \\( \\int_{a}^{b} f + \\int_{b}^{c} f = \\int_{a}^{c} f \\) dan \\( \\int_{a}^{a} f = 0 \\)",
            ],
            contoh: [
              {
                soal: "Hitung \\( \\int_{1}^{3} (2x + 1)\\,dx \\).",
                pembahasan:
                  "Antiturunan \\( = x^{2} + x \\). Evaluasi: \\( (9 + 3) - (1 + 1) = 12 - 2 = 10 \\).",
              },
              {
                soal:
                  "Tentukan volume benda putar yang terbentuk jika daerah di bawah \\( y = x \\) pada \\( 0 \\le x \\le 3 \\) diputar mengelilingi sumbu-x.",
                pembahasan:
                  "\\( V = \\pi\\int_{0}^{3} x^{2}\\,dx = \\pi\\left[\\dfrac{x^{3}}{3}\\right]_{0}^{3} = \\pi(9) = 9\\pi \\) satuan volume.",
              },
            ],
          },
          flashcards: [
            {
              id: "mtl-kalkulus-lanjut-integral-tentu-aplikasi-fc1",
              front: "Apa isi teorema dasar kalkulus?",
              back: "Integral tentu \\( \\int_{a}^{b} f(x)dx = F(b) - F(a) \\), menghubungkan integral (luas) dengan antiturunan.",
            },
            {
              id: "mtl-kalkulus-lanjut-integral-tentu-aplikasi-fc2",
              front: "Mengapa luas antara dua kurva memakai selisih fungsi?",
              back: "Karena yang dihitung adalah bagian yang terletak di antara kedua kurva, sehingga tinggi tiap potongan adalah selisih nilai fungsi atas dan fungsi bawah.",
            },
            {
              id: "mtl-kalkulus-lanjut-integral-tentu-aplikasi-fc3",
              front: "Kapan memakai metode cakram dan kapan metode kulit tabung?",
              back: "Metode cakram dipakai saat potongan tegak lurus sumbu putar; metode kulit tabung dipakai saat potongan sejajar sumbu putar, terutama untuk fungsi yang sulit diinvers.",
            },
            {
              id: "mtl-kalkulus-lanjut-integral-tentu-aplikasi-fc4",
              front: "Apa arti tanda negatif pada hasil integral tentu?",
              back: "Menandakan daerah tersebut berada di bawah sumbu-x, sehingga luasnya diambil nilai absolutnya.",
            },
          ],
          quiz: [
            {
              id: "mtl-kalkulus-lanjut-integral-tentu-aplikasi-q1",
              question: "Nilai \\( \\int_{0}^{2} 3x^{2}\\,dx \\) adalah ...",
              options: ["4", "6", "8", "12"],
              correctIndex: 2,
              explanation:
                "Antiturunan \\( x^{3} \\), dievaluasi dari 0 sampai 2 memberi \\( 8 - 0 = 8 \\).",
            },
            {
              id: "mtl-kalkulus-lanjut-integral-tentu-aplikasi-q2",
              question: "Luas daerah antara \\( y = x \\) dan \\( y = x^{2} \\) pada \\( 0 \\le x \\le 1 \\) adalah ...",
              options: ["\\( \\tfrac{1}{6} \\)", "\\( \\tfrac{1}{3} \\)", "\\( \\tfrac{1}{2} \\)", "\\( \\tfrac{2}{3} \\)"],
              correctIndex: 0,
              explanation:
                "\\( L = \\int_{0}^{1}(x - x^{2})dx = \\left[\\tfrac{x^{2}}{2} - \\tfrac{x^{3}}{3}\\right]_{0}^{1} = \\tfrac{1}{2} - \\tfrac{1}{3} = \\tfrac{1}{6} \\).",
            },
            {
              id: "mtl-kalkulus-lanjut-integral-tentu-aplikasi-q3",
              question:
                "Volume benda putar dari \\( y = x \\) pada \\( 0 \\le x \\le 2 \\) diputar terhadap sumbu-x adalah ...",
              options: [
                "\\( \\dfrac{4\\pi}{3} \\)",
                "\\( \\dfrac{8\\pi}{3} \\)",
                "\\( 4\\pi \\)",
                "\\( 8\\pi \\)",
              ],
              correctIndex: 1,
              explanation:
                "\\( V = \\pi\\int_{0}^{2}x^{2}dx = \\pi\\left[\\dfrac{x^{3}}{3}\\right]_{0}^{2} = \\dfrac{8\\pi}{3} \\).",
            },
            {
              id: "mtl-kalkulus-lanjut-integral-tentu-aplikasi-q4",
              question: "Nilai \\( \\int_{-1}^{1} x^{3}\\,dx \\) adalah ...",
              options: ["-1", "0", "\\( \\tfrac{1}{2} \\)", "1"],
              correctIndex: 1,
              explanation:
                "Antiturunan \\( \\dfrac{x^{4}}{4} \\) memberi \\( \\tfrac{1}{4} - \\tfrac{1}{4} = 0 \\), karena fungsi ganjil yang simetris terhadap titik asal.",
            },
          ],
          latihanSoal: [
            {
              id: "mtl-kalkulus-lanjut-integral-tentu-aplikasi-l1",
              level: "hots",
              question:
                "Sebuah wadah air berbentuk benda putar terbentuk dari memutar daerah yang dibatasi \\( y = \\sqrt{x} \\), sumbu-x, dan garis \\( x = 9 \\) mengelilingi sumbu-x (satuan dalam desimeter). (a) Susun integral volume wadah tersebut. (b) Hitung volumenya. (c) Jika wadah diisi air sampai ketinggian 2 desimeter dari dasar, tentukan volume airnya. (d) Jelaskan mengapa volume air pada (c) jauh lebih kecil dibanding (b).",
              langkah: [
                "Gunakan metode cakram: \\( V = \\pi\\int_{0}^{9} \\left(\\sqrt{x}\\right)^{2} dx \\).",
                "Sederhanakan integran: \\( \\left(\\sqrt{x}\\right)^{2} = x \\), sehingga \\( V = \\pi\\int_{0}^{9} x\\,dx \\).",
                "Hitung integral: \\( \\pi\\left[\\dfrac{x^{2}}{2}\\right]_{0}^{9} = \\pi \\cdot \\dfrac{81}{2} = 40{,}5\\pi \\approx 127{,}23 \\) desimeter kubik.",
                "Untuk ketinggian air 2 desimeter, batas atas integrasi menjadi \\( x = 2 \\) karena sumbu putarnya horizontal dan tinggi diukur pada arah-x.",
                "Hitung volume air: \\( V_{air} = \\pi\\int_{0}^{2} x\\,dx = \\pi\\left[\\dfrac{x^{2}}{2}\\right]_{0}^{2} = 2\\pi \\approx 6{,}28 \\) desimeter kubik.",
                "Bandingkan: \\( 2\\pi \\) jauh lebih kecil dari \\( 40{,}5\\pi \\) karena bentuk wadah melebar pada bagian atas.",
                "Jelaskan alasan geometris: fungsi \\( y = \\sqrt{x} \\) tumbuh melambat, tetapi volume bergantung pada kuadrat jari-jari, sehingga kontribusi bagian ujung wadah sangat besar.",
                "Nyatakan kesimpulan praktis: menambah tinggi air dari 2 dm ke 9 dm menambah volume lebih dari 20 kali lipat.",
              ],
              jawaban:
                "(a) \\( V = \\pi\\int_{0}^{9} x\\,dx \\) (b) \\( V = 40{,}5\\pi \\approx 127{,}23 \\) dm kubik (c) \\( V_{air} = 2\\pi \\approx 6{,}28 \\) dm kubik (d) Karena volume bergantung pada kuadrat jari-jari, sehingga bagian wadah yang lebih lebar menyumbang volume jauh lebih besar.",
            },
            {
              id: "mtl-kalkulus-lanjut-integral-tentu-aplikasi-l2",
              level: "sulit",
              question:
                "Diberikan dua kurva \\( f(x) = x^{2} \\) dan \\( g(x) = 2x \\). (a) Tentukan titik potong kedua kurva. (b) Hitung luas daerah yang dibatasi kedua kurva. (c) Tentukan volume benda putar jika daerah itu diputar mengelilingi sumbu-x. (d) Jelaskan mengapa volume pada (c) tidak dapat dihitung dengan menjumlahkan volume masing-masing kurva secara terpisah.",
              langkah: [
                "Cari titik potong: \\( x^{2} = 2x \\Rightarrow x^{2} - 2x = 0 \\Rightarrow x(x - 2) = 0 \\), sehingga \\( x = 0 \\) dan \\( x = 2 \\).",
                "Tentukan kurva atas: pada \\( x = 1 \\), \\( g(1) = 2 \\) dan \\( f(1) = 1 \\), sehingga \\( g(x) \\ge f(x) \\) pada interval itu.",
                "Hitung luas: \\( L = \\int_{0}^{2}(2x - x^{2})dx = \\left[x^{2} - \\dfrac{x^{3}}{3}\\right]_{0}^{2} = \\left(4 - \\dfrac{8}{3}\\right) = \\dfrac{4}{3} \\) satuan luas.",
                "Susun volume dengan metode cakram berselisih: \\( V = \\pi\\int_{0}^{2}\\left[(2x)^{2} - (x^{2})^{2}\\right]dx \\).",
                "Sederhanakan integran: \\( 4x^{2} - x^{4} \\), sehingga \\( V = \\pi\\int_{0}^{2}(4x^{2} - x^{4})dx \\).",
                "Hitung integral: \\( \\pi\\left[\\dfrac{4x^{3}}{3} - \\dfrac{x^{5}}{5}\\right]_{0}^{2} = \\pi\\left(\\dfrac{32}{3} - \\dfrac{32}{5}\\right) \\).",
                "Samakan penyebut: \\( \\pi\\left(\\dfrac{160 - 96}{15}\\right) = \\dfrac{64\\pi}{15} \\approx 13{,}40 \\) satuan volume.",
                "Jelaskan kesalahan umum: menjumlahkan volume kedua kurva secara terpisah justru menghitung dua benda pejal penuh, bukan selisih rongga, sehingga hasilnya terlalu besar dan tidak bermakna secara geometris.",
              ],
              jawaban:
                "(a) Titik potong di \\( x = 0 \\) dan \\( x = 2 \\) (b) \\( L = \\dfrac{4}{3} \\) satuan luas (c) \\( V = \\dfrac{64\\pi}{15} \\approx 13{,}40 \\) satuan volume (d) Karena metode cakram berselisih menghitung rongga di antara dua permukaan putar, bukan dua benda pejal terpisah, sehingga volumenya harus dikurangkan sebagai selisih kuadrat jari-jari.",
            },
          ],
          tkaSoal: [
            {
              id: "mtl-kalkulus-lanjut-integral-tentu-aplikasi-tka1",
              bentuk: "pg",
              level: "L2",
              question: "Nilai \\( \\int_{1}^{2} (x^{2} + 1)\\,dx \\) adalah ...",
              options: [
                { id: "A", text: "\\( \\dfrac{7}{3} \\)" },
                { id: "B", text: "\\( \\dfrac{10}{3} \\)" },
                { id: "C", text: "\\( \\dfrac{14}{3} \\)" },
                { id: "D", text: "4" },
                { id: "E", text: "5" },
              ],
              correctIds: ["B"],
              explanation:
                "Antiturunan \\( F(x) = \\dfrac{x^{3}}{3} + x \\). \\( F(2) - F(1) = \\left(\\dfrac{8}{3} + 2\\right) - \\left(\\dfrac{1}{3} + 1\\right) = \\dfrac{14}{3} - \\dfrac{4}{3} = \\dfrac{10}{3} \\).",
            },
            {
              id: "mtl-kalkulus-lanjut-integral-tentu-aplikasi-tka2",
              bentuk: "pg",
              level: "L3",
              question:
                "Daerah di bawah \\( y = 2x \\) pada \\( 0 \\le x \\le 1 \\) diputar terhadap sumbu-x. Volume benda putarnya adalah ...",
              options: [
                { id: "A", text: "\\( \\dfrac{2\\pi}{3} \\)" },
                { id: "B", text: "\\( \\pi \\)" },
                { id: "C", text: "\\( \\dfrac{4\\pi}{3} \\)" },
                { id: "D", text: "\\( 2\\pi \\)" },
                { id: "E", text: "\\( \\dfrac{8\\pi}{3} \\)" },
              ],
              correctIds: ["C"],
              explanation:
                "Metode cakram: \\( V = \\pi\\int_{0}^{1} (2x)^{2}\\,dx = \\pi\\left[\\dfrac{4x^{3}}{3}\\right]_{0}^{1} = \\dfrac{4\\pi}{3} \\).",
            },
            {
              id: "mtl-kalkulus-lanjut-integral-tentu-aplikasi-tka3",
              bentuk: "pgk-mcma",
              level: "L2",
              question:
                "Pilih semua pernyataan yang BENAR tentang integral tentu dan aplikasinya. Jawaban benar lebih dari satu.",
              options: [
                { id: "A", text: "\\( \\int_{a}^{a} f(x)\\,dx = 0 \\) untuk fungsi apa pun" },
                { id: "B", text: "\\( \\int_{a}^{b} f\\,dx + \\int_{b}^{c} f\\,dx = \\int_{a}^{c} f\\,dx \\)" },
                { id: "C", text: "Luas daerah antara dua kurva dihitung dengan \\( \\int [f(x) + g(x)]\\,dx \\)" },
                { id: "D", text: "Volume benda putar metode cakram: \\( V = \\pi\\int_{a}^{b} [f(x)]^{2}\\,dx \\)" },
                { id: "E", text: "Integral tentu selalu bernilai positif" },
              ],
              correctIds: ["A", "B", "D"],
              explanation:
                "C salah karena luas antara dua kurva memakai SELISIH fungsi, \\( \\int [f(x) - g(x)]\\,dx \\). E salah karena integral tentu bisa negatif bila daerah berada di bawah sumbu-x.",
            },
            {
              id: "mtl-kalkulus-lanjut-integral-tentu-aplikasi-tka4",
              bentuk: "isian",
              level: "L1",
              question: "Nilai \\( \\int_{0}^{1} 6x^{2}\\,dx \\) adalah ...",
              correctIds: ["2"],
              explanation:
                "Antiturunan \\( 2x^{3} \\), sehingga \\( \\left[2x^{3}\\right]_{0}^{1} = 2 - 0 = 2 \\).",
            },
          ],
        },
      ],
    },
  ],
};

/* ==================================================================
 * 5. BAHASA INGGRIS TINGKAT LANJUT
 * ================================================================*/

const BAHASA_INGGRIS_TINGKAT_LANJUT: Subject = {
  id: "bahasa-inggris-tingkat-lanjut",
  title: "Bahasa Inggris Tingkat Lanjut",
  shortTitle: "B. Inggris Lanjut",
  icon: "🎓",
  accent: "emerald",
  description: "Membaca kritis dan menulis akademik tingkat lanjut.",
  chapters: [
    {
      id: "bitl-advanced-critical-reading",
      title: "Advanced Critical Reading",
      order: 1,
      subtopics: [
        {
          id: "bitl-advanced-critical-reading-rhetorical-strategies",
          title: "Identifying Rhetorical Strategies",
          estimatedMinutes: 60,
          materi: {
            ringkasan:
              "Rhetorical strategies are the techniques writers use to persuade readers: appeals to logic (logos), emotion (pathos), and credibility (ethos), supported by rhetorical devices such as repetition, rhetorical questions, and analogy. Identifying these strategies lets you evaluate how a text tries to influence you rather than merely what it claims.",
            rumus: [
              "Ethos: appeals to authority, credibility, and character (expert testimony, credentials, fair treatment of opponents)",
              "Pathos: appeals to emotion (vivid imagery, personal stories, emotionally loaded vocabulary)",
              "Logos: appeals to reason (statistics, causal reasoning, structured argument, definitions)",
              "Repetition and parallelism: repeating structures to make a claim memorable",
              "Rhetorical question: a question asked for effect, not for information",
              "Analogy and metaphor: explaining an unfamiliar idea through a familiar one",
            ],
            contoh: [
              {
                soal:
                  "Identify the strategy: 'How long must parents wait before the government finally protects their children's classrooms?'",
                pembahasan:
                  "This is a rhetorical question combined with pathos: it appeals to parental concern and pressures the reader emotionally rather than offering data.",
              },
              {
                soal:
                  "Identify the strategy: 'According to a 2023 study in the Journal of Public Health, districts with free school meals saw a 17 percent drop in child malnutrition.'",
                pembahasan:
                  "This is logos supported by ethos: it uses verifiable statistics from a credible source to build a rational argument.",
              },
            ],
          },
          flashcards: [
            {
              id: "bitl-advanced-critical-reading-rhetorical-strategies-fc1",
              front: "What are the three classical rhetorical appeals?",
              back: "Ethos (credibility), pathos (emotion), and logos (logic) — most persuasive texts combine all three.",
            },
            {
              id: "bitl-advanced-critical-reading-rhetorical-strategies-fc2",
              front: "Why is a rhetorical question effective?",
              back: "It invites readers to supply the answer themselves, which makes the implied claim feel like the reader's own conclusion.",
            },
            {
              id: "bitl-advanced-critical-reading-rhetorical-strategies-fc3",
              front: "How does parallelism work as a rhetorical device?",
              back: "By repeating a grammatical structure, it creates rhythm and emphasis that make the paired ideas easier to remember and harder to ignore.",
            },
            {
              id: "bitl-advanced-critical-reading-rhetorical-strategies-fc4",
              front: "How can you tell ethos is being used?",
              back: "The writer cites credentials, quotes recognised experts, acknowledges opposing views fairly, or establishes shared values with the audience.",
            },
          ],
          quiz: [
            {
              id: "bitl-advanced-critical-reading-rhetorical-strategies-q1",
              question:
                "'We have tried waiting. We have tried asking. We have tried compromising. Now we must act.' The main rhetorical device is ...",
              options: ["Analogy", "Parallelism and repetition", "Statistical evidence", "Understatement"],
              correctIndex: 1,
              explanation:
                "The repeated 'We have tried...' structure is parallelism reinforced by repetition, building momentum toward the final call to action.",
            },
            {
              id: "bitl-advanced-critical-reading-rhetorical-strategies-q2",
              question:
                "'As a paediatrician with twenty years of experience, I have seen what untreated asthma does to a child.' This primarily appeals to ...",
              options: ["Logos only", "Ethos supported by pathos", "Pathos only", "Neither ethos nor pathos"],
              correctIndex: 1,
              explanation:
                "The medical credentials establish ethos, while the image of a suffering child adds pathos.",
            },
            {
              id: "bitl-advanced-critical-reading-rhetorical-strategies-q3",
              question: "A rhetorical question is best described as ...",
              options: [
                "A question the writer genuinely cannot answer",
                "A question asked for persuasive effect rather than information",
                "A question used only in academic writing",
                "A question that always requires statistical support",
              ],
              correctIndex: 1,
              explanation:
                "Rhetorical questions are used to prompt reflection or agreement, and the writer usually expects no direct answer.",
            },
            {
              id: "bitl-advanced-critical-reading-rhetorical-strategies-q4",
              question:
                "'Cutting the arts budget to fund sports is like removing a building's foundation to repaint its roof.' This is an example of ...",
              options: ["Analogy", "Hyperbole", "Understatement", "Irony"],
              correctIndex: 0,
              explanation:
                "The sentence explains one policy decision through a familiar structural comparison, which is the defining feature of analogy.",
            },
          ],
          latihanSoal: [
            {
              id: "bitl-advanced-critical-reading-rhetorical-strategies-l1",
              level: "hots",
              question:
                "Analyse the rhetorical strategies in this passage: 'Every year, thousands of students drop out because they cannot afford transport. As a teacher of eighteen years, I have watched brilliant minds fade from my classroom. We have petitioned. We have protested. We have waited. Is it not time for a subsidised transport scheme? Districts that introduced such schemes saw dropout rates fall by 23 percent.' (a) Identify every appeal to ethos, pathos, and logos. (b) Identify two rhetorical devices. (c) Evaluate which appeal is strongest and why. (d) Suggest how to strengthen the weakest appeal.",
              langkah: [
                "Identify ethos: the phrase 'as a teacher of eighteen years' establishes experience and credibility.",
                "Identify pathos: 'brilliant minds fade from my classroom' uses emotional imagery of wasted potential.",
                "Identify logos: the statistic that dropout rates fell by 23 percent in districts with such schemes.",
                "Identify device 1: parallelism and repetition in 'We have petitioned. We have protested. We have waited.'",
                "Identify device 2: the rhetorical question 'Is it not time for a subsidised transport scheme?'",
                "Evaluate the strongest appeal: logos is strongest because the 23 percent figure is concrete and comparable, whereas pathos persuades only readers who already share the concern.",
                "Note a weakness: the statistic lacks a source and timeframe, so its credibility is limited.",
                "Suggest strengthening: cite the source and year of the study, and add cost-benefit data to reinforce logos.",
              ],
              jawaban:
                "(a) Ethos: eighteen years of teaching experience; pathos: 'brilliant minds fade from my classroom'; logos: the 23 percent drop in dropout rates (b) Parallelism and repetition plus a rhetorical question (c) Logos is strongest because the statistic is concrete and verifiable, while pathos works only on already-sympathetic readers (d) Strengthen logos by citing the source and year of the study and adding cost-benefit figures.",
            },
            {
              id: "bitl-advanced-critical-reading-rhetorical-strategies-l2",
              level: "sulit",
              question:
                "Two editorials address the same issue of remote-work policy. Editorial A: 'Remote work is destroying company culture. How can trust survive without shared coffee breaks?' Editorial B: 'Analysis of 340 firms shows hybrid teams maintained productivity parity, with retention improving by 8 percent, though informal mentoring declined.' (a) Compare the dominant appeals of each editorial. (b) Identify the rhetorical devices in A. (c) Explain which editorial is harder to refute and why. (d) Explain what a writer of Editorial B could add to strengthen ethos.",
              langkah: [
                "Analyse A: it relies on pathos through the emotive claim about destroyed culture, with no data.",
                "Identify A's devices: the rhetorical question invites readers to agree, and 'destroying' is emotionally loaded hyperbole.",
                "Analyse B: it relies on logos through quantified findings from a sample of 340 firms.",
                "Note B's balance: it also acknowledges a negative finding, namely the decline in informal mentoring, which suggests fairness.",
                "Compare refutability: B is harder to refute because its claims are specific and testable, so a critic must challenge the data rather than the sentiment.",
                "Explain A's weakness: because it offers no measurement of culture, opponents can simply state a contrary anecdote.",
                "Suggest strengthening ethos for B: identify the research institution, describe the methodology, and note whether the study was peer-reviewed.",
                "Conclude: combining quantified evidence with transparent methodology makes an argument both harder to dismiss and more credible.",
              ],
              jawaban:
                "(a) A is dominated by pathos, while B is dominated by logos (b) A uses a rhetorical question and emotionally loaded wording such as 'destroying' (c) B is harder to refute because its claims are specific and testable (d) B could name the research institution, describe the methodology, and state whether the study was peer-reviewed.",
            },
          ],
          tkaSoal: [
            {
              id: "bitl-advanced-critical-reading-rhetorical-strategies-tka1",
              bentuk: "pg",
              level: "L1",
              question:
                "Which rhetorical appeal relies primarily on the speaker's credibility, experience, or character?",
              options: [
                { id: "A", text: "Logos" },
                { id: "B", text: "Pathos" },
                { id: "C", text: "Ethos" },
                { id: "D", text: "Kairos" },
                { id: "E", text: "Bathos" },
              ],
              correctIds: ["C"],
              explanation:
                "Ethos is the appeal to credibility and character. Logos appeals to logic and evidence, pathos to emotion, kairos to timing, and bathos is a lapse from the sublime to the trivial rather than an appeal at all.",
            },
            {
              id: "bitl-advanced-critical-reading-rhetorical-strategies-tka2",
              bentuk: "pg",
              level: "L2",
              stimulus:
                "Read the sentence: 'We have written letters. We have held rallies. We have begged the council for a year. Is it not time to act?'",
              question:
                "Which rhetorical device is most prominently used in the underlined structure?",
              options: [
                { id: "A", text: "Anaphora through repeated parallel clauses" },
                { id: "B", text: "Understatement in every clause" },
                { id: "C", text: "A syllogism built from three premises" },
                { id: "D", text: "Anecdotal evidence drawn from a single case" },
                { id: "E", text: "A statistical generalisation" },
              ],
              correctIds: ["A"],
              explanation:
                "The three clauses begin with the same subject and verb pattern ('We have ...'), which is anaphora combined with parallelism, and the closing question adds a rhetorical question. There is no understatement, syllogism, or data.",
            },
            {
              id: "bitl-advanced-critical-reading-rhetorical-strategies-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              stimulus:
                "Read the paragraph: 'The city council claims its new waste programme is a success. Recycling participation did rise from 41 to 63 percent in the first year, and landfill volume fell by 12 percent. Yet the programme's own report shows that 70 percent of the increase came from a single densely populated district, and six districts recorded no change at all. The council also cut the contract with the previous collector, whose employees lost their jobs.'",
              question:
                "Which statements are supported by evidence in the paragraph? There is more than one correct answer. Click on every correct answer!",
              options: [
                { id: "A", text: "Recycling participation increased by 22 percentage points." },
                { id: "B", text: "Landfill volume decreased by 12 percent." },
                { id: "C", text: "The programme succeeded equally in all districts." },
                { id: "D", text: "Most of the participation gain came from one district." },
                { id: "E", text: "The council's claim of overall success is fully substantiated by the data." },
              ],
              correctIds: ["A", "B", "D"],
              explanation:
                "Participation rose from 41 to 63 percent, a gain of 22 points (A); landfill volume fell by 12 percent (B); and 70 percent of the increase came from one district (D). C contradicts the evidence that six districts recorded no change, and E overstates the case because the growth is unevenly distributed.",
            },
            {
              id: "bitl-advanced-critical-reading-rhetorical-strategies-tka4",
              bentuk: "isian",
              level: "L3",
              stimulus:
                "Consider this sentence: 'As a nurse who has worked in emergency wards for twenty years, I can assure you that understaffing costs lives.'",
              question:
                "Name the single dominant rhetorical appeal in one word (ethos, pathos, or logos).",
              correctIds: ["ethos"],
              explanation:
                "The speaker grounds the claim in twenty years of professional experience and professional identity ('as a nurse'), which is the definition of ethos. The phrase 'costs lives' adds pathos as a secondary effect, but the dominant appeal is ethos.",
            },
          ],
        },
        {
          id: "bitl-advanced-critical-reading-evaluating-claim-counterclaim",
          title: "Evaluating Claims and Counterclaims",
          estimatedMinutes: 60,
          materi: {
            ringkasan:
              "An argument is only as strong as its ability to survive opposition. Evaluating claims means testing whether a statement is supported by adequate evidence, whether it is falsifiable, and whether the reasoning connecting evidence to conclusion holds. A counterclaim is an opposing position that a writer must either refute or concede to. Strong academic writing anticipates the strongest counterclaim, not the weakest, and addresses it honestly.",
            rumus: [
              "Claim: a statement the writer asks the reader to accept",
              "Evidence: data, testimony, or reasoning offered in support of a claim",
              "Warrant: the usually unstated assumption that links evidence to claim",
              "Counterclaim: an opposing claim that challenges the writer's position",
              "Refutation: demonstrating why a counterclaim is weak, limited, or outweighed",
              "Concession: acknowledging that a counterclaim has partial validity before narrowing its scope",
              "Test of falsifiability: if no possible observation could disprove a claim, it is not an empirical claim",
            ],
            contoh: [
              {
                soal:
                  "Claim: 'School uniforms improve discipline.' Identify the hidden warrant and a plausible counterclaim.",
                pembahasan:
                  "The hidden warrant is that discipline problems are caused by clothing choices and that uniforms remove those choices. A plausible counterclaim is that discipline is driven mainly by classroom management and family support, so schools with uniforms may already have stronger leadership, which makes the correlation spurious.",
              },
              {
                soal:
                  "A writer claims 'social media causes teen depression' based on a survey showing depressed teens use social media more. Identify the flaw.",
                pembahasan:
                  "The reasoning confuses correlation with causation and ignores reverse causation: depressed teens may retreat to social media precisely because they are already depressed. The claim also treats a diverse activity as a single causal agent.",
              },
            ],
          },
          flashcards: [
            {
              id: "bitl-advanced-critical-reading-evaluating-claim-counterclaim-fc1",
              front: "What is a warrant in an argument?",
              back: "The unstated assumption that bridges the evidence and the claim; if the warrant is false, the argument collapses even when the evidence is accurate.",
            },
            {
              id: "bitl-advanced-critical-reading-evaluating-claim-counterclaim-fc2",
              front: "What is the difference between refutation and concession?",
              back: "Refutation argues that a counterclaim is wrong or insufficient; concession admits it has some merit before limiting its scope or showing it is outweighed.",
            },
            {
              id: "bitl-advanced-critical-reading-evaluating-claim-counterclaim-fc3",
              front: "Why should a writer address the strongest counterclaim?",
              back: "Refuting only the weakest opposition is a straw-man fallacy; handling the strongest version shows the argument is genuinely robust and builds credibility.",
            },
            {
              id: "bitl-advanced-critical-reading-evaluating-claim-counterclaim-fc4",
              front: "What does it mean for a claim to be falsifiable?",
              back: "Some conceivable evidence could prove it false; claims that cannot be falsified are unfalsifiable and fall outside empirical testing.",
            },
          ],
          quiz: [
            {
              id: "bitl-advanced-critical-reading-evaluating-claim-counterclaim-q1",
              question:
                "'Test scores rose after we introduced the new app, so the app works.' The main reasoning flaw is ...",
              options: [
                "Circular reasoning",
                "Assuming correlation implies causation",
                "Appeal to authority",
                "Ad hominem attack",
              ],
              correctIndex: 1,
              explanation:
                "Other factors such as new teachers, extra study time, or an easier exam could explain the rise; no controlled comparison is offered.",
            },
            {
              id: "bitl-advanced-critical-reading-evaluating-claim-counterclaim-q2",
              question:
                "A writer who states 'Critics are right that the policy raises costs, but the health savings are three times larger' is using ...",
              options: [
                "Pure refutation",
                "Concession followed by reframing",
                "Straw-man argument",
                "Circular reasoning",
              ],
              correctIndex: 1,
              explanation:
                "The writer concedes a valid point about cost and then argues the counterclaim is outweighed by a larger benefit.",
            },
            {
              id: "bitl-advanced-critical-reading-evaluating-claim-counterclaim-q3",
              question: "The straw-man fallacy occurs when a writer ...",
              options: [
                "Cites too many statistics",
                "Distorts an opposing view into a weaker version easier to defeat",
                "Refuses to state any claim",
                "Uses emotional language",
              ],
              correctIndex: 1,
              explanation:
                "Attacking a distorted, exaggerated version of the opposition gives the illusion of refutation without engaging the real argument.",
            },
            {
              id: "bitl-advanced-critical-reading-evaluating-claim-counterclaim-q4",
              question:
                "Claim: 'This medicine works because it has been used for centuries.' The weakest link is that ...",
              options: [
                "No evidence links longevity of use to effectiveness",
                "The claim is too statistical",
                "The claim is falsifiable",
                "The claim concedes too much",
              ],
              correctIndex: 0,
              explanation:
                "Long usage is an appeal to tradition; it does not establish that the medicine is more effective than placebo or that earlier users judged accurately.",
            },
          ],
          latihanSoal: [
            {
              id: "bitl-advanced-critical-reading-evaluating-claim-counterclaim-l1",
              level: "hots",
              question:
                "Read this argument: 'Our city should ban cars from the historic centre. Pedestrian zones in three comparable cities reduced retail vacancy by 15 percent within two years. Critics claim bans hurt local business, but those critics are simply protecting their parking profits. Besides, everyone knows that walkable cities are the future.' (a) Separate the claim, evidence, and warrant. (b) Identify one logical fallacy. (c) Construct the strongest counterclaim you can. (d) Explain why addressing that counterclaim would improve the argument.",
              langkah: [
                "Identify the claim: the city should ban cars from the historic centre.",
                "Identify the evidence: pedestrian zones in three comparable cities reduced retail vacancy by 15 percent within two years.",
                "Identify the warrant: that what worked in three comparable cities will transfer to this city with similar effect.",
                "Identify the fallacy in 'those critics are simply protecting their parking profits': an ad hominem attack that dismisses motive instead of addressing the argument.",
                "Note a second weakness: 'everyone knows that walkable cities are the future' is an appeal to common belief, not evidence.",
                "Construct the strongest counterclaim: the three cities may differ in tourist volume, transport coverage, and car ownership, so the 15 percent result may not transfer; a ban may also displace rather than remove traffic and disadvantage residents with mobility needs.",
                "Explain the improvement: engaging this counterclaim would force the writer to supply transport-access data and targeted exemptions, making the proposal more credible and more implementable.",
                "Conclude: the evidence is meaningful but the transferability claim is the vulnerable joint, and the ad hominem weakens rather than strengthens the case.",
              ],
              jawaban:
                "(a) Claim: ban cars from the historic centre; evidence: 15 percent reduction in retail vacancy across three comparable cities; warrant: results in comparable cities will transfer here (b) Ad hominem attack on critics as 'protecting their parking profits' (c) The comparison cities may differ in tourist volume, transport coverage, and car dependence, so the figure may not transfer, and the ban may disadvantage residents with mobility needs (d) Addressing it would force the writer to provide transport-access data and targeted exemptions, increasing both credibility and feasibility.",
            },
            {
              id: "bitl-advanced-critical-reading-evaluating-claim-counterclaim-l2",
              level: "sulit",
              question:
                "Two students debate AI writing tools. Student A: 'AI detectors reliably identify AI text.' Student B: 'Studies show detectors falsely flag 20 percent of essays written by non-native English speakers.' Student A: 'Those studies used old detectors, so they are irrelevant.' Evaluate: (a) Is Student A's response a valid refutation? (b) What evidence would settle the dispute? (c) Where does the burden of proof lie? (d) Recommend how both students should restate their positions.",
              langkah: [
                "Assess A's response: dismissing studies solely because the tools were an earlier version is an appeal to novelty unless A shows the newer version specifically corrects the demographic bias.",
                "Distinguish the two sub-claims: that detectors work on some text, and that they work equally across writer populations; the second is what B challenges.",
                "Identify the settling evidence: a controlled benchmark on the current detector version measuring true-positive and false-positive rates separately for native and non-native writers.",
                "Identify the burden of proof: A asserts reliability, so A must supply the accuracy figures; B only undermines A's claim and therefore carries a lower burden.",
                "Note the fairness issue: a 20 percent false-positive rate for a specific group is an equity harm, not merely a technical error, so it cannot be dismissed as an implementation detail.",
                "Restate A's position: current detectors achieve high accuracy on long, formally edited native-speaker essays, but accuracy on non-native writing remains unverified.",
                "Restate B's position: detector errors are unevenly distributed, so non-native writers face a measurable false-positive risk that makes punitive use unfair without human review.",
                "Conclude: the dispute is really about which sub-claim is being defended, and both students should pre-commit to the evidence that would change their minds.",
              ],
              jawaban:
                "(a) Not valid; dismissing older studies appeals to novelty, and A offers no evidence that the bias was corrected (b) A controlled benchmark of the current detector version measuring true-positive and false-positive rates separately for native and non-native writers (c) With A, who asserts reliability, while B only undermines that claim (d) A should limit the claim to native-speaker formal essays; B should state that errors are unevenly distributed and make punitive use unfair without human review.",
            },
          ],
          tkaSoal: [
            {
              id: "bitl-advanced-critical-reading-evaluating-claim-counterclaim-tka1",
              bentuk: "pg",
              level: "L1",
              question:
                "In argument analysis, what is a counterclaim?",
              options: [
                { id: "A", text: "A restatement of the writer's thesis in different words" },
                { id: "B", text: "A claim that opposes or qualifies the writer's main claim" },
                { id: "C", text: "A piece of statistical evidence supporting the thesis" },
                { id: "D", text: "The conclusion that closes the argument" },
                { id: "E", text: "A definition of a key term used by the writer" },
              ],
              correctIds: ["B"],
              explanation:
                "A counterclaim is a claim that runs against, or places limits on, the writer's main claim. Restating the thesis is paraphrase; evidence, conclusions, and definitions serve other functions.",
            },
            {
              id: "bitl-advanced-critical-reading-evaluating-claim-counterclaim-tka2",
              bentuk: "pg",
              level: "L2",
              stimulus:
                "Read the exchange. Writer: 'Remote work should remain standard because productivity has not fallen.' Critic: 'Productivity held steady in software firms, but the study you cite excluded manufacturing and healthcare.'",
              question:
                "Which logical weakness does the critic identify?",
              options: [
                { id: "A", text: "The writer uses emotional language instead of evidence" },
                { id: "B", text: "The writer's sample is not representative of all industries" },
                { id: "C", text: "The writer contradicts an earlier claim in the same paragraph" },
                { id: "D", text: "The writer confuses correlation with causation in the opposite direction" },
                { id: "E", text: "The writer appeals to authority without naming a source" },
              ],
              correctIds: ["B"],
              explanation:
                "The critic attacks the generalisation: evidence from software firms cannot support a claim about every sector, so the sample is unrepresentative. No emotions, self-contradiction, reversed causality, or unnamed authority is at issue.",
            },
            {
              id: "bitl-advanced-critical-reading-evaluating-claim-counterclaim-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              stimulus:
                "Read the passage: 'Universities should abolish standardised admission tests. Scores correlate strongly with family income, which means the tests measure privilege rather than potential. However, several large studies find that test scores predict first-year GPA even after controlling for income, and grade inflation makes school transcripts hard to compare across schools. A fair system may therefore need tests plus contextual review, rather than tests or no tests.'",
              question:
                "Which statements correctly describe the writer's position? There is more than one correct answer. Click on every correct answer!",
              options: [
                { id: "A", text: "The writer accepts that test scores correlate with family income." },
                { id: "B", text: "The writer acknowledges evidence that scores predict academic performance." },
                { id: "C", text: "The writer concludes that tests should be removed without replacement." },
                { id: "D", text: "The writer proposes combining tests with contextual review." },
                { id: "E", text: "The writer dismisses grade inflation as irrelevant to admissions." },
              ],
              correctIds: ["A", "B", "D"],
              explanation:
                "The writer grants the income correlation (A), reports studies showing predictive validity (B), and ends with a combined solution (D). C inverts the conclusion, and E is wrong because grade inflation is used as a reason transcripts alone are insufficient.",
            },
            {
              id: "bitl-advanced-critical-reading-evaluating-claim-counterclaim-tka4",
              bentuk: "isian",
              level: "L2",
              stimulus:
                "Read the sentence: 'The proposal will cut costs. Granted, it may also reduce service quality for rural users.'",
              question:
                "Write the single word that signals a concession to an opposing point.",
              correctIds: ["granted", "granted,", "admittedly"],
              explanation:
                "'Granted' (and 'admittedly') explicitly concedes a point to the other side before the writer continues. Recognising concession markers is essential because a concession is a controlled admission, not a surrender of the thesis.",
            },
          ],
        },
        {
          id: "bitl-advanced-critical-reading-nuanced-tone-analysis",
          title: "Nuanced Tone Analysis",
          estimatedMinutes: 65,
          materi: {
            ringkasan:
              "Tone is the writer's attitude toward the subject and the audience. In advanced reading, tone is rarely a single label such as 'angry' or 'happy'; it shifts within a text and often sits in tension, producing effects such as cautious optimism, reluctant admiration, or ironic detachment. Detecting these shifts requires attention to diction, modality, punctuation, concession structure, and the gap between what is literally said and what is meant.",
            rumus: [
              "Diction: word choice signals attitude (e.g. 'scheme' vs 'initiative')",
              "Modality: modal verbs and adverbs mark certainty or doubt (must, may, arguably, allegedly, somewhat, undoubtedly)",
              "Loaded language: emotionally weighted words reveal stance without explicit judgement",
              "Irony: saying one thing while meaning the opposite, often signalled by contradiction",
              "Understatement and litotes: deliberate softening for emphasis ('not unhelpful')",
              "Concession markers: although, admittedly, while, granted indicate a mixed stance",
              "Tone shift: a change in attitude across paragraphs, often after a pivot word like however or yet",
            ],
            contoh: [
              {
                soal: "Identify the tone: 'The proposal is ambitious, and its cost estimates are, to put it generously, optimistic.'",
                pembahasan:
                  "The tone is sceptical and gently ironic. 'To put it generously' signals that the writer actually considers the estimates unrealistic, softening the criticism while making it unmistakable.",
              },
              {
                soal: "Identify the tone: 'Admittedly the trial sample was small; nevertheless, the effect size was consistent across all four sites, which is difficult to dismiss as chance.'",
                pembahasan:
                  "The tone is cautiously persuasive. The concession marker 'admittedly' shows fairness, while 'nevertheless' and 'difficult to dismiss' convey measured confidence rather than certainty.",
              },
            ],
          },
          flashcards: [
            {
              id: "bitl-advanced-critical-reading-nuanced-tone-analysis-fc1",
              front: "What is tone in a written text?",
              back: "The writer's attitude toward the subject and the audience, conveyed through diction, modality, punctuation, and structure rather than stated directly.",
            },
            {
              id: "bitl-advanced-critical-reading-nuanced-tone-analysis-fc2",
              front: "How do modal verbs reveal tone?",
              back: "They mark degrees of certainty or obligation: 'must' and 'undoubtedly' signal confidence, while 'may', 'arguably', and 'allegedly' signal caution or distance.",
            },
            {
              id: "bitl-advanced-critical-reading-nuanced-tone-analysis-fc3",
              front: "Why is tone rarely a single label in advanced texts?",
              back: "Writers often hold mixed attitudes and shift stance across paragraphs, producing composite tones such as cautious optimism or reluctant admiration.",
            },
            {
              id: "bitl-advanced-critical-reading-nuanced-tone-analysis-fc4",
              front: "What signal words often mark a tone shift?",
              back: "Contrast and concession markers such as however, yet, nevertheless, although, admittedly, and granted usually introduce a change in attitude.",
            },
          ],
          quiz: [
            {
              id: "bitl-advanced-critical-reading-nuanced-tone-analysis-q1",
              question:
                "'His report was thorough, if somewhat unimaginative.' The tone is best described as ...",
              options: [
                "Wholehearted praise",
                "Qualified praise",
                "Open contempt",
                "Neutral indifference",
              ],
              correctIndex: 1,
              explanation:
                "'Thorough' is positive, but the qualifier 'if somewhat unimaginative' limits the compliment, producing measured approval.",
            },
            {
              id: "bitl-advanced-critical-reading-nuanced-tone-analysis-q2",
              question: "The phrase 'That went about as well as expected' is an example of ...",
              options: ["Litotes", "Irony", "Hyperbole", "Euphemism"],
              correctIndex: 1,
              explanation:
                "Read literally it is neutral, but in context it usually means the outcome was poor, which is the essential structure of irony.",
            },
            {
              id: "bitl-advanced-critical-reading-nuanced-tone-analysis-q3",
              question:
                "In 'Granted, the data are incomplete; it would nevertheless be reckless to ignore the pattern,' the writer's stance is ...",
              options: [
                "Fully convinced and dismissive of the data",
                "Cautious but pressing the reader to take the pattern seriously",
                "Completely uncertain and unwilling to conclude",
                "Purely ironic",
              ],
              correctIndex: 1,
              explanation:
                "The concession 'granted' shows awareness of the limitation, while 'reckless to ignore' pushes firmly for action without claiming certainty.",
            },
            {
              id: "bitl-advanced-critical-reading-nuanced-tone-analysis-q4",
              question: "Which word pair best illustrates how diction shifts tone?",
              options: [
                "'Report' vs 'document'",
                "'Regime' vs 'government'",
                "'Walk' vs 'stroll'",
                "'Begin' vs 'commence'",
              ],
              correctIndex: 1,
              explanation:
                "'Regime' carries a negative connotation of illegitimacy, whereas 'government' is comparatively neutral, so the choice reveals the writer's attitude.",
            },
          ],
          latihanSoal: [
            {
              id: "bitl-advanced-critical-reading-nuanced-tone-analysis-l1",
              level: "hots",
              question:
                "Analyse the tone of this review: 'The museum's new wing is a triumph of engineering, if not of curation. Visitors will marvel at the soaring atrium; they may be harder pressed to find a coherent story among the exhibits. The architects, one suspects, knew exactly what they were doing. Whether the curators did is another matter.' (a) Identify the writer's overall tone and describe how it shifts. (b) Identify two devices that create the tone. (c) Explain the effect of 'one suspects'. (d) Rewrite the final two sentences in a blunt, non-ironic register and explain what is lost.",
              langkah: [
                "Identify the opening stance: 'a triumph of engineering' is sincere praise, establishing genuine admiration rather than hostility.",
                "Identify the qualification: 'if not of curation' immediately restricts the praise to one dimension, which creates a mixed rather than negative tone.",
                "Trace the shift: the second sentence moves from awe at the atrium to scepticism about the exhibits, so the tone becomes increasingly critical.",
                "Explain 'one suspects': this hedge implies the writer believes the architects acted deliberately without asserting it outright, which is polite insinuation.",
                "Identify device 1: antithesis, achieved by balancing 'triumph of engineering' against 'if not of curation'.",
                "Identify device 2: ironic understatement in 'may be harder pressed to find a coherent story', which softens a serious criticism of curation.",
                "Explain device 3: the final rhetorical pivot 'Whether the curators did is another matter' delivers the sharpest judgement through implication rather than accusation.",
                "Rewrite bluntly: 'The architecture is excellent, but the exhibits are badly organised. The architects did their job; the curators did not.'",
                "Explain what is lost: the blunt version forfeits the balanced, urbane tone, the element of wit, and the sense that the writer is a fair-minded observer rather than an outright critic, making the same content feel harsher and less credible.",
              ],
              jawaban:
                "(a) The overall tone is appreciative but critical, shifting from admiration for the architecture to scepticism about the curation (b) Antithesis ('triumph of engineering, if not of curation') and ironic understatement ('may be harder pressed to find a coherent story') (c) 'One suspects' hedges a claim the writer strongly implies, conveying polite insinuation rather than direct accusation (d) Blunt version: 'The architecture is excellent, but the exhibits are badly organised; the architects did their job and the curators did not.' Lost in the rewrite: the balanced urbane tone, the wit, and the impression of fair-mindedness, making the criticism feel harsher and less persuasive.",
            },
            {
              id: "bitl-advanced-critical-reading-nuanced-tone-analysis-l2",
              level: "sulit",
              question:
                "Three writers respond to the same failed merger. Writer 1: 'The board's judgement was sound; the market simply refused to cooperate.' Writer 2: 'One wonders what the board was thinking, though to be fair the market was hardly cooperative.' Writer 3: 'The board miscalculated badly. The market's collapse merely completed the damage.' (a) Characterise each tone precisely. (b) Explain how modality distinguishes writer 1 from writer 2. (c) Explain how writer 2's concession functions differently from writer 1's. (d) Explain which writer is most likely to persuade a sceptical reader and why.",
              langkah: [
                "Characterise writer 1: defensive and exculpatory, attributing failure entirely to external forces and absolving the board of responsibility.",
                "Characterise writer 2: wry, sceptical, and mildly ironic, blending mock-deference ('one wonders') with a genuine concession.",
                "Characterise writer 3: direct and accusatory, assigning primary responsibility to the board while acknowledging an external factor only as a secondary cause.",
                "Analyse modality in writer 1: the flat assertion 'judgement was sound' presents a contested evaluation as established fact, leaving no room for doubt.",
                "Analyse modality in writer 2: 'one wonders' and 'hardly' create distance and hedging, so the criticism is implied rather than asserted.",
                "Contrast the concessions: writer 1's reference to the market is a deflection that shifts all blame outward, whereas writer 2's 'to be fair' is a real concession that costs the writer something and therefore signals honesty.",
                "Note the rhetorical risk of writer 1: absolute certainty combined with total blame-shifting invites suspicion, because readers rarely credit a defence that admits nothing.",
                "Assess persuasiveness: writer 2 is most likely to persuade a sceptical reader, because acknowledging a genuine counter-factor establishes credibility and makes the implied criticism seem measured rather than partisan.",
                "Note writer 3's trade-off: it is the most honest about responsibility but risks alienating readers who already suspect external factors mattered, since it offers no concession.",
                "Conclude: credibility in tone analysis hinges less on strength of assertion than on the writer's apparent willingness to acknowledge inconvenient facts.",
              ],
              jawaban:
                "(a) Writer 1 is defensive and exculpatory; writer 2 is wry, sceptical, and mildly ironic; writer 3 is direct and accusatory (b) Writer 1 uses flat assertion making a contested judgement sound factual, while writer 2 hedges with 'one wonders' and 'hardly', creating distance (c) Writer 1's mention of the market is blame-shifting, but writer 2's 'to be fair' is a genuine concession that costs something and therefore signals honesty (d) Writer 2, because conceding a real counter-factor builds credibility and makes the implied criticism seem measured rather than partisan.",
            },
          ],
          tkaSoal: [
            {
              id: "bitl-advanced-critical-reading-nuanced-tone-analysis-tka1",
              bentuk: "pg",
              level: "L1",
              question:
                "Which word best describes an attitude that is sceptical but not hostile?",
              options: [
                { id: "A", text: "Furious" },
                { id: "B", text: "Dubious" },
                { id: "C", text: "Ecstatic" },
                { id: "D", text: "Indifferent" },
                { id: "E", text: "Reverent" },
              ],
              correctIds: ["B"],
              explanation:
                "'Dubious' means doubtful or sceptical without the aggression of 'furious'. 'Indifferent' means not caring, while 'ecstatic' and 'reverent' are positive and 'furious' is strongly negative.",
            },
            {
              id: "bitl-advanced-critical-reading-nuanced-tone-analysis-tka2",
              bentuk: "pg",
              level: "L2",
              stimulus:
                "Read the extract: 'The committee's report, for all its confident tables and bold headings, arrives at conclusions that the underlying data can only charitably support.'",
              question: "What is the writer's tone towards the report?",
              options: [
                { id: "A", text: "Openly admiring and enthusiastic" },
                { id: "B", text: "Politely sceptical and restrained in criticism" },
                { id: "C", text: "Completely neutral, with no evaluation" },
                { id: "D", text: "Angry and personally hostile" },
                { id: "E", text: "Confused and uncertain about the report's topic" },
              ],
              correctIds: ["B"],
              explanation:
                "The hedge 'can only charitably support' is a polite but unmistakable doubt about the data. The tone is ironic and sceptical rather than admiring, neutral, or hostile, and the writer clearly understands the topic.",
            },
            {
              id: "bitl-advanced-critical-reading-nuanced-tone-analysis-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              stimulus:
                "Read the review: 'It would be unfair to call the new transit plan a failure, since ridership did rise by four percent. It would be equally unfair to call it a triumph, since the target was fifteen percent and costs overran by a third. The plan is best described as a modest, expensive beginning that still leaves the city short of its climate commitments.'",
              question:
                "Which descriptions accurately capture the reviewer's stance? There is more than one correct answer. Click on every correct answer!",
              options: [
                { id: "A", text: "The reviewer avoids both extreme praise and extreme blame." },
                { id: "B", text: "The reviewer concedes one genuine achievement of the plan." },
                { id: "C", text: "The reviewer believes the plan should be cancelled immediately." },
                { id: "D", text: "The reviewer finds the plan insufficient relative to stated goals." },
                { id: "E", text: "The reviewer treats cost overruns as unimportant." },
              ],
              correctIds: ["A", "B", "D"],
              explanation:
                "The reviewer balances achievement against shortfall (A), grants the four percent rise (B), and judges the plan as falling short of climate commitments (D). No recommendation to cancel appears, and the cost overrun is explicitly used as a criticism, so E is wrong.",
            },
            {
              id: "bitl-advanced-critical-reading-nuanced-tone-analysis-tka4",
              bentuk: "isian",
              level: "L2",
              stimulus:
                "Read the sentence: 'One might reasonably wonder whether the ministry has fully considered the rural schools.'",
              question:
                "Write the modal verb that softens the criticism in this sentence.",
              correctIds: ["might", "might,"],
              explanation:
                "'Might' shifts the charge into a hypothetical suggestion, which is the key device of a hedged, diplomatic tone. Hedging modals (might, could, may) let a writer raise doubt without direct accusation.",
            },
          ],
        },
      ],
    },
    {
      id: "bitl-complex-grammar",
      title: "Complex Grammar for Academic Writing",
      order: 2,
      subtopics: [
        {
          id: "bitl-complex-grammar-relative-noun-clauses",
          title: "Relative and Noun Clauses",
          estimatedMinutes: 70,
          materi: {
            ringkasan:
              "Relative clauses modify nouns and let writers fold information into a single sentence instead of stacking short ones. Noun clauses function as subjects, objects, or complements and allow a whole proposition to occupy a grammatical slot. Distinguishing restrictive from non-restrictive relative clauses controls meaning; distinguishing defining from non-defining information controls both punctuation and credibility. Academic writing also requires choosing between that and which, who and whom, and deciding when reduction improves concision.",
            rumus: [
              "Restrictive relative clause: no commas, essential to identify the noun (The study that used a double-blind design...)",
              "Non-restrictive relative clause: set off by commas, adds extra information (The study, which was published in 2024,...)",
              "Relative pronouns: who (person), which (thing, non-restrictive), that (restrictive only), whose (possession), where (place), when (time)",
              "Object relative pronoun may be omitted: The theory (that) she proposed...",
              "Noun clause markers: that, whether, if, what, how, why, whoever, whatever",
              "Noun clause as subject takes singular verb agreement: What the data show is consistent.",
              "Reduced relative clause: delete pronoun and be, or change verb to participle (the results obtained, the students studying abroad)",
            ],
            contoh: [
              {
                soal:
                  "Combine: 'The researcher won an award. She published the paper. The paper challenged the dominant theory.'",
                pembahasan:
                  "The researcher who published the paper that challenged the dominant theory won an award. Both clauses are restrictive, identifying which researcher and which paper, so neither takes commas.",
              },
              {
                soal:
                  "Correct the error: 'The report which was released last week, revealed serious flaws, which the ministry had long denied.'",
                pembahasan:
                  "The sentence misuses commas around a restrictive clause. Corrected: The report that was released last week revealed serious flaws that the ministry had long denied. Both clauses identify which report and which flaws, so both are restrictive and take no commas.",
              },
              {
                soal: "Rewrite as a noun clause subject: 'The committee decided late. This surprised nobody.'",
                pembahasan:
                  "That the committee decided late surprised nobody. The noun clause 'That the committee decided late' occupies the subject slot and takes the singular verb 'surprised'.",
              },
            ],
          },
          flashcards: [
            {
              id: "bitl-complex-grammar-relative-noun-clauses-fc1",
              front: "When do you use 'that' instead of 'which'?",
              back: "Use 'that' in restrictive clauses with no commas; 'which' is often reserved for non-restrictive clauses set off by commas in academic writing.",
            },
            {
              id: "bitl-complex-grammar-relative-noun-clauses-fc2",
              front: "What does a noun clause do in a sentence?",
              back: "It performs a nominal function such as subject, object, or complement, allowing an entire proposition to fill a grammatical slot, e.g. 'What she found changed the field.'",
            },
            {
              id: "bitl-complex-grammar-relative-noun-clauses-fc3",
              front: "How do you form a reduced relative clause?",
              back: "Delete the relative pronoun and any form of 'be', or convert the verb to a participle: 'the data that were collected' becomes 'the data collected'; 'the students who study abroad' becomes 'the students studying abroad'.",
            },
            {
              id: "bitl-complex-grammar-relative-noun-clauses-fc4",
              front: "Why do commas around a relative clause matter?",
              back: "Commas signal that the clause is non-restrictive and merely adds information; removing them makes the clause restrictive and changes which noun is identified, which can reverse the intended meaning.",
            },
          ],
          quiz: [
            {
              id: "bitl-complex-grammar-relative-noun-clauses-q1",
              question: "Which sentence uses a non-restrictive relative clause correctly?",
              options: [
                "The professor that teaches statistics is on leave.",
                "My supervisor, who studied in Tokyo, recommends this method.",
                "The samples that were contaminated were discarded.",
                "The student who won the prize is absent.",
              ],
              correctIndex: 1,
              explanation:
                "The clause 'who studied in Tokyo' adds extra information about an already identified person, so it must be set off by commas.",
            },
            {
              id: "bitl-complex-grammar-relative-noun-clauses-q2",
              question: "Complete correctly: '____ the survey revealed surprised the researchers.'",
              options: ["That", "Which", "Who", "Whose"],
              correctIndex: 0,
              explanation:
                "'That' introduces a noun clause functioning as the subject, and the clause takes the singular verb 'surprised'.",
            },
            {
              id: "bitl-complex-grammar-relative-noun-clauses-q3",
              question: "What is the reduced form of 'the experiments that were conducted in 2020'?",
              options: [
                "the experiments conducting in 2020",
                "the experiments conducted in 2020",
                "the experiments which conducted in 2020",
                "the experiments are conducted in 2020",
              ],
              correctIndex: 1,
              explanation:
                "Deleting the relative pronoun and 'were' leaves the past participle 'conducted', which functions as a reduced passive relative clause.",
            },
            {
              id: "bitl-complex-grammar-relative-noun-clauses-q4",
              question: "In 'The theory (that) she proposed was rejected', the parentheses indicate that ...",
              options: [
                "the clause is non-restrictive",
                "the relative pronoun is optional because it is the object of the clause",
                "the sentence is ungrammatical without 'that'",
                "the clause functions as a noun clause",
              ],
              correctIndex: 1,
              explanation:
                "When the relative pronoun serves as the object within the clause, it can be omitted, which is common and standard in both speech and academic prose.",
            },
          ],
          latihanSoal: [
            {
              id: "bitl-complex-grammar-relative-noun-clauses-l1",
              level: "hots",
              question:
                "Edit this paragraph for clause accuracy and concision, then explain each change: 'The study looked at students. The students were enrolled in rural schools. The study which was published in a national journal, found a pattern. The pattern that it described was surprising. What surprised the researchers were the size of the gap.' (a) Combine the first three sentences into one. (b) Correct any punctuation error. (c) Fix the agreement error in the final sentence. (d) Reduce one relative clause and explain why reduction is appropriate there.",
              langkah: [
                "Combine the first three sentences using two relative clauses: The study, which was published in a national journal, looked at students who were enrolled in rural schools.",
                "Decide restrictiveness: the reference to the national journal identifies no particular study among several, so it is non-restrictive and takes commas.",
                "Correct the punctuation error in the original: 'The study which was published in a national journal, found a pattern' wrongly places one comma after the clause instead of pairing them around it.",
                "Repair the second relative clause: 'The pattern that it described was surprising' is grammatical but wordy; the pronoun 'it' is contextually clear, so it can be reduced to 'The pattern described was surprising'.",
                "Diagnose the agreement error: 'What surprised the researchers were the size of the gap' has a plural verb with a singular noun phrase in the complement.",
                "Fix the agreement by making subject and complement agree: 'What surprised the researchers was the size of the gap.'",
                "Explain the reduction choice: the reduced clause 'the pattern described' is appropriate because the omitted material (that it described) is recoverable from context and removing it improves concision without ambiguity.",
                "Review the edited paragraph for overall flow: the combined first sentence, the reduced clause, and the corrected agreement produce three economical, accurate sentences.",
              ],
              jawaban:
                "(a) The study, which was published in a national journal, looked at students who were enrolled in rural schools (b) The original comma placement was wrong: a non-restrictive clause needs commas around it, not one comma inside it (c) 'What surprised the researchers were the size of the gap' becomes 'What surprised the researchers was the size of the gap', because the noun clause subject takes a singular verb (d) 'The pattern that it described' reduces to 'the pattern described', which is appropriate because the omitted agent is recoverable from context, so concision improves without losing meaning.",
            },
            {
              id: "bitl-complex-grammar-relative-noun-clauses-l2",
              level: "sulit",
              question:
                "A journal editor flags three sentences in a manuscript: (1) 'The participants, that were recruited online, completed two tasks.' (2) 'Whether the intervention worked were unclear.' (3) 'The instrument which measured anxiety was adapted from a scale which had been validated in Japan, and the scale which the team chose had good reliability.' Explain what each error is, correct it, and then rewrite sentence 3 as a single sentence using at most two clauses, justifying what information must be kept and what may be cut.",
              langkah: [
                "Diagnose sentence 1: 'that' cannot introduce a non-restrictive clause, so the editor must either change the pronoun to 'who' or remove the commas if the clause is meant to be restrictive.",
                "Choose the interpretation: because the clause supplies supplementary recruitment information about fully identified participants, it is non-restrictive, so the fix is 'The participants, who were recruited online, completed two tasks.'",
                "Diagnose sentence 2: a noun clause subject introduced by 'whether' takes a singular verb, so 'were' must become 'was'.",
                "Correct sentence 2: 'Whether the intervention worked was unclear.'",
                "Diagnose sentence 3: the sentence chains three relative clauses, two of which repeat 'scale' and 'which', producing redundancy that slows reading without adding information.",
                "Decide what must be kept: that the anxiety instrument came from a scale validated in Japan, and that its reliability was good.",
                "Decide what may be cut: the repeated noun 'scale' and the redundant clause stating that the team chose it, because having adopted the instrument already implies the choice.",
                "Compose the single sentence with at most two clauses: 'The instrument that measured anxiety was adapted from a scale validated in Japan, and it showed good reliability.'",
                "Verify the revision: the restrictive clause 'that measured anxiety' needs no commas, the reduced clause 'validated in Japan' replaces the passive relative clause, and the coordinated second clause preserves the reliability claim.",
              ],
              jawaban:
                "(1) 'That' cannot introduce a non-restrictive clause; corrected to 'The participants, who were recruited online, completed two tasks' (2) Noun clause subject takes singular agreement: 'Whether the intervention worked was unclear' (3) The sentence redundantly chains three relative clauses; rewritten as 'The instrument that measured anxiety was adapted from a scale validated in Japan, and it showed good reliability.' Kept: the source scale validated in Japan and the good reliability. Cut: the repeated noun 'scale' and the clause about the team choosing it, since adopting the instrument already implies that choice.",
            },
          ],
          tkaSoal: [
            {
              id: "bitl-complex-grammar-relative-noun-clauses-tka1",
              bentuk: "pg",
              level: "L1",
              question:
                "Which relative pronoun is used for a person when the clause is the subject of the verb?",
              options: [
                { id: "A", text: "Who" },
                { id: "B", text: "Whom" },
                { id: "C", text: "Which" },
                { id: "D", text: "Whose" },
                { id: "E", text: "Where" },
              ],
              correctIds: ["A"],
              explanation:
                "'Who' is the subject form of the relative pronoun for people ('the researcher who published the study'). 'Whom' is the object form, 'which' refers to things, 'whose' marks possession, and 'where' refers to place.",
            },
            {
              id: "bitl-complex-grammar-relative-noun-clauses-tka2",
              bentuk: "pg",
              level: "L2",
              stimulus:
                "Read the sentence: 'The finding that the committee released contradicts earlier assumptions, and it suggests that policy should be revised.'",
              question:
                "Which analysis of the two subordinate clauses is correct?",
              options: [
                { id: "A", text: "Both clauses are adjectival relative clauses" },
                { id: "B", text: "The first is a noun clause in apposition; the second is also a noun clause" },
                { id: "C", text: "The first is an adverbial clause of reason; the second is a relative clause" },
                { id: "D", text: "Both clauses are adverbial clauses of concession" },
                { id: "E", text: "The first is a relative clause; the second is an adverbial clause of purpose" },
              ],
              correctIds: ["B"],
              explanation:
                "'That the committee released' is a noun clause in apposition to 'the finding' (it specifies the content of the finding), and 'that policy should be revised' is a noun clause functioning as the object of 'suggests'. Neither functions as an adverbial clause.",
            },
            {
              id: "bitl-complex-grammar-relative-noun-clauses-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              stimulus:
                "Read the paragraph: 'The policy, which was introduced in 2019, applies to all schools in the province. Students who study in rural areas receive additional funding. What concerns researchers most is the absence of reliable data. The report that the ministry published in March confirms this gap, and the schools whose budgets were cut report the largest deficits of all.'",
              question:
                "Which statements about the underlined clauses are correct? There is more than one correct answer. Click on every correct answer!",
              options: [
                { id: "A", text: "The clause about 2019 is non-restrictive and can be set off by commas." },
                { id: "B", text: "The clause with 'who' is restrictive and identifies which students qualify." },
                { id: "C", text: "The clause beginning with 'What' acts as an adjectival relative clause." },
                { id: "D", text: "The clause with 'whose' marks possession and identifies specific schools." },
                { id: "E", text: "The clause with 'that the ministry published' is non-restrictive." },
              ],
              correctIds: ["A", "B", "D"],
              explanation:
                "The 2019 clause is extra information and therefore non-restrictive (A). The 'who' clause narrows the set of students, so it is restrictive (B). The 'whose' clause expresses possession and identifies particular schools (D). The 'What' clause is a nominal clause acting as the subject (C is wrong), and the 'that the ministry published' clause restricts which report is meant, so it is restrictive (E is wrong).",
            },
            {
              id: "bitl-complex-grammar-relative-noun-clauses-tka4",
              bentuk: "isian",
              level: "L2",
              stimulus:
                "Read the sentence: 'The laboratory _____ equipment was damaged will reopen next month.'",
              question:
                "Write the single possessive relative pronoun that completes the sentence.",
              correctIds: ["whose"],
              explanation:
                "'Whose' is the possessive relative pronoun linking the laboratory to its equipment. It is the only relative pronoun that can mark possession for both people and things in this structure.",
            },
          ],
        },
        {
          id: "bitl-complex-grammar-inversion-reduced-clauses",
          title: "Inversion and Reduced Clauses",
          estimatedMinutes: 70,
          materi: {
            ringkasan:
              "Academic prose achieves emphasis and concision through two contrasting moves: inversion, which reorders elements for focus, and reduction, which deletes recoverable material. Inversion appears in negative adverbial openings ('Not only did the trial fail...'), conditional inversion ('Had the sample been larger...'), and comparative structures. Reduction converts clauses into phrases, participles, or appositives. Both devices require grammatical control, because an error in either produces a sentence that sounds formal but is actually ungrammatical.",
            rumus: [
              "Negative adverbial inversion: Not only + auxiliary + subject + verb (Not only did they withdraw...)",
              "Conditional inversion: Had / Were / Should + subject (Had we known, we would have acted)",
              "Inversion after 'so / such': So severe was the drought that crops failed",
              "Inversion after restrictive adverbials: Rarely has a study provoked such debate",
              "Participial reduction: Because the data were incomplete, the team delayed -> The data being incomplete, the team delayed",
              "Appositive reduction: Dr. Rahman, who is a specialist in hydrology, -> Dr. Rahman, a specialist in hydrology,",
              "Absolute construction: The experiment finished, the team began analysis",
            ],
            contoh: [
              {
                soal: "Rewrite with inversion: 'The committee not only rejected the proposal but also refused to explain.'",
                pembahasan:
                  "Not only did the committee reject the proposal, but it also refused to explain. The auxiliary 'did' is inserted because the opening element is negative, and the second clause takes its own subject and verb.",
              },
              {
                soal: "Rewrite using conditional inversion: 'If the results had been replicated, the theory would have gained acceptance.'",
                pembahasan:
                  "Had the results been replicated, the theory would have gained acceptance. Dropping 'if' and fronting 'had' yields a more formal register without changing the meaning.",
              },
              {
                soal: "Reduce the clause: 'Because the sample was small, the findings should be treated cautiously.'",
                pembahasan:
                  "The sample being small, the findings should be treated cautiously. The causal clause becomes an absolute construction, which is more compact and typical of academic style.",
              },
            ],
          },
          flashcards: [
            {
              id: "bitl-complex-grammar-inversion-reduced-clauses-fc1",
              front: "What triggers subject-auxiliary inversion in academic English?",
              back: "A negative or restrictive adverbial placed at the start of the clause, such as not only, rarely, seldom, hardly, never, or little.",
            },
            {
              id: "bitl-complex-grammar-inversion-reduced-clauses-fc2",
              front: "How is conditional inversion formed?",
              back: "Delete 'if' and front the auxiliary: 'Had we known', 'Were the assumption true', 'Should the experiment fail'. It raises register and is common in formal writing.",
            },
            {
              id: "bitl-complex-grammar-inversion-reduced-clauses-fc3",
              front: "What is an absolute construction?",
              back: "A reduced clause with its own subject but no finite verb, attached to the main clause: 'The data being incomplete, the team delayed publication.'",
            },
            {
              id: "bitl-complex-grammar-inversion-reduced-clauses-fc4",
              front: "When should a writer avoid reducing a clause?",
              back: "When reduction obscures the agent or creates a dangling modifier whose implied subject does not match the main clause subject.",
            },
          ],
          quiz: [
            {
              id: "bitl-complex-grammar-inversion-reduced-clauses-q1",
              question: "Which sentence uses inversion correctly?",
              options: [
                "Rarely the study has been cited so often.",
                "Rarely has the study been cited so often.",
                "Rarely has been the study cited so often.",
                "Rarely the study been cited so often.",
              ],
              correctIndex: 1,
              explanation:
                "After a fronted negative adverbial, the auxiliary 'has' moves before the subject, giving 'Rarely has the study been cited'.",
            },
            {
              id: "bitl-complex-grammar-inversion-reduced-clauses-q2",
              question: "Which is the inverted conditional form of 'If the assumption were correct, the model would hold'?",
              options: [
                "Were the assumption correct, the model would hold.",
                "Was the assumption correct, the model would hold.",
                "If were the assumption correct, the model would hold.",
                "The assumption were correct, the model would hold.",
              ],
              correctIndex: 0,
              explanation:
                "Conditional inversion fronts 'were' and drops 'if'; the subjunctive form 'were' is retained.",
            },
            {
              id: "bitl-complex-grammar-inversion-reduced-clauses-q3",
              question: "Identify the dangling modifier:",
              options: [
                "Having reviewed the data, the researchers revised the model.",
                "Having reviewed the data, the model was revised by the researchers.",
                "The researchers revised the model after reviewing the data.",
                "After they reviewed the data, the researchers revised the model.",
              ],
              correctIndex: 1,
              explanation:
                "The participial phrase implies the model reviewed the data, which is illogical; the revised subject must be the researchers.",
            },
            {
              id: "bitl-complex-grammar-inversion-reduced-clauses-q4",
              question: "Which sentence uses an absolute construction?",
              options: [
                "Because the trial ended early, the results were preliminary.",
                "The trial having ended early, the results were preliminary.",
                "The trial ended early, so the results were preliminary.",
                "The results were preliminary because the trial ended early.",
              ],
              correctIndex: 1,
              explanation:
                "The absolute construction gives the reduced clause its own subject ('the trial') with a non-finite verb ('having ended').",
            },
          ],
          latihanSoal: [
            {
              id: "bitl-complex-grammar-inversion-reduced-clauses-l1",
              level: "hots",
              question:
                "Improve this paragraph for formal academic register using inversion and reduction at least once each: 'The pilot study was so expensive that it was cancelled. We had never seen costs rise so quickly. Because the budget was exhausted, the team suspended recruitment. This decision was unpopular.' (a) Rewrite sentence 1 using 'so ... that' inversion. (b) Rewrite sentence 2 with a fronted negative adverbial. (c) Reduce sentence 3 to an absolute construction. (d) Explain why inversion suits this paragraph and identify one risk of overusing it.",
              langkah: [
                "Rewrite sentence 1 with inversion: 'So expensive was the pilot study that it was cancelled.'",
                "Verify the inversion: after fronted 'so expensive', the verb 'was' precedes the subject 'the pilot study', and the result clause follows with 'that'.",
                "Rewrite sentence 2 by fronting the negative time adverbial 'never' and inserting the auxiliary: 'Never had we seen costs rise so quickly.'",
                "Rewrite sentence 3 as an absolute construction: 'The budget exhausted, the team suspended recruitment.'",
                "Confirm the absolute construction: it has its own subject 'the budget' and a non-finite participle 'exhausted', so it needs no conjunction.",
                "Consider alternative reduction for sentence 3: 'Its budget exhausted, the team suspended recruitment' adds clarity about whose budget, which is preferable when the antecedent might be ambiguous.",
                "Explain why inversion suits the paragraph: the passage reports a dramatic failure, and inversion foregrounds the extreme cost and the unprecedented speed, aligning emphasis with the logic of the argument.",
                "Identify the risk: overuse of inversion makes prose sound contrived and archaic, and repeated fronted negatives force the reader to process deviations from normal word order, which slows comprehension.",
              ],
              jawaban:
                "(a) So expensive was the pilot study that it was cancelled (b) Never had we seen costs rise so quickly (c) The budget exhausted, the team suspended recruitment (or: Its budget exhausted, the team suspended recruitment) (d) Inversion suits the paragraph because it foregrounds the striking cost and speed, matching emphasis to significance; the risk is that overuse sounds contrived and archaic and repeatedly forces the reader to process unnatural word order, slowing comprehension.",
            },
            {
              id: "bitl-complex-grammar-inversion-reduced-clauses-l2",
              level: "sulit",
              question:
                "A thesis abstract contains: 'The fieldwork was conducted over eighteen months. The fieldwork faced unexpected delays. If the delays had not occurred, the sample would have been twice as large. Because the sample was smaller than planned, the statistical power was reduced.' Revise the abstract to 30 words or fewer using at least one reduction and at least one inversion, then justify every deletion and explain why no information essential to the claim was lost.",
              langkah: [
                "Identify the essential claims: fieldwork duration, delays, the counterfactual effect on sample size, and the consequence for statistical power.",
                "Choose the reduction strategy: convert 'The fieldwork was conducted... faced delays' into a single clause with a reduced relative and a participial phrase.",
                "Choose the inversion strategy: render the counterfactual with conditional inversion, 'Had the delays not occurred', which is more compact than 'If the delays had not occurred'.",
                "Draft the reduced version: 'Fieldwork conducted over eighteen months faced delays; had they not occurred, the sample would have doubled and statistical power would have held.'",
                "Count the words: twenty-three words, satisfying the limit while preserving all four essential claims.",
                "Justify each deletion: 'The fieldwork was' is absorbed into the reduced relative clause, and 'Because the sample was smaller than planned' is replaced by its logical inverse in the counterfactual and its preserved consequence.",
                "Verify no essential information was lost: duration is retained, delays are retained, doubling captures the counterfactual magnitude, and the power consequence is preserved.",
                "Check the counterfactual logic: 'would have doubled' and 'would have held' are both unreal past conditionals, so the tense sequence after 'had they not occurred' is consistent.",
              ],
              jawaban:
                "Reduced version: 'Fieldwork conducted over eighteen months faced delays; had they not occurred, the sample would have doubled and statistical power would have held.' (23 words) Justification: the reduced relative clause 'conducted over eighteen months' replaces the separate sentence about duration, and the participial phrasing compresses the delay statement; conditional inversion 'had they not occurred' replaces the longer 'if' clause. 'Because the sample was smaller than planned' is deleted because it is the logical inverse of the counterfactual already stated, and its consequence survives in 'statistical power would have held'. All four essential claims remain and the past unreal conditional sequence is grammatical.",
            },
          ],
          tkaSoal: [
            {
              id: "bitl-complex-grammar-inversion-reduced-clauses-tka1",
              bentuk: "pg",
              level: "L1",
              question:
                "Which sentence uses a reduced clause?",
              options: [
                { id: "A", text: "The students who were selected received scholarships." },
                { id: "B", text: "The students selected received scholarships." },
                { id: "C", text: "The students who received scholarships were selected." },
                { id: "D", text: "The students, who were selected, received scholarships." },
                { id: "E", text: "The students received scholarships when they were selected." },
              ],
              correctIds: ["B"],
              explanation:
                "Option B reduces 'who were selected' to the past participle 'selected'. Options A, C, and D keep full relative clauses, and E is an adverbial clause rather than a reduced one.",
            },
            {
              id: "bitl-complex-grammar-inversion-reduced-clauses-tka2",
              bentuk: "pg",
              level: "L2",
              stimulus:
                "Read the sentence: 'Rarely has a single policy provoked such widespread debate among economists.'",
              question: "Which grammatical feature explains the word order in this sentence?",
              options: [
                { id: "A", text: "A question form used for stylistic effect" },
                { id: "B", text: "Inversion after a fronted negative or restrictive adverbial" },
                { id: "C", text: "An absolute construction with its own subject" },
                { id: "D", text: "A cleft sentence beginning with an expletive" },
                { id: "E", text: "Passive voice applied to an intransitive verb" },
              ],
              correctIds: ["B"],
              explanation:
                "The fronted restrictive adverbial 'Rarely' triggers subject-auxiliary inversion, so 'has' precedes 'a single policy'. It is not a question, an absolute construction, a cleft sentence, or a passive.",
            },
            {
              id: "bitl-complex-grammar-inversion-reduced-clauses-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              stimulus:
                "Read the sentences: 'The budget was exhausted. The team suspended recruitment. If the delays had not occurred, the sample would have been twice as large. Never had the researchers seen such rapid cost escalation.'",
              question:
                "Which rewritten sentences are grammatically correct and equivalent in meaning? There is more than one correct answer. Click on every correct answer!",
              options: [
                { id: "A", text: "The budget exhausted, the team suspended recruitment." },
                { id: "B", text: "Exhausted the budget, the team suspended recruitment." },
                { id: "C", text: "Had the delays not occurred, the sample would have been twice as large." },
                { id: "D", text: "Never the researchers had seen such rapid cost escalation." },
                { id: "E", text: "Such was the rate of cost escalation that the researchers had never seen its like." },
              ],
              correctIds: ["A", "C", "E"],
              explanation:
                "A is a correct absolute construction with its own subject ('the budget'). C is correct conditional inversion, which is equivalent to 'If the delays had not occurred'. E is correct fronted 'such' inversion. B drops the subject needed by the absolute construction and is ungrammatical, and D fails to invert the auxiliary after a fronted negative.",
            },
            {
              id: "bitl-complex-grammar-inversion-reduced-clauses-tka4",
              bentuk: "isian",
              level: "L2",
              stimulus:
                "Read the sentence: '_____ the delays not occurred, the sample would have been twice as large.'",
              question:
                "Write the single auxiliary verb that completes the inverted conditional.",
              correctIds: ["had"],
              explanation:
                "Conditional inversion requires the auxiliary 'had' before the subject: 'Had the delays not occurred'. This is equivalent to 'If the delays had not occurred' but is more compact and formal.",
            },
          ],
        },
        {
          id: "bitl-complex-grammar-academic-cohesion-transitions",
          title: "Academic Cohesion and Transitions",
          estimatedMinutes: 65,
          materi: {
            ringkasan:
              "Cohesion is what makes a text feel like one argument rather than a list of sentences. It is built from reference (pronouns and demonstratives), lexical chains (repeated and related vocabulary), substitution and ellipsis, and explicit connectives. Transitions signal logical relationships, but they cannot create relationships that are not really there, and an inaccurate connector misrepresents the argument more seriously than no connector at all. Advanced writers use transitions sparingly and precisely, relying more on lexical cohesion to carry the thread.",
            rumus: [
              "Reference: pronouns and demonstratives pointing back (this, these, such, the former, the latter)",
              "Lexical cohesion: repetition of key terms and use of related words (antonymy, hyponymy, collocation)",
              "Substitution and ellipsis: replacing or omitting recoverable material (so do they; neither was the hypothesis)",
              "Additive: moreover, furthermore, in addition, similarly, likewise",
              "Adversative: however, nevertheless, conversely, on the contrary, yet",
              "Causal: therefore, consequently, thus, as a result, hence",
              "Illustrative and summative: for instance, indeed, in short, to summarise",
              "Given-new ordering: place familiar information early and new information late in the sentence",
            ],
            contoh: [
              {
                soal:
                  "Choose the correct transition: 'The sample was small. ____, the effect size was large enough to reach significance.'",
                pembahasan:
                  "Nevertheless. The relationship is adversative because the small sample is a limitation that the second clause overrides, so an additive or causal connector would misrepresent the logic.",
              },
              {
                soal:
                  "Improve cohesion: 'The survey covered 400 farmers. The survey found that 60 percent used organic methods. Organic methods cost more. The survey also found that subsidies help.'",
                pembahasan:
                  "The survey of 400 farmers found that 60 percent used organic methods. These methods cost more, yet subsidies appear to offset the difference. Demonstrative reference ('These methods') and a compact clause remove the mechanical repetition of 'the survey' and 'organic methods' while preserving every finding.",
              },
              {
                soal: "Explain the error: 'The participants were all volunteers. Therefore, the findings generalise to the whole population.'",
                pembahasan:
                  "The connector contradicts the logic: volunteer sampling weakens generalisability, so 'therefore' misstates the relationship; the sentence should concede a limitation instead of claiming support.",
              },
            ],
          },
          flashcards: [
            {
              id: "bitl-complex-grammar-academic-cohesion-transitions-fc1",
              front: "What is the relationship between cohesion and coherence?",
              back: "Cohesion is the visible linking of sentences through reference, repetition, and connectors; coherence is the underlying logical unity. Cohesion supports coherence but cannot substitute for it.",
            },
            {
              id: "bitl-complex-grammar-academic-cohesion-transitions-fc2",
              front: "Why can an inaccurate transition be worse than no transition?",
              back: "A wrong connector asserts a logical relationship that does not exist, actively misleading the reader about the argument's structure, whereas a missing connector merely asks the reader to infer.",
            },
            {
              id: "bitl-complex-grammar-academic-cohesion-transitions-fc3",
              front: "What is the given-new principle?",
              back: "Place familiar or previously mentioned information early in the sentence and new, informative content late, so each sentence connects to the previous one and still advances the argument.",
            },
            {
              id: "bitl-complex-grammar-academic-cohesion-transitions-fc4",
              front: "How does lexical cohesion differ from grammatical cohesion?",
              back: "Lexical cohesion works through word choice such as repetition, synonymy, and collocation, while grammatical cohesion works through pronouns, determiners, substitution, and ellipsis.",
            },
          ],
          quiz: [
            {
              id: "bitl-complex-grammar-academic-cohesion-transitions-q1",
              question:
                "Which connector fits? 'The intervention improved test scores. ____, it had no measurable effect on attendance.'",
              options: ["Therefore", "However", "Moreover", "For example"],
              correctIndex: 1,
              explanation:
                "The two findings point in different directions, so the relationship is adversative and requires a contrastive connector.",
            },
            {
              id: "bitl-complex-grammar-academic-cohesion-transitions-q2",
              question: "In academic writing, 'thus' signals ...",
              options: [
                "an example",
                "a concession",
                "a result or inference",
                "a contrast",
              ],
              correctIndex: 2,
              explanation:
                "'Thus' introduces a conclusion drawn from preceding evidence, functioning as a causal or inferential connector.",
            },
            {
              id: "bitl-complex-grammar-academic-cohesion-transitions-q3",
              question: "Identify the cohesion device in: 'Few studies address rural access. Such research is urgently needed.'",
              options: [
                "Ellipsis",
                "Demonstrative reference",
                "Conjunction",
                "Substitution",
              ],
              correctIndex: 1,
              explanation:
                "'Such' is a demonstrative determiner pointing back to the whole preceding idea, which is a form of grammatical reference.",
            },
            {
              id: "bitl-complex-grammar-academic-cohesion-transitions-q4",
              question: "Which sentence best follows the given-new principle?",
              options: [
                "A novel catalyst was discovered by the team. The team works on catalysis.",
                "The team works on catalysis. The team discovered a novel catalyst that lowers reaction temperatures.",
                "Catalysis is the field. A discovery was made.",
                "Lowering temperatures is important. Catalysts exist.",
              ],
              correctIndex: 1,
              explanation:
                "It opens with information the reader already has (the team's field) and ends with the new, substantive content (the catalyst's effect).",
            },
          ],
          latihanSoal: [
            {
              id: "bitl-complex-grammar-academic-cohesion-transitions-l1",
              level: "hots",
              question:
                "Revise this paragraph for cohesion and connector accuracy: 'Urban farming is growing. Urban farming uses rooftops. Rooftops are unused. Urban farming produces food. Therefore food miles are reduced. However urban farming also faces obstacles. The obstacles are high costs. Besides it needs technical knowledge.' (a) Identify every inaccurate connector and explain the true relationship. (b) Rewrite the paragraph using at least two reference devices and one lexical chain. (c) Explain how given-new ordering improves one of your sentences. (d) State which connectors you deliberately removed and why.",
              langkah: [
                "Audit the connectors: 'Therefore food miles are reduced' is defensible because local production does reduce transport distance, but 'However urban farming also faces obstacles' misuses contrast since obstacles do not oppose the food-miles claim.",
                "Reclassify the second connector: the obstacles are a qualification added to the benefits, so the relationship is additive, requiring 'In addition' or 'Moreover'.",
                "Audit a third connector: 'Besides' is informal and repetitive here, so 'In addition' is preferable in academic register.",
                "Identify redundancy for the lexical chain: 'urban farming' appears three times, which can be replaced in two places by 'this practice' and 'it'.",
                "Identify reference opportunities: 'Rooftops are unused' can attach as a reduced clause, 'often unused rooftops', and 'The obstacles are high costs' can become 'these are high costs'.",
                "Draft the revision: Urban farming is expanding onto often unused rooftops, where it produces food and thereby reduces food miles. In addition, this practice faces high costs and requires technical knowledge.",
                "Note the given-new ordering: sentence 2 starts with 'In addition, this practice', which is familiar information, and ends with the new content about costs and knowledge demands.",
                "Explain the removals: the redundant 'Therefore' was kept only where the causal link is real, the misused 'However' was replaced by an additive connector, and informal 'Besides' was removed in favour of academic 'In addition'.",
              ],
              jawaban:
                "(a) 'However' is inaccurate because obstacles add to the benefits rather than contrast with them; 'Besides' is informal and repetitive (b) Revised paragraph: 'Urban farming is expanding onto often unused rooftops, where it produces food and thereby reduces food miles. In addition, this practice faces high costs and requires technical knowledge.' The devices are the references 'it' and 'this practice', plus the lexical chain of farming, rooftops, and food (c) The second sentence opens with familiar information ('In addition, this practice') and ends with new information (high costs and technical demands), which links the sentences while still advancing the argument (d) The misused 'However' was replaced by an additive connector, informal 'Besides' was replaced by 'In addition', and repeated 'urban farming' was reduced to reference words to avoid mechanical repetition.",
            },
            {
              id: "bitl-complex-grammar-academic-cohesion-transitions-l2",
              level: "sulit",
              question:
                "Two versions of the same conclusion are submitted. Version A: 'The results are inconclusive. However, the hypothesis is rejected. Therefore further research is unnecessary. Moreover, the sample was small.' Version B: 'The results are inconclusive. Nevertheless, the pattern is consistent enough to justify a larger trial. In addition, the small sample limits generalisation, so the conclusion remains provisional.' (a) Diagnose every logical error in Version A. (b) Explain how Version B repairs each one. (c) Explain why 'however' and 'nevertheless' are not interchangeable here. (d) Rewrite Version A's final connector choice to make it accurate without deleting the information about the sample.",
              langkah: [
                "Diagnose the first error in A: 'However, the hypothesis is rejected' implies that inconclusive results justify rejection, but inconclusive evidence cannot support a decisive conclusion.",
                "Diagnose the second error: 'Therefore further research is unnecessary' follows logically only from a definite result, yet the premises state the opposite, so the causal connector is misapplied.",
                "Diagnose the third error: 'Moreover, the sample was small' is not an addition of the same kind as the previous claims, since a small sample is a limitation rather than supporting evidence.",
                "Note the structural fault: the paragraph draws three firm conclusions from a stated absence of conclusions, which is a coherence failure, not merely a cohesion failure.",
                "Explain B's first repair: causal and adversative connectors now match the logic, since 'nevertheless' marks the modest inference drawn in spite of inconclusive results.",
                "Explain B's second repair: 'In addition' correctly presents the small sample as a parallel limitation, and 'so' derives the provisional conclusion from stated grounds.",
                "Analyse however versus nevertheless: both are adversative, but 'however' signals simple contrast while 'nevertheless' signals concession in the face of an obstacle, which is exactly the relationship B expresses.",
                "Rewrite A's final connector: 'In addition, the sample was small, which limits how far the conclusion can be generalised.' This preserves the information and states it as a limitation rather than an additional support.",
              ],
              jawaban:
                "(a) A claims rejection, then claims further research is unnecessary, then presents a small sample as supporting evidence, even though its own premise is that the results are inconclusive (b) B replaces the unsupported rejection with a guarded inference, replaces the false causal leap with a conditional conclusion, and relocates the small sample as a stated limitation (c) They differ in strength and nuance: 'however' marks simple contrast, while 'nevertheless' marks concession despite an obstacle, which matches B's inference drawn in spite of inconclusive results (d) Version A's final clause becomes 'In addition, the sample was small, which limits how far the conclusion can be generalised', converting an unreliable support into an acknowledged limitation.",
            },
          ],
          tkaSoal: [
            {
              id: "bitl-complex-grammar-academic-cohesion-transitions-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Which connector signals a result or consequence?",
              options: [
                { id: "A", text: "However" },
                { id: "B", text: "Consequently" },
                { id: "C", text: "Similarly" },
                { id: "D", text: "For instance" },
                { id: "E", text: "Admittedly" },
              ],
              correctIds: ["B"],
              explanation:
                "'Consequently' expresses result. 'However' marks contrast, 'similarly' marks similarity, 'for instance' introduces an example, and 'admittedly' concedes a point.",
            },
            {
              id: "bitl-complex-grammar-academic-cohesion-transitions-tka2",
              bentuk: "pg",
              level: "L2",
              stimulus:
                "Read the paragraph: 'Urban green roofs reduce stormwater runoff. _____ they lower building temperatures and cut cooling costs.'",
              question: "Which connector both fits the logic and maintains formal academic register?",
              options: [
                { id: "A", text: "But" },
                { id: "B", text: "Besides" },
                { id: "C", text: "In addition" },
                { id: "D", text: "On the contrary" },
                { id: "E", text: "So" },
              ],
              correctIds: ["C"],
              explanation:
                "The second sentence adds a parallel benefit, so an additive connector is required. 'In addition' is the formal choice; 'Besides' is informal, 'But' and 'So' are conversational and not ideal at the head of a formal sentence, and 'On the contrary' incorrectly signals opposition.",
            },
            {
              id: "bitl-complex-grammar-academic-cohesion-transitions-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              stimulus:
                "Read the conclusion: 'The results are inconclusive. However, the hypothesis is rejected. Therefore further research is unnecessary. Moreover, the sample was small.'",
              question:
                "Which criticisms of this conclusion are valid? There is more than one correct answer. Click on every correct answer!",
              options: [
                { id: "A", text: "It draws a decisive rejection from premises that explicitly deny decisiveness." },
                { id: "B", text: "'Therefore' states a consequence that does not follow from its premise." },
                { id: "C", text: "'Moreover' wrongly presents a limitation as additional support." },
                { id: "D", text: "The paragraph is flawless and needs no revision." },
                { id: "E", text: "The sentence 'The results are inconclusive' should be deleted because it contradicts the rest." },
              ],
              correctIds: ["A", "B", "C"],
              explanation:
                "The paragraph contradicts itself by rejecting a hypothesis after calling results inconclusive (A), asserts that research is unnecessary without support (B), and mislabels a limitation as reinforcement (C). D denies the evident coherence failure, and E is wrong because the fault lies in the later claims, not in the accurate opening statement.",
            },
            {
              id: "bitl-complex-grammar-academic-cohesion-transitions-tka4",
              bentuk: "isian",
              level: "L2",
              stimulus:
                "Read the sentence: 'The pattern is modest. _____, it is consistent enough to justify a larger trial.'",
              question:
                "Write the single formal connector that marks concession, not simple contrast (one word).",
              correctIds: ["nevertheless", "nevertheless,", "nonetheless", "nonetheless,"],
              explanation:
                "'Nevertheless' (or 'nonetheless') marks concession in the face of an obstacle: the inference is drawn despite the modest pattern. 'However' would only mark simple contrast and would weaken the concession relationship the sentence needs.",
            },
          ],
        },
      ],
    },
    {
      id: "bitl-analytical-exposition",
      title: "Analytical Exposition and Argument",
      order: 3,
      subtopics: [
        {
          id: "bitl-analytical-exposition-deconstructing-argumentative-structures",
          title: "Deconstructing Argumentative Structures",
          estimatedMinutes: 75,
          materi: {
            ringkasan:
              "Analytical exposition argues that something is the case; hortatory exposition argues that something should be done. Both rely on a thesis, a sequence of arguments, and a reaffirmation. Deconstructing such a text means mapping its skeleton: locating the thesis, identifying which arguments are primary and which are supporting, tracing how evidence flows into warrants, and testing whether the conclusion follows from what was actually established. Recognition of structure is also the fastest route to producing it.",
            rumus: [
              "Analytical exposition: thesis -> arguments (why it is so) -> reiteration",
              "Hortatory exposition: thesis -> arguments (why it must be done) -> recommendation",
              "Thesis markers: I argue, this essay contends, it is evident that, the position taken here is",
              "Argument markers: first, more importantly, the strongest evidence, furthermore",
              "Concession-and-rebuttal blocks: admittedly, critics argue, yet this ignores, while true, this does not",
              "Reiteration markers: in conclusion, taken together, the weight of evidence suggests",
              "Structural test: does each argument support the thesis, and does the conclusion claim only what the arguments established?",
            ],
            contoh: [
              {
                soal:
                  "Classify and justify: 'Remote work should be legally protected. First, it widens access to employment. Second, it reduces commuting emissions. Therefore, governments must legislate protections.'",
                pembahasan:
                  "This is hortatory exposition. The thesis prescribes action ('should be legally protected'), the arguments explain why the action is needed, and the recommendation is explicit ('governments must legislate').",
              },
              {
                soal:
                  "Identify the structural weakness: 'Our data show a correlation between library use and grades. Thus, libraries cause higher achievement, and funding must therefore be doubled.'",
                pembahasan:
                  "The argument leaps from correlation to causation and then to a policy recommendation, so the conclusion claims more than the evidence established; the structure is nominally sound but the inference supporting it is not.",
              },
            ],
          },
          flashcards: [
            {
              id: "bitl-analytical-exposition-deconstructing-argumentative-structures-fc1",
              front: "What distinguishes analytical from hortatory exposition?",
              back: "Analytical exposition argues that something is the case and ends with a reiteration; hortatory exposition argues that something should be done and ends with a recommendation.",
            },
            {
              id: "bitl-analytical-exposition-deconstructing-argumentative-structures-fc2",
              front: "What are the three core moves of an argumentative text?",
              back: "Establishing a thesis, developing ordered arguments with evidence, and closing with a reiteration or recommendation that matches what the arguments established.",
            },
            {
              id: "bitl-analytical-exposition-deconstructing-argumentative-structures-fc3",
              front: "Why place the strongest argument second or last?",
              back: "Recency and primacy effects mean readers best recall the beginning and the end, so reserving the strongest evidence for the final position maximises its persuasive weight.",
            },
            {
              id: "bitl-analytical-exposition-deconstructing-argumentative-structures-fc4",
              front: "What is the key structural test for a conclusion?",
              back: "Check whether the conclusion claims exactly what the premises established; overclaiming is a structural failure even when every sentence is grammatical.",
            },
          ],
          quiz: [
            {
              id: "bitl-analytical-exposition-deconstructing-argumentative-structures-q1",
              question: "A text ending with 'Therefore, the government must act immediately' is ...",
              options: [
                "analytical exposition",
                "hortatory exposition",
                "narrative",
                "descriptive report",
              ],
              correctIndex: 1,
              explanation:
                "An explicit call to action makes the text hortatory, since it argues that something should be done rather than merely that something is so.",
            },
            {
              id: "bitl-analytical-exposition-deconstructing-argumentative-structures-q2",
              question: "The thesis of an argumentative text is best defined as ...",
              options: [
                "the first piece of evidence presented",
                "the statement the writer commits to defending",
                "a summary of opposing views",
                "the longest paragraph",
              ],
              correctIndex: 1,
              explanation:
                "The thesis is the central claim the whole text exists to support; every argument should bear directly on it.",
            },
            {
              id: "bitl-analytical-exposition-deconstructing-argumentative-structures-q3",
              question:
                "Which sentence marks a concession-and-rebuttal move?",
              options: [
                "First, costs have fallen sharply.",
                "Admittedly the study was small, yet its effect size was large.",
                "In conclusion, the policy should change.",
                "This essay will examine three factors.",
              ],
              correctIndex: 1,
              explanation:
                "'Admittedly' concedes a genuine weakness, while 'yet' pivots to the reason the concession does not defeat the argument.",
            },
            {
              id: "bitl-analytical-exposition-deconstructing-argumentative-structures-q4",
              question: "What is the most serious structural flaw in an argument?",
              options: [
                "Using few statistics",
                "Vague transitions",
                "A conclusion that claims more than the evidence supports",
                "Short paragraphs",
              ],
              correctIndex: 2,
              explanation:
                "Overclaiming breaks the link between premises and conclusion, which undermines the reasoning itself rather than merely the presentation.",
            },
          ],
          latihanSoal: [
            {
              id: "bitl-analytical-exposition-deconstructing-argumentative-structures-l1",
              level: "hots",
              question:
                "Deconstruct this text: 'School start times should be moved to 9 a.m. First, adolescent sleep cycles shift later during puberty, so early starts cause chronic sleep deprivation. Second, a district in Colorado delayed start times and reported a 16 percent drop in teen car accidents. Admittedly, bus schedules would need costly reorganisation. However, the health savings and accident reductions outweigh this one-off expense. In short, the change is justified.' (a) Classify the text and justify your classification. (b) Map its structure move by move. (c) Identify the concession and explain its rhetorical function. (d) Evaluate whether the conclusion claims more than the evidence supports.",
              langkah: [
                "Classify the text: it is hortatory exposition, because the thesis prescribes action ('should be moved to 9 a.m.') and the closing move endorses that action.",
                "Map move 1: the thesis appears in the first sentence and commits the writer to a policy position.",
                "Map move 2: the first argument is causal and general, linking pubertal sleep-cycle shifts to chronic deprivation.",
                "Map move 3: the second argument is empirical and specific, citing a natural experiment with a quantified outcome.",
                "Map move 4: the concession appears in 'Admittedly, bus schedules would need costly reorganisation', acknowledging a real cost.",
                "Map move 5: the rebuttal follows immediately with 'However', claiming the benefits outweigh the cost, and the reiteration closes with 'the change is justified'.",
                "Analyse the concession's function: by naming the strongest practical objection before the reader does, the writer prevents it from feeling suppressed and makes the rebuttal appear considered rather than evasive.",
                "Evaluate the conclusion: it claims the change 'is justified', which is supported only if the benefit outweighs the cost, yet no cost figures are given, so the comparison rests on an unquantified assertion.",
                "State what would strengthen it: a cost estimate for bus rescheduling against the monetised health and safety benefits, which would make the outweighing claim testable rather than merely asserted.",
              ],
              jawaban:
                "(a) Hortatory exposition, because the thesis advocates a specific action and the closing move endorses it (b) Structure: thesis (school start times should move to 9 a.m.), causal general argument (pubertal sleep shifts cause chronic deprivation), empirical specific argument (Colorado district reported a 16 percent drop in teen car accidents), concession (bus reorganisation is costly), rebuttal and reiteration (benefits outweigh the one-off expense, so the change is justified) (c) The concession acknowledges the strongest practical objection before readers raise it, which makes the rebuttal look considered rather than evasive (d) Yes, partly: 'justified' depends on benefits outweighing costs, but no cost figures are supplied, so the weighing is asserted rather than demonstrated; quantified cost estimates compared with monetised benefits would be needed to support the claim.",
            },
            {
              id: "bitl-analytical-exposition-deconstructing-argumentative-structures-l2",
              level: "sulit",
              question:
                "A student submits this analytical essay outline: Thesis: 'Standardised testing should be abolished.' Arguments: (1) Tests cause stress; (2) Teachers teach to the test; (3) Some countries without heavy testing perform well; (4) Testing is expensive. Conclusion: 'Therefore testing harms all students and must end immediately.' Critique the outline structurally: (a) Name the type of exposition and whether the thesis and conclusion match it. (b) Identify which arguments are independent and which overlap. (c) Identify the unsupported generalisation in the conclusion. (d) Reorder the arguments for maximum persuasive effect and rewrite the conclusion so that it claims only what the evidence supports.",
              langkah: [
                "Classify the outline: the thesis and conclusion both prescribe action, so it is hortatory exposition rather than analytical, despite being labelled analytical.",
                "Check thesis-conclusion alignment: the thesis says testing 'should be abolished' while the conclusion says it 'must end immediately', which escalates from recommendation to necessity without added evidence.",
                "Identify overlap: 'Tests cause stress' and 'Teachers teach to the test' are distinct mechanisms, but the stress argument partly depends on the test-preparation argument, so they may be merged into one harms-based argument.",
                "Identify independence: the international comparison provides external evidence of feasibility, and the cost argument provides a separate resource-based reason, so both stand alone.",
                "Assess argument strength: the international comparison is the most persuasive because it addresses whether a non-testing system can work, while cost is the weakest because inexpensive alternatives may not achieve the same goals.",
                "Order for effect: open with the concrete evidence that tests distort teaching, follow with the international feasibility evidence, then cost, and reserve the stress argument for the position of greatest emotional resonance before the conclusion.",
                "Identify the unsupported generalisation: 'harms all students' universalises a harm that affects subsets differently and ignores students who benefit from structured assessment.",
                "Rewrite the conclusion to match the evidence: 'The evidence suggests that heavy standardised testing distorts teaching and imposes real costs, and that comparable systems can succeed with less testing; reform toward lighter, broader assessment is therefore warranted.'",
                "Verify the revision: the new conclusion recommends rather than mandates, quantifies no figures it lacks, and claims only the harms and feasibility established by the arguments.",
              ],
              jawaban:
                "(a) It is hortatory exposition, since both thesis and conclusion prescribe action; the conclusion nonetheless escalates from 'should be abolished' to 'must end immediately', which the evidence does not license (b) The stress and teach-to-the-test arguments overlap and can be merged into a single harms argument; the international comparison and the cost argument are independent (c) 'Harms all students' is an unsupported universal generalisation that ignores students who benefit from structured assessment (d) Suggested order: teaching distortion (concrete evidence), international feasibility (external evidence), cost (resource reason), student stress (resonant harm closest to the conclusion). Revised conclusion: 'The evidence suggests that heavy standardised testing distorts teaching and imposes real costs, and that comparable systems can succeed with less testing; reform toward lighter, broader assessment is therefore warranted.'",
            },
          ],
          tkaSoal: [
            {
              id: "bitl-analytical-exposition-deconstructing-argumentative-structures-tka1",
              bentuk: "pg",
              level: "L1",
              question: "Which element of an analytical exposition states the writer's position on the issue?",
              options: [
                { id: "A", text: "The reiteration at the end" },
                { id: "B", text: "The thesis in the opening paragraph" },
                { id: "C", text: "The first argument" },
                { id: "D", text: "The counterclaim" },
                { id: "E", text: "The evidence citation" },
              ],
              correctIds: ["B"],
              explanation:
                "The thesis introduces the writer's position and previews the argument. The arguments support it, the reiteration restates it at the end, and a counterclaim opposes it while evidence supports it.",
            },
            {
              id: "bitl-analytical-exposition-deconstructing-argumentative-structures-tka2",
              bentuk: "pg",
              level: "L2",
              stimulus:
                "Read the paragraph: 'Opponents argue that congestion charging unfairly burdens low-income drivers. This objection has force, since flat charges do fall hardest on those with the least disposable income. Yet the revenue in every city that has adopted the scheme has been reinvested in buses and trams, which low-income commuters use most. The objection therefore justifies careful design, not abandonment.'",
              question: "Which move does the writer make in the third and fourth sentences?",
              options: [
                { id: "A", text: "Refuting the objection by denying that it exists" },
                { id: "B", text: "Conceding the objection and then rebutting it with counter-evidence" },
                { id: "C", text: "Changing the topic to public transport in general" },
                { id: "D", text: "Restating the thesis without adding evidence" },
                { id: "E", text: "Attacking the character of the opponents" },
              ],
              correctIds: ["B"],
              explanation:
                "The writer grants that the objection has force and then answers it with the reinvestment evidence, concluding that the objection supports better design rather than rejection. This is the concession-and-rebuttal move, not denial, digression, mere restatement, or ad hominem attack.",
            },
            {
              id: "bitl-analytical-exposition-deconstructing-argumentative-structures-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              stimulus:
                "Read the essay extract: 'Standardised testing should be abolished. Tests cause stress, and tests encourage teaching to the test. Abolishing tests would harm all students because scores motivate them. Finland outperforms many countries without heavy testing. Testing also costs millions each year. Therefore testing must end immediately.'",
              question:
                "Which problems with this extract are real? There is more than one correct answer. Click on every correct answer!",
              options: [
                { id: "A", text: "The claim that abolition would harm all students contradicts the thesis." },
                { id: "B", text: "The conclusion 'must end immediately' is stronger than the evidence supports." },
                { id: "C", text: "Two of the arguments overlap closely and could be merged." },
                { id: "D", text: "The extract cites no evidence anywhere, so every claim is unsupported." },
                { id: "E", text: "The stress and teaching-to-the-test arguments address unrelated issues." },
              ],
              correctIds: ["A", "B", "C"],
              explanation:
                "The harm-all-students sentence directly contradicts the abolition thesis (A), the imperative conclusion overreaches the hedged evidence (B), and the stress and teaching-to-the-test arguments substantially overlap (C). D is wrong because the Finland and cost points are evidence, and E is wrong because both arguments concern the effects of testing on schooling.",
            },
            {
              id: "bitl-analytical-exposition-deconstructing-argumentative-structures-tka4",
              bentuk: "isian",
              level: "L2",
              stimulus:
                "Read the sentence: 'Admittedly the trial was small, yet its effect size was large.'",
              question:
                "Write the single word that introduces the concession in this sentence.",
              correctIds: ["admittedly", "admittedly,"],
              explanation:
                "'Admittedly' signals that the writer grants a weakness before answering it with 'yet'. Recognising this concession marker is essential, because a concession strengthens an argument only when it is followed by a rebuttal.",
            },
          ],
        },
        {
          id: "bitl-analytical-exposition-stylistic-devices",
          title: "Stylistic Devices in Argument",
          estimatedMinutes: 70,
          materi: {
            ringkasan:
              "Stylistic devices are not decoration; in argumentative writing they shape emphasis, rhythm, and memorability, and they can either strengthen or undermine credibility. Advanced analysis distinguishes devices that clarify (parallelism, antithesis, anaphora) from those that inflate (hyperbole, overextended metaphor) and from those that manipulate (loaded framing, false dilemma). Effective writers choose devices that match the register and the strength of the evidence, since an ornate device attached to a weak claim draws attention to exactly the weakness the writer wanted concealed.",
            rumus: [
              "Parallelism: repeated grammatical structure across coordinated items for clarity and rhythm",
              "Antithesis: balanced contrast in parallel form (not because it is easy, but because it is hard)",
              "Anaphora: repetition of a word or phrase at the start of successive clauses",
              "Tricolon: a series of three parallel elements, which readers perceive as complete and memorable",
              "Metaphor and analogy: mapping one domain onto another to make an abstraction concrete",
              "Rhetorical question: a question asked for effect rather than answer, inviting assent",
              "Litotes and understatement: assertion through deliberate negation (not insignificant)",
              "False dilemma: presenting two options when more exist, which is a device turned into a fallacy",
              "Rule of register matching: device strength must not exceed evidence strength",
            ],
            contoh: [
              {
                soal:
                  "Identify the devices: 'The policy is cheap to design, harder to implement, and impossible to evaluate.'",
                pembahasan:
                  "This is a tricolon built on parallelism with escalating adjectives, producing antithesis-like contrast between the easy beginning and the impossible end. The escalation is persuasive but implies a judgement about feasibility that would still need supporting evidence.",
              },
              {
                soal:
                  "Explain the effect of the anaphora: 'We tried consultation. We tried incentives. We tried sanctions.'",
                pembahasan:
                  "The repeated 'We tried' emphasises exhaustive effort, which prepares the reader for the implicit conclusion that only stronger measures remain. It builds momentum while also setting up a potential false dilemma if other options are never named.",
              },
            ],
          },
          flashcards: [
            {
              id: "bitl-analytical-exposition-stylistic-devices-fc1",
              front: "Why does parallelism aid argument?",
              back: "Identical grammatical structures let readers compare items on the same footing, so the parallel form itself implies that the items are genuinely comparable, and it also makes the phrase easier to remember.",
            },
            {
              id: "bitl-analytical-exposition-stylistic-devices-fc2",
              front: "What is the difference between antithesis and a false dilemma?",
              back: "Antithesis is a balanced contrast that presents a genuine opposition, while a false dilemma presents only two options when more exist, turning a legitimate device into a fallacy.",
            },
            {
              id: "bitl-analytical-exposition-stylistic-devices-fc3",
              front: "Why is a tricolon especially memorable?",
              back: "Readers perceive a three-part series as complete and balanced, which gives the phrasing rhythm and closure, making it stick in memory more than a two- or four-part list.",
            },
            {
              id: "bitl-analytical-exposition-stylistic-devices-fc4",
              front: "What is the rule of register matching?",
              back: "The strength of a stylistic device must not exceed the strength of the evidence behind the claim; otherwise the ornament highlights the very weakness it was meant to disguise.",
            },
          ],
          quiz: [
            {
              id: "bitl-analytical-exposition-stylistic-devices-q1",
              question: "'Not because it is easy, but because it is hard' is an example of ...",
              options: ["Anaphora", "Antithesis", "Litotes", "Metonymy"],
              correctIndex: 1,
              explanation:
                "The two clauses are grammatically parallel and semantically opposed, which is the defining structure of antithesis.",
            },
            {
              id: "bitl-analytical-exposition-stylistic-devices-q2",
              question: "'We shall fight on the beaches, we shall fight on the landing grounds, we shall fight in the fields' illustrates ...",
              options: [
                "Anaphora combined with tricolon",
                "Litotes and irony",
                "Metaphor and hyperbole",
                "Understatement",
              ],
              correctIndex: 0,
              explanation:
                "The repeated 'we shall fight' is anaphora, and the three parallel locations form a tricolon, which together create rhythm and perceived completeness.",
            },
            {
              id: "bitl-analytical-exposition-stylistic-devices-q3",
              question: "Which device risks becoming a logical fallacy?",
              options: [
                "Parallelism",
                "False dilemma",
                "Rhetorical question",
                "Understatement",
              ],
              correctIndex: 1,
              explanation:
                "A false dilemma limits the reader to two options when others exist, so it stops being a stylistic choice and becomes a reasoning error.",
            },
            {
              id: "bitl-analytical-exposition-stylistic-devices-q4",
              question: "The phrase 'The results were not unimpressive' uses ...",
              options: ["Hyperbole", "Litotes", "Anaphora", "Asyndeton"],
              correctIndex: 1,
              explanation:
                "Litotes asserts something by negating its opposite, producing emphasis through deliberate understatement rather than direct praise.",
            },
          ],
          latihanSoal: [
            {
              id: "bitl-analytical-exposition-stylistic-devices-l1",
              level: "hots",
              question:
                "Read this passage: 'Our opponents call this reform reckless. Reckless? Reckless is doing nothing while classrooms crumble, while teachers leave, while children fall behind. The ministry has studied the problem for a decade; it has produced reports, panels, and press releases. What it has not produced is a single repaired roof. Is it any wonder that parents have lost faith?' (a) Identify four stylistic devices and quote them. (b) Explain the function of the anaphora. (c) Identify the rhetorical question and its effect. (d) Evaluate whether the emotive intensity is matched by evidence, and state the credibility risk.",
              langkah: [
                "Identify device 1: the rhetorical question 'Reckless?' used as a one-word retort, which turns the opponent's label back on them.",
                "Identify device 2: anaphora in the repeated 'while classrooms crumble, while teachers leave, while children fall behind'.",
                "Identify device 3: tricolon in 'reports, panels, and press releases', which conveys bureaucratic abundance through three parallel nouns.",
                "Identify device 4: antithesis in 'What it has not produced is a single repaired roof', contrasting process with outcome.",
                "Explain the anaphora's function: the repeated 'while' builds cumulative pressure, so the three harms feel simultaneous and systemic rather than isolated incidents.",
                "Explain the rhetorical question's effect: 'Is it any wonder that parents have lost faith?' invites the reader to supply the answer, which makes the conclusion feel self-evident rather than argued.",
                "Evaluate the evidence: the passage asserts crumbling classrooms, departing teachers, and falling achievement without a single figure, source, or comparison, so the emotional intensity far exceeds the evidentiary support.",
                "State the credibility risk: readers who suspect hyperbole may discount the entire case, and because the devices are so conspicuous, the absence of data becomes more noticeable rather than less.",
                "Recommend a fix: retain one or two devices but attach them to verifiable indicators such as maintenance backlog figures, teacher attrition rates, or assessment trends, so intensity is earned by evidence.",
              ],
              jawaban:
                "(a) Rhetorical question ('Reckless?'), anaphora ('while classrooms crumble, while teachers leave, while children fall behind'), tricolon ('reports, panels, and press releases'), and antithesis ('What it has not produced is a single repaired roof') (b) The anaphora builds cumulative pressure, making three separate harms feel like one systemic failure (c) The rhetorical question invites the reader to supply the answer, giving the conclusion an air of self-evidence (d) The emotive intensity is not matched by evidence: no figures, sources, or comparisons are offered, so readers suspecting hyperbole may dismiss the whole case, and the conspicuous devices actually draw attention to the missing data; adding verifiable indicators such as backlog and attrition figures would earn the intensity.",
            },
            {
              id: "bitl-analytical-exposition-stylistic-devices-l2",
              level: "sulit",
              question:
                "Two writers defend the same climate policy. Writer A: 'Either we act now or our grandchildren inherit a wasteland. The science is settled, the clock is ticking, and the choice is simple.' Writer B: 'The evidence does not justify delay. Models project substantial warming under current trajectories, though the range of outcomes is wide. Delay increases both the cost of mitigation and the scale of adaptation required.' (a) Identify the devices in each and classify them as clarifying, inflating, or manipulating. (b) Explain why Writer A's opening is a false dilemma. (c) Explain how Writer B achieves emphasis without rhetorical ornament. (d) Recommend which version is more appropriate for an academic audience and justify the choice with reference to the rule of register matching.",
              langkah: [
                "Classify Writer A's devices: 'Either we act now or our grandchildren inherit a wasteland' is a false dilemma combined with hyperbole, and the wasteland image is an escalating metaphor.",
                "Classify Writer A's remaining devices: 'the clock is ticking' is a metaphor of urgency, and 'the choice is simple' asserts simplicity rather than demonstrating it.",
                "Classify Writer B's devices: 'The evidence does not justify delay' is litotes-like understatement, and the balanced contrast between mitigation cost and adaptation scale is a mild antithesis.",
                "Explain the false dilemma: acting now and catastrophic inaction are not the only options, since delayed but substantial action, adaptation investment, and technology-dependent pathways all exist, so the frame excludes legitimate alternatives.",
                "Explain B's emphasis without ornament: negation ('does not justify') is a form of litotes that states a conclusion firmly while leaving room for the acknowledged uncertainty in the model range.",
                "Note B's structural emphasis: the parallel construction 'increases both the cost of mitigation and the scale of adaptation required' creates antithesis through parallelism rather than through emotive vocabulary.",
                "Apply the rule of register matching: Writer A's extravagant devices exceed what the cited evidence establishes, whereas Writer B's restrained devices match the admitted uncertainty in the projections.",
                "Recommend for an academic audience: Writer B, because academic readers reward calibrated claims and treat hyperbolic framing as a signal of weak evidence; Writer A's devices would likely reduce persuasiveness with that audience.",
              ],
              jawaban:
                "(a) Writer A: false dilemma ('either we act now or...'), hyperbole and metaphor ('wasteland'), urgency metaphor ('the clock is ticking'), and assertion of simplicity, which are inflating and manipulating. Writer B: understatement or litotes ('does not justify delay') and antithesis through parallelism (cost of mitigation against scale of adaptation), which are clarifying (b) It presents only two options, ignoring middle pathways such as delayed but substantial action, adaptation investment, and technology-dependent trajectories (c) Writer B creates emphasis through negation and parallel structure while openly conceding that the range of outcomes is wide (d) Writer B is more appropriate for an academic audience, because the rule of register matching requires device strength not to exceed evidence strength; A's hyperbole outruns the evidence and would signal weak reasoning, while B's restraint reflects the acknowledged uncertainty.",
            },
          ],
          tkaSoal: [
            {
              id: "bitl-analytical-exposition-stylistic-devices-tka1",
              bentuk: "pg",
              level: "L1",
              question:
                "Which term names the deliberate repetition of a word or phrase at the beginning of successive clauses?",
              options: [
                { id: "A", text: "Anaphora" },
                { id: "B", text: "Antithesis" },
                { id: "C", text: "Hyperbole" },
                { id: "D", text: "Litotes" },
                { id: "E", text: "Metonymy" },
              ],
              correctIds: ["A"],
              explanation:
                "Anaphora is repetition at the start of successive clauses. Antithesis balances opposites, hyperbole exaggerates, litotes understates by negation, and metonymy substitutes a related term.",
            },
            {
              id: "bitl-analytical-exposition-stylistic-devices-tka2",
              bentuk: "pg",
              level: "L2",
              stimulus:
                "Read the extract: 'The ministry has produced reports, panels, and press releases. What it has not produced is a single repaired roof.'",
              question: "Which device creates the contrast in the second sentence?",
              options: [
                { id: "A", text: "Anaphora across successive clauses" },
                { id: "B", text: "Antithesis balancing abundant process against absent outcome" },
                { id: "C", text: "A false dilemma restricting the reader to two options" },
                { id: "D", text: "Understatement that minimises a serious problem" },
                { id: "E", text: "Personification of the ministry as a builder" },
              ],
              correctIds: ["B"],
              explanation:
                "The sentence sets 'has produced' against 'has not produced', and the list of paperwork against a single physical result, which is antithesis. The three-item list 'reports, panels, and press releases' is a separate tricolon, but it is not the source of the contrast.",
            },
            {
              id: "bitl-analytical-exposition-stylistic-devices-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              stimulus:
                "Read the passage: 'Either we act now or our grandchildren inherit a wasteland. The science is settled, the clock is ticking, and the choice is simple. Every credible economist agrees, and anyone who doubts this simply does not care about children.'",
              question:
                "Which critical observations about this passage are valid? There is more than one correct answer. Click on every correct answer!",
              options: [
                { id: "A", text: "The opening presents a false dilemma by excluding middle pathways." },
                { id: "B", text: "'Any credible economist' is an unsupported appeal to authority." },
                { id: "C", text: "The final clause attacks the character of doubters rather than their evidence." },
                { id: "D", text: "The passage supports its urgency with specific figures and sources." },
                { id: "E", text: "'The clock is ticking' is a tricolon." },
              ],
              correctIds: ["A", "B", "C"],
              explanation:
                "The either/or frame excludes alternatives (A), the unspecified group of credible economists is an appeal to authority without evidence (B), and the closing clause is an ad hominem attack (C). D is false because no figures or sources appear, and E is false because 'the clock is ticking' is a single metaphor, whereas the tricolon is 'the science is settled, the clock is ticking, and the choice is simple'.",
            },
            {
              id: "bitl-analytical-exposition-stylistic-devices-tka4",
              bentuk: "isian",
              level: "L2",
              stimulus:
                "Read the sentence: 'The evidence does not justify delay.'",
              question:
                "Write the term for understatement produced by negating the opposite (one word).",
              correctIds: ["litotes"],
              explanation:
                "Litotes asserts something by negating its opposite: 'does not justify delay' means the evidence favours acting now. It is a restrained device that creates emphasis without exaggeration, which suits academic register.",
            },
          ],
        },
        {
          id: "bitl-analytical-exposition-synthesis-of-multiple-texts",
          title: "Synthesis of Multiple Texts",
          estimatedMinutes: 75,
          materi: {
            ringkasan:
              "Synthesis is not summary in sequence; it is the construction of a new, integrated position from several sources. A synthesis organises by idea rather than by source, showing where sources agree, where they conflict, and how the conflict can be resolved or left as a genuine open question. Advanced synthesis distinguishes convergence from mere repetition, identifies the methodological reasons behind disagreement, and avoids the patchwork effect in which each paragraph simply reports one author. Attribution must remain precise: readers should always know whose claim is being advanced.",
            rumus: [
              "Organise by idea, not by source: one paragraph, one integrated claim supported by several sources",
              "Convergence: independent sources reaching the same conclusion by different routes, which strengthens the claim",
              "Divergence: sources disagreeing because of population, method, timeframe, or definition",
              "Resolution strategies: explain the divergence by method, narrow the scope, or present both as conditional findings",
              "Attribution verbs: argues, reports, concedes, demonstrates, cautions, corroborates",
              "Reporting signals: according to, as demonstrated by, contrary to, consistent with",
              "Avoid the patchwork effect: never let a paragraph consist of one source summary after another",
              "Synthesis thesis: a claim that no single source made but that the combination supports",
            ],
            contoh: [
              {
                soal:
                  "Synthesise: 'Study A found homework improves achievement in mathematics. Study B found homework has no effect on achievement in primary school.'",
                pembahasan:
                  "The disagreement is probably scope-related: Study A concerns mathematics, where practice consolidates procedure, while Study B concerns primary learners, whose independent study skills are still developing. A defensible synthesis is that homework benefits achievement where the task type allows independent practice and the learners possess the required self-regulation, conditions less often met in early primary years.",
              },
              {
                soal:
                  "Improve the attribution: 'Scientists say social media is bad. Other scientists disagree.'",
                pembahasan:
                  "The sentence is unattributed and vague. A synthesis-grade version specifies who claims what and on what basis: 'Longitudinal studies such as those tracking adolescent cohorts report associations between heavy social media use and depressive symptoms, whereas cross-sectional surveys with broader measures find weak effects, a divergence often attributed to differences in exposure measurement.'",
              },
            ],
          },
          flashcards: [
            {
              id: "bitl-analytical-exposition-synthesis-of-multiple-texts-fc1",
              front: "What is the difference between summary and synthesis?",
              back: "Summary reports what one source says; synthesis builds a new integrated claim from several sources and organises the discussion by idea rather than by author.",
            },
            {
              id: "bitl-analytical-exposition-synthesis-of-multiple-texts-fc2",
              front: "What is the patchwork effect and why is it a problem?",
              back: "It is a text in which each paragraph simply summarises a different source in turn, so the writing reports rather than argues and the reader must construct the connection that the writer never made.",
            },
            {
              id: "bitl-analytical-exposition-synthesis-of-multiple-texts-fc3",
              front: "How do you resolve conflicting findings across sources?",
              back: "Look for methodological explanations such as differing populations, measures, timeframes, or definitions, then either explain the divergence, narrow the claim's scope, or present the findings as conditional on those variables.",
            },
            {
              id: "bitl-analytical-exposition-synthesis-of-multiple-texts-fc4",
              front: "What makes a synthesis thesis distinctive?",
              back: "It is a claim that no individual source stated, but which the combination of sources, properly compared and reconciled, supports.",
            },
          ],
          quiz: [
            {
              id: "bitl-analytical-exposition-synthesis-of-multiple-texts-q1",
              question: "The patchwork effect occurs when a writer ...",
              options: [
                "Cites too many sources in one sentence",
                "Summarises one source per paragraph without integrating them",
                "Misquotes a source",
                "Uses too many direct quotations",
              ],
              correctIndex: 1,
              explanation:
                "The text becomes a series of reports rather than an argument, leaving the reader to infer the connections the writer never made.",
            },
            {
              id: "bitl-analytical-exposition-synthesis-of-multiple-texts-q2",
              question:
                "Two studies disagree about the same intervention. What is the most productive first move in a synthesis?",
              options: [
                "Report both and let the reader decide",
                "Discard the weaker study",
                "Compare their populations, measures, and timeframes to explain the divergence",
                "Average their results",
              ],
              correctIndex: 2,
              explanation:
                "Methodological comparison usually reveals why findings differ, which allows the writer to produce an integrated claim instead of a contradiction.",
            },
            {
              id: "bitl-analytical-exposition-synthesis-of-multiple-texts-q3",
              question: "Which verb most precisely signals that a source agrees with an earlier claim?",
              options: ["Concedes", "Corroborates", "Cautions", "Speculates"],
              correctIndex: 1,
              explanation:
                "'Corroborates' means to support with independent evidence, which is exactly the relationship of confirmation between sources.",
            },
            {
              id: "bitl-analytical-exposition-synthesis-of-multiple-texts-q4",
              question: "A synthesis thesis is distinctive because it ...",
              options: [
                "restates the first source in the writer's own words",
                "lists every source consulted",
                "makes a claim that emerges from combining sources rather than from any single one",
                "summarises the strongest study",
              ],
              correctIndex: 2,
              explanation:
                "Synthesis produces a new integrated position; if one source already stated it, the writer has summarised rather than synthesised.",
            },
          ],
          latihanSoal: [
            {
              id: "bitl-analytical-exposition-synthesis-of-multiple-texts-l1",
              level: "hots",
              question:
                "Write a synthesis paragraph from these three sources. Source 1: a randomised trial (n = 1,200) reports that a four-day school week raised attendance by 6 percent without lowering standardised scores. Source 2: a survey of 300 rural parents finds that 68 percent report childcare difficulties under a four-day week. Source 3: an economic analysis concludes that four-day weeks save districts 3 to 5 percent of transport costs but increase family childcare spending by more than the savings. (a) Identify the convergence and the divergence. (b) Explain the divergence rather than merely reporting it. (c) Write a synthesis thesis supported by all three. (d) Write the paragraph organising by idea, not by source.",
              langkah: [
                "Identify convergence: all three sources treat the four-day week as having measurable effects, and Sources 1 and 3 both acknowledge that it changes outcomes in more than one domain.",
                "Identify divergence: Source 1 measures institutional benefits such as attendance, while Sources 2 and 3 measure family-level burdens, so they are not actually contradicting each other.",
                "Explain the divergence: the studies differ in unit of analysis, since the trial measures school-level outcomes while the survey and economic analysis measure household effects.",
                "Reconcile the divergence: the findings can both be true because costs and benefits fall on different parties, which is a distributional rather than a factual disagreement.",
                "Draft a synthesis thesis: four-day weeks can improve school-level indicators, but their net social benefit depends on whether savings are redirected to offset the childcare burden they shift onto families.",
                "Write the topic sentence of the synthesis paragraph around that thesis rather than around any one source.",
                "Develop the paragraph with the convergence first, citing the trial's attendance gain and the economic analysis's transport saving as independent institutional benefits.",
                "Then introduce the family-level evidence from the survey and the economic analysis as a counterweight that explains why the institutional gain does not settle the policy question.",
                "Conclude the paragraph by stating the condition under which the policy is justified, which is the integrated claim no single source made.",
              ],
              jawaban:
                "(a) Convergence: all sources agree the four-day week has measurable effects and that the effects span more than one domain. Divergence: Source 1 reports institutional gains while Sources 2 and 3 report family-level burdens (b) The divergence is explained by unit of analysis: the trial measures school-level outcomes, whereas the survey and economic analysis measure household effects, so the findings can both hold because costs and benefits fall on different parties, making this a distributional rather than factual disagreement (c) Synthesis thesis: four-day weeks can improve school-level indicators, but their net social benefit depends on whether savings are redirected to offset the childcare burden shifted onto families (d) Sample paragraph: 'Four-day school weeks produce benefits that are real but unevenly distributed. A randomised trial of 1,200 students found a six percent attendance gain with no fall in standardised scores, and an economic analysis independently estimates transport savings of three to five percent, so the institutional case is supported by two different kinds of evidence. Yet the household picture is less favourable: a survey of 300 rural parents found 68 percent reporting childcare difficulties, and the same economic analysis shows family childcare spending rising beyond district savings. The disagreement between these findings is therefore not about facts but about who bears the costs, since schools capture the savings while families absorb the burden. The policy is justified only where districts redirect part of those savings into childcare provision.'",
            },
            {
              id: "bitl-analytical-exposition-synthesis-of-multiple-texts-l2",
              level: "sulit",
              question:
                "Four sources address AI tutoring in schools. Source 1: a meta-analysis of 20 studies finds a moderate positive effect on mathematics achievement, but notes high heterogeneity. Source 2: a qualitative study in two urban districts reports that students with strong self-regulation benefit most, while others disengage. Source 3: a policy brief warns that AI tutoring may widen achievement gaps without teacher oversight. Source 4: a cost-effectiveness review finds AI tutoring cheaper per hour than human tutoring but with a wider confidence interval. (a) Distinguish genuine convergence from repeated claims across sources. (b) Explain the role of Source 1's heterogeneity in reconciling Sources 2 and 3. (c) Identify which source provides the most decision-relevant information for a school with a limited budget and justify your answer. (d) Write a synthesis thesis that acknowledges the uncertainty without becoming vacuous.",
              langkah: [
                "Distinguish convergence proper: Sources 1 and 2 independently identify learner self-regulation as a moderator, one through quantitative heterogeneity and one through qualitative observation, so these are different routes to the same conclusion.",
                "Identify mere repetition: Sources 1 and 4 both concern effectiveness magnitudes, so agreement between them is about measurement rather than independent confirmation of mechanism.",
                "Explain the heterogeneity: a moderate average effect with high heterogeneity means the effect varies systematically across contexts, which is precisely the variation Source 2 describes at learner level.",
                "Connect Source 3 to the heterogeneity: the gap-widening warning is a plausible consequence of that variation, since those who benefit most pull ahead while those who disengage fall further behind.",
                "Assess Source 4 for decision relevance: the cost-effectiveness review quantifies expense per hour and exposes a wide confidence interval, which matters most to a budget-constrained school that must justify spending.",
                "Note what Source 4's wide interval implies: the savings estimate is uncertain, so budgeting on optimistic assumptions would be risky.",
                "Draft a thesis that admits uncertainty without becoming vacuous: AI tutoring raises achievement on average and lowers cost per hour, but its benefits concentrate among self-regulated learners, so it should be deployed as a supplement under teacher oversight to avoid widening gaps.",
                "Verify the thesis is falsifiable: it specifies the moderator (self-regulation), the condition (teacher oversight), and the risk (widening gaps), so evidence could confirm or challenge it.",
              ],
              jawaban:
                "(a) Genuine convergence: Sources 1 and 2 independently identify self-regulation as a moderator, one quantitatively and one qualitatively. Mere repetition: Sources 1 and 4 both report effectiveness magnitudes, so their agreement concerns measurement round the same question rather than independent confirmation (b) The high heterogeneity in Source 1's moderate average effect means the effect varies systematically by context, which is exactly the learner-level variation Source 2 describes; Source 3's gap-widening warning is then a plausible consequence, since those who benefit pull ahead while disengaged learners fall further behind (c) Source 4, because a budget-limited school must decide on cost per hour, and the review supplies that figure while also revealing a wide confidence interval that warns against budgeting on optimistic assumptions (d) Thesis: AI tutoring raises achievement on average and lowers cost per hour, but its benefits concentrate among self-regulated learners, so it should be deployed as a supplement under teacher oversight to avoid widening gaps.",
            },
          ],
          tkaSoal: [
            {
              id: "bitl-analytical-exposition-synthesis-of-multiple-texts-tka1",
              bentuk: "pg",
              level: "L1",
              question: "What distinguishes synthesis from summary?",
              options: [
                { id: "A", text: "Synthesis reports one source in detail; summary reports many." },
                { id: "B", text: "Synthesis builds a new integrated claim from several sources organised by idea." },
                { id: "C", text: "Synthesis quotes sources directly; summary paraphrases them." },
                { id: "D", text: "Synthesis only lists where sources disagree." },
                { id: "E", text: "Synthesis avoids citing sources to keep the writing smooth." },
              ],
              correctIds: ["B"],
              explanation:
                "Synthesis organises by idea and constructs a claim that no single source made, whereas summary reports what one source says. Direct quotation, disagreement lists, and citation avoidance are not defining features of synthesis.",
            },
            {
              id: "bitl-analytical-exposition-synthesis-of-multiple-texts-tka2",
              bentuk: "pg",
              level: "L2",
              stimulus:
                "Read the notes. Source 1: a randomised trial of 1,200 students found a six percent attendance gain. Source 2: a survey of 300 rural parents found 68 percent reporting childcare difficulties. Source 3: an economic analysis estimates transport savings of three to five percent.",
              question:
                "Which synthesising sentence organises by idea rather than by source?",
              options: [
                { id: "A", text: "Source 1 found attendance gains. Source 2 found childcare difficulties. Source 3 estimated savings." },
                { id: "B", text: "Four-day weeks raise attendance and cut transport costs, but shift childcare burdens onto families." },
                { id: "C", text: "Source 1 is a trial, Source 2 is a survey, and Source 3 is an economic analysis." },
                { id: "D", text: "Three sources discuss four-day school weeks in different ways." },
                { id: "E", text: "The sources disagree, so no conclusion can be drawn." },
              ],
              correctIds: ["B"],
              explanation:
                "Option B integrates all three findings into one claim about benefits and burdens, which is organisation by idea. Options A, C, and D either report sources one by one (the patchwork effect) or describe only their methods, and E refuses to synthesise at all.",
            },
            {
              id: "bitl-analytical-exposition-synthesis-of-multiple-texts-tka3",
              bentuk: "pgk-mcma",
              level: "L3",
              stimulus:
                "Read the sources. Source 1: a meta-analysis of 20 studies finds a moderate positive effect of AI tutoring on mathematics achievement, but notes high heterogeneity. Source 2: a qualitative study reports that students with strong self-regulation benefit most while others disengage. Source 3: a policy brief warns that AI tutoring may widen achievement gaps without teacher oversight. Source 4: a cost-effectiveness review finds AI tutoring cheaper per hour than human tutoring, with a wide confidence interval.",
              question:
                "Which statements are valid conclusions from these sources? There is more than one correct answer. Click on every correct answer!",
              options: [
                { id: "A", text: "Sources 1 and 2 converge independently on self-regulation as a moderator." },
                { id: "B", text: "Source 1's high heterogeneity is consistent with the variation Source 2 observes." },
                { id: "C", text: "Source 3's warning is implausible given the moderate average effect in Source 1." },
                { id: "D", text: "Source 4's cost estimate carries real uncertainty because its interval is wide." },
                { id: "E", text: "The evidence proves AI tutoring should replace human teachers entirely." },
              ],
              correctIds: ["A", "B", "D"],
              explanation:
                "Source 1 reaches the moderator quantitatively while Source 2 reaches it qualitatively, so they converge independently (A). A moderate average with high heterogeneity implies systematic variation, exactly what Source 2 describes (B). A wide confidence interval means the savings figure is uncertain (D). C is wrong because gap-widening follows plausibly from the heterogeneity, and E is unsupported because no source tests replacement.",
            },
            {
              id: "bitl-analytical-exposition-synthesis-of-multiple-texts-tka4",
              bentuk: "isian",
              level: "L3",
              stimulus:
                "A synthesis paragraph reports Source 1's findings, then Source 2's findings, then Source 3's findings, in three separate sentences without linking them.",
              question:
                "Write the two-word name for this compositional flaw (one source after another, with no integration).",
              correctIds: ["patchwork effect", "patchwork", "patchwork writing"],
              explanation:
                "This is the patchwork effect: the paragraph reads as a sequence of source summaries rather than one integrated claim. It is repaired by grouping sources under shared ideas and stating what their combination shows.",
            },
          ],
        },
      ],
    },
  ],
};

/* ------------------------------------------------------------------
 * AGREGASI: DAFTAR SUBJECT & HELPER PENELUSURAN
 * ----------------------------------------------------------------*/

/** Kelima mata pelajaran TKA beserta seluruh bab dan anak sub-babnya. */
export const SUBJECTS: Subject[] = [
  MATEMATIKA_WAJIB,
  BAHASA_INDONESIA,
  BAHASA_INGGRIS_WAJIB,
  MATEMATIKA_TINGKAT_LANJUT,
  BAHASA_INGGRIS_TINGKAT_LANJUT,
];

/** Semua Chapter (Bab) dari seluruh mata pelajaran. */
export const ALL_CHAPTERS: Chapter[] = SUBJECTS.flatMap(
  (subject) => subject.chapters,
);

/**
 * Daftar datar seluruh anak sub-bab, lengkap dengan konteks induknya.
 * Urutannya mengikuti roadmap: mapel -> bab (order) -> sub-bab.
 */
export const ALL_SUBTOPICS: FlatSubtopic[] = (() => {
  const result: FlatSubtopic[] = [];
  let step = 0;
  for (const subject of SUBJECTS) {
    const orderedChapters = [...subject.chapters].sort(
      (a, b) => a.order - b.order,
    );
    for (const chapter of orderedChapters) {
      for (const subtopic of chapter.subtopics) {
        step += 1;
        result.push({
          ...subtopic,
          subjectId: subject.id,
          subjectTitle: subject.title,
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          step,
        });
      }
    }
  }
  return result;
})();

/**
 * Semua ID anak sub-bab, dipakai untuk menghitung progres dan
 * menyaring data tersimpan di LocalStorage.
 *
 * CATATAN KOMPATIBILITAS: array ini menggabungkan ID versi lama
 * (ID Bab, mis. "mw-aljabar") dengan ID baru (ID anak sub-bab,
 * mis. "mw-aljabar-nilai-mutlak") supaya progres lama tetap terbaca.
 */
export const ALL_SUBTOPIC_IDS: string[] = (() => {
  const ids = new Set<string>();
  for (const subject of SUBJECTS) {
    for (const chapter of subject.chapters) {
      ids.add(chapter.id);
      for (const subtopic of chapter.subtopics) {
        ids.add(subtopic.id);
      }
    }
  }
  return [...ids];
})();

/** Total anak sub-bab (unit checklist terkecil). */
export const TOTAL_SUBTOPICS = ALL_SUBTOPICS.length;

/** Total bab di seluruh mata pelajaran. */
export const TOTAL_CHAPTERS = ALL_CHAPTERS.length;

/** Cari satu anak sub-bab berdasarkan ID-nya. */
export function findSubtopicById(id: string): FlatSubtopic | undefined {
  return ALL_SUBTOPICS.find((subtopic) => subtopic.id === id);
}

/** Cari satu Chapter (Bab) berdasarkan ID-nya. */
export function findChapterById(id: string): Chapter | undefined {
  return ALL_CHAPTERS.find((chapter) => chapter.id === id);
}

/** Cari satu Subject berdasarkan ID-nya. */
export function findSubjectById(id: string): Subject | undefined {
  return SUBJECTS.find((subject) => subject.id === id);
}

/** Ambil seluruh anak sub-bab milik satu mata pelajaran. */
export function getSubtopicsBySubject(subjectId: string): FlatSubtopic[] {
  return ALL_SUBTOPICS.filter((subtopic) => subtopic.subjectId === subjectId);
}

/** Ambil seluruh anak sub-bab milik satu bab. */
export function getSubtopicsByChapter(chapterId: string): FlatSubtopic[] {
  return ALL_SUBTOPICS.filter((subtopic) => subtopic.chapterId === chapterId);
}

