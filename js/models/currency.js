import yf from "yahoo-finance2";

class Currency {
    constructor() {
        this.buffer = [];
    }

    async convert(value, fromCurrency, toCurrency, exchangeRateDate) {
        const buffered = this.buffer.find(p => p[0] === fromCurrency && p[1] === toCurrency && p[2] === exchangeRateDate);
        if (buffered) {
            return value * buffered[3];
        }

        const ticker = `${fromCurrency}${toCurrency}=X`;
        
        try {
            // Get next day of exchangeRateDate
            let date = new Date(exchangeRateDate);
            date.setDate(date.getDate() + 1);
            let exchangeRateDateNextDay = date.toISOString().split('T')[0];
            let data = await yf.chart(ticker, { period1: exchangeRateDate, period2: exchangeRateDateNextDay });
            if (data.length === 0) throw new Error("No exchange rate data found");
            
            let exchangeRate = data['quotes'][0].close;
            this.buffer.push([fromCurrency, toCurrency, exchangeRateDate, exchangeRate]);
            return value * exchangeRate;
        } catch (error) {
            console.error(`Error fetching exchange rate for ${fromCurrency} to ${toCurrency} on ${exchangeRateDate}:`, error);
            return null;
        }
    }
}

let currency = new Currency();
let value = await currency.convert(100, 'USD', 'EUR', '2023-01-06');
console.log(value);


export { Currency };