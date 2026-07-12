# PixelVault Backend Console (Bugout Console)

A developer-focused React console frontend designed for testing image uploading services, managing media collections, and verifying API response schemas in real-time.

---

## Purpose & Overview

This application serves as an interactive playground and admin console to test local or remote backend image storage and collections services. It allows developers to:
1. **Configure Service Endpoints**: Set up target API service locations (`Host Base URL`) and `Authorization` headers (API Key / Token) dynamically.
2. **Test Image Uploads**: Select or drag-and-drop local image files, categorize them into specific collections (e.g., `pets`), and upload them.
3. **Inspect Server Payloads**: Directly verify JSON response formats, statuses, and returned image parameters returned by the storage server.
4. **Browse Assets**: List live uploaded assets side-by-side with local mock previews, inspect image resolutions, sizes, types, and delete uploaded files.

---

## Features

### 🔌 Connection Parameters Configuration
- Accessible in the **Config** tab.
- Persists the backend connection `baseUrl` and `apiKey` securely in the browser's `LocalStorage`.
- Restores parameters automatically on start, making it easy to test against different ports (e.g. `http://localhost:3000`, `http://localhost:8000`) or cloud endpoints.

### 📤 Image Upload Tester
- Drag-and-drop dropzone with image thumbnails, file detail overlays, and clear buttons.
- Category inputs to specify the target storage `collection` field.
- Visual upload loading spinner during multipart form submissions.
- **Request Format** dispatched by the console:
  ```bash
  POST {baseUrl}/api/v1/upload
  Headers:
    Authorization: Bearer <apiKey>
  Body (multipart/form-data):
    image: [binary file]
    collection: [collection name]
  ```

### 📄 Raw Response Schema Visualizer
- Automatically captures the raw HTTP response from the backend.
- Displays response code status badges (e.g., `HTTP 200` or `HTTP 500`).
- Outputs formatting-highlighted, clean JSON with a **Copy to Clipboard** utility.

### 🖼️ Asset Explorer & Actions
- **Grid / List Views**: Switch layouts dynamically.
- **Mock Data Toggle**: Toggle pre-populated mock assets to preview console behavior.
- **Live Assets Card**: Displays actual uploaded images, including filename, size (KB/MB conversion), type, dimensions (e.g., `4032 × 3024`), and collection tags.
- **Interactive Triggers**: One-click shortcuts to open the direct asset URL (`View`), download the file, or delete it from storage (`DELETE {baseUrl}/api/v1/images/:id`).

---

## Get Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- An active backend server implementing the upload endpoints (or configure the console to point to your live upload service).

### Installation
1. Install client dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   The application will run locally (typically at `http://localhost:5173/`).

3. Configure connections:
   - Navigate to the `/config` page in the console.
   - Enter your target endpoint (e.g., `http://localhost:3000`) and authentication key.
   - Save to begin testing uploads on the `/images` tab.
