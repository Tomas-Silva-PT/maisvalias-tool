import json
import yfinance as yf

class Asset:
    def __init__(self, ticker : str, isin : str):
        self.ticker = ticker
        self.isin = isin
        self.country_domiciled = {}
        self.asset_type = ''
    
    def fetch_data(self, asset_buffer : 'AssetBuffer'):
        if asset_buffer:
            buffered_asset = asset_buffer.get(self.isin)
            if buffered_asset is not None:
                #print("Found in buffer: " + buffered_asset.ticker)
                self.country_domiciled = buffered_asset.country_domiciled
                self.asset_type = buffered_asset.asset_type
                return
        
        # Obter país de domicilio
        with open('./data/codigos_paises.json', 'r', encoding='utf-8') as file:
            paises = json.load(file)
            self.country_domiciled = next((p for p in paises if p["alpha_2"] == self.isin[:2]), None)
        # Obter tipo de ativo
        self.asset_type = yf.Ticker(self.isin).info.get("quoteType", "")
        
        if asset_buffer:
            #print("Added to buffer: " + self.ticker)
            asset_buffer.add(self)

    def __str__(self):
        return f"Asset(Ticker: {self.ticker}, ISIN: {self.isin})"

    def __repr__(self):
        return f"Asset(Ticker: {self.ticker}, ISIN: {self.isin}, Country Domiciled: {self.country_domiciled}, Asset Type: {self.asset_type})"
    
    def __eq__(self, other):
        return self.isin == other.isin
    
    def __hash__(self):
        return hash((self.isin))
    
    def to_dict(self):
        return {
            "ticker": self.ticker,
            "isin": self.isin,
            "country_domiciled": self.country_domiciled,
            "asset_type": self.asset_type
        }
        
    def from_dict(self, data : dict):
        self.ticker = data["ticker"]
        self.isin = data["isin"]
        self.country_domiciled = data["country_domiciled"]
        self.asset_type = data["asset_type"]
        

class AssetBuffer:
    def __init__(self):
        self.assets = []
    
    def add(self, asset : Asset):
        self.assets.append(asset)
        
    def get(self, isin : str) -> Asset:
        return next((a for a in self.assets if a.isin == isin), None)