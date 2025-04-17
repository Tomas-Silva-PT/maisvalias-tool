class YahooFinance {
  static corsProblem = false;

  static async getExchangeRate(fromCurrency, toCurrency, date) {
    const ticker = `${fromCurrency}${toCurrency}=X`;
    let exchangeDate = new Date(date);
    let nextExchangeDate = new Date(date);
    nextExchangeDate.setDate(nextExchangeDate.getDate() + 1);

    let unixDate = Math.floor(exchangeDate.getTime() / 1000);
    let unixNextDate = Math.floor(nextExchangeDate.getTime() / 1000);
    let data;
    let url;
    try {
      if(this.corsProblem) { throw new Error("CORS problem"); }
      url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${unixDate}&period2=${unixNextDate}&interval=1d`;
      let response = await fetch(url);
      data = await response.json();
    } catch (error) {
      this.corsProblem = true;
      url =
        "https://api.allorigins.win/get?url=" +
        encodeURIComponent(
          "https://query1.finance.yahoo.com/v8/finance/chart/" +
            ticker +
            "?period1=" +
            unixDate +
            "&period2=" +
            unixNextDate +
            "&interval=1d"
        );
      data = await this._delayedFetch(url, 500, 10000);
    }

    // let response = await fetch(url);

    // let data = await response.json();
    // if (data.length === 0) throw new Error("No exchange rate data found");
    // console.log(data);

    let exchangeRate =
      data["chart"]["result"][0]["indicators"]["quote"][0].close;
    return exchangeRate;
  }

  static async search(query) {
    let data;
    let url;
    try {
      if(this.corsProblem) { throw new Error("CORS problem"); }
      console.log("Query: " + query);
      url = `https://query2.finance.yahoo.com/v1/finance/search?q=${query}`; //&lang=pt-BR&region=BR&corsDomain=finance.yahoo.com&callback=`;
      let response = await fetch(url);
      data = await response.json();
    } catch (error) {
      this.corsProblem = true;
      console.log("Query: " + query);
      url =
        "https://api.allorigins.win/get?url=" +
        encodeURIComponent(
          "https://query2.finance.yahoo.com/v1/finance/search?q=" + query
        );
      data = await this._delayedFetch(url, 500, 10000);
    }

    return data;
  }

  static async _delayedFetch(url, delay, fallbackDelay) {
    try {
      await new Promise((resolve) => setTimeout(resolve, delay));
      let response = await fetch(url);
      let data = await response.json();
      return data;
    } catch (error) {
      console.error("❌ Fetch failed:", error);
      console.warn("Retrying in 10 seconds...");
      await new Promise((resolve) => setTimeout(resolve, fallbackDelay));
      return await this._delayedFetch(query);
    }
  }

  static async getAssetType(isin) {
    let data = await this.search(isin);
    data = JSON.parse(data.contents);
    return data.quotes[0].quoteType;
  }
}

export { YahooFinance };
