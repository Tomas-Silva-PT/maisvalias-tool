import json

from src.models.brokers.broker import Broker
from src.models.country import Country

class Trading212(Broker):
    def __init__(self):
        super().__init__("Trading 212 Markets Ltd.", Country("CY"))
            
    def __str__(self) -> str:
        return super().__str__()
    
    def __repr__(self) -> str:
        return super().__repr__()
    
    def to_dict(self):
        return super().to_dict()
    
    def __eq__(self, other):
        return super().__eq__(other)
    
    def __hash__(self):
        return super().__hash__()
       
       
if __name__ == "__main__":
    broker = Trading212()
    print(broker)