import { type ReactNode } from 'react';
import { classNames } from '@utils/index';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div
      className={classNames(
        'bg-white rounded-xl border border-slate-200 shadow-sm',
        {
          'p-3': padding === 'sm',
          'p-5': padding === 'md',
          'p-6': padding === 'lg',
          'p-0': padding === 'none',
        },
        className
      )}
    >
      {children}
    </div>
  );
}
