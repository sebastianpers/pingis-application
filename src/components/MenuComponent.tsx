import { Col, Container, ListGroup, Nav, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import CardComponent from "../shared/CardComponent";
import logoUrl from "@/assets/softhouse-logo.png";

const MenuComponent = () => {
  const menu = [
    { name: "Skapa match", url: "/create-match" },
    { name: "Statistik", url: "/statistics" },
    { name: "Spelade matcher", url: "/completed-matches" },
    { name: "Pågående matcher", url: "/active-matches" },
    { name: "Skapa spelare", url: "/create-players" },
    { name: "Spelare", url: "/players" },
    { name: "Inställningar", url: "/settings" },
  ];

  return (
    <Container fluid className="pt-3">
      <Row className="justify-content-center">
        <Col xs={12} md={4} className="p-0">
          <CardComponent classes="w-100 d-flex flex-column align-items-center">
            <div className="d-flex justify-content-center mt-2 mb-5 flex-column d-md-block d-none">
              <img
                alt="Softhouse logo"
                src={logoUrl}
                width="30"
                height="30"
                className="logo-menu"
              />
            </div>

            <ListGroup
              variant="flush"
              className="menu-wrapper d-flex flex-column gap-3 text-center text-uppercase fw-bold"
            >
              {menu.map((m) => (
                <ListGroup.Item
                  key={m.name}
                  as="li"
                  className="text-light menu-li"
                >
                  <Nav.Link as={Link} to={m.url}>
                    {m.name}
                  </Nav.Link>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </CardComponent>
        </Col>
      </Row>
    </Container>
  );
};

export default MenuComponent;
