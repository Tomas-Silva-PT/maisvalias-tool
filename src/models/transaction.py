from src.models.asset import Asset, AssetBuffer

class Transaction:
    def __init__(self, date : str, time : str, type : str, ticker : str, isin : str, shares : float, amount : float, amount_currency : str, tax : float, tax_currency : str):
        self.date = date
        self.time = time
        self.type = type
        self.asset = Asset(ticker, isin)
        self.shares = shares
        self.amount = amount
        self.amount_currency = amount_currency
        self.tax = tax
        self.tax_currency = tax_currency
        
    def fetch_data(self, asset_buffer : AssetBuffer):
        self.asset.fetch_data(asset_buffer)

    def __str__(self):
        return f"Transaction(Date: {self.date}, Time: {self.time}, Ticker: {self.asset.ticker}, ISIN: {self.asset.isin}, Shares: {self.shares}, Amount: {self.amount})"
        
    def __repr__(self):
        return f"Transaction(Date: {self.date}, Time: {self.time}, Type: {self.type}, Asset: {self.asset}, Shares: {self.shares}, Amount: {self.amount}, Amount Currency: {self.amount_currency}, Tax: {self.tax}, Tax Currency: {self.tax_currency})"
    
    def to_dict(self):
        return {
            "date": self.date,
            "time": self.time,
            "type": self.type,
            "asset": self.asset,
            "shares": self.shares,
            "amount": self.amount,
            "amount_currency": self.amount_currency,
            "tax": self.tax,
            "tax_currency": self.tax_currency
        }
        
    def __eq__(self, other : 'Transaction'):
        return self.date == other.date and self.time == other.time and self.type == other.type and self.asset == other.asset and self.shares == other.shares and self.amount == other.amount and self.amount_currency == other.amount_currency and self.tax == other.tax and self.tax_currency == other.tax_currency
    
    def __hash__(self):
        return hash((self.date, self.time, self.type, self.asset.ticker, self.asset, self.shares, self.amount, self.amount_currency, self.tax, self.tax_currency))