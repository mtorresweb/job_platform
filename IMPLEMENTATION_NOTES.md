# Implementation Notes (session safety)

## 2026-01-30
 **Dev server guard**: api-client, socket client, file-upload utils y `useLocalStorage` validan que `localStorage` exista y exponga `getItem`/`setItem`/`removeItem` antes de usarlos para evitar `localStorage.getItem is not a function`.
