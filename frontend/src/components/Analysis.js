import {
  Autocomplete,
  Button,
  CircularProgress,
  Container,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import DailyChart from "./Chart/DailyChart";
import DailyChartNSE from "./Chart/DailyChartNSE";
import CandleDailyChartNSE from "./Chart/CandleDailyChartNSE";
import CandleDailyChart from "./Chart/CandleDailyChart";
import { useSearchParams } from "react-router-dom";

function Analysis() {
  const [searchParams, setSearchParams] = useSearchParams();
  let id = searchParams.get("id");

  const [type, setType] = useState("Candle");
  const [state, setState] = useState({
    companies: [],
    companyCode: "TCS",
    companyData: {},
    companyPrice: {},
    prediction: null,
    nseData: {
      "Time Series (Daily)": {},
    },
    bseData: {
      "Time Series (Daily)": {},
    },
  });
  useEffect(() => {
    setState((prev) => ({ ...prev, companyCode: id?.toUpperCase() }));
  }, [id]);
  const [bseData, setBseData] = useState("");

  const [nseData, setNseData] = useState("");

  async function getCompanies() {
    const rawResponse = await fetch("http://localhost:3003/getAllCompanies");
    const res = await rawResponse.json();
    console.log(res);
    return res;
  }

  async function getNSECompanyData(code) {
    const rawResponse = await fetch(
      `http://localhost:3003/getAllCompanyData/NSE/${code?.toLowerCase()}`
    );
    const res = await rawResponse.json();
    console.log(res);
    return res;
  }

  async function getBSECompanyData(code) {
    const rawResponse = await fetch(
      `http://localhost:3003/getAllCompanyData/BSE/${code?.toLowerCase()}`
    );
    const res = await rawResponse.json();
    console.log(res);
    return res;
  }
  useEffect(() => {
    getCompanies().then((response) => {
      setState((prev) => ({ ...prev, companies: response.companies }));
    });
  }, []);

  useEffect(() => {
    if (id) {
      setBseData("");
      setNseData("");
      console.log("Hi");
      getNSECompanyData(state?.companyCode).then((response) => {
        setNseData(response?.data);
      });

      getBSECompanyData(state?.companyCode).then((response) => {
        console.log(response);
        setBseData(response?.data);
      });
    }
  }, [state?.companyCode, id]);
  return (
    <div>
      {id ? (
        <>
          <br />
          <Container maxWidth="md" style={{}}>
            <Grid
              container
              justify="space-between"
              alignItems="flex-start"
              style={{
                padding: "2em",
                boxShadow: "0.25em 0.5em 1em rgba(100,100,100,0.1)",
                backgroundColor: "white",
              }}
            >
              <div style={{ width: "100%" }}>
                <Typography
                  align="left"
                  variant="h4"
                  style={{ fontWeight: 600 }}
                >
                  {state.companyCode}
                </Typography>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>
                    <Autocomplete
                      options={state.companies}
                      getOptionLabel={(optn) => optn}
                      id="search"
                      debug
                      defaultValue={state?.companyCode}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Search Company"
                          margin="normal"
                        />
                      )}
                      onChange={(e, v, x) =>
                        setState((prev) => ({ ...prev, companyCode: v }))
                      }
                      style={{
                        width: "15em",
                      }}
                    />
                  </div>
                  <div>
                    <Button
                      style={{
                        margin: "10px",
                        padding: "10px 20px",
                        width: "100px",
                      }}
                      onClick={() => setType("Line")}
                      variant="contained"
                      color="secondary"
                    >
                      Line
                    </Button>
                    <Button
                      style={{
                        margin: "10px",
                        padding: "10px 20px",
                        width: "100px",
                      }}
                      onClick={() => setType("Candle")}
                      variant="contained"
                      color="secondary"
                    >
                      Candle
                    </Button>
                  </div>
                </div>
              </div>
              <div style={{ width: "100%" }}>
                <br />
                <br />
                <Typography variant="h5" gutterBottom>
                  For BSE Data
                </Typography>
                <br />
                {type === "Line" && bseData ? (
                  <DailyChart code={"TCS"} weeklyData={bseData} />
                ) : bseData ? (
                  <CandleDailyChart code={"TCS"} weeklyData={bseData} />
                ) : (
                  <CircularProgress />
                )}
                <br />
                <br />
                <Typography variant="h5" gutterBottom>
                  For NSE Data
                </Typography>
                <br />
                {type === "Line" && nseData ? (
                  <DailyChartNSE code={"TCS"} weeklyData={nseData} />
                ) : nseData ? (
                  <CandleDailyChartNSE code={"TCS"} weeklyData={nseData} />
                ) : (
                  <CircularProgress />
                )}
              </div>
            </Grid>
            <br />
            <br />
          </Container>
        </>
      ) : (
        <CircularProgress />
      )}
    </div>
  );
}

export default Analysis;
