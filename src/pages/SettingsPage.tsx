import { Col, Container, Row } from "react-bootstrap";
import { useState } from "react";
import CardComponent from "../shared/CardComponent";
import BtnBackComponent from "../components/BtnBackComponent";
import { removeAll, resetAllPlayers } from "../services/playerService";

const SettingsPage = () => {
  const [settingsChanged, setSettingsChanged] = useState<boolean>(false);

  const settingsInfo = {
    removeAllMatchesAndPlayers: "Tar bort alla matcher och spelare permanent.",
    resetAllPlayers:
      "Nollställer alla spelares statistik och tar bort alla matcher permanent.",
  };

  const [showInfo, setShowInfo] = useState<string>(
    settingsInfo.removeAllMatchesAndPlayers
  );

  const handleSettingsClick = async (): Promise<void> => {
    if (showInfo === settingsInfo.removeAllMatchesAndPlayers) {
      const res = await removeAll();

      if (res) {
        setSettingsChanged(true);
      }
    } else {
      const res = await resetAllPlayers();
      if (res) {
        setSettingsChanged(true);
      }
    }

    // Reset success message
    setTimeout(() => {
      setSettingsChanged(false);
    }, 3000);
  };

  return (
    <Container className="d-flex flex-column align-items-center">
      <CardComponent classes="mt-5">
        <h4 className="fw-bold text-center mb-4">Inställningar</h4>

        <Row className="gy-5 gy-sm-2">
          <Col xs={{ order: 2 }} sm={{ span: 6, order: 1 }}>
            <Row className="flex-column">
              <Col className="text-center">
                <button
                  className="btn btn-orange"
                  onClick={() =>
                    setShowInfo(settingsInfo.removeAllMatchesAndPlayers)
                  }
                >
                  Ta bort allt
                </button>
              </Col>

              <Col className="text-center mt-3">
                <button
                  className="btn btn-orange"
                  onClick={() => setShowInfo(settingsInfo.resetAllPlayers)}
                >
                  Nollställ spelare
                </button>
              </Col>
            </Row>
          </Col>

          <Col xs={{ order: 1 }} sm={{ span: 6, order: 1 }} className="mb-sm-2">
            <div className="border border-2 p-3 border-secondary text-center">
              <span className="text-orange">{showInfo}</span>

              <div className="mt-3 text-center">
                <button
                  className={`btn ${
                    settingsChanged ? "bg-success" : "bg-danger"
                  }`}
                  onClick={handleSettingsClick}
                >
                  {settingsChanged ? "Datan borttagen!" : "Ta bort"}
                </button>
              </div>
            </div>
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
