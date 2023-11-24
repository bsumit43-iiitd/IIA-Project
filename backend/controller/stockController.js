const StockDb = require("../db/stock");
const nullImagesId = [];
class Stock {
  constructor() {
    this.stockDb = new StockDb();
  }
  async getAllCompanies(page, pageSize) {
    const result = await this.stockDb.getAllCompanies(page, pageSize);
    return result;
  }

  async getMinMaxDate(page, pageSize) {
    const result = await this.stockDb.getMinMaxDate(page, pageSize);
    return result;
  }
  async portfolioAnalysis(page, pageSize) {
    const result = await this.stockDb.portfolioAnalysis(page, pageSize);
    return result;
  }

  async getTopCompanies(minDate, maxDate, page, pageSize) {
    const result = await this.stockDb.getTopCompanies(
      minDate,
      maxDate,
      page,
      pageSize
    );
    return result;
  }

  async getAllCompanyData(stockName, companyName, page, pageSize) {
    const result = await this.stockDb.getAllCompanyData(
      stockName,
      companyName,
      page,
      pageSize
    );
    return result;
  }
}

module.exports = Stock;
