# Accessibility checklist

This project should keep the LCARS look while making the actual webpage usable with keyboard, screen readers, colorblindness, and browser translation tools.

## Baseline page structure

- [ ] Every HTML page has `<html lang="en">`.
- [ ] Every HTML page has a mobile viewport meta tag.
- [ ] Every page has a skip link to main content.
- [ ] Every page has a clear `<main id="main-content">` landmark.
- [ ] Heading order is logical and does not skip around unnecessarily.

## Keyboard access

- [ ] All interactive controls are reachable by keyboard.
- [ ] Focus is clearly visible on links, buttons, inputs, selects, and textareas.
- [ ] No custom control replaces a native HTML control unless it has equivalent keyboard behavior.
- [ ] Dialogs, menus, and dynamic panels do not trap focus accidentally.

## Screen reader access

- [ ] Buttons and links have clear text labels.
- [ ] Form controls have visible or programmatic labels.
- [ ] Dynamic status areas use `role="status"` and/or `aria-live="polite"` when useful.
- [ ] Canvas previews have text descriptions.
- [ ] Data tables have captions or clear nearby context.
- [ ] Decorative LCARS visuals do not block reading order.

## Color and contrast

- [ ] Text contrast aims for WCAG AA or better.
- [ ] Color is not the only way important information is communicated.
- [ ] High Contrast, Grayscale, and E-Ink palettes remain available.
- [ ] Focus rings are visible against LCARS colors.

## Motion and visual comfort

- [ ] Reduced-motion preferences are respected.
- [ ] Decorative effects do not make the interface harder to use.
- [ ] The site remains usable without relying on animation.

## Internationalization

- [ ] Page language is declared.
- [ ] UI text that should be translated is marked with `data-i18n`.
- [ ] The language picker updates `document.documentElement.lang`.
- [ ] Browser translation still works if a language is not built in.

## Testing

Run the site locally, then run an automated accessibility scan. Automated scans do not prove the site is fully accessible, but they catch many obvious problems.

Manual checks still matter:
- tab through the page
- use keyboard only
- test high contrast / grayscale palettes
- test browser zoom
- try a screen reader if possible
