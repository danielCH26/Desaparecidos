# photo-storage Specification

## Purpose

Defines the `report-photos` Supabase Storage bucket and the storage-level Row Level Security policies that govern who can read, upload, update, and delete report photos. The bucket is public for reads (photos appear on `/reports` and `/report/[id]` without an account) but writes are restricted to authenticated users, in line with the user's locked decision that anonymous reports publish without a photo.

## Requirements

### Requirement: Bucket Creation

The migration MUST create a single bucket named `report-photos` with `public = true` so that public SELECT does not require signed URLs.

#### Scenario: bucket exists and is public

- GIVEN the migration has been applied
- WHEN `storage.buckets` is queried for `id = 'report-photos'`
- THEN exactly one row is returned and its `public` column equals `true`.

### Requirement: Public SELECT on report-photos

The migration MUST enable a SELECT policy on `storage.objects` scoped to `bucket_id = 'report-photos'` that grants `SELECT` to both `anon` and `authenticated` roles.

#### Scenario: anonymous user can read a stored photo

- GIVEN an object exists in `storage.objects` with `bucket_id = 'report-photos'`
- WHEN an anonymous session retrieves the object's public URL
- THEN the retrieval succeeds (HTTP 200) and returns the image bytes.

#### Scenario: authenticated user can read a stored photo

- GIVEN an object exists in `storage.objects` with `bucket_id = 'report-photos'`
- WHEN an authenticated session retrieves the object's public URL
- THEN the retrieval succeeds.

### Requirement: Authenticated-Only Writes

The migration MUST define `INSERT`, `UPDATE`, and `DELETE` policies on `storage.objects` scoped to `bucket_id = 'report-photos'` that allow the action only when `auth.role() = 'authenticated'`.

The owner/path check MUST be UUID-based: an authenticated user MAY upload/update/delete an object only when the object's `owner` equals `auth.uid()` (UUID comparison). Anonymous sessions MUST be rejected at the policy level, which means anonymous report submissions MUST NOT include a `person_photo_url`.

#### Scenario: anonymous INSERT to report-photos is rejected

- GIVEN an anonymous session (`auth.uid() IS NULL`)
- WHEN the session attempts `INSERT INTO storage.objects (bucket_id, name, owner, ...) VALUES ('report-photos', 'foo.jpg', NULL, ...)`
- THEN the insert is rejected by RLS (zero rows affected).

#### Scenario: authenticated INSERT with matching owner succeeds

- GIVEN an authenticated session with `auth.uid() = U`
- WHEN the session inserts an object into `storage.objects` with `bucket_id = 'report-photos'`, `name = 'U/photo.jpg'`, and `owner = U`
- THEN the insert succeeds.

#### Scenario: authenticated INSERT with mismatched owner is rejected

- GIVEN an authenticated session with `auth.uid() = U`
- WHEN the session attempts to insert an object with `owner = V` where `V != U`
- THEN the insert is rejected by RLS.

#### Scenario: authenticated DELETE of own object succeeds

- GIVEN an authenticated session with `auth.uid() = U` and an object owned by `U` exists in `report-photos`
- WHEN the session deletes that object
- THEN one row is deleted.

#### Scenario: authenticated DELETE of another user's object is rejected

- GIVEN an authenticated session with `auth.uid() = U` and an object owned by `V != U` exists
- WHEN the session deletes that object
- THEN zero rows are deleted.

### Requirement: Photo Upload Limits

The storage configuration MUST enforce the following limits for objects in the `report-photos` bucket:

- Maximum object size: 5 MB (per roadmap Q4 default).
- Accepted MIME types: `image/jpeg`, `image/png`, `image/webp`.

Limits are enforced via a `storage.objects` CHECK constraint and/or bucket-level configuration that rejects objects outside these bounds.

#### Scenario: oversized upload is rejected

- GIVEN an authenticated session with `auth.uid() = U`
- WHEN the session uploads an object larger than 5 MB into `report-photos`
- THEN the upload is rejected (the row is not inserted).

#### Scenario: unsupported MIME type is rejected

- GIVEN an authenticated session with `auth.uid() = U`
- WHEN the session uploads an object with `mime_type = 'application/pdf'` into `report-photos`
- THEN the upload is rejected.

#### Scenario: supported JPEG upload succeeds

- GIVEN an authenticated session with `auth.uid() = U`
- WHEN the session uploads an object of size 1 MB and `mime_type = 'image/jpeg'` into `report-photos`
- THEN the upload succeeds and the object is publicly readable.

### Requirement: No Anonymous Reports With Photo

Because the `report-photos` bucket rejects anonymous writes, the application MUST treat `reports.person_photo_url` as nullable and MUST NOT require it for anonymous (`published_by IS NULL`) inserts.

This is the storage-side counterpart to the `database-schema` requirement that declares `person_photo_url` nullable. The two requirements together make "anonymous publish without photo" the only legal anonymous report shape.

#### Scenario: anonymous report submission cannot reference a storage object

- GIVEN an anonymous session has no ability to insert into `report-photos`
- WHEN the session inserts a `reports` row with `published_by = NULL` and `person_photo_url = NULL`
- THEN the insert succeeds (per `database-schema`).
- WHEN the same session attempts to insert with `published_by = NULL` and a non-NULL `person_photo_url`
- THEN the row is accepted by the database, but the referenced photo object cannot exist (because the session cannot upload), so the URL would be a broken link. The Phase 3 form MUST prevent this case by hiding the photo field on the anonymous path.
