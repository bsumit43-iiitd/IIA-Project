import React, { useState, useEffect } from "react";
import axios from "axios";
// import { Line } from "react-chartjs-2";
// import ApexCharts from "apexcharts";
import ReactApexChart from "react-apexcharts";
function Charts({ code,weeklyData }) {
 
  const [labels, setLabels] = useState([]);
  const [volumeLabels, setVolumeLabels] = useState([]);
  const [close, setClose] = useState([]);

  

  
  if (weeklyData["Time Series (Daily)"])
    Object.keys(weeklyData["Time Series (Daily)"]).forEach((element) => {
      labels.push([
        new Date(element).getTime(),

        weeklyData["Time Series (Daily)"][element]["1. open"],
        weeklyData["Time Series (Daily)"][element]["2. high"],
        weeklyData["Time Series (Daily)"][element]["3. low"],
        weeklyData["Time Series (Daily)"][element]["4. close"],
      ]);
      volumeLabels.push([
        new Date(element).getTime(),
        weeklyData["Time Series (Daily)"][element]["5. volume"],
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
      type: "candlestick",
      height: 350,
      id: "candles",
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
    title: {
      text: "Stock Price Movement",
      align: "left",
    },
    xaxis: {
      type: "datetime",
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
    },
  };
  const seriesLine = [
    {
      name: "volume",
      data: volumeLabels,
    },
  ];

  const optionsLine = {
    chart: {
      id: "chart1",
      height: 130,
      type: "bar",

      brush: {
        target: "candles",
        enabled: true,
      },

      selection: {
        enabled: true,
        xaxis: {
          min: new Date("19 Oct 2022").getTime(),
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
        type="candlestick"
        height={350}
      />
      <ReactApexChart
        options={optionsLine}
        series={seriesLine}
        type="bar"
        height={140}
      />
    </div>
  );
}

export default Charts;
