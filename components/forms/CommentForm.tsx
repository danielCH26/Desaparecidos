'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { createCommentAction } from '@/app/actions/comments';

const MAX_BODY = 2000;

export default function CommentForm({ reportId, isAuthed }: { reportId: string; isAuthed: boolean }) {
  const [body, setBody] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (body.trim().length < 1) {
      setError('El comentario no puede estar vacío');
      return;
    }
    if (body.length > MAX_BODY) {
      setError(`El comentario no puede tener más de ${MAX_BODY} caracteres`);
      return;
    }

    const fd = new FormData();
    fd.append('body', body);
    fd.append('reportId', reportId);
    fd.append('isAnonymous', String(isAnonymous));

    startTransition(async () => {
      const result = await createCommentAction(undefined, fd);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setBody('');
      setSuccess(true);
      // Soft-scroll to comments list (or to the new comment when we add an id)
      const list = document.getElementById('comments-list');
      list?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const charsRemaining = MAX_BODY - body.length;

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor="comment-body" className="block text-sm font-medium mb-1">
          Tu comentario
        </label>
        <textarea
          id="comment-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={MAX_BODY}
          required
          aria-required="true"
          placeholder="Si tenés información sobre esta persona, dejala acá. Mantené el respeto."
          className="w-full border rounded px-3 py-2 min-h-[88px]"
        />
        <p className={`text-xs mt-1 ${charsRemaining < 100 ? 'text-orange-600' : 'text-gray-500'}`}>
          {body.length}/{MAX_BODY}
        </p>
      </div>

      <fieldset className="border rounded p-3">
        <legend className="text-sm font-medium px-2">¿Cómo querés firmar?</legend>
        <label className="flex items-center gap-2 py-1">
          <input
            type="radio"
            name="anonToggle"
            checked={isAnonymous}
            onChange={() => setIsAnonymous(true)}
          />
          <span>Como anónimo</span>
        </label>
        <label className="flex items-center gap-2 py-1">
          <input
            type="radio"
            name="anonToggle"
            checked={!isAnonymous}
            disabled={!isAuthed}
            onChange={() => setIsAnonymous(false)}
          />
          <span>
            Identificarme
            {!isAuthed && (
              <> (<Link href={`/login?redirect=/report/${reportId}`} className="text-blue-600 underline">iniciá sesión primero</Link>)</>
            )}
          </span>
        </label>
      </fieldset>

      {error && (
        <p role="alert" className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </p>
      )}
      {success && !error && (
        <p role="status" className="text-green-600 text-sm bg-green-50 p-2 rounded">
          Comentario publicado
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || body.trim().length === 0}
        className="w-full min-h-[44px] bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {isPending ? 'Publicando…' : 'Comentar'}
      </button>
    </form>
  );
}
