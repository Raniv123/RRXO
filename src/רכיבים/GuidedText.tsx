import { useState, useEffect } from 'react';

interface Props {
  text: string;
  speed?: number;
  className?: string;
  onDone?: () => void;
}

export default function GuidedText({ text, speed = 80, className = '', onDone }: Props) {
  const [visibleWords, setVisibleWords] = useState(0);
  const words = text.split(' ');

  useEffect(() => {
    setVisibleWords(0);
  }, [text]);

  useEffect(() => {
    if (visibleWords >= words.length) {
      onDone?.();
      return;
    }
    const timer = setTimeout(() => setVisibleWords(v => v + 1), speed);
    return () => clearTimeout(timer);
  }, [visibleWords, words.length, speed, onDone]);

  return (
    <p className={`leading-relaxed ${className}`}>
      {words.map((word, i) => (
        <span
          key={`${text}-${i}`}
          className={i < visibleWords ? 'word-appear inline-block mx-0.5' : 'opacity-0 inline-block mx-0.5'}
          style={i < visibleWords ? { animationDelay: '0ms' } : undefined}
        >
          {word}
        </span>
      ))}
    </p>
  );
}
