// ===== Enhanced PWA Installation Logic =====
    let deferredPrompt;
    const installBtn = document.getElementById('install-btn');

    // Check if app is already installed
    function isAppInstalled() {
      return window.matchMedia('(display-mode: standalone)').matches || 
             window.navigator.standalone ||
             document.referrer.includes('android-app://');
    }

    // Toggle install button visibility
    function toggleInstallButton() {
      if (isAppInstalled()) {
        installBtn.style.display = 'none';
      } else if (deferredPrompt) {
        installBtn.style.display = 'flex';
      } else {
        installBtn.style.display = 'none';
      }
    }

    // Check on page load
    document.addEventListener('DOMContentLoaded', () => {
      toggleInstallButton();
      
      // Detect iOS devices
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS && !window.navigator.standalone) {
        // Show custom iOS install instructions if needed
      }
    });

    // Before install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      toggleInstallButton();
    });

    // Install button click
    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('User accepted install');
          installBtn.style.display = 'none';
        }
        deferredPrompt = null;
      });
    }

    // App installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully');
      if (installBtn) installBtn.style.display = 'none';
      deferredPrompt = null;
    });

    // ===== Service Worker Registration =====
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('ServiceWorker registered:', registration);
            
            // Check for updates periodically
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              console.log('Update found for ServiceWorker');
              
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New content available');
                  // Show update notification to user
                }
              });
            });
          })
          .catch(error => {
            console.error('ServiceWorker registration failed:', error);
          });
      });
    }

    // ===== Responsive Adjustments =====
    function handleResize() {
      // Adjust layout for different screen sizes
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    // Initial call and event listener
    handleResize();
    window.addEventListener('resize', handleResize);