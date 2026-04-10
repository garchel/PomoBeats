# Electron Session Persistence

## Goal

Move saved session persistence from `localStorage` to Electron-backed storage for the
desktop app, while preserving existing user sessions through a safe migration path.

## Problem Summary

Today the app stores sessions in `localStorage`, while settings already live in Electron
store. This works for the MVP, but it leaves session data tied to the renderer storage
layer instead of the desktop application itself.

That creates a few product and maintenance issues:

- session data depends on the renderer storage environment
- desktop persistence strategy is split across two mechanisms
- future migration, backup, and desktop-specific data features become harder
- session data is less clearly owned by the Electron app lifecycle

The migration must be careful because saved sessions are user data and the app already
has existing `localStorage` content that should not be lost.

## Scope

In scope:

- Add Electron-backed persistence for saved session index and payloads
- Expose session persistence through the preload bridge
- Migrate existing `localStorage` sessions into Electron-backed storage in desktop mode
- Keep the renderer using one persistence abstraction instead of direct storage access

Out of scope:

- Cloud sync
- multi-device sync
- remote backups
- changing the canonical session schema itself

## Requirements

### FR-1 Desktop source of truth

In Electron mode, saved sessions must use Electron-backed persistence as the source of
truth instead of renderer `localStorage`.

Done when:

- save/load/delete/import/export flows read and write sessions through the Electron
  bridge in desktop mode
- the renderer no longer directly depends on `localStorage` for desktop session data

### FR-2 Safe migration

Existing sessions already stored in `localStorage` must be migrated safely in Electron
mode.

Done when:

- desktop startup checks whether legacy renderer sessions exist
- sessions are copied into Electron-backed persistence without data loss
- repeated startups do not duplicate migrated sessions

### FR-3 Web compatibility

The app must still work outside Electron using the current browser-based fallback.

Done when:

- session flows still work in `npm run dev`
- the renderer persistence abstraction supports Electron and browser environments

### FR-4 Consistent session API

Session persistence behavior must be exposed through one coherent API for the renderer.

Done when:

- session storage logic lives behind a dedicated abstraction
- UI components and context use the abstraction rather than choosing storage manually

### FR-5 Verification

The migration must be verifiable before replacing the current workflow.

Done when:

- automated tests cover the abstraction behavior where practical
- there is a manual checklist for migration from legacy `localStorage`
- Electron restart verification confirms sessions persist after migration

## Non-Functional Requirements

### NFR-1 Data safety

Migration should prefer copy-then-switch behavior instead of destructive move behavior,
so a failed migration does not wipe the user's old data.

### NFR-2 Maintainability

Session storage should be isolated in a small module so future moves to database or file
storage do not require touching every UI component.

### NFR-3 Minimal user friction

Migration should happen automatically in Electron mode without asking the user to export
or reimport sessions manually.

## Confirmed Decisions

- This migration is for desktop mode first.
- Web mode keeps a browser-based fallback.
- Existing `localStorage` session data should be migrated, not discarded.
- The migration should happen after the first version became functionally stable.
