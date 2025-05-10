import { AssetBuffer } from "./asset.js";
import { Transaction } from "./transaction.js";

class Statement {
    transactions: Transaction[];
    constructor(transactions = []) {
        this.transactions = transactions;
        this.sortTransactions();
    }

    async fetchData(assetBuffer : AssetBuffer) : Promise<void> {
        for (let transaction of this.transactions) {
            await transaction.fetchData(assetBuffer);
        }
    }

    addTransaction(transaction : Transaction) : void {
        if (!this.transactions.some(t => t.equals(transaction))) {
            this.transactions.push(transaction);
            this.sortTransactions();
        }
    }

    addTransactions(transactions : Transaction[]) : void {
        transactions.forEach(transaction => this.addTransaction(transaction));
    }

    sortTransactions(reverse : boolean = false) {
        this.transactions.sort((a, b) => {
            if (a.date !== b.date) return reverse ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
            return reverse ? b.time.localeCompare(a.time) : a.time.localeCompare(b.time);
        });
    }

    getTransactions() : Transaction[] {
        return this.transactions;
    }
}

export { Statement };