# register-field-info-banner (NEW spec)

## Purpose

A callout banner rendered above the register form on `/register`. It exists specifically because Phase 2's register form generated a synthetic email from the cédula — users found the lack of an email field confusing. The banner preempts the confusion.

## Requirements

- The banner MUST appear above the form fields on `/register`
- The banner text MUST be in Spanish
- The banner MUST explain that the email field is OPTIONAL contact info, not a login email
- The banner MUST NOT have a dismiss/close button (it's informational, not a popup)
- The banner MUST use a subtle background color (e.g., `bg-blue-50 border-l-4 border-blue-400`) — not red/orange (those are reserved for errors)
- The banner MUST be accessible: semantic `<aside>` or `<div role="note">`
- Min-height 44 px is NOT required (it's a banner, not a button)

## Recommended text (Spanish)

> No necesitás email para entrar. Si dejás tu correo y celular acá, te podemos contactar si alguien encuentra a la persona que reportás. Tu cédula sigue siendo tu identificador único.

## Scenarios

- GIVEN the user is on `/register`
- WHEN the page renders
- THEN a banner with the text above is visible above the form
- AND the banner has a subtle blue background (not red)
- AND the banner is NOT dismissible

- GIVEN the banner is rendered
- WHEN a screen reader encounters it
- THEN it is announced as a `<aside>` or `<div role="note">`
