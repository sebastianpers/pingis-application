import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { AuthContext, type AuthContextValue } from "./AuthContext";
import { useNavigate } from "react-router-dom";

type Deferred<T> = { promise: Promise<T>; resolve: (value: T) => void };

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const deferredRef = useRef<Deferred<boolean> | null>(null);

  const navigate = useNavigate();

  const openModal = () => setShow(true);
  const closeModal = () => {
    setShow(false);
    setPassword("");
    setError(null);
  };

  // TODO: Byt mot server-side verifiering (fetch/axios) - om det vidareutvecklas till något vettigt
  const verifyPassword = (pwd: string): boolean => {
    return pwd === "19kaffekaka96";
  };

  /* Visar modalen och returnerar en Promise<boolean> som löses vid OK/Avbryt. */
  const requestAuth = useCallback((): Promise<boolean> => {
    if (deferredRef.current) return deferredRef.current.promise;

    let resolveFn!: (value: boolean) => void;
    const promise = new Promise<boolean>((resolve) => {
      resolveFn = resolve;
    });

    deferredRef.current = { promise, resolve: resolveFn };
    openModal();

    return promise;
  }, []);

  const resolveAuth = (ok: boolean) => {
    deferredRef.current?.resolve(ok);
    deferredRef.current = null;

    closeModal();

    if (!ok) {
      navigate("/");
    }
  };

  // Säkerställ att ev. pågående promise inte lämnas hängande vid unmount
  useEffect(() => {
    return () => {
      if (deferredRef.current) {
        deferredRef.current.resolve(false);
        deferredRef.current = null;
      }
    };
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitting(true);
    setError(null);

    try {
      const ok = verifyPassword(password);
      if (!ok) {
        setError("Fel lösenord. Försök igen.");
        return;
      }
      resolveAuth(true);
    } finally {
      setSubmitting(false);
    }
  };

  const onCancel = () => resolveAuth(false);

  const value: AuthContextValue = useMemo(
    () => ({ requestAuth }),
    [requestAuth]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}

      <Modal show={show} onHide={onCancel} backdrop="static" keyboard centered>
        <Form onSubmit={onSubmit} noValidate>
          <Modal.Header closeButton>
            <Modal.Title>Ange lösenord</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group controlId="settingsPassword">
              <Form.Label className="fw-semibold">Lösenord</Form.Label>
              <Form.Control
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                placeholder="••••••••"
                required
                aria-invalid={!!error}
                aria-describedby={error ? "authError" : undefined}
              />
              <Form.Text id="passwordHelp" muted>
                Åtkomst kräver administratörslösenord.
              </Form.Text>
            </Form.Group>

            {error && (
              <div id="authError" className="text-danger mt-2" role="alert">
                {error}
              </div>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button className="btn-cancel-outline" onClick={onCancel}>
              Avbryt
            </Button>

            <Button type="submit" disabled={!password || submitting}>
              {submitting ? "Kontrollerar…" : "Bekräfta"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </AuthContext.Provider>
  );
}
