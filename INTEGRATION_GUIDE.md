# Firebase & ImageKit Integration Guide

Your portfolio now includes a complete **Upload & Management System** powered by **Firebase** (Realtime Database & Firestore) and **ImageKit** (Real-time image optimization & CDN upload).

---

## ⚡ Quick Start: Access the Upload Portal

1. Open [`admin.html`](file:///c:/Users/More/OneDrive/Documents/protfolio/admin.html) directly in your browser (or click the **⚙ Admin Portal** link at the bottom of [`index.html`](file:///c:/Users/More/OneDrive/Documents/protfolio/index.html)).
2. Enter the default admin passcode: `1234` (you can change this in the Settings tab).
3. Choose a preset:
   - 🎨 **Poster / Graphic Design** (for Photoshop posters, flyers, banners)
   - 💻 **Website Development** (for business sites, portfolios)
   - ⚙ **Management System** (for dashboards, CRM, admin tools)
4. Drop your image into the drop zone. It uploads directly to **ImageKit CDN**!
5. Click **Publish Project / Poster ↗** to store the item in **Firebase**. It immediately goes live on your portfolio!

---

## 1. How Uploading Posters & Projects Works

### A. Poster Size & Vertical Format:
- **Vertical Aspect Ratio (3:4)**: When you upload a poster, flyer, or creative design (`category: "design"`), the portfolio displays it in true vertical poster size (`aspect-ratio: 3/4`).
- **ImageKit Optimization**: ImageKit automatically resizes posters vertically (`640x850`) using lossless WebP/AVIF compression so full 4K artwork loads instantly without getting cropped horizontally!

### B. Website Links for Website Works:
- **Live Website Link**: When uploading a website project, enter your live URL in the **Website Live Link** field (e.g. `https://myclient.com`).
- **Interactive Badges**: Website cards display a prominent `🌐 Live Site ↗` badge, and clicking the card opens the live website directly in a new tab!

### C. Project Data Stored in Firebase:
- When you click **Publish**, the item is recorded in Firebase (`projects` node or collection):
  ```json
  {
    "title": "Neon Cyberpunk Concept Poster",
    "category": "design",
    "format": "poster",
    "label": "Photoshop Creative Poster",
    "year": "2026",
    "mark": "Ps",
    "image": "https://ik.imagekit.io/your_id/posters/cyberpunk.jpg",
    "link": "",
    "order": 1,
    "createdAt": 1700000000000
  }
  ```
- Visitors on your site can filter by **Posters & Design**, **Web**, or **Systems**, and your uploaded works appear instantly!

---

## 2. Firebase Setup (Credentials & Database)

### In [`firebase-config.js`](file:///c:/Users/More/OneDrive/Documents/protfolio/firebase-config.js):
Replace the placeholders with your Firebase credentials:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com", // For Realtime Database
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789...",
  appId: "1:123456789:web:..."
};
```

### Both Realtime Database and Firestore are Supported:
- **Firebase Realtime Database** (matches `portfolio-database.json` & `src/firebase.js`):
  1. In Firebase Console, click **Build > Realtime Database** > **Create database**.
  2. Set rules in the **Rules** tab:
     ```json
     {
       "rules": {
         "projects": { ".read": true, ".write": true },
         "messages": { ".read": true, ".write": true }
       }
     }
     ```
- **Firestore Database**:
  1. In Firebase Console, click **Build > Firestore Database** > **Create database**.
  2. Deploy [`firestore.rules`](file:///c:/Users/More/OneDrive/Documents/protfolio/firestore.rules).

---

## 3. ImageKit Setup (URL Endpoint & Private Key)

### In [`imagekit-config.js`](file:///c:/Users/More/OneDrive/Documents/protfolio/imagekit-config.js):
1. Sign up or log in at [ImageKit.io](https://imagekit.io/).
2. On your Dashboard, copy your **URL-endpoint** (e.g. `https://ik.imagekit.io/irshadk`).
3. Under **Developer Options > API Keys**, copy your **Public Key** and **Private Key**.
4. Paste them into [`imagekit-config.js`](file:///c:/Users/More/OneDrive/Documents/protfolio/imagekit-config.js):
   ```javascript
   const IMAGEKIT_CONFIG = {
     urlEndpoint: "https://ik.imagekit.io/your_imagekit_id",
     publicKey: "your_public_key",
     privateKey: "your_private_key", // Enables 1-click uploads in admin.html
     defaultQuality: 85,
     defaultFormat: "auto"
   };
   ```

---

## 4. Managing Uploads & Viewing Inquiries

In [`admin.html`](file:///c:/Users/More/OneDrive/Documents/protfolio/admin.html):
- **📁 Manage Items Tab**: Displays all projects and posters currently in Firebase. You can delete any item with one click.
- **📬 Inquiries Tab**: View every lead submitted from your portfolio contact form (client name, phone/email, budget, details, date) with a 1-click **WhatsApp** reply button.
- **⚙ Settings Tab**: Check live Firebase and ImageKit connection status or change your admin passcode.

---

## 5. Summary of Files

| File | Purpose |
|------|---------|
| [`admin.html`](file:///c:/Users/More/OneDrive/Documents/protfolio/admin.html) | Admin portal to upload posters/projects, manage items & view inquiries |
| [`index.html`](file:///c:/Users/More/OneDrive/Documents/protfolio/index.html) | Public portfolio with dynamic works & "Posters & Design" filter |
| [`firebase-config.js`](file:///c:/Users/More/OneDrive/Documents/protfolio/firebase-config.js) | Dual Firebase connector (Realtime DB & Firestore) |
| [`imagekit-config.js`](file:///c:/Users/More/OneDrive/Documents/protfolio/imagekit-config.js) | ImageKit optimization & direct file upload handler |
| [`script.js`](file:///c:/Users/More/OneDrive/Documents/protfolio/script.js) | Public portfolio interaction & live works loader |
| [`animations.js`](file:///c:/Users/More/OneDrive/Documents/protfolio/animations.js) | GSAP animations & 3D tilt rebind helper for new cards |
