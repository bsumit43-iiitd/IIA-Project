import React, { useState } from "react";
import "./MobileNavBar.scss";
function MobileNavBar() {
  const [toggleView, setToggleView] = useState(false);
  const toggleNavbar = (toggleView) => {
    setToggleView(!toggleView);
  };
  return (
    <div class="mobile-wrapper">
      <div class="mobile mobile-two">
        <div class="header" onClick={() => toggleNavbar(toggleView)}>
          <div class="menu-toggle">
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
          </div>
        </div>
        <div
          class="mobile-nav"
          style={{ display: toggleView ? "block" : "none" }}
        >
          <div style={{height:'100%', width:'100%'}}>
            <ul>
              <li>
                <a href="#">Home</a>
              </li>
              <li>
                <a href="#">About</a>
              </li>
              <li>
                <a href="#">Portfolio</a>
              </li>
              <li>
                <a href="#">Blog</a>
              </li>
              <li>
                <a href="#">Contact</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileNavBar;
