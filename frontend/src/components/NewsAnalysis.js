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

const mapping = {
  BIRLATYRE: " BIRLATYRE",
  BARAK: "BVCL",
  KOTAK: "KMB",
  DECCAN: "DECCANCE",
  ADITYABIRLA: "ABG",
  HERO: "HEROMOTOCO",
  GAIL: " GAIL",
  QUICKHEAL: "QUICKHEAL",
  AARTI: "AARTIIND",
  APOLO: "APO",
  MOTHERSON: "MSUMI",
  HAVELS: "HVEL",
  RELIANCE: "RELI",
  BAJAJ: "BAJFINANCE",
  INFOSYS: "INFY",
  WIPRO: "WIT",
  TCS: "TCS",
  YESBANK: "YESBANK",
  CIPLA: "CIPLA",
  HCL: "HCL",
  AMBUJA: "AMBUJACEM",
  "20MICRONS": "MU",
};
function NewsAnalysis() {
  const [type, setType] = useState("Candle");
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [state, setState] = useState({
    companies: [],
    companyCode: "",
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

  async function getCompanies() {
    const rawResponse = await fetch("http://localhost:3003/getAllCompanies");
    const res = await rawResponse.json();
    console.log(res);
    return res;
  }

  async function getScore(symbol) {
    try {
      setLoading(true);
      const rawResponse = await fetch(
        "http://localhost:5000/newAnalysis?symbol=" + symbol
      );
      const res = await rawResponse.json();
      setScore(res?.final_score);
      setLoading(false);
    } catch (err) {
      setScore(0);
      setLoading(false);
    }
  }

  useEffect(() => {
    getCompanies().then((response) => {
      setState((prev) => ({ ...prev, companies: response.companies }));
    });
  }, []);

  return (
    <div>
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
              <Typography align="left" variant="h5" style={{ fontWeight: 600 }}>
                New Analysis
              </Typography>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                }}
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
                    onClick={() => {
                      getScore(mapping[state?.companyCode]);
                    }}
                    variant="contained"
                    color="secondary"
                  >
                    Analyse
                  </Button>
                </div>
              </div>
              <br />
              <br />
              {state?.companyCode ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-evenly",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <Typography
                      align="left"
                      variant="h5"
                      style={{ fontWeight: 600, color: "#2697f8" }}
                    >
                      Polority Score
                    </Typography>
                  </div>
                  <div>{loading ? <CircularProgress /> : <>{score}</>}</div>
                </div>
              ) : (
                ""
              )}
            </div>
            <br />
            <br />

            <div
              style={{
                fontSize: "14px",
                display: "flex",
                alignItems: "flex-start",
                flexDirection: "column",
                justifyContent: "flex-start",
              }}
            >
              <div style={{ fontWeight: "600" }}>
                &nbsp;&nbsp;&nbsp;&nbsp;Note :{" "}
              </div>
              <div>
                1. Polarity Score basically provided by sentiment analysis from
                news.{" "}
              </div>
              <div>
                2. Polarity Score = 1; indicates strong positive sentiment
              </div>
              <div>3. Polarity Score = 0; indicates neutral sentiment</div>
              <div>
                4. Polarity Score = -1; indicates strong negative sentiment
              </div>{" "}
            </div>
          </Grid>
          <br />
          <br />
        </Container>
      </>
    </div>
  );
}

export default NewsAnalysis;
