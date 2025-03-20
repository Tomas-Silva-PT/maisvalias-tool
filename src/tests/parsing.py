from src import Trading212Parser, Transaction, Statement, AssetBuffer
import time

if __name__ == "__main__":
    start_time = time.time()
    parser = Trading212Parser()
    files_path = ["./data/t212_2023.csv", "./data/t212_2024.csv", "./data/t212_2024.csv"]
    statement = Statement([])
    for file in files_path:
        transactions = parser.parse(file)
        statement.add_transactions(transactions)
    
    print("Número transações: " + str(len(statement.get_transactions())))
    statement.fetch_data(AssetBuffer())
    
    for transaction in statement.get_transactions():
        print(transaction)
    
    end_time = time.time()
    elapsed_time = end_time - start_time
    print(f"Elapsed time: {elapsed_time} seconds")