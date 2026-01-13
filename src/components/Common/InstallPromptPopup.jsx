import { useEffect, useState } from "react";
import "./InstallPromptPopup.css"
import appicon from "../../appLogo.png"

const DISMISS_KEY = "pwa-install-dismissed-at";
const SHOW_AGAIN_DAYS = 7;

export default function InstallPromptPopup() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) return;

    const ios =
      /iPhone|iPad|iPod/i.test(navigator.userAgent) &&
      !window.matchMedia("(display-mode: standalone)").matches;

    setIsIOS(ios);

    // ⏱ Re-show after 7 days
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const daysPassed =
        (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysPassed < SHOW_AGAIN_DAYS) return;
    }

    const showPopupWithDelay = () => {
      setTimeout(() => {
        setVisible(true);
        trackEvent("pwa_prompt_shown");
      }, 3000);
    };

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      if (deferredPrompt) return;
      setDeferredPrompt(e);
      showPopupWithDelay();
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // iOS fallback
    if (ios && "standalone" in window.navigator === false) {
      showPopupWithDelay();
    }
    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      trackEvent("pwa_installed");
    } else {
      trackEvent("pwa_install_rejected");
    }

    closePopup();
  };

  const closePopup = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    trackEvent("pwa_prompt_dismissed");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="pwa-popup-backdrop">
      <div className="pwa-popup slide-fade">
        {/* 🔰 App Icon */}
        <img
          src={appicon}
          alt="App Icon"
          className="pwa-icon"
        />

        <h3>Install App</h3>

        {!isIOS && (
          <p>
            Install this app on your device for faster access, offline usage,
            and a native app experience.
          </p>
        )}

        {isIOS && (
          <p className="ios-instructions">
            To install this app on iPhone:
            <br />
            <strong>Share</strong> → <strong>Add to Home Screen</strong>
          </p>
        )}

        <div className="pwa-actions">
          {!isIOS && (
            <button className="btn-install" onClick={installApp}>
              Install
            </button>
          )}
          <button className="btn-cancel" onClick={closePopup}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

/* 📊 Analytics Stub */
function trackEvent(eventName) {
  console.log("[PWA EVENT]", eventName);

  // Example:
  // window.gtag?.("event", eventName);
  // analytics.track(eventName);
}
