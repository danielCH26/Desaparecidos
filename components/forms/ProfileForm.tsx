'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { updateProfileAction } from '@/app/actions/auth';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full min-h-[44px] bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
    >
      {pending ? 'Guardando…' : 'Guardar cambios'}
    </button>
  );
}

export default function ProfileForm({
  displayName,
  realPhone,
  realEmail,
}: {
  displayName: string;
  realPhone: string;
  realEmail: string;
}) {
  const [state, formAction] = useFormState(updateProfileAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="display_name" className="block text-sm font-medium mb-1">
          Nombre a mostrar (público)
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          defaultValue={displayName}
          className="w-full min-h-[44px] border rounded px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="real_phone" className="block text-sm font-medium mb-1">
          Teléfono de contacto (privado)
        </label>
        <input
          id="real_phone"
          name="real_phone"
          type="tel"
          defaultValue={realPhone}
          className="w-full min-h-[44px] border rounded px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="real_email" className="block text-sm font-medium mb-1">
          Correo de contacto (privado)
        </label>
        <input
          id="real_email"
          name="real_email"
          type="email"
          defaultValue={realEmail}
          className="w-full min-h-[44px] border rounded px-3 py-2"
        />
      </div>
      {state?.error && (
        <p role="alert" className="text-red-600 text-sm">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p role="status" className="text-green-600 text-sm">
          Perfil actualizado
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
