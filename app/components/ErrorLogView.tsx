"use client";

import { useEffect, useMemo, useState } from "react";
import {
  SUBJECTS,
  type AccentColor,
  type TkaQuestion,
} from "../data/curriculum";
import { isAnswerCorrect, type AnswerMap } from "./TkaExercise";
import MathText from "./MathText";

export type ErrorReason = "konsep" | "kecerobohan" | "jebakan" | "waktu";

export interface WrongQuestionItem {
  question: TkaQuestion;
  subtopicId: string;
  subtopicTitle: string;
  subjectId: string;
  subjectTitle: string;
  subjectShortTitle: string;
  accent: AccentColor;
  icon: string;
  userAnswer: string[];
}

interface ErrorLogViewProps {
  answers: AnswerMap;
  onAnswer: (questionId: string, value: string[]) => void;
  onStartDrill?: () => void;
}

const STORAGE_KEY_REASONS = "tka-planner:error-reasons:v1";
const STORAGE_KEY_NOTES = "tka-planner:error-notes:v1";

const REASON_METADATA: Record<
  ErrorReason,
  { label: string; icon: string; bg: string; text: string; border: string }
> = {
  konsep: {
    label: "Belum Paham Konsep",
    icon: "💡",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  kecerobohan: {
    label: "Kecerobohan (Hitung/Tanda)",
    icon: "⚠️",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  jebakan: {
    label: "Jebakan / Salah Baca",
    icon: "🪤",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  waktu: {
    label: "Waktu Habis / Panik",
    icon: "⏱️",
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
  },
};

const ACCENT_STYLES: Record<AccentColor, { badge: string }> = {
  indigo: { badge: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  rose: { badge: "bg-rose-50 text-rose-700 border-rose-200" },
  sky: { badge: "bg-sky-50 text-sky-700 border-sky-200" },
  amber: { badge: "bg-amber-50 text-amber-700 border-amber-200" },
  emerald: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export default function ErrorLogView({
  answers,
  onAnswer,
  onStartDrill,
}: ErrorLogViewProps) {
  // State alasan metakognitif (questionId -> ErrorReason)
  const [reasons, setReasons] = useState<Record<string, ErrorReason>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_REASONS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // State catatan pribadi evaluasi (questionId -> catatan)
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_NOTES);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // State filter mapel dalam Buku Dosa
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string>("all");
  // Expand pembahasan per card
  const [expandedExplanation, setExpandedExplanation] = useState<
    Record<string, boolean>
  >({});
  // Draft isian singkat saat re-attempt
  const [draftIsian, setDraftIsian] = useState<Record<string, string>>({});

  // Persist reasons ke LocalStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY_REASONS, JSON.stringify(reasons));
    } catch {
      // Abaikan
    }
  }, [reasons]);

  // Persist notes ke LocalStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
    } catch {
      // Abaikan
    }
  }, [notes]);

  // Kumpulkan semua soal yang pernah dijawab salah
  const wrongQuestions = useMemo<WrongQuestionItem[]>(() => {
    const list: WrongQuestionItem[] = [];
    for (const subject of SUBJECTS) {
      for (const chapter of subject.chapters) {
        for (const subtopic of chapter.subtopics) {
          for (const q of subtopic.tkaSoal ?? []) {
            const currentAns = answers[q.id];
            if (
              currentAns &&
              currentAns.length > 0 &&
              !isAnswerCorrect(q, currentAns)
            ) {
              list.push({
                question: q,
                subtopicId: subtopic.id,
                subtopicTitle: subtopic.title,
                subjectId: subject.id,
                subjectTitle: subject.title,
                subjectShortTitle: subject.shortTitle,
                accent: subject.accent,
                icon: subject.icon,
                userAnswer: currentAns,
              });
            }
          }
        }
      }
    }
    return list;
  }, [answers]);

  // Hitung distribusi alasan
  const reasonCounts = useMemo(() => {
    const counts: Record<ErrorReason, number> = {
      konsep: 0,
      kecerobohan: 0,
      jebakan: 0,
      waktu: 0,
    };
    for (const item of wrongQuestions) {
      const r = reasons[item.question.id];
      if (r && counts[r] !== undefined) {
        counts[r] += 1;
      }
    }
    return counts;
  }, [wrongQuestions, reasons]);

  // Filter berdasarkan mapel yang dipilih
  const visibleItems = useMemo(() => {
    if (activeSubjectFilter === "all") return wrongQuestions;
    return wrongQuestions.filter(
      (item) => item.subjectId === activeSubjectFilter
    );
  }, [wrongQuestions, activeSubjectFilter]);

  const setQuestionReason = (questionId: string, reason: ErrorReason) => {
    setReasons((prev) => ({ ...prev, [questionId]: reason }));
  };

  const setQuestionNote = (questionId: string, text: string) => {
    setNotes((prev) => ({ ...prev, [questionId]: text }));
  };

  const toggleExplanation = (questionId: string) => {
    setExpandedExplanation((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // Handler Re-attempt Opsi
  const handleReattemptOption = (q: TkaQuestion, optId: string) => {
    if (q.bentuk === "pg") {
      onAnswer(q.id, [optId]);
    } else if (q.bentuk === "pgk-mcma") {
      const current = answers[q.id] ?? [];
      const set = new Set(current);
      if (set.has(optId)) set.delete(optId);
      else set.add(optId);
      onAnswer(q.id, [...set].sort());
    }
  };

  const handleReattemptIsian = (q: TkaQuestion) => {
    const draft = (draftIsian[q.id] ?? "").trim();
    if (draft) {
      onAnswer(q.id, [draft]);
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= HERO OVERVIEW BUKU DOSA ================= */}
      <section className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50/80 via-white to-amber-50/50 p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-100/70 px-3 py-1 text-xs font-bold text-rose-800">
              <span>📕</span>
              <span>Buku Dosa · Metacognitive Error Log</span>
            </span>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Bank Evaluasi Kesalahan
            </h2>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
              Materi tidak akan benar-benar dikuasai sebelum kamu paham kenapa
              kamu salah. Beri label penyebab kesalahan dan latih ulang sampai
              semua soal keliru berhasil dituntaskan!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white px-5 py-3.5 shadow-sm text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Soal Belum Tuntas
              </p>
              <p className="mt-0.5 text-3xl font-black text-rose-600 tabular-nums">
                {wrongQuestions.length}
              </p>
            </div>

            {onStartDrill && wrongQuestions.length > 0 && (
              <button
                type="button"
                onClick={onStartDrill}
                className="flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 text-xs font-bold text-white shadow-md transition hover:bg-slate-800"
              >
                <span>⚡</span>
                <span>Latih Campuran Baru</span>
              </button>
            )}
          </div>
        </div>

        {/* Breakdown 4 Alasan Metakognitif */}
        {wrongQuestions.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(Object.keys(REASON_METADATA) as ErrorReason[]).map((key) => {
              const meta = REASON_METADATA[key];
              const count = reasonCounts[key];
              return (
                <div
                  key={key}
                  className={`rounded-2xl border ${meta.border} ${meta.bg} p-3.5`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base" aria-hidden="true">
                      {meta.icon}
                    </span>
                    <span className={`text-xs font-bold ${meta.text}`}>
                      {meta.label}
                    </span>
                  </div>
                  <p className="mt-1.5 font-mono text-xl font-black text-slate-900 tabular-nums">
                    {count}{" "}
                    <span className="font-sans text-xs font-normal text-slate-500">
                      soal
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= FILTER MAPEL BUKU DOSA ================= */}
      {wrongQuestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubjectFilter("all")}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-sm transition ${
              activeSubjectFilter === "all"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            Semua ({wrongQuestions.length})
          </button>

          {SUBJECTS.map((sub) => {
            const count = wrongQuestions.filter(
              (q) => q.subjectId === sub.id
            ).length;
            if (count === 0) return null;
            const isActive = activeSubjectFilter === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setActiveSubjectFilter(sub.id)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition ${
                  isActive
                    ? "border-rose-600 bg-rose-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <span>{sub.icon}</span>
                <span>{sub.shortTitle}</span>
                <span
                  className={`rounded-md px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive ? "bg-white/20" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ================= KARTU SOAL KELIRU ================= */}
      <div className="space-y-4">
        {visibleItems.map((item, idx) => {
          const q = item.question;
          const currentAnswer = answers[q.id] ?? [];
          const isNowCorrect = isAnswerCorrect(q, currentAnswer);
          const currentReason = reasons[q.id];
          const currentNote = notes[q.id] ?? "";
          const showExp = Boolean(expandedExplanation[q.id]);
          const accentStyle = ACCENT_STYLES[item.accent];

          return (
            <article
              key={q.id}
              className={`rounded-3xl border bg-white p-5 shadow-sm transition ${
                isNowCorrect
                  ? "border-emerald-300 bg-emerald-50/20 ring-2 ring-emerald-500/20"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-0.5 text-xs font-bold ${accentStyle.badge}`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.subjectShortTitle}</span>
                  </span>
                  <span className="text-xs font-medium text-slate-600">
                    · {item.subtopicTitle}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    {q.level}
                  </span>
                  <span
                    className={`rounded-md px-2.5 py-0.5 text-xs font-bold ${
                      isNowCorrect
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {isNowCorrect ? "✓ Sudah Tuntas!" : "Belum Benar"}
                  </span>
                </div>
              </div>

              {/* Soal Body */}
              <div className="mt-4">
                {q.stimulus && (
                  <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700 leading-relaxed">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Stimulus Bacaan:
                    </p>
                    <div className="whitespace-pre-line">
                      <MathText text={q.stimulus} />
                    </div>
                  </div>
                )}

                <div className="text-sm font-semibold text-slate-900 leading-relaxed sm:text-base">
                  <span className="mr-2 text-slate-400 font-mono">#{idx + 1}</span>
                  <MathText text={q.question} />
                </div>

                {/* Info jawaban salah sebelumnya */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-lg bg-rose-50 px-2.5 py-1 font-medium text-rose-800 border border-rose-200">
                    Jawabanmu Sebelumnya:{" "}
                    <span className="font-bold">
                      {item.userAnswer.join(", ")}
                    </span>
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    (Pilih opsi di bawah untuk mencoba ulang langsung)
                  </span>
                </div>

                {/* Input Re-attempt */}
                <div className="mt-4 space-y-2">
                  {q.bentuk === "isian" ? (
                    <div className="flex items-center gap-2 max-w-md">
                      <input
                        type="text"
                        value={draftIsian[q.id] ?? ""}
                        onChange={(e) =>
                          setDraftIsian((prev) => ({
                            ...prev,
                            [q.id]: e.target.value,
                          }))
                        }
                        placeholder="Ketik jawaban baru…"
                        className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleReattemptIsian(q)}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                      >
                        Coba Lagi
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {q.options?.map((opt) => {
                        const isPicked = currentAnswer.includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleReattemptOption(q, opt.id)}
                            className={`flex items-start gap-2.5 rounded-xl border p-3 text-left text-xs transition ${
                              isPicked
                                ? isNowCorrect
                                  ? "border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-400"
                                  : "border-rose-300 bg-rose-50/60 text-rose-950 font-semibold"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                            }`}
                          >
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${
                                isPicked
                                  ? isNowCorrect
                                    ? "bg-emerald-600 text-white"
                                    : "bg-rose-600 text-white"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {opt.id}
                            </span>
                            <span className="flex-1 leading-snug">
                              <MathText text={opt.text} />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* ================= ANALISIS METAKOGNITIF ================= */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Penyebab Kesalahan (Analisis Diri):
                    </label>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {(
                        Object.keys(REASON_METADATA) as ErrorReason[]
                      ).map((reasonKey) => {
                        const meta = REASON_METADATA[reasonKey];
                        const isSelected = currentReason === reasonKey;
                        return (
                          <button
                            key={reasonKey}
                            type="button"
                            onClick={() => setQuestionReason(q.id, reasonKey)}
                            className={`rounded-xl border px-2.5 py-1 text-xs font-semibold transition ${
                              isSelected
                                ? `${meta.bg} ${meta.border} ${meta.text} ring-2 ring-current/20`
                                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                            }`}
                          >
                            <span>{meta.icon}</span> <span>{meta.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleExplanation(q.id)}
                    className="self-start sm:self-center text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    {showExp ? "Sembunyikan Pembahasan ▲" : "Lihat Pembahasan Resmi ▼"}
                  </button>
                </div>

                {/* Catatan Evaluasi Pribadi */}
                <div className="mt-3">
                  <input
                    type="text"
                    value={currentNote}
                    onChange={(e) => setQuestionNote(q.id, e.target.value)}
                    placeholder="Tulis catatan pengingat pribadi di sini (misal: 'Hati-hati tanda minus saat pindah ruas')…"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Pembahasan Resmi Terbuka */}
                {showExp && (
                  <div className="mt-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs text-indigo-950">
                    <p className="font-bold text-indigo-900 mb-1">
                      Kunci Jawaban: {q.correctIds.join(", ")}
                    </p>
                    <div className="leading-relaxed">
                      <MathText text={q.explanation} />
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}

        {/* ================= STATE BUKU DOSA BERSIH (EMPTY STATE) ================= */}
        {wrongQuestions.length === 0 && (
          <div className="rounded-3xl border border-dashed border-emerald-300 bg-gradient-to-br from-emerald-50/50 to-white p-10 text-center shadow-sm">
            <span className="text-5xl" aria-hidden="true">
              🌟
            </span>
            <h3 className="mt-4 text-xl font-bold text-slate-900">
              Buku Dosa Kamu Bersih!
            </h3>
            <p className="mx-auto mt-2 max-w-md text-xs text-slate-600 leading-relaxed">
              Semua soal yang pernah kamu kerjakan sudah terjawab dengan benar,
              atau kamu belum mencoba latihan soal. Kerjakan soal TKA atau uji
              diri lewat Drill Campuran untuk menguji kesiapanmu!
            </p>

            {onStartDrill && (
              <button
                type="button"
                onClick={onStartDrill}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-slate-800"
              >
                <span>⚡</span>
                <span>Mulai Drill Campuran (Interleaving)</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
