# save-button-component

## Purpose

Client Component rendered on `/report/[id]` that lets a logged-in user toggle whether the report is saved to their profile. Visible only when authenticated.

## Requirements

- `'use client'`
- Props: `reportId: string`, `initialSaved: boolean`, `isAuthed: boolean`
- When `isAuthed=false`, the component MUST render nothing (no button, no fallback UI)
- When `isAuthed=true`, render a `<button type="button">` (NOT submit — toggling isn't a form submit)
- The button text MUST be "Quitar de guardados" when currently saved, "Guardar" when not saved
- The button background MUST be `bg-blue-600 text-white` when NOT saved (primary action), `bg-white text-blue-600 border border-blue-600` when saved (secondary action — clearable)
- The button MUST use 44 px min-height (`min-h-[44px]`)
- The button MUST call `toggleSaveAction(reportId, !currentSaved)` on click
- The component MUST show optimistic state: update the local "saved" flag immediately on click, before server response
- If the server action returns `{ error: '...' }`, the component MUST revert the optimistic state and show the error inline
- If the server action returns `{ saved: ... }`, the component MUST sync to that final state
- Use `useTransition` for the pending indicator
- Disable the button while pending (`disabled={isPending}`)
- Spanish copy throughout; no emoji

## Scenarios

- GIVEN the user is anonymous on `/report/<id>`
- WHEN the page renders
- THEN no SaveButton appears

- GIVEN the user is authenticated on `/report/<id>` and has NOT saved the report
- WHEN the page renders
- THEN SaveButton shows "Guardar" with blue background

- GIVEN the user is authenticated on `/report/<id>` and HAS saved the report
- WHEN the page renders
- THEN SaveButton shows "Quitar de guardados" with white background and blue border

- GIVEN the user clicks "Guardar"
- WHEN the click handler runs
- THEN the button text flips immediately to "Quitar de guardados"
- AND the server action inserts a row into `saves`
- AND on success, the button stays at "Quitar de guardados"

- GIVEN the user clicks "Quitar de guardados"
- WHEN the click handler runs
- THEN the button text flips immediately to "Guardar"
- AND the server action deletes the row from `saves`
- AND on success, the button stays at "Guardar"

- GIVEN the server action returns `{ error: 'No se pudo guardar, intenta de nuevo' }`
- WHEN the error propagates back
- THEN the optimistic state reverts to the previous value
- AND an error message "No se pudo guardar, intenta de nuevo" appears below the button

## Hard rules
- DO NOT use form submit — `type="button"`, call Server Action directly
- DO NOT include in /report/new or any other route — only /report/[id]
- 44 px min-height required
- Server Action contract: `toggleSaveAction(reportId: string, currentSaved: boolean) → Promise<{ saved: boolean } | { error: string }>`
