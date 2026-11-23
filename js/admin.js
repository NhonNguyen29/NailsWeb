/* ==========================================================================
   NAILS SALON PRO — ADMIN & STAFF PORTAL CONTROLLER
   - Admin: Full CRUD (Site Info & Text, Menu, Gallery, Bookings, Callbacks, Messages)
   - Staff: Strictly Images & Prices ONLY (enforced via NailStore.assertPermission)
   ========================================================================== */

(function (global) {
  'use strict';

  let session = null;
  let data = null;
  let activeTab = 'tab-overview';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function toast(msg, type = 'info') {
    const wrap = $('#toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }

  function isAdmin() {
    return session && session.role === 'admin';
  }

  function render403(featureName) {
    return `
      <div class="forbidden-box">
        <div style="font-size:2.8rem;">🔒</div>
        <h2>403 Forbidden — Admin Only</h2>
        <p>
          Your current role (<strong>Staff</strong>) does not have permission to access <strong>${esc(featureName)}</strong>.
          Staff accounts are limited to updating <strong>Images</strong> and <strong>Service Prices</strong>.
        </p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          <button type="button" class="btn btn-primary" data-jump="tab-menu">Go to Menu Prices &amp; Photos</button>
          <button type="button" class="btn btn-outline" data-jump="tab-gallery">Go to Gallery Photos</button>
        </div>
      </div>
    `;
  }

  /* ---------------- TAB 1: OVERVIEW & BOOKINGS ---------------- */
  function renderOverviewTab() {
    const container = $('#tab-overview');
    if (!isAdmin()) {
      container.innerHTML = render403('Bookings, Callbacks & Messages');
      return;
    }

    const bookingsRows = data.bookings.length
      ? data.bookings
          .map(
            (b) => `
          <tr>
            <td><strong>${esc(b.id)}</strong><br><small class="muted">${esc(b.date)} &middot; ${esc(b.time)}</small></td>
            <td><strong>${esc(b.customerName)}</strong><br><small class="muted">${esc(b.customerPhone)}</small></td>
            <td>${esc(b.serviceName)}<br><small class="muted">${esc(b.technician)}</small></td>
            <td><strong>${global.NailStore.formatMoney(b.price)}</strong></td>
            <td><span class="status-pill ${esc(b.status)}">${esc(b.status)}</span></td>
            <td style="white-space:nowrap;">
              <select class="select-sm js-bk-status" data-id="${esc(b.id)}">
                ${['Pending', 'Confirmed', 'Completed', 'Cancelled']
                  .map((st) => `<option value="${st}" ${b.status === st ? 'selected' : ''}>${st}</option>`)
                  .join('')}
              </select>
              <button type="button" class="btn btn-danger-outline btn-sm js-bk-del" data-id="${esc(b.id)}">Delete</button>
            </td>
          </tr>`
          )
          .join('')
      : `<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:24px;">No appointments booked yet.</td></tr>`;

    const cbRows = data.callbacks.length
      ? data.callbacks
          .map(
            (c) => `
          <tr>
            <td><strong>${esc(c.name)}</strong><br><small class="muted">${esc(c.phone)}</small></td>
            <td>${esc(c.preferredTime)}</td>
            <td>${esc(c.note || '—')}</td>
            <td><span class="status-pill ${esc(c.status)}">${esc(c.status)}</span></td>
            <td>
              <button type="button" class="btn btn-outline btn-sm js-cb-done" data-id="${esc(c.id)}">Mark Called</button>
              <button type="button" class="btn btn-danger-outline btn-sm js-cb-del" data-id="${esc(c.id)}">Delete</button>
            </td>
          </tr>`
          )
          .join('')
      : `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:20px;">No callback requests.</td></tr>`;

    const msgRows = data.messages.length
      ? data.messages
          .map(
            (m) => `
          <tr>
            <td><strong>${esc(m.name)}</strong><br><small class="muted">${esc(m.email)}</small></td>
            <td><strong>${esc(m.subject)}</strong><br><span class="muted">${esc(m.message)}</span></td>
            <td><button type="button" class="btn btn-danger-outline btn-sm js-msg-del" data-id="${esc(m.id)}">Delete</button></td>
          </tr>`
          )
          .join('')
      : `<tr><td colspan="3" style="text-align:center;color:var(--muted);padding:20px;">No contact messages.</td></tr>`;

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card"><small>Total Bookings</small><strong>${data.bookings.length}</strong></div>
        <div class="stat-card"><small>Callback Requests</small><strong>${data.callbacks.length}</strong></div>
        <div class="stat-card"><small>Menu Services</small><strong>${data.menu.length}</strong></div>
        <div class="stat-card"><small>Gallery Photos</small><strong>${data.gallery.length}</strong></div>
      </div>

      <div class="panel-card">
        <h3>📅 Appointments (Booking By Date)</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Booking / Date</th><th>Client</th><th>Service</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>${bookingsRows}</tbody>
          </table>
        </div>
      </div>

      <div class="panel-card">
        <h3>📞 JavaScript Call Us — Callback Requests</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Client</th><th>Preferred Time</th><th>Note</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>${cbRows}</tbody>
          </table>
        </div>
      </div>

      <div class="panel-card">
        <h3>✉️ Contact Us Messages</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Sender</th><th>Message</th><th>Action</th></tr></thead>
            <tbody>${msgRows}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  /* ---------------- TAB 2: SITE INFO & BANNERS ---------------- */
  function renderSiteTab() {
    const container = $('#tab-site');
    const s = data.site;
    const admin = isAdmin();
    const dis = admin ? '' : 'disabled';

    container.innerHTML = `
      <div class="panel-card">
        <h3>
          <span>🖼️ Hero &amp; About Section Images</span>
          <span class="pill">${admin ? 'Admin: Full Access' : 'Staff: Image Upload Allowed'}</span>
        </h3>
        <div class="grid-2">
          <div class="item-card">
            <div class="item-img-box"><img id="prev-hero-img" src="${esc(s.heroImage)}" alt="Hero" /></div>
            <div class="item-body">
              <strong>Home Hero Banner Image</strong>
              <input type="url" id="site-hero-url" value="${esc(s.heroImage)}" placeholder="Paste image URL..." />
              <div class="upload-row">
                <label class="upload-label">📤 Upload from PC <input type="file" accept="image/*" id="site-hero-file" /></label>
                <button type="button" class="btn btn-primary btn-sm" id="save-hero-img-btn">Save Hero Image</button>
              </div>
            </div>
          </div>

          <div class="item-card">
            <div class="item-img-box"><img id="prev-about-img" src="${esc(s.aboutImage)}" alt="About" /></div>
            <div class="item-body">
              <strong>About / Salon Interior Image</strong>
              <input type="url" id="site-about-url" value="${esc(s.aboutImage)}" placeholder="Paste image URL..." />
              <div class="upload-row">
                <label class="upload-label">📤 Upload from PC <input type="file" accept="image/*" id="site-about-file" /></label>
                <button type="button" class="btn btn-primary btn-sm" id="save-about-img-btn">Save About Image</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel-card">
        <h3>
          <span>📝 Salon Text, Headlines &amp; Contact Information</span>
          ${admin ? '' : '<span class="lock-tag">🔒 Admin Only — Read-Only for Staff</span>'}
        </h3>
        <form id="site-text-form">
          <div class="grid-2">
            <div class="field"><label>Brand Name</label><input type="text" id="st-brand" value="${esc(s.brandName)}" ${dis} /></div>
            <div class="field"><label>Tagline</label><input type="text" id="st-tagline" value="${esc(s.tagline)}" ${dis} /></div>
            <div class="field" style="grid-column:1/-1;"><label>Top Announcement Bar</label><input type="text" id="st-announce" value="${esc(s.announcement)}" ${dis} /></div>
            <div class="field"><label>Hero Eyebrow</label><input type="text" id="st-eyebrow" value="${esc(s.heroEyebrow)}" ${dis} /></div>
            <div class="field"><label>Hero Headline</label><input type="text" id="st-hero-title" value="${esc(s.heroTitle)}" ${dis} /></div>
            <div class="field" style="grid-column:1/-1;"><label>Hero Subtitle</label><textarea id="st-hero-sub" rows="2" ${dis}>${esc(s.heroSubtitle)}</textarea></div>
            <div class="field"><label>About Title</label><input type="text" id="st-about-title" value="${esc(s.aboutTitle)}" ${dis} /></div>
            <div class="field"><label>Phone Display (Call Us)</label><input type="text" id="st-phone-disp" value="${esc(s.phoneDisplay)}" ${dis} /></div>
            <div class="field"><label>Phone Dial Link (e.g. +13105550198)</label><input type="text" id="st-phone-raw" value="${esc(s.phoneRaw)}" ${dis} /></div>
            <div class="field"><label>Email Address</label><input type="email" id="st-email" value="${esc(s.email)}" ${dis} /></div>
            <div class="field" style="grid-column:1/-1;"><label>Salon Address</label><input type="text" id="st-address" value="${esc(s.address)}" ${dis} /></div>
            <div class="field" style="grid-column:1/-1;"><label>About Description</label><textarea id="st-about-text" rows="3" ${dis}>${esc(s.aboutText)}</textarea></div>
          </div>
          ${
            admin
              ? `<button type="submit" class="btn btn-primary" style="margin-top:10px;">💾 Save All Text &amp; Info</button>`
              : `<button type="button" class="btn btn-outline" disabled style="margin-top:10px;">🔒 Only Admin Can Edit Salon Text</button>`
          }
        </form>
      </div>
    `;
  }

  /* ---------------- TAB 3: MENU & PRICING ---------------- */
  function renderMenuTab() {
    const container = $('#tab-menu');
    const admin = isAdmin();
    const disText = admin ? '' : 'disabled';

    const addFormHTML = admin
      ? `
      <div class="panel-card">
        <h3>➕ Add New Nail Service (Admin)</h3>
        <form id="add-menu-form">
          <div class="grid-2">
            <div class="field"><label>Service Name *</label><input type="text" id="nm-name" placeholder="e.g. Velvet Cat-Eye Gel" required /></div>
            <div class="field">
              <label>Category *</label>
              <select id="nm-cat">
                ${data.menuCategories.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}
              </select>
            </div>
            <div class="field"><label>Price (USD) *</label><input type="number" step="0.01" min="0" id="nm-price" placeholder="65" required /></div>
            <div class="field"><label>Duration</label><input type="text" id="nm-dur" placeholder="55 min" value="50 min" /></div>
            <div class="field" style="grid-column:1/-1;"><label>Description</label><input type="text" id="nm-desc" placeholder="Short description of treatment..." /></div>
            <div class="field" style="grid-column:1/-1;">
              <label>Service Image (Upload or URL)</label>
              <div class="upload-row">
                <input type="url" id="nm-img" placeholder="https://..." style="flex:1;" />
                <label class="upload-label">📤 Upload Photo <input type="file" accept="image/*" id="nm-file" /></label>
              </div>
            </div>
          </div>
          <button type="submit" class="btn btn-primary" style="margin-top:8px;">+ Add Service to Menu</button>
        </form>
      </div>`
      : '';

    const cardsHTML = data.menu
      .map(
        (srv) => `
      <article class="item-card" data-srvid="${esc(srv.id)}">
        <div class="item-img-box">
          <img src="${esc(srv.image || global.NAIL_SALON_FALLBACK_IMG)}" alt="${esc(srv.name)}" class="js-srv-prev" />
        </div>
        <div class="item-body">
          <div class="field" style="margin:0;">
            <label>Service Name ${admin ? '' : '<span class="lock-tag">🔒 Locked</span>'}</label>
            <input type="text" class="js-srv-name" value="${esc(srv.name)}" ${disText} />
          </div>
          <div class="grid-2" style="gap:10px;">
            <div class="field" style="margin:0;">
              <label style="color:#86efac;">💲 Price (USD) ✏️</label>
              <input type="number" step="0.01" min="0" class="js-srv-price" value="${esc(srv.price)}" />
            </div>
            <div class="field" style="margin:0;">
              <label>Duration</label>
              <input type="text" class="js-srv-dur" value="${esc(srv.duration)}" ${disText} />
            </div>
          </div>
          <div class="field" style="margin:0;">
            <label>Category</label>
            <select class="js-srv-cat" ${disText}>
              ${data.menuCategories
                .map((c) => `<option value="${esc(c)}" ${c === srv.category ? 'selected' : ''}>${esc(c)}</option>`)
                .join('')}
            </select>
          </div>
          <div class="field" style="margin:0;">
            <label>Description</label>
            <textarea rows="2" class="js-srv-desc" ${disText}>${esc(srv.description)}</textarea>
          </div>
          <div class="field" style="margin:0;">
            <label style="color:#86efac;">🖼️ Image URL / Upload ✏️</label>
            <input type="url" class="js-srv-img" value="${esc(srv.image)}" />
          </div>
          <div class="upload-row" style="justify-content:space-between;flex-wrap:wrap;">
            <label class="upload-label">📤 Upload Photo <input type="file" accept="image/*" class="js-srv-file" /></label>
            <div style="display:flex;gap:6px;">
              <button type="button" class="btn btn-primary btn-sm js-srv-save">💾 Save</button>
              ${admin ? `<button type="button" class="btn btn-danger-outline btn-sm js-srv-del">Delete</button>` : ''}
            </div>
          </div>
        </div>
      </article>`
      )
      .join('');

    container.innerHTML = `
      ${addFormHTML}
      <div class="panel-card">
        <h3>
          <span>💅 Service Menu (${data.menu.length} items)</span>
          <span class="pill">${admin ? 'Admin: Full Edit' : 'Staff: Price & Image Only'}</span>
        </h3>
        <div class="grid-3">${cardsHTML}</div>
      </div>
    `;
  }

  /* ---------------- TAB 4: GALLERY PHOTOS ---------------- */
  function renderGalleryTab() {
    const container = $('#tab-gallery');
    const admin = isAdmin();
    const disText = admin ? '' : 'disabled';

    const addFormHTML = admin
      ? `
      <div class="panel-card">
        <h3>➕ Add New Gallery Photo (Admin)</h3>
        <form id="add-gal-form">
          <div class="grid-2">
            <div class="field"><label>Photo Title *</label><input type="text" id="ng-title" placeholder="e.g. Pearl Glazed Almond" required /></div>
            <div class="field">
              <label>Category</label>
              <select id="ng-cat">
                <option>Manicure</option><option>Pedicure</option><option>Nail Art</option><option>Extensions</option>
              </select>
            </div>
            <div class="field" style="grid-column:1/-1;"><label>Caption</label><input type="text" id="ng-caption" placeholder="Short caption..." /></div>
            <div class="field" style="grid-column:1/-1;">
              <label>Upload Image or Paste URL *</label>
              <div class="upload-row">
                <input type="url" id="ng-img" placeholder="https://..." style="flex:1;" />
                <label class="upload-label">📤 Upload Photo <input type="file" accept="image/*" id="ng-file" /></label>
              </div>
            </div>
          </div>
          <button type="submit" class="btn btn-primary" style="margin-top:8px;">+ Add to Gallery</button>
        </form>
      </div>`
      : '';

    const cardsHTML = data.gallery
      .map(
        (g) => `
      <article class="item-card" data-galid="${esc(g.id)}">
        <div class="item-img-box">
          <img src="${esc(g.image || global.NAIL_SALON_FALLBACK_IMG)}" alt="${esc(g.title)}" class="js-gal-prev" />
        </div>
        <div class="item-body">
          <div class="field" style="margin:0;">
            <label>Title ${admin ? '' : '<span class="lock-tag">🔒 Locked</span>'}</label>
            <input type="text" class="js-gal-title" value="${esc(g.title)}" ${disText} />
          </div>
          <div class="field" style="margin:0;">
            <label>Category</label>
            <select class="js-gal-cat" ${disText}>
              ${['Manicure', 'Pedicure', 'Nail Art', 'Extensions']
                .map((c) => `<option value="${c}" ${c === g.category ? 'selected' : ''}>${c}</option>`)
                .join('')}
            </select>
          </div>
          <div class="field" style="margin:0;">
            <label>Caption</label>
            <input type="text" class="js-gal-caption" value="${esc(g.caption)}" ${disText} />
          </div>
          <div class="field" style="margin:0;">
            <label style="color:#86efac;">🖼️ Image URL / Upload ✏️</label>
            <input type="url" class="js-gal-img" value="${esc(g.image)}" />
          </div>
          <div class="upload-row" style="justify-content:space-between;flex-wrap:wrap;">
            <label class="upload-label">📤 Replace Photo <input type="file" accept="image/*" class="js-gal-file" /></label>
            <div style="display:flex;gap:6px;">
              <button type="button" class="btn btn-primary btn-sm js-gal-save">💾 Save</button>
              ${admin ? `<button type="button" class="btn btn-danger-outline btn-sm js-gal-del">Delete</button>` : ''}
            </div>
          </div>
        </div>
      </article>`
      )
      .join('');

    container.innerHTML = `
      ${addFormHTML}
      <div class="panel-card">
        <h3>
          <span>🖼️ Salon Gallery (${data.gallery.length} photos)</span>
          <span class="pill">${admin ? 'Admin: Full Edit' : 'Staff: Replace Photo Only'}</span>
        </h3>
        <div class="grid-3">${cardsHTML}</div>
      </div>
    `;
  }

  function renderAllTabs() {
    $('#sb-brand').textContent = data.site.brandName;
    renderOverviewTab();
    renderSiteTab();
    renderMenuTab();
    renderGalleryTab();
  }

  function switchTab(tabId) {
    activeTab = tabId;
    $$('.nav-item').forEach((b) => b.classList.toggle('active', b.dataset.tab === tabId));
    $$('.tab-panel').forEach((p) => p.classList.toggle('active', p.id === tabId));
    const titles = {
      'tab-overview': 'Bookings & Inbox',
      'tab-site': 'Site Info & Banners',
      'tab-menu': 'Menu & Pricing',
      'tab-gallery': 'Gallery Photos'
    };
    $('#page-title').textContent = titles[tabId] || 'Salon Portal';
  }

  async function enterPortal(sess) {
    session = sess;
    data = await global.NailStore.load();

    $('#login-view').style.display = 'none';
    $('#portal-view').style.display = 'grid';

    const badge = $('#role-badge');
    badge.textContent = isAdmin() ? '👑 ADMIN — FULL ACCESS' : '👩‍🎨 STAFF — IMAGES & PRICES';
    badge.className = `role-badge ${session.role}`;
    $('#sb-user-name').textContent = session.name;
    $('#staff-notice').style.display = isAdmin() ? 'none' : 'block';
    $$('.admin-only').forEach((el) => {
      el.style.display = isAdmin() ? '' : 'none';
    });

    // Populate theme preview selector
    $('#preview-theme-select').innerHTML = global.NAIL_SALON_THEMES.map(
      (t) => `<option value="${t.file}">#${t.id} ${esc(t.name)}</option>`
    ).join('');

    renderAllTabs();
    // Default Staff straight to Menu Prices & Photos so they can work immediately
    switchTab(isAdmin() ? 'tab-overview' : 'tab-menu');
  }

  function bindPortalEvents() {
    // Sidebar navigation
    $('#sidebar-nav').addEventListener('click', (e) => {
      const btn = e.target.closest('.nav-item');
      if (btn) switchTab(btn.dataset.tab);
    });

    // Jump buttons inside 403 state
    document.addEventListener('click', (e) => {
      const jump = e.target.closest('[data-jump]');
      if (jump) switchTab(jump.dataset.jump);
    });

    // Open live preview
    $('#open-preview-btn').addEventListener('click', () => {
      const file = $('#preview-theme-select').value || 'index-1.html';
      window.open(file, '_blank');
    });

    // Logout
    $('#logout-btn').addEventListener('click', () => {
      global.NailStore.logout();
      session = null;
      $('#portal-view').style.display = 'none';
      $('#login-view').style.display = 'grid';
      toast('Signed out successfully.', 'info');
    });

    // Reset Defaults (Admin only)
    $('#reset-data-btn').addEventListener('click', async () => {
      try {
        global.NailStore.assertPermission(session.role, 'reset:data');
        if (!confirm('Reset all salon text, menu, gallery, and bookings back to factory defaults?')) return;
        data = await global.NailStore.reset(session.role);
        renderAllTabs();
        toast('Reset to default data!', 'success');
      } catch (err) {
        toast(err.message, 'error');
      }
    });

    // Delegated clicks & changes inside main-content
    const main = $('.main-content');

    // File uploads (Hero, About, New Menu, Existing Menu, New Gallery, Existing Gallery)
    main.addEventListener('change', async (e) => {
      const target = e.target;

      // Booking status update (Admin)
      if (target.classList.contains('js-bk-status')) {
        try {
          global.NailStore.assertPermission(session.role, 'manage:bookings');
          const bk = data.bookings.find((b) => b.id === target.dataset.id);
          if (bk) {
            bk.status = target.value;
            await global.NailStore.save(data, true);
            renderOverviewTab();
            toast(`Booking ${bk.id} marked ${bk.status}.`, 'success');
          }
        } catch (err) {
          toast(err.message, 'error');
        }
        return;
      }

      if (target.type !== 'file' || !target.files || !target.files[0]) return;
      try {
        toast('Compressing & preparing image...', 'info');
        const dataUrl = await global.NailStore.compressImageFile(target.files[0]);

        if (target.id === 'site-hero-file') {
          global.NailStore.assertPermission(session.role, 'edit:hero_image');
          $('#site-hero-url').value = dataUrl;
          $('#prev-hero-img').src = dataUrl;
          data.site.heroImage = dataUrl;
          await global.NailStore.save(data, true);
          toast('Hero image uploaded & synced live!', 'success');
        } else if (target.id === 'site-about-file') {
          global.NailStore.assertPermission(session.role, 'edit:about_image');
          $('#site-about-url').value = dataUrl;
          $('#prev-about-img').src = dataUrl;
          data.site.aboutImage = dataUrl;
          await global.NailStore.save(data, true);
          toast('About image uploaded & synced live!', 'success');
        } else if (target.id === 'nm-file') {
          global.NailStore.assertPermission(session.role, 'add:menu');
          $('#nm-img').value = dataUrl;
          toast('Service photo ready! Click "+ Add Service to Menu".', 'success');
        } else if (target.id === 'ng-file') {
          global.NailStore.assertPermission(session.role, 'add:gallery');
          $('#ng-img').value = dataUrl;
          toast('Gallery photo ready! Click "+ Add to Gallery".', 'success');
        } else if (target.classList.contains('js-srv-file')) {
          global.NailStore.assertPermission(session.role, 'edit:menu_image');
          const card = target.closest('[data-srvid]');
          card.querySelector('.js-srv-img').value = dataUrl;
          card.querySelector('.js-srv-prev').src = dataUrl;
          const srv = data.menu.find((m) => m.id === card.dataset.srvid);
          if (srv) {
            srv.image = dataUrl;
            await global.NailStore.save(data, true);
            toast(`Updated image for "${srv.name}"!`, 'success');
          }
        } else if (target.classList.contains('js-gal-file')) {
          global.NailStore.assertPermission(session.role, 'edit:gallery_image');
          const card = target.closest('[data-galid]');
          card.querySelector('.js-gal-img').value = dataUrl;
          card.querySelector('.js-gal-prev').src = dataUrl;
          const g = data.gallery.find((x) => x.id === card.dataset.galid);
          if (g) {
            g.image = dataUrl;
            await global.NailStore.save(data, true);
            toast(`Replaced gallery photo "${g.title}"!`, 'success');
          }
        }
      } catch (err) {
        toast(err.message || 'Image upload failed.', 'error');
      }
    });

    // Click actions inside tabs
    main.addEventListener('click', async (e) => {
      const t = e.target;

      // Save Hero / About Image URL (Admin & Staff)
      if (t.id === 'save-hero-img-btn') {
        try {
          global.NailStore.assertPermission(session.role, 'edit:hero_image');
          const url = $('#site-hero-url').value.trim();
          if (!url) return toast('Please enter an image URL or upload a photo.', 'error');
          data.site.heroImage = url;
          $('#prev-hero-img').src = url;
          await global.NailStore.save(data, true);
          toast('Hero image saved & synced live!', 'success');
        } catch (err) {
          toast(err.message, 'error');
        }
        return;
      }

      if (t.id === 'save-about-img-btn') {
        try {
          global.NailStore.assertPermission(session.role, 'edit:about_image');
          const url = $('#site-about-url').value.trim();
          if (!url) return toast('Please enter an image URL or upload a photo.', 'error');
          data.site.aboutImage = url;
          $('#prev-about-img').src = url;
          await global.NailStore.save(data, true);
          toast('About image saved & synced live!', 'success');
        } catch (err) {
          toast(err.message, 'error');
        }
        return;
      }

      // Save Menu Item (Admin saves all; Staff saves ONLY price & image)
      if (t.classList.contains('js-srv-save')) {
        try {
          const card = t.closest('[data-srvid]');
          const srv = data.menu.find((m) => m.id === card.dataset.srvid);
          if (!srv) return;

          const newPrice = Number(card.querySelector('.js-srv-price').value);
          const newImg = card.querySelector('.js-srv-img').value.trim();
          if (Number.isNaN(newPrice) || newPrice < 0) {
            return toast('Price must be a valid non-negative number.', 'error');
          }

          global.NailStore.assertPermission(session.role, 'edit:menu_price');
          global.NailStore.assertPermission(session.role, 'edit:menu_image');

          srv.price = newPrice;
          if (newImg) {
            srv.image = newImg;
            card.querySelector('.js-srv-prev').src = newImg;
          }

          if (isAdmin()) {
            global.NailStore.assertPermission(session.role, 'edit:menu_text');
            srv.name = card.querySelector('.js-srv-name').value.trim() || srv.name;
            srv.duration = card.querySelector('.js-srv-dur').value.trim() || srv.duration;
            srv.category = card.querySelector('.js-srv-cat').value;
            srv.description = card.querySelector('.js-srv-desc').value.trim();
          }

          await global.NailStore.save(data, true);
          toast(`Saved "${srv.name}" (${global.NailStore.formatMoney(srv.price)})!`, 'success');
        } catch (err) {
          toast(err.message, 'error');
        }
        return;
      }

      // Delete Menu Item (Admin only)
      if (t.classList.contains('js-srv-del')) {
        try {
          global.NailStore.assertPermission(session.role, 'delete:menu');
          const card = t.closest('[data-srvid]');
          data.menu = data.menu.filter((m) => m.id !== card.dataset.srvid);
          await global.NailStore.save(data, true);
          renderMenuTab();
          toast('Service deleted.', 'success');
        } catch (err) {
          toast(err.message, 'error');
        }
        return;
      }

      // Save Gallery Item (Admin saves all; Staff saves ONLY image)
      if (t.classList.contains('js-gal-save')) {
        try {
          const card = t.closest('[data-galid]');
          const g = data.gallery.find((x) => x.id === card.dataset.galid);
          if (!g) return;

          global.NailStore.assertPermission(session.role, 'edit:gallery_image');
          const newImg = card.querySelector('.js-gal-img').value.trim();
          if (newImg) {
            g.image = newImg;
            card.querySelector('.js-gal-prev').src = newImg;
          }

          if (isAdmin()) {
            global.NailStore.assertPermission(session.role, 'edit:gallery_text');
            g.title = card.querySelector('.js-gal-title').value.trim() || g.title;
            g.category = card.querySelector('.js-gal-cat').value;
            g.caption = card.querySelector('.js-gal-caption').value.trim();
          }

          await global.NailStore.save(data, true);
          toast(`Saved gallery photo "${g.title}"!`, 'success');
        } catch (err) {
          toast(err.message, 'error');
        }
        return;
      }

      // Delete Gallery Item (Admin only)
      if (t.classList.contains('js-gal-del')) {
        try {
          global.NailStore.assertPermission(session.role, 'delete:gallery');
          const card = t.closest('[data-galid]');
          data.gallery = data.gallery.filter((x) => x.id !== card.dataset.galid);
          await global.NailStore.save(data, true);
          renderGalleryTab();
          toast('Gallery photo deleted.', 'success');
        } catch (err) {
          toast(err.message, 'error');
        }
        return;
      }

      // Delete Booking / Callback / Message (Admin only)
      if (t.classList.contains('js-bk-del')) {
        try {
          global.NailStore.assertPermission(session.role, 'manage:bookings');
          data.bookings = data.bookings.filter((b) => b.id !== t.dataset.id);
          await global.NailStore.save(data, true);
          renderOverviewTab();
          toast('Booking deleted.', 'success');
        } catch (err) {
          toast(err.message, 'error');
        }
        return;
      }

      if (t.classList.contains('js-cb-done')) {
        try {
          global.NailStore.assertPermission(session.role, 'manage:callbacks');
          const cb = data.callbacks.find((c) => c.id === t.dataset.id);
          if (cb) cb.status = 'Called';
          await global.NailStore.save(data, true);
          renderOverviewTab();
          toast('Marked as Called.', 'success');
        } catch (err) {
          toast(err.message, 'error');
        }
        return;
      }

      if (t.classList.contains('js-cb-del')) {
        try {
          global.NailStore.assertPermission(session.role, 'manage:callbacks');
          data.callbacks = data.callbacks.filter((c) => c.id !== t.dataset.id);
          await global.NailStore.save(data, true);
          renderOverviewTab();
          toast('Callback request deleted.', 'success');
        } catch (err) {
          toast(err.message, 'error');
        }
        return;
      }

      if (t.classList.contains('js-msg-del')) {
        try {
          global.NailStore.assertPermission(session.role, 'manage:messages');
          data.messages = data.messages.filter((m) => m.id !== t.dataset.id);
          await global.NailStore.save(data, true);
          renderOverviewTab();
          toast('Message deleted.', 'success');
        } catch (err) {
          toast(err.message, 'error');
        }
      }
    });

    // Form submissions (Site Text, Add Menu, Add Gallery — Admin only)
    main.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;

      if (form.id === 'site-text-form') {
        try {
          global.NailStore.assertPermission(session.role, 'edit:site_info');
          data.site.brandName = $('#st-brand').value.trim() || data.site.brandName;
          data.site.tagline = $('#st-tagline').value.trim();
          data.site.announcement = $('#st-announce').value.trim();
          data.site.heroEyebrow = $('#st-eyebrow').value.trim();
          data.site.heroTitle = $('#st-hero-title').value.trim();
          data.site.heroSubtitle = $('#st-hero-sub').value.trim();
          data.site.aboutTitle = $('#st-about-title').value.trim();
          data.site.aboutText = $('#st-about-text').value.trim();
          data.site.phoneDisplay = $('#st-phone-disp').value.trim();
          data.site.phoneRaw = $('#st-phone-raw').value.trim();
          data.site.email = $('#st-email').value.trim();
          data.site.address = $('#st-address').value.trim();
          await global.NailStore.save(data, true);
          $('#sb-brand').textContent = data.site.brandName;
          toast('All salon text & contact info saved and synced!', 'success');
        } catch (err) {
          toast(err.message, 'error');
        }
      } else if (form.id === 'add-menu-form') {
        try {
          global.NailStore.assertPermission(session.role, 'add:menu');
          const name = $('#nm-name').value.trim();
          const price = Number($('#nm-price').value);
          if (!name || Number.isNaN(price)) return toast('Enter valid service name and price.', 'error');
          data.menu.unshift({
            id: 'srv-' + Date.now(),
            name,
            category: $('#nm-cat').value,
            price,
            duration: $('#nm-dur').value.trim() || '45 min',
            description: $('#nm-desc').value.trim(),
            image: $('#nm-img').value.trim() || global.NAIL_SALON_FALLBACK_IMG,
            featured: false
          });
          await global.NailStore.save(data, true);
          renderMenuTab();
          toast(`Added "${name}" to Menu!`, 'success');
        } catch (err) {
          toast(err.message, 'error');
        }
      } else if (form.id === 'add-gal-form') {
        try {
          global.NailStore.assertPermission(session.role, 'add:gallery');
          const title = $('#ng-title').value.trim();
          const image = $('#ng-img').value.trim();
          if (!title || !image) return toast('Enter a title and upload or paste an image.', 'error');
          data.gallery.unshift({
            id: 'gal-' + Date.now(),
            title,
            category: $('#ng-cat').value,
            caption: $('#ng-caption').value.trim(),
            image
          });
          await global.NailStore.save(data, true);
          renderGalleryTab();
          toast(`Added "${title}" to Gallery!`, 'success');
        } catch (err) {
          toast(err.message, 'error');
        }
      }
    });
  }

  function init() {
    // Offline banner
    const updateOnline = () => $('#offline-banner').classList.toggle('show', !navigator.onLine);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    updateOnline();

    // Login form
    $('#login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const errBox = $('#login-error');
      errBox.className = 'alert error';
      try {
        const sess = global.NailStore.login($('#login-user').value, $('#login-pass').value);
        await enterPortal(sess);
        toast(`Welcome, ${sess.name}!`, 'success');
      } catch (err) {
        errBox.textContent = err.message;
        errBox.className = 'alert error show';
      }
    });

    bindPortalEvents();

    // Live sync if guest books an appointment in another tab
    global.NailStore.subscribe(async () => {
      if (!session) return;
      data = await global.NailStore.load();
      renderOverviewTab();
      toast('New booking or update received!', 'info');
    });

    // Resume active session
    const existing = global.NailStore.getSession();
    if (existing) {
      enterPortal(existing);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})(window);
