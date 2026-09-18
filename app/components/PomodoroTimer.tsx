"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type PomodoroMode = "focus" | "shortBreak" | "longBreak";

interface PomodoroTimerProps {
  activeTopic?: string | null;
  onClearTopic?: () => void;
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

const STORAGE_KEY_POMODORO = "tka-planner:pomodoro:v1";

const PRESETS: Record<PomodoroMode, { label: string; minutes: number; icon: string }> = {
  focus: { label: "Fokus Belajar", minutes: 25, icon: "🎯" },
  shortBreak: { label: "Istirahat Pendek", minutes: 5, icon: "☕" },
  longBreak: { label: "Istirahat Panjang", minutes: 15, icon: "🌴" },
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function playPleasantChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Harmonic triad: C5 (523.25), E5 (659.25), G5 (783.99)
    const notes = [
      { freq: 523.25, time: 0, dur: 0.8, vol: 0.15 },
      { freq: 659.25, time: 0.15, dur: 1.0, vol: 0.2 },
      { freq: 783.99, time: 0.3, dur: 1.5, vol: 0.25 },
    ];

    notes.forEach(({ freq, time, dur, vol }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + time);
      gain.gain.setValueAtTime(vol, now + time);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  } catch {
    // Abaikan jika browser memblokir audio sebelum interaksi
  }
}

function readStoredPomodoroSettings(): {
  completedSessions: number;
  soundEnabled: boolean;
} {
  if (typeof window === "undefined") {
    return { completedSessions: 0, soundEnabled: true };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_POMODORO);
    if (!raw) return { completedSessions: 0, soundEnabled: true };
    const parsed = JSON.parse(raw);
    return {
      completedSessions:
        typeof parsed.completedSessions === "number" ? parsed.completedSessions : 0,
      soundEnabled:
        typeof parsed.soundEnabled === "boolean" ? parsed.soundEnabled : true,
    };
  } catch {
    return { completedSessions: 0, soundEnabled: true };
  }
}

export default function PomodoroTimer({
  activeTopic,
  onClearTopic,
  isExpanded,
  onExpandedChange,
}: PomodoroTimerProps) {
  const [mode, setMode] = useState<PomodoroMode>("focus");
  const [duration, setDuration] = useState<number>(25 * 60);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const [completedSessions, setCompletedSessions] = useState<number>(() => {
    return readStoredPomodoroSettings().completedSessions;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return readStoredPomodoroSettings().soundEnabled;
  });

  const originalTitleRef = useRef<string>("");

  // Simpan state sesi & suara ke LocalStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY_POMODORO,
        JSON.stringify({
          completedSessions,
          soundEnabled,
        })
      );
    } catch {
      // Abaikan
    }
  }, [completedSessions, soundEnabled]);

  // Simpan judul dokumen awal saat mount
  useEffect(() => {
    originalTitleRef.current = document.title;
  }, []);

  // Update judul tab browser saat timer berjalan
  useEffect(() => {
    if (isRunning) {
      const icon = PRESETS[mode].icon;
      document.title = `[${formatTime(timeLeft)}] ${icon} ${PRESETS[mode].label} · Study Planner TKA`;
    } else if (originalTitleRef.current) {
      document.title = originalTitleRef.current;
    }

    return () => {
      if (originalTitleRef.current) {
        document.title = originalTitleRef.current;
      }
    };
  }, [isRunning, timeLeft, mode]);

  const switchMode = useCallback((newMode: PomodoroMode, customMinutes?: number) => {
    setIsRunning(false);
    setMode(newMode);
    const mins = customMinutes ?? PRESETS[newMode].minutes;
    setDuration(mins * 60);
    setTimeLeft(mins * 60);
  }, []);

  // Timer interval ticker
  useEffect(() => {
    if (!isRunning) return;

    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          setIsRunning(false);

          if (soundEnabled) {
            playPleasantChime();
          }

          if (mode === "focus") {
            setCompletedSessions((s) => {
              const next = s + 1;
              if (next % 4 === 0) {
                switchMode("longBreak");
              } else {
                switchMode("shortBreak");
              }
              return next;
            });
          } else {
            switchMode("focus");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning, mode, soundEnabled, switchMode]);

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration);
  };

  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((duration - timeLeft) / duration) * 100))
  );

  return (
    <aside
      aria-label="Widget Pomodoro & Focus Timer"
      className="fixed right-4 bottom-4 z-50 transition-all duration-300 sm:right-6 sm:bottom-6"
    >
      {/* MODE MINI (COMPACT PILL) */}
      {!isExpanded && (
        <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/95 px-3.5 py-2 text-white shadow-xl backdrop-blur-md ring-1 ring-white/10 transition hover:bg-slate-900">
          <button
            type="button"
            onClick={() => onExpandedChange(true)}
            className="flex items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            title="Buka panel Pomodoro lengkap"
          >
            <span className="text-base" aria-hidden="true">
              {PRESETS[mode].icon}
            </span>
            <span className="font-mono text-sm font-bold tracking-tight tabular-nums">
              {formatTime(timeLeft)}
            </span>
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                isRunning ? "animate-pulse bg-emerald-400" : "bg-slate-500"
              }`}
            />
          </button>

          <div className="h-4 w-px bg-slate-700" />

          <button
            type="button"
            onClick={toggleTimer}
            className="rounded-full p-1 text-slate-300 transition hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            aria-label={isRunning ? "Jeda timer" : "Mulai timer"}
            title={isRunning ? "Jeda" : "Mulai"}
          >
            {isRunning ? (
              <span className="text-xs">⏸️</span>
            ) : (
              <span className="text-xs">▶️</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onExpandedChange(true)}
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            aria-label="Perbesar widget"
            title="Buka pengaturan"
          >
            <span className="text-xs">⚙️</span>
          </button>
        </div>
      )}

      {/* MODE LENGKAP (EXPANDED CARD) */}
      {isExpanded && (
        <div className="w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl ring-1 ring-slate-900/5 sm:w-[380px]">
          {/* Header Card */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">
                🍅
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Focus & Pomodoro Timer
                </h3>
                <p className="text-[11px] text-slate-500">
                  Optimalkan fokus & istirahat teratur
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setSoundEnabled((prev) => !prev);
                  if (!soundEnabled) playPleasantChime();
                }}
                className={`rounded-lg p-1.5 text-xs transition ${
                  soundEnabled
                    ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                }`}
                title={soundEnabled ? "Suara aktif (klik untuk bisukan)" : "Suara nonaktif"}
                aria-label="Toggle suara timer"
              >
                {soundEnabled ? "🔔" : "🔕"}
              </button>

              <button
                type="button"
                onClick={() => onExpandedChange(false)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                title="Kecilkan widget"
                aria-label="Tutup panel"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Materi Aktif (jika ada yang ditautkan) */}
          {activeTopic && (
            <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-indigo-100 bg-indigo-50/80 px-3 py-2 text-xs">
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-indigo-700">Materi Fokus:</span>{" "}
                <span className="truncate text-indigo-900" title={activeTopic}>
                  {activeTopic}
                </span>
              </div>
              {onClearTopic && (
                <button
                  type="button"
                  onClick={onClearTopic}
                  className="shrink-0 text-indigo-400 hover:text-indigo-700"
                  title="Hapus tautan materi"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Mode Selector */}
          <div className="mt-4 grid grid-cols-3 gap-1.5 rounded-xl bg-slate-100 p-1 text-xs">
            <button
              type="button"
              onClick={() => switchMode("focus", 25)}
              className={`rounded-lg py-1.5 font-semibold transition ${
                mode === "focus" && duration === 25 * 60
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🎯 25m Fokus
            </button>
            <button
              type="button"
              onClick={() => switchMode("shortBreak", 5)}
              className={`rounded-lg py-1.5 font-semibold transition ${
                mode === "shortBreak"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ☕ 5m Rehat
            </button>
            <button
              type="button"
              onClick={() => switchMode("longBreak", 15)}
              className={`rounded-lg py-1.5 font-semibold transition ${
                mode === "longBreak"
                  ? "bg-white text-sky-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🌴 15m Rehat
            </button>
          </div>

          {/* Opsi Deep Work (45 Menit) */}
          <div className="mt-2 flex items-center justify-end gap-2 text-[11px] text-slate-500">
            <span>Preset lain:</span>
            <button
              type="button"
              onClick={() => switchMode("focus", 45)}
              className={`rounded-md border px-2 py-0.5 font-medium transition ${
                mode === "focus" && duration === 45 * 60
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700 font-bold"
                  : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
              }`}
            >
              ⚡ 45m Deep Work
            </button>
          </div>

          {/* Visual Display Timer */}
          <div className="mt-4 flex flex-col items-center justify-center rounded-2xl bg-slate-900 py-6 text-white shadow-inner">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              {PRESETS[mode].label}
            </span>
            <p className="mt-1 font-mono text-5xl font-extrabold tracking-tight tabular-nums">
              {formatTime(timeLeft)}
            </p>

            {/* Bar progress */}
            <div className="mt-4 h-1.5 w-3/4 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full transition-all duration-500 ${
                  mode === "focus"
                    ? "bg-indigo-500"
                    : mode === "shortBreak"
                      ? "bg-emerald-400"
                      : "bg-sky-400"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="mt-1.5 text-[10px] text-slate-400 tabular-nums">
              {progressPercent}% waktu terlewati
            </span>
          </div>

          {/* Kontrol Tombol */}
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTimer}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold text-white shadow-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                isRunning
                  ? "bg-amber-500 hover:bg-amber-600"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {isRunning ? "⏸️ Jeda Sesi" : "▶️ Mulai Sekarang"}
            </button>

            <button
              type="button"
              onClick={resetTimer}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              title="Reset waktu sesi ini"
            >
              🔄 Reset
            </button>
          </div>

          {/* Footer Info & Sesi Selesai */}
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span>Sesi tuntas hari ini:</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-bold text-amber-700 border border-amber-200/60">
                🍅 {completedSessions}
              </span>
            </div>

            {completedSessions > 0 && (
              <button
                type="button"
                onClick={() => setCompletedSessions(0)}
                className="text-[10px] text-slate-400 hover:text-red-500"
                title="Reset hitungan sesi"
              >
                Reset sesi
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
