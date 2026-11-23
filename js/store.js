/* ==========================================================================
   NAILS SALON PRO — PERSISTENT DATA STORE & ROLE GUARD
   - IndexedDB primary storage (handles uploaded images smoothly)
   - LocalStorage fallback + BroadcastChannel live tab sync
   - Image compression helper via Canvas
   - Explicit Role Permission Matrix (Admin vs Staff)
   ========================================================================== */

(function (global) {
  'use strict';

  const DB_NAME = 'LumiereNailSalonDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'app_state';
  const STATE_KEY = 'salon_data_v1';
  const LS_BACKUP_KEY = 'lumiere_salon_backup_v1';
  const LS_SYNC_KEY = 'lumiere_salon_sync_ping';
  const AUTH_KEY = 'lumiere_salon_auth_v1';

  const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('lumiere_salon_channel') : null;

  // Permission Matrix (Prototype Guard — mirrors planned G4 Supabase RLS)
  const PERMISSIONS = {
    admin: new Set([
      'view:dashboard',
      'edit:site_info',
      'edit:hero_image',
      'edit:about_image',
      'add:menu',
      'edit:menu_text',
      'edit:menu_price',
      'edit:menu_image',
      'delete:menu',
      'add:gallery',
      'edit:gallery_text',
      'edit:gallery_image',
      'delete:gallery',
      'manage:bookings',
      'manage:callbacks',
      'manage:messages',
      'reset:data'
    ]),
    staff: new Set([
      'view:dashboard',
      'edit:hero_image',
      'edit:about_image',
      'edit:menu_price',
      'edit:menu_image',
      'edit:gallery_image'
    ])
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function openDB() {
    return new Promise((resolve, reject) => {
      if (!global.indexedDB) {
        reject(new Error('IndexedDB unavailable'));
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbGet() {
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(STATE_KEY);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  }

  async function idbSet(data) {
    try {
      const db = await openDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(data, STATE_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      return true;
    } catch {
      return false;
    }
  }

  function mergeDefaults(saved) {
    const def = clone(global.NAIL_SALON_DEFAULTS);
    if (!saved || typeof saved !== 'object') return def;
    return {
      ...def,
      ...saved,
      site: { ...def.site, ...(saved.site || {}) },
      menu: Array.isArray(saved.menu) ? saved.menu : def.menu,
      gallery: Array.isArray(saved.gallery) ? saved.gallery : def.gallery,
      bookings: Array.isArray(saved.bookings) ? saved.bookings : def.bookings,
      callbacks: Array.isArray(saved.callbacks) ? saved.callbacks : def.callbacks,
      messages: Array.isArray(saved.messages) ? saved.messages : def.messages
    };
  }

  function notifySync() {
    const ts = String(Date.now());
    try {
      localStorage.setItem(LS_SYNC_KEY, ts);
    } catch {
      // ignore quota error
    }
    if (channel) {
      channel.postMessage({ type: 'DATA_UPDATED', ts });
    }
  }

  const NailStore = {
    async load() {
      const fromIDB = await idbGet();
      if (fromIDB) return mergeDefaults(fromIDB);
      try {
        const fromLS = localStorage.getItem(LS_BACKUP_KEY);
        if (fromLS) return mergeDefaults(JSON.parse(fromLS));
      } catch {
        // ignore parse errors
      }
      const def = clone(global.NAIL_SALON_DEFAULTS);
      await this.save(def, false);
      return def;
    },

    async save(data, broadcast = true) {
      data.updatedAt = new Date().toISOString();
      const ok = await idbSet(data);
      // Best-effort lightweight mirror to localStorage (skip if too big for 5MB quota)
      try {
        const serialized = JSON.stringify(data);
        if (serialized.length < 3500000) {
          localStorage.setItem(LS_BACKUP_KEY, serialized);
        }
      } catch {
        // IndexedDB holds large uploaded images safely
      }
      if (broadcast) notifySync();
      return ok;
    },

    async reset(role) {
      this.assertPermission(role, 'reset:data');
      const fresh = clone(global.NAIL_SALON_DEFAULTS);
      await this.save(fresh, true);
      return fresh;
    },

    subscribe(callback) {
      const onStorage = (e) => {
        if (e.key === LS_SYNC_KEY) callback();
      };
      window.addEventListener('storage', onStorage);
      if (channel) {
        channel.onmessage = (e) => {
          if (e.data && e.data.type === 'DATA_UPDATED') callback();
        };
      }
      return () => {
        window.removeEventListener('storage', onStorage);
      };
    },

    // Public Guest actions (allowed without login)
    async addBooking(bookingPayload) {
      const data = await this.load();
      const conflict = data.bookings.some(
        (b) =>
          b.date === bookingPayload.date &&
          b.time === bookingPayload.time &&
          b.status !== 'Cancelled'
      );
      if (conflict) {
        const err = new Error('Selected time slot is already booked for this date.');
        err.code = 409;
        throw err;
      }
      const id = 'BK-' + Math.floor(1000 + Math.random() * 9000);
      const record = {
        id,
        ...bookingPayload,
        status: 'Confirmed',
        createdAt: new Date().toISOString()
      };
      data.bookings.unshift(record);
      await this.save(data, true);
      return record;
    },

    async addCallback(payload) {
      const data = await this.load();
      const record = {
        id: 'CB-' + Math.floor(100 + Math.random() * 900),
        ...payload,
        status: 'New',
        createdAt: new Date().toISOString()
      };
      data.callbacks.unshift(record);
      await this.save(data, true);
      return record;
    },

    async addMessage(payload) {
      const data = await this.load();
      const record = {
        id: 'MSG-' + Math.floor(100 + Math.random() * 900),
        ...payload,
        createdAt: new Date().toISOString()
      };
      data.messages.unshift(record);
      await this.save(data, true);
      return record;
    },

    // Role & Auth helpers (Prototype Local Auth)
    getSession() {
      try {
        const raw = sessionStorage.getItem(AUTH_KEY) || localStorage.getItem(AUTH_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    },

    login(username, password) {
      const u = String(username || '').trim().toLowerCase();
      const p = String(password || '').trim();
      if (u === 'admin' && p === 'admin123') {
        const sess = { role: 'admin', name: 'Salon Owner (Admin)', username: 'admin', loggedInAt: Date.now() };
        sessionStorage.setItem(AUTH_KEY, JSON.stringify(sess));
        localStorage.setItem(AUTH_KEY, JSON.stringify(sess));
        return sess;
      }
      if (u === 'staff' && p === 'staff123') {
        const sess = { role: 'staff', name: 'Salon Staff (Images & Prices)', username: 'staff', loggedInAt: Date.now() };
        sessionStorage.setItem(AUTH_KEY, JSON.stringify(sess));
        localStorage.setItem(AUTH_KEY, JSON.stringify(sess));
        return sess;
      }
      const err = new Error('Invalid credentials. Use admin/admin123 or staff/staff123.');
      err.code = 401;
      throw err;
    },

    logout() {
      sessionStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(AUTH_KEY);
    },

    can(role, action) {
      return Boolean(role && PERMISSIONS[role] && PERMISSIONS[role].has(action));
    },

    assertPermission(role, action) {
      if (!this.can(role, action)) {
        const err = new Error(
          `403 Forbidden: Role "${role || 'guest'}" does not have permission for "${action}". Admin privileges required.`
        );
        err.code = 403;
        throw err;
      }
    },

    // Image upload compressor (returns crisp WebP/JPEG data URL)
    compressImageFile(file, maxWidth = 1100, quality = 0.82) {
      return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
          reject(new Error('Please select a valid image file (JPG, PNG, WebP).'));
          return;
        }
        if (file.size > 15 * 1024 * 1024) {
          reject(new Error('Image file is too large (max 15MB).'));
          return;
        }
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Failed to read image file.'));
        reader.onload = () => {
          const img = new Image();
          img.onerror = () => reject(new Error('Invalid image format.'));
          img.onload = () => {
            let { width, height } = img;
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(dataUrl);
          };
          img.src = reader.result;
        };
        reader.readAsDataURL(file);
      });
    },

    formatMoney(amount) {
      const n = Number(amount);
      if (Number.isNaN(n)) return '$0';
      return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
    }
  };

  global.NailStore = NailStore;
})(window);
