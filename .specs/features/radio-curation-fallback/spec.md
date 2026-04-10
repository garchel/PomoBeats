# Radio Curation Fallback

## Goal

Let users choose pre-configured radio categories for study music and break music, with
automatic fallback so the app can recover when one stream fails.

## Problem Summary

The app already supports synthetic tracks and custom audio files, but it does not yet
offer a simple "just play something fitting this moment" experience. Users should be
able to pick broad genres such as lo-fi, pop, anime, k-pop, or rock without manually
searching for streams.

Relying on one hardcoded radio URL per category would be fragile. The feature needs a
curated experience with fallback behavior so temporary station failures do not make the
music feature feel broken.

## Scope

In scope:

- Add a radio mode for study music and break music.
- Offer curated radio categories in settings.
- Use Radio Browser as the station source for those categories.
- Apply fallback selection when a station fails or is unavailable.
- Keep existing synthetic track and custom-file modes working.

Out of scope:

- Spotify or third-party music account linking.
- Persisting a history of previously successful stations.
- Advanced radio browsing/search screens.
- Manual station favoriting or station voting.

## Requirements

### FR-1 Audio source modes

Study music and break music must support three source modes:

- generated track
- curated radio
- custom file

Done when:

- settings state stores the selected source mode for study and break music
- the UI renders the controls relevant to the selected mode only
- the existing generated/custom-file flows still work

### FR-2 Curated categories

Users must be able to choose a curated radio category for study music and break music.

Initial categories:

- Lo-fi
- Pop
- Anime
- K-pop
- Rock

Done when:

- the settings UI exposes these categories for study and break radio mode
- the app can translate a category into one or more Radio Browser search tags

### FR-3 Radio fallback playback

When radio mode is active, the app must try to resolve a playable stream and fall back
to another candidate if the first one fails.

Done when:

- the app requests candidate stations from Radio Browser
- candidates prioritize healthy stations and usable resolved URLs
- playback attempts move through multiple candidates before failing
- a failed radio lookup or playback does not crash the player

### FR-4 Playback behavior integration

Radio playback must follow the current active interval and existing music toggles.

Done when:

- study radio is used only for `pomo` intervals
- break radio is used only for `break` intervals
- pausing or changing interval stops the current stream
- volume sliders still control playback volume

### FR-5 Resilient UX

The feature must give the user a predictable configuration experience even when external
radio data is unstable.

Done when:

- the app falls back gracefully when no station is found
- controls remain usable even if the radio request fails
- settings labels clearly distinguish generated tracks, radio categories, and custom
  files

## Non-Functional Requirements

### NFR-1 Safety

The implementation should use the resolved stream URL when available and avoid assuming
every Radio Browser result is playable.

### NFR-2 Maintainability

Radio categories, search tags, and station filtering should live in dedicated helpers
instead of being embedded in UI components.

### NFR-3 Verification

The implementation must include automated coverage for:

- settings persistence of the new source/category fields
- audio-controller selection of generated track vs radio vs custom file

## Confirmed Decisions

- This feature will use Radio Browser as the discovery source for curated radio mode.
- The first implementation will focus on pre-configured categories, not free-form radio
  search.
- The app should keep existing generated tracks and custom files available as fallback
  user choices.
- Radio support is in scope for both study music and interval music.

## Sources

- Radio Browser API docs note that the service is free but without uptime guarantees and
  expose `lastcheckok`, `url_resolved`, and server mirrors as important client signals:
  [docs.radio-browser.info](https://docs.radio-browser.info/)
