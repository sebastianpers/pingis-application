import { Col, Container, Row } from "react-bootstrap";
import { useState } from "react";
import CardComponent from "../shared/CardComponent";
import BtnBackComponent from "../components/BtnBackComponent";
import { removeAll, resetAllPlayers } from "../services/playerService";
import DeleteConfirmModal from "../shared/modals.tsx/DeleteModal";
import { showError, showSuccess } from "../utils/toast";

const SettingsPage = () => {
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [removeData, setRemoveData] = useState<string>();

  const settingsInfo = {
    removeAllMatchesAndPlayers:
      "Är du säker på att du vill ta bort alla spelare och matcher?",
    resetAllPlayers:
      "Är du säker på att du vill nollställa alla spelares statistik och ta bort alla matcher?",
  };

  const requestDelete = () => {
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (removeData === "removeAll") {
      try {
        await removeAll();
        showSuccess("All data har tagits bort");
      } catch (error) {
        showError(`Något gick fel: \\n ${error}`);
      } finally {
        setShowConfirm(false);
      }
    } else if (removeData === "resetAll") {
      try {
        await resetAllPlayers();
        showSuccess("Alla spelare är nu nollställda");
      } catch (error) {
        showError(`Något gick fel: \\n ${error}`);
      } finally {
        setShowConfirm(false);
      }
    }
  };

  const cancelDelete = (): void => {
    setShowConfirm(false);
  };

  return (
    <Container className="d-flex flex-column align-items-center">
      <CardComponent classes="w-100 d-flex flex-column align-items-center">
        <h4 className="fw-bold text-center mb-5">Inställningar</h4>

        <DeleteConfirmModal
          show={showConfirm}
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
          title={
            removeData === "removeAll"
              ? "Ta bort all data"
              : "Nollställ spelare och matcher"
          }
          message={
            removeData === "removeAll"
              ? settingsInfo.removeAllMatchesAndPlayers
              : settingsInfo.resetAllPlayers
          }
        />

        <Row className="gy-5 gy-sm-2 flex-column">
          <Col className="text-center">
            <button
              className="btn btn-orange"
              onClick={() => {
                setRemoveData("removeAll");
                requestDelete();
              }}
            >
              Ta bort allt
            </button>
          </Col>

          <Col className="text-center mt-4">
            <button
              className="btn btn-orange"
              onClick={() => {
                setRemoveData("resetAll");
                requestDelete();
              }}
            >
              Nollställ spelare
            </button>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col>
            <BtnBackComponent />
          </Col>
        </Row>
      </CardComponent>
    </Container>
  );
};

export default SettingsPage;
