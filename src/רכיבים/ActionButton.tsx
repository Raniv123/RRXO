import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  className?: string;
}

function buzz(ms = 14) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate(ms); } catch { /* ignore */ }
  }
}

export default function ActionButton({ children, onClick, variant = 'primary', disabled = false, className = '' }: Props) {
  const base = 'px-8 py-4 rounded-2xl font-light text-lg select-none tracking-wide';

  const variants = {
    primary: 'action-btn text-white',
    secondary: 'secondary-btn text-white/85',
    ghost: 'bg-transparent text-white/55 hover:text-white/90 transition-colors duration-300'
  };

  function handleClick() {
    if (disabled) return;
    buzz(12);
    onClick();
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${disabled ? 'opacity-40 pointer-events-none' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
