# Slide to Confirm

This is a custom card for [Home Assistant](https://www.home-assistant.io) designed to prevent accidental button presses by requiring the user perform a successful sliding action from left to right to trigger a service.

Use case: You have a button that can remotely unlock your front door, but you most likely don't have an automated method to close the door if it was opened accidentally.  Slide to Confirm requires that you slide the indicator across the card to perform an action.

This is quite rudimentary and was created for my own needs, but I'm happy to share it with the community and incorporate any improvements you want to add through pull requests.

## Screenshot
![Screenshot](https://github.com/itsbrianburton/slide-confirm/raw/main/img/screenshot.png)

## Screencast
https://github.com/itsbrianburton/slide-confirm/assets/29252421/086edb77-23ae-4556-b6ee-6a4669253dd2

## Usage
After installation, edit your dashboard and click the "Add Card" button.  Choose the "Manual" box at the very bottom.  The card must be configured manually as shown here:

```yaml
# REQUIRED: Specify the card
type: custom:slide-confirm-card
# REQUIRED: A list of sliders to display
sliders:
    # Text that appears above the slider
  - name: Front Door
    # An icon to appear in front of the name
    icon: mdi:door
    # Default text that appears in the slider
    textUnconfirmed: Slide to Unlock
    # Text that appears when an action is confirmed
    textConfirmed: Door Unlocked!
    # Default icon that appears in the slider knob
    iconUnconfirmed: mdi:lock
    # Icon that appears in the slider knob when an action is confirmed
    iconConfirmed: mdi:lock-open
    confirm_action:
      # Note that only service calls are currently supported!
      action: call-service
      # Example service to call
      service: input_boolean.turn_on
      target:
        # Target entity
        entity_id: input_boolean.slide_confirm
  - name: Back Door
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
