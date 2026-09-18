"use client";

import { useMemo } from "react";
import katex from "katex";

interface MathTextProps {
  text: string;
  className?: string;
}

// Regex untuk menangkap rumus LaTeX: \[ ... \], \( ... \), dan $$ ... $$
const MATH_REGEX = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$)/g;

function renderMathSegment(segment: string): string {
  if (segment.startsWith("\\[") && segment.endsWith("\\]")) {
    const math = segment.slice(2, -2).trim();
    try {
      return katex.renderToString(math, {
        throwOnError: false,
        displayMode: true,
      });
    } catch {
      return segment;
    }
  }

  if (segment.startsWith("$$") && segment.endsWith("$$")) {
    const math = segment.slice(2, -2).trim();
    try {
      return katex.renderToString(math, {
        throwOnError: false,
        displayMode: true,
      });
    } catch {
      return segment;
    }
  }

  if (segment.startsWith("\\(") && segment.endsWith("\\)")) {
    const math = segment.slice(2, -2).trim();
    try {
      return katex.renderToString(math, {
        throwOnError: false,
        displayMode: false,
      });
    } catch {
      return segment;
    }
  }

  // Escape HTML dasar untuk teks biasa
  return segment
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default function MathText({ text, className }: MathTextProps) {
  const html = useMemo(() => {
    if (!text) return "";
    const parts = text.split(MATH_REGEX);
    return parts.map(renderMathSegment).join("");
  }, [text]);

  if (!text) return null;

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
