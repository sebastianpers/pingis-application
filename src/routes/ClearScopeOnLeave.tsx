import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { clearScopeAuthorization } from "../auth/PasswordAuth";


export default function ClearScopeOnLeave({ scope = "settings" }: { scope?: string }) {
  useEffect(() => {
    // körs när man lämnar sidan
    return () => {
      clearScopeAuthorization(scope);
    };
  }, [scope]);

  return <Outlet />;
}
