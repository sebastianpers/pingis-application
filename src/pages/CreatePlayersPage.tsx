import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import CardComponent from "../shared/CardComponent";
import { createPlayers, getAllPlayers } from "../services/playerService";
import { useNavigate } from "react-router-dom";

import AddDynamicInputFields, {
  type PlayerInfo,
} from "../components/AddDynamicInputFields";
import type { Player } from "../types/player";
import { trimAllToLowerCase } from "../utils/trimAllToLowerCase";
import BtnBackComponent from "../components/BtnBackComponent";

type Errors = Record<string, string>;

const CreatePlayersPage: React.FC = () => {
  const navigate = useNavigate();

  const [players, setPlayers] = useState<PlayerInfo[]>([
    { firstName: "", lastName: "", username: "" },
  ]);

  const [existingPlayers, setExistingPlayers] = useState<Player[] | undefined>(
    undefined
  );
  const [hasChildErrors, setHasChildErrors] = useState(false); // dubbletter i listan (från child)
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await getAllPlayers();
      if (error) {
        console.error("ERROR fetching players:", error);
        setErrors((prev) => ({ ...prev, fetch: "Kunde inte hämta spelare." }));
        return;
      }
      setExistingPlayers(data ?? []);
    })();
  }, []);

  const hasEmptyUsernames = useMemo(
    () => players.some((p) => p.username.trim().length === 0),
    [players]
  );

  const collidesWithDb = useMemo(() => {
    if (!existingPlayers) return false;

    const existing = new Set(
      existingPlayers.map((ep) => trimAllToLowerCase(ep?.username ?? ""))
    );

    return players
      .map((p) => trimAllToLowerCase(p.username))
      .filter(Boolean)
      .some((u) => existing.has(u));
  }, [existingPlayers, players]);

  const canSubmit =
    !hasChildErrors && !collidesWithDb && !hasEmptyUsernames && !isSubmitting;

  const handlePlayersChange = (next: PlayerInfo[]) => {
    setPlayers(next);
    // Nollställ ev. tidigare submit-fel när användaren ändrar
    setErrors((prev) => ({ ...prev, submit: "", dbUnique: "" }));
  };

  const handleChildErrors = (hasErrors: boolean) => {
    setHasChildErrors(hasErrors);
  };

  const createNewPlayers = async () => {
    if (!canSubmit) {
      const msg = hasChildErrors
        ? "Dubblett av användarnamn i listan."
        : collidesWithDb
        ? "Användarnamn finns redan i databasen."
        : hasEmptyUsernames
        ? "Fyll i alla användarnamn."
        : "Formuläret är inte giltigt ännu.";
      setErrors((prev) => ({ ...prev, submit: msg }));
      return;
    }

    setIsSubmitting(true);
    try {
      await createPlayers(players);
      navigate("/");
    } catch (e: any) {
      const code = e?.code ?? e?.cause?.code ?? e?.error?.code;

      if (code === "23505") {
        setErrors((prev) => ({
          ...prev,
          dbUnique: "Användarnamnet finns redan.",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          submit: "Något gick fel vid skapande. Försök igen.",
        }));
      }
      console.error("createPlayers failed:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <CardComponent>
        <h4 className="text-center">skapa spelare</h4>

        <AddDynamicInputFields
          value={players}
          onChange={handlePlayersChange}
          childErrors={handleChildErrors}
        />

        <Row className="mt-2">
          <Col className="text-warning my-2 text-center">
            {errors.fetch && <div>{errors.fetch}</div>}
            {errors.dbUnique && <div>{errors.dbUnique}</div>}
            {errors.submit && <div>{errors.submit}</div>}
            {collidesWithDb && !errors.dbUnique && (
              <div>Användarnamn finns redan i databasen.</div>
            )}
            {hasEmptyUsernames && <div>Fyll i alla användarnamn.</div>}
            {hasChildErrors && <div>Dubblett av användarnamn i listan.</div>}
          </Col>
        </Row>

        <Row>
          <Col>
            <BtnBackComponent />
          </Col>

          <Col className="text-end">
            <button
              className="btn mt-3"
              type="button"
              onClick={createNewPlayers}
              disabled={!canSubmit}
              title={
                !canSubmit ? "Lös valideringsfel innan du skapar." : undefined
              }
            >
              {isSubmitting ? "Skapar..." : "Skapa"}
            </button>
          </Col>
        </Row>
      </CardComponent>
    </Container>
  );
};

export default CreatePlayersPage;
