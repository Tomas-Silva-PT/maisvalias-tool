var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Statement {
    constructor(transactions = []) {
        this.transactions = transactions;
        this.sortTransactions();
    }
    fetchData(assetBuffer) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let transaction of this.transactions) {
                yield transaction.fetchData(assetBuffer);
            }
        });
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
            if (a.date !== b.date)
                return reverse ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
            return reverse ? b.time.localeCompare(a.time) : a.time.localeCompare(b.time);
        });
    }
    getTransactions() {
        return this.transactions;
    }
}
export { Statement };
