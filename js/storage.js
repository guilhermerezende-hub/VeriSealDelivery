// O namespace existente mantém sacolas e preferências já salvas.
export function createStore(getStorage = () => globalThis.localStorage) {
  return {
    get(key, fallback) {
      try {
        const raw = getStorage().getItem("vsd:" + key);
        return raw === null ? fallback : (JSON.parse(raw) ?? fallback);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        getStorage().setItem("vsd:" + key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },
  };
}

export const store = createStore();
