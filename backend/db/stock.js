const util = require("util");
const mongoClient = require("../utils/connectDb");

class StockDb {
  constructor(context) {
    this.context = context;
  }

  async get(item) {
    const client = await mongoClient.getDb();
    const collection = client.db("stockdata").collection("portfolio");
    const collection1 = client.db("stockdata").collection("finaldata");
    let res = [];
    const temp = await collection1
      .aggregate([
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: [
                    { $toDate: "$Date" }, // Convert string date to Date object
                    new Date(item?.order_execution_time), // Your specific date
                  ],
                },
                {
                  $eq: ["$CompanyName", item?.symbol], // Assuming item?.symbol holds CompanyName value
                },
                {
                  $in: ["$Stock", ["NSE", "BSE"]],
                },
              ],
            },
          },
        },
      ])
      .toArray();
    let bse = "";
    let nse = "";
    let profit = 0;
    if (temp?.length) {
      temp.forEach((i) => {
        if (i.Stock == "NSE") nse = i?.Close?.toFixed(2);
        if (i.Stock == "BSE") bse = i?.Close?.toFixed(2);
      });

      if (item?.trade_type == "buy" && item?.exchange == "NSE") {
        profit = (bse - nse) * item?.quantity;
      } else if (item?.trade_type == "buy" && item?.exchange == "BSE") {
        profit = (nse - bse) * item?.quantity;
      } else if (item?.trade_type == "sell" && item?.exchange == "NSE") {
        profit = (nse - bse) * item?.quantity;
      } else if (item?.trade_type == "sell" && item?.exchange == "BSE") {
        profit = (bse - nse) * item?.quantity;
      }

      res.push({ ...item, bse: bse, nse: nse, profit: profit.toFixed(2) });
    }
    return res;
  }

  async portfolioAnalysis(page, pageSize) {
    try {
      const client = await mongoClient.getDb();
      const collection = client.db("stockdata").collection("portfolio");
      const collection1 = client.db("stockdata").collection("finaldata");
      let res = [];
      const result = await collection
        .aggregate([
          {
            $project: {
              _id: 0,
              symbol: 1,
              order_execution_time: 1,
              exchange: 1,
              trade_type: 1,
              quantity: 1,
              trade_date: 1,
            },
          },
        ])
        .toArray();

      for (const item of result) {
        try {
          // Make asynchronous calls inside the loop
          const result = await this.get(item);
          if (result?.length) {
            res.push(result[0]);
          } // Replace asyncFunction with your async call
        } catch (error) {
          console.error(error); // Handle errors from asynchronous calls
        }
      }
      return res;
    } catch (err) {
      console.log(
        `Error while fetching dictionary mapping: \n${util.inspect(
          err,
          null,
          null
        )}`
      );
    }
  }

  async getTopCompanies(minDate, maxDate, page, pageSize) {
    try {
      const client = await mongoClient.getDb();
      const collection = client.db("stockdata").collection("finaldata");
      const positiveGrowth = await collection
        .aggregate([
          {
            $match: {
              Stock: { $in: ["NSE", "BSE"] },
            },
          },
          {
            $match: {
              Date: {
                $gte: new Date(minDate), // Start date
                $lte: new Date(maxDate), // End date
              },
            },
          },
          {
            $group: {
              _id: { CompanyName: "$CompanyName", Stock: "$Stock" },
              minDate: { $min: "$Date" },
              maxDate: { $max: "$Date" },
              minClose: { $min: "$Close" },
              maxClose: { $max: "$Close" },
            },
          },
          {
            $group: {
              _id: "$_id.CompanyName",
              nseMinClose: {
                $max: {
                  $cond: [{ $eq: ["$_id.Stock", "NSE"] }, "$minClose", null],
                },
              },
              nseMaxClose: {
                $max: {
                  $cond: [{ $eq: ["$_id.Stock", "NSE"] }, "$maxClose", null],
                },
              },
              bseMinClose: {
                $max: {
                  $cond: [{ $eq: ["$_id.Stock", "BSE"] }, "$minClose", null],
                },
              },
              bseMaxClose: {
                $max: {
                  $cond: [{ $eq: ["$_id.Stock", "BSE"] }, "$maxClose", null],
                },
              },
            },
          },
          {
            $match: {
              nseMinClose: { $ne: null },
              nseMaxClose: { $ne: null },
              bseMinClose: { $ne: null },
              bseMaxClose: { $ne: null },
            },
          },
          {
            $project: {
              _id: 0,
              company_name: "$_id",
              nseGrowth: {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          { $subtract: ["$nseMaxClose", "$nseMinClose"] },
                          "$nseMinClose",
                        ],
                      },
                      100,
                    ],
                  },
                  2,
                ],
              },
              bseGrowth: {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          { $subtract: ["$bseMaxClose", "$bseMinClose"] },
                          "$bseMinClose",
                        ],
                      },
                      100,
                    ],
                  },
                  2,
                ],
              },
            },
          },
          {
            $sort: { nseGrowth: -1, bseGrowth: -1 }, // Sort by growth in descending order
          },
          {
            $limit: 10, // Retrieve only the top 10 companies based on growth
          },
        ])
        .toArray();

      const negativeGrowth = await collection
        .aggregate([
          {
            $match: {
              Stock: { $in: ["NSE", "BSE"] },
            },
          },
          {
            $match: {
              Date: {
                $gte: new Date(minDate), // Start date
                $lte: new Date(maxDate), // End date
              },
            },
          },
          {
            $group: {
              _id: { CompanyName: "$CompanyName", Stock: "$Stock" },
              minDate: { $min: "$Date" },
              maxDate: { $max: "$Date" },
              minClose: { $min: "$Close" },
              maxClose: { $max: "$Close" },
            },
          },
          {
            $group: {
              _id: "$_id.CompanyName",
              nseMinClose: {
                $max: {
                  $cond: [{ $eq: ["$_id.Stock", "NSE"] }, "$minClose", null],
                },
              },
              nseMaxClose: {
                $max: {
                  $cond: [{ $eq: ["$_id.Stock", "NSE"] }, "$maxClose", null],
                },
              },
              bseMinClose: {
                $max: {
                  $cond: [{ $eq: ["$_id.Stock", "BSE"] }, "$minClose", null],
                },
              },
              bseMaxClose: {
                $max: {
                  $cond: [{ $eq: ["$_id.Stock", "BSE"] }, "$maxClose", null],
                },
              },
            },
          },
          {
            $match: {
              nseMinClose: { $ne: null },
              nseMaxClose: { $ne: null },
              bseMinClose: { $ne: null },
              bseMaxClose: { $ne: null },
            },
          },
          {
            $project: {
              _id: 0,
              company_name: "$_id",
              nseGrowth: {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          { $subtract: ["$nseMaxClose", "$nseMinClose"] },
                          "$nseMinClose",
                        ],
                      },
                      100,
                    ],
                  },
                  2,
                ],
              },
              bseGrowth: {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          { $subtract: ["$bseMaxClose", "$bseMinClose"] },
                          "$bseMinClose",
                        ],
                      },
                      100,
                    ],
                  },
                  2,
                ],
              },
            },
          },
          {
            $sort: { nseGrowth: 1, bseGrowth: 1 }, // Sort by growth in descending order
          },
          {
            $limit: 10, // Retrieve only the top 10 companies based on growth
          },
        ])
        .toArray();

      const topMovingAverageDifference = await collection
        .aggregate([
          {
            $match: {
              Date: {
                $gte: new Date(minDate), // Start date
                $lte: new Date(maxDate), // End date
              },
            },
          },
          {
            $group: {
              _id: "$CompanyName",
              avgCloseNSE: {
                $avg: { $cond: [{ $eq: ["$Stock", "NSE"] }, "$Close", null] },
              },
              avgCloseBSE: {
                $avg: { $cond: [{ $eq: ["$Stock", "BSE"] }, "$Close", null] },
              },
            },
          },
          {
            $project: {
              _id: 1,
              nse: { $round: ["$avgCloseNSE", 3] },
              bse: { $round: ["$avgCloseBSE", 3] },
              diffPercentage: {
                $cond: [
                  {
                    $and: [
                      { $ne: ["$avgCloseNSE", null] },
                      { $ne: ["$avgCloseBSE", null] },
                      { $ne: ["$avgCloseNSE", 0] }, // To avoid division by zero
                    ],
                  },
                  {
                    $round: [
                      {
                        $multiply: [
                          {
                            $divide: [
                              { $subtract: ["$avgCloseNSE", "$avgCloseBSE"] },
                              "$avgCloseNSE",
                            ],
                          },
                          100,
                        ],
                      },
                      3,
                    ],
                  },
                  null,
                ],
              },
            },
          },
          {
            $sort: { diffPercentage: -1 },
          },
          {
            $limit: 10,
          },
        ])
        .toArray();

      return {
        movingAverage: topMovingAverageDifference,
        positiveGrowth: positiveGrowth,
        negativeGrowth: negativeGrowth,
      };
    } catch (err) {
      console.log(
        `Error while fetching dictionary mapping: \n${util.inspect(
          err,
          null,
          null
        )}`
      );
    }
  }

  async getMinMaxDate(page, pageSize) {
    try {
      const client = await mongoClient.getDb();
      const collection = client.db("stockdata").collection("finaldata");
      const result = await collection
        .aggregate([
          {
            $group: {
              _id: null,
              minDate: { $min: "$Date" },
              maxDate: { $max: "$Date" },
            },
          },
          {
            $project: {
              _id: 0,
              minDate: {
                $dateToString: { format: "%Y-%m-%d", date: "$minDate" },
              },
              maxDate: {
                $dateToString: { format: "%Y-%m-%d", date: "$maxDate" },
              },
            },
          },
        ])
        .toArray();
      return result[0];
    } catch (err) {
      console.log(
        `Error while fetching dictionary mapping: \n${util.inspect(
          err,
          null,
          null
        )}`
      );
    }
  }

  async getAllCompanyData(stockName, companyName, page, pageSize) {
    try {
      const client = await mongoClient.getDb();
      const collection = client.db("stockdata").collection("finaldata");
      const result = await collection
        .aggregate([
          {
            $match: {
              Stock: stockName,
              CompanyName: companyName,
            },
          },
          {
            $project: {
              _id: 0,
              Open: 1,
              High: 1,
              Low: 1,
              Close: 1,
              Volume: 1,
              Date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$Date",
                },
              },
            },
          },
        ])
        .toArray();
      let res = {};
      result.forEach((element) => {
        res[element["Date"]] = {
          "1. open": element.Open.toFixed(2),
          "2. high": element.High.toFixed(2),
          "3. low": element.Low.toFixed(2),
          "4. close": element.Close.toFixed(2),
          "5. volume": element.Volume,
        };
      });
      return res;
    } catch (err) {
      console.log(
        `Error while fetching dictionary mapping: \n${util.inspect(
          err,
          null,
          null
        )}`
      );
    }
  }

  async getAllCompanies(page, pageSize) {
    try {
      const client = await mongoClient.getDb();
      const collection = client.db("stockdata").collection("finaldata");
      const result = await collection
        .aggregate([
          {
            $group: {
              _id: {
                stockExchange: "$StockExchange",
                normalizedCompany: {
                  $toLower: "$CompanyName",
                },
              },
            },
          },
          {
            $group: {
              _id: null,
              uniqueCompanies: {
                $addToSet: {
                  $toUpper: "$_id.normalizedCompany",
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              uniqueCompanies: 1,
            },
          },
        ])
        .toArray();

      return result[0].uniqueCompanies;
    } catch (err) {
      console.log(
        `Error while fetching dictionary mapping: \n${util.inspect(
          err,
          null,
          null
        )}`
      );
    }
  }
}

module.exports = StockDb;
