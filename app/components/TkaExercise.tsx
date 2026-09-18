"use client";

import { useEffect, useState } from "react";
import type { Subtopic, TkaQuestion } from "../data/curriculum";
import MathText from "./MathText";

/** Peta jawaban per soal: questionId -> daftar id opsi terpilih / [teks] untuk isian. */
export type AnswerMap = Record<string, string[]>;

/* -------------------- LOGIKA KEBENARAN -------------------- */

function norm(s: string): string {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/,/g, ".");
}

/** Cek apakah jawaban pengguna benar untuk sebuah soal TKA. */
export function isAnswerCorrect(q: TkaQuestion, ans: string[]): boolean {
  if (!ans || ans.length === 0) return false;
  if (q.bentuk === "pg") {
    return ans.length === 1 && q.correctIds.includes(ans[0]);
  }
  if (q.bentuk === "pgk-mcma") {
    return (
      ans.length === q.correctIds.length &&
      q.correctIds.every((c) => ans.includes(c))
    );
  }
  // isian: bandingkan teks ternormalisasi dengan kunci alternatif mana pun.
  const given = norm(ans[0]);
  if (given === "") return false;
  return q.correctIds.some((c) => norm(c) === given);
}

/** Subtopik terbuka untuk dicentang bila tidak punya soal ATAU semua soal benar. */
export function isSubtopicUnlocked(subtopic: Subtopic, answers: AnswerMap): boolean {
  const tka = subtopic.tkaSoal ?? [];
  if (tka.length === 0) return true;
  return tka.every((q) => isAnswerCorrect(q, answers[q.id] ?? []));
}

/** Jumlah soal TKA yang sudah dijawab benar pada suatu subtopik. */
export function tkaCorrectCount(subtopic: Subtopic, answers: AnswerMap): number {
  return (subtopic.tkaSoal ?? []).filter((q) =>
    isAnswerCorrect(q, answers[q.id] ?? []),
  ).length;
}

const BENTUK_LABEL: Record<TkaQuestion["bentuk"], string> = {
  pg: "Pilihan Ganda",
  "pgk-mcma": "PG Kompleks (MCMA)",
  isian: "Isian Singkat",
};

const LEVEL_LABEL: Record<TkaQuestion["level"], string> = {
  L1: "Pengetahuan",
  L2: "Aplikasi",
  L3: "Penalaran",
};

const STORAGE_KEY_PACING = "tka-planner:pacing:v1";

function readStoredPacing(): { enabled: boolean; duration: number } {
  if (typeof window === "undefined") return { enabled: false, duration: 90 };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PACING);
    if (!raw) return { enabled: false, duration: 90 };
    const parsed = JSON.parse(raw);
    return {
      enabled: Boolean(parsed.enabled),
      duration: typeof parsed.duration === "number" ? parsed.duration : 90,
    };
  } catch {
    return { enabled: false, duration: 90 };
  }
}

/* -------------------- KARTU SOAL -------------------- */

type CardProps = {
  q: TkaQuestion;
  index: number;
  value: string[];
  onAnswer: (value: string[]) => void;
  pacingEnabled: boolean;
  pacingDuration: number;
};

function QuestionCard({
  q,
  index,
  value,
  onAnswer,
  pacingEnabled,
  pacingDuration,
}: CardProps) {
  const [draft, setDraft] = useState<string>(value[0] ?? "");
  const answered = value.length > 0;
  const correct = isAnswerCorrect(q, value);

  // Pacing timer state
  const [secondsLeft, setSecondsLeft] = useState<number>(pacingDuration);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [timeTaken, setTimeTaken] = useState<number | null>(null);

  // Sync state if pacingDuration changes
  const [prevDuration, setPrevDuration] = useState<number>(pacingDuration);
  if (pacingDuration !== prevDuration) {
    setPrevDuration(pacingDuration);
    setSecondsLeft(pacingDuration);
    setTimeTaken(null);
  }

  // Timer ticker per question
  useEffect(() => {
    if (!pacingEnabled || answered || isPaused) return;

    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [pacingEnabled, answered, isPaused]);

  const optionPick = (id: string) => {
    if (!answered && timeTaken === null && pacingEnabled) {
      setTimeTaken(Math.max(1, pacingDuration - secondsLeft));
    }
    if (q.bentuk === "pg") {
      onAnswer([id]);
      return;
    }
    const set = new Set(value);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onAnswer([...set].sort());
  };

  const handleIsianCheck = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      if (!answered && timeTaken === null && pacingEnabled) {
        setTimeTaken(Math.max(1, pacingDuration - secondsLeft));
      }
      onAnswer([trimmed]);
    }
  };

  const formatPacingTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        correct
          ? "border-emerald-200 bg-emerald-50/40"
          : answered
            ? "border-rose-200 bg-rose-50/30"
            : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[11px] font-bold text-white tabular-nums">
          {index + 1}
        </span>
        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
          {BENTUK_LABEL[q.bentuk]}
        </span>
        <span className="rounded-md border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600">
          {q.level} · {LEVEL_LABEL[q.level]}
        </span>
      </div>

      {/* BAR PACING COUNTDOWN (Jika aktif) */}
      {pacingEnabled && (
        <div className="mb-3 rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm" aria-hidden="true">
                ⏱️
              </span>
              <span className="font-semibold text-slate-700">Pacing:</span>
              <span className="font-mono font-bold tabular-nums text-slate-900">
                {answered
                  ? timeTaken !== null
                    ? `${timeTaken}s selesai`
                    : "Selesai"
                  : formatPacingTime(secondsLeft)}
              </span>

              {answered && timeTaken !== null && (
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                    timeTaken <= pacingDuration
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {timeTaken <= pacingDuration ? "⚡ On Pacing" : "⏱️ Overtime"}
                </span>
              )}
            </div>

            {!answered && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsPaused((p) => !p)}
                  className="rounded px-2 py-0.5 text-[11px] font-medium text-slate-500 hover:bg-slate-200"
                >
                  {isPaused ? "▶️ Lanjut" : "⏸️ Jeda"}
                </button>
                <button
                  type="button"
                  onClick={() => setSecondsLeft(pacingDuration)}
                  className="rounded px-2 py-0.5 text-[11px] font-medium text-slate-500 hover:bg-slate-200"
                >
                  🔄 Reset
                </button>
              </div>
            )}
          </div>

          {!answered && (
            <div className="mt-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full transition-all duration-300 ${
                    secondsLeft / pacingDuration > 0.5
                      ? "bg-emerald-500"
                      : secondsLeft / pacingDuration > 0.2
                        ? "bg-amber-500"
                        : "bg-rose-500 animate-pulse"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, (secondsLeft / pacingDuration) * 100)
                    )}%`,
                  }}
                />
              </div>
              {secondsLeft === 0 && (
                <p className="mt-1 text-[11px] font-medium text-rose-600">
                  ⚠️ Waktu target {pacingDuration}s habis! Tentukan opsi atau lanjut ke soal berikutnya.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {q.stimulus && (
        <blockquote className="mb-2 rounded-lg border-l-4 border-slate-300 bg-slate-50 px-3 py-2 text-sm italic text-slate-600">
          <MathText text={q.stimulus} />
        </blockquote>
      )}

      <div className="text-sm font-semibold text-slate-800">
        <MathText text={q.question} />
      </div>

      {q.bentuk === "isian" ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={correct}
            placeholder="Tulis jawaban…"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100 disabled:text-slate-500"
          />
          <button
            type="button"
            onClick={handleIsianCheck}
            disabled={correct || draft.trim() === ""}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Periksa
          </button>
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {q.options?.map((opt) => {
            const selected = value.includes(opt.id);
            const isKey = q.correctIds.includes(opt.id);
            let cls =
              "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700";
            if (answered) {
              if (isKey) cls = "border-emerald-400 bg-emerald-50 text-emerald-800";
              else if (selected) cls = "border-rose-400 bg-rose-50 text-rose-800";
              else cls = "border-slate-200 bg-white text-slate-400";
            } else if (selected) {
              cls = "border-indigo-400 bg-indigo-50 text-indigo-800";
            }
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  onClick={() => optionPick(opt.id)}
                  disabled={correct}
                  className={`flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium transition disabled:cursor-default ${cls}`}
                >
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-current text-[11px] font-bold">
                    {opt.id}
                  </span>
                  <span className="min-w-0 flex-1">
                    <MathText text={opt.text} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {answered && (
        <div
          className={`mt-3 rounded-lg px-3 py-2 text-sm ${
            correct ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
          }`}
        >
          <p className="font-bold">{correct ? "✓ Benar!" : "✗ Belum tepat"}</p>
          {correct && (
            <div className="mt-1 text-emerald-700">
              <MathText text={q.explanation} />
            </div>
          )}
          {!correct && (
            <>
              <p className="mt-1 text-rose-700">
                Coba lagi — jawaban belum cocok dengan kunci.
              </p>
              <button
                type="button"
                onClick={() => {
                  setDraft("");
                  setTimeTaken(null);
                  setSecondsLeft(pacingDuration);
                  onAnswer([]);
                }}
                className="mt-2 rounded-md border border-rose-300 bg-white px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
              >
                Ulangi soal ini
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------- PANEL LATIHAN TKA -------------------- */

type Props = {
  subtopic: Subtopic;
  answers: AnswerMap;
  onAnswer: (questionId: string, value: string[]) => void;
};

export default function TkaExercise({ subtopic, answers, onAnswer }: Props) {
  const [pacingEnabled, setPacingEnabled] = useState<boolean>(() => {
    return readStoredPacing().enabled;
  });

  const [pacingDuration, setPacingDuration] = useState<number>(() => {
    return readStoredPacing().duration;
  });

  // Simpan setting pacing ke LocalStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY_PACING,
        JSON.stringify({ enabled: pacingEnabled, duration: pacingDuration })
      );
    } catch {
      // Abaikan
    }
  }, [pacingEnabled, pacingDuration]);

  const tka = subtopic.tkaSoal ?? [];
  if (tka.length === 0) {
    return (
      <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
        Sub-materi ini tidak memiliki soal TKA prasyarat.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* TOOLBAR MODE PACING */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPacingEnabled((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
              pacingEnabled
                ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
            }`}
          >
            <span>⏱️</span>
            <span>Mode Pacing: {pacingEnabled ? "ON" : "OFF"}</span>
          </button>
          <span className="hidden text-slate-500 sm:inline text-[11px]">
            Target waktu per butir soal SNBT
          </span>
        </div>

        {pacingEnabled && (
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold mr-1">
              Batas:
            </span>
            {[
              { label: "60s TPS", value: 60 },
              { label: "90s Standar", value: 90 },
              { label: "120s HOTS", value: 120 },
            ].map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setPacingDuration(preset.value)}
                className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition ${
                  pacingDuration === preset.value
                    ? "bg-slate-900 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {tka.map((q, i) => (
        <QuestionCard
          key={q.id}
          q={q}
          index={i}
          value={answers[q.id] ?? []}
          onAnswer={(v) => onAnswer(q.id, v)}
          pacingEnabled={pacingEnabled}
          pacingDuration={pacingDuration}
        />
      ))}
    </div>
  );
}
