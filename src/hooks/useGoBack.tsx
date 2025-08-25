import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const useGoBackOrHome = (home: string = "/") => {
  const navigate = useNavigate();

  return useCallback(() => {
    if (window.history.length <= 1) {
      navigate(home, { replace: true });
    } else {
      navigate(-1);
    }
  }, [navigate, home]);
};
