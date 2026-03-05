import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function GlassCard({ children, className = '', onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`glass p-6 ${onClick ? 'cursor-pointer hover:bg-white/[0.08] transition-colors' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
