# 🌾 Kilimo Anga – Precision Agriculture Platform (Frontend)

**Kilimo Anga** is a web-based application that enables smallholder farmers to upload drone imagery, process it into vegetation index maps (e.g., VARI), and visualize results through an intuitive dashboard.

This frontend is built using **React** and **Tailwind CSS**, designed to integrate with **Azure Blob Storage**, **Azure Container Instances**, and **Azure Functions**. The MVP is focused on providing an end-to-end testable system for early client feedback and deployment.

---

## 🚀 Features

- 🔐 **User Authentication**
  - Signup/login using email and password
  - Custom **Client ID** (unique per user)
  - Session stored in `localStorage`

- 🌾 **Farm Registration**
  - Register new farms with a **Farm ID**
  - Upload multiple aerial images per farm
  - Upload preview with progress bar
  - Images organized under `raw/{client-id}/{farm-id}/` in blob storage

- 🖼 **Image Gallery**
  - Switch between tabs: `Raw Images`, `Mosaics`, `Index Maps`
  - Fetch files via backend endpoint
  - Preview/download images

- ⚙️ **Index Processing**
  - Select a farm and choose index to process (VARI for now)
  - Trigger backend process with `client_id` and `farm_id`
  - Poll for job status: `queued`, `processing`, `complete`
  - Show progress spinner and notification on completion

- 👤 **User Profile**
  - View client info: Client ID, email, number of farms, uploads
  - Simple summary of user activity

- 📱 **Responsive UI**
  - Clean Tailwind styling
  - Optimized for desktop and mobile

---

## 🧱 Tech Stack

| Layer       | Technology                 |
|-------------|----------------------------|
| Frontend    | React                      |
| Styling     | Tailwind CSS               |
| Routing     | React Router               |
| State Mgmt  | React Context, localStorage |
| API Client  | Axios or Fetch             |
| Auth (Mock) | Firebase-style local logic |
| Hosting     | Azure Static Web Apps      |
| Backend     | (To be integrated) Azure Functions + Blob Storage + Container Instances |

---

## 📁 Project Structure

/src
/components → Reusable UI components (e.g., ImageCard, Tabs)
/pages → Auth, Upload, Gallery, Process, Profile
/services → API clients and mock endpoints
/context → AuthContext, UI state
/utils → Helpers (formatting, file handling)
App.jsx → Main layout and router
index.js → App entry point

---

## 🔧 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/kilimo-anga-frontend.git
cd kilimo-anga-frontend
```

### 2. Install deoendecies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```

---

## 🔌 Mock API Endpoints

The app currently uses mocked endpoints for all backend features. These will be connected to Azure services later.

| Action             | HTTP Method | Endpoint                                                  | Description                              |
|--------------------|-------------|------------------------------------------------------------|------------------------------------------|
| Upload Images      | POST        | `/upload`                                                  | Uploads drone images for a specific farm |
| List Files         | GET         | `/list-files?client-id=...&farm-id=...&type=...`          | Lists images, mosaics, or indices        |
| Trigger Processing | POST        | `/process`                                                 | Starts vegetation index generation job   |
| Job Status         | GET         | `/status?client-id=...&farm-id=...`                       | Returns current processing status        |
| User Profile       | GET         | `/profile?client-id=...`                                  | Returns basic user details and summary   |

---

## 📈 Roadmap

- [x] VARI index support (done)
- [ ] NDVI and other indices
- [ ] Insights dashboard (replant alerts, crop stress zones)
- [ ] Azure Blob & Function integration
- [ ] Mobile app version
- [ ] Multilingual support

---

## 📸 Screenshots

> _To be added after deployment_  
> Sample views to include:  
> - Farm registration and upload  
> - Gallery tabs (Raw / Mosaics / Index Maps)  
> - Processing progress with spinner  
> - Profile overview page  

---

## 🙌 Contributing

Contributions are welcome!  
- Fork the repo  
- Create a feature branch  
- Submit a pull request  
- Ensure all new features are covered by basic UI and logic tests

---

## 💬 Contact & Credits

Built by the Kilimo Anga team under [Kipepeo Aerospace Ltd.](#)  
Led by Brian Lembuss and team.


---

## 📄 License

This project is licensed under the **MIT License**.  
See the [`LICENSE`](./LICENSE) file for full details.
