# create-report-action (MODIFIED delta)

## What changes from the existing main spec at `openspec/specs/create-report-action/spec.md`

The action now also reads and validates `department` and `municipality` formData fields, and includes them in the INSERT.

## Requirements

- **MODIFIED Requirement — Inputs read.** The action MUST read, in addition to existing fields: `department` (string, from `formData.get('department')`) and `municipality` (string, from `formData.get('municipality')`).
- **ADDED Requirement — Department validation.** If `department` is empty, the action MUST return `{ error: 'Seleccioná un departamento' }`. If non-empty, the action MUST validate via `isValidDepartment(department)` (from `lib/colombia-divipola.ts`); if invalid, return `{ error: 'Departamento inválido' }`.
- **ADDED Requirement — Municipality validation.** If `municipality` is empty, return `{ error: 'Seleccioná un municipio' }`. If non-empty, validate via `isValidMunicipality(department, municipality)`; if invalid (or department not selected), return `{ error: 'Municipio inválido para ese departamento' }`.
- **MODIFIED Requirement — Insert.** The INSERT now includes `department` and `municipality` along with the existing fields.
- **MODIFIED Requirement — Status filter default.** Unchanged: `.eq('status', 'missing')` still applies (the form is the create path, not list).

## Scenarios

- GIVEN the form submits with `department=""` or `municipality=""`
- WHEN the action runs
- THEN return `{ error: 'Seleccioná un departamento' }` or `{ error: 'Seleccioná un municipio' }` respectively
- AND no row is inserted

- GIVEN the form submits with `department="Antioquia"` but `municipality="Miami"`
- WHEN the action runs
- THEN return `{ error: 'Municipio inválido para ese departamento' }`
- AND no row is inserted

- GIVEN the form submits with valid department + municipality
- WHEN the action runs
- THEN the INSERT includes both fields
- AND the new row has `department="Antioquia"`, `municipality="Medellín"`

- GIVEN the form submits with `department="Antioquia"` and `municipality="Medellín"` and `isAnonymous=true`
- WHEN the action runs
- THEN `published_by=null`, `department="Antioquia"`, `municipality="Medellín"`, `person_photo_url=null` (no photo for anon)

## Hard rules
- DO NOT skip the new validations (would insert rows with NULL department which break filtering)
- DO NOT allow empty department or empty municipality
- All error messages in Spanish
