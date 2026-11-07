# Slide to Confirm v2 — Plan

Status: **in progress** on branch `v2`. M0–M6 are done; M7 (release) is next. v1 remains on `main`.

## 1. Goals

1. Support every existing v1 feature (see §3).
2. Add a visual editor.
3. Support both left-to-right and right-to-left dragging.
4. Custom styling without card_mod.
5. A testing suite with CI.
6. Standardize the YAML config on snake_case (v1 mixes `textUnconfirmed` with `confirm_action`).

Non-goals (decided in issues #12 and #10): the slider does not become a two-way toggle,
and it does not get a half-width "short travel" mode. The whole point of the component is
that confirming requires a deliberate full-width gesture.

## 2. Problems in v1 the rewrite fixes

Found while reading `src/`:

- `slide-confirm.ts` imports `html` from `lit/development`, so the dev build of Lit is bundled.
- `card.ts` passes the slider config as an _attribute_ (`config="${slider}"`) rather than a
  property (`.config=${slider}`). PR #16 fixed this independently.
- Both `touchstart`/`touchend` and `pointerdown`/`pointerup` are bound, so touch devices fire
  the handlers twice. Pointer events alone are enough.
- `pointercancel` and `lostpointercapture` are not handled, so an interrupted touch
  (notification shade, screen rotation) can leave the handle stuck in "dragging".
- Confirmation uses exact equality (`x + handleWidth === containerWidth`). Fractional layout
  widths make this flaky; v2 uses a threshold.
- `getConfigElement()` returns `slide-confirm-editor`, which is never defined, and
  `getStubConfig()` returns keys the card does not use (`entity`, `header`).
- `hass` is stored but never passed to the sliders, so nothing can react to entity state.
- The `label` and `entity` keys exist in the code but are undocumented.
- Theme variables `--switch-*-button-color` / `--switch-checked-track-color` were removed in
  HA 2026.x, so the handle renders transparent (PR #17). `--text-color` is not an HA variable
  at all; `--primary-text-color` is.
- No keyboard access and no ARIA, so the control is invisible to assistive tech.

## 3. Feature parity checklist (v1 → v2)

| v1 feature                                                           | v2                                                                                                                  |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Multiple sliders per card                                            | Kept (`sliders:` list)                                                                                              |
| Card `header`                                                        | Kept                                                                                                                |
| Per-slider `name`, `icon`, `label`                                   | Kept; `label` documented                                                                                            |
| `textUnconfirmed` / `textConfirmed`                                  | `text_unconfirmed` / `text_confirmed` (legacy keys still read)                                                      |
| `iconUnconfirmed` / `iconConfirmed`                                  | `icon_unconfirmed` / `icon_confirmed` (legacy keys still read)                                                      |
| `confirm_action` with `call-service` + `service` + `target` + `data` | `confirm_action` becomes a standard HA action config (`perform-action` + `perform_action`); legacy shape still read |
| `target.entity_id` / `device_id` / `area_id`                         | Kept, plus `floor_id` and `label_id`                                                                                |
| 1.5 s "confirmed" state then reset                                   | Kept, now configurable via `reset_delay`                                                                            |
| Handle springs back on release                                       | Kept                                                                                                                |
| Theme-aware colors                                                   | Kept, with the fallbacks from PR #17                                                                                |

## 4. Config schema

### 4.1 Rule

Every key is `snake_case`. Values that are HA concepts (icons, entity ids, actions) use HA's
own formats so HA's selectors and docs apply unchanged.

### 4.2 v2 example

```yaml
type: custom:slide-confirm-card
header: Doors # optional
direction: ltr # optional card default: ltr | rtl
style: # optional card defaults, see §6
  handle_size: 44px
sliders:
  - name: Front Door
    icon: mdi:door
    label: Unlocks and opens the door # optional secondary text
    text_unconfirmed: Slide to Unlock
    text_confirmed: Door Unlocked!
    icon_unconfirmed: mdi:lock
    icon_confirmed: mdi:lock-open
    direction: rtl # optional, overrides card default
    reset_delay: 1500 # ms, optional, default 1500
    haptic: true # optional, default false (PR #19)
    confirm_action: # standard HA action config
      action: perform-action
      perform_action: lock.unlock
      target:
        entity_id: lock.front_door
      data: {}
    style: # optional per-slider overrides, see §6
      confirmed_color: var(--error-color)
```

### 4.3 Per-slider keys

| Key                | Type             | Required | Default                                          | Notes                                                                              |
| ------------------ | ---------------- | -------- | ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `name`             | string           | no       | entity friendly name if `entity` set             | Shown above the slider                                                             |
| `icon`             | string           | no       | entity icon if `entity` set                      | Shown before the name                                                              |
| `label`            | string           | no       | —                                                | Secondary text next to the name                                                    |
| `entity`           | string           | no       | —                                                | Source for default name/icon and for `disabled_states` (issues #4, #12)            |
| `text_unconfirmed` | string           | no       | `Slide to confirm`                               |                                                                                    |
| `text_confirmed`   | string           | no       | `Confirmed`                                      |                                                                                    |
| `icon_unconfirmed` | string           | no       | `mdi:chevron-right` (`mdi:chevron-left` for rtl) |                                                                                    |
| `icon_confirmed`   | string           | no       | `mdi:check`                                      |                                                                                    |
| `direction`        | `ltr` \| `rtl`   | no       | card `direction`, else `ltr`                     |                                                                                    |
| `reset_delay`      | integer ms       | no       | `1500`                                           | `0` keeps the confirmed state until the entity changes (issue #13); needs `entity` |
| `haptic`           | boolean          | no       | `false`                                          | Fires HA's `haptic` event (PR #19)                                                 |
| `disabled_states`  | list of strings  | no       | —                                                | Slider is disabled while `entity` is in one of these states (issue #12)            |
| `confirm_action`   | HA action config | yes      | —                                                | See §4.4                                                                           |
| `style`            | object           | no       | —                                                | See §6                                                                             |

### 4.4 `confirm_action`

v2 accepts the same action object HA uses for `tap_action` everywhere else, so the HA
`ui_action` selector can edit it and users can copy examples from HA docs:

```yaml
confirm_action:
  action: perform-action
  perform_action: cover.set_cover_position
  target:
    entity_id: cover.garage
  data:
    position: 10
```

Supported actions: `perform-action`, `toggle`, `more-info`, `navigate`, `url`,
`fire-dom-event`, `assist`, `none`. The card fires HA's `hass-action` event and lets the
frontend execute it, which is how Mushroom and other modern cards work. This replaces the
hand-rolled `callService` in v1 and removes the need to flatten `target` into service data.
(Verified in M4 against the frontend source: `src/state/action-mixin.ts` listens for
`hass-action` on the app root and runs `handleAction(node, hass, detail.config, detail.action)`;
the built-in button card fires `{ config: { entity, tap_action, ... }, action: "tap" }`. The card
fires exactly that shape, so no `callService` fallback is needed.)

The Developer Tools shape people paste by mistake (`action: switch.toggle` with `target`
and `data`, issue #6) is also accepted and read as `perform-action`, with a note in the
console. HA's legacy `service_data` alias is mapped to `data`.

Only `confirm_action` is required per slider (M1 decision): the texts and icons have sensible
defaults so a minimal slider is two lines, and the editor fills them in anyway.

Legacy v1 shape (`action: call-service`, `service: x.y`) is normalized to the above at
`setConfig` time with a one-time `console.warn`.

### 4.5 Migration

`normalizeConfig()` maps every v1 key to v2 in memory, so existing dashboards keep working
unchanged. The visual editor offers an "Upgrade to v2 format" button that writes the
normalized config back. The README gets a migration table. Legacy support is removed in v3.

## 5. Behaviour

### 5.1 Drag

- Pointer events only (`pointerdown` on the handle, `pointermove`/`pointerup`/`pointercancel`
  on the handle via pointer capture, `lostpointercapture` as a safety net). `touch-action: none`
  on the handle.
- Position is computed in a pure function `computeHandleOffset(pointerX, trackRect, handleWidth, direction)`
  so it can be unit tested without a DOM.
- Confirm when the handle is within `confirm_threshold` (default 2 px) of the far end at
  release. Releasing earlier springs back with a CSS transition.
- A fill grows from the start edge to the handle while dragging (PR #18). It uses the
  confirmed color.
- While confirmed, the handle sits at the far end and the slider ignores input until
  `reset_delay` elapses (or, with `reset_delay: 0`, until the entity state changes).

### 5.2 Direction

`direction: rtl` puts the handle on the right and requires a right-to-left drag. Internally
everything is expressed as _progress 0..1 from the start edge_, and only the CSS placement
(`inset-inline-start` vs `inset-inline-end`, mirrored fill) depends on direction. This keeps
one code path for both.

Open question: should `direction: auto` follow the document `dir` so RTL-language users get
a mirrored slider by default? Cheap to add; proposed as a follow-up, not v2.0.

### 5.2.1 Implementation notes (M3)

- The element is `<slide-confirm-slider>` in `src/slider.ts`; it fires a bubbling, composed
  `slide-confirmed` event with `{ action, config }`. The card (M4) turns that into HA's
  `hass-action`.
- The handle and fill are anchored at the start edge in CSS (`left: 0`, or `right: 0` for
  rtl). The component only sets two inline custom properties, `--_x` and `--_fill`, while
  the handle is away from rest, so rendering at rest never reads layout.
- `setPointerCapture` is wrapped in try/catch: synthetic pointer events (tests) have no active
  pointer, and a failure there must not break dragging.
- Entity name/icon fallback renders `<ha-state-icon>` when no `icon` is configured, so
  domain default icons work without reimplementing HA's icon logic.

### 5.3 Accessibility

- Handle gets `role="slider"`, `aria-valuemin/max/now`, `aria-label` from `text_unconfirmed`.
- Keyboard: arrow keys move the handle in 10% steps; reaching 100% confirms. This keeps the
  "requires intent" property (ten presses) while making the control operable.
- `prefers-reduced-motion` disables the spring-back transition.

### 5.4 Entity awareness (optional, needs `entity`)

- Default `name`/`icon` from the entity (issue #4). Lets the card work with auto-entities
  style generated configs.
- `disabled_states`: when the entity is in a listed state, the slider is greyed out and
  does not respond. Covers the "don't offer unlock when already unlocked" half of issue #12
  without turning the control into a toggle.
- `reset_delay: 0`: stay confirmed until the entity's state changes (issue #13, slow locks).
  Safety cap (M3 decision): if the entity never changes, for example because the action
  failed, the slider resets after 30 s anyway rather than claiming success forever.

## 6. Styling

Three layers, lowest to highest precedence:

1. **Theme variables.** The card maps HA tokens onto its own custom properties with the
   fallback chain from PR #17, so it looks right on HA 2026 themes.
2. **`style:` config block** (card level and per slider). Each key maps 1:1 to a custom
   property, so YAML users never write CSS:

   | Key                    | CSS property                           | Default                              |
   | ---------------------- | -------------------------------------- | ------------------------------------ |
   | `track_color`          | `--slide-confirm-track-color`          | `var(--slider-track-color)` at 38%   |
   | `handle_color`         | `--slide-confirm-handle-color`         | `var(--card-background-color, #fff)` |
   | `handle_border_color`  | `--slide-confirm-handle-border-color`  | `var(--divider-color)`               |
   | `confirmed_color`      | `--slide-confirm-confirmed-color`      | `var(--primary-color)`               |
   | `confirmed_text_color` | `--slide-confirm-confirmed-text-color` | `var(--text-primary-color, #fff)`    |
   | `text_color`           | `--slide-confirm-text-color`           | `var(--primary-text-color)`          |
   | `handle_size`          | `--slide-confirm-handle-size`          | `50px`                               |
   | `track_height`         | `--slide-confirm-track-height`         | same as handle size                  |
   | `border_radius`        | `--slide-confirm-border-radius`        | half the handle size                 |
   | `font_size`            | `--slide-confirm-font-size`            | `1rem`                               |
   | `fill_opacity`         | `--slide-confirm-fill-opacity`         | `0.54`                               |

   Values are passed through, so `confirmed_color: "#f00"` and
   `confirmed_color: var(--error-color)` both work.

3. **CSS shadow parts** for card_mod power users: `part="track"`, `part="fill"`,
   `part="handle"`, `part="text"`, `part="name"`. The README documents them so issue #5 style
   questions have a canonical answer.

Compactness (issue #10) is covered by `handle_size`; the travel distance stays full width.

## 7. Visual editor

- Element `slide-confirm-card-editor`, registered in `index.ts`, returned by
  `getConfigElement()`.
- Built on `ha-form` with HA selectors, loaded on demand with the usual trick
  (`customElements.get("hui-button-card")?.getConfigElement()`), the same approach PR #16 took.
- Card section: `header` (text), `direction` (select), `style` (expansion panel).
- One `ha-expansion-panel` per slider with:
  - `name`, `label` (text), `icon`, `icon_unconfirmed`, `icon_confirmed` (icon selector)
  - `text_unconfirmed`, `text_confirmed` (text)
  - `entity` (entity selector), `disabled_states` (text list)
  - `direction` (select), `reset_delay` (number), `haptic` (boolean)
  - `confirm_action` via `selector: { ui_action: {} }`, which gives the full HA action UI
    including target and data pickers
  - `style` (expansion panel, same keys as the card)
  - Up / down / delete buttons
- "Add slider" button appends a sensible default.
- "Upgrade to v2 format" banner shown when `normalizeConfig()` reports legacy keys.
- `getStubConfig()` returns one working example slider targeting `input_boolean.slide_confirm`.
- `getCardSize()` and `getGridOptions()` are implemented so the card sizes correctly in
  sections dashboards (issue #3). M4 decision: `columns: "full"` with `min_columns: 6`, so the
  card is full width by default but a user may shrink it to half a section in their own
  layout, accepting the shorter travel (the point raised in issue #10).

### 7.1 Implementation notes (M5)

- The editor edits the user's _raw_ config. Each slider form is fed `migrateSlider(raw)` so
  the fields show v2 names, but nothing is written back until the user changes something.
  A slider the user edits is committed in v2 spelling; untouched sliders keep theirs.
- "Upgrade" writes `migrateConfig(raw)`: renames only, no defaults, key order preserved, so a
  v2 config round-trips byte-for-byte. `normalizeConfig()` stays the strict runtime path.
- Every commit passes through `clean()`, which drops `undefined`, `null`, `""`, empty arrays
  and empty objects (except `sliders`), so clearing a field removes the key from the YAML.
- A new slider gets `confirm_action: { action: perform-action }` with no service on purpose:
  the live preview then shows exactly which field to fill in, instead of silently doing nothing.
- Reordering uses up/down buttons in the panel header rather than drag-and-drop; `ha-sortable`
  is a candidate for later.
- Labels and helper texts are English only. Localization is not planned for 2.0.

## 8. Architecture

```
src/
  index.ts                 register elements, customCards entry, version banner
  card.ts                  <slide-confirm-card>: header, sliders, hass plumbing, hass-action
  slider.ts                <slide-confirm-slider>: one slider (render + pointer/keyboard)
  editor.ts                <slide-confirm-card-editor>
  config/
    schema.ts              v2 TypeScript types
    normalize.ts           v1 -> v2 mapping, defaults, validation, legacy warnings
  logic/
    geometry.ts            computeHandleOffset, progress, isConfirmed  (pure, DOM-free)
    style-vars.ts          style block -> CSS custom property map      (pure)
  styles/
    slider.css.ts          Lit css tagged template, uses the custom properties in section 6
    editor.css.ts
  types/
    home-assistant.ts      minimal HomeAssistant / LovelaceCardConfig / ActionConfig types
test/
  unit/                    Vitest, node: normalize, geometry, style-vars
  component/               Vitest browser mode (Playwright Chromium): slider drag, rtl,
                           confirm/reset, haptic event, editor emits config-changed
  fixtures/                v1 and v2 configs as JSON
demo/
  index.html               standalone page with stubbed ha-card / ha-icon for manual testing
```

Dependencies: `lit` ^3, `home-assistant-js-websocket` (types only). Drop
`custom-card-helpers` (unmaintained since 2021, predates `perform-action`); the handful of
types and `fireEvent` it provided live in `src/types/`.

## 9. Tooling

| Area        | v1                     | v2                                                                                                                                                                                                                   |
| ----------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bundler     | Parcel 2               | Vite (lib mode, single ES bundle `dist/slide-confirm.js`)                                                                                                                                                            |
| Tests       | none                   | Vitest; browser mode via Playwright for components                                                                                                                                                                   |
| Lint/format | none                   | ESLint (typescript-eslint, lit plugin) + Prettier                                                                                                                                                                    |
| TypeScript  | loose                  | `strict: true`, target ES2020                                                                                                                                                                                        |
| CI          | none                   | GitHub Actions: lint, typecheck, unit + component tests, build, on push and PR                                                                                                                                       |
| Release     | manual `dist/` commits | Tag → Actions builds and attaches `slide-confirm.js` to the GitHub release. HACS reads release assets first, so `dist/` no longer needs to be committed and contributors stop having to say "I did not rebuild dist" |

### 9.1 Version choices (M0)

The development machine runs Node 20.18, below the floor for Vite 7+, Vitest 5 and
ESLint 10, so M0 pinned the newest majors that still support Node 20: Vite 6, Vitest 4 with
`@vitest/browser-playwright`, ESLint 9, TypeScript 5.9. CI runs on Node 22 with the same
versions. `package-lock.json` is now committed so `npm ci` is reproducible. `dist/` is still
tracked for now; dropping it is an M7 decision (see §12).

## 10. Documentation

- README rewrite: install, v2 config reference, styling guide (style block, parts, card_mod),
  migration table, examples for lock / cover / script / scene.
- `CHANGELOG.md` starting at 2.0.0.
- `docs/migration-v1-to-v2.md`.

### 10.1 Implementation notes (M6)

- README rewritten for v2; `docs/migration-v1-to-v2.md` and `CHANGELOG.md` added.
- `demo/index.html` (`npm run demo`) stubs `ha-card`, `ha-icon` (SVG paths from `@mdi/js`, so it
  works offline) and `ha-state-icon`, provides a fake `hass` with three entities, and acts on
  `hass-action` the way HA's action-mixin would for the demo's services, so `disabled_states`
  and `reset_delay: 0` can be exercised. The editor is not in the demo: it needs HA's `ha-form`.
- Checked in a real browser during M6: ltr and rtl drags, confirm and reset, entity-driven
  disabling, dark theme, keyboard steps. Two fixes came out of it: the fill is now zero-width
  at rest (it was handle-sized and showed a faint edge), and the handle focuses itself on
  pointerdown because `preventDefault` there suppresses click-to-focus.

## 11. Work breakdown

Each milestone is a PR into `v2`; `v2` merges to `main` as 2.0.0 when all are done.

| #   | Milestone                                                                                                                        | Depends on    |
| --- | -------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| M0  | Tooling: Vite, Vitest, ESLint, strict TS, CI workflow, remove Parcel                                                             | — (done)      |
| M1  | `config/`: types, `normalizeConfig()` with legacy mapping + tests                                                                | M0 (done)     |
| M2  | `logic/geometry.ts` + `style-vars.ts` with tests                                                                                 | M0 (done)     |
| M3  | `<slide-confirm-slider>`: pointer + keyboard, direction, fill, confirm/reset, haptic, a11y, custom props, parts; component tests | M1, M2 (done) |
| M4  | `<slide-confirm-card>`: header, hass plumbing, `hass-action`, entity defaults, `disabled_states`, grid options; tests            | M3 (done)     |
| M5  | Editor                                                                                                                           | M4 (done)     |
| M6  | Docs, demo page, migration guide, CHANGELOG                                                                                      | M5 (done)     |
| M7  | Release workflow, 2.0.0 tag, HACS validation                                                                                     | M6            |

## 12. Decisions still open (your call)

Checked items are proposed for v2.0; unchecked ones are deferred or declined. Edit freely.

**From open pull requests**

- [x] PR #17 — theme color fallbacks for HA 2026 (bug fix; folded into §6 layer 1)
- [x] PR #18 — fill behind the handle while dragging (§5.1)
- [x] PR #19 — optional `haptic: true` (§4.3)
- [x] PR #16 (closed) — visual editor; v2 editor follows the same `ha-form` approach (§7)

**From issues**

- [x] #4 — default `name`/`icon` from `entity` (§5.4)
- [x] #7 — editable colors and sizes via `style:` (§6)
- [x] #13 — hold the confirmed state (configurable `reset_delay`, `0` = until entity changes) (§5.4)
- [x] #12 (partial) — grey out the slider via `disabled_states`; the two-way toggle part stays declined
- [x] #3 — sections sizing via `getGridOptions()`; font size via `style.font_size`
- [x] #5 — document CSS parts / card_mod hooks
- [ ] #10 — half-width card: still declined; `handle_size` covers the compactness half
- [ ] #8 — auto-entities: out of scope (needs support on their side); entity defaults from #4 help
- [ ] #15 — old Android WebView: closed as environment issue; v2 targets ES2020, same as HA itself

**Design questions**

- [ ] `direction: auto` following the page's text direction (follow-up, not 2.0)
- [ ] Should `confirm_action` be renamed to `tap_action` to match HA exactly? Proposed: keep
      `confirm_action`, since the gesture is not a tap and the name documents intent.
- [ ] Stop committing `dist/` and rely on release assets (§9)? Proposed: yes.
- [ ] Should legacy v1 keys log a warning or stay silent? Proposed: one `console.warn` per card.
