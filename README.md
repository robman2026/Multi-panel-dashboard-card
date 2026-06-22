# Multi-Panel Dashboard Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
![version](https://img.shields.io/badge/version-1.0.0-blue)
![HA](https://img.shields.io/badge/Home%20Assistant-2024.1%2B-brightgreen)

A Samsung Premium-style custom Lovelace card for Home Assistant.

![Preview](preview.png)

---

## Features

| Section | Details |
|---|---|
| 📷 Cameras | Live feed thumbnails, configurable columns, tap to open fullscreen |
| 🔘 Switches | Colour-coded tiles, state-aware accent colours, toggle on tap |
| 📡 Sensors | Doors, motion, lights, person, vibration, tilt — colour-coded per category & state |
| 🌡️ Climate | Clear tiles with a large temperature value + humidity, colour by threshold |
| 🧂 Salt Level | Big percentage readout, warning threshold, colour per level |

- **"Spectrum" tile design** (v4) — every entity is a clear, colour-coded tile with a large icon, a readable name, a bold state, and (climate/power/salt) a big value
- Fully configurable in the **visual editor** (no YAML needed)
- All entity IDs, labels, icons, columns, and color thresholds are editable
- Samsung Premium dark glassmorphism style — matches the Samsung Laundry Card
- **Responsive:** the column count you set (1–4) acts as a *maximum* — tiles auto-reduce to fewer columns when a section is squeezed, and the whole card stacks to a single column on narrow screens

---

## Installation

### Via HACS (recommended)

1. Go to **HACS → Frontend → Custom repositories**
2. Add `https://github.com/robman2026/multi-panel-dashboard-card` as **Lovelace**
3. Install **Multi-Panel Dashboard Card**
4. Reload your browser

### Manual

1. Download `multi-panel-dashboard-card.js`
2. Copy to `config/www/multi-panel-dashboard-card/`
3. In HA go to **Settings → Dashboards → Resources** and add:
   ```
   /local/multi-panel-dashboard-card/multi-panel-dashboard-card.js
   ```
4. Reload your browser

---

## Configuration

All configuration is available in the visual editor. Add the card to any dashboard, click **Edit**, and configure each section.

### Full YAML example

```yaml
type: custom:multi-panel-dashboard-card

# ── Section labels (optional, defaults shown) ──
label_surveillance: Surveillance
label_switches: Switches
label_sensors: Sensors
label_climate: Temp & Humidity
label_salt: Salt Level

# ── Cameras ──
cameras_columns: 3
cameras:
  - entity: camera.garage
    label: Garage
    icon: camera
  - entity: camera.laundry
    label: Laundry
    icon: camera
  - entity: camera.hobbyroom
    label: Hobbyroom
    icon: camera

# ── Switches ──
switches_columns: 2
switches:
  - entity: switch.pihole
    label: Pi-hole
    icon: globe
    category: switch
  - entity: switch.tv_light
    label: TV & Light
    icon: monitor
    category: switch
  - entity: switch.3d_printer
    label: 3D Printer
    icon: printer3d
    category: switch
  - entity: switch.technikraum
    label: Technikraum
    icon: wrench
    category: switch
  - entity: binary_sensor.motion_hobbyroom
    label: Mișcare Hobbyroom
    icon: motion
    category: motion
  - entity: switch.hobbyraum_light
    label: Hobbyraum
    icon: bulb
    category: switch
  - entity: switch.bunker
    label: Bunker
    icon: home
    category: switch
  - entity: switch.scara_beci
    label: Scara Beci
    icon: stairs
    category: switch

# ── Sensors ──
sensors_columns: 4
sensors:
  - entity: binary_sensor.usa_beci
    label: Ușa beci
    icon: door
    category: door
  - entity: binary_sensor.motion_hol_beci
    label: Hol beci
    icon: motion
    category: motion
  - entity: binary_sensor.motion_hobbyraum
    label: Hobbyraum
    icon: motion
    category: motion
  - entity: binary_sensor.banc_lucru
    label: Banc lucru
    icon: sensor
    category: sensor
  - entity: binary_sensor.usa_tehnik
    label: Ușa Tehnik
    icon: door
    category: door
  - entity: binary_sensor.usa_beci_2
    label: Ușa Beci
    icon: door
    category: door
  - entity: light.light_beci
    label: Light Beci
    icon: lightbulb
    category: light
  - entity: light.light_bunker
    label: Light Bunker
    icon: lightbulb
    category: light
  - entity: switch.proxmox
    label: Proxmox
    icon: server
    category: switch
  - entity: binary_sensor.persoana
    label: Persoana
    icon: person
    category: person
  - entity: binary_sensor.vibratie
    label: Vibratie
    icon: vibration
    category: sensor
  - entity: binary_sensor.inclinare
    label: Inclinare
    icon: tilt
    category: sensor

# ── Climate Gauges ──
# temp_thresholds / hum_thresholds: JSON array of {max, color} sorted ascending
# The last entry's color is used for values above all max values
gauges:
  - temp_entity: sensor.temp_hobbyraum
    humidity_entity: sensor.humidity_hobbyraum
    label: Hobbyraum
    gauge_size: 88
    temp_thresholds: '[{"max":10,"color":"#4fa3e0"},{"max":25,"color":"#6ddb99"},{"max":35,"color":"#e0b44f"},{"max":999,"color":"#e05050"}]'
    hum_thresholds: '[{"max":30,"color":"#e0b44f"},{"max":60,"color":"#6ddb99"},{"max":80,"color":"#e0b44f"},{"max":999,"color":"#e05050"}]'

  - temp_entity: sensor.temp_bunker
    humidity_entity: sensor.humidity_bunker
    label: Bunker
    gauge_size: 88
    temp_thresholds: '[{"max":10,"color":"#4fa3e0"},{"max":25,"color":"#6ddb99"},{"max":35,"color":"#e0b44f"},{"max":999,"color":"#e05050"}]'
    hum_thresholds: '[{"max":30,"color":"#e0b44f"},{"max":60,"color":"#6ddb99"},{"max":80,"color":"#e0b44f"},{"max":999,"color":"#e05050"}]'

  - temp_entity: sensor.temp_server
    humidity_entity: sensor.humidity_server
    label: Server
    gauge_size: 88
    temp_thresholds: '[{"max":30,"color":"#6ddb99"},{"max":40,"color":"#e0b44f"},{"max":999,"color":"#e05050"}]'
    hum_thresholds: '[{"max":30,"color":"#6ddb99"},{"max":50,"color":"#e0b44f"},{"max":999,"color":"#e05050"}]'

  - temp_entity: sensor.laundry_power
    humidity_entity: sensor.laundry_current
    label: Laundry
    gauge_size: 88
    temp_thresholds: '[{"max":0,"color":"rgba(255,255,255,0.15)"},{"max":9999,"color":"#4fa3e0"}]'
    hum_thresholds: '[{"max":0,"color":"rgba(255,255,255,0.1)"},{"max":9999,"color":"#6ddb99"}]'

# ── Salt Level ──
salt_entity: sensor.salt_level_distance
salt_max_entity: sensor.salt_level_max       # optional — used to compute % from distance
salt_label: Salt Level
salt_warn_threshold: 30                       # % below which warning is shown
salt_thresholds: '[{"max":30,"color":"#e05050"},{"max":60,"color":"#e0b44f"},{"max":999,"color":"#6ddb99"}]'
```

---

## Icon Reference

The card uses inline SVG icons. Set the `icon` field to any of the following keys:

| Key | Description |
|---|---|
| `camera` | Video camera |
| `globe` | Network / Pi-hole |
| `monitor` | Display / TV |
| `printer3d` | 3D Printer |
| `wrench` | Tools / Technikraum |
| `motion` | Motion sensor (person with detection arc) |
| `bulb` | Light bulb |
| `home` | House |
| `stairs` | Staircase |
| `door` | Door |
| `motion_sensor` | Radar motion circle |
| `lightbulb` | Light bulb (alternate) |
| `server` | Server rack |
| `vibration` | Vibration bars |
| `tilt` | Tilt / incline |
| `thermometer` | Temperature |
| `water` | Humidity / water drop |
| `salt` | Salt / circle |
| `person` | Person silhouette |
| `switch_icon` | Toggle switch |
| `warning` | Warning triangle |
| `sensor` | Generic sensor circle |

---

## Sensor Categories

The `category` field controls the state display logic and color:

| Category | On state text | Off state text | On color |
|---|---|---|---|
| `switch` | On | Off | Blue |
| `motion` | Detected | Clear | Amber |
| `door` | Open | Closed | Yellow |
| `light` | On | Off | Blue |
| `person` | Home | Away | Blue |
| `sensor` | (raw state) | (raw state) | Gray |

---

## Threshold Format

Color thresholds are a JSON array sorted by `max` value ascending:

```json
[
  { "max": 10,  "color": "#4fa3e0" },
  { "max": 25,  "color": "#6ddb99" },
  { "max": 35,  "color": "#e0b44f" },
  { "max": 999, "color": "#e05050" }
]
```

The card picks the color of the first entry where `value <= max`. The last entry acts as the catch-all for high values.

---

## Related Cards

- [Samsung Laundry Card](https://github.com/robman2026/Laundry-Room-Card) — Washer & Dryer card in the same style

---

## License

MIT © robman2026
