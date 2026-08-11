'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { syntheticEmailFor } from '@/lib/supabase/syntheticEmail';

const CEDULA_REGEX = /^\d{6,10}$/;

/**
 * Translate common Supabase auth errors to Spanish.
 */
function translateAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('user already registered')) return 'Esta cédula ya está registrada';
  if (lower.includes('invalid login credentials')) return 'Cédula o contraseña incorrecta';
  if (lower.includes('password should be at least 6 characters')) {
    return 'La contraseña debe tener al menos 8 caracteres';
  }
  if (lower.includes('rate limit')) return 'Demasiados intentos, espera un momento';
  return 'No se pudo procesar la solicitud. Intenta de nuevo.';
}

/**
 * Open-redirect guard: only allow relative paths starting with `/`.
 */
function safeRedirectPath(redirectParam: string | null | undefined): string {
  if (!redirectParam) return '/';
  if (redirectParam.startsWith('/') && !redirectParam.startsWith('//')) {
    return redirectParam;
  }
  return '/';
}

export async function registerAction(_prev: unknown, formData: FormData) {
  const cedula = String(formData.get('cedula') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');
  const displayName = String(formData.get('displayName') ?? '').trim();

  if (!CEDULA_REGEX.test(cedula)) {
    return { error: 'Cédula debe tener entre 6 y 10 dígitos' };
  }
  if (password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres' };
  }
  if (password !== confirmPassword) {
    return { error: 'Las contraseñas no coinciden' };
  }

  const supabase = await createSupabaseServerClient();
  const email = syntheticEmailFor(cedula);

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        cedula,
        display_name: displayName || undefined,
      },
    },
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }
  return { success: true };
}

export async function loginAction(_prev: unknown, formData: FormData) {
  const cedula = String(formData.get('cedula') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const redirectParam = String(formData.get('redirect') ?? '');

  if (!CEDULA_REGEX.test(cedula) || !password) {
    return { error: 'Cédula o contraseña incorrecta' };
  }

  const supabase = await createSupabaseServerClient();
  const email = syntheticEmailFor(cedula);

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: 'Cédula o contraseña incorrecta' };
  }
  redirect(safeRedirectPath(redirectParam));
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function updateProfileAction(_prev: unknown, formData: FormData) {
  const displayName = String(formData.get('display_name') ?? '').trim() || null;
  const realPhone = String(formData.get('real_phone') ?? '').trim() || null;
  const realEmail = String(formData.get('real_email') ?? '').trim() || null;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sesión expirada, inicia sesión de nuevo' };

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: displayName,
      real_phone: realPhone,
      real_email: realEmail,
    })
    .eq('id', user.id);

  if (error) {
    return { error: 'No se pudo actualizar el perfil' };
  }
  revalidatePath('/profile');
  return { success: true };
}
