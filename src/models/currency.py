import yfinance as yf

class Currency:
    def __init__(self) -> None:
        self.buffer = []
        
    def convert(self, value : float, from_currency : str, to_currency : str, exchange_rate_date : str) -> float:
        buffered = next((p for p in self.buffer if p[0] == from_currency and p[1] == to_currency and p[2] == exchange_rate_date), None)
        if buffered is not None:
            return value * buffered[3]
        src = from_currency
        dst = to_currency
        ticker = f'{src}{dst}=X'

        # Fetch the data
        data = yf.Ticker(ticker)

        # Get historical market data
        hist = data.history(start=exchange_rate_date)
        exchange_rate = hist.iloc[0]["Close"]
        self.buffer.append((src, dst, exchange_rate_date, exchange_rate))
        # print(f"Exchange rate for {src} to {dst} on {exchange_rate_date}: {exchange_rate}")
        return value * hist.iloc[0]["Close"]
    
    
if __name__ == "__main__":
    c = Currency()
    print(c.convert(100, 'USD', 'EUR', '2023-01-06'))