# ITAIKO Web Configurator

Web-based configuration tool for [ITAIKO](https://github.com/LucaSilva-r/ITAIKO-Firmware) drum controllers. Connects to the controller over USB using the WebSerial API. Available at [itaiko.com/configure](https://itaiko.com/configure).

## Features

### Live Configuration

All controller settings can be adjusted in real time through the browser. Changes are automatically saved to the controller's flash memory.

#### Pad Thresholds

Per-pad sensitivity settings for Don Left, Don Right, Ka Left, and Ka Right:

- **Light trigger** -- minimum ADC value for a hit to register
- **Heavy trigger** -- threshold for automatic double-side activation (large notes)
- **Cutoff** -- upper limit, hits above this are clamped

#### Timing

- **Key hold time** -- how long a key press is held active after a hit
- **Don debounce** -- lockout between left and right Don hits
- **Ka debounce** -- lockout between left and right Ka hits
- **Crosstalk debounce** -- lockout between Don and Ka pads
- **Per-pad debounce** -- individual debounce timers per pad

#### Key Mapping

- **Keyboard bindings** -- configurable key assignments for Player 1 and Player 2 keyboard modes
- **Controller mapping** -- per-button assignment for gamepad emulation modes, with an interactive visual controller layout

#### ADC Channel Mapping

Reassign which hardware ADC channels correspond to which drum pads, for controllers with non-standard wiring.

### Live Monitor

Real-time visualization of sensor data streamed from the controller:

- **ADC graphs** -- WebGL-accelerated waveform display for all four pads, with threshold reference lines and interactive zoom/pan
- **Drum display** -- SVG drum graphic that lights up pads as they are hit
- **Input history** -- grid of the last 20 hits per pad for reviewing timing and consistency

### Firmware Updates

The configurator detects when a newer firmware version is available and walks through the update process:

1. Downloads the firmware binary
2. Reboots the controller into bootloader mode
3. Prompts you to save the file to the RPI-RP2 drive

Configuration is optionally backed up before flashing.

### PS4 Authentication

Upload PS4 authentication credentials (private key, serial number, and signature) required for the PS4 Tatacon emulation mode. 

### Backup & Restore

Export the entire controller configuration to a JSON file, or import a previously saved configuration. Useful for sharing setups or restoring after a firmware update.

### Recovery Mode

If the controller becomes unresponsive, the configurator includes a guided recovery flow that nukes flash and reflashes the firmware from scratch.

## Browser Support

Requires the [WebSerial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API). Supported in Chrome, Edge, and Opera. Firefox requires a WebSerial extension.

Firmware updates use the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system) for saving the binary directly; browsers without it fall back to a manual download.

## Development

### Prerequisites

- Node.js 18+
- pnpm

### Setup

```sh
pnpm install
pnpm dev
```

### Build

```sh
pnpm build
```
