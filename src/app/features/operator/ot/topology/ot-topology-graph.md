# Documentation – OT Topology Graph

## Description

This page displays the OT network topology, showing all known assets grouped by zones and layers, as well as the possible communication links between them.

The user can interact with the graph to:

- View information about an asset, zone, or communication link
- Add unknown assets manually
- Pivot to another asset or conversation

---

## Data Retrieval

### 1. Topology Object

Data is retrieved via a request to the **CORE API**, which returns a nested topology object structured as follows:

- Up to **5 layers** (`levels`)
- Each layer contains one or more **zones**
- Each zone contains a list of **assets**

On the frontend, this object must be **pre-processed** to simplify rendering in the graph.

---

## Visualization Library

**go.js** is used to render the topology graph (recommended by the CTO).
Note: In the free version, a watermark will appear ("evaluation version"). If a license key is provided, update the following line in `topology.component.ts`:

```ts
go.Diagram.licenseKey = "YOUR_LICENSE_KEY";
```

---

## Component Blocks

### 1. Information Block

- A floating, draggable div
- Displays details about the selected item (asset, zone, or communication link)
- Interaction triggers:
  - Click on asset (from graph or unknown assets block)
  - Click on zone
  - Click on conversation link

---

### 2. Unknown Assets Block

- Vertically aligned list of **unrecognized assets**
- Assets can be **dragged into a group** within the graph to be officially added to the system via a CORE API route
- Minimum required data: `ipv4`, `mac_address`, and a generated `id`
- Clicking an unknown asset shows its details in the information block

---

### 3. Topology Block

#### Layer

- Represented as vertically stacked transparent blocks with white borders
- Each layer contains multiple zones, arranged horizontally

#### Zone

- Contains a **title** at the top and **0 or more assets**
- Zones are **not movable or deletable**
- Clicking a zone highlights it and shows its details in the information block

#### Asset

- Identified by an `id` generated from the base64-encoded `ipv4` and `mac_address`, separated by a hyphen:
  `base64(ipv4) + "-" + base64(mac_address)`
- If the `id` is found in the API response or `asset.json`, it is recognized; otherwise, it is added to the unknown assets block
- Each asset type is associated with a specific icon; a default icon is used if the type is missing from the config
- The label below the icon shows the `client_name` or `ipv4` if not available

#### Link / Conversation

- Drawn from the source asset to the destination asset
- Colored according to the associated **protocol**

---

### 4. Filter Block

#### Top Section

- **Hide Button**: Toggles the visibility of the information block
- **Horizontal/Vertical View Toggle**: Switches the graph layout
- **Asset Type Selector**: Multi-select to filter displayed asset types
- **Protocol Selector**: Multi-select to filter by communication protocol
- **Filter Button**: Submits the selected filters

#### Bottom Section

- A horizontal bar showing:
  - All known **protocols**
  - Their **associated colors**
  - The **count** of each found in conversations
- Protocols not found in current data appear **greyed out** to indicate absence
- Each protocol is clickable to filter conversations by that protocol

---

## Technical Notes

- The graph must be responsive and support drag-and-drop operations
- API calls should be optimized to avoid delays when rendering large topologies
- Asset updates (e.g. from unknown to known) must be synchronized with backend changes
- Filtering must be applied to both assets and links for performance and clarity
