import { useEffect, useMemo, useState } from "react";
import { useInstallPrompt } from "../hooks/useInstallPrompt";
import { Col, Row } from "react-bootstrap";
import { cooldownDaysFor } from "../utils/cooldownDays";

// Nycklar i localStorage
const DISMISS_TS_KEY = "a2hs-dismissed-at";
const DISMISS_COUNT_KEY = "a2hs-dismiss-count";

// Säkert parseNumber för localStorage
const readNum = (key: string, fallback = 0) => {
  const raw = localStorage.getItem(key);
  const n = raw == null ? NaN : Number(raw);

  return Number.isFinite(n) ? n : fallback;
};

export default function InstallBanner() {
  const { canInstall, installed, showIOSHelp, promptInstall } =
    useInstallPrompt();

  const [dismissCount, setDismissCount] = useState<number>(() =>
    readNum(DISMISS_COUNT_KEY, 0)
  );
  const [dismissedAt, setDismissedAt] = useState<number>(() =>
    readNum(DISMISS_TS_KEY, 0)
  );

  useEffect(() => {
    if (installed) {
      localStorage.removeItem(DISMISS_TS_KEY);
      localStorage.removeItem(DISMISS_COUNT_KEY);
    }
  }, [installed]);

  const canShowAfterCooldown = useMemo(() => {
    const days = cooldownDaysFor(dismissCount);
    const cooldownMs = days * 24 * 60 * 60 * 1000;

    return Date.now() - dismissedAt > cooldownMs;
  }, [dismissCount, dismissedAt]);

  const showInstall = !installed && canShowAfterCooldown && canInstall;
  const showIOS =
    !installed && canShowAfterCooldown && !canInstall && showIOSHelp;

  if (!showInstall && !showIOS) return null;

  function snoozeNow() {
    const next = dismissCount + 1;

    setDismissCount(next);
    setDismissedAt(Date.now());

    localStorage.setItem(DISMISS_COUNT_KEY, String(next));
    localStorage.setItem(DISMISS_TS_KEY, String(Date.now()));
  }

  async function handleInstallClick() {
    const res: any = await promptInstall?.();
    if (!res || res?.outcome === "dismissed") snoozeNow();
  }

  return (
    <div
      role="dialog"
      aria-label="Installationsmöjlighet"
      style={{
        width: "auto",
        position: "fixed",
        left: 0,
        right: 0,
        top: 0,
        zIndex: 50,
        padding: "12px 14px",
        boxShadow: "0 8px 24px rgba(0,0,0,.2)",
        background: "#e8e8e8",
      }}
      className="d-flex justify-content-center"
    >
      {showInstall && (
        <Row className="flex-column w-100" style={{ maxWidth: 720 }}>
          <Col className="d-flex justify-content-center">
            <span className="text-dark">
              Installera appen för snabbare åtkomst och offline.
            </span>
          </Col>

          <Col className="d-flex justify-content-center mb-2 mt-3 gap-4">
            <button onClick={snoozeNow} className="btn btn-cancel">
              Inte nu
            </button>
            <button onClick={handleInstallClick} className="btn">
              Installera
            </button>
          </Col>
        </Row>
      )}

      {showIOS && (
        <Row
          className="flex-row w-100 align-items-center"
          style={{ maxWidth: 720, gap: 12 }}
        >
          <Col className="flex-grow-1">
            <span className="text-dark">
              På iPhone/iPad: öppna <strong>Dela</strong> och välj{" "}
              <strong>Lägg till på hemskärmen</strong>.
            </span>
          </Col>

          <Col xs="auto">
            <button onClick={snoozeNow} className="btn btn-outline-secondary">
              Ok
            </button>
          </Col>
        </Row>
      )}
    </div>
  );
}
