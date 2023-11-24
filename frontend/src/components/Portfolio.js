import React, { useState, useEffect } from "react";
import PortTable from "./PortTable";
import { Button, Container, Typography } from "@mui/material";

function Portfolio() {
  const [data, setData] = useState([]);

  async function getPortfolio(minDate, maxDate) {
    const rawResponse = await fetch(
      `http://localhost:3003/portfolioAnalysis`
    );
    const res = await rawResponse.json();
    console.log(res);
    return res;
  }

  useEffect(() => {
    getPortfolio().then((response) => {
      setData(response?.companies);
    });
  }, []);

  return (
    <div>
      {" "}
      <br />
      <Typography variant="h5" gutterBottom>
        Portfolio Analysis
      </Typography>
      <PortTable data={data} />
      <br />
      <br />
    </div>
  );
}

export default Portfolio;
