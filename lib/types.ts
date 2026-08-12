/**
 * Privacy-enforced type for report list cards.
 * Excludes contact_phone and contact_email — TS error if leaked.
 */
export interface ReportSummary {
  id: string;
  person_name: string;
  person_age: number | null;
  person_photo_url: string | null;
  last_known_lat: number;
  last_known_lng: number;
  last_known_address: string | null;
  last_seen_at: string | null;
  created_at: string;
  status: 'missing' | 'found' | 'resolved';
  published_by: string | null;
}

/**
 * Full report type for the detail page (includes contact info).
 */
export interface Report extends ReportSummary {
  contact_phone: string;
  contact_email: string | null;
  updated_at: string;
}
