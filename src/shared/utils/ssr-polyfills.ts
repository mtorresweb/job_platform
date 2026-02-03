// Polyfills for Node runtimes where global localStorage/sessionStorage exist
// without the standard Storage interface (e.g., Node started with --localstorage-file
// but no valid path). This ensures server-side rendering does not crash when
// code or dev overlays access localStorage.

if (typeof window === "undefined") {
  const currentLocalStorage = (globalThis as typeof globalThis & { localStorage?: unknown }).localStorage;

  const isBrokenLocalStorage =
    typeof currentLocalStorage === "object" &&
    currentLocalStorage !== null &&
    typeof (currentLocalStorage as { getItem?: unknown }).getItem !== "function";

  if (isBrokenLocalStorage) {
    const memoryStore = new Map<string, string>();

    const safeStorage: Storage = {
      get length() {
        return memoryStore.size;
      },
      clear() {
        memoryStore.clear();
      },
      getItem(key: string) {
        return memoryStore.has(key) ? memoryStore.get(key)! : null;
      },
      key(index: number) {
        return Array.from(memoryStore.keys())[index] ?? null;
      },
      removeItem(key: string) {
        memoryStore.delete(key);
      },
      setItem(key: string, value: string) {
        memoryStore.set(key, String(value));
      },
    };

    Object.defineProperty(globalThis, "localStorage", {
      value: safeStorage,
      writable: false,
      configurable: true,
    });

    Object.defineProperty(globalThis, "sessionStorage", {
      value: safeStorage,
      writable: false,
      configurable: true,
    });
  }
}
