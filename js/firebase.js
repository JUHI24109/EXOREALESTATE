// Firebase Configuration and Functions
// Setup: 1. Create Firebase project at console.firebase.google.com
// 2. Enable Firestore + Authentication
// 3. Replace config below with your project's config
// 4. Add CDN to HTML: <script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js"></script>

// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_PROJECT_ID.appspot.com",
//   messagingSenderId: "123456789",
//   appId: "1:123456789:web:abcdef123456"
// };
window.firebaseConfig = {
  apiKey: "AIzaSyDiTKco4f0peQiLBzuEYW_nkhUB9MXu_tU",
  authDomain: "exo-real-estate.firebaseapp.com",
  projectId: "exo-real-estate",
  storageBucket: "exo-real-estate.firebasestorage.app",
  messagingSenderId: "372926410477",
  appId: "1:372926410477:web:16c5ad92638139391ea6e4",
  measurementId: "G-VRJ77R5CYG"
};

// Cloudinary runtime config (single source, no localStorage fallback)
window.CLOUDINARY_CLOUD_NAME = String(window.CLOUDINARY_CLOUD_NAME || "diqoutvqt").trim();
window.CLOUDINARY_UPLOAD_PRESET = String(window.CLOUDINARY_UPLOAD_PRESET || "exo_properties").trim();

// Init (guard against duplicate initialization)
let db;
let auth;
if (typeof firebase !== 'undefined') {
  if (!firebase.apps || !firebase.apps.length) {
    firebase.initializeApp(window.firebaseConfig);
  }
  db = firebase.firestore();
  try {
    if (firebase.firestore && typeof firebase.firestore.CACHE_SIZE_UNLIMITED !== 'undefined') {
      db.settings({ cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED });
    }
  } catch (_) {
    // Ignore settings errors when Firestore was already initialized elsewhere.
  }

  if (!window.__exoFirestorePersistenceInit && db && typeof db.enablePersistence === 'function') {
    window.__exoFirestorePersistenceInit = true;
    db.enablePersistence({ synchronizeTabs: true }).catch(function () {
      // Persistence can fail in some browser modes; app should continue online-only.
    });
  }

  window.db = db;

  if (firebase.auth) {
    window.auth = firebase.auth();
    auth = window.auth;
  }
}

window.__exoPropertiesCache = window.__exoPropertiesCache || [];
window.__exoPropertiesLoadedAt = window.__exoPropertiesLoadedAt || 0;
window.__exoUserRoleCache = window.__exoUserRoleCache || null;

function upsertPropertyCache(docId, payload) {
  const normalizedId = String(docId || (payload && payload.id) || '').trim();
  if (!normalizedId) return;
  const cache = Array.isArray(window.__exoPropertiesCache) ? window.__exoPropertiesCache.slice() : [];
  const item = {
    id: normalizedId,
    __docId: normalizedId,
    ...(payload || {})
  };
  const idx = cache.findIndex((p) => String((p && (p.__docId || p.id)) || '') === normalizedId);
  if (idx >= 0) {
    cache[idx] = { ...(cache[idx] || {}), ...item };
  } else {
    cache.unshift(item);
  }
  window.__exoPropertiesCache = cache;
  window.__exoPropertiesLoadedAt = Date.now();
}

function removePropertyFromCache(docId) {
  const normalizedId = String(docId || '').trim();
  if (!normalizedId) return;
  const cache = Array.isArray(window.__exoPropertiesCache) ? window.__exoPropertiesCache : [];
  window.__exoPropertiesCache = cache.filter((p) => String((p && (p.__docId || p.id)) || '') !== normalizedId);
  window.__exoPropertiesLoadedAt = Date.now();
}

async function getCurrentUserRole() {
  try {
    if (!auth || !auth.currentUser || !db) return null;
    const uid = auth.currentUser.uid;
    if (window.__exoUserRoleCache && window.__exoUserRoleCache.uid === uid) {
      return window.__exoUserRoleCache.role;
    }
    const snap = await db.collection('users').doc(uid).get();
    const role = snap.exists ? (snap.data().role || null) : null;
    window.__exoUserRoleCache = { uid: uid, role: role };
    return role;
  } catch (e) {
    return null;
  }
}

function canManageProperties(role) {
  return role === 'admin' || role === 'agent' || role === 'dealer';
}

window.loadPropertiesFromFirebase = async function() {
  try {
    if (!db) return null;
    const snapshot = await db.collection('properties').get();

    const loadedProps = snapshot.docs.map(doc => {
      const data = doc.data() || {};
      return {
        id: data.id || doc.id,
        __docId: doc.id,
        ...data
      };
    });

    window.__exoPropertiesCache = loadedProps;
    window.__exoPropertiesLoadedAt = Date.now();
    return loadedProps;
  } catch (error) {
    console.error('Load properties error:', error);
    return null;
  }
};

window.getPropertiesFromFirestore = async function(forceRefresh) {
  const freshMs = 60 * 1000;
  if (!forceRefresh && Array.isArray(window.__exoPropertiesCache) && window.__exoPropertiesCache.length && (Date.now() - window.__exoPropertiesLoadedAt) < freshMs) {
    return window.__exoPropertiesCache;
  }
  const data = await window.loadPropertiesFromFirebase();
  return Array.isArray(data) ? data : [];
};

window.addPropertyToFirebase = async function(propData) {
  try {
    if (!db || !auth || !auth.currentUser) throw new Error('Authentication required');
    const role = await getCurrentUserRole();
    if (!canManageProperties(role)) throw new Error('Not authorized to add properties');

    const normalized = {
      ...propData,
      id: propData && propData.id ? String(propData.id) : '',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    let docRefId;
    if (normalized.id) {
      docRefId = normalized.id;
      await db.collection('properties').doc(docRefId).set(normalized, { merge: true });
    } else {
      const docRef = await db.collection('properties').add(normalized);
      docRefId = docRef.id;
      await db.collection('properties').doc(docRefId).set({ id: docRefId }, { merge: true });
    }
    upsertPropertyCache(docRefId, { ...normalized, id: docRefId });
    return docRefId;
  } catch (error) {
    console.error('Add property error:', error);
    throw error;
  }
};

window.deletePropertyFromFirebase = async function(propId) {
  try {
    if (!db || !auth || !auth.currentUser) throw new Error('Authentication required');
    const role = await getCurrentUserRole();
    if (!canManageProperties(role)) throw new Error('Not authorized to delete properties');
    const normalizedId = String(propId || '').trim();
    await db.collection('properties').doc(normalizedId).delete();
    removePropertyFromCache(normalizedId);
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};

