# import yfinance as yf

# # Example with the ticker symbol for SPDR S&P 500 ETF Trust
# etf_ticker = 'SPY'
# etf = yf.Ticker(etf_ticker)

# # Get the ETF's country information
# country = etf.info.get('country', 'Country information not available')

# print(f"The country of the ETF {etf_ticker} is: {country}")


# import yfinance as yf

# # Define the ticker symbol
# ticker_symbol = "AAPL"

# # Create a Ticker object
# ticker = yf.Ticker(ticker_symbol)

# # Fetch historical market data
# historical_data = ticker.history(period="1y")  # data for the last year
# print("Historical Data:")
# print(historical_data)

# # Fetch basic financials
# financials = ticker.financials
# print("\nFinancials:")
# print(financials)

# # Fetch stock actions like dividends and splits
# actions = ticker.actions
# print("\nStock Actions:")
# print(actions)


#################################### VERIFICAR SE É ETF ou STOCK ############################################

# import yfinance as yf

# def is_etf(ticker):
#     asset_type = yf.Ticker(ticker).info.get("quoteType", "")
#     print(asset_type)
#     return asset_type == "ETF"

# # Example usage
# print(is_etf("IE00BL0BMZ89"))   # True (ETF)
# print(is_etf("BTC-USD"))  # False (Stock)


#################################### OBTER CURRENCY EXCHANGE RATE ############################################

import yfinance as yf

# Define the ticker symbol for EUR/USD
src = 'EUR'
dst = 'USD'
ticker = f'{src}{dst}=X'

# Fetch the data
data = yf.Ticker(ticker)

# Get historical market data
hist = data.history(start="2023-01-06")

# Print the latest exchange rate
print(hist)
print(len(hist))