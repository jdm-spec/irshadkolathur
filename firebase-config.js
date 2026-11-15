/* ============================================================
   FIREBASE CONFIGURATION & SERVICE HANDLERS
   Irshad Kolathur — Portfolio & Admin
   Supports both Firebase Realtime Database & Firestore
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyDicVCPXh3CQmQR5ELRSafEMCQcmKBNYmI",
  authDomain: "irshad-portfolio-c3009.firebaseapp.com",
  databaseURL: "https://irshad-portfolio-c3009-default-rtdb.firebaseio.com",
  projectId: "irshad-portfolio-c3009",
  storageBucket: "irshad-portfolio-c3009.firebasestorage.app",
  messagingSenderId: "742027853978",
  appId: "1:742027853978:web:bd13d2ac17a5d753275f23"
};

// Global Firebase instance references
let firebaseApp = null;
let firestoreDb = null;
let realTimeDb = null;
let firebaseAuth = null;
let firebaseAnalytics = null;
let isFirebaseConfigured = false;

/**
 * Initialize Firebase services
 */
function initFirebase() {
  if (typeof firebase === "undefined") {
    console.warn("[Firebase] Firebase SDK is not loaded. Ensure Firebase CDN scripts are included in index.html.");
    return false;
  }

  // Check if credentials are valid
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("YOUR_")) {
    console.info(
      "%c[Firebase] Running in offline / fallback mode.%c\nTo connect your live database, replace placeholder credentials in 'firebase-config.js'.",
      "color: #f59e0b; font-weight: bold;",
      "color: inherit;"
    );
    return false;
  }

  try {
    if (!firebase.apps.length) {
      firebaseApp = firebase.initializeApp(firebaseConfig);
    } else {
      firebaseApp = firebase.app();
    }

    // 1. Initialize Realtime Database
    if (firebase.database) {
      try {
        realTimeDb = firebase.database();
      } catch (rtdbErr) {
        console.warn("[Firebase] Realtime Database note:", rtdbErr.message);
      }
    }

    // 2. Initialize Firestore
    if (firebase.firestore) {
      try {
        firestoreDb = firebase.firestore();
      } catch (fsErr) {
        console.warn("[Firebase] Firestore note:", fsErr.message);
      }
    }

    // 3. Initialize Auth
    if (firebase.auth) {
      try {
        firebaseAuth = firebase.auth();
      } catch (authErr) {
        console.warn("[Firebase] Auth note:", authErr.message);
      }
    }

    // 4. Initialize Analytics if supported
    if (firebase.analytics && firebaseConfig.measurementId && !firebaseConfig.measurementId.includes("YOUR_")) {
      try {
        firebaseAnalytics = firebase.analytics();
      } catch (_) {}
    }

    isFirebaseConfigured = true;
    console.log(`%c[Firebase] Connected successfully to project: "${firebaseConfig.projectId}"`, "color: #10b981; font-weight: bold;");
    return true;
  } catch (err) {
    console.error("[Firebase] Initialization error:", err);
    return false;
  }
}

/**
 * Save contact form inquiry to Firebase ('messages' collection / node)
 * @param {Object} data - { name, contact, type, budget, details }
 * @returns {Promise<{success: boolean, id?: string, fallback?: boolean, error?: any}>}
 */
async function saveContactInquiry(data) {
  if (!isFirebaseConfigured) {
    console.info("[Firebase] Inquiry processed locally (Firebase not configured).");
    return { success: false, fallback: true, reason: "Firebase credentials not configured" };
  }

  const payload = {
    name: (data.name || "").trim(),
    contact: (data.contact || "").trim(),
    projectType: (data.type || "General Inquiry").trim(),
    budget: (data.budget || "Not sure yet").trim(),
    details: (data.details || "").trim(),
    status: "new",
    clientTimestamp: new Date().toISOString(),
    createdAt: Date.now(),
    source: "portfolio_contact_form"
  };

  try {
    // 1. Try Realtime Database first (as in portfolio-database.json)
    if (realTimeDb) {
      const newRef = realTimeDb.ref("messages").push();
      await newRef.set(payload);
      console.log("[Firebase] Message saved to Realtime Database with ID:", newRef.key);
      return { success: true, id: newRef.key, type: "realtime" };
    }

    // 2. Fallback to Firestore
    if (firestoreDb) {
      const fsPayload = {
        ...payload,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      const docRef = await firestoreDb.collection("messages").add(fsPayload);
      console.log("[Firebase] Message saved to Firestore with ID:", docRef.id);
      return { success: true, id: docRef.id, type: "firestore" };
    }

    throw new Error("Neither Realtime Database nor Firestore is active.");
  } catch (err) {
    console.error("[Firebase] Failed to write message to Firebase:", err);
    return { success: false, error: err };
  }
}

/**
 * Fetch portfolio projects & posters from Firebase
 * Checks Realtime Database '/projects' first, then Firestore 'projects' / 'works'
 * @returns {Promise<Array|null>}
 */
async function fetchPortfolioWorks() {
  if (!isFirebaseConfigured) {
    return null; // Return null to use local default WORKS
  }

  const items = [];

  // 1. Try Realtime Database (/projects)
  if (realTimeDb) {
    try {
      const snapshot = await realTimeDb.ref("projects").once("value");
      if (snapshot.exists()) {
        const val = snapshot.val();
        Object.keys(val).forEach(key => {
          const d = val[key];
          if (d) {
            items.push({
              id: key,
              source: "realtime",
              title: d.title || "Untitled",
              category: d.category || "web",
              format: d.format || (d.category === "design" || d.category === "print" ? "poster" : "landscape"),
              label: d.label || "",
              year: String(d.year || new Date().getFullYear()),
              image: d.image || "",
              art: d.art || "linear-gradient(135deg,#1c1c1c,#3a0d10)",
              mark: d.mark || "IK",
              link: d.link || "",
              order: Number(d.order || 99),
              createdAt: d.createdAt || 0
            });
          }
        });
        if (items.length > 0) {
          items.sort((a, b) => (a.order || 99) - (b.order || 99));
          console.log(`[Firebase] Loaded ${items.length} items from Realtime Database.`);
          return items;
        }
      }
    } catch (rtdbErr) {
      console.warn("[Firebase] Realtime Database fetch note:", rtdbErr.message);
    }
  }

  // 2. Try Firestore ('projects' or 'works')
  if (firestoreDb) {
    try {
      let snapshot = null;
      try {
        snapshot = await firestoreDb.collection("projects").orderBy("order", "asc").get();
      } catch (_) {
        try { snapshot = await firestoreDb.collection("projects").get(); } catch (_) {}
      }

      if (!snapshot || snapshot.empty) {
        try {
          snapshot = await firestoreDb.collection("works").orderBy("order", "asc").get();
        } catch (_) {
          try { snapshot = await firestoreDb.collection("works").get(); } catch (_) {}
        }
      }

      if (snapshot && !snapshot.empty) {
        snapshot.forEach(doc => {
          const d = doc.data();
          items.push({
            id: doc.id,
            source: "firestore",
            title: d.title || "Untitled",
            category: d.category || "web",
            format: d.format || (d.category === "design" || d.category === "print" ? "poster" : "landscape"),
            label: d.label || "",
            year: String(d.year || new Date().getFullYear()),
            image: d.image || "",
            art: d.art || "linear-gradient(135deg,#1c1c1c,#3a0d10)",
            mark: d.mark || "IK",
            link: d.link || "",
            order: Number(d.order || 99)
          });
        });
        items.sort((a, b) => (a.order || 99) - (b.order || 99));
        console.log(`[Firebase] Loaded ${items.length} items from Firestore.`);
        return items;
      }
    } catch (fsErr) {
      console.warn("[Firebase] Firestore fetch note:", fsErr.message);
    }
  }

  return null;
}

/**
 * Upload a new project or poster to Firebase
 * @param {Object} itemData - { title, category, label, year, image, mark, art, link, order }
 * @returns {Promise<{success: boolean, id: string, source: string}>}
 */
async function uploadProjectToFirebase(itemData) {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase is not configured. Please add your Firebase credentials in firebase-config.js.");
  }

  const payload = {
    title: (itemData.title || "").trim(),
    category: itemData.category || "design",
    format: itemData.format || (itemData.category === "design" || itemData.category === "print" ? "poster" : "landscape"),
    label: (itemData.label || "").trim(),
    year: String(itemData.year || new Date().getFullYear()),
    image: (itemData.image || "").trim(),
    mark: (itemData.mark || "Ps").trim(),
    art: itemData.art || "linear-gradient(135deg,#2a0a0c,#E52B32)",
    link: (itemData.link || "").trim(),
    order: Number(itemData.order || 1),
    createdAt: Date.now()
  };

  // 1. Write to Realtime Database if active
  if (realTimeDb) {
    const newRef = realTimeDb.ref("projects").push();
    await newRef.set(payload);
    console.log("%c[Firebase] Project uploaded to Realtime Database with ID:", "color: #10b981; font-weight: bold;", newRef.key);
    return { success: true, id: newRef.key, source: "realtime" };
  }

  // 2. Otherwise write to Firestore
  if (firestoreDb) {
    const fsPayload = {
      ...payload,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    const docRef = await firestoreDb.collection("projects").add(fsPayload);
    console.log("%c[Firebase] Project uploaded to Firestore with ID:", "color: #10b981; font-weight: bold;", docRef.id);
    return { success: true, id: docRef.id, source: "firestore" };
  }

  throw new Error("No active Firebase database found. Please check your configuration.");
}

/**
 * Delete a project or poster from Firebase
 * @param {string} id - Project ID
 * @param {string} source - 'realtime' | 'firestore'
 */
async function deleteProjectFromFirebase(id, source = "realtime") {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase is not configured.");
  }

  if (source === "realtime" && realTimeDb) {
    await realTimeDb.ref("projects/" + id).remove();
    console.log("[Firebase] Removed project from Realtime Database:", id);
    return true;
  }

  if (firestoreDb) {
    try {
      await firestoreDb.collection("projects").doc(id).delete();
    } catch (_) {
      await firestoreDb.collection("works").doc(id).delete();
    }
    console.log("[Firebase] Removed project from Firestore:", id);
    return true;
  }

  // Fallback try both
  if (realTimeDb) await realTimeDb.ref("projects/" + id).remove();
  if (firestoreDb) await firestoreDb.collection("projects").doc(id).delete().catch(() => {});
  return true;
}

/**
 * Fetch all contact form inquiries from Firebase
 * @returns {Promise<Array>}
 */
async function fetchContactMessages() {
  if (!isFirebaseConfigured) return [];
  const messages = [];

  // Realtime Database
  if (realTimeDb) {
    try {
      const snap = await realTimeDb.ref("messages").once("value");
      if (snap.exists()) {
        const val = snap.val();
        Object.keys(val).forEach(key => {
          messages.push({ id: key, source: "realtime", ...val[key] });
        });
        messages.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        return messages;
      }
    } catch (_) {}
  }

  // Firestore
  if (firestoreDb) {
    try {
      const snap = await firestoreDb.collection("messages").orderBy("createdAt", "desc").get();
      snap.forEach(doc => {
        messages.push({ id: doc.id, source: "firestore", ...doc.data() });
      });
      return messages;
    } catch (_) {}
  }

  return messages;
}

/**
 * Helper to seed initial sample projects to Firebase
 */
async function seedPortfolioWorks(customWorks = null) {
  if (!isFirebaseConfigured) {
    const errorMsg = "Firebase is not configured yet. Please check credentials in 'firebase-config.js'.";
    console.error("[Firebase]", errorMsg);
    alert(errorMsg);
    return false;
  }

  const items = customWorks || (typeof WORKS !== "undefined" ? WORKS : []);
  if (!items.length) {
    console.warn("[Firebase] No projects found to seed.");
    return false;
  }

  try {
    if (realTimeDb) {
      console.log(`[Firebase] Seeding ${items.length} projects to Realtime Database '/projects'...`);
      const updates = {};
      items.forEach((item, index) => {
        const newKey = realTimeDb.ref("projects").push().key;
        updates["projects/" + newKey] = {
          title: item.title,
          category: item.category,
          label: item.label,
          year: item.year || "2026",
          art: item.art || "linear-gradient(135deg,#1c1c1c,#3a0d10)",
          mark: item.mark || "IK",
          image: item.image || "",
          link: item.link || "",
          order: index + 1,
          createdAt: Date.now()
        };
      });
      await realTimeDb.ref().update(updates);
    } else if (firestoreDb) {
      console.log(`[Firebase] Seeding ${items.length} projects to Firestore 'projects' collection...`);
      const batch = firestoreDb.batch();
      const col = firestoreDb.collection("projects");
      items.forEach((item, index) => {
        const docRef = col.doc();
        batch.set(docRef, {
          title: item.title,
          category: item.category,
          label: item.label,
          year: item.year || "2026",
          art: item.art || "linear-gradient(135deg,#1c1c1c,#3a0d10)",
          mark: item.mark || "IK",
          image: item.image || "",
          link: item.link || "",
          order: index + 1,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      });
      await batch.commit();
    }

    console.log("%c[Firebase] Successfully seeded projects!", "color: #10b981; font-weight: bold;");
    alert(`Success! Seeded ${items.length} projects to Firebase.`);
    
    if (typeof loadPortfolioWorks === "function") {
      loadPortfolioWorks();
    }
    return true;
  } catch (err) {
    console.error("[Firebase] Error seeding works:", err);
    alert("Error seeding works: " + err.message);
    return false;
  }
}

/**
 * Returns current Firebase connection status
 */
function getFirebaseStatus() {
  return {
    configured: isFirebaseConfigured,
    projectId: isFirebaseConfigured ? firebaseConfig.projectId : null,
    hasRealtimeDb: !!realTimeDb,
    hasFirestore: !!firestoreDb,
    hasAuth: !!firebaseAuth,
    hasAnalytics: !!firebaseAnalytics
  };
}

// Auto-initialize when script loads
initFirebase();

// Expose utilities on window object for easy access
window.firebaseConfig = firebaseConfig;
window.initFirebase = initFirebase;
window.saveContactInquiry = saveContactInquiry;
window.fetchPortfolioWorks = fetchPortfolioWorks;
window.uploadProjectToFirebase = uploadProjectToFirebase;
window.deleteProjectFromFirebase = deleteProjectFromFirebase;
window.fetchContactMessages = fetchContactMessages;
window.seedPortfolioWorks = seedPortfolioWorks;
window.getFirebaseStatus = getFirebaseStatus;
