# Documentation – OT Assets Table ( API CORE)

## Description

This component displays a list of OT assets that we get from API **CORE**

---

## Displayed Fields

Each alert entry in the table includes the following fields:

- `type`
- `commercial_name`
- `client_name`
- `mac`
- `ip`
- `robustness`
- `criticity`
- `zone`

---

## Available Actions

- **Details Button**
  Redirects the user to the **Alert Details** page for the selected alert (`asset-details/:id`).

---

## Filtering Options

All fields displayed in the table must be **individually filterable**, including:

- IP or asset information (`type`, `commercial_name`, `client_name` , `mac` , `ip` , `zone`)
- criticity level
- robustness level

---

## Technical Notes

- Alerts should be retrieved from a unified data source  CORE and AI detections.
- Filtering must be performed client-side or server-side depending on the volume of data.
- The **Details** action should preserve filters in navigation if needed (e.g., via query params)
