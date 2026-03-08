import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { classNames } from '@utils/index';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, rightElement, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div
          className={classNames(
            'relative flex items-center rounded-lg border bg-white transition-all duration-200',
            {
              'border-slate-200 hover:border-slate-300': !error,
              'border-red-300 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100':
                error,
              'border-emerald-500 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100':
                !error,
            },
            className
          )}
        >
          {icon && (
            <div className="pl-3 text-slate-400 flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={classNames(
              'w-full bg-transparent border-none text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0',
              'h-11 px-3 text-sm',
              icon && 'pl-2',
              rightElement && 'pr-2',
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="pr-2 flex items-center justify-center">{rightElement}</div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
