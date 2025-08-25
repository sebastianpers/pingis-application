import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";
import logoUrl from "@/assets/softhouse-logo.png";

const NavbarComponent = () => {
  return (
    <Navbar className="bg-blue margin-to-bottom" variant="dark">
      <Navbar.Brand
        as={Link}
        to="/"
        className="w-100 text-center text-md-start"
      >
        <img
          alt="Softhouse logo"
          src={logoUrl}
          width="30"
          height="30"
          className="logo ms-md-5"
        />
      </Navbar.Brand>
    </Navbar>
  );
};

export default NavbarComponent;
