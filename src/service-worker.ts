/// <reference lib="webworker" />

type PrecacheEntry = { url: string; revision: string | null };

const serviceWorker = globalThis as unknown as ServiceWorkerGlobalScope & {
  __WB_MANIFEST: PrecacheEntry[];
};

const precacheManifest = serviceWorker.__WB_MANIFEST;
console.log("precache", precacheManifest);
const precacheUrls: string[] = precacheManifest
  .map((x: PrecacheEntry) => "/" + x.url)
  .concat("/");

const version: string = import.meta.env.VITE_APP_VERSION ?? "dev";
const cachePrefix = "gs-quant";
const cacheName = `${cachePrefix}_${version}`;

const messageAllClients = (msg: string): void => {
  serviceWorker.clients
    .matchAll()
    .then((clients: readonly Client[]) =>
      clients.forEach((client) => client.postMessage(msg)),
    );
};

serviceWorker.addEventListener("install", (event: ExtendableEvent) => {
  console.log(`Installing service worker ${version}...`);

  event.waitUntil(
    caches
      .open(cacheName)
      .then((cache: Cache) => cache.addAll(precacheUrls))
      .then(() => console.log(`Finished installing v${version}`)),
  );
});

serviceWorker.addEventListener("activate", (event: ExtendableEvent) => {
  console.log(`Activating service worker v${version}...`);

  event.waitUntil(
    caches
      .keys()
      .then((keys: string[]) => {
        keys.forEach((key: string) => {
          if (key.startsWith(cachePrefix) && key !== cacheName) {
            console.log(`Deleting cache ${key}`);
            caches.delete(key);
          }
        });
      })
      .then(() => console.log(`Activated service worker ${version}`)),
  );
});

serviceWorker.addEventListener("fetch", (event: FetchEvent) => {
  const url: URL = new URL(event.request.url);

  if (precacheUrls.includes(url.pathname)) {
    event.respondWith(cacheFirstThenNetworkAndSave(event));
    return;
  }

  return;
});

serviceWorker.addEventListener("message", (event: ExtendableMessageEvent) => {
  console.log("Received message:", event);
  if (event.data === "SKIP_WAITING") {
    console.log("Received update signal!");
    serviceWorker.skipWaiting().then(() => {
      serviceWorker.clients.claim().then(() => messageAllClients("UPDATED"));
    });
  }
});

const cacheFirstThenNetworkAndSave = async (
  event: FetchEvent,
): Promise<Response> => {
  const request: Request = event.request.clone();
  const cache: Cache = await caches.open(cacheName);
  const cacheResponse: Response | undefined = await cache.match(event.request);

  if (cacheResponse) return cacheResponse;

  const networkResponse: Response = await fetch(request);
  cache.put(request, networkResponse.clone());
  return networkResponse;
};
