"use client";

import { useState } from "react";
import type { Subtopic, TkaQuestion } from "../data/curriculum";

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

/* -------------------- KARTU SOAL -------------------- */

type CardProps = {
  q: TkaQuestion;
  index: number;
  value: string[];
  onAnswer: (value: string[]) => void;
};

function QuestionCard({ q, index, value, onAnswer }: CardProps) {
  const [draft, setDraft] = useState<string>(value[0] ?? "");
  const answered = value.length > 0;
  const correct = isAnswerCorrect(q, value);

  const optionPick = (id: string) => {
    if (q.bentuk === "pg") {
      onAnswer([id]);
      return;
    }
    const set = new Set(value);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onAnswer([...set].sort());
  };

  return (
    <div
      className={`rounded-xl border p-4 transition ${
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

      {q.stimulus && (
        <blockquote className="mb-2 rounded-lg border-l-4 border-slate-300 bg-slate-50 px-3 py-2 text-sm italic text-slate-600">
          {q.stimulus}
        </blockquote>
      )}

      <p className="text-sm font-semibold text-slate-800">{q.question}</p>

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
            onClick={() => onAnswer(draft.trim() ? [draft.trim()] : [])}
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
                  <span className="min-w-0 flex-1">{opt.text}</span>
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
          {correct && <p className="mt-1 text-emerald-700">{q.explanation}</p>}
          {!correct && (
            <>
              <p className="mt-1 text-rose-700">
                Coba lagi — jawaban belum cocok dengan kunci.
              </p>
              <button
                type="button"
                onClick={() => {
                  setDraft("");
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
      {tka.map((q, i) => (
        <QuestionCard
          key={q.id}
          q={q}
          index={i}
          value={answers[q.id] ?? []}
          onAnswer={(v) => onAnswer(q.id, v)}
        />
      ))}
    </div>
  );
}

