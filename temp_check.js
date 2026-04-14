
    /* ── current logged-in user (set after auth check) ── */
    let currentUser = null;
    let currentUserProfile = null;
    let myPropertiesCache = [];
    let myInquiriesCache = [];
    const pendingPropertyDeleteIds = new Set();
    const pendingInquiryDeleteIds = new Set();

    const agentAvatarEl = document.getElementById('agent-avatar');
    const agentAvatarImgEl = document.getElementById('agent-avatar-img');
    const agentAvatarInitialEl = document.getElementById('agent-avatar-initial');

    /* Profile photo preview elements */
    const profilePhotoInput      = document.getElementById('profile-photo-input');
    const profilePhotoPreviewImg = document.getElementById('profile-photo-preview-img');
    const profilePhotoInitial    = document.getElementById('profile-photo-preview-initial');
    const profilePhotoUploadBtn  = document.getElementById('profile-photo-upload-btn');
    const profilePhotoRemoveBtn  = document.getElementById('profile-photo-remove-btn');
    const profilePhotoFilename   = document.getElementById('profile-photo-filename');

    /* Tracks whether the user has staged a new photo or a remove action */
    let stagedPhotoFile   = null;   // File object waiting to upload
    let stagedPhotoRemove = false;  // True when user clicked "Remove"
    const agentRoleSidebarEl = document.getElementById('agent-role-sidebar');

    const agentProfileFormEl = document.getElementById('agent-profile-form');
    const agentProfileNameEl = document.getElementById('agent-profile-name');
    const agentProfileEmailEl = document.getElementById('agent-profile-email');
    const agentProfileCurrentPasswordEl = document.getElementById('agent-profile-current-password');
    const agentProfileNewPasswordEl = document.getElementById('agent-profile-new-password');
    const agentProfileConfirmPasswordEl = document.getElementById('agent-profile-confirm-password');
    const agentProfileResetBtnEl = document.getElementById('agent-profile-reset-btn');
    const agentProfileSaveBtnEl = document.getElementById('agent-profile-save-btn');

    function getAgentRoleLabel(role) {
      const raw = String(role || '').trim().toLowerCase();
      if (raw === 'admin') return 'Admin';
      if (raw === 'agent') return 'Agent';
      if (raw === 'dealer') return 'Dealer';
      if (!raw) return 'Agent';
      return raw.charAt(0).toUpperCase() + raw.slice(1);
    }

    function setAgentAvatarPhoto(photoUrl) {
      if (!agentAvatarEl || !agentAvatarImgEl) return;
      const clean = String(photoUrl || '').trim();
      if (!clean) {
        agentAvatarEl.classList.remove('has-photo');
        agentAvatarImgEl.removeAttribute('src');
        return;
      }

      agentAvatarImgEl.onerror = function () {
        agentAvatarEl.classList.remove('has-photo');
        agentAvatarImgEl.removeAttribute('src');
      };
      agentAvatarImgEl.src = clean;
      agentAvatarEl.classList.add('has-photo');
    }

    function setAgentIdentityUi(name, role, photoUrl) {
      const resolvedName = String(name || 'Agent').trim() || 'Agent';
      document.getElementById('agent-name-sidebar').textContent = resolvedName;
      document.getElementById('agent-name-header').textContent  = resolvedName;
      if (agentAvatarInitialEl) {
        agentAvatarInitialEl.textContent = resolvedName.charAt(0).toUpperCase();
      }
      if (agentRoleSidebarEl) {
        agentRoleSidebarEl.textContent = getAgentRoleLabel(role);
      }
      setAgentAvatarPhoto(photoUrl);
    }

    function populateAgentProfileForm(profile) {
      const p = profile || {};
      const name = String(p.name || (currentUser && currentUser.displayName) || (currentUser && currentUser.email) || 'Agent').trim() || 'Agent';
      const email = String(p.email || (currentUser && currentUser.email) || '').trim();

      if (agentProfileNameEl) agentProfileNameEl.value = name;
      if (agentProfileEmailEl) agentProfileEmailEl.value = email;
      if (agentProfileCurrentPasswordEl) agentProfileCurrentPasswordEl.value = '';
      if (agentProfileNewPasswordEl) agentProfileNewPasswordEl.value = '';
      if (agentProfileConfirmPasswordEl) agentProfileConfirmPasswordEl.value = '';

      /* Sync profile photo preview panel */
      const photoUrl = String(p.profilePhoto || '').trim();
      syncProfilePhotoPreview(photoUrl, name);
      stagedPhotoFile   = null;
      stagedPhotoRemove = false;
      if (profilePhotoUploadBtn)  profilePhotoUploadBtn.style.display  = 'none';
      if (profilePhotoRemoveBtn)  profilePhotoRemoveBtn.style.display  = photoUrl ? 'inline-flex' : 'none';
      if (profilePhotoFilename)   profilePhotoFilename.textContent     = '';
    }

    function syncProfilePhotoPreview(photoUrl, displayName) {
      const clean = String(photoUrl || '').trim();
      const initial = String(displayName || 'A').trim().charAt(0).toUpperCase();
      if (profilePhotoInitial) profilePhotoInitial.textContent = initial;
      if (profilePhotoPreviewImg) {
        if (clean) {
          profilePhotoPreviewImg.onerror = function () {
            profilePhotoPreviewImg.style.display = 'none';
          };
          profilePhotoPreviewImg.src = clean;
          profilePhotoPreviewImg.style.display = 'block';
        } else {
          profilePhotoPreviewImg.style.display = 'none';
          profilePhotoPreviewImg.removeAttribute('src');
        }
      }
    }

    /* ── sidebar navigation ── */
    const navItems  = document.querySelectorAll('.nav-item[data-section]');
    const sections  = document.querySelectorAll('.dash-section');
    const pageTitle = document.getElementById('page-title');
    const dashboardLangSelect = document.getElementById('dashboard-lang');

    function __t(key) {
      return window.t(key);
    }

    function syncDashboardLang() {
      if (!dashboardLangSelect || !window.getLang) return;
      dashboardLangSelect.value = window.getLang();
    }

    if (dashboardLangSelect && window.setLang) {
      dashboardLangSelect.addEventListener('change', (e) => {
        window.setLang(e.target.value);
      });
      syncDashboardLang();
    }

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        sections.forEach(s => s.classList.remove('active'));
        const targetId = item.dataset.section;
        const targetSection = document.getElementById(targetId);
        if (targetSection) targetSection.classList.add('active');
        pageTitle.textContent = item.textContent.trim();

        // Fix Leaflet map sizing when the form section is opened
        if (targetId === 'sec-property-form') {
           if (typeof map !== 'undefined' && map) {
             setTimeout(() => { map.invalidateSize(); }, 200);
           } else {
             setTimeout(initAddPropertyMap, 300);
           }
        }
        
        // Auto-refresh listings when clicking the listings tab
        if (targetId === 'sec-listings') {
          renderMine(true);
        }

        // Auto-refresh messages when clicking the messages tab
        if (targetId === 'sec-messages') {
          renderMine(true);
        }
      });
    });

    /* ── toast helper ── */
    function showToast(message, type) {
      const icons = { success: 'fa-circle-check', error: 'fa-circle-exclamation', info: 'fa-circle-info' };
      const toast = document.createElement('div');
      toast.className = 'toast toast-' + (type || 'info');
      toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
      document.getElementById('toast-container').appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(16px)';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

    function showConfirmDialog(message, confirmText, cancelText) {
      return new Promise((resolve) => {
        const cancelLabel = (typeof cancelText === 'string' && cancelText.trim()) ? cancelText : __t('btnCancel');
        const confirmLabel = (typeof confirmText === 'string' && confirmText.trim()) ? confirmText : __t('actionDelete');
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop open';
        backdrop.style.zIndex = '2000';
        backdrop.innerHTML =
          '<div class="modal-box" style="max-width:420px;padding:22px;">' +
            '<div style="font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:10px;">' + __t('actionConfirm') + '</div>' +
            '<div style="font-size:14px;color:var(--text-secondary);line-height:1.6;">' + message + '</div>' +
            '<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px;">' +
              '<button type="button" class="btn btn-outline" data-cancel>' + cancelLabel + '</button>' +
              '<button type="button" class="btn btn-danger-soft" data-confirm>' + confirmLabel + '</button>' +
            '</div>' +
          '</div>';

        const close = (result) => {
          backdrop.remove();
          resolve(result);
        };

        backdrop.querySelector('[data-cancel]').addEventListener('click', () => close(false));
        backdrop.querySelector('[data-confirm]').addEventListener('click', () => close(true));
        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) close(false);
        });
        document.body.appendChild(backdrop);
      });
    }

    window.addEventListener('exo:languageChanged', () => {
      syncDashboardLang();
      if (currentUser) renderMine(false);
    });

    /* ── modal helpers ── */
    function openModal(id)  {
      const el = document.getElementById(id);
      if (el) el.classList.add('open');
    }
    function closeModal(id) {
      const el = document.getElementById(id);
      if (el) el.classList.remove('open');
    }

    document.getElementById('quick-add-btn').addEventListener('click', () => { propForm.reset(); clearDynamicAddedOptions(); document.getElementById('f-editing-id').value = ''; document.getElementById('form-page-title').textContent = __t('agentAddProperty'); document.getElementById('nav-add-prop').click(); });
    document.getElementById('listings-add-btn').addEventListener('click', () => { propForm.reset(); clearDynamicAddedOptions(); document.getElementById('f-editing-id').value = ''; document.getElementById('form-page-title').textContent = __t('agentAddProperty'); document.getElementById('nav-add-prop').click(); });
    document.getElementById('cancel-form-btn').addEventListener('click', () => { document.querySelector('.nav-item[data-section="sec-listings"]').click(); }); document.getElementById('bottom-cancel-btn').addEventListener('click', () => { document.querySelector('.nav-item[data-section="sec-listings"]').click(); });
    const addPropModalEl = document.getElementById('add-property-modal');
    if (addPropModalEl) {
      addPropModalEl.addEventListener('click', e => {
        if (e.target.id === 'add-property-modal') closeModal('add-property-modal');
      });
    }

    const closeEditModalEl = document.getElementById('close-edit-modal');
    const editModalEl = document.getElementById('edit-modal');
    if (closeEditModalEl) closeEditModalEl.addEventListener('click', () => closeModal('edit-modal'));
    if (editModalEl) {
      editModalEl.addEventListener('click', e => {
        if (e.target.id === 'edit-modal') closeModal('edit-modal');
      });
    }

    /* ── logout ── */
    document.getElementById('logout-btn').addEventListener('click', () => {
      firebase.auth().signOut().then(() => { window.location.href = 'login.html'; });
    });

    /* ── load my properties from Firestore ── */
    async function loadMyProperties() {
      try {
        const user = firebase.auth().currentUser;
        if (!user) return [];
        const firestore = firebase.firestore();
        const uid = user.uid;
        const resultsMap = new Map();

        // Perform multiple queries to catch all variations of ownership fields (legacy and current)
        const queries = [
          firestore.collection('properties').where('agentId', '==', uid).get(),
          firestore.collection('properties').where('createdByUid', '==', uid).get(),
          firestore.collection('properties').where('createdBy', '==', uid).get()
        ];

        const snapshots = await Promise.all(queries);
        snapshots.forEach(snap => {
          snap.forEach(doc => {
            resultsMap.set(doc.id, { id: doc.id, ...doc.data() });
          });
        });

        return Array.from(resultsMap.values());
      } catch (err) {
        console.error('loadMyProperties error:', err);
        return [];
      }
    }

    async function loadMyInquiries() {
      try {
        const firestore = firebase.firestore();
        const snap = await firestore.collection('inquiries')
          .where('agentId', '==', currentUser.uid)
          .orderBy('createdAt', 'desc')
          .get();
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        try {
          const snap = await firestore.collection('inquiries')
            .where('agentId', '==', currentUser.uid)
            .get();
          return snap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => {
              const at = a && a.createdAt && typeof a.createdAt.toMillis === 'function' ? a.createdAt.toMillis() : 0;
              const bt = b && b.createdAt && typeof b.createdAt.toMillis === 'function' ? b.createdAt.toMillis() : 0;
              return bt - at;
            });
        } catch (innerErr) {
          return [];
        }
      }
    }

    function renderMyInquiries(inquiries) {
      const container = document.getElementById('agent-messages-list');
      if (!container) return;
      if (!Array.isArray(inquiries) || inquiries.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i>' + __t('adminNoMessages') + '</div>';
        return;
      }

      function esc(str) {
        return String(str || '').replace(/[&<>"']/g, function(c) {
          return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
        });
      }

      container.innerHTML = '<div class="enquiry-list">' + inquiries.map((m) => {
        const safeId = String(m.id || '').replace(/'/g, "\\'");
        const isDeletingInquiry = pendingInquiryDeleteIds.has(String(m.id || ''));
        const initial = (m.name || '?').charAt(0).toUpperCase();
        const ts = m.createdAt && typeof m.createdAt.toDate === 'function'
          ? m.createdAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
          : '';
        const propertyTitle = (typeof m.propertyTitle === 'string' && m.propertyTitle.trim())
          ? m.propertyTitle
          : ((typeof m.propertyId === 'string' && m.propertyId.trim()) ? m.propertyId : __t('adminMessages'));
        const messageText = (typeof m.message === 'string' && m.message.trim()) ? m.message : __t('contactMessage');
        const message = esc(messageText);
        return '<div class="enquiry-card" data-expand="1">' +
          '<div class="enquiry-top">' +
            '<div class="enquiry-person">' +
              '<div class="enquiry-avatar">' + esc(initial) + '</div>' +
              '<div style="min-width:0;">' +
                '<div class="enquiry-name">' + esc((typeof m.name === 'string' && m.name.trim()) ? m.name : __t('labelUnknown')) + '</div>' +
                '<div class="enquiry-time">' + esc(ts) + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="enquiry-actions">' +
              '<button type="button" class="enquiry-action-btn delete" title="' + __t('actionDelete') + '" onclick="event.stopPropagation(); deleteInquiryMessage(\'' + safeId + '\')" ' + (isDeletingInquiry ? 'disabled style="opacity:.6;pointer-events:none;"' : '') + '><i class="fas fa-trash"></i></button>' +
            '</div>' +
          '</div>' +
          '<div class="enquiry-prop">' + esc(propertyTitle) + '</div>' +
          '<div class="enquiry-message">' + message + '</div>' +
          '<div class="enquiry-bottom">' +
            '<div class="enquiry-meta">' +
              '<span>' + esc(m.email || '') + '</span>' +
              (m.phone ? '<span>' + esc(m.phone) + '</span>' : '') +
            '</div>' +
            '<button type="button" class="enquiry-toggle">' + __t('actionReadFull') + '</button>' +
          '</div>' +
        '</div>';
      }).join('') + '</div>';

      // Only show expand/collapse when the message is actually clamped.
      requestAnimationFrame(() => {
        container.querySelectorAll('.enquiry-card[data-expand="1"]').forEach((el) => {
          const msgEl = el.querySelector('.enquiry-message');
          const btn = el.querySelector('.enquiry-toggle');
          if (!msgEl || !btn) return;

          const isOverflowing = msgEl.scrollHeight > (msgEl.clientHeight + 2);
          if (!isOverflowing) {
            btn.classList.add('hidden');
            el.dataset.expand = '0';
            return;
          }

          const syncLabel = () => {
            btn.textContent = el.classList.contains('expanded') ? __t('actionCollapse') : __t('actionReadFull');
          };

          const toggleExpanded = () => {
            el.classList.toggle('expanded');
            syncLabel();
          };

          el.addEventListener('click', toggleExpanded);
          btn.addEventListener('click', (evt) => {
            evt.stopPropagation();
            toggleExpanded();
          });
          syncLabel();
        });
      });
    }

    window.deleteInquiryMessage = async function(id) {
      if (!id) return;
      const normalizedId = String(id || '').trim();
      if (!normalizedId || pendingInquiryDeleteIds.has(normalizedId)) return;
      const ok = await showConfirmDialog(__t('actionDelete') + '?', __t('actionDelete'), __t('btnCancel'));
      if (!ok) return;

      const prevInquiries = Array.isArray(myInquiriesCache) ? myInquiriesCache.slice() : [];
      pendingInquiryDeleteIds.add(normalizedId);
      myInquiriesCache = prevInquiries.filter((m) => String((m && m.id) || '') !== normalizedId);
      renderMine(false);

      try {
        const firestore = firebase.firestore();
        await firestore.collection('inquiries').doc(normalizedId).delete();
        showToast(__t('toastEnquiryDeleted'), 'success');
      } catch (err) {
        myInquiriesCache = prevInquiries;
        showToast(__t('toastUnableDeleteEnquiry'), 'error');
      } finally {
        pendingInquiryDeleteIds.delete(normalizedId);
        renderMine(false);
      }
    };

    /* ── render cards ── */
    async function renderMine(forceRefresh) {
      if (!currentUser) return;

      const shouldReload = forceRefresh !== false || (!Array.isArray(myPropertiesCache) || !Array.isArray(myInquiriesCache));
      if (shouldReload) {
        const [fetchedProps, fetchedInquiries] = await Promise.all([
          loadMyProperties(),
          loadMyInquiries()
        ]);
        myPropertiesCache = Array.isArray(fetchedProps) ? fetchedProps : [];
        myInquiriesCache = Array.isArray(fetchedInquiries) ? fetchedInquiries : [];
      }

      const myProps = Array.isArray(myPropertiesCache) ? myPropertiesCache : [];
      const myInquiries = Array.isArray(myInquiriesCache) ? myInquiriesCache : [];

      // stats
      if (document.getElementById('stat-listings')) document.getElementById('stat-listings').textContent = myProps.length;
      const total = myProps.reduce((s, p) => s + (Number(p.price) || 0), 0);
      if (document.getElementById('stat-value')) document.getElementById('stat-value').textContent = myProps.length ? '€' + total.toLocaleString() : '—';
      if (document.getElementById('stat-avg')) document.getElementById('stat-avg').textContent   = myProps.length ? '€' + Math.round(total / myProps.length).toLocaleString() : '—';

      // recent (overview tab)
      const overviewEl = document.getElementById('overview-recent');
      if (myProps.length === 0) {
        overviewEl.innerHTML = '<div class="empty-state"><i class="fas fa-building"></i>' + __t('agentNoListings') + '</div>';
      } else {
        overviewEl.innerHTML = myProps.slice(0, 5).map(p => `
          <div class="activity-item">
            <div class="activity-dot activity-dot-blue"><i class="fas fa-home"></i></div>
            <div class="activity-text">
              <div class="activity-title">${(typeof p.title === 'string' && p.title.trim()) ? p.title : __t('labelUntitled')}</div>
              <div class="activity-sub">${p.address || ''}</div>
            </div>
            <div class="activity-price">€${Number(p.price || 0).toLocaleString()}</div>
          </div>
        `).join('');
      }

      // type breakdown
      const typesEl = document.getElementById('overview-types');
      if (myProps.length === 0) {
        typesEl.innerHTML = '<div class="empty-state" style="padding:24px;"><i class="fas fa-chart-bar"></i>' + __t('adminNoDataYet') + '</div>';
      } else {
        const counts = {};
        myProps.forEach(p => {
          const typeLabel = (typeof p.type === 'string' && p.type.trim()) ? p.type : __t('labelOther');
          counts[typeLabel] = (counts[typeLabel] || 0) + 1;
        });
        typesEl.innerHTML = Object.entries(counts).map(([type, count]) => `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border-light);">
            <span style="font-size:13px; color:var(--text-secondary);">${type}</span>
            <span style="font-size:13px; font-weight:700; color:var(--accent);">${count}</span>
          </div>
        `).join('');
      }

      // listings grid
      const container = document.getElementById('my-properties');
      const debugUid = document.getElementById('debug-uid');
      if (debugUid && currentUser) {
        debugUid.innerHTML = `<div style="font-size:11px; margin-top:8px; opacity:0.8; color:var(--text-muted); line-height:1.4; background:#f1f5f9; padding:10px; border-radius:8px; border:1px solid var(--border-light);">
          <strong style="color:var(--text-primary);">Dashboard Debug Info:</strong><br>
          <span style="user-select:all;">UID: ${currentUser.uid}</span><br>
          Email: ${currentUser.email}<br>
          Name: ${(currentUserProfile && currentUserProfile.name) || 'Not set'}<br>
          Role: ${(currentUserProfile && currentUserProfile.role) || 'Not set'}<br>
          Total Found: ${myProps.length}
        </div>`;
      }

      if (myProps.length === 0) {
        container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><i class="fas fa-building"></i>' + __t('agentNoListings') + 
          (debugUid ? `<div style="font-size:10px; color:var(--text-muted); margin-top:10px; opacity:0.3;">UID: ${currentUser.uid}</div>` : '') + '</div>';
        return;
      }

      container.innerHTML = myProps.map(p => {
        const img = (Array.isArray(p.images) && p.images.length > 0) ? p.images[0] : (p.image || '');
        const isDeletingProp = pendingPropertyDeleteIds.has(String(p.id || ''));
        const price = Number(p.price || 0);
        const title = String(p.title || p.id || 'Untitled');
        const currentLang = typeof window.getLang === 'function' ? window.getLang() : 'en';
        const translatedStatus = (typeof window.translateListingStatus === 'function') 
          ? window.translateListingStatus(status, currentLang) 
          : status;

        return `
          <div class="prop-card">
            <div class="prop-card-img" style="background-image: url('${img}')">
              <div class="status-badge status-${statusClass}">${translatedStatus}</div>
              <div class="price-tag">€${price.toLocaleString()}</div>
            </div>
            <div class="prop-card-body">
              <h4 style="margin:0 0 8px 0; font-size:16px; font-weight:700; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${title}">${title}</h4>
              <div style="font-size:13px; color:var(--text-secondary); margin-bottom:12px; display:flex; align-items:center; gap:5px;">
                <i class="fas fa-map-marker-alt"></i> <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${(p.address || '').substring(0, 45)}</span>
              </div>
              <div style="display:flex; gap:8px;">
                <button class="btn btn-amber-soft btn-sm" style="flex:1;" onclick="editProp('${p.id}')">
                  <i class="fas fa-pen"></i> ${__t('actionEdit')}
                </button>
                <button class="btn btn-danger-soft btn-sm" style="flex:1;" onclick="deleteProp('${p.id}')" ${isDeletingProp ? 'disabled style="opacity:.6;pointer-events:none;"' : ''}>
                  <i class="fas fa-trash"></i> ${__t('actionDelete')}
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');


      renderMyInquiries(myInquiries);
    }

    
    /* ── Show hide rental specs ── */
    const fStatus = document.getElementById('f-status');
    const fRentalSpecs = document.getElementById('rental-specs-section');
    fStatus.addEventListener('change', () => {
      fRentalSpecs.style.display = fStatus.value === 'For Rent' ? 'block' : 'none';
    });

    function addDynamicCheckbox(gridId, checkboxName, value, checked) {
      const grid = document.getElementById(gridId);
      if (!grid) return;
      const clean = String(value || '').trim();
      if (!clean) return;

      const exists = Array.from(grid.querySelectorAll('input[type="checkbox"]')).some((cb) => String(cb.value || '').toLowerCase() === clean.toLowerCase());
      if (exists) {
        const existing = Array.from(grid.querySelectorAll('input[type="checkbox"]')).find((cb) => String(cb.value || '').toLowerCase() === clean.toLowerCase());
        if (existing && checked) existing.checked = true;
        return;
      }

      const label = document.createElement('label');
      label.style.display = 'flex';
      label.style.gap = '8px';
      label.dataset.customOption = '1';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = checkboxName;
      input.value = clean;
      input.checked = !!checked;
      input.dataset.customOption = '1';

      label.appendChild(input);
      label.appendChild(document.createTextNode(' ' + clean));
      grid.appendChild(label);
    }

    function bindDynamicAdder(inputId, buttonId, gridId, checkboxName) {
      const input = document.getElementById(inputId);
      const button = document.getElementById(buttonId);
      if (!input || !button) return;

      const submit = () => {
        const value = input.value.trim();
        if (!value) return;
        addDynamicCheckbox(gridId, checkboxName, value, true);
        input.value = '';
      };

      button.addEventListener('click', submit);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submit();
        }
      });
    }

    bindDynamicAdder('f-custom-amenity-input', 'f-add-amenity-btn', 'f-amenities-grid', 'customAmenities');
    bindDynamicAdder('f-custom-view-input', 'f-add-view-btn', 'f-views-grid', 'customViews');
    bindDynamicAdder('f-custom-feature-input', 'f-add-feature-btn', 'f-features-grid', 'features');
    bindDynamicAdder('f-custom-equipment-input', 'f-add-equipment-btn', 'f-equipment-grid', 'equipment');

    function clearDynamicAddedOptions() {
      document.querySelectorAll('label[data-custom-option="1"]').forEach((el) => el.remove());
    }

    const CLOUDINARY_CLOUD_NAME = String(window.CLOUDINARY_CLOUD_NAME || '').trim();
    const CLOUDINARY_UPLOAD_PRESET = String(window.CLOUDINARY_UPLOAD_PRESET || '').trim();

    async function uploadSingleToCloudinary(file, folderPath) {
      if (!file) return '';
      const cloudName = String(window.CLOUDINARY_CLOUD_NAME || '').trim();
      const uploadPreset = String(window.CLOUDINARY_UPLOAD_PRESET || '').trim();
      
      if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary is not configured. Please check firebase.js settings.');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      if (folderPath) formData.append('folder', folderPath);

      const endpoint = 'https://api.cloudinary.com/v1_1/' + encodeURIComponent(CLOUDINARY_CLOUD_NAME) + '/image/upload';
      const res = await fetch(endpoint, { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok || !data || !data.secure_url) {
        const msg = data && data.error && data.error.message ? data.error.message : 'Image upload failed.';
        throw new Error(msg);
      }

      return data.secure_url;
    }

    async function uploadFilesToCloudinary(fileList, folderPath) {
      const files = Array.from(fileList || []);
      if (!files.length) return [];

      const urls = [];
      for (let i = 0; i < files.length; i++) {
        const safeName = String(files[i].name || ('file-' + i)).replace(/[^a-zA-Z0-9._-]/g, '_');
        const cloudinaryFolder = (folderPath ? folderPath.replace(/\/$/, '') : 'properties') + '/' + Date.now() + '-' + i + '-' + safeName;
        const url = await uploadSingleToCloudinary(files[i], cloudinaryFolder);
        urls.push(url);
      }
      return urls;
    }

    async function syncAgentIdentityAcrossProperties(agentName, agentRole, agentPhoto) {
      if (!currentUser || !db) return;

      try {
        const snap = await db.collection('properties').where('agentId', '==', currentUser.uid).get();
        if (!snap || snap.empty) return;

        const updates = snap.docs.map((doc) => doc.ref.set({
          agentName: String(agentName || '').trim() || 'Agent',
          agentRole: String(agentRole || '').trim() || 'agent',
          agentPhoto: String(agentPhoto || '').trim()
        }, { merge: true }));
        await Promise.all(updates);
      } catch (err) {
        console.error('syncAgentIdentityAcrossProperties error:', err);
      }
    }

    /* ── Profile photo file picker ── */
    if (profilePhotoInput) {
      profilePhotoInput.addEventListener('change', () => {
        const file = profilePhotoInput.files && profilePhotoInput.files[0];
        if (!file) return;

        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowed.includes(file.type)) {
          showToast('Unsupported image type. Use JPG, PNG, or WebP.', 'error');
          profilePhotoInput.value = '';
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          showToast('Image must be under 5 MB.', 'error');
          profilePhotoInput.value = '';
          return;
        }

        stagedPhotoFile   = file;
        stagedPhotoRemove = false;

        const reader = new FileReader();
        reader.onload = (ev) => {
          if (profilePhotoPreviewImg) {
            profilePhotoPreviewImg.src = ev.target.result;
            profilePhotoPreviewImg.style.display = 'block';
          }
        };
        reader.readAsDataURL(file);

        if (profilePhotoFilename)  profilePhotoFilename.textContent  = file.name;
        if (profilePhotoUploadBtn) profilePhotoUploadBtn.style.display = 'inline-flex';
        if (profilePhotoRemoveBtn) profilePhotoRemoveBtn.style.display = 'inline-flex';

        profilePhotoInput.value = '';
      });
    }

    if (profilePhotoRemoveBtn) {
      profilePhotoRemoveBtn.addEventListener('click', () => {
        stagedPhotoFile   = null;
        stagedPhotoRemove = true;
        if (profilePhotoPreviewImg) {
          profilePhotoPreviewImg.style.display = 'none';
          profilePhotoPreviewImg.removeAttribute('src');
        }
        if (profilePhotoFilename)  profilePhotoFilename.textContent  = '';
        if (profilePhotoUploadBtn) profilePhotoUploadBtn.style.display = 'none';
        if (profilePhotoRemoveBtn) profilePhotoRemoveBtn.style.display = 'none';
      });
    }

    if (profilePhotoUploadBtn) {
      profilePhotoUploadBtn.addEventListener('click', () => {
        if (profilePhotoInput) profilePhotoInput.click();
      });
    }

    if (agentProfileResetBtnEl) {
      agentProfileResetBtnEl.addEventListener('click', () => {
        populateAgentProfileForm(currentUserProfile || {});
      });
    }

    if (agentProfileFormEl) {
      agentProfileFormEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const name = String((agentProfileNameEl && agentProfileNameEl.value) || '').trim();
        const currentPassword = String((agentProfileCurrentPasswordEl && agentProfileCurrentPasswordEl.value) || '');
        const newPassword = String((agentProfileNewPasswordEl && agentProfileNewPasswordEl.value) || '');
        const confirmPassword = String((agentProfileConfirmPasswordEl && agentProfileConfirmPasswordEl.value) || '');

        if (!name) {
          showToast(__t('profileNameRequired'), 'error');
          return;
        }

        const wantsPasswordChange = !!(currentPassword || newPassword || confirmPassword);
        if (wantsPasswordChange) {
          if (!currentPassword || !newPassword || !confirmPassword) {
            showToast(__t('profilePasswordFieldsRequired'), 'error');
            return;
          }
          if (newPassword.length < 8) {
            showToast(__t('profilePasswordMinLength'), 'error');
            return;
          }
          if (newPassword !== confirmPassword) {
            showToast(__t('profilePasswordMismatch'), 'error');
            return;
          }
        }

        const role = String((currentUserProfile && currentUserProfile.role) || 'agent').trim() || 'agent';
        let profilePhoto = String((currentUserProfile && currentUserProfile.profilePhoto) || '').trim();

        if (agentProfileSaveBtnEl) {
          agentProfileSaveBtnEl.disabled = true;
          agentProfileSaveBtnEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + __t('formSaving');
        }

        try {
          /* ── Handle profile photo changes ── */
          if (stagedPhotoRemove) {
            profilePhoto = '';
          } else if (stagedPhotoFile) {
            agentProfileSaveBtnEl && (agentProfileSaveBtnEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading photo…');
            const uploadedUrl = await uploadSingleToCloudinary(
              stagedPhotoFile,
              'agents/' + currentUser.uid + '/profile/' + Date.now() + '-' + stagedPhotoFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
            );
            profilePhoto = uploadedUrl;
          }

          const firestoreUpdate = { name };
          if (stagedPhotoRemove || stagedPhotoFile) {
            firestoreUpdate.profilePhoto = profilePhoto;
          }

          agentProfileSaveBtnEl && (agentProfileSaveBtnEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + __t('formSaving'));

          const firestore = firebase.firestore();
          await firestore.collection('users').doc(currentUser.uid).set(firestoreUpdate, { merge: true });

          try {
            await currentUser.updateProfile({
              displayName: name,
              photoURL: profilePhoto || null
            });
          } catch (profileErr) {
            // Keep Firestore source of truth even if auth profile update fails.
          }

          if (wantsPasswordChange) {
            const emailForCredential = String(currentUser.email || (currentUserProfile && currentUserProfile.email) || '').trim();
            if (!emailForCredential) {
              throw new Error(__t('profileEmailVerificationFailed'));
            }

            const credential = firebase.auth.EmailAuthProvider.credential(emailForCredential, currentPassword);
            await currentUser.reauthenticateWithCredential(credential);
            await currentUser.updatePassword(newPassword);
          }

          currentUserProfile = {
            ...(currentUserProfile || {}),
            name: name,
            role: role,
            profilePhoto: profilePhoto
          };

          stagedPhotoFile   = null;
          stagedPhotoRemove = false;

          setAgentIdentityUi(name, role, profilePhoto);
          populateAgentProfileForm(currentUserProfile);
          await syncAgentIdentityAcrossProperties(name, role, profilePhoto);
          showToast(wantsPasswordChange ? __t('profileAndPasswordUpdated') : __t('profileUpdated'), 'success');
        } catch (err) {
          const code = String((err && err.code) || '').trim();
          let message = __t('profileSaveError');
          if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
            message = __t('profilePasswordCurrentIncorrect');
          } else if (code === 'auth/weak-password') {
            message = __t('profilePasswordWeak');
          } else if (code === 'auth/too-many-requests') {
            message = __t('profileTooManyAttempts');
          } else if (code === 'auth/requires-recent-login') {
            message = __t('profileReloginRequired');
          } else if (err && err.message) {
            message = err.message;
          }
          showToast(message, 'error');
          console.error('agentProfileSave error:', err);
        } finally {
          if (agentProfileSaveBtnEl) {
            agentProfileSaveBtnEl.disabled = false;
            agentProfileSaveBtnEl.innerHTML = '<i class="fas fa-floppy-disk"></i> ' + __t('actionSaveChanges');
          }
        }
      });
    }

    const SUPPORTED_TRANSLATION_LANGS = ['en', 'pt', 'fr', 'nl', 'zh', 'ar'];

    function normalizeLangCode(raw) {
      const val = String(raw || '').trim().toLowerCase();
      if (!val) return '';
      if (val.startsWith('en')) return 'en';
      if (val.startsWith('pt')) return 'pt';
      if (val.startsWith('fr')) return 'fr';
      if (val.startsWith('nl')) return 'nl';
      return '';
    }

    function fallbackDetectSourceLang(text) {
      const sample = String(text || '').toLowerCase();
      if (!sample) return 'pt';

      const scores = {
        en: 0,
        pt: 0,
        fr: 0,
        nl: 0
      };

      const hints = {
        en: [' the ', ' and ', ' with ', ' in ', ' for ', ' from ', ' is '],
        pt: [' de ', ' e ', ' com ', ' para ', ' em ', ' uma ', ' não ', 'ção'],
        fr: [' le ', ' la ', ' et ', ' avec ', ' pour ', ' dans ', ' une ', ' des '],
        nl: [' de ', ' en ', ' met ', ' voor ', ' in ', ' een ', ' het ', ' van ']
      };

      Object.keys(hints).forEach((lang) => {
        hints[lang].forEach((token) => {
          if (sample.includes(token)) scores[lang] += 1;
        });
      });

      const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
      if (!best || best[1] <= 0) return 'pt';
      return best[0];
    }

    async function detectSourceLangForProperty(text) {
      const sourceText = String(text || '').trim();
      if (!sourceText) return 'pt';

      try {
        const url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(sourceText) + '&langpair=autodetect|en';
        const res = await fetch(url);
        if (!res.ok) return fallbackDetectSourceLang(sourceText);

        const data = await res.json();

        const directCandidates = [
          data?.responseData?.detectedLanguage,
          data?.responseData?.detectedSourceLanguage,
          data?.responseData?.sourceLanguage,
          data?.responseData?.lang,
          data?.responseDetails
        ];

        for (const c of directCandidates) {
          const normalized = normalizeLangCode(c);
          if (normalized) return normalized;
        }

        const details = String(data?.responseDetails || '').toLowerCase();
        if (details.includes('english')) return 'en';
        if (details.includes('portugu')) return 'pt';
        if (details.includes('french') || details.includes('fran')) return 'fr';
        if (details.includes('dutch') || details.includes('neder')) return 'nl';

        return fallbackDetectSourceLang(sourceText);
      } catch (e) {
        return fallbackDetectSourceLang(sourceText);
      }
    }

    async function translateChunkForLang(text, targetLang) {
      const sourceText = String(text == null ? '' : text).trim();
      if (!sourceText) return '';
      if (!targetLang) return sourceText;

      const isErrorText = (value) => {
        const s = String(value || '').toUpperCase();
        return s.includes('PLEASE SELECT') || s.includes('QUERY LENGTH') || s.includes('MAX ALLOWED') || s.includes('MYMEMORY');
      };

      const translateChunk = async (chunkText) => {
        const input = String(chunkText == null ? '' : chunkText).trim();
        if (!input) return input;

        const langPairs = [
          `autodetect|${targetLang}`,
          `en|${targetLang}`,
          `pt|${targetLang}`,
          `fr|${targetLang}`,
          `nl|${targetLang}`,
          `zh|${targetLang}`,
          `ar|${targetLang}`
        ];

        for (const langpair of langPairs) {
          const sourceLang = String(langpair.split('|')[0] || '').toLowerCase();
          if (sourceLang === String(targetLang).toLowerCase()) continue;
          try {
            const url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(input) + '&langpair=' + encodeURIComponent(langpair);
            const res = await fetch(url);
            const data = await res.json();
            const translated = data && data.responseData ? data.responseData.translatedText : '';
            if (
              data && data.responseStatus === 200 &&
              translated && String(translated).trim() &&
              String(translated) !== input &&
              !isErrorText(translated)
            ) {
              return String(translated);
            }
          } catch (e) {
            continue;
          }
        }

        return input;
      };

      return await translateChunk(sourceText);
    }

    async function translateLongTextForLang(text, targetLang) {
      const sourceText = String(text == null ? '' : text).trim();
      if (!sourceText) return '';
      if (!targetLang) return sourceText;

      if (sourceText.length <= 450) {
        return await translateChunkForLang(sourceText, targetLang);
      }

      const chunks = [];
      let i = 0;
      while (i < sourceText.length) {
        let end = Math.min(i + 450, sourceText.length);
        if (end < sourceText.length) {
          const lastPeriod = sourceText.lastIndexOf('.', end);
          const lastNewline = sourceText.lastIndexOf('\n', end);
          const splitAt = Math.max(lastPeriod, lastNewline);
          if (splitAt > i) end = splitAt + 1;
        }
        chunks.push(sourceText.slice(i, end).trim());
        i = end;
      }

      const translatedParts = [];
      for (const chunk of chunks) {
        if (!chunk) continue;
        translatedParts.push(await translateChunkForLang(chunk, targetLang));
      }
      return translatedParts.join(' ').trim() || sourceText;
    }

    async function buildInitialTranslations(payload) {
      const baseTitle = String(payload.title || '').trim();
      const baseDescription = String(payload.description || '').trim();
      const baseNeighbourhood = String(payload.neighbourhoodDesc || payload.neighbourhood || '').trim();

      const detectionText = [baseTitle, baseDescription, baseNeighbourhood].filter(Boolean).join(' ');
      const sourceLang = await detectSourceLangForProperty(detectionText);

      const translations = {};
      translations[sourceLang] = {
        title: baseTitle,
        description: baseDescription,
        neighbourhood: baseNeighbourhood
      };

      const langs = SUPPORTED_TRANSLATION_LANGS.filter((lang) => lang !== sourceLang);
      await Promise.all(langs.map(async function (lang) {
        const translatedTitle = await translateChunkForLang(baseTitle, lang);
        const translatedDescription = await translateLongTextForLang(baseDescription, lang);
        const translatedNeighbourhood = await translateLongTextForLang(baseNeighbourhood, lang);
        translations[lang] = {
          title: translatedTitle,
          description: translatedDescription,
          neighbourhood: translatedNeighbourhood
        };
      }));

      return translations;
    }

    /* ── Property Form Submission ── */
    const propForm = document.getElementById('main-property-form');
    propForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('f-submit-btn');
      const textSpan = document.getElementById('f-submit-text');
      const originalHtml = btn.innerHTML;
      btn.disabled = true;
      textSpan.textContent = __t('loading');

      try {
        const firestore = firebase.firestore();
        const idInput = document.getElementById('f-editing-id').value;
        const isEditing = !!idInput;
        let propId = idInput;
        if (!isEditing) {
          // Use a transaction on a central counter to ensure sequential, unique IDs
          const counterRef = firestore.collection('metadata').doc('property_counter');
          propId = await firestore.runTransaction(async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            let nextNum = 2601;
            if (counterDoc.exists) {
              const lastId = parseInt(counterDoc.data().lastId);
              if (!isNaN(lastId)) nextNum = lastId + 1;
            }
            transaction.set(counterRef, { lastId: nextNum }, { merge: true });
            return 'EXO' + nextNum;
          }).catch(() => 'EXO' + (2601 + Math.floor(Math.random() * 10000)));
        }


        const imagesInput = document.getElementById('f-images');

        // Keep existing media when editing and the user doesn't upload new files.
        let existingData = {};
        if (isEditing) {
          const snap = await firestore.collection('properties').doc(propId).get();
          existingData = snap.exists ? (snap.data() || {}) : {};
        }

        // Upload main images (or fallback to existing)
        let imageUrls = [];
        if (imagesInput && imagesInput.files.length > 0) {
          textSpan.textContent = __t('loading');
          imageUrls = await uploadFilesToCloudinary(imagesInput.files, 'properties/' + propId + '/images');
        } else if (isEditing) {
          imageUrls = Array.isArray(existingData.images)
            ? existingData.images
            : (existingData.image ? [existingData.image] : []);
        }

        const latInput = parseFloat(document.getElementById('f-lat').value);
        const lngInput = parseFloat(document.getElementById('f-lng').value);
        let latValue = Number.isFinite(latInput) ? Number(latInput.toFixed(7)) : null;
        let lngValue = Number.isFinite(lngInput) ? Number(lngInput.toFixed(7)) : null;
        const hasValidCoords = latValue !== null && lngValue !== null
          && latValue >= -90 && latValue <= 90
          && lngValue >= -180 && lngValue <= 180
          && !(Math.abs(latValue) < 1e-7 && Math.abs(lngValue) < 1e-7);

        if (!hasValidCoords) {
          latValue = null;
          lngValue = null;
        }

        // Helper to ensure numeric fields don't send NaN to Firestore
        const safeNum = (id) => {
          const val = parseFloat(document.getElementById(id)?.value);
          return isNaN(val) ? 0 : val;
        };

        // Gather all values safely with optional chaining to prevent crashes if elements are missing
        const payload = {
          id: propId,
          title: (document.getElementById('f-title')?.value || '').trim(),
          status: document.getElementById('f-status')?.value || 'For Sale',
          type: document.getElementById('f-type')?.value || 'Apartment',
          condition: document.getElementById('f-condition')?.value || '',
          niche: document.getElementById('f-niche')?.value || '',
          
          price: safeNum('f-price'),
          priceOnRequest: document.getElementById('f-priceOnRequest')?.checked || false,
          communityFees: safeNum('f-communityFees'),
          ibiTax: safeNum('f-ibiTax'),
          investmentYield: safeNum('f-investmentYield'),

          availableFrom: document.getElementById('f-availableFrom')?.value || '',
          minimumTerm: document.getElementById('f-minimumTerm')?.value || '',
          longTermRent: document.getElementById('f-longTermRent')?.checked || false,
          shortTermRent: document.getElementById('f-shortTermRent')?.checked || false,

          areaInternal: safeNum('f-areaInternal'),
          areaExternal: safeNum('f-areaExternal'),
          sizeSqFt: safeNum('f-areaInternal'),

          bedrooms: safeNum('f-bedrooms'),
          bathrooms: safeNum('f-bathrooms'),
          suites: safeNum('f-suites'),
          storageRooms: safeNum('f-storageRooms'),
          parking: safeNum('f-parking'),

          yearBuilt: safeNum('f-yearBuilt'),
          floor: document.getElementById('f-floor')?.value || '',
          totalFloors: safeNum('f-totalFloors'),
          furnishing: document.getElementById('f-furnishing')?.value || '',

          // Technical
          basement: safeNum('f-basement'),
          floors: safeNum('f-floors'),
          technicalNotes: document.getElementById('f-technicalNotes')?.value || '',

          energyRating: document.getElementById('f-energyRating')?.value || '',
          energyKwh: safeNum('f-energyKwh'),

          elevator: document.getElementById('fb-elevator')?.checked || false,
          carCharging: document.getElementById('fb-carCharging')?.checked || false,
          pool: document.getElementById('fb-pool')?.checked || false,
          garden: document.getElementById('fb-garden')?.checked || false,
          terrace: document.getElementById('fb-terrace')?.checked || false,
          garage: document.getElementById('fb-garage')?.checked || false,
          condominium: document.getElementById('fb-condominium')?.checked || false,
          ac: document.getElementById('fb-ac')?.checked || false,
          heating: document.getElementById('fb-heating')?.checked || false,
          fireplace: document.getElementById('fb-fireplace')?.checked || false,
          security: document.getElementById('fb-security')?.checked || false,
          smartHome: document.getElementById('fb-smartHome')?.checked || false,
          gym: document.getElementById('fb-gym')?.checked || false,
          tennis: document.getElementById('fb-tennis')?.checked || false,
          solarPanels: document.getElementById('fb-solarPanels')?.checked || false,

          seaView: document.getElementById('fv-sea')?.checked || false,
          riverView: document.getElementById('fv-river')?.checked || false,
          cityView: document.getElementById('fv-city')?.checked || false,
          mountainView: document.getElementById('fv-mountain')?.checked || false,
          countrysideView: document.getElementById('fv-countryside')?.checked || false,

          address: (document.getElementById('f-address')?.value || '').trim(),
          city: document.getElementById('f-city')?.value || '',
          neighbourhood: document.getElementById('f-neighbourhood')?.value || '',
          lat: latValue || 38.7223,
          lng: lngValue || -9.1393,

          description: document.getElementById('f-description')?.value || '',
          neighbourhoodDesc: document.getElementById('f-neighbourhoodDesc')?.value || '',
          videoUrl: '',
          virtualTourUrl: '',

          features: Array.from(document.querySelectorAll('input[name="features"]:checked')).map(el => el.value),
          equipment: Array.from(document.querySelectorAll('input[name="equipment"]:checked')).map(el => el.value),
          customAmenities: Array.from(document.querySelectorAll('input[name="customAmenities"]:checked')).map(el => el.value),
          customViews: Array.from(document.querySelectorAll('input[name="customViews"]:checked')).map(el => el.value)
        };

        // Media and ownership
        payload.images = imageUrls;
        payload.image = imageUrls[0] || '';
        payload.floorPlanImages = [];

        const profileName = String((currentUserProfile && currentUserProfile.name) || currentUser.displayName || document.getElementById('agent-name-sidebar').textContent || 'Agent').trim() || 'Agent';
        const profileRole = String((currentUserProfile && currentUserProfile.role) || 'agent').trim() || 'agent';
        const profilePhoto = String((currentUserProfile && currentUserProfile.profilePhoto) || '').trim();

        payload.agentId = currentUser.uid;
        payload.agentUID = currentUser.uid;
        payload.createdByUid = currentUser.uid;
        payload.createdBy = currentUser.uid;
        payload.agentName = profileName;
        payload.agentRole = profileRole;
        payload.agentPhoto = profilePhoto;
        payload.agentPhone = currentUser.phoneNumber || '';
        payload.createdAt = isEditing
          ? (existingData.createdAt || firebase.firestore.FieldValue.serverTimestamp())
          : (Date.now()); // Use numeric timestamp for easier sorting if serverTimestamp fails
        payload.updatedAt = Date.now();

        const existingNeighbourhoodBase = String(existingData.neighbourhoodDesc || existingData.neighbourhood || '').trim();
        const nextNeighbourhoodBase = String(payload.neighbourhoodDesc || payload.neighbourhood || '').trim();
        
        const needsTranslationRefresh = !isEditing
          || !existingData.translations
          || !existingData.translations.zh
          || !existingData.translations.ar
          || String(existingData.title || '').trim() !== String(payload.title || '').trim()
          || String(existingData.description || '').trim() !== String(payload.description || '').trim()
          || existingNeighbourhoodBase !== nextNeighbourhoodBase;

        if (needsTranslationRefresh) {
          textSpan.textContent = __t('loading');
          // Add a timeout to translation to prevent hanging the whole submission
          const translationPromise = buildInitialTranslations(payload);
          const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 8000));
          
          try {
            const results = await Promise.race([translationPromise, timeoutPromise]);
            if (results) {
              payload.translations = results;
            } else {
              console.warn('Translation timed out, saving without new translations');
              payload.translations = existingData.translations || {};
            }
          } catch (trErr) {
            console.error('Translation error during save:', trErr);
            payload.translations = existingData.translations || {};
          }
        } else {
          payload.translations = existingData.translations || {};
        }

        textSpan.textContent = __t('formSaving');
        
        // Final sanity check on ownership fields
        if (!payload.agentId) payload.agentId = currentUser.uid;
        if (!payload.createdByUid) payload.createdByUid = currentUser.uid;

        await firestore.collection('properties').doc(propId).set(payload, { merge: true });
        
        // Force clear all local caches so the new property appears everywhere immediately
        window.__exoPropertiesCache = [];
        window.__exoPropertiesLoadedAt = 0;
        
        // Force clear cache so new property appears immediately
        const st = window.ExoStore ? window.ExoStore.getState() : {};
        if (window.ExoStore) window.ExoStore.setState({ ...st, properties: [] });

        showToast(isEditing ? __t('toastPropertyUpdated') : __t('toastPropertyCreated'), 'success');
        
        propForm.reset();
        document.getElementById('f-editing-id').value = '';
        document.getElementById('sec-listings').classList.add('active');
        document.getElementById('sec-property-form').classList.remove('active');
        document.querySelector('.nav-item[data-section="sec-listings"]').click();
        renderMine();

      } catch (err) {
        alert("Submission failed: " + err.message);
        showToast(__t('toastErrorPrefix') + ' ' + err.message, 'error');
        console.error("PROPERTY SUBMISSION ERROR:", err);
      } finally {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
      }
    });

    window.editProp = async function(id) {
      document.getElementById('f-editing-id').value = id;
      clearDynamicAddedOptions();
      try {
        const firestore = firebase.firestore();
        const doc = await firestore.collection('properties').doc(id).get();
        if (!doc.exists) { showToast(__t('toastPropertyNotFound'), 'error'); return; }
        const p = doc.data();

        document.getElementById('f-title').value = p.title || '';
        document.getElementById('f-status').value = p.status || 'For Sale';
        document.getElementById('f-type').value = p.type || 'Apartment';
        document.getElementById('f-condition').value = p.condition || '';
        document.getElementById('f-niche').value = p.niche || '';
        
        document.getElementById('f-price').value = p.price || 0;
        document.getElementById('f-priceOnRequest').checked = p.priceOnRequest || false;
        document.getElementById('f-communityFees').value = p.communityFees || 0;
        document.getElementById('f-ibiTax').value = p.ibiTax || 0;
        document.getElementById('f-investmentYield').value = p.investmentYield || 0;
        
        document.getElementById('f-availableFrom').value = p.availableFrom || '';
        document.getElementById('f-minimumTerm').value = p.minimumTerm || '';
        document.getElementById('f-longTermRent').checked = p.longTermRent || false;
        document.getElementById('f-shortTermRent').checked = p.shortTermRent || false;
        fRentalSpecs.style.display = p.status === 'For Rent' ? 'block' : 'none';

        document.getElementById('f-areaInternal').value = p.areaInternal || p.sizeSqFt || 0;
        document.getElementById('f-areaExternal').value = p.areaExternal || 0;
        document.getElementById('f-bedrooms').value = p.bedrooms || 0;
        document.getElementById('f-bathrooms').value = p.bathrooms || 0;
        document.getElementById('f-suites').value = p.suites || 0;
        document.getElementById('f-storageRooms').value = p.storageRooms || 0;
        document.getElementById('f-parking').value = p.parking || 0;

        document.getElementById('f-yearBuilt').value = p.yearBuilt || 0;
        document.getElementById('f-floor').value = p.floor || '';
        document.getElementById('f-totalFloors').value = p.totalFloors || 0;
        document.getElementById('f-furnishing').value = p.furnishing || '';
        document.getElementById('f-energyRating').value = p.energyRating || '';
        document.getElementById('f-energyKwh').value = p.energyKwh || 0;

        // Technical
        document.getElementById('f-basement').value = p.basement || 0;
        document.getElementById('f-floors').value = p.floors || 0;
        document.getElementById('f-technicalNotes').value = p.technicalNotes || '';

        document.getElementById('fb-elevator').checked = p.elevator || false;
        document.getElementById('fb-carCharging').checked = p.carCharging || false;
        document.getElementById('fb-pool').checked = p.pool || false;
        document.getElementById('fb-garden').checked = p.garden || false;
        document.getElementById('fb-terrace').checked = p.terrace || false;
        document.getElementById('fb-garage').checked = p.garage || false;
        document.getElementById('fb-condominium').checked = p.condominium || false;
        document.getElementById('fb-ac').checked = p.ac || false;
        document.getElementById('fb-heating').checked = p.heating || false;
        document.getElementById('fb-fireplace').checked = p.fireplace || false;
        document.getElementById('fb-security').checked = p.security || false;
        document.getElementById('fb-smartHome').checked = p.smartHome || false;
        document.getElementById('fb-gym').checked = p.gym || false;
        document.getElementById('fb-tennis').checked = p.tennis || false;
        document.getElementById('fb-solarPanels').checked = p.solarPanels || false;

        document.getElementById('fv-sea').checked = p.seaView || false;
        document.getElementById('fv-river').checked = p.riverView || false;
        document.getElementById('fv-city').checked = p.cityView || false;
        document.getElementById('fv-mountain').checked = p.mountainView || false;
        document.getElementById('fv-countryside').checked = p.countrysideView || false;

        // Features & Equipment arrays (multi-checkbox)
        const feats = Array.isArray(p.features) ? p.features : [];
        const eqs = Array.isArray(p.equipment) ? p.equipment : [];
        const customAmenities = Array.isArray(p.customAmenities) ? p.customAmenities : [];
        const customViews = Array.isArray(p.customViews) ? p.customViews : [];
        document.querySelectorAll('input[name="features"]').forEach(cb => { cb.checked = feats.includes(cb.value); });
        document.querySelectorAll('input[name="equipment"]').forEach(cb => { cb.checked = eqs.includes(cb.value); });

        customAmenities.forEach(v => addDynamicCheckbox('f-amenities-grid', 'customAmenities', v, true));
        customViews.forEach(v => addDynamicCheckbox('f-views-grid', 'customViews', v, true));

        document.getElementById('f-address').value = p.address || '';
        document.getElementById('f-city').value = p.city || '';
        document.getElementById('f-neighbourhood').value = p.neighbourhood || '';
        const editLat = Number.isFinite(Number(p.lat))
          ? Number(p.lat)
          : (Number.isFinite(Number(p.latitude)) ? Number(p.latitude) : '');
        const editLng = Number.isFinite(Number(p.lng))
          ? Number(p.lng)
          : (Number.isFinite(Number(p.longitude)) ? Number(p.longitude) : '');
        document.getElementById('f-lat').value = editLat;
        document.getElementById('f-lng').value = editLng;

        document.getElementById('f-description').value = p.description || '';
        document.getElementById('f-neighbourhoodDesc').value = p.neighbourhoodDesc || '';

        document.getElementById('form-page-title').textContent = __t('actionEdit') + ' ' + __t('adminProperties').slice(0, -1);
        document.getElementById('form-page-sub').textContent = __t('actionEdit') + ': ' + (p.title || p.id);
        
        const tabs = document.querySelectorAll('.dash-section');
        tabs.forEach(t => t.classList.remove('active'));
        document.getElementById('sec-property-form').classList.add('active');
        
        navItems.forEach(n => n.classList.remove('active'));
        const navAdd = document.getElementById('nav-add-prop');
        if (navAdd) navAdd.classList.add('active');

        // Update map if editing
        if (editLat && editLng) {
          setTimeout(() => {
            initAddPropertyMap();
            if (previewMarker) {
              const newPos = [editLat, editLng];
              previewMarker.setLatLng(newPos);
              previewMap.setView(newPos, 17);
            }
          }, 400);
        }

      } catch (err) {
        showToast(__t('toastErrorPrefix') + ' ' + err.message, 'error');
      }
    };
  /* ── delete property ── */
    window.deleteProp = async function(id) {
      const normalizedId = String(id || '').trim();
      if (!normalizedId || pendingPropertyDeleteIds.has(normalizedId)) return;
      const ok = await showConfirmDialog(__t('agentDeleteConfirm'), __t('actionDelete'), __t('btnCancel'));
      if (!ok) return;

      const prevProps = Array.isArray(myPropertiesCache) ? myPropertiesCache.slice() : [];
      pendingPropertyDeleteIds.add(normalizedId);
      myPropertiesCache = prevProps.filter((p) => String((p && p.id) || '') !== normalizedId);
      renderMine(false);

      try {
        const firestore = firebase.firestore();
        await firestore.collection('properties').doc(normalizedId).delete();
        showToast(__t('toastPropertyDeleted'), 'success');
      } catch (err) {
        myPropertiesCache = prevProps;
        showToast(__t('toastErrorDeleting') + ' ' + err.message, 'error');
      } finally {
        pendingPropertyDeleteIds.delete(normalizedId);
        renderMine(false);
      }
    };



    /* ── Map and Coordinate logic ── */
    let previewMap, previewMarker;

    function initAddPropertyMap() {
      const mapEl = document.getElementById('add-prop-map');
      if (!mapEl) return;

      // Ensure the container is visible and has height before initializing or invalidating
      const isVisible = !!(mapEl.offsetWidth || mapEl.offsetHeight || mapEl.getClientRects().length);
      if (!isVisible) return;

      if (previewMap && mapEl._leaflet_id) {
        setTimeout(() => {
          previewMap.invalidateSize();
          const latStr = document.getElementById('f-lat').value;
          const lngStr = document.getElementById('f-lng').value;
          const lat = parseFloat(latStr);
          const lng = parseFloat(lngStr);
          if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
              previewMap.setView([lat, lng], 19);
              if (previewMarker) previewMarker.setLatLng([lat, lng]);
          }
        }, 400); // Increased delay for stability
        return;
      }

      // Fix Leaflet marker icons
      if (typeof L !== 'undefined' && L.Icon && L.Icon.Default) {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
        });
      }

      // Default: Lisbon
      const latVal = parseFloat(document.getElementById('f-lat').value);
      const lngVal = parseFloat(document.getElementById('f-lng').value);
      const defaultPos = (!isNaN(latVal) && !isNaN(lngVal) && latVal !== 0) ? [latVal, lngVal] : [38.7223, -9.1393];
      
      previewMap = L.map('add-prop-map').setView(defaultPos, 19);
      mapEl._leaflet_id = true;
      
      L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: 'Imagery &copy; Google'
      }).addTo(previewMap);

      previewMarker = L.marker(defaultPos, { draggable: true }).addTo(previewMap);

      previewMarker.on('dragend', () => {
        const pos = previewMarker.getLatLng();
        document.getElementById('f-lat').value = pos.lat.toFixed(7);
        document.getElementById('f-lng').value = pos.lng.toFixed(7);
      });

      ['f-lat', 'f-lng'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
          const lat = parseFloat(document.getElementById('f-lat').value);
          const lng = parseFloat(document.getElementById('f-lng').value);
          if (!isNaN(lat) && !isNaN(lng)) {
            const newPos = [lat, lng];
            previewMarker.setLatLng(newPos);
            previewMap.setView(newPos, 19);
            setTimeout(() => previewMap.invalidateSize(), 100);
          }
        });
      });
      
      // Final invalidate to be sure
      setTimeout(() => previewMap.invalidateSize(), 500);
    }

    /* ── Get coordinates from Nominatim ── */
    document.getElementById('btn-get-coords')?.addEventListener('click', async () => {
      const address = document.getElementById('f-address').value.trim();
      const city = document.getElementById('f-city').value.trim();
      const postalCode = document.getElementById('f-postalCode').value.trim();

      if (!address && !postalCode) {
        showToast('Please enter at least an address or postal code for accurate positioning.', 'error');
        return;
      }

      function cleanAddressSnippet(addr) {
        if (!addr) return '';
        return addr.split(/[-–|]/)[0].trim();
      }
      const cleanAddr = cleanAddressSnippet(address);

      // Use structured query for max accuracy
      let params = new URLSearchParams({ format: 'json', addressdetails: '1', limit: '1', country: 'Portugal' });
      if (cleanAddr) params.append('street', cleanAddr);
      if (city) params.append('city', city);
      if (postalCode) params.append('postalcode', postalCode);
      
      const btn = document.getElementById('btn-get-coords');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching precise location...';
      btn.disabled = true;

      try {
        let url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
        let res = await fetch(url, { headers: { 'User-Agent': 'ExoRealEstate/1.2' } });
        let data = await res.json();
        
        // Fallback: Just Address + City (structured)
        if ((!data || data.length === 0) && cleanAddr && city) {
           let fbParams = new URLSearchParams({ format: 'json', addressdetails: '1', limit: '1', country: 'Portugal', street: cleanAddr, city: city });
           url = `https://nominatim.openstreetmap.org/search?${fbParams.toString()}`;
           res = await fetch(url, { headers: { 'User-Agent': 'ExoRealEstate/1.2' } });
           data = await res.json();
        }

        // Fallback: Just Postal Code (structured)
        if ((!data || data.length === 0) && postalCode) {
           let pcParams = new URLSearchParams({ format: 'json', addressdetails: '1', limit: '1', country: 'Portugal', postalcode: postalCode });
           url = `https://nominatim.openstreetmap.org/search?${pcParams.toString()}`;
           res = await fetch(url, { headers: { 'User-Agent': 'ExoRealEstate/1.2' } });
           data = await res.json();
        }

        // Final Fallback: Unstructured query
        if ((!data || data.length === 0) && address) {
           const query = [cleanAddr, postalCode, city, 'Portugal'].filter(Boolean).join(', ');
           url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=1`;
           res = await fetch(url, { headers: { 'User-Agent': 'ExoRealEstate/1.2' } });
           data = await res.json();
        }
        
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          
          document.getElementById('f-lat').value = lat.toFixed(7);
          document.getElementById('f-lng').value = lon.toFixed(7);
          
          const newPos = [lat, lon];
          if (previewMarker) {
            previewMarker.setLatLng(newPos);
            previewMap.setView(newPos, 19);
            setTimeout(() => previewMap.invalidateSize(), 50);
          }
          
          showToast('Precise position found! You can drag the marker to adjust.', 'success');
        } else {
          showToast('Location not found. Try a simpler address or manually drag the marker.', 'error');
        }
      } catch (err) {
        showToast('Connection error. Please enter coordinates manually.', 'error');
        console.error(err);
      } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    });

    ['f-address', 'f-city', 'f-postalCode'].forEach(id => {
      document.getElementById(id)?.addEventListener('blur', () => {
        if (!document.getElementById('f-lat').value && document.getElementById('f-address').value) {
            document.getElementById('btn-get-coords')?.click();
        }
      });
    });

    // Also try on navigation
    window.addEventListener('hashchange', () => { setTimeout(initAddPropertyMap, 400); });

    // Enhanced observer for section activation
    const observer = new MutationObserver(() => {
      const addSection = document.getElementById('sec-property-form');
      if (addSection && addSection.classList.contains('active')) {
        setTimeout(initAddPropertyMap, 300);
      }
    });
    observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });

    // Explicitly hook into the nav items as well
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
         if (item.dataset.section === 'sec-property-form') {
           setTimeout(initAddPropertyMap, 600);
         }
      });
    });

    // Run once on load just in case
    if (document.getElementById('sec-property-form')?.classList.contains('active')) {
      setTimeout(initAddPropertyMap, 800);
    }

    /* ── Firebase Auth guard ── */
    // FIX: use firebase.auth() directly instead of relying on `auth` variable from firebase.js
    firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        window.location.href = 'login.html';
        return;
      }
      currentUser = user;

      try {
        const firestore = firebase.firestore();
        const doc = await firestore.collection('users').doc(user.uid).get();
        if (!doc.exists) {
          firebase.auth().signOut();
          window.location.href = 'login.html';
          return;
        }

        const u = doc.data() || {};

        // role check — only dealer/agent allowed
        if (u.role !== 'dealer' && u.role !== 'agent') {
          firebase.auth().signOut();
          window.location.href = 'login.html';
          return;
        }

        // deactivated check
        if (u.active === false) {
          showToast(__t('toastAccountDeactivated'), 'error');
          setTimeout(() => {
            firebase.auth().signOut();
            window.location.href = 'login.html';
          }, 2500);
          return;
        }

        const name = String(u.name || user.displayName || user.email || 'Agent').trim() || 'Agent';
        const role = String(u.role || 'agent').trim() || 'agent';
        const photo = String(u.profilePhoto || u.photoURL || user.photoURL || '').trim();

        currentUserProfile = {
          ...u,
          name,
          role,
          profilePhoto: photo
        };

        setAgentIdentityUi(name, role, photo);
        populateAgentProfileForm(currentUserProfile);
        syncAgentIdentityAcrossProperties(name, role, photo);
      } catch (err) {
        console.error('User fetch error:', err);
        const fallbackName = String(user.displayName || user.email || 'Agent').trim() || 'Agent';
        const fallbackPhoto = String(user.photoURL || '').trim();
        currentUserProfile = {
          name: fallbackName,
          role: 'agent',
          profilePhoto: fallbackPhoto
        };
        setAgentIdentityUi(fallbackName, 'agent', fallbackPhoto);
        populateAgentProfileForm(currentUserProfile);
      }

      // load and render
      renderMine();
    });
  