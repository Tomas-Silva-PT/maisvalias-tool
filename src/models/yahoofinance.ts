class YahooFinance {
    static corsProblem = false;
  
    static async getExchangeRate(fromCurrency : string, toCurrency : string, date : string) : Promise<number>{
      console.log("Getting exchange rate...");
      const ticker = `${fromCurrency}${toCurrency}=X`;
      // console.log("fromCurrency: " + fromCurrency + ", toCurrency: " + toCurrency + ", date: " + date);
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
              unixDate +
              "&interval=1d"
          );
        data = await this._delayedFetch(url, 500, 10000);
      }
      if (data.contents) data = JSON.parse(data.contents);
      let exchangeRate =
        data["chart"]["result"][0]["indicators"]["quote"][0]["close"][0];
      return parseFloat(exchangeRate);
    }
  
    static async search(query : string) : Promise<any> {
      let data;
      let url;
      console.log("Searching...");
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
  
    static async _delayedFetch(url : string, delay? : number, fallbackDelay? : number) : Promise<any> {
      try {
        await new Promise((resolve) => setTimeout(resolve, delay));
        let response = await fetch(url);
        let data = await response.json();
        return data;
      } catch (error) {
        console.error("❌ Fetch failed:", error);
        console.warn("Retrying in 10 seconds...");
        await new Promise((resolve) => setTimeout(resolve, fallbackDelay));
        return await this._delayedFetch(url);
      }
    }
  
    static async getAssetType(isin : string) : Promise<string> {
      console.log("Getting asset type...");
      let data = await this.search(isin);
      if (data.contents) data = JSON.parse(data.contents);
      return data.quotes[0].quoteType;
    }
  }
  
  export { YahooFinance };
  