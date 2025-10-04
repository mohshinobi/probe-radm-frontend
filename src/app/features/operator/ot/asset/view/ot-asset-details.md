# Documentation – OT Asset Detail Display

## Description

This component displays the detailed view of an OT asset, identified by its unique `id`.

---

## Display Structure

### Block 1 – Asset Information

Displays key metadata related to the asset, including:

- Asset ID
- IP Address
- MAC Address
- Type
- Client Usual Name
- Zone
- Name
- Commercial Name
- Firmware
- Criticality
- Robustness
- Description

#### Available Actions

- **Edit Button**:
  Allows the user to modify the following fields:
  `Type`, `Client Usual Name`, `Zone`, `Name`, `Commercial Name`, `Firmware`, `Criticality`, `Robustness`, `Description`

- **Delete Button**:
  Permanently deletes the asset from the local asset file.

#### Graphical Representation

A visual block displays the asset as it would appear in the topology view, showing:

- Zone
- Icon (based on asset type)
- Name

---

## Technical Notes

- The `id`, `IP`, and `MAC Address` fields are **not editable**, as the `id` is generated using `base64(ip-mac)`.
  Modifying either the IP or MAC address would change the asset's identity and break its references.

- All updates (via edit or delete) should be synced with the asset configuration file.

