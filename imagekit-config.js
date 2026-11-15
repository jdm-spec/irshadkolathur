/* ============================================================
   IMAGEKIT CONFIGURATION & OPTIMIZATION HELPERS
   Irshad Kolathur — Portfolio & Admin
   ============================================================ */

/**
 * 1. Replace YOUR_IMAGEKIT_ID with your ImageKit ID from https://imagekit.io/dashboard
 *    Example: urlEndpoint: "https://ik.imagekit.io/irshadk"
 * 2. If you want to upload posters/images directly from the Admin Panel,
 *    add your privateKey and publicKey below from Developer Options -> API Keys.
 */
const IMAGEKIT_CONFIG = {
  urlEndpoint: "https://ik.imagekit.io/irshadklr",
  publicKey: "public_ofYXicnU3zHodSRVPXkuzTAqAgw=",     // Found in ImageKit Developer Options
  privateKey: "private_OintxF0RTYPGNdB4m6/sGGbw3eI=",   // Used for direct uploads in Admin Panel
  defaultQuality: 85,
  defaultFormat: "auto"                      // Delivers WebP/AVIF automatically based on browser support
};

let imagekitInstance = null;
let isImageKitConfigured = false;

/**
 * Checks whether ImageKit has been configured with real credentials
 */
function checkImageKitConfig() {
  const endpoint = (IMAGEKIT_CONFIG.urlEndpoint || "").trim();
  isImageKitConfigured = !!endpoint && !endpoint.includes("YOUR_IMAGEKIT_ID");

  if (!isImageKitConfigured) {
    console.info(
      "%c[ImageKit] Running in local image mode.%c\nTo enable high-speed CDN & auto WebP compression, replace YOUR_IMAGEKIT_ID in 'imagekit-config.js'.",
      "color: #3b82f6; font-weight: bold;",
      "color: inherit;"
    );
    return false;
  }

  // Initialize ImageKit JavaScript SDK if available
  if (typeof ImageKit !== "undefined") {
    try {
      imagekitInstance = new ImageKit({
        urlEndpoint: endpoint,
        publicKey: IMAGEKIT_CONFIG.publicKey && IMAGEKIT_CONFIG.publicKey !== "YOUR_IMAGEKIT_PUBLIC_KEY"
          ? IMAGEKIT_CONFIG.publicKey
          : undefined
      });
    } catch (e) {
      console.warn("[ImageKit] SDK initialization note:", e.message);
    }
  }

  console.log(`%c[ImageKit] Connected to endpoint: "${endpoint}"`, "color: #10b981; font-weight: bold;");
  return true;
}

/**
 * Generates an optimized ImageKit transformation URL
 * 
 * @param {string} src - Image path (e.g. "image 1.png", "projects/admin.png") or external URL
 * @param {Object} options - Transformation options:
 *   - width: number (e.g. 720)
 *   - height: number (e.g. 450)
 *   - quality: number (default 85)
 *   - format: "auto" | "webp" | "avif" | "png" | "jpg"
 *   - crop: "maintain_ratio" | "force" | "at_least" | "at_max"
 *   - focus: "auto" | "face" | "center"
 *   - blur: number (e.g. 10 for blurred placeholder)
 * @returns {string} - Optimized URL or original src if ImageKit is unconfigured
 */
function getImageKitUrl(src, options = {}) {
  if (!src) return "";

  // If ImageKit is not configured, safely return original source
  if (!isImageKitConfigured) {
    return src;
  }

  const endpoint = IMAGEKIT_CONFIG.urlEndpoint.replace(/\/+$/, "");

  // Build transformation array
  const tr = [];
  if (options.width) tr.push(`w-${options.width}`);
  if (options.height) tr.push(`h-${options.height}`);

  const q = options.quality || IMAGEKIT_CONFIG.defaultQuality;
  if (q) tr.push(`q-${q}`);

  const f = options.format || IMAGEKIT_CONFIG.defaultFormat;
  if (f) tr.push(`f-${f}`);

  if (options.crop) tr.push(`c-${options.crop}`);
  if (options.focus) tr.push(`fo-${options.focus}`);
  if (options.blur) tr.push(`bl-${options.blur}`);
  if (options.aspectRatio) tr.push(`ar-${options.aspectRatio.replace("/", "-")}`);

  const trParam = tr.length ? `tr:${tr.join(",")}` : "";

  // 1. If already an ImageKit URL from our endpoint
  if (src.startsWith(endpoint)) {
    const withoutEndpoint = src.substring(endpoint.length).replace(/^\/+/, "");
    // Remove existing tr: if any
    const cleanPath = withoutEndpoint.replace(/^tr:[^/]+\//, "");
    return trParam ? `${endpoint}/${trParam}/${cleanPath}` : `${endpoint}/${cleanPath}`;
  }

  // 2. If it's an external web URL (ImageKit web proxy/origin fetch)
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return trParam ? `${endpoint}/${trParam}/${src}` : `${endpoint}/${src}`;
  }

  // 3. Local relative path (e.g. "image 1.png" or "projects/app.jpg")
  const cleanPath = encodeURI(src.replace(/^\/+/, ""));
  return trParam ? `${endpoint}/${trParam}/${cleanPath}` : `${endpoint}/${cleanPath}`;
}

/**
 * Generates an ultra-lightweight blurred preview (LQIP) for progressive loading
 * @param {string} src 
 * @returns {string}
 */
function getImageKitPlaceholder(src) {
  return getImageKitUrl(src, {
    width: 60,
    blur: 6,
    quality: 20,
    format: "auto"
  });
}

/**
 * Optimizes the Hero portrait image using ImageKit
 */
function applyImageKitHero() {
  if (!isImageKitConfigured) return;

  const heroImg = document.querySelector(".portrait-image");
  if (!heroImg) return;

  const originalSrc = heroImg.getAttribute("data-ik-src") || heroImg.getAttribute("src") || "image 1.png";

  // Deliver an 800px auto WebP/AVIF compressed image
  const optimizedUrl = getImageKitUrl(originalSrc, {
    width: 800,
    quality: 85,
    format: "auto",
    crop: "maintain_ratio"
  });

  heroImg.src = optimizedUrl;
  console.log("[ImageKit] Optimized hero portrait delivered via ImageKit CDN.");
}

/**
 * Uploads an image file directly to ImageKit using ImageKit Upload API
 * 
 * @param {File|Blob|string} file - File object from <input type="file"> or base64 string
 * @param {Object} options - Upload options:
 *   - fileName: string (e.g. "poster-event.png")
 *   - folder: string (e.g. "/posters" or "/projects")
 *   - tags: string | Array (e.g. "poster,photoshop")
 *   - privateKey: optional override of private key
 * @returns {Promise<{success: boolean, url: string, filePath: string, fileId: string, name: string}>}
 */
async function uploadImageToImageKit(file, options = {}) {
  const endpoint = (IMAGEKIT_CONFIG.urlEndpoint || "").replace(/\/+$/, "");
  const privateKey = (options.privateKey || IMAGEKIT_CONFIG.privateKey || "").trim();

  if (!endpoint || endpoint.includes("YOUR_IMAGEKIT_ID")) {
    throw new Error("ImageKit endpoint is not configured. Please set your URL endpoint in imagekit-config.js.");
  }

  if (!privateKey || privateKey === "YOUR_IMAGEKIT_PRIVATE_KEY") {
    throw new Error("ImageKit Private Key is required to upload files. Enter your private key in imagekit-config.js or in the upload form.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const fileName = options.fileName || (file.name ? file.name : `item-${Date.now()}`);
  formData.append("fileName", fileName);

  const folder = options.folder || "/portfolio";
  formData.append("folder", folder);
  formData.append("useUniqueFileName", "true");

  if (options.tags) {
    formData.append("tags", Array.isArray(options.tags) ? options.tags.join(",") : options.tags);
  }

  const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${btoa(privateKey + ":")}`
    },
    body: formData
  });

  if (!response.ok) {
    let errMessage = `ImageKit upload failed with HTTP status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.message) {
        errMessage = errJson.message;
      }
    } catch (_) { }
    throw new Error(errMessage);
  }

  const result = await response.json();
  console.log("%c[ImageKit] File successfully uploaded to ImageKit CDN!", "color: #10b981; font-weight: bold;", result);

  return {
    success: true,
    url: result.url,
    filePath: result.filePath,
    fileId: result.fileId,
    name: result.name,
    thumbnailUrl: result.thumbnailUrl
  };
}

/**
 * Get current ImageKit status
 */
function getImageKitStatus() {
  return {
    configured: isImageKitConfigured,
    urlEndpoint: isImageKitConfigured ? IMAGEKIT_CONFIG.urlEndpoint : null,
    hasPrivateKey: !!IMAGEKIT_CONFIG.privateKey && IMAGEKIT_CONFIG.privateKey !== "YOUR_IMAGEKIT_PRIVATE_KEY",
    sdkLoaded: typeof ImageKit !== "undefined",
    instanceActive: !!imagekitInstance
  };
}

// Auto-check configuration
checkImageKitConfig();

// Apply hero optimization once DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", applyImageKitHero);
} else {
  applyImageKitHero();
}

// Expose utilities on window object
window.IMAGEKIT_CONFIG = IMAGEKIT_CONFIG;
window.checkImageKitConfig = checkImageKitConfig;
window.getImageKitUrl = getImageKitUrl;
window.getImageKitPlaceholder = getImageKitPlaceholder;
window.uploadImageToImageKit = uploadImageToImageKit;
window.applyImageKitHero = applyImageKitHero;
window.getImageKitStatus = getImageKitStatus;
