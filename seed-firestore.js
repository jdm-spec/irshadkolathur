/**
 * SEED FIRESTORE SCRIPT (Optional Node.js / Browser helper)
 * Irshad Kolathur — Portfolio
 *
 * HOW TO SEED YOUR PROJECTS:
 * -------------------------------------------------------------
 * OPTION 1 (Easiest - in your browser):
 * 1. Open index.html in your browser after adding your Firebase keys in firebase-config.js.
 * 2. Press F12 to open Developer Console.
 * 3. Type: seedPortfolioWorks() and press Enter!
 *
 * OPTION 2 (Via Node.js):
 * 1. Ensure firebase is installed (`npm install firebase`).
 * 2. Fill in your firebaseConfig below.
 * 3. Run: node seed-firestore.js
 */

const SAMPLE_PROJECTS = [
  {
    title: "Business Website",
    category: "web",
    label: "Web Development",
    year: "2026",
    art: "linear-gradient(135deg,#1c1c1c,#3a0d10)",
    mark: "WEB",
    image: "", // Add ImageKit URL or path here (e.g. "projects/business-site.png")
    link: "",  // Optional direct URL, otherwise opens WhatsApp inquiry
    order: 1
  },
  {
    title: "Management System",
    category: "system",
    label: "Admin Dashboard",
    year: "2026",
    art: "linear-gradient(135deg,#101820,#1d2b3a)",
    mark: "SYS",
    image: "",
    link: "",
    order: 2
  },
  {
    title: "Social Media Creatives",
    category: "design",
    label: "Photoshop Design",
    year: "2026",
    art: "linear-gradient(135deg,#2a0a0c,#E52B32)",
    mark: "Ps",
    image: "",
    link: "",
    order: 3
  },
  {
    title: "Brochure Layout",
    category: "design",
    label: "InDesign Layout",
    year: "2026",
    art: "linear-gradient(135deg,#1a1a1a,#444)",
    mark: "Id",
    image: "",
    link: "",
    order: 4
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { SAMPLE_PROJECTS };
}
