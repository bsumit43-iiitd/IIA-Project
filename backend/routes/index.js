var express = require("express");
const { catchErrors } = require("../utils/custom-helpers");

const Router = express.Router({ caseSensitive: true });

const Stock = require("../controller/stockController");
const stock = new Stock();

/* GET home page. */
Router.get("/", function (req, res, next) {
  res.send({
    hello: "eh",
  });
});

Router.get(
  "/portfolioAnalysis",
  catchErrors(async (req, res) => {
    let { page, pageSize } = req.query;
    const result = await stock.portfolioAnalysis(
      Number(page) || 0,
      Number(pageSize) || 20
    );
    const response = {
      success: "true",
      message: "Recipes fetched successfully.",
      companies: result,
    };
    res.status(200).send(response);
  })
);

Router.get(
  "/getAllCompanies",
  catchErrors(async (req, res) => {
    let { page, pageSize } = req.query;
    const result = await stock.getAllCompanies(
      Number(page) || 0,
      Number(pageSize) || 20
    );
    const response = {
      success: "true",
      message: "Recipes fetched successfully.",
      companies: result,
    };
    res.status(200).send(response);
  })
);

Router.get(
  "/getMinMaxDate",
  catchErrors(async (req, res) => {
    let { page, pageSize } = req.query;
    const result = await stock.getMinMaxDate(
      Number(page) || 0,
      Number(pageSize) || 20
    );
    const response = {
      success: "true",
      message: "Recipes fetched successfully.",
      data: result,
    };
    res.status(200).send(response);
  })
);

Router.get(
  "/getTopCompanies",
  catchErrors(async (req, res) => {
    let { page, pageSize, minDate, maxDate } = req.query;
    const result = await stock.getTopCompanies(
      minDate,
      maxDate,
      Number(page) || 0,
      Number(pageSize) || 20
    );
    const response = {
      success: "true",
      message: "Recipes fetched successfully.",
      data: result,
    };
    res.status(200).send(response);
  })
);

Router.get(
  "/getAllCompanyData/:stockName/:companyName",
  catchErrors(async (req, res) => {
    let { page, pageSize } = req.query;
    let { stockName, companyName } = req.params;
    const result = await stock.getAllCompanyData(
      stockName,
      companyName,
      Number(page) || 0,
      Number(pageSize) || 20
    );
    const response = {
      success: "true",
      message: "Recipes fetched successfully.",
      data: { "Time Series (Daily)": result },
    };
    res.status(200).send(response);
  })
);

module.exports = Router;
