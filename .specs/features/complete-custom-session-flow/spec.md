# Complete Custom Session Flow

## Goal

Close the main product gaps so PomoBeats can reliably support the intended flow:
create a custom study session, save it, reload it, import/export it, and execute the
full sequence in the player.

## Problem Summary

The current codebase already supports composing a session as an ordered list of
study and break intervals, but key inconsistencies prevent the app from behaving as a
complete product:

- Session persistence uses inconsistent metadata shapes across save/load screens.
- Import/export validation does not match the actual session schema.
- The player UI does not execute the session sequence yet.
- Electron settings persistence exists, but the desktop bridge is incomplete.
- Product documentation and implementation priorities are still implicit.

## Scope

In scope:

- Unify session data contracts used by editor, storage, import/export, and player.
- Complete the player flow for sequential interval execution.
- Fix save/load/import/export inconsistencies.
- Harden Electron settings persistence so desktop mode works predictably.
- Improve UX feedback where broken flows currently exist.

Out of scope:

- Cloud sync or online accounts.
- Task manager integrations.
- Rich analytics/history dashboards.
- Audio library expansion beyond the current settings model.

## Requirements

### FR-1 Session contract

The app must use one canonical session schema everywhere:

- `title: string`
- `intervals: Interval[]`
- each `Interval` must include `name`, `duration`, and `type`

Done when:

- Save/load/import/export/player all consume the same shape.
- No component expects `sessions` when the source of truth uses `intervals`.

### FR-2 Session editor reliability

Users must be able to create and edit a custom ordered sequence of study and break
intervals before starting playback.

Done when:

- Users can add, remove, and inspect intervals without corrupting the session state.
- Empty-state and validation feedback remain clear.

### FR-3 Save and load flow

Users must be able to save a session locally and later reload it from the saved
sessions screen.

Done when:

- Saved list metadata matches what the UI displays.
- Saving an existing title updates the stored session instead of duplicating entries.
- Loading restores the full session object into the editor flow.
- Renaming a session and saving creates a new saved session entry.

### FR-4 Import and export flow

Users must be able to export the current session to JSON and import a valid JSON file
back into the app.

Done when:

- Export writes the canonical session object.
- Import validates the canonical schema and rejects malformed files with friendly
  feedback.
- Navigation exposes import/export actions in a discoverable place.
- If an imported title already exists, the imported session is saved with a safe suffix
  instead of overwriting the existing one.

### FR-5 Player execution flow

Users must be able to run the configured session as a sequence of timed intervals.

Done when:

- Starting playback selects the first interval when needed.
- The timer counts down in real time.
- Users can play/pause and move to previous/next intervals safely.
- When an interval ends, the player advances according to the configured flow.
- The active interval shown in the UI matches the underlying session state.
- When the final interval ends, the player stops and remains on the player screen in a
  completed state until the user decides what to do next.

### FR-6 Settings persistence

Settings changed in the app must persist across desktop restarts in Electron mode.

Done when:

- The preload bridge is actually wired to the BrowserWindow.
- Renderer code does not depend on unsafe Electron globals.
- Settings load on startup and save after updates.

### FR-7 UX consistency

Broken or partially implemented paths must provide consistent feedback and avoid mixed
interaction patterns.

Done when:

- Error/success messaging uses one consistent pattern.
- Placeholder or dead-end controls are either completed or removed.
- Core labels and flows reflect the actual product instead of template defaults.

## Non-Functional Requirements

### NFR-1 Maintainability

Shared behavior should live in the context or a dedicated utility/hook layer instead of
being duplicated across UI components.

### NFR-2 Desktop safety baseline

Electron configuration should move toward a safer preload-based bridge by avoiding
unnecessary renderer privileges.

### NFR-3 Verification

The implementation must include at least:

- lint passing
- manual verification checklist for create/save/load/import/export/player flows

## Risks

- Player logic touches multiple pieces of context state and can introduce stale-state
  bugs if timer behavior is scattered across components.
- Electron bridge changes may break settings persistence if preload wiring and typings
  drift apart.
- Existing localStorage data may not match the corrected schema and may need a light
  compatibility strategy.

## Confirmed Decisions

- Session persistence will remain in `localStorage` for the first implementation pass.
- Settings persistence will remain in Electron store.
- Auto-start preferences for pomodoro and break intervals are in scope for this
  iteration and must affect player transitions.
- Saved session metadata will use exactly these fields:
  - `title`
  - `intervalCount`
  - `totalDuration`
  - `updatedAt`
- Saving with the same title updates the existing saved session.
- Saving after changing the title creates a new saved session.
- Import conflicts are resolved by creating a new saved session title with a suffix.
- The session list uses a human-readable duration format.
- The player uses a countdown clock format.

## Deferred Follow-Up

- After the first version is stable, evaluate a planned migration of session storage
  from `localStorage` to Electron-backed persistence.
