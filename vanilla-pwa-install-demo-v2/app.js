// Vanilla PWA installer v2
// Always-visible install triggers via class: .pwa-install-trigger
let deferredPrompt = null;

const statusBox = document.getElementById('status');
const iosModal = document.getElementById('iosModal');
const iosClose = document.getElementById('iosClose');
const fbModal = document.getElementById('fallbackModal');
const fbClose = document.getElementById('fbClose');

function setStatus(msg) {
  statusBox.textContent = msg;
  statusBox.style.display = 'block';
}
function open(el) { el?.classList.add('show'); }
function close(el) { el?.classList.remove('show'); }

// Platform helpers
function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

// Register SW early
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js').catch(console.error);
}

// Cache the event but DON'T hide buttons — they are always visible
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

window.addEventListener('appinstalled', () => {
  setStatus('✅ PWA встановлено. На мобільному зʼявилась іконка на головному екрані.');
});

// Bind all triggers
function bindInstallTriggers() {
  const triggers = document.querySelectorAll('.pwa-install-trigger');
  triggers.forEach(btn => {
    // Avoid duplicate bindings
    if (btn.__pwaBound) return;
    btn.__pwaBound = true;

    btn.addEventListener('click', async () => {
      // iOS never fires beforeinstallprompt — show instructions
      if (isIOS()) {
        open(iosModal);
        return;
      }

      // If we have the event, prompt
      if (deferredPrompt) {
        try {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          deferredPrompt = null;
          if (outcome === 'accepted') {
            setStatus('Користувач погодився на встановлення.');
          } else {
            setStatus('Користувач скасував встановлення.');
          }
        } catch (err) {
          console.error(err);
          setStatus('Сталася помилка під час встановлення.');
        }
        return;
      }

      // No event (e.g., not over HTTPS, or unsupported browser)
      open(fbModal);
    });
  });
}

bindInstallTriggers();
document.addEventListener('DOMContentLoaded', bindInstallTriggers);

// Modal close buttons / backdrop click
iosClose?.addEventListener('click', () => close(iosModal));
fbClose?.addEventListener('click', () => close(fbModal));
iosModal?.addEventListener('click', (e) => { if (e.target === iosModal) close(iosModal); });
fbModal?.addEventListener('click', (e) => { if (e.target === fbModal) close(fbModal); });

// Expose a universal function to programmatically start install from anywhere
window.startPWAInstall = async function startPWAInstall() {
  // Find or create a synthetic click path
  const sampleTrigger = document.querySelector('.pwa-install-trigger');
  if (sampleTrigger) {
    sampleTrigger.click();
    return;
  }
  // Fallback behavior mirrors the button click
  if (isIOS()) {
    open(iosModal);
  } else if (deferredPrompt) {
    deferredPrompt.prompt();
  } else {
    open(fbModal);
  }
};
