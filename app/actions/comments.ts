'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type CommentFormState = { error: string } | undefined;

const MAX_BODY = 2000;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createCommentAction(
  _prev: CommentFormState,
  formData: FormData
): Promise<CommentFormState> {
  const body = String(formData.get('body') ?? '').trim();
  const reportId = String(formData.get('reportId') ?? '').trim();
  const isAnonymous = String(formData.get('isAnonymous') ?? '') === 'true';

  if (body.length < 1 || body.length > MAX_BODY) {
    return { error: 'El comentario debe tener entre 1 y 2000 caracteres' };
  }
  if (!UUID_REGEX.test(reportId)) {
    return { error: 'Identificador de reporte inválido' };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const authorId: string | null = isAnonymous ? null : (user?.id ?? null);
  if (!isAnonymous && !user) {
    return { error: 'Iniciá sesión para identificarte' };
  }

  // Verify the report exists
  const { data: reportExists } = await supabase
    .from('reports')
    .select('id')
    .eq('id', reportId)
    .single();
  if (!reportExists) {
    return { error: 'El reporte ya no existe' };
  }

  const { error } = await supabase
    .from('comments')
    .insert({
      report_id: reportId,
      body,
      author_id: authorId,
    });

  if (error) {
    return { error: 'No se pudo publicar el comentario, intenta de nuevo' };
  }

  revalidatePath(`/report/${reportId}`);
  return undefined;
}
