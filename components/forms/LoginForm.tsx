'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { loginAction } from '@/app/actions/auth';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full min-h-[44px] bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
    >
      {pending ? 'Ingresando…' : 'Iniciar sesión'}
    </button>
  );
}

export default function LoginForm({ redirect }: { redirect: string }) {
  const [state, formAction] = useFormState(loginAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirect" value={redirect} />
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
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
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
        ¿No tenés cuenta?{' '}
        <Link href="/register" className="text-blue-600 underline">
          Registrarse
        </Link>
      </p>
    </form>
  );
}
