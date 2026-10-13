# Slide to Confirm

This is a custom card for [Home Assistant](https://www.home-assistant.io) designed to prevent accidental button presses by requiring the user perform a successful sliding action from left to right to trigger a service.

Use case: You have a button that can remotely unlock your front door, but you most likely don't have an automated method to close the door if it was opened accidentally.  Slide to Confirm requires that you slide the indicator across the card to perform an action.

This is quite rudimentary and was created for my own needs, but I'm happy to share it with the community and incorporate any improvements you want to add through pull requests.

## Screenshot
![Screenshot](https://github.com/itsbrianburton/slide-confirm/raw/main/img/screenshot.png)

## Screencast
https://github.com/itsbrianburton/slide-confirm/assets/29252421/086edb77-23ae-4556-b6ee-6a4669253dd2

## Configuration

Each slider supports the following options:

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `name` | string | Yes | Text displayed above the slider |
| `icon` | string | No | MDI icon shown in front of the name (e.g. `mdi:door`) |
| `textUnconfirmed` | string | Yes | Default text displayed inside the slider |
| `textConfirmed` | string | Yes | Text displayed after a successful slide |
| `iconUnconfirmed` | string | Yes | Icon displayed on the slider knob |
| `iconConfirmed` | string | Yes | Icon displayed on the knob after a successful slide |
| `confirm_action` | object | Yes | The action to perform on confirmation (see below) |
| `haptic` | boolean | No | Vibrate the device on a successful slide (default `false`). Uses Home Assistant's haptic feedback: the companion app vibrates the device, browsers do so when "Vibrate" is enabled in the user profile |

### `confirm_action`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `action` | string | Yes | Must be `call-service` |
| `service` | string | Yes | The service to call (e.g. `input_boolean.turn_on`) |
| `target` | object | No | Target for the service call |
| `target.entity_id` | string or list | No | Target entity or entities |
| `target.device_id` | string or list | No | Target device or devices |
| `target.area_id` | string or list | No | Target area or areas |
| `data` | object | No | Additional data to pass to the service call |

> **Note:** Only service calls are currently supported. At least one of `target` or `data` should be provided depending on the service being called.

## Usage

After installation, edit your dashboard and click the "Add Card" button. Choose the "Manual" box at the very bottom. The card must be configured manually as shown here:

### Basic example — target an entity

```yaml
type: custom:slide-confirm-card
sliders:
  - name: Front Door
    icon: mdi:door
    textUnconfirmed: Slide to Unlock
    textConfirmed: Door Unlocked!
    iconUnconfirmed: mdi:lock
    iconConfirmed: mdi:lock-open
    confirm_action:
      action: call-service
      service: input_boolean.turn_on
      target:
        entity_id: input_boolean.slide_confirm
```

### Passing service data

Use the `data` key to send additional parameters to services that require them:

```yaml
  - name: Front door fingerprint reader
    icon: mdi:fingerprint
    textUnconfirmed: Slide to start enrolling
    textConfirmed: Enroll started!
    iconUnconfirmed: mdi:lock
    iconConfirmed: mdi:lock-open
    confirm_action:
      action: call-service
      service: esphome.fingerprint_enroll
      data:
        finger_id: 1
        num_scans: 5
```

### Targeting a device

```yaml
  - name: Back Door
    textUnconfirmed: Slide to Unlock
    textConfirmed: Door Unlocked!
    iconUnconfirmed: mdi:lock
    iconConfirmed: mdi:lock-open
    confirm_action:
      action: call-service
      service: input_boolean.turn_on
      target:
        device_id: device123
```

### Targeting an area

```yaml
  - name: Garage Doors
    textUnconfirmed: Slide to Unlock
    textConfirmed: Doors Unlocked!
    iconUnconfirmed: mdi:lock
    iconConfirmed: mdi:lock-open
    confirm_action:
      action: call-service
      service: input_boolean.turn_on
      target:
        area_id: garage
```