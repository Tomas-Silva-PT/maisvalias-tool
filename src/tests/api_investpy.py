import investpy.etfs as etfs
import investpy.stocks as stocks

etf = etfs.search_etfs("symbol", "APPL")
stock = stocks.search_stocks("symbol", "AAPL")
print(etf)
print(stock)