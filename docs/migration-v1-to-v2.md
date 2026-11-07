# Migrating from v1 to v2

**You do not have to change anything.** v2 reads v1 configs and maps them in memory. The
browser console shows one note per card listing the deprecated option names, and the visual
editor offers an **Upgrade** button that rewrites them in place. Legacy support will be removed
in v3.

## Option names

Every option is now `snake_case`, matching the rest of Home Assistant.

| v1                | v2                 |
| ----------------- | ------------------ |
| `textUnconfirmed` | `text_unconfirmed` |
| `textConfirmed`   | `text_confirmed`   |
| `iconUnconfirmed` | `icon_unconfirmed` |
| `iconConfirmed`   | `icon_confirmed`   |

`name`, `icon`, `label`, `entity`, `header`, `sliders` and `confirm_action` are unchanged.

## `confirm_action`

v1 had its own action shape. v2 uses Home Assistant's action object, the one `tap_action`
uses everywhere else.

```yaml
# v1
confirm_action:
  action: call-service
  service: lock.unlock
  target:
    entity_id: lock.front_door

# v2
confirm_action:
  action: perform-action
  perform_action: lock.unlock
  target:
    entity_id: lock.front_door
```

Both are accepted. So is the shape you get from Developer Tools (`action: lock.unlock` with
`target:` and `data:`), and HA's old `service_data:` alias for `data:`. Beyond service calls,
`toggle`, `more-info`, `navigate`, `url`, `assist`, `fire-dom-event` and `none` now work too.
`target` may also name `floor_id` and `label_id`.

Actions are executed by Home Assistant itself rather than by the card, so HA's target
handling, error toasts and `confirmation:` dialogs apply.

## Required options

In v1 the four text and icon options were documented as required. In v2 only `confirm_action`
is required; everything else has a default:

| Option             | Default                                            |
| ------------------ | -------------------------------------------------- |
| `text_unconfirmed` | `Slide to confirm`                                 |
| `text_confirmed`   | `Confirmed`                                        |
| `icon_unconfirmed` | `mdi:chevron-right` (`mdi:chevron-left` for `rtl`) |
| `icon_confirmed`   | `mdi:check`                                        |

## Styling

v1 colors came from `--switch-unchecked-button-color`, `--switch-checked-button-color`,
`--switch-checked-track-color` and `--text-color`. Home Assistant 2026 removed the first three,
which made the handle transparent, and the last was never an HA variable.

v2 reads `--slide-confirm-*` custom properties, each falling back through the current HA theme
tokens. If you set the old variables in a theme or with card_mod, they are still honoured first
for the handle and confirmed colors, but you should move to either the `style:` block or the
new properties:

```yaml
# v1, card_mod
card_mod:
  style: |
    :host {
      --switch-checked-track-color: rgba(31, 219, 72, 0.9);
      --switch-checked-button-color: rgba(31, 219, 72, 0.9);
    }

# v2, no card_mod needed
style:
  confirmed_color: rgba(31, 219, 72, 0.9)
```

card_mod selectors that reached into the shadow DOM by class name (`.slide-confirm-track`,
`.slide-confirm-handle`, …) no longer match. Use the CSS parts instead:

```yaml
card_mod:
  style:
    slide-confirm-slider$: |
      [part="track"] { ... }
      [part="handle"] { ... }
```

Available parts: `slider`, `header`, `icon`, `name`, `label`, `track`, `fill`, `text`,
`handle`.

## Behaviour differences

- **Confirmation threshold.** v1 required the handle to land on exactly the last pixel. v2
  confirms when it is released within 2 px of the end.
- **Fill while dragging.** A colored fill now follows the handle so progress is visible.
- **Interrupted drags** (`pointercancel`, lost capture) spring the handle back instead of
  leaving it stuck.
- **Touch devices** fire the drag handlers once. v1 bound both touch and pointer events.
- **Multiple sliders** render as siblings. v1's self-closing `<slide-confirm />` tags made each
  slider nest inside the previous one, which is why extra sliders sometimes misbehaved with
  card_mod.
- **Keyboard and screen readers** are supported: the handle is a focusable `role="slider"`.
- **`header`** omitted or empty renders no header, as before.

## New options

`direction`, `reset_delay`, `haptic`, `entity` defaults, `disabled_states` and `style`. See the
[README](../README.md#configuration).

## For developers

- The custom element for one slider is now `<slide-confirm-slider>` (was `<slide-confirm>`).
- It fires `slide-confirmed` (was `call-action`) with `{ action, config }`; the card turns that
  into HA's `hass-action` event.
- `custom-card-helpers` is no longer a dependency.
