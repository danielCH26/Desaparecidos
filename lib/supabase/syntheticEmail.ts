/**
 * Construct the synthetic Supabase auth email from a Colombian cédula.
 * Single source of truth — used by register and login pages.
 */

export function syntheticEmailFor(cedula: string): string {
  const trimmed = cedula.trim();
  if (!trimmed) {
    throw new Error('Cédula required for synthetic email');
  }
  return `${trimmed}@desaparecidos.local`;
}
