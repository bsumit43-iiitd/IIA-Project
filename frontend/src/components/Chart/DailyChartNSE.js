import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactApexChart from "react-apexcharts";

function Charts({ code, weeklyData }) {
  const [labels, setLabels] = useState([]);
  const [close, setClose] = useState([]);



  if (weeklyData["Time Series (Daily)"])
    Object.keys(weeklyData["Time Series (Daily)"]).forEach((element) => {
      labels.push([
        new Date(element).getTime(),
        weeklyData["Time Series (Daily)"][element]["4. close"],
      ]);
      close.push(weeklyData["Time Series (Daily)"][element]["4. close"]);
    });

  const series = [
    {
      data: labels,
      name: code,
    },
  ];
  const options = {
    chart: {
      id: "chart3",
      type: "line",
      height: 230,
      zoom: {
        type: "x",
        enabled: true,
        autoScaleYaxis: true,
      },
      toolbar: {
        autoSelected: "zoom",
      },

      //   toolbar: {
      //     autoSelected: "pan",
      //     show: false,
      //   },
    },

    colors: ["#303F9F"],
    stroke: {
      width: 2,
    },
    dataLabels: {
      enabled: false,
    },

    title: {
      text: "Stock Price Movement",
      align: "left",
    },
    markers: {
      size: 0,
    },

    xaxis: {
      type: "datetime",
      title: {
        text: "Date",
      },
    },
    yaxis: {
      title: {
        text: "Price",
      },
    },
  };
  const seriesLine = [
    {
      data: labels,
    },
  ];
  const optionsLine = {
    chart: {
      id: "chart4",
      height: 130,
      type: "area",
      brush: {
        target: "chart3",
        enabled: true,
      },
      selection: {
        enabled: true,
        xaxis: {
          min: new Date("19 Sept 2022").getTime(),
          max: new Date("24 Nov 2022").getTime(),
        },
      },
    },
    colors: ["#008FFB"],
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.91,
        opacityTo: 0.1,
      },
    },
    xaxis: {
      type: "datetime",
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      tickAmount: 2,
    },
  };
  return (
    <div>
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height={350}
      />

      <ReactApexChart
        options={optionsLine}
        series={seriesLine}
        type="area"
        height={140}
      />
    </div>
  );
}

export default Charts;
