/**
 * Exo Real Estate - Main JavaScript Framework
 * Multilingual, Search/Filter, Slider, Chatbot, Modal, Admin
 */

let properties = [];


let currentLang = (window.getLang && typeof window.getLang === 'function') ? window.getLang() : 'en';
let filteredProperties = [];
let chatbotMessages = [];
let heroFallbackInterval = null;
let heroSwiperInstance = null;

// Init
document.addEventListener('DOMContentLoaded', init);

function init() {
  initLanguageBridge();
  initLangSwitcher();
  initSwipers();
  initScrollAnimations();
  initSearch();
  initChatbot();
  loadProperties();
  // Page specific
  if (document.querySelector('.properties-page')) initProperties();
  if (document.getElementById('admin-password')) initAdmin();
}

function getPropertySizeValue(property) {
  if (!property) return 0;
  var rawSize = property.size;
  if (rawSize === undefined || rawSize === null || rawSize === '') {
    rawSize = property.areaInternal !== undefined && property.areaInternal !== null && property.areaInternal !== ''
      ? property.areaInternal
      : (property.areaPlot !== undefined && property.areaPlot !== null && property.areaPlot !== ''
        ? property.areaPlot
        : (property.totalArea !== undefined && property.totalArea !== null && property.totalArea !== ''
          ? property.totalArea
          : 0));
  }
  var numericSize = typeof rawSize === 'string' ? parseFloat(rawSize.replace(/,/g, '')) : Number(rawSize);
  return Number.isFinite(numericSize) ? numericSize : 0;
}

function getPropertyKitchenValue(property) {
  if (!property) return 0;
  var rawKitchen = property.kitchen !== undefined && property.kitchen !== null && property.kitchen !== ''
    ? property.kitchen
    : (property.kitchens !== undefined && property.kitchens !== null && property.kitchens !== '' ? property.kitchens : 0);
  var numericKitchen = typeof rawKitchen === 'string' ? parseInt(rawKitchen, 10) : Number(rawKitchen);
  return Number.isFinite(numericKitchen) ? numericKitchen : 0;
}

function getPropertyTitle(property) {
  return property && typeof property.title === 'string' && property.title.trim() ? property.title.trim() : 'Untitled property';
}

function getPropertyAddress(property) {
  return property && typeof property.address === 'string' ? property.address : '';
}

function getPropertyStatusLabel(property, lang) {
  var status = property && property.status ? property.status : window.t('statusForSale', lang);
  return window.translateListingStatus ? window.translateListingStatus(status, lang) : status;
}

function syncPropertyCache(list) {
  if (!Array.isArray(list)) return;
  if (window.ExoStore && typeof window.ExoStore.getState === 'function' && typeof window.ExoStore.setState === 'function') {
    var state = window.ExoStore.getState() || {};
    state.properties = list;
    window.ExoStore.setState(state);
  }
  window.__exoPropertiesCache = list;
  window.__exoPropertiesLoadedAt = Date.now();
}

// Multilingual
function initLanguageBridge() {
  if (window.getLang && typeof window.getLang === 'function') {
    currentLang = window.getLang() || currentLang;
  }
  updateLanguage(currentLang);

  window.addEventListener('exo:languageChanged', (ev) => {
    const lang = ev && ev.detail && ev.detail.lang
      ? ev.detail.lang
      : ((window.getLang && typeof window.getLang === 'function') ? window.getLang() : currentLang);
    if (!lang) return;
    currentLang = lang;
    updateLanguage(currentLang);
  });
}

function initLangSwitcher() {
  const dropdown = document.querySelector('.lang-dropdown');
  const menu = document.querySelector('.lang-menu');
  
  dropdown?.addEventListener('click', () => menu.classList.toggle('active'));
  
  document.querySelectorAll('.lang-item')?.forEach(item => {
    item.addEventListener('click', () => {
      const lang = item.dataset.lang;
      if (!lang) return;
      currentLang = lang;
      if (window.setLang && typeof window.setLang === 'function') {
        window.setLang(currentLang);
      } else {
        updateLanguage(currentLang);
      }
      menu.classList.remove('active');
    });
  });
}

function updateLanguage(lang) {
  document.documentElement.lang = lang;
  currentLang = lang;
  // i18n.js handles data-i18n DOM translation; keep main.js in sync for local widgets.
  const chatLangSelect = document.querySelector('.chat-lang-select');
  if (chatLangSelect) chatLangSelect.value = lang;
  // Rerender pages
  if (document.querySelector('.properties-grid')) renderProperties(filteredProperties);
}

// Sliders (Swiper CDN in HTML)
function initSwipers() {
  // Always start fallback first for immediate effect
  fallbackSlider();
  
  // Try Swiper multiple times (max 10 retries)
  let retries = 0;
  function tryInitSwiper() {
    retries++;
    const heroEl = document.querySelector('.hero-slider');
    if (!heroEl) return;
    if (typeof Swiper === 'undefined') {
      if (retries < 10) {
        setTimeout(tryInitSwiper, 300);
      } else {
      }
      return;
    }
    try {
      if (heroSwiperInstance && typeof heroSwiperInstance.destroy === 'function') {
        heroSwiperInstance.destroy(true, true);
      }

      heroSwiperInstance = new Swiper('.hero-slider', {
        loop: true,
        autoplay: { 
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true 
        },
        pagination: { 
          el: '.swiper-pagination', 
          clickable: true,
          dynamicBullets: true 
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        effect: 'fade',
        fadeEffect: { crossFade: true },
        speed: 1000,
        on: {}
      });
      // Disable fallback when Swiper active
      window.heroSwiperActive = true;
      if (heroFallbackInterval) {
        clearInterval(heroFallbackInterval);
        heroFallbackInterval = null;
      }
    } catch (e) {
      console.error('Swiper init error:', e);
    }
  }

  function fallbackSlider() {
    let slideIndex = 0;
    const slides = document.querySelectorAll('.hero-slider .swiper-slide');
    if (slides.length === 0) return;
    if (heroFallbackInterval) {
      clearInterval(heroFallbackInterval);
      heroFallbackInterval = null;
    }

    // Initial active slide
    slides.forEach((s, idx) => {
      s.style.opacity = idx === 0 ? '1' : '0';
      s.style.zIndex = idx === 0 ? '2' : '1';
    });
    
    heroFallbackInterval = setInterval(() => {
      if (window.heroSwiperActive) {
        clearInterval(heroFallbackInterval);
        heroFallbackInterval = null;
        return;
      }
      // Fade out all
      slides.forEach(s => {
        s.style.transition = 'opacity 1s ease, z-index 0s';
        s.style.opacity = '0.2';
        s.style.zIndex = '1';
      });
      // Fade in current
      slides[slideIndex].style.opacity = '1';
      slides[slideIndex].style.zIndex = '2';
      slideIndex = (slideIndex + 1) % slides.length;
    }, 4000);
  }

  tryInitSwiper();
  // Extra calls for reliability
  setTimeout(tryInitSwiper, 1000);
  setTimeout(tryInitSwiper, 3000);
  
  // Property sliders (if any)
  document.querySelectorAll('.property-slider').forEach(el => {
    if (typeof Swiper !== 'undefined') {
      new Swiper(el, { slidesPerView: 1, loop: true, pagination: { el: '.swiper-pagination', clickable: true } });
    }
  });
}

// Ensure slider retries once full window resources are ready.
window.addEventListener('load', () => {
  if (!window.heroSwiperActive) initSwipers();
});


// Scroll animations
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  });
  
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// Search & Filter
function initSearch() {
  const form = document.querySelector('.search-form');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    performSearch();
  });
  
  // Live filter
  form.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('input', debounce(performSearch, 300));
  });
}

function performSearch() {
  const formData = new FormData(document.querySelector('.search-form'));
  const type = formData.get('type') || '';
  const niche = formData.get('niche') || '';
  const status = formData.get('status') || '';
  const beds = parseInt(formData.get('bedrooms')) || 0;
  const baths = parseInt(formData.get('bathrooms')) || 0;
  const size = parseFloat(formData.get('size') || 0);
  const kitchen = parseInt(formData.get('kitchen')) || 0;
  const minPrice = parseFloat(formData.get('min-price') || 0);
  const maxPrice = parseFloat(formData.get('max-price') || Infinity);
  const query = formData.get('query')?.toLowerCase() || '';


  filteredProperties = properties.filter(p => 
    (!type || p.type === type) &&
    (!niche || p.niche === niche) &&
    (!status || p.status === status) &&
    (beds === 0 || p.bedrooms >= beds) &&
    (baths === 0 || p.bathrooms >= baths) &&
    (size === 0 || getPropertySizeValue(p) >= size) &&
    (kitchen === 0 || getPropertyKitchenValue(p) >= kitchen) &&
    (p.price >= minPrice && p.price <= maxPrice) &&
    (query === '' || String(p.title || '').toLowerCase().includes(query) || String(p.address || '').toLowerCase().includes(query))
  );

  
  renderProperties(filteredProperties);
  
  // If no results
  if (filteredProperties.length === 0) {
    showMessage(window.t('noResults'));
    // Redirect to properties page
    setTimeout(() => window.location.href = 'properties.html', 2000);
  }
}

function renderProperties(props) {
  const grid = document.querySelector('.properties-grid') || document.querySelector('.featured-grid');
  if (!grid) return;
  
  const lang = currentLang;

  if (!Array.isArray(props) || props.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;padding:40px 20px;text-align:center;color:#64748b;">' + (window.t ? window.t('noResults', lang) : 'No properties available') + '</div>';
    return;
  }

  grid.innerHTML = (props || []).slice(0, 12).map(p => `
    <div class="property-card fade-in" data-id="${p.id}">
      <div class="property-image" style="background-image: url(${p.images && p.images[0] ? p.images[0] : 'images/artboard1.jpg'})">
        <div class="property-badge">${getPropertyStatusLabel(p, lang)}</div>
        ${p.niche ? `<div class="property-badge niche-badge"><i class="fas fa-star"></i> ${p.niche.toUpperCase()}</div>` : ''}
      </div>
      <div class="property-info">
        <h3 class="property-title">${getPropertyTitle(p)}</h3>
        <div class="property-price">${p.priceOnRequest ? window.t('formPriceOnRequest', lang) : '€' + Number(p.price || 0).toLocaleString()}</div>
        <div class="property-meta">
          <span>T${p.bedrooms || 0}</span>
          <span>${p.bathrooms || 0} ${window.t('cardBaths', lang)}</span>
          <span>${getPropertySizeValue(p) || 0} ${window.t('cardSqm', lang)}</span>
        </div>
        <div class="property-address"><i class="fas fa-map-marker-alt"></i> ${getPropertyAddress(p).split(',')[0]}</div>
      </div>
    </div>
  `).join('');

  // Card clicks
  grid.querySelectorAll('.property-card').forEach(card => {
    card.addEventListener('click', () => openPropertyModal(card.dataset.id));
  });
}

// Firebase Properties
async function loadProperties() {
  let loadedProperties = [];
  try {
    if (typeof window.getPropertiesFromFirestore === 'function') {
      loadedProperties = await window.getPropertiesFromFirestore(false);
    }

    if ((!Array.isArray(loadedProperties) || loadedProperties.length === 0) && typeof window.db !== 'undefined' && window.db) {
      const snapshot = await window.db.collection('properties').get();
      loadedProperties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  } catch (e) {
    console.error('Property load error:', e);
  }

  properties = Array.isArray(loadedProperties) ? loadedProperties : [];
  filteredProperties = [...properties];
  syncPropertyCache(properties);

  if (document.querySelector('.properties-grid')) {
    renderProperties(properties);
  } else if (document.querySelector('.featured-grid')) {
    renderProperties(properties.slice(0, 6));
  }
}

// Modals
function openPropertyModal(id) {
  window.location.href = 'property-detail.html?id=' + id;
}

function closeModal() {
  document.getElementById('property-modal')?.classList.remove('active');
}

// Chatbot
function initChatbot() {
  const btn = document.querySelector('.chatbot-btn');
  const container = document.querySelector('.chatbot-container');
  const closeBtn = document.querySelector('.chat-close');
  const sendBtn = document.querySelector('.chat-send');
  const input = document.querySelector('.chat-input-field');
  const langSelect = document.querySelector('.chat-lang-select');
  
  if (!btn) return;
  
  btn.addEventListener('click', () => {
    container.classList.toggle('active');
    if (container.classList.contains('active') && chatbotMessages.length === 0) {
      addMessage('bot', 'Welcome! Please select language:');
    }
  });
  
  closeBtn?.addEventListener('click', () => container.classList.remove('active'));
  
  sendBtn?.addEventListener('click', sendChatMessage);
  input?.addEventListener('keypress', e => { if (e.key === 'Enter') sendChatMessage(); });
}

function sendChatMessage() {
  const input = document.querySelector('.chat-input-field');
  const msg = input.value.trim();
  if (!msg) return;
  
  addMessage('user', msg);
  input.value = '';
  
  // Simple bot logic (expand with NLP later)
  setTimeout(() => {
    const lower = msg.toLowerCase();
    let response = '';
    
    if (lower.includes('language')) {
      response = 'Available: EN, FR, PT, NL. Type /lang [code]';
    } else if (lower.includes('property')) {
      response = 'Luxury apartments in Portugal. Use search on home/properties page.';
    } else if (lower.includes('address')) {
      response = 'Av. da Liberdade 144, 2 DTO, 1250-146 Lisboa';
    } else if (lower.includes('phone') || lower.includes('contact')) {
      response = '+351 918 445 899 | WhatsApp: wa.me/351918445899';
    } else if (lower.includes('service')) {
      response = 'Buy/sell/rent/manage properties in Portugal.';
    } else {
      response = "I'll help with properties, services, contacts. WhatsApp for more?";
    }
    
    addMessage('bot', response);
  }, 1000);
}

function addMessage(sender, text) {
  chatbotMessages.push({ sender, text });
  const messagesEl = document.querySelector('.chat-messages');
  const msgEl = document.createElement('div');
  msgEl.className = `chat-message ${sender}`;
  msgEl.innerHTML = `<div>${text}</div>`;
  messagesEl.appendChild(msgEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// Admin
function initAdmin() {
  document.getElementById('admin-password-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showMessage('Legacy password admin is disabled. Redirecting to secure admin login...');
    setTimeout(() => {
      window.location.href = 'admin.html';
    }, 400);
  });
  
  document.getElementById('property-form')?.addEventListener('submit', handleAddProperty);
  initMapPicker();
}

async function loadAdminProperties() {
  const list = document.getElementById('admin-properties-list');
  list.innerHTML = properties.map(p => `
    <div class="property-admin-item">
      <span>${p.title} (${p.id})</span>
      <button onclick="deleteProperty('${p.id}')">Delete</button>
    </div>
  `).join('');
}

async function handleAddProperty(e) {
  e.preventDefault();
  try {
    const formData = new FormData(e.target);
    const propData = Object.fromEntries(formData);
    
    // Normalize numeric fields for search/filter consistency
    if (propData.price) propData.price = parseFloat(propData.price);
    if (propData.bedrooms) propData.bedrooms = parseInt(propData.bedrooms);
    if (propData.bathrooms) propData.bathrooms = parseInt(propData.bathrooms);
    
    // Image handling placeholder
    propData.images = propData.images ? propData.images.split(',').map(s => s.trim()) : ['images/artboard1.jpg'];
    
    // firebase.js integration
    await window.addPropertyToFirebase(propData);
    
    showMessage(window.t('formSuccess'));
    e.target.reset();
    
    // Refresh lists immediately after update
    await loadProperties();
    if (typeof loadAdminProperties === 'function') loadAdminProperties();
  } catch (error) {
    console.error("Property submission failed:", error);
    showMessage(window.t('formError'));
  }
}

function deleteProperty(id) {
  if (confirm(window.t('agentDeleteConfirm'))) {
    window.deletePropertyFromFirebase(id)
      .then(() => {
        showMessage('Property deleted');
        loadProperties();
      })
      .catch(err => showMessage('Delete failed'));
  }
}

function initMapPicker() {
  const mapEl = document.getElementById('map-picker');
  if (!mapEl || typeof google === 'undefined') return;

  const map = new google.maps.Map(mapEl, {
    center: { lat: 38.7369, lng: -9.1427 }, // Lisbon Default
    zoom: 12
  });

  let marker = new google.maps.Marker({
    map: map,
    draggable: true,
    position: { lat: 38.7369, lng: -9.1427 }
  });

  map.addListener('click', (e) => {
    marker.setPosition(e.latLng);
    if (document.querySelector('[name="lat"]')) document.querySelector('[name="lat"]').value = e.latLng.lat();
    if (document.querySelector('[name="lng"]')) document.querySelector('[name="lng"]').value = e.latLng.lng();
  });

  marker.addListener('dragend', (e) => {
    if (document.querySelector('[name="lat"]')) document.querySelector('[name="lat"]').value = e.latLng.lat();
    if (document.querySelector('[name="lng"]')) document.querySelector('[name="lng"]').value = e.latLng.lng();
  });
}

// Utils
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

function showMessage(text) {
  // Toast or alert
  const toast = document.createElement('div');
  toast.textContent = text;
  toast.className = 'toast';
  // Style in CSS
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Contact form (email.js)
function initContactForm() {
  document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    // emailjs.sendForm('service_id', 'template_id', e.target)
    showMessage('Message sent to info@exorealestate.com');
    e.target.reset();
  });
}

// Google Maps - placeholder YOUR_KEY
