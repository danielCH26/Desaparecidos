'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { registerAction } from '@/app/actions/auth';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full min-h-[44px] bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
    >
      {pending ? 'Creando cuenta…' : 'Crear cuenta'}
    </button>
  );
}

export default function RegisterForm() {
  const [state, formAction] = useFormState(registerAction, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) router.push('/');
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="cedula" className="block text-sm font-medium mb-1">
          Cédula
        </label>
        <input
          id="cedula"
          name="cedula"
          type="text"
          inputMode="numeric"
          required
          autoComplete="username"
          className="w-full min-h-[44px] border rounded px-3 py-2"
          placeholder="1234567890"
        />
      </div>
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium mb-1">
          Nombre a mostrar (opcional)
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          autoComplete="nickname"
          className="w-full min-h-[44px] border rounded px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Contraseña (mínimo 8 caracteres)
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full min-h-[44px] border rounded px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full min-h-[44px] border rounded px-3 py-2"
        />
      </div>
      {state?.error && (
        <p role="alert" className="text-red-600 text-sm">
          {state.error}
        </p>
      )}
      <SubmitButton />
      <p className="text-sm text-center mt-2">
        ¿Ya tenés cuenta?{' '}
        <Link href="/login" className="text-blue-600 underline">
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
