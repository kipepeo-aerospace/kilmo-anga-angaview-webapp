# Firestore Database Schema & Structural Specification

**Project:** Kilimo Anga / AngaStack  
**Environment:** GCP / Firebase (`angastack-platform`)  
**Database Mode:** Native (`(default)` instance)  

---

## 1. Architectural Design Principles

The Firestore schema follows a strict hierarchical tree structure designed around user data isolation, deterministic subcollection querying, and clear microservice separation:

1. **User Segregation at Root:** Data is scoped per user directly from the root collection (`users/{user_id}`) to ensure straight-forward security rules enforcement and strict multi-tenant isolation.
2. **Subcollection Hierarchy:** Farms are nested under users, job executions are nested under farms, and AI insights are isolated inside job document subcollections.
3. **Decoupled AI Engine:** The `ai_output` microservice outputs live in a distinct subcollection (`ai_output`) below jobs. This keeps pipeline execution state separate from downstream agronomic evaluation.
4. **Reference-Only Storage:** Large binary and vector datasets (raw drone photos, stitched TIFF orthomosaics, vegetation maps) are stored in Google Cloud Storage (GCS) buckets, with only valid URI references maintained inside Firestore documents.

---

## 2. Collections Hierarchy Map

```text
users/{user_id}
  └── farms/{farm_id}
        └── jobs/{job_id}
              └── ai_output/{output_id}
```

---

## 3. Detailed Schema Definitions

### 3.1 Collection: `users`
* **Path:** `users/{user_id}`
* **Document ID:** Firebase Auth User UID (`user_id`)
* **Description:** Represents registered system users and organization accounts.

| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | Full name of the user |
| `email` | `string` | Primary user email address |
| `created_at` | `timestamp` | Account creation timestamp |
| `subscription_tier` | `string` | Account tier (`free` \| `pilot` \| `commercial`) |

---

### 3.2 Collection: `farms`
* **Path:** `users/{user_id}/farms/{farm_id}`
* **Document ID:** Auto-generated document ID (`farm_id`)
* **Description:** Contains field boundary definitions, regional context, and agronomic metadata for a registered plot.

| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | Farm label/name as provided by the user |
| `location` | `GeoPoint` | Centroid coordinates (latitude/longitude) |
| `size_hectares` | `number` | Calculated area of the farm in hectares |
| `crop_type` | `string` | Primary cultivated crop (e.g., `maize`, `tea`, `wheat`) |
| `season` | `string` | Active growing season (e.g., `2026-Long-Rains`) |
| `region` | `string` | Administrative boundary or operational district (e.g., `Ndabibi, Nakuru`) |
| `created_at` | `timestamp` | Timestamp when the farm profile was created |
| `boundary` | `map` (GeoJSON) | Polygon object defining the spatial bounds of the plot |

---

### 3.3 Collection: `jobs`
* **Path:** `users/{user_id}/farms/{farm_id}/jobs/{job_id}`
* **Document ID:** Auto-generated document ID (`job_id`)
* **Description:** Records individual drone processing runs, GCS output pointers, and extracted quantitative index statistics.

| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `status` | `string` | Workflow execution state (`queued` \| `processing` \| `complete` \| `failed`) |
| `created_at` | `timestamp` | Execution trigger timestamp |
| `completed_at` | `timestamp` | Execution termination timestamp (`null` while active) |
| `gcs_paths.raw` | `string` | GCS URI pointing to input raw image directory (`gs://angastack-raw-images/...`) |
| `gcs_paths.mosaic` | `string` | GCS URI pointing to output orthomosaic TIFF (`gs://angastack-mosaics/...`) |
| `gcs_paths.indices` | `string` | GCS URI pointing to map output directory (`gs://angastack-index-maps/...`) |
| `stats.ndvi.mean` | `number` | Average NDVI index score across the farm boundary |
| `stats.ndvi.min` | `number` | Minimum recorded NDVI value |
| `stats.ndvi.max` | `number` | Maximum recorded NDVI value |
| `stats.ndvi.std_dev` | `number` | Standard deviation of NDVI pixel values |
| `stats.ndvi.stress_percentage` | `number` | Percentage of pixels falling below threshold (`NDVI < 0.3`) |
| `stats.ndvi.healthy_percentage` | `number` | Percentage of pixels exceeding healthy threshold (`NDVI > 0.6`) |
| `stats.vari.mean` | `number` | Average VARI score across the field plot |
| `stats.vari.min` | `number` | Minimum recorded VARI value |
| `stats.vari.max` | `number` | Maximum recorded VARI value |
| `stats.zone_breakdown` | `array` | Array containing quantitative data per classified zone (see object structure below) |

#### Zone Object Structure (inside `stats.zone_breakdown`)
```json
{
  "zone_id": "string",
  "ndvi_mean": "number",
  "stress_level": "string", // high | medium | low
  "pixel_count": "number"
}
```

---

### 3.4 Subcollection: `ai_output`
* **Path:** `users/{user_id}/farms/{farm_id}/jobs/{job_id}/ai_output/{output_id}`
* **Document ID:** Auto-generated document ID (`output_id`)
* **Description:** Holds structured rules engine findings and natural language RAG recommendations produced by AngAi.

| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `generated_at` | `timestamp` | Timestamp when the AngAi evaluation completed |
| `rules_findings` | `array` | Array of structured findings output by the agronomic rules engine |
| `recommendations` | `array` | Natural language actionable advice generated by the foundation model via RAG |
| `action_cards` | `array` | Consolidated summary cards consumed by the AngaView UI (see object structure below) |
| `audit_log` | `map` | Diagnostic tracking detailing model versions, prompt contexts, and vector DB reference IDs |

#### Action Card Object Structure (inside `action_cards`)
```json
{
  "card_id": "string",
  "priority": "string",      // high | medium | low
  "category": "string",      // water | pest | nutrient | general
  "insight": "string",       // Data-driven field observation statement
  "recommendation": "string",// Actionable advice or intervention step
  "affected_zone": "string"  // Target zone_id(s) linked to this recommendation
}
```

---

## 4. Firestore Composite Index Declarations

To support frontend dashboard queries and fast history fetches, the following composite indexes are required:

```json
{
  "indexes": [
    {
      "collectionGroup": "farms",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "jobs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```