"use client";

import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

interface MixedMathTextProps {
  text: string | number;
  className?: string;
}

export const MixedMathText = ({ text, className = "" }: MixedMathTextProps) => {
  if (text === null || text === undefined) return null;
  const rawText = String(text);
  if (!rawText.trim()) return null;

  // 1. Normalize LaTeX delimiters: convert \[ ... \] to $$...$$ and \( ... \) to $...$
  let processed = rawText
    .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')
    .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

  const hasDollar = processed.includes('$');

  // 2. If no $ delimiter exists, check if there are LaTeX commands (e.g. \frac, \sqrt, \pm, etc.)
  if (!hasDollar) {
    const hasLatexCmd = /\\[a-zA-Z]+/.test(processed);
    if (hasLatexCmd) {
      // If it looks like a pure math expression (starts with \ or doesn't have regular sentences)
      const isPureMath =
        processed.trim().startsWith('\\') ||
        !/[a-ząćęłńóśźż]{4,}\s+[a-ząćęłńóśźż]{4,}/i.test(processed);

      if (isPureMath) {
        return (
          <span className={`inline-block max-w-full ${className}`}>
            <InlineMath
              math={processed.trim()}
              renderError={() => <span>{rawText}</span>}
            />
          </span>
        );
      } else {
        // Mixed text with bare LaTeX command without $: wrap LaTeX sequences in $
        processed = processed.replace(
          /(\\[a-zA-Z]+(?:\{[^{}]*\}|\[[^[\]]*\])*)/g,
          '$$$1$$'
        );
      }
    } else {
      return <span className={`whitespace-pre-line ${className}`}>{rawText}</span>;
    }
  }

  // 3. Tokenize by $$...$$ (block math) and $...$ (inline math)
  const tokenRegex = /(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g;
  const parts = processed.split(tokenRegex);

  return (
    <span className={`whitespace-pre-line max-w-full ${className}`}>
      {parts.map((part, index) => {
        if (!part) return null;

        // Block math $$...$$
        if (part.startsWith('$$') && part.endsWith('$$') && part.length >= 4) {
          const math = part.slice(2, -2).trim();
          return (
            <span key={index} className="block my-2 overflow-x-auto">
              <BlockMath math={math} renderError={() => <span>{part}</span>} />
            </span>
          );
        }

        // Inline math $...$
        if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
          const math = part.slice(1, -1).trim();
          return (
            <InlineMath
              key={index}
              math={math}
              renderError={() => <span>{part}</span>}
            />
          );
        }

        // Plain text segment
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

export default MixedMathText;

