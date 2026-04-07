# Design Notes

## Implementation Strategy

This feature is large enough to need a small design pass because the broken behavior is
spread across data modeling, playback state, storage, and Electron integration.

## Canonical Data Model

Use the existing `SessionObject` and `Interval` types as the single contract:

- `SessionObject`
- `title: string`
- `intervals: Interval[]`

Recommended follow-up:

- introduce a dedicated saved-session metadata type, separate from the full session
  payload, so the saved list screen does not infer metadata from partial objects

Example metadata shape:

- `title`
- `intervalCount`
- `totalDuration`
- `updatedAt`

## State Ownership

### PomoContext

Keep these responsibilities in the context:

- current editable session
- current page
- player state
- settings state
- persistence helpers

Expand the player state so the timer flow is explicit:

- `currentIntervalIndex`
- `remainingSeconds`
- `isPlaying`
- `playerActive`
- derived `currentInterval`

Recommended context actions:

- `startPlayer()`
- `pausePlayer()`
- `resumePlayer()`
- `resetPlayer()`
- `goToNextInterval()`
- `goToPreviousInterval()`
- `loadSession()`

This reduces ad-hoc player logic inside UI components.

## Timer Flow

### Single timer owner

The countdown side effect should live in one place only, preferably inside the context
or a dedicated timer hook used by the context.

### Expected behavior

1. Starting the player activates interval `0` if no interval is active.
2. `remainingSeconds` is initialized from the active interval duration.
3. While `isPlaying` is true, the timer decrements once per second.
4. When `remainingSeconds` reaches zero:
   - move to the next interval if one exists
   - otherwise stop playback, keep the current player view visible, and show a completed
     state
5. Previous/next controls should clamp within valid bounds.

### Auto-start settings

`autoStartBreaks` and `autoStartPomos` are part of this iteration.

Transition rule:

- when an interval ends, move to the next interval if one exists
- if the next interval is a `break`, use `autoStartBreaks`
- if the next interval is a `pomo`, use `autoStartPomos`
- when the relevant auto-start setting is `true`, begin the next interval immediately
- otherwise, preload the next interval and keep playback paused until the user confirms

## Persistence Strategy

### Sessions

Keep session persistence in `localStorage` for this iteration because:

- the code already uses it
- it is enough for a local-first MVP
- moving both sessions and settings to Electron store at once increases risk

This is an intentional temporary decision for the first stable version. After the core
session flow is stable, revisit a planned migration of session persistence to Electron.

Use stable keys:

- one index key for saved metadata
- one payload key per session title, or a namespaced variant

Recommended:

- `savedPomoSessions`
- `pomoSession:${title}`

If time permits, add a read-compatibility fallback for older payload keys.

Save behavior:

- saving with the same title updates the stored payload and metadata
- saving after changing the title creates a new saved entry
- importing with a conflicting title creates a suffixed title such as `Title (2)`

### Settings

Keep settings in Electron store, but fix the bridge:

- BrowserWindow must use `preload`
- prefer `contextIsolation: true`
- renderer should only use the exposed `window.electron` API

## UI Adjustments

### SessionControl

- keep interval creation focused on authoring
- remove any inactive player-specific rendering that belongs elsewhere

### SessionPanel

- show better metadata summary for the current session when useful
- keep save and export actions near the session title
- starting playback remains available from the session editing surface

### PomoPlayer

- become the single playback UI
- show current interval name, type, remaining time, and navigation controls
- use countdown clock formatting, switching to hours when needed

### BottomNav

- keep import/export out of BottomNav so it stays focused on navigation
- export belongs with the current editable session
- import belongs with the saved sessions library
- avoid commented-out controls in the final UI

## Compatibility Notes

The current saved metadata uses `intervals` as a count, while the saved screen expects
`sessions`. The fix should normalize both old and new metadata on read to avoid breaking
existing saved entries during development.
