"use client";

import { InlineMath } from 'react-katex';

interface MixedMathTextProps {
  text: string;
}

export const MixedMathText = ({ text }: MixedMathTextProps) => {
  if (!text || typeof text !== 'string') return null;

  if (!text.includes('$')) {
    return <span>{text}</span>;
  }

  // Normalize $$ to $ so we can easily split and render everything as InlineMath
  const normalizedText = text.replace(/\$\$/g, '$');
  const parts = normalizedText.split('$');

  return (
    <span>
      {parts.map((part, index) => {
        if (part === '') return null;
        if (index % 2 === 1) { // Odd indices are the math content
          return <InlineMath key={index} math={part} />;
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

export default MixedMathText;
