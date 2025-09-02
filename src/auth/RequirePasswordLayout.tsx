import { useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { getScopeAuthorized, setScopeAuthorized } from "./PasswordAuth";

export default function RequirePasswordLayout({
  scope = "settings",
  fallbackRedirect = "/",
  persist = true,
}: {
  scope?: string;
  fallbackRedirect?: string;
  persist?: boolean;
}) {
  const { requestAuth } = useAuth();
  const navigate = useNavigate();

  const initiallyAuthorized = useMemo(
    () => (persist ? getScopeAuthorized(scope) : false),
    [scope, persist]
  );

  const [authorized, setAuthorized] = useState<boolean>(initiallyAuthorized);
  const [checking, setChecking] = useState<boolean>(!initiallyAuthorized);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (authorized) {
        setChecking(false);
        return;
      }

      const ok = await requestAuth();
      if (cancelled) return;

      if (!ok) {
        navigate(fallbackRedirect, { replace: true });
        return;
      }

      if (persist) setScopeAuthorized(scope, true);

      setAuthorized(true);
      setChecking(false);
    };

    if (!authorized) run();
    else setChecking(false);

    return () => {
      cancelled = true;
    };
  }, [authorized, requestAuth, navigate, fallbackRedirect, scope, persist]);

  if (checking || !authorized) return null;

  return <Outlet />;
}
