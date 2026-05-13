// Exo Real Estate Search Functions
// Loads properties data from Firestore cache only.

function getSearchProps() {
  if (Array.isArray(window.__exoPropertiesCache) && window.__exoPropertiesCache.length) {
    return window.__exoPropertiesCache;
  }
  return [];
}

function performTextSearch() {
  const area = document.getElementById('area-text').value.toLowerCase();
  const type = document.querySelector('#text-tab select')?.value || 'All';
  const minPrice = parseInt(document.querySelector('#text-tab input[type="number"]:nth-of-type(1)')?.value) || 0;
  const maxPrice = parseInt(document.querySelector('#text-tab input[type="number"]:nth-of-type(2)')?.value) || Infinity;
  
  const filtered = getSearchProps().filter(p => {
    const searchBlob = [
      p.id,
      p.title,
      p.address,
      p.neighbourhood,
      p.city
    ]
      .map((v) => String(v || '').toLowerCase().trim())
      .filter(Boolean)
      .join(' ');

    return (
      (searchBlob.includes(area) || 
       (area === 'lisbon' && searchBlob.includes('lisboa')) || 
       (area === 'lisboa' && searchBlob.includes('lisbon')))
    )
      && (type === 'All' || p.type === type)
      && p.price >= minPrice
      && p.price <= maxPrice;
  });
  
  renderSearchResults(filtered, '#featured-grid');
}

function renderSearchResults(props, containerId) {
  const container = document.querySelector(containerId);
  if (!container) return;
  
  container.innerHTML = props.map(p => `
    <div class="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all overflow-hidden cursor-pointer" onclick="openPropertyModal('${p.id}')">
      <div class="h-64 bg-gradient-to-br from-blue-400 to-orange-400 flex items-center justify-center">
        <i class="fas fa-home text-5xl text-white opacity-80"></i>
      </div>
      <div class="p-8">
        <h3 class="font-bold text-xl text-slate-900 mb-2">${p.title}</h3>
        <p class="text-slate-600 mb-4">${p.address}</p>
        <div class="text-2xl font-bold text-blue-600 mb-4">€${p.price.toLocaleString()}</div>
        <div class="flex items-center gap-4 text-sm text-slate-500">
          <span><i class="fas fa-bed mr-1"></i>T${p.bedrooms}</span>
          <span><i class="fas fa-bath mr-1"></i>3 Baths</span>
        </div>
      </div>
    </div>
  `).join('') || '<div class="col-span-full text-center py-20 text-slate-500"><i class="fas fa-search text-4xl mb-4"></i><p>No properties found. Try different search.</p></div>';
}

function openPropertyModal(id) {
  window.location.href = 'property-detail.html?id=' + id;
}


// Export for global use
window.performTextSearch = performTextSearch;
window.renderSearchResults = renderSearchResults;

// Haversine distance (km) between two lat/lng points
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Nearby search using Nominatim (OpenStreetMap) + radius filter + 300ms debounce
let nearbySearchDebounceTimer;

window.nearbySearch = function() {
  clearTimeout(nearbySearchDebounceTimer);
  nearbySearchDebounceTimer = setTimeout(async () => {
    const location = document.getElementById('nearby-location').value.trim();
    const radiusKm = parseFloat(document.getElementById('nearby-radius').value) || 2;

    if (!location) {
      const grid = document.getElementById('properties-grid');
      if (grid) {
        grid.innerHTML = '<div class="col-span-full text-center py-10 text-slate-500"><p>Please enter a location.</p></div>';
      }
      return;
    }

    const grid = document.getElementById('properties-grid');
    if (grid) grid.innerHTML = '<div class="col-span-full text-center py-8"><i class="fas fa-spinner fa-spin text-2xl text-blue-600 mb-4"></i><p>Searching nearby properties...</p></div>';

    try {
      // Geocode location using Nominatim API
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`, {
        headers: { 'User-Agent': 'ExoRealEstate/1.0' }
      });
      const data = await response.json();

      if (!data || data.length === 0) {
        throw new Error('Location not found. Try "Lisbon, Portugal" or "Praia da Rocha"');
      }

      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);

      // Filter properties within radius
      const nearby = getSearchProps().filter(p => {
        if (!p.lat || !p.lng) return false;
        const dist = haversineDistance(lat, lng, p.lat, p.lng);
        return dist <= radiusKm;
      }).sort((a,b) => Number(a.price||0) - Number(b.price||0));

      if (nearby.length === 0) {
        if (grid) grid.innerHTML = '<div class="col-span-full text-center py-20 text-slate-500"><i class="fas fa-map-marker-alt text-4xl mb-4"></i><p>No properties found within ' + radiusKm + 'km of ' + location + '. Try larger radius.</p></div>';
        const nearbyResults = document.getElementById('nearby-results');
        if (nearbyResults) nearbyResults.innerHTML = '<div class="text-center py-8 text-slate-500">No properties found within the selected radius.</div>';
        return;
      }

      // Render using existing function (global)
      if (grid && typeof renderCards !== 'undefined') {
        renderCards(nearby);
      } else if (document.getElementById('nearby-results')) {
        // Fallback or specific rendering for index pages
        document.getElementById('nearby-results').innerHTML = nearby.slice(0, 6).map(p =>
          `<div class="p-3 bg-white rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all border" onclick="openPropertyModal('${p.id}')">
            <h5 class="font-bold text-slate-800">${p.title}</h5>
            <p class="text-sm text-slate-600">${p.address ? p.address.split(',')[0] : ''}</p>
            <div class="font-bold text-lg text-emerald-600 mt-1">€${Number(p.price || 0).toLocaleString()}</div>
          </div>`
        ).join('');
      } else {
        // No suitable container found to display nearby results.
      }

    } catch (error) {
      console.error('Nearby search error:', error);
      if (grid) grid.innerHTML = '<div class="col-span-full text-center py-20 text-slate-500"><i class="fas fa-exclamation-triangle text-4xl mb-4 text-amber-600"></i><p>Error: ' + error.message + '</p><p>Check your connection or try another location.</p></div>';
      const nearbyResults = document.getElementById('nearby-results');
      if (nearbyResults) nearbyResults.innerHTML = `<div class="text-center py-8 text-red-500">Error: ${error.message}</div>`;
    }
  }, 300);
};




