
import { db } from "./firebase-config.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

async function testFirebase() {
  try {
    const snapshot = await get(ref(db, "/"));

    console.log("Firebase connected successfully!");
    console.log("Database data:", snapshot.val());

  } catch (error) {
    console.error("Firebase connection failed:", error);
  }
}

testFirebase();
