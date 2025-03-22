from src.models.asset import Asset, AssetBuffer
from src.models.brokers.broker import Broker
from src.models.tax import Tax
from src.models.fee import Fee

class Transaction:
    def __init__(self, date : str, time : str, type : str, ticker : str, isin : str, shares : float, asset_currency : str, net_amount : float, net_amount_currency : str, taxes : list[Tax], fees : list[Fee], broker : Broker):
        self.date = date
        self.time = time
        self.type = type
        self.asset = Asset(ticker, isin, asset_currency)
        self.shares = shares
        self.net_amount = net_amount
        self.net_amount_currency = net_amount_currency
        self.taxes = taxes
        self.fees = fees
        self.broker = broker
        
    def fetch_data(self, asset_buffer : AssetBuffer):
        self.asset.fetch_data(asset_buffer)

    def __str__(self):
        return f"Transaction(Date: {self.date}, Time: {self.time}, Ticker: {self.asset.ticker}, ISIN: {self.asset.isin}, Shares: {self.shares}, Net Amount: {self.net_amount})"
        
    def __repr__(self):
        return f"Transaction(Date: {self.date}, Time: {self.time}, Type: {self.type}, Asset: {self.asset}, Shares: {self.shares}, Net Amount: {self.net_amount}, Net Amount Currency: {self.net_amount_currency}, Taxes: {self.taxes}, Broker: {self.broker}, Fees: {self.fees})"
    
    def to_dict(self):
        return {
            "date": self.date,
            "time": self.time,
            "type": self.type,
            "asset": self.asset,
            "shares": self.shares,
            "amount": self.net_amount,
            "amount_currency": self.net_amount_currency,
            "taxes": self.taxes,
            "broker": self.broker,
            "fees": self.fees,
        }
        
    def __eq__(self, other : 'Transaction'):
        return self.date == other.date and self.time == other.time and self.type == other.type and self.asset == other.asset and self.shares == other.shares and self.net_amount == other.net_amount and self.net_amount_currency == other.net_amount_currency and self.taxes == other.taxes and self.broker == other.broker and self.fees == other.fees
    
    def __hash__(self):
        return hash((self.date, self.time, self.type, self.asset.ticker, self.asset, self.shares, self.net_amount, self.net_amount_currency, self.broker))