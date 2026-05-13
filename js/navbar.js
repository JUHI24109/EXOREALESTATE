(function () {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  function isActive(page) {
    if (page === 'index.html' && (currentPage === '' || currentPage === 'index.html' || currentPage === 'index.html')) return true;
    return currentPage === page;
  }

  function navLink(href, label) {
    const active = isActive(href);
    return `<a href="${href}" class="exo-nav-link${active ? ' active' : ''}">${label}</a>`;
  }

  const savedLang = (typeof window.getLang === 'function' ? window.getLang() : (localStorage.getItem('exo-lang') || 'en'));
  const langLabels = { en: 'EN', pt: 'PT', fr: 'FR', nl: 'NL', zh: 'ZH', ar: 'AR' };

  const navHTML = `
    <nav class="exo-navbar" id="exo-navbar">
      <div class="exo-navbar-inner">

        <a href="index.html" class="exo-navbar-brand">
          <img src="logo.png" alt="Exo Real Estate" class="exo-navbar-logo" />
        </a>

        <div class="exo-nav-center" id="exo-nav-desktop">
          ${navLink('index.html', '<span data-i18n="navHome">Home</span>')}
          ${navLink('properties.html', '<span data-i18n="navProperties">Properties</span>')}
          ${navLink('about.html', '<span data-i18n="navAbout">About</span>')}
          ${navLink('contact.html', '<span data-i18n="navContact">Contact</span>')}
        </div>

        <div class="exo-nav-actions">
          <div class="exo-lang-dropdown" id="exo-lang-dropdown">
            <button class="exo-lang-btn" id="exo-lang-btn">
              <i class="fas fa-globe"></i>
              <span id="exo-lang-current">${langLabels[savedLang] || 'EN'}</span>
              <i class="fas fa-chevron-down exo-lang-chevron"></i>
            </button>
            <div class="exo-lang-menu" id="exo-lang-menu">
              <a href="#" class="exo-lang-option${savedLang === 'en' ? ' active' : ''}" data-lang="en"><span>English</span><span class="exo-lang-code">EN</span></a>
              <a href="#" class="exo-lang-option${savedLang === 'pt' ? ' active' : ''}" data-lang="pt"><span>Português</span><span class="exo-lang-code">PT</span></a>
              <a href="#" class="exo-lang-option${savedLang === 'fr' ? ' active' : ''}" data-lang="fr"><span>Français</span><span class="exo-lang-code">FR</span></a>
              <a href="#" class="exo-lang-option${savedLang === 'nl' ? ' active' : ''}" data-lang="nl"><span>Dutch</span><span class="exo-lang-code">NL</span></a>
              <a href="#" class="exo-lang-option${savedLang === 'zh' ? ' active' : ''}" data-lang="zh"><span>中文</span><span class="exo-lang-code">ZH</span></a>
              <a href="#" class="exo-lang-option${savedLang === 'ar' ? ' active' : ''}" data-lang="ar"><span>العربية</span><span class="exo-lang-code">AR</span></a>
            </div>
          </div>

          <div id="auth-section" style="display: flex; gap: 10px; align-items: center;">
            <a href="login.html" class="exo-login-btn" id="nav-login-btn" data-i18n="navLogin">Login</a>
          </div>

          <button class="exo-hamburger" id="exo-hamburger" aria-label="Toggle navigation">
            <div class="exo-hamburger-box">
              <span></span><span></span><span></span>
            </div>
          </button>
        </div>
      </div>

      <div class="exo-mobile-menu" id="exo-mobile-menu">
        <div class="exo-mobile-menu-inner">
          ${navLink('index.html', '<span data-i18n="navHome">Home</span>')}
          ${navLink('properties.html', '<span data-i18n="navProperties">Properties</span>')}
          ${navLink('about.html', '<span data-i18n="navAbout">About</span>')}
          ${navLink('contact.html', '<span data-i18n="navContact">Contact</span>')}
          <div class="exo-mobile-divider"></div>
          <div id="mobile-auth-section">
            <a href="login.html" class="exo-nav-link" id="mobile-nav-login-btn" data-i18n="navLogin">Login</a>
          </div>
        </div>
      </div>
    </nav>

    <div class="exo-profile-modal" id="exo-profile-modal" aria-hidden="true">
      <div class="exo-profile-modal-box" role="dialog" aria-modal="true" aria-labelledby="exo-profile-modal-title">
        <div class="exo-profile-modal-head">
          <h3 id="exo-profile-modal-title">User Dashboard</h3>
          <button class="exo-profile-modal-close" id="exo-profile-modal-close" aria-label="Close profile modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="exo-profile-modal-body" id="exo-profile-modal-body">
          <div class="exo-profile-shell">
            <aside class="exo-profile-menu" id="exo-profile-menu">
              <button class="exo-profile-menu-btn active" data-view="dashboard"><i class="fas fa-house"></i> Dashboard</button>
              <button class="exo-profile-menu-btn" data-view="favorites"><i class="fas fa-heart"></i> Favorites</button>
              <button class="exo-profile-menu-btn" data-view="account"><i class="fas fa-user"></i> Account</button>
            </aside>
            <section class="exo-profile-view" id="exo-profile-view">
              <div class="exo-profile-loading"><i class="fas fa-spinner fa-spin"></i> Loading dashboard...</div>
            </section>
          </div>
        </div>
      </div>
    </div>
  `;

  const navCSS = `
    .exo-navbar {
      position: sticky;
      top: 0;
      z-index: 2000;
      background: rgba(255,255,255,0.6);
      backdrop-filter: blur(20px) saturate(1.6);
      -webkit-backdrop-filter: blur(20px) saturate(1.6);
      border-bottom: 1px solid rgba(0,0,0,0.04);
      font-family: 'DM Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      transition: background 0.4s ease, box-shadow 0.4s ease;
    }
    .exo-navbar.scrolled {
      background: rgba(255,255,255,0.92);
      box-shadow: 0 1px 20px rgba(0,0,0,0.05);
    }

    .exo-navbar-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 32px;
      height: 68px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
    }

    /* Brand */
    .exo-navbar-brand {
      display: flex;
      align-items: center;
      text-decoration: none;
      flex-shrink: 0;
      z-index: 1;
    }
    .exo-navbar-logo {
      height: 44px;
      width: auto;
      transition: opacity 0.3s ease;
    }
    .exo-navbar-brand:hover .exo-navbar-logo { opacity: 0.85; }

    /* Center Nav */
    .exo-nav-center {
      display: flex;
      align-items: center;
      gap: 0;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }

    .exo-nav-link {
      position: relative;
      padding: 8px 22px;
      font-size: 14px;
      font-weight: 500;
      color: #64748b;
      text-decoration: none;
      letter-spacing: 0.2px;
      transition: color 0.25s ease;
    }
    .exo-nav-link::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%) scaleX(0);
      width: 20px;
      height: 2px;
      background: #0f172a;
      border-radius: 1px;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .exo-nav-link:hover {
      color: #0f172a;
    }
    .exo-nav-link:hover::after {
      transform: translateX(-50%) scaleX(1);
    }
    .exo-nav-link.active {
      color: #0f172a;
      font-weight: 600;
    }
    .exo-nav-link.active::after {
      transform: translateX(-50%) scaleX(1);
    }

    /* Right Actions */
    .exo-nav-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
      z-index: 1;
    }

    /* Language */
    .exo-lang-dropdown { position: relative; }
    .exo-lang-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 12px;
      font-size: 13px;
      font-weight: 500;
      color: #64748b;
      background: transparent;
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 8px;
      cursor: pointer;
      transition: color 0.2s ease, border-color 0.2s ease;
      font-family: inherit;
    }
    .exo-lang-btn:hover { color: #0f172a; border-color: rgba(0,0,0,0.15); }
    .exo-lang-btn .fa-globe { font-size: 12px; }
    .exo-lang-chevron { font-size: 8px; color: #94a3b8; transition: transform 0.2s ease; }
    .exo-lang-dropdown.open .exo-lang-chevron { transform: rotate(180deg); }

    .exo-lang-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      min-width: 150px;
      background: #fff;
      border: 1px solid rgba(0,0,0,0.06);
      border-radius: 12px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.1);
      padding: 6px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-8px);
      transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease;
    }
    .exo-lang-dropdown.open .exo-lang-menu { opacity: 1; visibility: visible; transform: translateY(0); }
    .exo-lang-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 9px 14px;
      font-size: 13px;
      font-weight: 500;
      color: #64748b;
      text-decoration: none;
      border-radius: 8px;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .exo-lang-option:hover { background: #f8fafc; color: #0f172a; }
    .exo-lang-option.active { color: #0f172a; font-weight: 600; }
    .exo-lang-code { font-size: 11px; font-weight: 600; color: #cbd5e1; letter-spacing: 0.5px; }
    .exo-lang-option.active .exo-lang-code { color: #0f172a; }

    /* Login */
    .exo-login-btn {
      padding: 8px 22px;
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      background: transparent;
      border: 1.5px solid #0f172a;
      border-radius: 8px;
      text-decoration: none;
      letter-spacing: 0.3px;
      transition: background 0.25s ease, color 0.25s ease;
    }
    .exo-login-btn:hover {
      background: #0f172a;
      color: #fff;
    }

    /* Hamburger */
    .exo-hamburger {
      display: none;
      padding: 8px;
      border: none;
      background: none;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .exo-hamburger-box { width: 22px; height: 16px; position: relative; }
    .exo-hamburger-box span {
      display: block;
      position: absolute;
      left: 0;
      width: 100%;
      height: 1.5px;
      background: #1e293b;
      border-radius: 1px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .exo-hamburger-box span:nth-child(1) { top: 0; }
    .exo-hamburger-box span:nth-child(2) { top: 7px; width: 65%; }
    .exo-hamburger-box span:nth-child(3) { top: 14px; width: 80%; }
    .exo-hamburger.open .exo-hamburger-box span:nth-child(1) { top: 7px; transform: rotate(45deg); }
    .exo-hamburger.open .exo-hamburger-box span:nth-child(2) { opacity: 0; width: 0; }
    .exo-hamburger.open .exo-hamburger-box span:nth-child(3) { top: 7px; transform: rotate(-45deg); width: 100%; }

    /* Mobile Menu */
    .exo-mobile-menu {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      background: rgba(255,255,255,0.98);
      backdrop-filter: blur(20px);
      border-top: 1px solid rgba(0,0,0,0.04);
    }
    .exo-mobile-menu.open { max-height: 380px; }
    .exo-mobile-menu-inner {
      padding: 16px 32px 28px;
      display: flex;
      flex-direction: column;
      gap: 0;
    }
    .exo-mobile-menu .exo-nav-link {
      padding: 14px 0;
      font-size: 16px;
      border-bottom: 1px solid rgba(0,0,0,0.04);
    }
    .exo-mobile-menu .exo-nav-link::after { display: none; }
    .exo-mobile-menu .exo-nav-link:last-child { border-bottom: none; }
    .exo-mobile-divider { display: none; }

    .exo-profile-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 8px 16px;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(0,0,0,0.02);
    }
    .exo-profile-btn:hover { background: #f1f5f9; border-color: #cbd5e1; box-shadow: 0 2px 4px rgba(0,0,0,0.04); }
    
    .exo-logout-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #ef4444;
      background: #fef2f2;
      border: 1px solid #fee2e2;
      border-radius: 12px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 1px 2px rgba(0,0,0,0.02);
    }
    .exo-logout-btn:hover { background: #fee2e2; border-color: #fca5a5; box-shadow: 0 2px 4px rgba(0,0,0,0.04); }
    
    .exo-profile-btn i, .exo-logout-btn i { font-size: 14px; }

    .exo-profile-modal {
      position: fixed;
      inset: 0;
      z-index: 3200;
      background: rgba(15,23,42,0.42);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .exo-profile-modal.open { display: flex; }
    .exo-profile-modal-box {
      width: min(880px, 95vw);
      max-height: 86vh;
      background: #fff;
      border-radius: 18px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 30px 60px rgba(15,23,42,0.25);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .exo-profile-modal-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 16px 20px;
      border-bottom: 1px solid #e2e8f0;
    }
    .exo-profile-modal-head h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
    }
    .exo-profile-modal-close {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      background: #fff;
      color: #64748b;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    .exo-profile-modal-close:hover { color: #0f172a; background: #f8fafc; }
    .exo-profile-modal-body {
      padding: 18px;
      overflow-y: auto;
    }
    .exo-profile-shell {
      display: grid;
      grid-template-columns: 220px 1fr;
      gap: 14px;
      min-height: 360px;
    }
    .exo-profile-menu {
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      background: #f8fafc;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-self: start;
    }
    .exo-profile-menu-btn {
      border: 1px solid transparent;
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 13px;
      font-weight: 700;
      color: #334155;
      background: transparent;
      cursor: pointer;
      text-align: left;
      display: inline-flex;
      align-items: center;
      gap: 9px;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .exo-profile-menu-btn:hover {
      background: #fff;
      border-color: #e2e8f0;
      color: #0f172a;
    }
    .exo-profile-menu-btn.active {
      background: #eef2ff;
      border-color: #c7d2fe;
      color: #3730a3;
    }
    .exo-profile-view {
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      background: #fff;
      padding: 14px;
      min-height: 330px;
    }
    .exo-profile-dashboard-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      margin-bottom: 12px;
    }
    .exo-profile-stat {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: #f8fafc;
      padding: 12px;
    }
    .exo-profile-stat .label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 6px;
      font-weight: 700;
    }
    .exo-profile-stat .value {
      font-size: 20px;
      color: #0f172a;
      font-weight: 800;
      line-height: 1;
    }
    .exo-profile-quick {
      margin-top: 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .exo-profile-quick-btn {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      background: #fff;
      color: #0f172a;
      font-size: 12px;
      font-weight: 700;
      text-decoration: none;
      padding: 9px 12px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s ease;
    }
    .exo-profile-quick-btn:hover {
      border-color: #cbd5e1;
      background: #f8fafc;
    }
    .exo-profile-account {
      display: grid;
      gap: 10px;
    }
    .exo-profile-account-item {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: #f8fafc;
      padding: 12px;
    }
    .exo-profile-account-item .label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 4px;
    }
    .exo-profile-account-item .value {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      word-break: break-word;
    }
    .exo-profile-edit-name {
      display: grid;
      gap: 8px;
      margin-top: 4px;
    }
    .exo-profile-display-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      background: #fff;
      padding: 10px 12px;
    }
    .exo-profile-display-text {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .exo-profile-edit-toggle {
      width: 30px;
      height: 30px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      background: #fff;
      color: #475569;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .exo-profile-edit-toggle:hover {
      border-color: #94a3b8;
      color: #0f172a;
      background: #f8fafc;
    }
    .exo-profile-edit-panel {
      display: none;
      gap: 8px;
    }
    .exo-profile-edit-panel.open {
      display: grid;
    }
    .exo-profile-name-input {
      width: 100%;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 14px;
      font-family: inherit;
      color: #0f172a;
      background: #fff;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .exo-profile-name-input:focus {
      border-color: #4f6ef7;
      box-shadow: 0 0 0 3px rgba(79,110,247,0.12);
    }
    .exo-profile-name-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .exo-profile-save-btn {
      border: 1px solid #4f6ef7;
      border-radius: 10px;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 700;
      color: #fff;
      background: #4f6ef7;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.2s ease, border-color 0.2s ease;
    }
    .exo-profile-save-btn:hover {
      background: #3b5de7;
      border-color: #3b5de7;
    }
    .exo-profile-save-btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
    .exo-profile-name-status {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
    }
    .exo-profile-name-status.error { color: #dc2626; }
    .exo-profile-name-status.success { color: #15803d; }
    .exo-profile-loading,
    .exo-profile-empty {
      min-height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-size: 14px;
      color: #64748b;
      border: 1px dashed #cbd5e1;
      border-radius: 14px;
      background: #f8fafc;
    }
    .exo-fav-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
      gap: 14px;
    }
    .exo-fav-card {
      display: block;
      text-decoration: none;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      overflow: hidden;
      background: #fff;
      color: #0f172a;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .exo-fav-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 28px rgba(15,23,42,0.11);
    }
    .exo-fav-img {
      height: 150px;
      background-size: cover;
      background-position: center;
      background-color: #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
    }
    .exo-fav-body {
      padding: 12px;
    }
    .exo-fav-actions {
      margin-top: 10px;
      display: flex;
      justify-content: flex-end;
    }
    .exo-fav-remove-btn {
      border: 1px solid #fecaca;
      background: #fff5f5;
      color: #b91c1c;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
      padding: 7px 10px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }
    .exo-fav-remove-btn:hover {
      background: #fee2e2;
      border-color: #fca5a5;
    }
    .exo-fav-remove-btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
    .exo-fav-title {
      font-size: 14px;
      font-weight: 700;
      line-height: 1.35;
      margin-bottom: 6px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .exo-fav-sub {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 8px;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .exo-fav-price {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
    }

    /* Responsive */
    @media (max-width: 900px) {
      .exo-nav-center { display: none; }
      .exo-login-btn { display: none; }
      .exo-hamburger { display: block; }
      .exo-navbar-inner { height: 58px; padding: 0 20px; }
      .exo-navbar-logo { height: 36px; }
      .exo-lang-btn span { display: none; }
      .exo-lang-chevron { display: none !important; }
      .exo-lang-btn { padding: 7px 9px; }
      .exo-mobile-menu-inner { padding: 12px 20px 24px; }
      .exo-profile-shell {
        grid-template-columns: 1fr;
      }
      .exo-profile-menu {
        flex-direction: row;
        overflow-x: auto;
        padding: 8px;
      }
      .exo-profile-menu-btn {
        white-space: nowrap;
      }
      .exo-profile-dashboard-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  const style = document.createElement('style');
  style.textContent = navCSS;
  document.head.appendChild(style);

  const placeholder = document.getElementById('exo-navbar-placeholder');
  if (placeholder) {
    placeholder.outerHTML = navHTML;
  } else {
    document.body.insertAdjacentHTML('afterbegin', navHTML);
  }

  const hamburger = document.getElementById('exo-hamburger');
  const mobileMenu = document.getElementById('exo-mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
  }

  const navbar = document.getElementById('exo-navbar');
  const profileModal = document.getElementById('exo-profile-modal');
  const profileModalBody = document.getElementById('exo-profile-modal-body');
  const profileModalTitle = document.getElementById('exo-profile-modal-title');
  const profileModalClose = document.getElementById('exo-profile-modal-close');
  const profileMenu = document.getElementById('exo-profile-menu');
  const profileView = document.getElementById('exo-profile-view');
  window.addEventListener('scroll', function () {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  const langDropdown = document.getElementById('exo-lang-dropdown');
  const langBtn = document.getElementById('exo-lang-btn');
  const langMenu = document.getElementById('exo-lang-menu');

  if (langBtn && langDropdown) {
    langBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      langDropdown.classList.toggle('open');
    });
    document.addEventListener('click', function () {
      langDropdown.classList.remove('open');
    });
    langMenu.addEventListener('click', function (e) {
      const option = e.target.closest('.exo-lang-option');
      if (!option) return;
      e.preventDefault();
      const lang = option.dataset.lang;
      langMenu.querySelectorAll('.exo-lang-option').forEach(function (o) { o.classList.remove('active'); });
      option.classList.add('active');
      document.getElementById('exo-lang-current').textContent = langLabels[lang] || 'EN';
      langDropdown.classList.remove('open');
      if (typeof window.setLang === 'function') {
        window.setLang(lang);
      } else {
        localStorage.setItem('exo-lang', lang);
        if (typeof window.applyLanguage === 'function') window.applyLanguage(lang);
      }
    });
  }

  // Handle Auth UI
  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }

  function chunkArray(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  async function loadFavoriteProperties(user) {
    if (!user || !db) return [];

    let favoriteIds = [];
    try {
      const userDoc = await db.collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        const u = userDoc.data() || {};
        favoriteIds = Array.isArray(u.favorites)
          ? u.favorites
          : (Array.isArray(u.favourites) ? u.favourites : []);
      }
    } catch (e) {
      favoriteIds = [];
    }

    if (!favoriteIds.length) return [];

    const mapById = {};

    try {
      const chunks = chunkArray(favoriteIds, 10);
      for (const ids of chunks) {
        const snap = await db.collection('properties').where('id', 'in', ids).get();
        snap.docs.forEach(doc => {
          const data = doc.data() || {};
          const id = data.id || doc.id;
          mapById[id] = { id, ...data };
        });
      }
    } catch (e) {
      // Continue with fallbacks.
    }

    const missing = favoriteIds.filter(id => !mapById[id]);
    if (missing.length) {
      try {
        const directDocs = await Promise.all(missing.map(id => db.collection('properties').doc(id).get()));
        directDocs.forEach(doc => {
          if (!doc.exists) return;
          const data = doc.data() || {};
          const id = data.id || doc.id;
          mapById[id] = { id, ...data };
        });
      } catch (e) {
        // Continue without direct-doc fallback.
      }
    }

    return favoriteIds.map(id => mapById[id]).filter(Boolean);
  }

  async function countUserInquiries(user) {
    if (!user || !db) return 0;
    try {
      const userEmail = String(user.email || '').toLowerCase();
      if (!userEmail) return 0;
      const snap = await db.collection('inquiries').where('email', '==', userEmail).get();
      return snap.size || 0;
    } catch (e) {
      return 0;
    }
  }

  const profileState = {
    user: null,
    role: 'user',
    favorites: [],
    loadingFavorites: false,
    inquiriesCount: 0
  };

  function setActiveProfileMenu(view) {
    if (!profileMenu) return;
    profileMenu.querySelectorAll('.exo-profile-menu-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });
  }

  function renderProfileDashboard() {
    if (!profileView) return;
    const favCount = profileState.favorites.length;
    const inquiries = profileState.inquiriesCount;
    const name = profileState.user?.displayName || profileState.user?.email || 'User';

    profileModalTitle.textContent = 'User Dashboard';
    profileView.innerHTML =
      '<div class="exo-profile-dashboard-grid">' +
        '<div class="exo-profile-stat"><div class="label">Favorites</div><div class="value">' + favCount + '</div></div>' +
        '<div class="exo-profile-stat"><div class="label">Inquiries</div><div class="value">' + inquiries + '</div></div>' +
        '<div class="exo-profile-stat"><div class="label">Saved</div><div class="value" style="font-size:15px;">' + (favCount ? 'Active' : 'Empty') + '</div></div>' +
      '</div>' +
      '<div class="exo-profile-account-item" style="margin-bottom:10px;">' +
        '<div class="label">Signed in as</div>' +
        '<div class="value">' + escapeHtml(name) + '</div>' +
      '</div>' +
      '<div class="exo-profile-quick">' +
        '<button class="exo-profile-quick-btn" type="button" id="exo-open-favorites"><i class="fas fa-heart"></i> View Favorites</button>' +
        '<a class="exo-profile-quick-btn" href="properties.html"><i class="fas fa-building"></i> Browse Properties</a>' +
        '<a class="exo-profile-quick-btn" href="contact.html"><i class="fas fa-envelope"></i> Contact Support</a>' +
      '</div>';

    profileView.querySelector('#exo-open-favorites')?.addEventListener('click', function () {
      setActiveProfileMenu('favorites');
      renderProfileFavorites(profileState.favorites);
    });
  }

  function renderProfileFavorites(items) {
    if (!profileView) return;
    profileModalTitle.textContent = 'My Favorites';
    if (!items.length) {
      profileView.innerHTML = '<div class="exo-profile-empty"><i class="fas fa-heart"></i> No favorite properties yet.</div>';
      return;
    }

    profileView.innerHTML = '<div class="exo-fav-grid">' + items.map(function (p) {
      const img = Array.isArray(p.images) && p.images.length ? p.images[0] : (p.image || 'images/artboard1.jpg');
      const price = Number(p.price || 0);
      return (
        '<div class="exo-fav-card">' +
          '<a href="property-detail.html?id=' + encodeURIComponent(p.id || '') + '" style="display:block; text-decoration:none; color:inherit;">' +
            '<div class="exo-fav-img" style="background-image:url(\'' + img + '\')"></div>' +
            '<div class="exo-fav-body">' +
              '<div class="exo-fav-title">' + escapeHtml(p.title || 'Untitled Property') + '</div>' +
              '<div class="exo-fav-sub">' + escapeHtml(p.address || '') + '</div>' +
              '<div class="exo-fav-price">' + (p.priceOnRequest ? 'On Request' : ('€' + price.toLocaleString())) + '</div>' +
            '</div>' +
          '</a>' +
          '<div class="exo-fav-actions" style="padding: 0 12px 12px;">' +
            '<button type="button" class="exo-fav-remove-btn" data-remove-favorite-id="' + escapeHtml(p.id || '') + '"><i class="fas fa-heart-crack"></i> Remove</button>' +
          '</div>' +
        '</div>'
      );
    }).join('') + '</div>';

    profileView.querySelectorAll('[data-remove-favorite-id]').forEach(function(btn) {
      btn.addEventListener('click', async function (e) {
        e.preventDefault();
        e.stopPropagation();
        const propertyId = btn.getAttribute('data-remove-favorite-id') || '';
        if (!propertyId) return;
        btn.disabled = true;
        const icon = btn.querySelector('i');
        if (icon) icon.className = 'fas fa-spinner fa-spin';
        await removeFavoriteFromProfile(propertyId);
      });
    });
  }

  async function removeFavoriteFromProfile(propertyId) {
    const targetId = String(propertyId || '').trim();
    if (!targetId) return;

    const nextFavorites = (profileState.favorites || []).filter(function (p) {
      return String(p.id || '') !== targetId;
    });
    profileState.favorites = nextFavorites;

    const ids = nextFavorites.map(function (p) { return String(p.id || ''); }).filter(Boolean);
    try {
      localStorage.setItem('exo-favorites', JSON.stringify(ids));
    } catch (e) {
      // Ignore storage failures.
    }

    try {
      if (typeof db !== 'undefined' && db && profileState.user?.uid) {
        await db.collection('users').doc(profileState.user.uid).set({ favorites: ids }, { merge: true });
      }
    } catch (e) {
      // Keep local state even if remote write fails.
    }

    const active = profileMenu?.querySelector('.exo-profile-menu-btn.active')?.dataset.view || 'favorites';
    switchProfileView(active);
  }

  function renderProfileAccount() {
    if (!profileView) return;
    const user = profileState.user || {};
    const currentName = String(user.displayName || user.email || 'User');
    profileModalTitle.textContent = 'Account';
    profileView.innerHTML =
      '<div class="exo-profile-account">' +
        '<div class="exo-profile-account-item">' +
          '<div class="label">Display Name</div>' +
          '<div class="exo-profile-edit-name">' +
            '<div class="exo-profile-display-row">' +
              '<div class="exo-profile-display-text" id="exo-display-name-text">' + escapeHtml(currentName) + '</div>' +
              '<button type="button" class="exo-profile-edit-toggle" id="exo-edit-display-name" aria-label="Edit display name" title="Edit display name"><i class="fas fa-pen"></i></button>' +
            '</div>' +
            '<div class="exo-profile-edit-panel" id="exo-display-name-panel">' +
              '<input id="exo-display-name-input" class="exo-profile-name-input" type="text" maxlength="80" value="' + escapeHtml(currentName) + '" placeholder="Enter display name" />' +
              '<div class="exo-profile-name-actions">' +
                '<button type="button" class="exo-profile-save-btn" id="exo-save-display-name">Save Name</button>' +
                '<button type="button" class="exo-profile-quick-btn" id="exo-cancel-display-name">Cancel</button>' +
                '<span class="exo-profile-name-status" id="exo-display-name-status"></span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="exo-profile-account-item"><div class="label">Email</div><div class="value">' + escapeHtml(user.email || 'Not available') + '</div></div>' +
      '</div>';

    const editBtn = profileView.querySelector('#exo-edit-display-name');
    const panel = profileView.querySelector('#exo-display-name-panel');
    const cancelBtn = profileView.querySelector('#exo-cancel-display-name');
    const displayText = profileView.querySelector('#exo-display-name-text');
    const saveBtn = profileView.querySelector('#exo-save-display-name');
    const input = profileView.querySelector('#exo-display-name-input');
    const status = profileView.querySelector('#exo-display-name-status');

    function openEditor() {
      panel?.classList.add('open');
      if (input) {
        input.focus();
        input.select();
      }
    }

    function closeEditor() {
      panel?.classList.remove('open');
      if (input) input.value = String(profileState.user?.displayName || profileState.user?.email || '');
      setStatus('');
    }

    function setStatus(message, type) {
      if (!status) return;
      status.textContent = message || '';
      status.classList.remove('error', 'success');
      if (type) status.classList.add(type);
    }

    async function saveDisplayName() {
      const raw = input ? input.value : '';
      const nextName = String(raw || '').trim();
      if (!nextName) {
        setStatus('Display name cannot be empty.', 'error');
        return;
      }
      if (nextName.length < 2) {
        setStatus('Use at least 2 characters.', 'error');
        return;
      }

      setStatus('Saving...');
      if (saveBtn) saveBtn.disabled = true;

      try {
        const authUser = (typeof auth !== 'undefined' && auth && auth.currentUser) ? auth.currentUser : null;

        if (authUser && typeof authUser.updateProfile === 'function') {
          await authUser.updateProfile({ displayName: nextName });
        }

        if (typeof db !== 'undefined' && db && profileState.user?.uid) {
          await db.collection('users').doc(profileState.user.uid).set({ name: nextName }, { merge: true });
        }

        profileState.user = {
          ...(profileState.user || {}),
          displayName: nextName
        };

        if (displayText) displayText.textContent = nextName;

        const cached = readAuthCache() || {};
        writeAuthCache({
          uid: profileState.user.uid || cached.uid || '',
          email: profileState.user.email || cached.email || '',
          role: profileState.role || cached.role || 'user',
          ts: Date.now()
        });

        setStatus('Display name updated.', 'success');
        setTimeout(() => {
          panel?.classList.remove('open');
        }, 500);
        setTimeout(() => {
          if (profileMenu?.querySelector('.exo-profile-menu-btn.active')?.dataset.view === 'dashboard') {
            renderProfileDashboard();
          }
        }, 50);
      } catch (err) {
        setStatus('Could not update display name.', 'error');
      } finally {
        if (saveBtn) saveBtn.disabled = false;
      }
    }

    editBtn?.addEventListener('click', openEditor);
    cancelBtn?.addEventListener('click', closeEditor);
    saveBtn?.addEventListener('click', saveDisplayName);
    input?.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveDisplayName();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        closeEditor();
      }
    });
  }

  function switchProfileView(view) {
    setActiveProfileMenu(view);
    if (view === 'favorites') {
      if (profileState.loadingFavorites && !profileState.favorites.length) {
        profileView.innerHTML = '<div class="exo-profile-loading"><i class="fas fa-spinner fa-spin"></i> Loading favorites...</div>';
      } else {
        renderProfileFavorites(profileState.favorites);
      }
      return;
    }
    if (view === 'account') {
      renderProfileAccount();
      return;
    }
    renderProfileDashboard();
  }

  async function openProfileModalForUser(user, role) {
    if (!profileModal || !profileView) return;
    profileState.user = user;
    profileState.role = role || 'user';
    profileState.inquiriesCount = await countUserInquiries(user);
    profileState.loadingFavorites = true;

    profileModal.classList.add('open');
    profileModal.setAttribute('aria-hidden', 'false');
    switchProfileView('dashboard');

    const items = await loadFavoriteProperties(user);
    profileState.favorites = items;
    profileState.loadingFavorites = false;

    const active = profileMenu?.querySelector('.exo-profile-menu-btn.active')?.dataset.view || 'dashboard';
    switchProfileView(active);
  }

  function closeProfileModal() {
    if (!profileModal) return;
    profileModal.classList.remove('open');
    profileModal.setAttribute('aria-hidden', 'true');
  }

  profileModalClose?.addEventListener('click', closeProfileModal);
  profileModal?.addEventListener('click', function (e) {
    if (e.target === profileModal) closeProfileModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeProfileModal();
  });

  profileMenu?.addEventListener('click', function (e) {
    const btn = e.target.closest('.exo-profile-menu-btn');
    if (!btn) return;
    switchProfileView(btn.dataset.view || 'dashboard');
  });

  const AUTH_CACHE_KEY = 'exo-auth-cache';

  function readAuthCache() {
    try {
      const raw = localStorage.getItem(AUTH_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.uid) return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function writeAuthCache(payload) {
    try {
      localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(payload));
    } catch (e) {
      // Ignore localStorage write failures.
    }
  }

  function clearAuthCache() {
    try {
      localStorage.removeItem(AUTH_CACHE_KEY);
    } catch (e) {
      // Ignore localStorage clear failures.
    }
  }

  function resolveProfileLink(role) {
    if (role === 'admin') return 'admin.html';
    if (role === 'agent' || role === 'dealer') return 'agent.html';
    return 'index.html';
  }

  function renderLoggedInNav(userLike, role) {
    const authSection = document.getElementById('auth-section');
    const mobileAuthSection = document.getElementById('mobile-auth-section');
    if (!authSection || !mobileAuthSection) return;

    const safeRole = role || 'user';
    const profileLink = resolveProfileLink(safeRole);
    const isUserRole = safeRole !== 'admin' && safeRole !== 'agent' && safeRole !== 'dealer';

    const profileHtml = isUserRole
      ? '<button id="nav-profile-btn" class="exo-profile-btn" title="Profile"><i class="fas fa-user-circle"></i> <span data-i18n="navAgent">Profile</span></button>'
      : '<a href="' + profileLink + '" id="nav-profile-btn" class="exo-profile-btn" title="Profile"><i class="fas fa-user-circle"></i> <span data-i18n="navAgent">Profile</span></a>';
    const logoutHtml = '<button id="nav-logout-btn" class="exo-logout-btn" title="Logout"><i class="fas fa-sign-out-alt"></i> <span data-i18n="navLogout">Logout</span></button>';

    authSection.innerHTML = profileHtml + logoutHtml;
    mobileAuthSection.innerHTML =
      '<button id="mobile-nav-profile-btn" class="exo-nav-link" style="text-align:left; border:none; background:none; font-weight:500; font-family:inherit; color:#0f172a; width:100%; cursor:pointer; display:flex; align-items:center; gap:10px;"><i class="fas fa-user-circle" style="font-size:16px;"></i> <span data-i18n="navAgent">Profile</span></button>' +
      '<button id="mobile-nav-logout-btn" class="exo-nav-link" style="text-align:left; border:none; background:none; font-weight:500; font-family:inherit; color:#ef4444; width:100%; cursor:pointer; display:flex; align-items:center; gap:10px;"><i class="fas fa-sign-out-alt" style="font-size:16px;"></i> <span data-i18n="navLogout">Logout</span></button>';

    if (typeof window.applyLanguage === 'function') {
      window.applyLanguage(typeof window.getLang === 'function' ? window.getLang() : (localStorage.getItem('exo-lang') || 'en'));
    }

    document.getElementById('nav-logout-btn')?.addEventListener('click', () => {
      if (typeof auth !== 'undefined') auth.signOut();
      clearAuthCache();
    });
    document.getElementById('mobile-nav-logout-btn')?.addEventListener('click', () => {
      if (typeof auth !== 'undefined') auth.signOut();
      clearAuthCache();
    });

    document.getElementById('nav-profile-btn')?.addEventListener('click', (e) => {
      if (!isUserRole) return;
      e.preventDefault();
      openProfileModalForUser(userLike, safeRole);
    });

    document.getElementById('mobile-nav-profile-btn')?.addEventListener('click', (e) => {
      const hamburger = document.getElementById('exo-hamburger');
      const mobileMenu = document.getElementById('exo-mobile-menu');
      if (hamburger) hamburger.classList.remove('open');
      if (mobileMenu) mobileMenu.classList.remove('open');
      if (isUserRole) {
        e.preventDefault();
        openProfileModalForUser(userLike, safeRole);
      } else {
        window.location.href = profileLink;
      }
    });
  }

  function renderLoggedOutNav() {
    const authSection = document.getElementById('auth-section');
    const mobileAuthSection = document.getElementById('mobile-auth-section');
    if (!authSection || !mobileAuthSection) return;
    closeProfileModal();
    authSection.innerHTML = '<a href="login.html" class="exo-login-btn" id="nav-login-btn" data-i18n="navLogin">Login</a>';
    mobileAuthSection.innerHTML = '<a href="login.html" class="exo-nav-link" id="mobile-nav-login-btn" data-i18n="navLogin">Login</a>';
    if (typeof window.applyLanguage === 'function') {
      window.applyLanguage(typeof window.getLang === 'function' ? window.getLang() : (localStorage.getItem('exo-lang') || 'en'));
    }
  }

  // Optimistic render from cache to avoid Login flash on reload/navigation.
  const cachedAuth = readAuthCache();
  if (cachedAuth && cachedAuth.uid) {
    renderLoggedInNav({ uid: cachedAuth.uid, email: cachedAuth.email || '' }, cachedAuth.role || 'user');
  }

  function updateAuthUI() {
    if (window.__exoNavbarAuthInitialized) return;
    if (typeof auth === 'undefined' || typeof db === 'undefined') {
      // Retry in 100ms if firebase script is loaded later
      if (!window.__authRetryCount) window.__authRetryCount = 0;
      if (window.__authRetryCount < 20) {
        window.__authRetryCount++;
        setTimeout(updateAuthUI, 100);
      }
      return;
    }

    window.__exoNavbarAuthInitialized = true;
    if (typeof window.__exoNavbarAuthUnsub === 'function') {
      try { window.__exoNavbarAuthUnsub(); } catch (_) {}
    }

    window.__exoNavbarAuthUnsub = auth.onAuthStateChanged(async user => {
      if (user) {
        // Render immediately, then refine role once loaded.
        const cached = readAuthCache();
        const initialRole = cached?.uid === user.uid ? (cached.role || 'user') : 'user';
        renderLoggedInNav(user, initialRole);

        let role = initialRole;
        try {
          const doc = await db.collection("users").doc(user.uid).get();
          if (doc.exists) {
            const data = doc.data();
            role = data.role || 'user';
          }
        } catch(e) {
          // Keep initial role if role fetch fails.
        }

        writeAuthCache({ uid: user.uid, email: user.email || '', role: role, ts: Date.now() });
        renderLoggedInNav(user, role);

      } else {
        clearAuthCache();
        renderLoggedOutNav();
      }
    });
  }

  // Wait for firebase to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateAuthUI, { once: true });
  } else {
    setTimeout(updateAuthUI, 500); // Give it a slight delay just in case script tags are loading async
  }

})();
