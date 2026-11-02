import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  const hintId = useId();
  const describedBy = [hint ? hintId : null, error ? `${htmlFor}-error` : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="field-label">
        {label}
        {required && <span className="ms-1 text-gold" aria-hidden="true">*</span>}
      </label>
      {hint && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
      {isValidElement(children)
        ? cloneElement(children as ReactElement<{ 'aria-describedby'?: string }>, { 'aria-describedby': describedBy })
        : children}
      {error && (
        <p id={`${htmlFor}-error`} className="flex items-center gap-1.5 text-sm font-medium text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export function Notice({ tone, children }: { tone: 'error' | 'success'; children: ReactNode }) {
  const isError = tone === 'error';
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-lg border p-4 ${
        isError ? 'border-danger text-danger' : 'border-success text-success'
      } bg-surface`}
    >
      {isError ? (
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      )}
      <div className="text-ink">{children}</div>
    </div>
  );
}
