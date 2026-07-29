# Frontend Repo — Phase 5: Migration & Farms Page

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

- [ ] Update the API base URL env var to the Cloud Run service URL recorded at the end of the Backend checklist (something like `https://angacloud-backend-<hash>-ew.a.run.app`).
- [ ] Update every existing fetch/axios call in the app if the URL was previously hardcoded rather than pulled from an env var.

---

## 4. Firebase Hosting config

- [ ] In the project root:
  ```bash
  firebase init hosting
  ```
  - Select the `angastack-platform` project.
  - Public directory: your build output folder (`build` for Create React App, `dist` for Vite).
  - Configure as a single-page app: **Yes** (this rewrites all routes to `index.html` so client-side routing like `/farms/{farm_id}` works on refresh).
  - Set up automatic builds/deploys with GitHub: optional, skip for now unless you want CI wired up immediately.

---

## 5. Build the Farms Page (`/farms/{farm_id}`)

- [ ] New route: `/farms/{farm_id}`.
- [ ] `FarmHeader` component — farm name, boundary/location, crop type, season.
- [ ] `MapViewer` component — renders mosaic/index-map rasters using the GCS Signed URLs returned by the backend's `/gallery`/`/farms` endpoints. Use Leaflet or MapLibre (either is fine — Leaflet is simpler to set up if you haven't used either before).
- [ ] `StatsPanel` component — renders the quantitative NDVI/VARI numbers from the job's Firestore document (mean, stress %, healthy %, etc.) fetched via the backend.
- [ ] `ActionCardList` + `ActionCard` components — render AI-generated insights from the `ai_output` subcollection.
  - Priority colour coding: high = red, medium = amber, low = green.
  - Category icons: water, pest, nutrient, general.
- [ ] `JobHistory` — list of past jobs for this farm, each linking back to its own stats/action cards.

---

## 6. Handle loading and error states

- [ ] Skeleton/spinner loading states for maps, stats, and action cards independently — don't block the whole page on one slow piece.
- [ ] Specifically: if AngAi hasn't finished (or failed), the maps and stats should still render — action cards should show a "still analysing" or "unavailable" state rather than blocking the rest of the Farms Page. This matches the architecture decision that an AngAi failure shouldn't corrupt access to maps.

---

## 7. Deploy

- [ ] Build the app: `npm run build` (or your framework's equivalent).
- [ ] Deploy:
  ```bash
  firebase deploy --only hosting
  ```
- [ ] Console verification: **Hosting** dashboard shows the new release, live URL, and a rollback button if you ever need to revert to a previous deploy without redeploying code.

---

## 8. Full end-to-end test

- [ ] Sign up / log in via Firebase Auth.
- [ ] Create a farm.
- [ ] Upload raw images.
- [ ] Trigger processing (`/process`) and watch `/status` update through queued → processing → complete.
- [ ] Confirm Firestore stats appear and render correctly in `StatsPanel`.
- [ ] Confirm action cards appear in `ActionCardList` once AngAi finishes.
- [ ] Confirm map rasters load via signed URLs (this is the step most likely to break first if backend IAM isn't set up right — see Backend checklist Step 7).

---

## Phase 5 completion checkpoint

- [ ] AngaView is live on Firebase Hosting.
- [ ] Firebase Auth replaces Entra ID end-to-end (frontend issues token, backend verifies it).
- [ ] Farms Page renders maps, stats, and action cards in one unified view.
- [ ] Full signup-to-insight flow works without manual intervention.
