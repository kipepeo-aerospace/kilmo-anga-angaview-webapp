# Frontend Repo — Phase 5: Migration, Mobile App & Farms Page Build

**Repo:** Frontend (AngaView, React + Tailwind CSS) | **Branch:** `gcp-migration`
**Prerequisite:** `INFRA_SETUP_CHECKLIST.md` complete (Firebase Auth enabled, `firebaseConfig` recorded), `BACKEND_MIGRATION_CHECKLIST.md` deployed (Cloud Run URL recorded), `ANGAI_BUILD_CHECKLIST.md` deployed for full action-card testing.

---

## 1. Firebase project setup (console-first, one-time)

- [ ] Confirm Firebase Hosting is enabled for the project:
  - Console: [Firebase console](https://console.firebase.google.com) → `angastack-platform` → **Build → Hosting → Get started**. Follow the setup wizard — it'll prompt you to install `firebase-tools` and run `firebase init`, which you'll do locally in the next step.
- [ ] Locally, one-time setup:
  ```bash
  npm install -g firebase-tools
  firebase login
  ```

---

## 2. Wire up Firebase config and Auth SDK

- [ ] Add the `firebaseConfig` object (recorded during Infra Step 4) to the app's `.env` file — `apiKey`, `authDomain`, `projectId`, etc.
- [ ] Install `firebase` npm package: `npm install firebase`.
- [ ] Replace the Microsoft Entra ID login flow with the Firebase Auth SDK:
  - Initialise Firebase Auth using the config above.
  - Replace login/logout calls with `signInWithEmailAndPassword` / `signOut` (or whichever sign-in method matches your current UI — Email/Password is what's enabled in Infra Step 4).
  - On successful login, the ID token from `user.getIdToken()` is what gets sent as the `Authorization: Bearer <token>` header on every API call to the backend (which verifies it via Firebase Admin SDK — see Backend checklist Step 9).

---

## 3. Point the app at the new backend

- [ ] Update the API base URL env var (`baseUrl`) to the Cloud Run service URL recorded at the end of the Backend checklist (something like `https://angacloud-backend-<hash>-ew.a.run.app`).
- [ ] Update every existing fetch/axios call in the app if the URL was previously hardcoded rather than pulled from an env var.

---

## 4. Mobile Application Setup & Freemium Ingestion Flow

- [ ] Configure Android Mobile Wrapper: Wrap the React web app for Android deployment using Capacitor or setup as an installable Progressive Web App (PWA) to allow field-level mobile access.  
- [ ] Deprecate Standalone Gallery View: Completely remove the standalone `/gallery` route and tab. Images are no longer viewed in isolation; they serve strictly as evidence attachments embedded within observations and action cards on the farm timeline.  
- [ ] Build Global "New Analysis" Modal / Flow:
  - [ ] Create a unified modal/screen accessible via a primary CTA button ("New Analysis").  
  - [ ]User flow: Select Farm → Select Active Season → Choose Source (`Mobile Inspection` or `Drone Survey`).  
- [ ] Build Mobile Camera UI Component (`POST /observations/mobile`):
  - [ ]Implement a mobile-optimized camera UI / file picker component for capturing in-field plant photographs.  
  - [ ]On image submission, send a multipart `POST` payload to `/observations/mobile` containing `farm_id`, `season_id`, `image file`, and `device GPS location` (if granted).  
  - [ ]Render an immediate loading state indicating Vertex AI analysis is in progress.  
  - [ ]On instant response, display the preliminary Vertex AI findings (e.g., "Early Nitrogen Stress Detected — 92% confidence") and redirect the user directly to the updated Farm Health Record timeline

---

### 5. Build the Farms Page - The Living Health Record

The Farms Page serves as the central workspace and continuous health record for a farm.  

- [ ] New Routing Structure:
  - `/` or `/home` — Macro overview listing all registered farms with quick health status badges.  
  - `/farms` — Grid/List view of all farms owned by the user.  
  - `/farms/{farm_id}` — The primary Farm Detail view (The Living Record).  
- [ ] `FarmHeader` Component:
  - Displays farm name, centroid GPS coordinates, total calculated acreage, active season selector (e.g., "2026 Long Rains — Maize"), and overall current health score.  
- [ ] `UnifiedTimeline` Component (Chronological Feed):
  - Displays a single chronological feed merging both mobile plant inspections and drone mapping surveys into a single longitudinal record.  
  - Each item in the timeline represents an `Observation` event showing timestamp, source badge (`Mobile` or `Drone`), summary findings, status badge (`Processing`, `Complete`, `Failed`), and attached evidence media.  
- [ ] MapViewer Component:
  - Render interactive maps using Leaflet or MapLibre.  
  - Overlay farm boundary GeoJSON polygon.  
  - Dynamically load and render orthomosaic and index-map (NDVI/VARI) raster overlays using short-lived GCS Signed URLs returned by the backend map endpoints.  
  - Display interactive drop-pin markers for geotagged mobile photos taken across the farm field.  
- [ ] `StatsPanel` Component:
  - Renders quantitative analytics extracted from drone observations: mean NDVI, VARI scores, stress percentage (< 0.3 NDVI), and healthy canopy percentage (> 0.6 NDVI).  
  - Renders the zone breakdown table showing pixel counts and mean index values per stress zone.  
- [ ] `ActionCardList` + `ActionCard` Components:
  - Renders prioritized, AI-generated recommendations fetched from the `ai_output` subcollection under observations.  
  - Priority Color Coding: High = Red badge, Medium = Amber badge, Low = Green badge.  
  - Category Icons: Visual icons for Water (blue), Pest (purple), Nutrient (amber), and General (gray).  
  - Card Content: Displays insight (what was observed), recommendation (what action the farmer should take), and attached evidence (mobile photo snippet or affected map zone link). 

---

## 6. Handle loading and error states

- [ ] Implement independent skeleton and spinner loading states for components (`MapViewer`, `StatsPanel`, `UnifiedTimeline`, `ActionCardList`) so slow-loading elements don't block the rest of the page UI.  
- [ ] Decoupled AI Fallback Handling: If AngAi processing is still pending or experiences an error, the maps and quantitative stats must still render cleanly. Action cards should display a "Still analyzing observation..." loading state or a subtle "AI analysis unavailable" card without breaking the overall Farm Detail view.

---

## 7. Firebase Hosting config & Deployment

- [ ] Configure `firebase.json` in the project root:
  ```bash
  firebase init hosting
  ```
  - Select the `angastack-platform` project.
  - Public directory: your build output folder (`build` for Create React App, `dist` for Vite).
  - Configure as a single-page app: **Yes** (this rewrites all routes to `index.html` so client-side routing like `/farms/{farm_id}` works on refresh).
  - Set up automatic builds/deploys with GitHub: optional, skip for now unless you want CI wired up immediately.

- [ ] Build the web bundle:
  ```bash
  npm run build
  ```

- [ ] Deploy to Firebase Hosting
  ```bash
  firebase deploy --only hosting
  ```

- [ ] Console verification: Confirm the release is live on the Firebase Hosting dashboard and verify client-side route rewrites

---

## 8. Full end-to-end test

- [ ] Authentication Flow: 
  - [ ] Register a new user / Log in using Firebase Auth 
  - [ ] Confirm ID token is attached to headers.  
- [ ] Farm & Season Setup: Create a new farm with boundary polygon and set up an active season.  

- [ ] Mobile Freemium Ingestion Path:
  - [ ] Trigger "New Analysis" → Select Mobile Inspection.  
  - [ ] Upload a crop photo via `/observations/mobile`.  
  - [ ] Verify Vertex AI returns instant analysis and the observation appears immediately on the `UnifiedTimeline` with generated Action Cards.  

- [ ] Drone Survey Ingestion Path:
  - [ ] Trigger "New Analysis" → Select Drone Survey.  
  - [ ] Upload raw imagery batch via `/observations/drone`.  
  - [ ] Poll `/status` until job status updates from `processing` to `complete`.
  - [ ] Verify orthomosaic and NDVI index rasters render on `MapViewer` via backend GCS Signed URLs.  
  - [ ] Verify numerical index stats render inside `StatsPanel`.  
  - [ ] Verify AngAi action cards appear in `ActionCardList` once background analysis completes.

---

## Phase 5 completion checkpoint

- [ ] AngaView is live on Firebase Hosting as both a responsive web app and an installable Android build.  
- [ ] Firebase Auth completely replaces Microsoft Entra ID end-to-end.
- [ ] Standalone Gallery view is deprecated; images are rendered as evidence attachments.  
- [ ] Farms Page (`/farms/{farm_id}`) renders unified chronological timeline, interactive maps, quantitative stats, and AI action cards in one view.  
- [ ] Dual ingestion flows (instant Mobile photo analysis & batch Drone photogrammetry) function end-to-end without manual intervention