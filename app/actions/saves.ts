'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type Result = { saved: boolean } | { error: string };

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function toggleSaveAction(reportId: string, currentSaved: boolean): Promise<Result> {
  if (!UUID_REGEX.test(reportId)) {
    return { error: 'Identificador de reporte inválido' };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Iniciá sesión para guardar reportes' };
  }

  // Verify report exists
  const { data: report } = await supabase
    .from('reports')
    .select('id')
    .eq('id', reportId)
    .single();
  if (!report) {
    return { error: 'El reporte ya no existe' };
  }

  if (currentSaved) {
    // DELETE the save
    const { error } = await supabase
      .from('saves')
      .delete()
      .eq('report_id', reportId)
      .eq('profile_id', user.id);
    if (error) {
      return { error: 'No se pudo quitar de guardados' };
    }
    revalidatePath('/profile');
    revalidatePath(`/report/${reportId}`);
    return { saved: false };
  } else {
    // INSERT the save (catch unique constraint race condition)
    const { error } = await supabase
      .from('saves')
      .insert({ report_id: reportId, profile_id: user.id });
    if (error) {
      // 23505 = unique_violation = already saved, treat as success
      if (error.code === '23505') {
        return { saved: true };
      }
      return { error: 'No se pudo guardar el reporte' };
    }
    revalidatePath('/profile');
    revalidatePath(`/report/${reportId}`);
    return { saved: true };
  }
}
