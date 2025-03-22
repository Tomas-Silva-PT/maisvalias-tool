class Fee:
    def __init__(self, name: str, amount : float, currency : str):
        self.name = name
        self.amount = amount
        self.currency = currency
        
    def __str__(self):
        return f"Fee(Name: {self.name}, Fee: {self.amount}, Currency: {self.currency})"
    
    def __repr__(self):
        return f"Fee(Name: {self.name}, amount: {self.amount}, Currency: {self.currency})"
    
    def to_dict(self):
        return {"name": self.name, "amount": self.amount, "currency": self.currency}
    
    def __eq__(self, other):
        return self.name == other.name and self.amount == other.amount and self.currency == other.currency
    
    def __hash__(self):
        return hash((self.name, self.amount, self.currency))