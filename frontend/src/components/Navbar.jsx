import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={styles.nav}>
      <h2>Smart City</h2>
      <div>
        <Link to="/" style={styles.link}>Citizen</Link>
        <Link to="/sector" style={styles.link}>Sector</Link>
        <Link to="/global" style={styles.link}>Global</Link>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px",
    background: "#1e3a8a",
    color: "white"
  },
  link: {
    margin: "0 10px",
    color: "white",
    textDecoration: "none"
  }
};

export default Navbar;