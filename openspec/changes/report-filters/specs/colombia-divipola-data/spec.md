# colombia-divipola-data

## Purpose

Static TypeScript data file with the full DANE DIVIPOLA list — all 32 Colombian departments + Bogotá D.C. and their 1,122 municipalities. Used by the filter bar and the create form to populate department + municipio selects.

## Requirements

- File: `lib/colombia-divipola.ts`
- Exports:
  - `DEPARTMENTS: readonly string[]` — 33 entries: the 32 departments + "Bogotá D.C.", sorted alphabetically
  - `MUNICIPALITIES: Readonly<Record<string, readonly string[]>>` — keyed by department, value is sorted array of all municipalities
  - `isValidDepartment(d: string): boolean` — true if d ∈ DEPARTMENTS
  - `municipalitiesFor(d: string): readonly string[]` — returns the list for a department (empty if invalid)
  - `municipalitiesForFlat(): readonly string[]` — returns all municipalities across all departments, sorted (used for "Sin municipio" detection)
  - `isValidMunicipality(d: string, m: string): boolean` — true if m ∈ MUNICIPALITIES[d]
- Data source: DANE DIVIPOLA codes (publicly available, used as the basis for the static file)
- Module is tree-shakeable: only the specific exports used by the caller get bundled
- TypeScript strict; no `any`; index access to MUNICIPALITIES uses `?? []` to handle the (theoretically impossible) missing-key case

## Scenarios

- GIVEN `DEPARTMENTS`
- WHEN accessed
- THEN it contains 33 entries including "Amazonas", "Antioquia", "Bogotá D.C." (case-sensitive, with the period), "Valle del Cauca", "Vaupés", "Vichada"
- AND sorted alphabetically

- GIVEN `MUNICIPALITIES["Antioquia"]`
- WHEN accessed
- THEN it contains a sorted list of all Antioquian municipalities including "Abejorral", "Abriaquí", "Medellín" (capital), "Turbo", "Zaragoza" (~125 entries)

- GIVEN `isValidDepartment("Antioquia")`
- THEN returns true
- GIVEN `isValidDepartment("Atlantis")`
- THEN returns false

- GIVEN `isValidMunicipality("Antioquia", "Medellín")`
- THEN returns true
- GIVEN `isValidMunicipality("Antioquia", "Miami")`
- THEN returns false
- GIVEN `isValidMunicipality("Atlantis", "Medellín")`
- THEN returns false (Atlantis not a valid department)

- GIVEN `municipalitiesFor("Antioquia")`
- THEN returns the full list
- GIVEN `municipalitiesFor("Atlantis")`
- THEN returns an empty array

## Hard rules
- All 1,122 municipalities must be present (this is the main value of the file)
- No external API calls; data is static and bundled at build time
- Departments + municipalities in Spanish (no English translations)
- Use proper Unicode for accents (e.g., "Bogotá D.C.", "Medellín", "Quibdó")
- The MUNICIPALITIES object MUST have an entry for every DEPARTMENTS entry (including "Bogotá D.C." with its localities)

## Note
- The data is large (~50KB minified). Acceptable trade-off for offline-correctness and zero external dependencies.
