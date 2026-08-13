'use client';

import { useState, useTransition } from 'react';
import { toggleSaveAction } from '@/app/actions/saves';

interface SaveButtonProps {
  reportId: string;
  initialSaved: boolean;
  isAuthed: boolean;
}

export default function SaveButton({ reportId, initialSaved, isAuthed }: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isAuthed) return null;

  function onClick() {
    const previousSaved = saved;
    // Optimistic update
    setSaved(!previousSaved);
    setError(null);

    startTransition(async () => {
      const result = await toggleSaveAction(reportId, previousSaved);
      if ('error' in result) {
        // Revert optimistic state
        setSaved(previousSaved);
        setError(result.error);
        return;
      }
      setSaved(result.saved);
    });
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        aria-pressed={saved}
        className={
          saved
            ? 'w-full min-h-[44px] border border-blue-600 text-blue-600 bg-white rounded px-4 py-2'
            : 'w-full min-h-[44px] bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50'
        }
      >
        {isPending
          ? 'Guardando…'
          : saved
            ? 'Quitar de guardados'
            : 'Guardar'}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-600 mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
