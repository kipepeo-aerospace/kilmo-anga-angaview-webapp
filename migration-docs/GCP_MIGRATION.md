# Kilimo Anga: Azure to GCP Migration & V1 MVP Build Guide

**Branch:** `gcp-migration` | **Azure baseline:** `v0.1.0-azure`

This document serves as the step-by-step build guide and checklist for migrating the Kilimo Anga platform from Azure to GCP and developing the V1 MVP.

---

## Phase 0 — Repository & Branch Setup

- [x] **Tag the Azure Codebase:** Ensure all Azure code is committed and create a release tag (`v0.1.0-azure`) on the current main branch as a permanent reference for the working Azure system.
- [x] **Create Migration Branch:** Create and checkout the `gcp-migration` branch, which will serve as the active development branch.
- [x] **Initialise GCP Project:** Create a new GCP project named `angastack-platform`.
- [x] **Enable APIs:** Enable Cloud Run, Cloud Run Jobs, Firestore, Firebase, Artifact Registry, Cloud Storage, and Secret Manager APIs.
- [x] **Tooling Setup:** Install and initialise the `gcloud` CLI and Firebase CLI, and create service accounts with appropriate roles (e.g., Storage Object Admin, Firestore Editor) for local development and CI.

---

## Phase 1 — GCP Infrastructure Setup (Detailed Checklist)

### 1. Google Cloud Storage (GCS) Buckets
- [x] **Create GCS Buckets:** 
  - [x] Create `angastack-raw-images`, `angastack-tiffs`, `angastack-mosaics`, and `angastack-index-maps` buckets[cite: 2].
  - [x] Set the bucket location/region to `europe-west1` (Belgium) across all buckets[cite: 2].
  - [x] Enable **Uniform bucket-level access** (disables object-level ACLs for secure IAM governance)[cite: 2].
  - [x] Set bucket lifecycle rules:
    - [x] `angastack-raw-images`: Auto-delete objects older than **90 days**.
    - [x] `angastack-tiffs`: Auto-delete intermediate processing files older than **30 days**.
    - [x] `angastack-mosaics` & `angastack-index-maps`: Retain indefinitely.

---

### 2. Firestore Database Provisioning
- [x] **Database Initialization:**
  - [x] Navigate to **Firebase Console -> Product categories -> Databases & Storage -> Firestore**.
  - [x] Provision database under Database ID `(default)`.
  - [x] Set mode to **Firestore Native**.
  - [x] Set location to `europe-west1` (Belgium).
- [x] **Security Rules Setup:**
  - [x] Go to **Firestore Database -> Rules** tab.
  - [x] Apply initial dev/test mode security rules to allow read/write during early deployment:
    ``` js
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: if request.auth != null; // Enforce auth baseline
        }
      }
    }
    ```
- [x] **Collections Schema Verification:**
  - [x] Confirm structure mapping for application write operations:
    - Root collection: `users/{user_id}`
    - Subcollection: `users/{user_id}/farms/{farm_id}`
    - Subcollection: `users/{user_id}/farms/{farm_id}/jobs/{job_id}`
    - Subcollection: `users/{user_id}/farms/{farm_id}/jobs/{job_id}/ai_output/{output_id}`

---

### 3. Firestore Indexes Setup
- [ ] **Define Composite Index for Jobs Querying:**
  - [ ] In Firebase Console, go to **Firestore Database -> Indexes** tab -> Click **Add Index**.
  - [ ] **Collection ID:** `jobs` (or set path to collection group `jobs`)[cite: 2].
  - [ ] **Field 1:** `created_at` -> **Descending**[cite: 2].
  - [ ] **Query scope:** Collection[cite: 2].
  - [ ] *(Optional)* Save an automated setup by configuring `firestore.indexes.json` in the codebase for deployment via Firebase CLI:
    ```json
    {
      "indexes": [
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

---

### 4. Artifact Registry Repository
- [ ] **Create Container Repository:**
  - [ ] Switch to **Google Cloud Console -> Search / Navigate to Artifact Registry** (or *Product categories -> CI/CD -> Artifact Registry*)[cite: 2].
  - [ ] Click **+ Create Repository**[cite: 2].
  - [ ] **Name:** `angastack-registry`[cite: 2].
  - [ ] **Format:** `Docker`.
  - [ ] **Mode:** `Standard`.
  - [ ] **Location type:** `Region` -> Select `europe-west1` (Belgium).
  - [ ] **Encryption:** `Google-managed encryption key`.
- [ ] **Configure Local Authentication:**
  - [ ] Run authentication helper command on developer workstation to allow local Docker pushes:
    ```bash
    gcloud auth configure-docker europe-west1-docker.pkg.dev
    ```

---

### 5. Firebase Authentication
- [ ] **Enable Auth Providers:**
  - [ ] Return to **Firebase Console -> Build / Left Navigation -> Authentication**[cite: 2].
  - [ ] Click **Get started** (if opening for the first time)[cite: 2].
  - [ ] Go to the **Sign-in method** tab[cite: 2].
  - [ ] Click **Email/Password**[cite: 2]:
    - [ ] Toggle **Enable** to ON[cite: 2].
    - [ ] Leave *Email link (passwordless sign-in)* turned **OFF**.
    - [ ] Click **Save**.
- [ ] **Verify Web Client SDK Credentials:**
  - [ ] Go to **Project Settings** (gear icon next to Project Overview).
  - [ ] Scroll down to **Your apps** -> Select or register Web App (`AngaView`).
  - [ ] Record the `firebaseConfig` object containing `apiKey`, `authDomain`, and `projectId` for the React frontend `.env` file.

---

### 6. Cloud Run & IAM Permissions Preparation
- [ ] **Service Accounts Provisioning:**
  - [ ] Navigate to **GCP Console -> IAM & Admin -> Service Accounts**.
  - [ ] Create `angacloud-pipeline-sa` (for Cloud Run Jobs photogrammetry pipeline):
    - [ ] Grant role: `Storage Object Admin` (for reading/writing GCS buckets)[cite: 2].
    - [ ] Grant role: `Cloud Datastore User` (for reading/writing Firestore jobs documents)[cite: 2].
  - [ ] Create `angacloud-backend-sa` (for FastAPI orchestrator):
    - [ ] Grant role: `Cloud Run Invoker` & `Cloud Run Developer` (to trigger Cloud Run Jobs)[cite: 2].
    - [ ] Grant role: `Cloud Datastore User`[cite: 2].
    - [ ] Grant role: `Storage Object Viewer`[cite: 2].
- [ ] **Cloud Run Job Specifications Definition:**
  - [ ] Document target deployment flags for Phase 2 implementation (Cloud Run does not use a global default template; hardware allocation is declared per resource creation):
    - **vCPU Allocation:** `2 vCPU`
    - **Memory Allocation:** `4Gi`
    - **Task Timeout:** `3600s` (1 hour max allowance for dense stitching jobs)
    - **Region:** `europe-west1`
    - **Execution command standard:**
      ```bash
      gcloud run jobs create angacloud-pipeline-job \
        --image=europe-west1-docker.pkg.dev/angastack-platform/angastack-registry/pipeline:latest \
        --cpu=2 \
        --memory=4Gi \
        --region=europe-west1 \
        --service-account=angacloud-pipeline-sa@angastack-platform.iam.gserviceaccount.com
      ```
---

## Phase 2 — Pipeline Migration & Rewrite

- [ ] **Rewrite Storage Component:** Replace the `azure_blob.py` script with `gcs_storage.py` (or `gcs_blob.py`), exchanging Azure SDK calls for the Google Cloud Storage SDK and updating path construction to use `gs://` URIs.
- [ ] **Update Indices Script:** Rewrite `indices.py` to extract quantitative statistics (NDVI and VARI mean, min, and max; NDVI standard deviation, stress percentage, and healthy percentage; and zone breakdowns) alongside generating visual maps.
- [ ] **Update Main Execution Flow:** Update `main.py` to use `gcs_storage`, replace Azure credentials with Cloud Run Jobs equivalents, initialise the Firestore client, and write the stats JSON to the Firestore job document before signalling completion.
- [ ] **Dockerise for GCP:** Update the Dockerfile to remove Azure SDKs and add `google-cloud-storage` and `google-cloud-firestore`.
- [ ] **Deploy to Artifact Registry:** Build and push the pipeline Docker image to the Artifact Registry (`europe-west1-docker.pkg.dev/kilimo-anga-v1/kilimo-anga/pipeline:v1`).
- [ ] **Test Pipeline:** Run an end-to-end test verifying that maps are written to GCS, `stats.json` is generated, and the Firestore job document updates to `status: complete`.[cite: 2]

---

## Phase 3 — Backend Migration

- [ ] **Update Dependencies:** Remove Azure packages from `requirements.txt` and add `google-cloud-firestore`, `google-cloud-storage`, and `firebase-admin`.
- [ ] **Rewrite Data Interactions:** Update all database and storage calls from Cosmos DB and Azure Blob to the Firestore client and GCS respectively.
- [ ] **Rewrite Job Dispatch:** Replace ACI API triggers with Cloud Run Jobs API triggers, passing `USER_ID`, `FARM_ID`, and `JOB_ID` as environment variable overrides.[cite: 2]
- [ ] **Update API Endpoints:** Repoint existing endpoints (`/upload`, `/farms`, `/process`, `/status`, `/gallery`) to GCP services and create a new `POST /process/ai-trigger` (or `/trigger-angai`) endpoint to trigger AngAi upon job completion.
- [ ] **Authentication Middleware:** Replace Microsoft Entra ID JWT verification with Firebase Admin SDK token verification.
- [ ] **Deploy Backend:** Build, push, and deploy the FastAPI Docker image to Cloud Run as `angacloud-backend` in the `europe-west1` region, allowing unauthenticated access.

---

## Phase 4 — AngAi Service

- [ ] **Curate Knowledge Base:** Collect priority documents from CIMMYT, FAO, KALRO, and TRI-K, focusing on specific East African growing conditions.
- [ ] **Initialise Vector Database:** Chunk documents into 300-500 token passages, generate embeddings (e.g., using OpenAI `text-embedding-3-small` or Google `text-embedding-004`), and store them in a vector database like Pinecone or Firestore Vector.
- [ ] **Build Rules Engine:** Build a Python module to process the stats JSON and generate structured findings based on agronomic thresholds (e.g., flagging high stress if mean NDVI < 0.3, or URGENT_INTERVENTION if stress_pct > 30%).
- [ ] **Build RAG Layer:** Construct a retrieval query from findings and farm context, retrieve relevant chunks from the vector database, and call a foundation model API (Claude Sonnet or Gemini via Vertex AI) to generate recommendations.
- [ ] **Service Wrapper & Deployment:** Build a FastAPI service wrapping the rules engine and RAG layer with a single `POST /analyse` endpoint, add audit logging, map recommendations to the card schema, and deploy it as a separate Cloud Run service.
- [ ] **Integration:** Ensure the FastAPI `/process/ai-trigger` endpoint calls the AngAi service, which then writes consolidated action cards to the Firestore `ai_output` subcollection.

---

## Phase 5 — Frontend Migration & Farms Page

- [ ] **Migrate to Firebase:** Update the React app's Firebase configuration with GCP credentials, implement the Firebase Authentication SDK, and update API base URLs to point to the Cloud Run backend.
- [ ] **Build the Farms Page:** Create a new `/farms/{farm_id}` route featuring a FarmHeader, MapViewer (rendering maps from GCS paths), StatsPanel, ActionCardList, and JobHistory.
- [ ] **Action Card UI:** Implement priority colour coding (high = red, medium = amber, low = green) and category icons (water, pest, nutrient, general) for the action cards.
- [ ] **Handle Application States:** Implement graceful skeleton/spinner loading states and error handling, ensuring that an AngAi failure does not block users from accessing their maps.
- [ ] **Deploy:** Deploy the updated AngaView application using `firebase deploy --only hosting`.
- [ ] **Full End-to-End Test:** Verify Auth, farm creation, image upload, processing triggers, Firestore stats, and action card generation.[cite: 2]

---

## Commit Prefix Convention

| Prefix | Use For |
| :--- | :--- |
| **[INFRA]** | GCP infrastructure setup, bucket creation, Firestore schema |
| **[PIPELINE]** | Pipeline code changes: `indices.py`, `gcs_storage.py`, `main.py` |
| **[BACKEND]** | FastAPI changes: endpoint updates, auth, GCP repointing |
| **[ANGAI]** | AngAi service: rules engine, RAG layer, knowledge base |
| **[FRONTEND]**| AngaView changes: farms page, component builds, auth migration |
| **[SCHEMA]** | Firestore schema changes[cite: 2] |
| **[CONFIG]** | Environment variables, secrets, Docker, CI/CD[cite: 1] |
| **[FIX]** | Bug fixes at any layer[cite: 1] |