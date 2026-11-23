/* ==========================================================================
   NAILS SALON PRO — INTERACTIVE STOREFRONT ENGINE
   Powers index-1.html through index-10.html with live sync from Admin/Staff
   Features: Home, Gallery (+Lightbox), Menu, Contact Us, Booking by Date,
             JavaScript Call Us Widget, and 6 UX States.
   ========================================================================== */

(function (global) {
  'use strict';

  let appData = null;
  let activeGalleryCat = 'All';
  let activeMenuCat = 'All';
  let selectedSlot = '';
  let lightboxIndex = 0;
  let currentGalleryList = [];

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function isSalonOpenNow(site) {
    const now = new Date();
    const hour = now.getHours();
    const openH = Number(site.openHour ?? 9);
    const closeH = Number(site.closeHour ?? 19);
    return hour >= openH && hour < closeH;
  }

  function showToast(message, type = 'info') {
    let wrap = $('#toast-container');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'toast-container';
      wrap.className = 'toast-container';
      document.body.appendChild(wrap);
    }
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 3600);
  }

  function safeImg(src) {
    return esc(src || global.NAIL_SALON_FALLBACK_IMG);
  }

  function buildShellHTML(themeMeta) {
    const themeOptions = global.NAIL_SALON_THEMES.map(
      (t) => `<option value="${t.file}" ${t.id === themeMeta.id ? 'selected' : ''}>#${t.id} ${esc(t.name)}</option>`
    ).join('');

    return `
      <div id="offline-banner" class="offline-banner" role="alert">
        You are currently offline. Viewing cached salon data — online sync will resume automatically.
      </div>

      <div class="announcement-bar" id="el-announcement"></div>

      <header class="site-header">
        <div class="container header-inner">
          <a href="#home" class="brand-logo">
            <span class="brand-name" id="el-brand-name"></span>
            <span class="brand-tag" id="el-brand-tag"></span>
          </a>

          <nav aria-label="Main Navigation">
            <ul class="nav-links" id="nav-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#gallery">Gallery</a></li>
              <li><a href="#menu">Menu</a></li>
              <li><a href="#booking">Booking</a></li>
              <li><a href="#contact">Contact Us</a></li>
            </ul>
          </nav>

          <div class="header-actions">
            <button type="button" class="btn btn-outline btn-sm js-open-call">📞 Call Us</button>
            <a href="#booking" class="btn btn-primary btn-sm btn-book-nav">Book Now</a>
            <button type="button" class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Toggle Menu">☰</button>
          </div>
        </div>
      </header>

      <main>
        <!-- HOME -->
        <section id="home" class="hero">
          <div class="container hero-grid">
            <div class="hero-content">
              <span class="hero-eyebrow" id="el-hero-eyebrow"></span>
              <h1 class="hero-title" id="el-hero-title"></h1>
              <p class="hero-subtitle" id="el-hero-subtitle"></p>
              <div class="hero-cta">
                <a href="#booking" class="btn btn-primary">Book Appointment</a>
                <a href="#menu" class="btn btn-outline">Explore Menu</a>
                <button type="button" class="btn btn-outline js-open-call">📞 Call Us</button>
              </div>
              <div class="hero-stats">
                <div class="stat-item">
                  <strong>100%</strong>
                  <span>Hospital-Grade Sterilization</span>
                </div>
                <div class="stat-item">
                  <strong>4.9 ★</strong>
                  <span>1,200+ Happy Clients</span>
                </div>
                <div class="stat-item">
                  <strong>Non-Toxic</strong>
                  <span>Japanese &amp; Korean Gels</span>
                </div>
              </div>
            </div>

            <div class="hero-media">
              <div class="hero-img-wrap">
                <img id="el-hero-img" alt="Featured Nail Art" />
              </div>
              <div class="hero-float-badge" id="el-open-badge">
                <span class="status-dot" id="el-status-dot"></span>
                <div>
                  <strong id="el-status-text" style="display:block;font-size:0.9rem;">Open Now</strong>
                  <small id="el-status-phone" style="color:var(--text-muted);font-size:0.78rem;"></small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ABOUT / STORY -->
        <section class="section section-alt" id="about">
          <div class="container about-grid">
            <div class="about-media">
              <img id="el-about-img" alt="Nail Salon Interior" />
            </div>
            <div>
              <span class="section-eyebrow">OUR PHILOSOPHY</span>
              <h2 class="section-title" id="el-about-title"></h2>
              <p class="section-desc" id="el-about-text" style="margin-bottom:16px;"></p>
              <div class="about-highlights">
                <div class="highlight-pill">✦ Licensed Master Nail Artists</div>
                <div class="highlight-pill">✦ Autoclave Sterilized Tools</div>
                <div class="highlight-pill">✦ Complimentary Herbal Tea</div>
                <div class="highlight-pill">✦ 7-Day Gel Chip Guarantee</div>
              </div>
            </div>
          </div>
        </section>

        <!-- GALLERY -->
        <section id="gallery" class="section">
          <div class="container">
            <div class="section-head">
              <span class="section-eyebrow">PORTFOLIO</span>
              <h2 class="section-title">Signature Nail Gallery</h2>
              <p class="section-desc">Explore our latest manicures, sculpted extensions, and bespoke hand-painted nail art. Click any photo to enlarge.</p>
            </div>
            <div class="filter-tabs" id="gallery-filters"></div>
            <div class="gallery-grid" id="gallery-grid"></div>
          </div>
        </section>

        <!-- MENU -->
        <section id="menu" class="section section-alt">
          <div class="container">
            <div class="section-head">
              <span class="section-eyebrow">SERVICE MENU</span>
              <h2 class="section-title">Treatments &amp; Pricing</h2>
              <p class="section-desc">Transparent pricing updated live by our salon team. Select any treatment to book immediately.</p>
            </div>
            <div class="filter-tabs" id="menu-filters"></div>
            <div class="menu-grid" id="menu-grid"></div>
          </div>
        </section>

        <!-- BOOKING BY DATE -->
        <section id="booking" class="section">
          <div class="container">
            <div class="section-head">
              <span class="section-eyebrow">RESERVATIONS</span>
              <h2 class="section-title">Book By Date</h2>
              <p class="section-desc">Choose your preferred date to see real-time available slots and reserve your chair in seconds.</p>
            </div>

            <div class="booking-shell">
              <form id="booking-form" novalidate>
                <div class="form-grid">
                  <div class="form-field">
                    <label for="bk-date">1. Select Date *</label>
                    <input type="date" id="bk-date" required />
                  </div>
                  <div class="form-field">
                    <label for="bk-service">2. Select Service *</label>
                    <select id="bk-service" required></select>
                  </div>
                  <div class="form-field full">
                    <label>3. Choose Available Time Slot for Selected Date *</label>
                    <div class="time-slots-grid" id="bk-slots"></div>
                  </div>
                  <div class="form-field full">
                    <label for="bk-tech">4. Nail Technician</label>
                    <select id="bk-tech"></select>
                  </div>
                  <div class="form-field">
                    <label for="bk-name">Full Name *</label>
                    <input type="text" id="bk-name" placeholder="e.g. Sophia Anderson" required />
                  </div>
                  <div class="form-field">
                    <label for="bk-phone">Phone Number *</label>
                    <input type="tel" id="bk-phone" placeholder="(310) 555-0199" required />
                  </div>
                  <div class="form-field full">
                    <label for="bk-email">Email Address</label>
                    <input type="email" id="bk-email" placeholder="you@example.com" />
                  </div>
                  <div class="form-field full">
                    <label for="bk-notes">Design Notes / Requests</label>
                    <textarea id="bk-notes" rows="2" placeholder="Nail shape, inspiration, soak-off needed..."></textarea>
                  </div>
                </div>

                <div style="margin-top:20px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
                  <button type="submit" class="btn btn-primary" id="bk-submit-btn">Confirm Appointment</button>
                  <button type="button" class="btn btn-outline js-open-call">Need Help? Call Us</button>
                </div>
                <div id="bk-feedback" class="alert-box" role="status"></div>
              </form>

              <aside class="booking-summary-card">
                <div>
                  <span class="section-eyebrow">LIVE SUMMARY</span>
                  <h3 style="font-family:var(--font-display);margin:4px 0 16px;font-size:1.5rem;">Your Appointment</h3>
                  <div class="summary-row"><span>Date</span><strong id="sum-date">—</strong></div>
                  <div class="summary-row"><span>Time</span><strong id="sum-time">Select a slot</strong></div>
                  <div class="summary-row"><span>Service</span><strong id="sum-service">—</strong></div>
                  <div class="summary-row"><span>Technician</span><strong id="sum-tech">Any Available</strong></div>
                  <div class="summary-row"><span>Estimated Total</span><strong id="sum-price" style="color:var(--accent);font-size:1.15rem;">$0</strong></div>
                </div>
                <div style="font-size:0.84rem;color:var(--text-muted);line-height:1.5;">
                  <strong>Cancellation Policy:</strong> Free rescheduling up to 12 hours before your visit. Bookings appear instantly in our Salon Admin Dashboard.
                </div>
              </aside>
            </div>
          </div>
        </section>

        <!-- CONTACT US -->
        <section id="contact" class="section section-alt">
          <div class="container">
            <div class="section-head">
              <span class="section-eyebrow">VISIT OR MESSAGE US</span>
              <h2 class="section-title">Contact Us</h2>
              <p class="section-desc">Have a question about bridal groups, custom nail art, or walk-in availability? Reach out anytime.</p>
            </div>

            <div class="contact-grid">
              <div class="contact-info-card">
                <h3 style="font-family:var(--font-display);margin-top:0;font-size:1.5rem;">Salon Information</h3>
                <div class="contact-item">
                  <div class="contact-icon">📍</div>
                  <div>
                    <strong>Address</strong>
                    <div id="el-address" style="color:var(--text-muted);font-size:0.92rem;"></div>
                  </div>
                </div>
                <div class="contact-item">
                  <div class="contact-icon">📞</div>
                  <div>
                    <strong>Direct Phone</strong>
                    <div id="el-phone" style="color:var(--text-muted);font-size:0.92rem;"></div>
                    <button type="button" class="btn btn-outline btn-sm js-open-call" style="margin-top:8px;">Open Call Us Options</button>
                  </div>
                </div>
                <div class="contact-item">
                  <div class="contact-icon">✉️</div>
                  <div>
                    <strong>Email</strong>
                    <div id="el-email" style="color:var(--text-muted);font-size:0.92rem;"></div>
                  </div>
                </div>
                <div class="contact-item">
                  <div class="contact-icon">🕒</div>
                  <div style="width:100%;">
                    <strong>Opening Hours</strong>
                    <ul class="hours-list" id="el-hours"></ul>
                  </div>
                </div>
              </div>

              <div class="contact-form-card">
                <h3 style="font-family:var(--font-display);margin-top:0;font-size:1.5rem;">Send Us a Message</h3>
                <form id="contact-form" novalidate>
                  <div class="form-grid">
                    <div class="form-field">
                      <label for="ct-name">Your Name *</label>
                      <input type="text" id="ct-name" placeholder="Full Name" required />
                    </div>
                    <div class="form-field">
                      <label for="ct-phone">Phone</label>
                      <input type="tel" id="ct-phone" placeholder="(310) 555-0100" />
                    </div>
                    <div class="form-field full">
                      <label for="ct-email">Email Address *</label>
                      <input type="email" id="ct-email" placeholder="you@example.com" required />
                    </div>
                    <div class="form-field full">
                      <label for="ct-subject">Subject</label>
                      <input type="text" id="ct-subject" placeholder="Bridal party, custom set, gift card..." />
                    </div>
                    <div class="form-field full">
                      <label for="ct-message">Message *</label>
                      <textarea id="ct-message" rows="4" placeholder="How can we help you?" required></textarea>
                    </div>
                  </div>
                  <button type="submit" class="btn btn-primary" style="margin-top:16px;">Send Message</button>
                  <div id="ct-feedback" class="alert-box" role="status"></div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer class="site-footer">
        <div class="container footer-inner">
          <div>
            <strong id="el-footer-brand"></strong> &middot; Theme #${themeMeta.id}: ${esc(themeMeta.name)}
          </div>
          <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
            <a href="index.html">← All 10 Designs</a>
            <a href="admin.html">Admin / Staff Portal</a>
            <button type="button" class="btn btn-outline btn-sm js-open-call">📞 Call Us</button>
          </div>
        </div>
      </footer>

      <!-- FLOATING JS CALL US BUTTON -->
      <button type="button" class="floating-call-btn js-open-call" aria-label="Call Us">
        <span>📞</span>
        <span>Call Us</span>
      </button>

      <!-- FLOATING QUICK THEME SWITCHER -->
      <div class="floating-switcher" aria-label="Theme Switcher">
        <a href="index.html">10 Themes</a>
        <select id="quick-theme-select" aria-label="Switch Nail Salon Design">${themeOptions}</select>
        <a href="admin.html">Admin / Staff</a>
      </div>

      <!-- JAVASCRIPT CALL US INTERACTIVE MODAL -->
      <div class="modal-backdrop" id="call-modal" role="dialog" aria-modal="true" aria-labelledby="call-modal-title">
        <div class="modal-box">
          <button type="button" class="modal-close" id="call-modal-close" aria-label="Close">×</button>
          <span class="section-eyebrow">INSTANT CONCIERGE</span>
          <h3 id="call-modal-title" style="font-family:var(--font-display);font-size:1.8rem;margin:4px 0 8px;">Call Our Salon</h3>
          <p style="color:var(--text-muted);margin:0 0 18px;font-size:0.92rem;">
            Speak directly with our front desk for same-day appointments, walk-ins, or custom nail art consultations.
          </p>

          <div style="background:var(--bg-alt);border:1px solid var(--border);border-radius:var(--radius-md);padding:18px;margin-bottom:20px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
              <span class="status-dot" id="call-status-dot"></span>
              <strong id="call-status-label" style="font-size:0.9rem;"></strong>
            </div>
            <div id="call-phone-display" style="font-family:var(--font-display);font-size:1.7rem;font-weight:700;margin-bottom:14px;"></div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <a id="call-tel-link" href="#" class="btn btn-primary" style="flex:1;">📞 Call Now</a>
              <button type="button" id="call-copy-btn" class="btn btn-outline" style="flex:1;">📋 Copy Number</button>
            </div>
          </div>

          <div style="border-top:1px solid var(--border);padding-top:18px;">
            <h4 style="margin:0 0 10px;font-size:1rem;">Or Request a Quick Callback</h4>
            <form id="callback-form" novalidate>
              <div class="form-grid">
                <div class="form-field">
                  <label for="cb-name">Your Name *</label>
                  <input type="text" id="cb-name" placeholder="Full Name" required />
                </div>
                <div class="form-field">
                  <label for="cb-phone">Your Phone *</label>
                  <input type="tel" id="cb-phone" placeholder="(310) 555-0199" required />
                </div>
                <div class="form-field full">
                  <label for="cb-time">Preferred Callback Time</label>
                  <select id="cb-time">
                    <option>As Soon As Possible</option>
                    <option>Today Morning</option>
                    <option>Today Afternoon</option>
                    <option>Tomorrow</option>
                  </select>
                </div>
                <div class="form-field full">
                  <label for="cb-note">Short Note</label>
                  <input type="text" id="cb-note" placeholder="e.g. Gel-X appointment for 2 guests" />
                </div>
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%;margin-top:14px;">Request Callback</button>
              <div id="cb-feedback" class="alert-box" role="status"></div>
            </form>
          </div>
        </div>
      </div>

      <!-- GALLERY LIGHTBOX MODAL -->
      <div class="modal-backdrop" id="lightbox-modal" role="dialog" aria-modal="true" aria-label="Gallery Lightbox">
        <div class="modal-box lightbox-box">
          <button type="button" class="modal-close" id="lightbox-close" aria-label="Close">×</button>
          <img id="lightbox-img" class="lightbox-img" alt="Nail Art Preview" />
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:14px;flex-wrap:wrap;">
            <div>
              <strong id="lightbox-title" style="font-family:var(--font-display);font-size:1.25rem;display:block;"></strong>
              <span id="lightbox-caption" style="color:var(--text-muted);font-size:0.9rem;"></span>
            </div>
            <div style="display:flex;gap:8px;">
              <button type="button" class="btn btn-outline btn-sm" id="lightbox-prev">← Prev</button>
              <button type="button" class="btn btn-outline btn-sm" id="lightbox-next">Next →</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderSiteContent() {
    const { site } = appData;
    const openNow = isSalonOpenNow(site);

    document.title = `${site.brandName} — ${document.body.dataset.themeName || 'Nail Salon'}`;
    $('#el-announcement').textContent = site.announcement || '';
    $('#el-announcement').style.display = site.announcement ? 'block' : 'none';
    $('#el-brand-name').textContent = site.brandName;
    $('#el-brand-tag').textContent = site.tagline;
    $('#el-hero-eyebrow').textContent = site.heroEyebrow;
    $('#el-hero-title').textContent = site.heroTitle;
    $('#el-hero-subtitle').textContent = site.heroSubtitle;

    const heroImg = $('#el-hero-img');
    heroImg.src = site.heroImage || global.NAIL_SALON_FALLBACK_IMG;
    heroImg.onerror = () => { heroImg.src = global.NAIL_SALON_FALLBACK_IMG; };

    const aboutImg = $('#el-about-img');
    aboutImg.src = site.aboutImage || global.NAIL_SALON_FALLBACK_IMG;
    aboutImg.onerror = () => { aboutImg.src = global.NAIL_SALON_FALLBACK_IMG; };

    $('#el-about-title').textContent = site.aboutTitle;
    $('#el-about-text').textContent = site.aboutText;

    $('#el-status-dot').className = `status-dot ${openNow ? '' : 'closed'}`;
    $('#el-status-text').textContent = openNow ? 'Open Now — Walk-ins Welcome' : 'Currently Closed — Book Online';
    $('#el-status-phone').textContent = site.phoneDisplay;

    $('#el-address').textContent = site.address;
    $('#el-phone').textContent = site.phoneDisplay;
    $('#el-email').textContent = site.email;
    $('#el-footer-brand').textContent = site.brandName;

    $('#el-hours').innerHTML = (site.hours || [])
      .map((h) => `<li><span>${esc(h.day)}</span><strong>${esc(h.time)}</strong></li>`)
      .join('');

    // Call Us Modal live info
    $('#call-status-dot').className = `status-dot ${openNow ? '' : 'closed'}`;
    $('#call-status-label').textContent = openNow
      ? `Salon is Open Now (${site.openHour}:00 – ${site.closeHour}:00)`
      : `Currently Closed — Leave a Callback Request`;
    $('#call-phone-display').textContent = site.phoneDisplay;
    $('#call-tel-link').href = `tel:${site.phoneRaw}`;
  }

  function renderGallery() {
    const cats = ['All', ...new Set(appData.gallery.map((g) => g.category))];
    if (!cats.includes(activeGalleryCat)) activeGalleryCat = 'All';

    $('#gallery-filters').innerHTML = cats
      .map(
        (c) =>
          `<button type="button" class="filter-tab ${c === activeGalleryCat ? 'active' : ''}" data-gcat="${esc(c)}">${esc(c)}</button>`
      )
      .join('');

    currentGalleryList =
      activeGalleryCat === 'All'
        ? appData.gallery
        : appData.gallery.filter((g) => g.category === activeGalleryCat);

    const grid = $('#gallery-grid');
    if (!currentGalleryList.length) {
      grid.innerHTML = `<div class="empty-state">No photos in this category yet. Upload photos from Admin or Staff Portal.</div>`;
      return;
    }

    grid.innerHTML = currentGalleryList
      .map(
        (item, idx) => `
        <article class="gallery-card" data-gidx="${idx}" tabindex="0" role="button" aria-label="View ${esc(item.title)}">
          <img src="${safeImg(item.image)}" alt="${esc(item.title)}" loading="lazy" onerror="this.src=window.NAIL_SALON_FALLBACK_IMG" />
          <div class="gallery-overlay">
            <small>${esc(item.category)}</small>
            <strong>${esc(item.title)}</strong>
          </div>
        </article>`
      )
      .join('');
  }

  function renderMenu() {
    const cats = ['All', ...new Set(appData.menu.map((m) => m.category))];
    if (!cats.includes(activeMenuCat)) activeMenuCat = 'All';

    $('#menu-filters').innerHTML = cats
      .map(
        (c) =>
          `<button type="button" class="filter-tab ${c === activeMenuCat ? 'active' : ''}" data-mcat="${esc(c)}">${esc(c)}</button>`
      )
      .join('');

    const list =
      activeMenuCat === 'All'
        ? appData.menu
        : appData.menu.filter((m) => m.category === activeMenuCat);

    const grid = $('#menu-grid');
    if (!list.length) {
      grid.innerHTML = `<div class="empty-state">No services listed in this category yet.</div>`;
      return;
    }

    grid.innerHTML = list
      .map(
        (srv) => `
        <article class="menu-card">
          <div class="menu-thumb">
            <img src="${safeImg(srv.image)}" alt="${esc(srv.name)}" loading="lazy" onerror="this.src=window.NAIL_SALON_FALLBACK_IMG" />
          </div>
          <div>
            <div class="menu-card-top">
              <h3 class="menu-card-title">${esc(srv.name)}</h3>
              <span class="menu-card-price">${global.NailStore.formatMoney(srv.price)}</span>
            </div>
            <div class="menu-card-meta">${esc(srv.category)} &middot; ${esc(srv.duration)}</div>
            <p class="menu-card-desc">${esc(srv.description)}</p>
            <button type="button" class="btn btn-outline btn-sm js-book-srv" data-srvid="${esc(srv.id)}">Book This Service</button>
          </div>
        </article>`
      )
      .join('');
  }

  function renderBookingSelectors() {
    const dateInput = $('#bk-date');
    const minDate = todayISO();
    dateInput.min = minDate;
    if (!dateInput.value || dateInput.value < minDate) {
      dateInput.value = minDate;
    }

    const srvSelect = $('#bk-service');
    const prevVal = srvSelect.value;
    srvSelect.innerHTML = appData.menu
      .map(
        (s) =>
          `<option value="${esc(s.id)}">${esc(s.name)} — ${global.NailStore.formatMoney(s.price)} (${esc(s.duration)})</option>`
      )
      .join('');
    if (prevVal && appData.menu.some((s) => s.id === prevVal)) {
      srvSelect.value = prevVal;
    }

    const techSelect = $('#bk-tech');
    techSelect.innerHTML = (appData.technicians || ['Any Available Technician'])
      .map((t) => `<option value="${esc(t)}">${esc(t)}</option>`)
      .join('');

    renderTimeSlots();
    updateBookingSummary();
  }

  function renderTimeSlots() {
    const chosenDate = $('#bk-date').value || todayISO();
    const takenTimes = new Set(
      appData.bookings
        .filter((b) => b.date === chosenDate && b.status !== 'Cancelled')
        .map((b) => b.time)
    );

    const slots = appData.timeSlots || [];
    if (takenTimes.has(selectedSlot)) selectedSlot = '';

    $('#bk-slots').innerHTML = slots
      .map((slot) => {
        const isTaken = takenTimes.has(slot);
        const isSel = selectedSlot === slot;
        return `<button type="button" class="slot-btn ${isSel ? 'selected' : ''}" data-slot="${esc(slot)}" ${isTaken ? 'disabled title="Already booked"' : ''}>
          ${esc(slot)}${isTaken ? ' (Full)' : ''}
        </button>`;
      })
      .join('');
  }

  function updateBookingSummary() {
    const chosenDate = $('#bk-date').value || '—';
    const srv = appData.menu.find((s) => s.id === $('#bk-service').value);
    $('#sum-date').textContent = chosenDate;
    $('#sum-time').textContent = selectedSlot || 'Select a time slot';
    $('#sum-service').textContent = srv ? srv.name : '—';
    $('#sum-tech').textContent = $('#bk-tech').value || 'Any Available';
    $('#sum-price').textContent = srv ? global.NailStore.formatMoney(srv.price) : '$0';
  }

  function openLightbox(idx) {
    if (!currentGalleryList.length) return;
    lightboxIndex = (idx + currentGalleryList.length) % currentGalleryList.length;
    const item = currentGalleryList[lightboxIndex];
    $('#lightbox-img').src = item.image || global.NAIL_SALON_FALLBACK_IMG;
    $('#lightbox-title').textContent = item.title;
    $('#lightbox-caption').textContent = `${item.category} — ${item.caption || ''}`;
    $('#lightbox-modal').classList.add('open');
  }

  function bindEvents() {
    // Mobile menu
    $('#mobile-menu-btn').addEventListener('click', () => {
      $('#nav-links').classList.toggle('open');
    });
    $$('#nav-links a').forEach((a) =>
      a.addEventListener('click', () => $('#nav-links').classList.remove('open'))
    );

    // Quick theme switcher
    const switcher = $('#quick-theme-select');
    if (switcher) {
      switcher.addEventListener('change', (e) => {
        window.location.href = e.target.value;
      });
    }

    // Gallery filters & lightbox click
    $('#gallery-filters').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-gcat]');
      if (!btn) return;
      activeGalleryCat = btn.dataset.gcat;
      renderGallery();
    });

    $('#gallery-grid').addEventListener('click', (e) => {
      const card = e.target.closest('[data-gidx]');
      if (card) openLightbox(Number(card.dataset.gidx));
    });

    $('#lightbox-close').addEventListener('click', () => $('#lightbox-modal').classList.remove('open'));
    $('#lightbox-prev').addEventListener('click', () => openLightbox(lightboxIndex - 1));
    $('#lightbox-next').addEventListener('click', () => openLightbox(lightboxIndex + 1));
    $('#lightbox-modal').addEventListener('click', (e) => {
      if (e.target.id === 'lightbox-modal') $('#lightbox-modal').classList.remove('open');
    });

    // Menu filters & "Book This Service"
    $('#menu-filters').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-mcat]');
      if (!btn) return;
      activeMenuCat = btn.dataset.mcat;
      renderMenu();
    });

    $('#menu-grid').addEventListener('click', (e) => {
      const btn = e.target.closest('.js-book-srv');
      if (!btn) return;
      $('#bk-service').value = btn.dataset.srvid;
      updateBookingSummary();
      $('#booking').scrollIntoView({ behavior: 'smooth' });
      showToast('Service selected! Choose your date and time slot.', 'success');
    });

    // Booking by Date interactions
    $('#bk-date').addEventListener('change', () => {
      selectedSlot = '';
      renderTimeSlots();
      updateBookingSummary();
    });
    $('#bk-service').addEventListener('change', updateBookingSummary);
    $('#bk-tech').addEventListener('change', updateBookingSummary);

    $('#bk-slots').addEventListener('click', (e) => {
      const btn = e.target.closest('.slot-btn');
      if (!btn || btn.disabled) return;
      selectedSlot = btn.dataset.slot;
      renderTimeSlots();
      updateBookingSummary();
    });

    $('#booking-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fb = $('#bk-feedback');
      const date = $('#bk-date').value;
      const srv = appData.menu.find((s) => s.id === $('#bk-service').value);
      const name = $('#bk-name').value.trim();
      const phone = $('#bk-phone').value.trim();
      const email = $('#bk-email').value.trim();
      const notes = $('#bk-notes').value.trim();
      const tech = $('#bk-tech').value;

      if (!date || date < todayISO()) {
        fb.className = 'alert-box error show';
        fb.textContent = 'Please select today or a future date.';
        return;
      }
      if (!selectedSlot) {
        fb.className = 'alert-box error show';
        fb.textContent = 'Please choose an available time slot for this date.';
        return;
      }
      if (!name || !phone) {
        fb.className = 'alert-box error show';
        fb.textContent = 'Please enter your full name and phone number.';
        return;
      }

      const submitBtn = $('#bk-submit-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Reserving...';

      try {
        const record = await global.NailStore.addBooking({
          date,
          time: selectedSlot,
          serviceId: srv ? srv.id : '',
          serviceName: srv ? srv.name : 'Nail Service',
          price: srv ? srv.price : 0,
          technician: tech,
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          notes
        });
        appData = await global.NailStore.load();
        selectedSlot = '';
        renderTimeSlots();
        updateBookingSummary();
        $('#bk-name').value = '';
        $('#bk-phone').value = '';
        $('#bk-email').value = '';
        $('#bk-notes').value = '';

        fb.className = 'alert-box success show';
        fb.innerHTML = `<strong>Confirmed (${esc(record.id)})!</strong> We look forward to seeing you on <strong>${esc(record.date)}</strong> at <strong>${esc(record.time)}</strong> for ${esc(record.serviceName)}.`;
        showToast(`Booking ${record.id} confirmed!`, 'success');
      } catch (err) {
        fb.className = 'alert-box error show';
        fb.textContent = err.message || 'Could not save booking.';
        showToast(err.message || 'Booking error', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm Appointment';
      }
    });

    // Contact Us form
    $('#contact-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fb = $('#ct-feedback');
      const name = $('#ct-name').value.trim();
      const email = $('#ct-email').value.trim();
      const phone = $('#ct-phone').value.trim();
      const subject = $('#ct-subject').value.trim() || 'General Inquiry';
      const message = $('#ct-message').value.trim();

      if (!name || !email || !message) {
        fb.className = 'alert-box error show';
        fb.textContent = 'Please fill in your name, email, and message.';
        return;
      }

      await global.NailStore.addMessage({ name, email, phone, subject, message });
      e.target.reset();
      fb.className = 'alert-box success show';
      fb.textContent = 'Thank you! Your message has been sent to our salon team.';
      showToast('Message sent successfully!', 'success');
    });

    // JavaScript Call Us Modal
    document.addEventListener('click', (e) => {
      if (e.target.closest('.js-open-call')) {
        $('#call-modal').classList.add('open');
      }
    });
    $('#call-modal-close').addEventListener('click', () => $('#call-modal').classList.remove('open'));
    $('#call-modal').addEventListener('click', (e) => {
      if (e.target.id === 'call-modal') $('#call-modal').classList.remove('open');
    });

    $('#call-copy-btn').addEventListener('click', async () => {
      const phone = appData.site.phoneDisplay;
      try {
        await navigator.clipboard.writeText(phone);
        showToast(`Copied ${phone} to clipboard!`, 'success');
      } catch {
        showToast(`Phone: ${phone}`, 'info');
      }
    });

    $('#callback-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fb = $('#cb-feedback');
      const name = $('#cb-name').value.trim();
      const phone = $('#cb-phone').value.trim();
      const preferredTime = $('#cb-time').value;
      const note = $('#cb-note').value.trim();

      if (!name || !phone) {
        fb.className = 'alert-box error show';
        fb.textContent = 'Please provide your name and phone number.';
        return;
      }

      await global.NailStore.addCallback({ name, phone, preferredTime, note });
      e.target.reset();
      fb.className = 'alert-box success show';
      fb.textContent = `Callback requested! Our receptionist will call ${phone} (${preferredTime}).`;
      showToast('Callback request sent to salon!', 'success');
    });

    // Keyboard shortcuts (Escape to close modals, arrows in lightbox)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        $('#call-modal').classList.remove('open');
        $('#lightbox-modal').classList.remove('open');
      } else if ($('#lightbox-modal').classList.contains('open')) {
        if (e.key === 'ArrowRight') openLightbox(lightboxIndex + 1);
        if (e.key === 'ArrowLeft') openLightbox(lightboxIndex - 1);
      }
    });

    // Offline UX detection
    const updateOnline = () => {
      $('#offline-banner').classList.toggle('show', !navigator.onLine);
    };
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    updateOnline();
  }

  async function refreshAll() {
    appData = await global.NailStore.load();
    renderSiteContent();
    renderGallery();
    renderMenu();
    renderBookingSelectors();
  }

  async function init() {
    const themeId = Number(document.body.dataset.theme || 1);
    const themeMeta =
      global.NAIL_SALON_THEMES.find((t) => t.id === themeId) || global.NAIL_SALON_THEMES[0];
    document.body.dataset.themeName = themeMeta.name;

    const root = $('#app-root');
    root.innerHTML = buildShellHTML(themeMeta);

    bindEvents();
    await refreshAll();

    // Live sync whenever Admin or Staff saves changes in another tab
    global.NailStore.subscribe(async () => {
      await refreshAll();
      showToast('Live update synced from Salon Portal!', 'info');
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})(window);
