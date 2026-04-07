# Design Notes

## Strategy

Add radio playback as a new source mode inside the existing audio settings model. This
keeps the feature aligned with the current player architecture instead of bolting on a
separate radio subsystem.

## State Model

Each music block gets two new settings concepts:

- source mode
  - `generated`
  - `radio`
  - `custom`
- radio category

Recommended shape:

- `studyMusicSource`
- `studyRadioCategory`
- `intervalMusicSource`
- `intervalRadioCategory`

Alarm remains separate and does not use radio mode.

## Radio Catalog

Create a dedicated helper module that owns:

- available radio categories
- user-facing labels
- mapping from category to Radio Browser tags
- station filtering utilities

Example mapping:

- `lofi` -> `["lofi", "lo-fi", "chillout"]`
- `pop` -> `["pop", "hits"]`
- `anime` -> `["anime", "japan", "j-pop"]`
- `kpop` -> `["kpop", "k-pop", "korean"]`
- `rock` -> `["rock", "alternative"]`

This mapping should be easy to tweak without touching the UI.

## Radio Browser Integration

Use Radio Browser only from a small helper layer.

Flow:

1. Pick a server host.
2. Search stations for the configured category tags.
3. Normalize results.
4. Filter for likely playable stations:
   - `lastcheckok === 1`
   - `url_resolved` present
   - positive bitrate preferred
5. Sort by health and station quality heuristics.
6. Return a short candidate list.

The API docs recommend using `url_resolved` and expose mirror information through
`/json/servers`. For the first pass, we can keep a default host list and degrade
gracefully if the request fails.

## Playback Fallback

The existing audio controller already knows how to play:

- synthetic/generated tones
- custom files via `HTMLAudioElement`

Extend it so radio mode also uses `HTMLAudioElement`.

Fallback algorithm:

1. request candidate stations for the selected category
2. try first candidate URL
3. if playback fails or errors, try the next candidate
4. stop after a small limit such as 3 attempts
5. if all fail, stop cleanly and keep the app usable

The audio controller remains the single owner of interval audio playback.

## UX Changes

In settings, for each of:

- `Musica de estudo`
- `Musica de intervalo`

show:

1. enable switch
2. source selector
3. conditional controls:
   - generated -> generated track selector
   - radio -> category selector
   - custom -> file picker
4. volume slider

This keeps the UI compact and avoids showing irrelevant controls at the same time.

## Testing

Add unit coverage for:

- settings persistence of source/category fields
- audio controller choosing radio candidates
- fallback to the next station when one candidate fails
