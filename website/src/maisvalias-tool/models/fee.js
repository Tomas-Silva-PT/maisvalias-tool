class Fee {
    constructor(name, amount, currency) {
        this.name = name;
        this.amount = amount;
        this.currency = currency;
    }

    toString() {
        return `Fee(Name: ${this.name}, Amount: ${this.amount}, Currency: ${this.currency})`;
    }

    toDict() {
        return { name: this.name, amount: this.amount, currency: this.currency };
    }

    equals(other) {
        return this.name === other.name && this.amount === other.amount && this.currency === other.currency;
    }
}

export { Fee };