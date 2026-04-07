# Tasks

## T1 Unify session contracts and storage metadata

What:

- Normalize the canonical session schema across context, saved sessions, and import/export.
- Introduce a proper saved-session metadata shape and compatibility read logic if needed.

Where:

- `src/context/PomoContext.tsx`
- `src/components/SavedListsPanel.tsx`
- `src/components/BottomNav.tsx`
- optional shared type file if extracted

Depends on:

- none

Done when:

- Saving, loading, importing, and exporting all use `SessionObject`.
- Saved list entries render correct counts and dates.
- Existing duplicate-field mismatches are removed.
- Import title collisions create a suffixed title instead of overwriting data.

Verification:

- save a new session
- save again with the same title and confirm update behavior
- change the title and save again to confirm a new saved entry is created
- reload from saved sessions
- export the session and inspect the JSON shape
- import the exported JSON successfully
- import a session whose title already exists and confirm suffix behavior

## T2 Build the player state machine in context

What:

- Add the missing playback state and timer behavior in the context.

Where:

- `src/context/PomoContext.tsx`
- optional helper or hook under `src/`

Depends on:

- T1

Done when:

- there is a single source of truth for active interval and remaining time
- start, pause, resume, next, and previous actions work against valid session data
- the timer progresses without duplicating side effects in UI components
- end-of-interval transitions honor `autoStartBreaks` and `autoStartPomos`

Verification:

- start a session with multiple intervals
- confirm countdown updates each second
- pause and resume without timer drift
- move next and previous while preserving valid bounds
- verify that break intervals auto-start only when `autoStartBreaks` is enabled
- verify that study intervals auto-start only when `autoStartPomos` is enabled
- verify that disabled auto-start leaves the next interval selected but paused

## T3 Complete the player UI

What:

- Connect `PomoPlayer` to the new playback actions and render the real active interval state.

Where:

- `src/components/PomoPlayer.tsx`
- `src/components/SessionControl.tsx`
- `src/components/SessionPanel.tsx`

Depends on:

- T2

Done when:

- the player screen reflects the active interval and remaining time
- switching between editor and player preserves expected state
- player controls are no longer placeholder-only
- the completed-state UI is shown when the last interval ends

Verification:

- start playback from a valid session
- navigate between player and editor screens
- confirm displayed interval name, type, and time remain correct
- run the final interval to completion and confirm the player stays visible in a
  completed state

## T4 Repair import/export UX and remove dead-end controls

What:

- Finish the import/export flow and expose it in the surfaces that best match the user
  mental model.

Where:

- `src/components/SessionPanel.tsx`
- `src/components/SavedListsPanel.tsx`
- `src/components/BottomNav.tsx`
- any new UI helper component if needed

Depends on:

- T1

Done when:

- users can discover and run export from the current session screen
- users can discover and run import from the saved sessions screen
- invalid files show friendly errors
- there are no commented-out production controls for this flow

Verification:

- export a session
- import the same file
- try a malformed JSON file and confirm graceful failure

## T5 Finish Electron settings persistence wiring

What:

- Wire BrowserWindow preload correctly and align runtime behavior with exposed typings.

Where:

- `public/electron.js`
- `public/preload.js`
- `src/types/global.d.ts`
- any renderer calls that assume unsafe globals

Depends on:

- none

Done when:

- settings load on startup in Electron mode
- settings save after changes
- preload bridge is the intended API boundary

Verification:

- run Electron app
- toggle settings
- restart app and confirm settings persist

## T6 Polish product-facing defaults and docs

What:

- Replace template leftovers and document the actual product flow.

Where:

- `README.md`
- `index.html`
- optional inline labels in components

Depends on:

- T1 to T5 ideally completed or stable

Done when:

- app title and documentation describe PomoBeats instead of Vite starter content
- the README explains the current MVP capabilities and known next steps

Verification:

- inspect browser tab title
- inspect README for setup and feature accuracy

## Suggested Order

1. T1
2. T2
3. T3
4. T4
5. T5
6. T6

## Gate Checks

- `npm run lint`
- manual flow test for create -> save -> load -> export -> import -> play

## Deferred Work

- once the first version is stable, evaluate a planned migration of session persistence
  from `localStorage` to Electron-backed storage
