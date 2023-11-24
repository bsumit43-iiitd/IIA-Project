import React from "react";
import "./App.css";
import "./Table.scss";

import { HashRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./components/home";
import Navbar from "./navbar/Navbar";
import Analysis from "./components/Analysis";
import NewsAnalysis from "./components/NewsAnalysis";
import Portfolio from "./components/Portfolio";


function App() {
  return (
    <div className="App">
      <HashRouter>
        <Navbar />
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/home" element={<Home />} />
          <Route exact path="/analysis" element={<Analysis />} />
          <Route exact path="/analysis/:id" element={<Analysis />} />
          <Route exact path="/newsAnalysis" element={<NewsAnalysis />} />
          <Route exact path="/portfolio" element={<Portfolio />} />
         

        </Routes>
      </HashRouter>
      
    </div>
  );
}

export default App;
