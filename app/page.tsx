"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import {
  ALL_SUBTOPICS,
  ALL_SUBTOPIC_IDS,
  SUBJECTS,
  TOTAL_SUBTOPICS,
  getSubtopicsBySubject,
  type AccentColor,
  type Subject,
  type Subtopic,
} from "./data/curriculum";

import TkaExercise, {
  isSubtopicUnlocked,
  tkaCorrectCount,
  type AnswerMap,
} from "./components/TkaExercise";

/* ------------------------------------------------------------------
 * 1. KONFIGURASI & DATA MATERI TKA
 * ----------------------------------------------------------------*/

/** Target waktu belajar (30 hari) dihitung sejak halaman pertama dibuka. */
const PLANNER_DURATION_DAYS = 30;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

/** Kunci penyimpanan LocalStorage. */
const STORAGE_KEY_PROGRESS = "tka-planner:progress:v1";
const STORAGE_KEY_START = "tka-planner:start-date:v1";
const STORAGE_KEY_ANSWERS = "tka-planner:answers:v1";


/* ------------------------------------------------------------------
 * 2. HELPER & KONSTANTA STYLING
 * ----------------------------------------------------------------*/

type ProgressMap = Record<string, boolean>;

/** Kumpulan class Tailwind per warna aksen (harus literal agar terbaca Tailwind). */
const ACCENT_STYLES: Record<
  AccentColor,
  { bar: string; chipActive: string; iconBg: string; text: string; soft: string }
> = {
  indigo: {
    bar: "bg-indigo-500",
    chipActive: "bg-indigo-600 text-white border-indigo-600 shadow-indigo-200",
    iconBg: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    text: "text-indigo-600",
    soft: "bg-indigo-50 text-indigo-700 border-indigo-100",
  },
  rose: {
    bar: "bg-rose-500",
    chipActive: "bg-rose-600 text-white border-rose-600 shadow-rose-200",
    iconBg: "bg-rose-50 text-rose-600 ring-rose-100",
    text: "text-rose-600",
    soft: "bg-rose-50 text-rose-700 border-rose-100",
  },
  sky: {
    bar: "bg-sky-500",
    chipActive: "bg-sky-600 text-white border-sky-600 shadow-sky-200",
    iconBg: "bg-sky-50 text-sky-600 ring-sky-100",
    text: "text-sky-600",
    soft: "bg-sky-50 text-sky-700 border-sky-100",
  },
  amber: {
    bar: "bg-amber-500",
    chipActive: "bg-amber-500 text-white border-amber-500 shadow-amber-200",
    iconBg: "bg-amber-50 text-amber-600 ring-amber-100",
    text: "text-amber-600",
    soft: "bg-amber-50 text-amber-700 border-amber-100",
  },
  emerald: {
    bar: "bg-emerald-500",
    chipActive:
      "bg-emerald-600 text-white border-emerald-600 shadow-emerald-200",
    iconBg: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    text: "text-emerald-600",
    soft: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
};

function percent(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}

function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} menit`;
  if (minutes === 0) return `${hours} jam`;
  return `${hours} jam ${minutes} menit`;
}

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

/** Ambil tanggal awal belajar dari LocalStorage, atau buat baru (hari ini). */
function readOrCreateStartDate(): number {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY_START);
    if (stored) {
      const parsed = Number.parseInt(stored, 10);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
    const now = Date.now();
    window.localStorage.setItem(STORAGE_KEY_START, String(now));
    return now;
  } catch {
    // LocalStorage bisa diblokir (private mode). Fallback ke waktu sekarang.
    return Date.now();
  }
}

/** Baca checklist dari LocalStorage + sanitasi terhadap ID yang dikenal. */
function readStoredProgress(): ProgressMap {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    const source = parsed as Record<string, unknown>;
    const result: ProgressMap = {};
    for (const id of ALL_SUBTOPIC_IDS) {
      if (source[id] === true) result[id] = true;
    }
    return result;
  } catch {
    return {};
  }
}

/** Semua id soal TKA (untuk sanitasi data tersimpan). */
const ALL_TKA_IDS: string[] = ALL_SUBTOPICS.flatMap((st) =>
  (st.tkaSoal ?? []).map((q) => q.id),
);

/** Baca jawaban TKA tersimpan + sanitasi terhadap id soal yang dikenal. */
function readStoredAnswers(): AnswerMap {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_ANSWERS);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const source = parsed as Record<string, unknown>;
    const result: AnswerMap = {};
    for (const id of ALL_TKA_IDS) {
      const v = source[id];
      if (
        Array.isArray(v) &&
        v.length > 0 &&
        v.every((x) => typeof x === "string")
      ) {
        result[id] = v as string[];
      }
    }
    return result;
  } catch {
    return {};
  }
}

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Sisa waktu dalam milidetik (negatif bila tenggat terlewati). */
  remainingMs: number;
  isOverdue: boolean;
  /** Persentase waktu yang sudah terpakai (0-100). */
  elapsedPercent: number;
  targetLabel: string;
  startLabel: string;
};

function buildCountdown(startMs: number, nowMs: number): Countdown {
  const targetMs = startMs + PLANNER_DURATION_DAYS * DAY_IN_MS;
  const remainingMs = targetMs - nowMs;
  const clamped = Math.max(remainingMs, 0);

  const formatter = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return {
    days: Math.floor(clamped / DAY_IN_MS),
    hours: Math.floor((clamped % DAY_IN_MS) / (60 * 60 * 1000)),
    minutes: Math.floor((clamped % (60 * 60 * 1000)) / (60 * 1000)),
    seconds: Math.floor((clamped % (60 * 1000)) / 1000),
    remainingMs,
    isOverdue: remainingMs <= 0,
    elapsedPercent: Math.min(
      100,
      Math.max(0, percent(nowMs - startMs, PLANNER_DURATION_DAYS * DAY_IN_MS)),
    ),
    targetLabel: formatter.format(new Date(targetMs)),
    startLabel: formatter.format(new Date(startMs)),
  };
}

/* ------------------------------------------------------------------
 * 3. HOOK KHUSUS
 * ----------------------------------------------------------------*/

/** Subscribe ke ticker global 1 detik (dipakai countdown). */
function subscribeToSecond(onStoreChange: () => void): () => void {
  const intervalId = window.setInterval(onStoreChange, 1000);
  return () => window.clearInterval(intervalId);
}

/**
 * Waktu sekarang (ms) yang diperbarui tiap detik.
 * `getServerSnapshot` mengembalikan null agar render pertama di server
 * konsisten, sehingga React akan hydrate ulang dengan waktu asli di client.
 */
function useNow(): number | null {
  return useSyncExternalStore(
    subscribeToSecond,
    () => Math.floor(Date.now() / 1000) * 1000,
    () => null,
  );
}

/* ------------------------------------------------------------------
 * 4. KOMPONEN UTAMA (CLIENT COMPONENT)
 * ----------------------------------------------------------------*/

export default function StudyPlannerPage() {
  /* ---------------- STATE ---------------- */
  /* Lazy initializer: dibaca sekali saat client mount. Selama render di
   * server, `typeof window === "undefined"` sehingga nilai default dipakai
   * dan tidak terjadi hydration mismatch. */
  const [progress, setProgress] = useState<ProgressMap>(() =>
    typeof window === "undefined" ? {} : readStoredProgress(),
  );
  /** Jawaban TKA per soal (questionId -> opsi terpilih / teks isian). */
  const [answers, setAnswers] = useState<AnswerMap>(() =>
    typeof window === "undefined" ? {} : readStoredAnswers(),
  );
  /** Sub-materi yang sedang dibuka panel latihan TKA-nya. */
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [startMs, setStartMs] = useState<number | null>(() =>
    typeof window === "undefined" ? null : readOrCreateStartDate(),
  );

  /** Waktu sekarang, di-update otomatis tiap detik tanpa setState di effect. */
  const nowMs = useNow();

  /* ------- PERSIST: simpan checklist tiap berubah ------- */
  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY_PROGRESS,
        JSON.stringify(progress),
      );
    } catch {
      // Abaikan kegagalan storage (quota habis / diblokir).
    }
  }, [progress]);

  /* ------- PERSIST: simpan jawaban TKA tiap berubah ------- */
  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY_ANSWERS,
        JSON.stringify(answers),
      );
    } catch {
      // Abaikan kegagalan storage.
    }
  }, [answers]);

  /* ---------------- ACTIONS ---------------- */
  const setAnswer = useCallback((questionId: string, value: string[]) => {
    setAnswers((prev) => {
      const next = { ...prev };
      if (value.length === 0) delete next[questionId];
      else next[questionId] = value;
      return next;
    });
  }, []);

  const toggleExpanded = useCallback((id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleSubtopic = useCallback(
    (subtopic: Subtopic) => {
      setProgress((prev) => {
        // Membatalkan centang selalu boleh.
        if (prev[subtopic.id]) {
          const next = { ...prev };
          delete next[subtopic.id];
          return next;
        }
        // Mencentang "Selesai" hanya bila semua soal TKA sudah benar.
        if (!isSubtopicUnlocked(subtopic, answers)) return prev;
        return { ...prev, [subtopic.id]: true };
      });
    },
    [answers],
  );

  const resetProgress = useCallback(() => {
    setProgress({});
    setAnswers({});
    setExpanded({});
    try {
      window.localStorage.removeItem(STORAGE_KEY_ANSWERS);
    } catch {
      // Abaikan.
    }
  }, []);

  const setSubjectAll = useCallback(
    (subject: Subject, done: boolean) => {
      setProgress((prev) => {
        const next = { ...prev };
        for (const chapter of subject.chapters) {
          for (const subtopic of chapter.subtopics) {
            if (!done) {
              delete next[subtopic.id];
              continue;
            }
            // Hanya sub-materi yang sudah terbuka yang boleh dicentang massal.
            if (isSubtopicUnlocked(subtopic, answers)) next[subtopic.id] = true;
          }
        }
        return next;
      });
    },
    [answers],
  );

  const restartPlanner = useCallback(() => {
    const now = Date.now();
    try {
      window.localStorage.setItem(STORAGE_KEY_START, String(now));
    } catch {
      // Abaikan.
    }
    setStartMs(now);
  }, []);

  /* ---------------- DERIVED DATA ---------------- */
  const doneCount = useMemo(
    () => ALL_SUBTOPIC_IDS.filter((id) => progress[id]).length,
    [progress],
  );
  const totalPercent = percent(doneCount, TOTAL_SUBTOPICS);

  const allSubtopics = useMemo(() => ALL_SUBTOPICS, []);

  const doneMinutes = useMemo(
    () =>
      allSubtopics
        .filter((subtopic) => progress[subtopic.id])
        .reduce((sum, subtopic) => sum + subtopic.estimatedMinutes, 0),
    [allSubtopics, progress],
  );

  const totalMinutes = useMemo(
    () =>
      allSubtopics.reduce((sum, subtopic) => sum + subtopic.estimatedMinutes, 0),
    [allSubtopics],
  );

  const subjectStats = useMemo(
    () =>
      SUBJECTS.map((subject) => {
        const subjectSubtopics = getSubtopicsBySubject(subject.id);
        const subjectDone = subjectSubtopics.filter(
          (subtopic) => progress[subtopic.id],
        ).length;
        return {
          subject,
          done: subjectDone,
          total: subjectSubtopics.length,
          percent: percent(subjectDone, subjectSubtopics.length),
        };
      }),
    [progress],
  );

  const countdown = useMemo<Countdown | null>(
    () =>
      startMs === null || nowMs === null ? null : buildCountdown(startMs, nowMs),
    [startMs, nowMs],
  );

  /** Mata pelajaran yang lolos filter tab + pencarian. */
  const visibleSubjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return SUBJECTS.filter(
      (subject) => activeFilter === "all" || subject.id === activeFilter,
    )
      .map((subject) => {
        const subjectSubtopics = getSubtopicsBySubject(subject.id);
        return {
          subject,
          subtopics: query
            ? subjectSubtopics.filter(
                (subtopic) =>
                  subtopic.title.toLowerCase().includes(query) ||
                  subject.title.toLowerCase().includes(query),
              )
            : subjectSubtopics,
        };
      })
      .filter((entry) => entry.subtopics.length > 0);
  }, [activeFilter, searchQuery]);

  /** Rekomendasi target harian: sisa sub-materi dibagi sisa hari. */
  const dailyTarget = useMemo(() => {
    const remainingItems = TOTAL_SUBTOPICS - doneCount;
    if (remainingItems === 0) return { items: 0, minutes: 0, daysLeft: 0 };
    const daysLeft = countdown?.isOverdue
      ? 1
      : Math.max(1, Math.ceil((countdown?.remainingMs ?? DAY_IN_MS) / DAY_IN_MS));
    const remainingMinutes = totalMinutes - doneMinutes;
    return {
      items: Math.ceil(remainingItems / daysLeft),
      minutes: Math.ceil(remainingMinutes / daysLeft),
      daysLeft,
    };
  }, [countdown, doneCount, doneMinutes, totalMinutes]);

  return (
    <div className="min-h-full bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* ================= HEADER ================= */}
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1 text-[11px] font-semibold tracking-wide text-indigo-600 uppercase shadow-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
              Persiapan TKA · SMA Kelas 12
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Study Planner TKA
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Kelola kisi-kisi materi TKA untuk 5 mata pelajaran dalam satu
              dashboard. Centang sub-materi yang sudah dikuasai, pantau progres,
              dan kejar target dalam 30 hari.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
                Mulai belajar
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {countdown ? countdown.startLabel : "—"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
                Tenggat (H+{PLANNER_DURATION_DAYS})
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {countdown ? countdown.targetLabel : "—"}
              </p>
            </div>
          </div>
        </header>

        {/* ============ DASHBOARD: COUNTDOWN + PROGRES TOTAL ============ */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
                Countdown Target 30 Hari
              </h2>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  countdown?.isOverdue
                    ? "border-red-100 bg-red-50 text-red-600"
                    : "border-emerald-100 bg-emerald-50 text-emerald-600"
                }`}
              >
                {countdown
                  ? countdown.isOverdue
                    ? "Tenggat terlewati"
                    : "On track"
                  : "Memuat…"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
              {[
                { label: "Hari", value: countdown ? pad2(countdown.days) : "--" },
                { label: "Jam", value: countdown ? pad2(countdown.hours) : "--" },
                {
                  label: "Menit",
                  value: countdown ? pad2(countdown.minutes) : "--",
                },
                {
                  label: "Detik",
                  value: countdown ? pad2(countdown.seconds) : "--",
                },
              ].map((unit) => (
                <div
                  key={unit.label}
                  className="rounded-xl bg-slate-900 px-2 py-3 text-center shadow-sm"
                >
                  <p className="font-mono text-2xl font-bold tracking-tight text-white tabular-nums sm:text-3xl">
                    {unit.value}
                  </p>
                  <p className="mt-1 text-[11px] font-medium tracking-wide text-slate-400 uppercase">
                    {unit.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Waktu terpakai dari 30 hari</span>
                <span className="tabular-nums">
                  {countdown ? `${countdown.elapsedPercent}%` : "—"}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-400 transition-all duration-500"
                  style={{ width: `${countdown?.elapsedPercent ?? 0}%` }}
                />
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold tracking-wide text-amber-700 uppercase">
                Target harian rekomendasi
              </p>
              <p className="mt-1 text-sm text-amber-900">
                {dailyTarget.items > 0 ? (
                  <>
                    Selesaikan{" "}
                    <span className="font-bold">
                      {dailyTarget.items} sub-materi
                    </span>{" "}
                    (~{formatMinutes(dailyTarget.minutes)}) per hari selama{" "}
                    <span className="font-bold">
                      {dailyTarget.daysLeft} hari tersisa
                    </span>{" "}
                    agar semua materi tuntas tepat waktu.
                  </>
                ) : (
                  <>🎉 Semua materi sudah tuntas. Saatnya fokus latihan soal!</>
                )}
              </p>
            </div>
          </div>

          {/* ============ PROGRES TOTAL ============ */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
                Progres Total
              </h2>
              <p className="mt-3 text-5xl font-bold tracking-tight text-slate-900 tabular-nums">
                {totalPercent}
                <span className="text-2xl text-slate-400">%</span>
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {doneCount} dari {TOTAL_SUBTOPICS} sub-materi selesai
              </p>
            </div>

            <div className="mt-5">
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                  style={{ width: `${totalPercent}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>Durasi belajar tuntas</span>
                <span className="font-semibold tabular-nums text-slate-700">
                  {formatMinutes(doneMinutes)} / {formatMinutes(totalMinutes)}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={resetProgress}
                disabled={doneCount === 0}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-600"
              >
                Reset Semua Checklist
              </button>
              <button
                type="button"
                onClick={restartPlanner}
                className="w-full rounded-xl px-4 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              >
                Mulai ulang hitungan 30 hari dari hari ini
              </button>
            </div>
          </div>
        </section>

        {/* ============ PROGRES PER MATA PELAJARAN ============ */}
        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Progres per Mata Pelajaran
              </h2>
              <p className="text-sm text-slate-500">
                Pantau pemerataan persiapan di setiap mapel.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {subjectStats.map(({ subject, done, total, percent: subjectPercent }) => {
              const accent = ACCENT_STYLES[subject.accent];
              const isComplete = subjectPercent === 100;
              return (
                <div
                  key={subject.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ring-1 ${accent.iconBg}`}
                      aria-hidden="true"
                    >
                      {subject.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {subject.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {done}/{total} sub-materi selesai
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-lg px-2 py-1 text-xs font-bold tabular-nums ${
                        isComplete
                          ? "bg-emerald-50 text-emerald-600"
                          : `${accent.soft} border`
                      }`}
                    >
                      {subjectPercent}%
                    </span>
                  </div>

                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${accent.bar}`}
                      style={{ width: `${subjectPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============ FILTER TABS + SEARCH ============ */}
        <section className="mt-10">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="-mx-1 flex flex-wrap gap-2 px-1">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                aria-pressed={activeFilter === "all"}
                className={`rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 ${
                  activeFilter === "all"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                🗂️ Semua ({TOTAL_SUBTOPICS})
              </button>

              {subjectStats.map(({ subject, total, done }) => {
                const accent = ACCENT_STYLES[subject.accent];
                const isActive = activeFilter === subject.id;
                return (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => setActiveFilter(subject.id)}
                    aria-pressed={isActive}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 ${
                      isActive
                        ? accent.chipActive
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    <span aria-hidden="true">{subject.icon}</span>{" "}
                    {subject.shortTitle}
                    <span
                      className={`ml-2 rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${
                        isActive ? "bg-white/20" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {done}/{total}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full xl:w-72">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
                🔍
              </span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Cari sub-materi…"
                aria-label="Cari sub-materi"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3 pl-9 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* ============ DAFTAR MATERI (CHECKLIST) ============ */}
        <section className="mt-6 space-y-5">
          {visibleSubjects.map(({ subject, subtopics }) => {
            const accent = ACCENT_STYLES[subject.accent];
            const subjectSubtopics = getSubtopicsBySubject(subject.id);
            const subjectDone = subjectSubtopics.filter(
              (subtopic) => progress[subtopic.id],
            ).length;
            const subjectPercent = percent(subjectDone, subjectSubtopics.length);
            const allDone = subjectPercent === 100;

            return (
              <article
                key={subject.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-100 p-5">
                  <div className="flex flex-wrap items-start gap-3">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ring-1 ${accent.iconBg}`}
                      aria-hidden="true"
                    >
                      {subject.icon}
                    </span>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold tracking-tight text-slate-900">
                        {subject.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {subject.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-lg border px-2.5 py-1 text-xs font-bold tabular-nums ${accent.soft}`}
                      >
                        {subjectPercent}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setSubjectAll(subject, !allDone)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                      >
                        {allDone ? "Batalkan semua" : "Tandai semua"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${accent.bar}`}
                        style={{ width: `${subjectPercent}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-xs font-medium text-slate-500 tabular-nums">
                      {subjectDone}/{subjectSubtopics.length}
                    </span>
                  </div>
                </div>

                <ul className="divide-y divide-slate-100">
                  {subtopics.map((subtopic) => {
                    const isDone = Boolean(progress[subtopic.id]);
                    const checkboxId = `check-${subtopic.id}`;
                    const tka = subtopic.tkaSoal ?? [];
                    const hasTka = tka.length > 0;
                    const correctCount = tkaCorrectCount(subtopic, answers);
                    const unlocked = isSubtopicUnlocked(subtopic, answers);
                    const open = Boolean(expanded[subtopic.id]);
                    return (
                      <li key={subtopic.id}>
                        <div className="flex items-center gap-3 px-5 py-3.5 transition select-none hover:bg-slate-50">
                          <label
                            htmlFor={checkboxId}
                            className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
                          >
                            <input
                              id={checkboxId}
                              type="checkbox"
                              checked={isDone}
                              disabled={!unlocked && !isDone}
                              onChange={() => toggleSubtopic(subtopic)}
                              className="peer sr-only"
                            />
                            <span
                              aria-hidden="true"
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-slate-300 text-[11px] font-bold text-white transition peer-checked:border-emerald-500 peer-checked:bg-emerald-500 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-300 peer-focus-visible:ring-offset-2 peer-disabled:opacity-40"
                            >
                              {isDone ? "✓" : ""}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span
                                className={`block text-sm font-medium transition ${
                                  isDone
                                    ? "text-slate-400 line-through"
                                    : "text-slate-700"
                                }`}
                              >
                                {subtopic.title}
                              </span>
                              <span className="mt-0.5 block text-xs text-slate-400">
                                Estimasi {formatMinutes(subtopic.estimatedMinutes)}
                              </span>
                            </span>
                          </label>

                          {hasTka && (
                            <button
                              type="button"
                              onClick={() => toggleExpanded(subtopic.id)}
                              aria-expanded={open}
                              className={`shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-semibold transition ${
                                unlocked
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                              }`}
                            >
                              🔓 Latihan {correctCount}/{tka.length}
                            </button>
                          )}

                          <span
                            className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                              isDone
                                ? "bg-emerald-50 text-emerald-600"
                                : !hasTka
                                  ? "bg-slate-100 text-slate-500"
                                  : unlocked
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {isDone
                              ? "Selesai"
                              : !hasTka
                                ? "Belum"
                                : unlocked
                                  ? "Siap centang"
                                  : "Kunci"}
                          </span>
                        </div>

                        {open && (
                          <div className="space-y-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4">
                            <p className="text-xs text-slate-500">
                              Selesaikan semua soal TKA di bawah dengan benar
                              untuk membuka centang sub-materi ini.
                            </p>
                            <TkaExercise
                              subtopic={subtopic}
                              answers={answers}
                              onAnswer={setAnswer}
                            />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>

              </article>
            );
          })}

          {visibleSubjects.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <p className="text-3xl" aria-hidden="true">
                🔎
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-700">
                Tidak ada sub-materi yang cocok
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Coba ubah kata kunci pencarian atau pilih tab mata pelajaran
                lain.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
                className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Reset filter
              </button>
            </div>
          )}
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
          Progres tersimpan otomatis di LocalStorage browser kamu. Data tetap
          aman walau halaman di-refresh atau tab ditutup.
        </footer>

      </div>
    </div>
  );
}

