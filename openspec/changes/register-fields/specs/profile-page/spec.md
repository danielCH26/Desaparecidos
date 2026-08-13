# profile-page (MODIFIED spec delta)

## What changes from the existing spec

The `/profile` page currently edits `display_name`. The delta adds two more fields — `real_email` and `real_phone` — using the same Server Action pattern (`updateProfileAction` already exists from Phase 2).

## Requirements

- **MODIFIED Requirement — Profile form fields.** The `/profile` form MUST render inputs for `display_name`, `real_email`, `real_phone`. Each prefilled from the loaded profile row (NULL → empty string). Submit calls `updateProfileAction`.
- **ADDED Requirement — Field labels.** Spanish: "Nombre a mostrar (público)" / "Correo (privado, para que te contactemos)" / "Celular (privado, para que te contactemos)".
- **ADDED Requirement — Privacy note.** Below the form, a small italic text: "Tu correo y celular son privados. Solo vos podés verlos."
- **MODIFIED Requirement — Same Server Action.** `updateProfileAction` is unchanged; it accepts the three fields and updates `profiles` for `auth.uid()`.

## Scenarios

- GIVEN user is logged in and on `/profile`
- WHEN the page renders
- THEN three fields appear: `display_name` (already), `real_email` (new), `real_phone` (new)
- AND the privacy note "Tu correo y celular son privados" appears below the form

- GIVEN the user updates `real_email` to "new@example.com" and clicks save
- WHEN the form submits
- THEN `profiles.real_email` becomes "new@example.com" for `id = auth.uid()`
- AND success toast "Perfil actualizado" appears

- GIVEN the user clears `real_phone` (empty string) and clicks save
- WHEN the form submits
- THEN `profiles.real_phone` becomes NULL for `id = auth.uid()`
