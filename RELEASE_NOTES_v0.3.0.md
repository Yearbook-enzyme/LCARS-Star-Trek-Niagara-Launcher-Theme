# v0.3.0 — Shared palette and gallery release

## Highlights

- Added a shared LCARS theme palette registry used by wallpaper, icon, and gallery views.
- Added categorized palette families:
  - Classic LCARS
  - Star Trek factions
  - Pride / identity
  - Regional / flag-inspired
  - Mood / function
  - Accessibility
  - Retro computing
  - Space / nature
- Added user-editable custom palette colors for LCARS blocks.
- Split wallpaper panel rhythm from color mapping so shape/proportion and palette assignment can be controlled separately.
- Added wallpaper color mappings:
  - LCARS role colors
  - Palette sweep
  - Palette sweep reversed
  - Flag stripes
  - Mirrored stripes
- Brought the icon generator into the same color-mapping model.
- Updated the gallery to use uncapped filtered browsing instead of hiding sections behind caps.
- Added live local-font previews in the gallery so decorative fonts can display correctly when installed locally, while preserving generated PNG fallbacks.

## Notes

- No font files are bundled or redistributed.
- Local patch backup folders are ignored through `.gitignore`.
- Custom palette choices are stored locally in the browser.
