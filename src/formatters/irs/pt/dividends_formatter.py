from src.models import Statement, Transaction

class PTDividendsFormatter:
    def __init__(self):
        pass
    
    def format(self, statement : Statement, year):
        # Obter transacoes referentes aos dividendos do ano a declarar
        transactions = statement.get_transactions()
        dividend_transactions = [transaction for transaction in transactions if transaction.type == "Dividend" and transaction.date[:4] == year]
        dividends = []
        dividends_by_asset = {}
        
        # Agrupar dividendos por ativo
        for dividend_transaction in dividend_transactions:
            if dividend_transaction.asset.isin not in dividends_by_asset:
                dividends_by_asset[dividend_transaction.asset.isin] = []
            dividends_by_asset[dividend_transaction.asset.isin].append(dividend_transaction)
        
        
        
        for _, dividend_transactions in dividends_by_asset.items():
            total_amount = sum([dividend_transaction.amount for dividend_transaction in dividend_transactions])
            dividend_transaction = dividend_transactions[0]
            country_domiciled = dividend_transaction.asset.country_domiciled
            
            dividend = {
                "Ticker": dividend_transaction.asset.ticker,
                "Código Rendimento": "E11 - Dividendos ou lucros - sem retenção em Portugal",
                "País da fonte": f"{country_domiciled['code']} - {country_domiciled['name_pt']}",
                "Rendimento Bruto": total_amount,
            }
            
            
            dividends.append(dividend)
        
        return dividends