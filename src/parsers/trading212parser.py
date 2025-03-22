from src.models.brokers.trading212 import Trading212
from src.parsers.parser import Parser
#from ..parsers.parser import Parser
from src.models.transaction import Transaction
#from ..models.transaction import Transaction
from src.models.tax import Tax
from src.models.fee import Fee


import csv

class Trading212Parser(Parser):
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
                asset_currency = row["Currency (Price / share)"]
                
                # Obter fees
                fees = []
                # Obter todas as colunas que contenham "fee" no nome
                fee_names = [key for key in row.keys() if "fee" in key.lower()]
                for fee_name in fee_names:
                    try:
                        fee_amount = float(row[fee_name])
                    except ValueError:
                        continue
                    fee_currency = row[f"Currency ({fee_name})"]
                    fees.append(Fee(fee_name, fee_amount, fee_currency))
                    
                # Obter taxes
                taxes = []
                # Obter todas as colunas que contenham "tax" no nome
                tax_names = [key for key in row.keys() if "tax" in key.lower()]
                for tax_name in tax_names:
                    try:
                        tax_amount = float(row[tax_name])
                    except ValueError:
                        continue
                    tax_currency = row[f"Currency ({tax_name})"]
                    taxes.append(Tax(tax_name, tax_amount, tax_currency))
                
                transaction = Transaction(date, time, type, ticker, isin, shares, asset_currency, amount, amount_currency, taxes, fees, Trading212())
                if(transaction.type != ""):
                    transactions.append(transaction)

        return transactions
    
    
    
