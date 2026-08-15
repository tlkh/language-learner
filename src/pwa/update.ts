export async function checkForAppUpdate(registration?: ServiceWorkerRegistration) {
  const serviceWorker = navigator.serviceWorker;
  if (!registration && !serviceWorker) return undefined;
  const activeRegistration = registration
    ?? await serviceWorker.getRegistration()
    ?? await serviceWorker.ready;
  await activeRegistration?.update();
  return activeRegistration;
}
