import React, { useState } from "react";
import "./Navbar.scss";
import { Link } from "react-router-dom";
import Logo from "../images/recipedb-hat-white.png";
import { Container } from "@mui/material";
import { FaBars, FaTimes } from "react-icons/fa";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="navigation">
        <Container maxWidth="lg">
          <div className="__wrapper">
            <div className="__logo">
              <p className="logoText">Stock.io</p>
            </div>
            <div className="nav">
              <ul className="__nav0">
               
                <Link to="/home" className="link">
                  <li>Top Companies</li>
                </Link>
                <Link to="/newsAnalysis" className="link">
                  <li>News Analysis</li>
                </Link>
                <li>
                  <Link to="/analysis?id=TCS" className="link">
                    Analysis
                  </Link>
                </li>
                <li>
                  <Link to="/portfolio" className="link">
                    Portfolio
                  </Link>
                </li>
                
              </ul>
            </div>
          </div>
        </Container>
      </div>

     
      
    </>
  );
}

export default Navbar;
