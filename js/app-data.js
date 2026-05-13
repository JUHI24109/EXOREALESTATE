(function () {
  const APP_KEY = "exoAppStateV1";
  const runtimeState = {
    adminMessages: [],
    properties: []
  };

  const defaultState = {
    adminMessages: [],
    properties: []
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(APP_KEY);
      if (!raw) return structuredClone(defaultState);
      const parsed = JSON.parse(raw);
      return {
        ...structuredClone(defaultState),
        adminMessages: Array.isArray(parsed.adminMessages) ? parsed.adminMessages : []
      };
    } catch (e) {
      return structuredClone(defaultState);
    }
  }

  function saveState(state) {
    localStorage.setItem(APP_KEY, JSON.stringify({
      adminMessages: Array.isArray(state.adminMessages) ? state.adminMessages : []
    }));
  }

  function ensureState() {
    const state = loadState();
    saveState(state);
    return state;
  }

  function uid(prefix) {
    return prefix + "_" + Math.random().toString(36).slice(2, 9);
  }

  const ExoStore = {
    getState() {
      return {
        adminMessages: Array.isArray(runtimeState.adminMessages) ? runtimeState.adminMessages : [],
        properties: Array.isArray(runtimeState.properties) ? runtimeState.properties : []
      };
    },
    setState(state) {
      const next = state || {};
      runtimeState.adminMessages = Array.isArray(next.adminMessages) ? next.adminMessages : [];
      runtimeState.properties = Array.isArray(next.properties) ? next.properties : [];
      saveState(runtimeState);
    },
    reset() {
      runtimeState.adminMessages = [];
      runtimeState.properties = [];
      saveState(runtimeState);
    },
    addMessage(msg) {
      runtimeState.adminMessages.unshift({ id: uid("msg"), createdAt: Date.now(), ...msg });
      saveState(runtimeState);
    },
    addProperty(property) {
      runtimeState.properties.unshift({ id: uid("prop"), createdAt: Date.now(), ...property });
    },
    updateProperty(id, patch) {
      runtimeState.properties = runtimeState.properties.map((p) => (p.id === id ? { ...p, ...patch } : p));
    },
    deleteProperty(id) {
      runtimeState.properties = runtimeState.properties.filter((p) => p.id !== id);
    }
  };

  window.ExoStore = ExoStore;
  const boot = ensureState();
  runtimeState.adminMessages = Array.isArray(boot.adminMessages) ? boot.adminMessages : [];
  runtimeState.properties = [];
})();
