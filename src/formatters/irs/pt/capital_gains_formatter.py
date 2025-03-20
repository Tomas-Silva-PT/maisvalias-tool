from src.models.statement import Statement
from datetime import datetime

class PTCapitalGainsFormatter:
    def __init__(self):
        pass
    
    def format(self, statement : Statement, year):
        # Obter transacoes referentes às compras e vendas
        transactions = statement.get_transactions()
        buy_transactions = [transaction for transaction in transactions if transaction.type == "Buy"]
        sell_transactions = [transaction for transaction in transactions if transaction.type == "Sell"]            
        
        buy_transactions.sort(key=lambda transaction: (transaction.date, transaction.time))
        sell_transactions.sort(key=lambda transaction: (transaction.date, transaction.time))
            
        # FIFO
        
        # Fazer compensação das vendas com as compras
        compensations = []
        for sell_transaction in sell_transactions:
            sell_isin = sell_transaction.asset.isin
            

            sell_shares_remaining_for_compensation = sell_transaction.shares
            
            for buy_transaction in buy_transactions:
                if buy_transaction.asset.isin != sell_isin:
                    continue
                # Verificar se a compra ocorreu depois da venda, nesse caso, ignorar
                if buy_transaction.date > sell_transaction.date or (buy_transaction.date == sell_transaction.date and buy_transaction.time > sell_transaction.time):
                    continue
                
                # Calcular nº de ações da compra já compensada anteriormente
                buy_shares_compensated = sum([compensacao["shares"] for compensacao in compensations if compensacao["buy"] == buy_transaction])
                        
                # Calcular nº de ações da compra que faltam compensar
                shares_to_compensate = buy_transaction.shares - buy_shares_compensated
                if shares_to_compensate <= 0:
                    continue
                
                # Calcular nº de ações da venda que podem ser compensadas
                sell_shares_for_compensation = min(shares_to_compensate, sell_shares_remaining_for_compensation)
                sell_shares_remaining_for_compensation -= sell_shares_for_compensation
                
                compensations.append({
                    "buy": buy_transaction,
                    "sell": sell_transaction,
                    "shares": sell_shares_for_compensation
                })
                
                # Verificar se todas as ações da venda foram compensadas
                if sell_shares_remaining_for_compensation == 0:
                    break
        
        # print(compensations)
        
        # Formatar as compensações no formato das mais valias do IRS PT, referentes ao ano especificado
        capital_gains = []
        for compensation in compensations:
            sell_date = datetime.strptime(compensation["sell"].date, '%Y-%m-%d')
            buy_date = datetime.strptime(compensation["buy"].date, '%Y-%m-%d')
            # Verificar se a venda ocorreu no ano especificado
            if (sell_date.year != int(year)):
                continue
            
            # Cálculo do valor de realização (valor de venda)
            sell_unit_value = compensation["sell"].amount / compensation["sell"].shares
            compensated_shares = compensation["shares"]
            realized_value = sell_unit_value * compensated_shares
            
            # Cálculo do valor de aquisição (valor de compra)
            buy_value = compensation["buy"].amount
            buy_shares = compensation["buy"].shares
            acquired_value = buy_value / buy_shares * compensated_shares
            
            if(compensation["buy"].asset.asset_type == "EQUITY"):
                code = "G01"
            elif(compensation["buy"].asset.asset_type == "ETF"):
                code = "G20"
                
            country_domiciled = compensation["buy"].asset.country_domiciled
            
            # Formatar a mais valia
            capital_gain = {
                "Ticker": compensation["sell"].asset.ticker,
                "País da fonte": f"{country_domiciled['code']} - {country_domiciled['name_pt']}",
                "Código": code,
                "Ano de Aquisição": buy_date.year,
                "Mês de Aquisição": buy_date.month,
                "Valor de Aquisição": acquired_value,
                "Ano de Realização": sell_date.year,
                "Mês de Realização": sell_date.month,
                "Valor de Realização": realized_value
            }
            
            capital_gains.append(capital_gain)
            
        return capital_gains