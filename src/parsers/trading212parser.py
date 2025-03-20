from src.parsers.parser import IParser
#from ..parsers.parser import IParser
from src.models.transaction import Transaction
#from ..models.transaction import Transaction
import csv

class Trading212Parser(IParser):
    def parse(self, data):
        transactions = []
        with open(data, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f, delimiter=",")#csv.reader(f, delimiter=';')
            
            for row in reader:
                if(row["Time"] == ""):
                    continue
                
                date, time = row["Time"].split(" ")
                type = row["Action"]
                if("buy" in type.lower()):
                    type = "Buy"
                elif("sell" in type.lower()):
                    type = "Sell"
                elif("dividend" in type.lower()):
                    type = "Dividend"
                else:
                    continue 
                    
                ticker = row["Ticker"]
                isin = row["ISIN"]
                shares = float(row["No. of shares"])
                amount = float(row["Total"])
                amount_currency = row["Currency (Total)"]
                try:
                    tax = float(row["Withholding tax"])
                except ValueError:
                    tax = 0
                tax_currency = row["Currency (Withholding tax)"]
                transaction = Transaction(date, time, type, ticker, isin, shares, amount, amount_currency, tax, tax_currency)
                if(transaction.type != ""):
                    transactions.append(transaction)

        return transactions
    
    
    
