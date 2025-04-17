class YahooFinance {
  static async getExchangeRate(fromCurrency, toCurrency, date) {
    const ticker = `${fromCurrency}${toCurrency}=X`;
    let exchangeDate = new Date(date);
    let nextExchangeDate = new Date(date);
    nextExchangeDate.setDate(nextExchangeDate.getDate() + 1);

    let unixDate = Math.floor(exchangeDate.getTime() / 1000);
    let unixNextDate = Math.floor(nextExchangeDate.getTime() / 1000);

    let url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${unixDate}&period2=${unixNextDate}&interval=1d`;
    // let url = "https://api.allorigins.win/get?url=" + encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/'+ticker+'?period1='+unixDate+'&period2='+unixNextDate+'&interval=1d');
    let response = await fetch(url);

    let data = await response.json();
    if (data.length === 0) throw new Error("No exchange rate data found");
    // console.log(data);
    let exchangeRate = data["chart"]["result"][0]["indicators"]["quote"][0].close;
    return exchangeRate;
  }

  static async search(query) {
    let url = `https://query2.finance.yahoo.com/v1/finance/search?q=${query}`//&lang=pt-BR&region=BR&corsDomain=finance.yahoo.com&callback=`;
    // let url = "https://api.allorigins.win/get?url=" + encodeURIComponent('https://query2.finance.yahoo.com/v1/finance/search?q=' + query);
    let response = await fetch(url);
    let status = response.status;
    console.log("Status: " + status);
    let data = await response.json();

    if (data.lenght == 0) throw new Error("No data found on search query");

    return data;
  
  }

  static async getAssetType(isin) {
    let data = await this.search(isin);
    return data.quotes[0].quoteType;
  }
}

export { YahooFinance };