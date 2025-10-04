# Documentation – OT Conversations Table (API CORE)

## Description

This component displays a list of OT network conversations retrieved from the **Elasticsearch** index:
`logstash-ot-alert-*`.

---

## Displayed Fields

Each conversation entry in the table includes the following fields:

- `@timestamp`
- `ip_src`
- `ip_dst`
- `mac_src`
- `mac_dst`
- `zones`
  - This field is **added on the frontend** for visual context.
  - **Do not use it for filtering or sorting**, as it does not exist in the Elasticsearch index.
  - It represents the source/destination asset zones using one of the following 4 use cases:

    | Source ➡ Destination | Description |
    |----------------------|-------------|
    | `Z00X ➡ ❓`           | Source asset is known and belongs to zone Z00X; destination is unknown |
    | `❓ ➡ Z00X`           | Destination asset is known and belongs to zone Z00X; source is unknown |
    | `❓ ➡ ❓`              | Both source and destination are unknown |
    | `Z00X ➡ Z00Y`        | Both assets are known and belong to zones Z00X and Z00Y respectively |

- `protocol`

---

## Available Actions

- **Details Button**
  Redirects the user to the **Conversation Details** page for the selected item (`conversation-details/:id`).

---

## Filtering Options

All table fields (except `zones`) must be **individually filterable**, including:

- **Date/Time Range**: `@timestamp`
- **Conversation Attributes**:
  - `protocol`
  - `ip_src`
  - `ip_dst`
  - `mac_src`
  - `mac_dst`

---

## Technical Notes

- Data is sourced from Elasticsearch and must be paginated or virtualized for performance.
- The `zones` field should be generated based on cross-referencing the IP/MAC with known assets.
- The component must support filtering without affecting query performance or UX.
