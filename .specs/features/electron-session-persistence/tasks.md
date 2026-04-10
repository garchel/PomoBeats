# Tasks

## T1 Add Electron session persistence APIs

What:

- Extend Electron store defaults and IPC/preload methods to support saved sessions.

Where:

- `public/electron.js`
- `public/preload.js`
- `src/types/global.d.ts`

Done when:

- the renderer can list, load, save, and delete sessions through `window.electron`

## T2 Refactor the session repository abstraction

What:

- Split session normalization helpers from persistence implementation and add runtime
  selection between Electron and browser storage.

Where:

- `src/lib/sessionStorage.ts`
- optional new repository helper under `src/lib/`

Done when:

- renderer callers use one persistence API
- Electron mode reads/writes through the bridge
- browser mode still uses `localStorage`

## T3 Implement legacy migration

What:

- Migrate normalized legacy browser sessions into Electron-backed storage when needed.

Where:

- `src/lib/sessionStorage.ts`
- `src/context/PomoContext.tsx` or a startup initialization path

Done when:

- Electron startup imports legacy sessions once when Electron store is empty
- migrated sessions do not duplicate on subsequent runs

## T4 Verify saved sessions UI and flows

What:

- Ensure save/load/import/export/delete still work against the new repository.

Where:

- `src/components/SavedListsPanel.tsx`
- `src/context/PomoContext.tsx`
- any affected import/export callers

Done when:

- all existing saved-session flows behave the same from the user's perspective

## T5 Add tests and validation checklist

What:

- Cover repository behavior and migration logic, then validate in Electron manually.

Where:

- `src/test/`
- optional checklist note in feature docs or README

Done when:

- automated tests cover key repository cases
- a manual Electron migration checklist is documented
