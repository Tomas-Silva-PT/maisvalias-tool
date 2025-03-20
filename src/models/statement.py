from src.models.transaction import Transaction
from src.models.asset import AssetBuffer

class Statement:
    def __init__(self, transactions : list[Transaction] = []):
        self.transactions = transactions
        self.sort_transactions()
        
    def fetch_data(self, asset_buffer : AssetBuffer):
        for transaction in self.transactions:
            transaction.fetch_data(asset_buffer)
        
    def add_transaction(self, transaction : Transaction):
        self.transactions.append(transaction)
        self.transactions = list(set(self.transactions))
        self.sort_transactions()
    
    def add_transactions(self, transactions : list[Transaction]):
        for transaction in transactions:
            self.add_transaction(transaction)
    
    def sort_transactions(self, reverse : bool = False):
        self.transactions.sort(key=lambda transaction: (transaction.date, transaction.time), reverse=reverse)
    
    def get_transactions(self) -> list[Transaction]:
        return self.transactions