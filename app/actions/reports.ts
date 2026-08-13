'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isValidDepartment, isValidMunicipality } from '@/lib/colombia-divipola';

type CreateReportResult = { error: string } | undefined;

function ok(): undefined {
  return undefined;
}

function err(message: string): CreateReportResult {
  return { error: message };
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function createReportAction(
  _prev: CreateReportResult,
  formData: FormData
): Promise<CreateReportResult> {
  // 1. Validate inputs
  const personName = String(formData.get('person_name') ?? '').trim();
  if (personName.length < 1 || personName.length > 200) {
    return err('El nombre debe tener entre 1 y 200 caracteres');
  }

  const personAgeRaw = String(formData.get('person_age') ?? '');
  let personAge: number | null = null;
  if (personAgeRaw) {
    const n = parseInt(personAgeRaw, 10);
    if (!Number.isFinite(n) || n < 0 || n > 130) {
      return err('La edad debe estar entre 0 y 130');
    }
    personAge = n;
  }

  const lat = parseFloat(String(formData.get('last_known_lat') ?? ''));
  const lng = parseFloat(String(formData.get('last_known_lng') ?? ''));
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return err('La latitud no es válida');
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    return err('La longitud no es válida');
  }

  const lastKnownAddress = String(formData.get('last_known_address') ?? '').trim() || null;
  if (lastKnownAddress && lastKnownAddress.length > 500) {
    return err('La dirección debe tener máximo 500 caracteres');
  }

  // Department and municipality
  const departmentRaw = String(formData.get('department') ?? '').trim();
  const municipalityRaw = String(formData.get('municipality') ?? '').trim();

  let department: string | null = null;
  let municipality: string | null = null;

  if (departmentRaw) {
    if (!isValidDepartment(departmentRaw)) {
      return err('El departamento no es válido');
    }
    department = departmentRaw;
  }

  if (municipalityRaw) {
    if (!department) {
      return err('Selecciona un departamento primero');
    }
    if (!isValidMunicipality(department, municipalityRaw)) {
      return err('El municipio no es válido para el departamento seleccionado');
    }
    municipality = municipalityRaw;
  }

  const lastSeenAtRaw = String(formData.get('last_seen_at') ?? '');
  let lastSeenAt: string | null = null;
  if (lastSeenAtRaw) {
    const d = new Date(lastSeenAtRaw);
    if (Number.isNaN(d.getTime())) {
      return err('La fecha/hora no es válida');
    }
    lastSeenAt = d.toISOString();
  }

  const contactPhone = String(formData.get('contact_phone') ?? '').trim();
  if (contactPhone.length < 7 || contactPhone.length > 20) {
    return err('El teléfono debe tener entre 7 y 20 caracteres');
  }

  const contactEmailRaw = String(formData.get('contact_email') ?? '').trim();
  let contactEmail: string | null = null;
  if (contactEmailRaw) {
    if (!isValidEmail(contactEmailRaw)) {
      return err('El correo no es válido');
    }
    contactEmail = contactEmailRaw;
  }

  const isAnonymous = String(formData.get('isAnonymous') ?? '') === 'true';
  const photoUrlRaw = String(formData.get('photoUrl') ?? '').trim();
  const personPhotoUrl: string | null = photoUrlRaw || null;

  if (isAnonymous && personPhotoUrl) {
    return err('Publicar como anónimo no permite adjuntar fotos');
  }

  // 2. Determine identity
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  let publishedBy: string | null = null;
  if (!isAnonymous) {
    if (!user) {
      return err('Debes iniciar sesión para identificarte');
    }
    publishedBy = user.id;
  }

  // 3. Insert
  const { error } = await supabase
    .from('reports')
    .insert({
      person_name: personName,
      person_age: personAge,
      person_photo_url: personPhotoUrl,
      last_known_lat: lat,
      last_known_lng: lng,
      last_known_address: lastKnownAddress,
      last_seen_at: lastSeenAt,
      contact_phone: contactPhone,
      contact_email: contactEmail,
      published_by: publishedBy,
      status: 'missing',
      department,
      municipality,
    });

  if (error) {
    return err('No se pudo guardar el reporte, intenta de nuevo');
  }

  // 4. Redirect (Server Actions can throw redirect to control flow)
  redirect('/');
  return ok();
}
