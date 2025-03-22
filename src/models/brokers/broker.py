from src.models.country import Country


class Broker:
    def __init__(self, name : str, country: Country) -> None:
        self.name = name
        self.country = country
        
    def __str__(self) -> str:
        return f"Broker(Name: {self.name}, Country: {self.country})"
    
    def __repr__(self) -> str:
        return f"Broker(Name: {self.name}, Country: {self.country})"
    
    def to_dict(self):
        return {"name": self.name, "country": self.country}
    
    def __eq__(self, other):
        return self.name == other.name and self.country == other.country
    
    def __hash__(self):
        return hash((self.name, self.country))