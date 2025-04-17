class Statement {
    constructor(transactions = []) {
        this.transactions = transactions;
        this.sortTransactions();
    }

    async fetchData(assetBuffer) {
        for (let transaction of this.transactions) {
            await transaction.fetchData(assetBuffer);
        }
    }

    addTransaction(transaction) {
        if (!this.transactions.some(t => t.equals(transaction))) {
            this.transactions.push(transaction);
            this.sortTransactions();
        }
    }

    addTransactions(transactions) {
        transactions.forEach(transaction => this.addTransaction(transaction));
    }

    sortTransactions(reverse = false) {
        this.transactions.sort((a, b) => {
            if (a.date !== b.date) return reverse ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
            return reverse ? b.time.localeCompare(a.time) : a.time.localeCompare(b.time);
        });
    }

    getTransactions() {
        return this.transactions;
    }
}

export { Statement };