import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { classNames } from '@utils/index';

interface CheckboxProps extends Omit<ButtonHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string | ReactNode;
  checked?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkboxId = id || 'checkbox';

    return (
      <label className="flex items-center gap-2.5 cursor-pointer group">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className={classNames(
            'w-4.5 h-4.5 rounded border-slate-300 text-emerald-600',
            'focus:ring-emerald-500 focus:ring-offset-0',
            'transition-colors duration-200',
            className
          )}
          {...props}
        />
        {label && (
          <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
            {label}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
