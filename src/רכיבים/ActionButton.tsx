import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  className?: string;
}

export default function ActionButton({ children, onClick, variant = 'primary', disabled = false, className = '' }: Props) {
  const base = 'px-8 py-4 rounded-2xl font-medium text-lg transition-all duration-300 select-none';

  const variants = {
    primary: 'action-btn text-white',
    secondary: 'secondary-btn text-white/80',
    ghost: 'bg-transparent text-white/60 hover:text-white/90'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${disabled ? 'opacity-40 pointer-events-none' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
