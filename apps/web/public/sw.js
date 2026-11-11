// apps/web/public/sw.js
// YuukiList Service Worker — PWA & Safe Offline Cache (v2 - Network First)

const CACHE_NAME = 'yuukilist-v2';
const STATIC_ASSETS = [
  '/',
  '/library',
  '/calendar',
  '/profile',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Falha ao pré-carregar alguns assets:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purgando cache legado:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Ignora requisições não-GET e APIs de mutação
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Não faz cache de endpoints de autenticação ou mutação
  if (url.pathname.startsWith('/api/v1/auth')) return;

  // Estratégia Network-First: Tenta a rede primeiro para garantir código e chunks sempre frescos.
  // Em caso de falha de rede (modo offline), recorre com segurança ao cache recente.
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Fallback offline a partir do cache seguro
        const cached = await caches.match(event.request);
        if (cached) {
          return cached;
        }
        // Se for navegação de página em modo offline, retorna a raiz em cache
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});

// Listener para expurgo obrigatório de cache sensível no logout
self.addEventListener('message', (event) => {
  if (event.data === 'PURGE_PRIVATE_CACHE' || event.data?.action === 'PURGE_PRIVATE_CACHE') {
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      console.log('[SW] Cache privado expurgado com sucesso após logout.');
    });
  }
});
