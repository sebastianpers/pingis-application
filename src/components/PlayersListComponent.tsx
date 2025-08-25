import { useEffect, useState } from "react";
import CardComponent from "../shared/CardComponent";
import TableComponent from "../shared/TableComponent";
import {
  getAllActivePlayers,
  softDeletePlayer,
} from "../services/playerService";
import type { Player } from "../types/player";
import { Container, Spinner } from "react-bootstrap";
import BtnBackComponent from "./BtnBackComponent";

type PlayerNames = {
  name: string;
  created_at: string;
};

type PlayerColumn = {
  header: string;
  accessor: keyof PlayerNames;
  format?: (value: any) => string;
};

const PlayersListComponent = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const columnDefinition: PlayerColumn[] = [
    { header: "Namn", accessor: "name" },
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

  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    setIsLoading(true);
    getAllPlayers();
  }, []);

  const getAllPlayers = async () => {
    const { data, error } = await getAllActivePlayers();

    if (error) {
      return;
    }

    setPlayers(data ?? []);
    setIsLoading(false);
  };

  const deletePlayer = async (playerId: string) => {
    await softDeletePlayer(playerId);

    setPlayers((prev) => prev?.filter((p) => p.id !== playerId) ?? prev);
  };

  return (
    <Container className="mt-3 d-flex align-items-center flex-column">
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
            handleFunc={deletePlayer}
            idKey="id"
          />
        )}

        <BtnBackComponent classes="mt-4" />
      </CardComponent>
    </Container>
  );
};

export default PlayersListComponent;
