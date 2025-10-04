# Documentation – OT Alert Detail Display

## Description

This component displays the detailed view of an OT alert using its unique identifier (`_id`) retrieved from **Elasticsearch**.

The display adapts based on the type of detection engine that triggered the alert:

- **AI Detection Engine**:
  The `detection` field will display:
  `['Detected By AI']`

- **CORE Detection Engine**:
  The `detection` field will display:
  `['Rule number #N']`
  (`N` being the rule number that triggered the alert)

---

## Display Structure

### Block 1 – Conversation Information

Displays metadata of the network conversation, including:

- Conversation ID
- Source and Destination IPs
- Source and Destination MAC addresses

Alongside a graphical representation of related assets, showing:

- Zone
- Icon
- Name

---

### CORE Alerts – Specific Display

- Block 2:
  - `initial_seen`
  - `last_seen`
  - `severity`

- Block 3:
  - `description`
  - `rule`

---

### AI Alerts – Specific Display

- Block 2:
  - `initial_seen`
  - `last_seen`
  - `severity`
  - `score_deviance`
  - `surrounding_assets_conversations`
  - (Future feature) User feedback button

- Block 3:
  - `relevant_attack_technique`
  - `description`
  - `rule`

- Block 4 (optional) – Attack Sequence Visualization:
  Displayed based on the following conditions:

  - `predecessor`: shown if `alert?.adjustment_summary?.has_predecessor_techniques === true`
  - `successor`: shown if `alert?.adjustment_summary?.has_successor_techniques === true`
  - `current_conversation`: always displayed

  A graph arc is rendered if an asset `_id` from `current_conversation` also exists in either `predecessor` or `successor`.

---

## Technical Notes

- The `_id` field is required to fetch the alert from Elasticsearch.
- Conditional rendering depends on the presence of specific fields in the `alert` object.
- Assets should be displayed interactively and clearly.
- The component should be scalable and support future improvements (e.g., user feedback, advanced rule linking, etc.).
