from src.models.statement import Statement
from datetime import datetime

class PTCapitalGainsFormatter:
    def __init__(self):
        pass
    
    def format(self, statement : Statement, year, currency = "EUR"):
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
            
            # Venda - Cálculo das despesas e encargos
            sell_fees = compensation["sell"].fees
            sell_fees_amount = 0
            for fee in sell_fees:
                if(fee.currency == currency):
                    sell_fees_amount += fee.amount
            
            sell_fees_amount = sell_fees_amount * compensation["shares"] / compensation["sell"].shares # Para considerar casos onde uma venda compensou múltiplas compras, daí estas despesas terem de ser relativas a esta compensação
            sell_gross_amount = compensation["sell"].net_amount - sell_fees_amount
            
            # Venda - Cálculo dos impostos
            sell_taxes = compensation["sell"].taxes
            sell_taxes_amount = 0
            for tax in sell_taxes:
                if(tax.currency == currency):
                    sell_taxes_amount += tax.amount
            
            sell_taxes_amount = sell_taxes_amount * compensation["shares"] / compensation["sell"].shares # Para explicação, ver README.md na parte das despesas e encargos
            sell_gross_amount -= sell_taxes_amount
            
            
            # Cálculo do valor de realização (valor de venda)
            sell_unit_value = sell_gross_amount / compensation["sell"].shares
            realized_value = sell_unit_value * compensation["shares"]
            
            
            # Compra - Cálculo das despesas e encargos
            buy_fees = compensation["buy"].fees
            buy_fees_amount = 0
            for fee in buy_fees:
                if(fee.currency == currency):
                    buy_fees_amount += fee.amount
                    
            buy_fees_amount = buy_fees_amount * compensation["shares"] / compensation["buy"].shares
            buy_gross_amount = compensation["buy"].net_amount + buy_fees_amount
            
            # Compra - Cálculo dos impostos
            buy_taxes = compensation["buy"].taxes
            buy_taxes_amount = 0
            for tax in buy_taxes:
                if(tax.currency == currency):
                    buy_taxes_amount += tax.amount
            
            buy_taxes_amount = buy_taxes_amount * compensation["shares"] / compensation["buy"].shares # Para explicação, ver README.md na parte das despesas e encargos
            buy_gross_amount += buy_taxes_amount
            
            # Cálculo do valor de aquisição (valor de compra)
            buy_unit_value = buy_gross_amount / compensation["buy"].shares
            acquired_value = buy_unit_value * compensation["shares"]
            
            if(compensation["buy"].asset.asset_type == "EQUITY"):
                code = "G01"
            elif(compensation["buy"].asset.asset_type == "ETF"):
                code = "G20"
                
            country_domiciled = compensation["buy"].asset.country_domiciled
            
            # Formatar a mais valia
            capital_gain = {
                "Ticker": compensation["sell"].asset.ticker,
                "País da fonte": f"{country_domiciled.code} - {country_domiciled.name_pt}",
                "Código": code,
                "Ano de Aquisição": buy_date.year,
                "Mês de Aquisição": buy_date.month,
                "Valor de Aquisição": acquired_value,
                "Ano de Realização": sell_date.year,
                "Mês de Realização": sell_date.month,
                "Valor de Realização": realized_value,
                "Despesas e Encargos": sell_fees_amount + buy_fees_amount,
                "Imposto retido no estrangeiro": sell_taxes_amount + buy_taxes_amount,
                "País da Contraparte": f"{compensation['sell'].broker.country.code} - {compensation['sell'].broker.country.name_pt}",
            }
            
            capital_gains.append(capital_gain)
            
        return capital_gains