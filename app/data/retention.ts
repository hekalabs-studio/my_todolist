/**
 * Modul Spaced Repetition (Pengulangan Berjarak)
 * Berdasarkan Kurva Lupa Hermann Ebbinghaus untuk persiapan UTBK/SNBT & TKA.
 */

export type RetentionStage =
  | "fresh"
  | "due_h1"
  | "due_h3"
  | "due_h7"
  | "mastered";

export interface RetentionRecord {
  /** Timestamp (ms) saat subtopik pertama kali selesai dicentang. */
  completedAt: number;
  /** Timestamp (ms) saat review terakhir dilakukan. */
  lastReviewedAt: number;
  /** Jumlah kali review yang telah diselesaikan. */
  reviewCount: number;
}

export type RetentionMap = Record<string, RetentionRecord>;

export const STORAGE_KEY_RETENTION = "tka-planner:retention:v1";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export interface RetentionStatus {
  stage: RetentionStage;
  label: string;
  badgeCls: string;
  isDue: boolean;
  daysAgo: number;
}

/**
 * Tentukan status retensi memori sub-materi berdasarkan interval Ebbinghaus:
 * - reviewCount >= 3   : Mastered / Memori Terkonsolidasi (Kuat)
 * - < 1 hari           : Segar (< 24 Jam)
 * - 1 - 2 hari         : Review H+1 (Jadwal Penguatan 1)
 * - 3 - 6 hari         : Review H+3 (Jadwal Penguatan 2)
 * - >= 7 hari          : Kritis H+7 (Potensi Lupa Tinggi)
 */
export function getRetentionStatus(
  record: RetentionRecord | undefined,
  nowMs: number
): RetentionStatus {
  if (!record) {
    return {
      stage: "fresh",
      label: "Belum Dicentang",
      badgeCls: "bg-slate-100 text-slate-500",
      isDue: false,
      daysAgo: 0,
    };
  }

  if (record.reviewCount >= 3) {
    return {
      stage: "mastered",
      label: "🏆 Memori Kuat",
      badgeCls: "bg-emerald-100 text-emerald-800 border-emerald-300",
      isDue: false,
      daysAgo: Math.max(0, Math.floor((nowMs - record.lastReviewedAt) / DAY_IN_MS)),
    };
  }

  const refTime = Math.max(record.completedAt, record.lastReviewedAt);
  const daysAgo = Math.max(0, Math.floor((nowMs - refTime) / DAY_IN_MS));

  if (daysAgo < 1) {
    return {
      stage: "fresh",
      label: "🟢 Segar (< 24 Jam)",
      badgeCls: "bg-emerald-50 text-emerald-700 border-emerald-200",
      isDue: false,
      daysAgo,
    };
  } else if (daysAgo < 3) {
    return {
      stage: "due_h1",
      label: "🟡 Review H+1",
      badgeCls: "bg-amber-50 text-amber-800 border-amber-300",
      isDue: true,
      daysAgo,
    };
  } else if (daysAgo < 7) {
    return {
      stage: "due_h3",
      label: "🟠 Review H+3",
      badgeCls: "bg-orange-50 text-orange-800 border-orange-300",
      isDue: true,
      daysAgo,
    };
  } else {
    return {
      stage: "due_h7",
      label: "🔴 Kritis H+7",
      badgeCls: "bg-rose-100 text-rose-800 border-rose-300 animate-pulse",
      isDue: true,
      daysAgo,
    };
  }
}

/** Baca data retensi dari LocalStorage dengan sanitasi */
export function readStoredRetention(): RetentionMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_RETENTION);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    const source = parsed as Record<string, unknown>;
    const result: RetentionMap = {};
    for (const [id, item] of Object.entries(source)) {
      if (item && typeof item === "object") {
        const r = item as Record<string, unknown>;
        if (
          typeof r.completedAt === "number" &&
          typeof r.lastReviewedAt === "number" &&
          typeof r.reviewCount === "number"
        ) {
          result[id] = {
            completedAt: r.completedAt,
            lastReviewedAt: r.lastReviewedAt,
            reviewCount: r.reviewCount,
          };
        }
      }
    }
    return result;
  } catch {
    return {};
  }
}
