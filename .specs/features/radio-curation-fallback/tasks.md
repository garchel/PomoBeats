# Tasks

## T1 Extend settings model for radio source modes

What:

- Add source mode and radio category fields for study and interval music.

Where:

- `src/types/pomo.ts`
- `src/context/PomoContext.tsx`
- `public/electron.js`

Done when:

- settings defaults and persistence include source/category fields
- existing generated and custom-file behavior still has valid defaults

## T2 Add radio catalog and Radio Browser client helpers

What:

- Introduce reusable category metadata and station lookup helpers with filtering.

Where:

- `src/lib/radioCatalog.ts`
- `src/lib/radioBrowser.ts`

Done when:

- categories and tag mappings live outside UI components
- the app can request filtered station candidates for a category

## T3 Teach the audio controller to play curated radio with fallback

What:

- Extend the interval audio path to support radio mode for study and break music.

Where:

- `src/lib/audio.ts`

Done when:

- generated, radio, and custom modes all work through the same controller
- radio candidate fallback is attempted before giving up

## T4 Update the settings UI

What:

- Replace the old track-only music configuration with source-aware controls.

Where:

- `src/components/SettingsPanel.tsx`

Done when:

- study and interval music can switch between generated, radio, and custom
- radio categories are selectable in the UI
- irrelevant controls stay hidden

## T5 Add automated coverage and validate

What:

- Cover persistence and audio-selection behavior with tests.

Where:

- `src/test/settings-panel.test.tsx`
- optional new audio test file under `src/test/`

Done when:

- automated tests cover the new fields and at least one radio fallback path
- lint, type-check, and tests pass
