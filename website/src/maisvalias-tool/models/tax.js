class Tax {
    constructor(name, amount, currency) {
        this.name = name;
        this.amount = amount;
        this.currency = currency;
    }

    toString() {
        return `Tax(Name: ${this.name}, Amount: ${this.amount}, Currency: ${this.currency})`;
    }

    toDict() {
        return { name: this.name, amount: this.amount, currency: this.currency };
    }

    equals(other) {
        return this.name === other.name && this.amount === other.amount && this.currency === other.currency;
    }

    static isEquals(tax1, tax2) {
        return tax1.name === tax2.name && tax1.amount === tax2.amount && tax1.currency === tax2.currency;
    }
}

export { Tax };