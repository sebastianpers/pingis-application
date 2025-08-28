// src/hooks/useInstallPrompt.ts
import { useCallback, useEffect, useRef, useState } from "react";

const isStandaloneDisplay = (): boolean => {
  // Funkar i de flesta webbläsare (inkl. desktop-PWA)
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  // iOS Safari (legacy)
  // @ts-ignore
  if (typeof navigator !== "undefined" && navigator.standalone) return true;
  return false;
};

function isIOS(): boolean {
  // Enkel detektion räcker för att visa instruktioner
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function useInstallPrompt() {
  const deferred = useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(isStandaloneDisplay());
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  // Lyssna på beforeinstallprompt (Android/Chrome/desktop)
  useEffect(() => {
    const onBIP = (e: Event) => {
      const ev = e as BeforeInstallPromptEvent;

      ev.preventDefault(); // vi vill styra tajming själva

      deferred.current = ev;
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", onBIP as EventListener);

    // När appen installeras
    const onInstalled = () => {
      setInstalled(true);
      deferred.current = null;
      setCanInstall(false);
    };

    window.addEventListener("appinstalled", onInstalled);

    // Kolla när display-mode ändras (t.ex. öppnad som PWA)
    const mql = window.matchMedia?.("(display-mode: standalone)");
    const onDisplayChange = () => setInstalled(isStandaloneDisplay());

    mql?.addEventListener?.("change", onDisplayChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP as EventListener);
      window.removeEventListener("appinstalled", onInstalled);

      mql?.removeEventListener?.("change", onDisplayChange);
    };
  }, []);

  // Visa iOS-instruktion om ej installerad och ingen beforeinstallprompt stöds
  useEffect(() => {
    if (!installed && isIOS()) setShowIOSHelp(true);
  }, [installed]);

  const promptInstall = useCallback(async () => {
    const ev = deferred.current;
    if (!ev) return { outcome: "unavailable" as const };

    deferred.current = null; // event kan bara användas en gång

    await ev.prompt();

    const choice = await ev.userChoice;
    setCanInstall(false);

    return choice; // { outcome: 'accepted' | 'dismissed', platform }
  }, []);

  return {
    canInstall, // visa “Installera” bara när detta är true
    installed, // göm banner när installerad
    showIOSHelp, // visa iOS-instruktion vid behov
    promptInstall, // anropa på knapptryck
  };
}
