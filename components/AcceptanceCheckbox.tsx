'use client';

import Link from 'next/link';

interface AcceptanceCheckboxProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  /** When true, the checkbox is shown but not required (e.g., on /login where acceptance was already given on /register). */
  optional?: boolean;
}

export default function AcceptanceCheckbox({
  checked,
  onChange,
  disabled = false,
  required = false,
  optional = false,
}: AcceptanceCheckboxProps) {
  return (
    <div className="mt-4">
      <label
        className={`flex items-start gap-2 ${
          disabled ? 'opacity-60' : 'cursor-pointer'
        }`}
      >
        <input
          type="checkbox"
          id="acceptance-terms"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          required={required}
          className="mt-1 min-h-[20px] min-w-[20px]"
          aria-required={required}
        />
        <p className="text-sm text-gray-800">
          {optional ? 'Recordatorio: ' : ''}
          Acepto la{' '}
          <Link
            href="/legal/datos"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Política de Tratamiento de Datos Personales
          </Link>{' '}
          y los{' '}
          <Link
            href="/legal/terminos"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Términos y Condiciones
          </Link>{' '}
          del servicio.
        </p>
      </label>
    </div>
  );
}
