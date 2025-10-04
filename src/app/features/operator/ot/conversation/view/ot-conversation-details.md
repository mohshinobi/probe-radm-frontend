# Documentation – OT Conversation Detail Display

## Description

This component displays the detailed view of an OT conversation based on its unique identifier (`_id`) retrieved from **Elasticsearch**.

---

## Display Structure

###  Block 1 – Conversation Information

Displays metadata for the **source** and **destination**, along with the directional flow (arrow and protocol):

Each block includes:
- Conversation ID
- Name
- IP Address
- MAC Address
- Zone
- Type
- **Graphical Representation**: Similar to the topology view, includes zone, icon (based on type), and name.

---

###  Block 2 – Conversation Details

- **Last Occurrence (Timestamp)**
  - Field: `@timestamp`

- **Protocol**
  - Field: `layers.frame.frame_frame_protocols`

- **Is Part of an Alert**
  - Display: `Yes / No` (based on boolean flag)

---

###  Block 3 – Frame Information

#### Frame Length
- **Field**: `layers.frame.frame_frame_len`
- **Description**: Total size of the frame in bytes, including all headers and payload.
- **Example**: `"layers.frame.frame_frame_len": "60"`

#### Total Bytes Captured
- **Field**: `layers.frame.frame_frame_cap_len`
- **Description**: Number of bytes captured by the monitoring system. Often equals `frame_frame_len`.
- **Example**: `"layers.frame.frame_frame_cap_len": "60"`

#### Payload Length
- **Field**: `layers.ip.ip_ip_len`
- **Calculation**: `layers.ip.ip_ip_len - layers.ip.ip_ip_hdr_len`
- **Description**: Size of the IP payload in bytes.
- **Example**:
  ```json
  "layers.ip.ip_ip_len": "29",
  "layers.ip.ip_ip_hdr_len": "20"
  ```
  **Payload Bytes** = `29 - 20 = 9 bytes`

---

###  Block 4 – History (Bandwidth & Payloads)

####  Frame Count (Last 60 Minutes)
- **Field**: `layers.frame.frame_frame_time`
- **Description**: Count all frames whose timestamp is within the last 60 minutes.
- **Calculation**:
  Count frames where:
  ```
  currentTime - frame_frame_time ≤ 60 minutes
  ```

#### Table – Throughput and Payload Volume

| Metric          | 1 Minute           | 5 Minutes           | 15 Minutes          |
|------------------|--------------------|----------------------|----------------------|
| **Throughput (bps)** | Avg frame size * 8 / seconds | Same logic | Same logic |
| **Payload (Bps)**   | Avg payload size / seconds | Same logic | Same logic |

##### Throughput (Débit)
- **Fields**:
  - Frame size: `layers.frame.frame_frame_len`
  - Timestamp: `layers.frame.frame_frame_time`
- **Formula**:
  ```
  Throughput (bps) = (Sum of frame sizes in bytes × 8) / duration in seconds
  ```

#####  Payload Volume
- **Fields**:
  - Payload = `layers.ip.ip_ip_len - layers.ip.ip_ip_hdr_len`
  - Timestamp: `layers.frame.frame_frame_time`
- **Formula**:
  ```
  Payload Volume (Bps) = Sum of payload sizes / duration in seconds
  ```

---

###  Block 5 – Alert Information *(TODO)*

> Placeholder for future display of alert-related metadata linked to the current conversation.

---

## Notes

- All data originates from an **Elasticsearch index** query using `_id`.
- Payload and bandwidth data are computed from raw packet capture metadata.
- Asset enrichment is based on matching IP and MAC addresses to known OT assets.

## Test Curl

```bash
curl -X GET "http://localhost:9200/logstash-ot-alerts-*/_search" -H 'Content-Type: application/json' -d '{
  "size": 50,
  "query": {
    "bool": {
      "filter": [
        { "term": { "ip_src.keyword": "192.168.202.40" } },
        { "term": { "ip_dst.keyword": "192.168.2.140" } },
        { "term": { "mac_src.keyword": "34:c0:f9:7b:df:c3" } },
        { "term": { "mac_dst.keyword": "f4:54:33:9c:ec:87" } },
        { "term": { "protocol.keyword": "cipcls" } }
      ]
    }
  }
}'
```
