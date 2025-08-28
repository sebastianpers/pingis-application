import { useEffect, useState } from "react";
import CardComponent from "../shared/CardComponent";
import TableComponent from "../shared/TableComponent";
import {
  getAllActivePlayers,
  softDeletePlayer,
} from "../services/playerService";
import type { Player } from "../types/player";
import { Col, Container, Row, Spinner } from "react-bootstrap";
import BtnBackComponent from "./BtnBackComponent";
import { useNavigate } from "react-router-dom";
import DeleteConfirmModal from "../shared/modals.tsx/DeleteModal";
import { showError, showSuccess } from "../utils/toast";

type PlayerNames = {
  username: string;
  created_at: string;
};

type PlayerColumn = {
  header: string;
  accessor: keyof PlayerNames;
  format?: (value: any) => string;
};

const PlayersListComponent = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [showConfirm, setShowConfirm] = useState(false); // styr modal
  const [pendingPlayer, setPendingPlayer] = useState<Player | null>(null); // vilken spelare?
  const [isDeleting, setIsDeleting] = useState(false); // disable knappar under delete
  const navigate = useNavigate();

  const columnDefinition: PlayerColumn[] = [
    { header: "Användarnamn", accessor: "username" },
    {
      header: "Skapad",
      accessor: "created_at",
      format: (val) =>
        new Date(val).toLocaleDateString("sv-SE", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
    },
  ];

  useEffect(() => {
    setIsLoading(true);
    getAllPlayers();
  }, []);

  const getAllPlayers = async (): Promise<void> => {
    const { data, error } = await getAllActivePlayers();

    if (error) {
      setIsLoading(false);
      return;
    }

    setPlayers(data ?? []);
    setIsLoading(false);
  };

  const requestDelete = (playerId: string): void => {
    const player = players.find((p) => p.id === playerId) ?? null;

    setPendingPlayer(player);
    setShowConfirm(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!pendingPlayer) return;

    try {
      setIsDeleting(true);

      await softDeletePlayer(pendingPlayer.id);
      showSuccess("Spelaren är raderad");
      setPlayers((prev) => prev.filter((p) => p.id !== pendingPlayer.id));
    } catch (err) {
      console.error("ERROR: ", err);
      showError(`Något gick fel: \\n ${err}`);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
      setPendingPlayer(null);
    }
  };

  const cancelDelete = (): void => {
    setShowConfirm(false);
    setPendingPlayer(null);
  };

  const navigateToPlayer = (id: string): void => {
    navigate(`/players/${id}`);
  };

  return (
    <Container className="mt-3 d-flex align-items-center flex-column">
      <DeleteConfirmModal
        show={showConfirm}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        isBusy={isDeleting}
        message={
          pendingPlayer ? (
            <>
              Är du säker på att du vill ta bort{" "}
              <strong>{pendingPlayer.username}</strong>?
            </>
          ) : (
            "Är du säker på att du vill ta bort den här spelaren?"
          )
        }
      />

      <CardComponent>
        <h4 className="fw-bold text-center mb-3">Spelare</h4>

        {players.length > 10 && <BtnBackComponent />}

        {isLoading && (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" role="status" className="text-orange ">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}

        {!isLoading && (
          <TableComponent
            columns={columnDefinition}
            data={players}
            handleFunc={requestDelete}
            handleNavigation={navigateToPlayer}
            idKey="id"
          />
        )}

        <Row>
          <Col>
            <BtnBackComponent classes="text-center" />
          </Col>
        </Row>
      </CardComponent>
    </Container>
  );
};

export default PlayersListComponent;
