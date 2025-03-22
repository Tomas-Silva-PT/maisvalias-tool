import json
import yfinance as yf

from src.models.country import Country

class Asset:
    def __init__(self, ticker : str, isin : str, currency : str):
        self.ticker = ticker
        self.isin = isin
        self.country_domiciled = ''
        self.asset_type = ''
        self.currency = currency
    
    def fetch_data(self, asset_buffer : 'AssetBuffer'):
        if asset_buffer:
            buffered_asset = asset_buffer.get(self.isin, self.ticker, self.currency)
            if buffered_asset is not None:
                #print("Found in buffer: " + buffered_asset.ticker)
                self.country_domiciled = buffered_asset.country_domiciled
                self.asset_type = buffered_asset.asset_type
                return
        
        # Obter país de domicilio
        self.country_domiciled = Country(self.isin[:2])#next((p for p in paises if p["alpha_2"] == self.isin[:2]), None)
        # Obter tipo de ativo
        self.asset_type = yf.Ticker(self.isin).info.get("quoteType", "")
        
        if asset_buffer:
            #print("Added to buffer: " + self.ticker)
            asset_buffer.add(self)

    def __str__(self):
        return f"Asset(Ticker: {self.ticker}, ISIN: {self.isin})"

    def __repr__(self):
        return f"Asset(Ticker: {self.ticker}, ISIN: {self.isin}, Country Domiciled: {self.country_domiciled}, Asset Type: {self.asset_type}, Currency: {self.currency})"
    
    def __eq__(self, other):
        return self.isin == other.isin and self.currency == other.currency and self.ticker == other.ticker
    
    def __hash__(self):
        return hash((self.ticker, self.isin, self.currency))
    
    def to_dict(self):
        return {
            "ticker": self.ticker,
            "isin": self.isin,
            "country_domiciled": self.country_domiciled,
            "asset_type": self.asset_type,
            "currency": self.currency
        }
        
    def from_dict(self, data : dict):
        self.ticker = data["ticker"]
        self.isin = data["isin"]
        self.country_domiciled = data["country_domiciled"]
        self.asset_type = data["asset_type"]
        self.currency = data["currency"]

class AssetBuffer:
    def __init__(self):
        self.assets = []
    
    def add(self, asset : Asset):
        self.assets.append(asset)
        
    def get(self, isin : str, ticker : str, currency : str) -> Asset:
        return next((a for a in self.assets if a.isin == isin and a.currency == currency and a.ticker == ticker), None)