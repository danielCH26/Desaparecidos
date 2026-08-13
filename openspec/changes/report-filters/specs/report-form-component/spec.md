# report-form-component (MODIFIED delta)

## What changes from the existing main spec at `openspec/specs/report-form-component/spec.md`

The form gains two required fields: `department` (select) and `municipality` (select, filtered by selected department). They appear after `last_known_address` and before the anonymous/identified toggle.

## Requirements

- **MODIFIED Requirement — Form fields.** The form MUST include inputs for: `person_name`, `person_age`, `department` (new), `municipality` (new), `last_known_address`, `last_seen_at`, `contact_phone`, `contact_email`, and the toggle.
- **ADDED Requirement — Department select.** Render a `<select name="department" required>` after the address field, before the toggle. First option: empty (placeholder "Seleccioná un departamento"). Then a sorted list of all 33 departments from `DEPARTMENTS`. The select MUST have `id="department"`, `aria-label="Departamento"`, `aria-required="true"`. Default value: empty string.
- **ADDED Requirement — Municipality select.** Render a `<select name="municipality" required>` immediately after the department select. First option: empty (placeholder "Seleccioná un municipio"). Then the list `municipalitiesFor(department)`. When `department` is empty, the list is empty (just the placeholder). The select MUST have `id="municipality"`, `aria-label="Municipio"`, `aria-required="true"`. Default value: empty string.
- **ADDED Requirement — Cascading select behavior.** When the user changes the department select:
  1. The municipality select is reset to empty (state update).
  2. The list of municipality options re-renders to the new department's list.
- **ADDED Requirement — Client-side validation (already in spec).** Both selects MUST be required (browser `required` attribute + JS guard in onSubmit). If empty, submit is blocked with an inline error "Seleccioná un departamento" / "Seleccioná un municipio".
- **MODIFIED Requirement — Spanish copy throughout.** All new labels in Spanish.

## Scenarios

- GIVEN the user is on `/report/new`
- WHEN the page renders
- THEN the form has a department select with all 33 options
- AND a municipality select that's initially empty (no department selected)

- GIVEN the user selects "Antioquia" in the department select
- WHEN the change event fires
- THEN the municipality select's options refresh to show all Antioquian municipalities
- AND the previously-selected municipality (if any) is reset to empty

- GIVEN the user submits with department="" or municipality=""
- WHEN the form submits
- THEN the browser shows the `required` validation message
- AND the Server Action is NOT called

- GIVEN the user submits with department="Antioquia" and municipality="Medellín"
- WHEN the form submits
- THEN the formData contains `department=Antioquia` and `municipality=Medellín`
- AND the createReportAction includes both in the INSERT

## Hard rules
- DO NOT use a free-text input for department/municipality (strict dropdown only)
- DO NOT introduce a search/autocomplete within the select
- 44 px touch targets on both selects
- Spanish copy
- No emoji
