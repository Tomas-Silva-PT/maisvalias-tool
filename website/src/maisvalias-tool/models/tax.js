class Tax {
    constructor(name, amount, currency, exchangeRate) {
        this.name = name;
        this.amount = amount;
        this.currency = currency;
        if (exchangeRate && !isNaN(exchangeRate))
            this.exchangeRate = exchangeRate;
    }
    toString() {
        return `Tax(Name: ${this.name}, Amount: ${this.amount}, Currency: ${this.currency})`;
    }
    equals(other) {
        return this.name === other.name && this.amount === other.amount && this.currency === other.currency && this.exchangeRate === other.exchangeRate;
    }
    static isEquals(tax1, tax2) {
        return tax1.name === tax2.name && tax1.amount === tax2.amount && tax1.currency === tax2.currency && tax1.exchangeRate === tax2.exchangeRate;
    }
}
export { Tax };
