from src import Statement, PTDividendsFormatter, Trading212Parser, Transaction, AssetBuffer
import pandas as pd
import time

if __name__ == "__main__":
    start_time = time.time()
    parser = Trading212Parser()
    files_path = ["./data/t212_2023.csv", "./data/t212_2024.csv", "./data/t212_2024.csv", "./data/t212_2022.csv"]
    statement = Statement([])
    for file in files_path:
        transactions = parser.parse(file)
        statement.add_transactions(transactions)
        
    statement.fetch_data(asset_buffer=AssetBuffer())
    parsing_time = time.time() - start_time
    
    format_start_time = time.time()
    formatter = PTDividendsFormatter()
    dividends = formatter.format(statement, "2023")
    formatting_time = time.time() - format_start_time
    
    df = pd.DataFrame(dividends)
    print(df)
    
    end_time = time.time()
    elapsed_time = end_time - start_time
    print(f"Parsing Time: {parsing_time} seconds")
    print(f"Formatting Time: {formatting_time} seconds")
    print(f"Total elapsed time: {elapsed_time} seconds")