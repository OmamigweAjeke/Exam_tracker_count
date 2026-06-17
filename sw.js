// ==========================================================================
// 1. IMPORT BACKGROUND CLOUD HANDLERS
// ==========================================================================
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
// ==========================================================================
// 2. OFFLINE STORAGE ENGINE CONFIGURATION
// ==========================================================================
const CACHE_NAME = 'exam-timer-v2';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
