from src import Trading212Parser, Transaction, Statement, PTDividendsFormatter, PTCapitalGainsFormatter, AssetBuffer

if __name__ == "__main__":
    parser = Trading212Parser()
    files_path = ["./data/t212_2023.csv", "./data/t212_2024.csv", "./data/t212_2024.csv"]
    statement = Statement([])
    for file in files_path:
        transactions = parser.parse(file)
        statement.add_transactions(transactions)
    
    statement.fetch_data(AssetBuffer())
    
    dividends_formatter = PTCapitalGainsFormatter()
    dividends_formatter.format(statement, "2024")
    
    