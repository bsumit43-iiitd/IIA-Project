import React, { useState, useEffect } from "react";
import { Button, Container, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";
import TopCompanies from "./TopCompanies";
import SplitButton from "./SplitButton";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DemoItem } from "@mui/x-date-pickers/internals/demo";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import PositiveGrowth from "./PositiveGrowth";

const today = dayjs();
const before = dayjs().subtract(1000, "day");

const getDateDifference = (date) => {
  let today = new Date();

  // Date you want to calculate the difference from (year, month (0-indexed), day)
  let givenDate = new Date(date); // November 30, 2023 (Note: Months are 0-indexed, so 10 represents November)

  // Calculate the difference in milliseconds between the dates
  let differenceInMillis = today - givenDate;

  // Convert milliseconds to days
  let differenceInDays = differenceInMillis / (1000 * 60 * 60 * 24);

  // Round to get whole days
  differenceInDays = Math.round(differenceInDays);
  return differenceInDays || 0;
};

function Home() {
  const [minDate, setMinDate] = useState(before);
  const [maxDate, setMaxDate] = useState(today);
  const [minDateValue, setMinDateValue] = useState(before);
  const [maxDateValue, setMaxDateValue] = useState(today);
  const [data, setData] = useState({
    ma: [],
    pt: [],
    nt: [],
  });

  async function getMinMaxDate() {
    const rawResponse = await fetch("http://localhost:3003/getMinMaxDate");
    const res = await rawResponse.json();
    setMaxDate(dayjs().subtract(getDateDifference(res?.data?.maxDate), "day"));
    setMinDate(dayjs().subtract(getDateDifference(res?.data?.minDate), "day"));
    setMaxDateValue(
      dayjs().subtract(getDateDifference(res?.data?.maxDate), "day")
    );
    setMinDateValue(
      dayjs().subtract(getDateDifference(res?.data?.minDate), "day")
    );
    return res;
  }

  async function getTopCompanies(minDate, maxDate) {
    const rawResponse = await fetch(
      `http://localhost:3003/getTopCompanies?minDate=${minDateValue}&maxDate=${maxDateValue}`
    );
    const res = await rawResponse.json();
    console.log(res);
    return res;
  }

  useEffect(() => {
    getMinMaxDate().then((response) => {
      console.log(response);
    });

    getTopCompanies(minDateValue, maxDateValue).then((response) => {
      console.log(response?.data?.movingAverage)
      console.log("response?.data?.movingAverage")
      setData({
        ma: response?.data?.movingAverage,
        pt: response?.data?.positiveGrowth,
        nt: response?.data?.negativeGrowth,
      });
      console.log("response", response);
      console.log("response");
    });
  }, []);

  return (
    <React.Fragment>
      <Container maxWidth="lg">
        <br />
        <div style={{ float: "right" }}> {/* <SplitButton /> */}</div>
        <br />
        <br />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DemoItem
            label="Enter the date range for analysis"
            component="DateRangePicker"
          >
            <DateRangePicker
              defaultValue={[minDate, maxDate]}
              value={[minDateValue, maxDateValue]}
              onChange={(newValue) => {
                setMinDateValue(newValue[0].$d);
                setMaxDateValue(newValue[1].$d);
              }}
              minDate={minDate}
              maxDate={maxDate}
            />
          </DemoItem>
        </LocalizationProvider>
        <div style={{ justifyContent: "flex-end", display: "flex" }}>
          <Button
            style={{
              margin: "10px",
              padding: "10px 20px",
              width: "100px",
            }}
            onClick={() => {
              setData({
                ma: [],
                pt: [],
                nt: [],
              });
              getTopCompanies(minDateValue, maxDateValue).then((response) => {
                setData({
                  ma: response?.data?.movingAverage,
                  pt: response?.data?.positiveGrowth,
                  nt: response?.data?.negativeGrowth,
                });
              });
            }}
            variant="contained"
            color="secondary"
          >
            Analyse
          </Button>
        </div>

        <br />
        <Typography variant="h5" gutterBottom>
          BSE and NSE difference
        </Typography>
        <TopCompanies data={data?.ma}/>
        <br />
        <br />
        <Typography variant="h5" gutterBottom>
          Top Gainers
        </Typography>
        <PositiveGrowth data={data?.pt}/>
        <br />
        <Typography variant="h5" gutterBottom>
          Top Losers
        </Typography>
        <PositiveGrowth data={data?.nt}/>
        <br />
        <br />
      </Container>
    </React.Fragment>
  );
}

export default Home;
