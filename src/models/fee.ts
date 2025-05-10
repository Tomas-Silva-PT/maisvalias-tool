class Fee {
    name: string;
    amount: number;
    currency: string;
    exchangeRate? : number;
    constructor(name : string, amount : number, currency : string, exchangeRate? : number) {
        this.name = name;
        this.amount = amount;
        this.currency = currency;
        if(exchangeRate && !isNaN(exchangeRate)) this.exchangeRate = exchangeRate;
    }

    toString() {
        return `Fee(Name: ${this.name}, Amount: ${this.amount}, Currency: ${this.currency})`;
    }

    equals(other : Fee) : boolean {
        return this.name === other.name && this.amount === other.amount && this.currency === other.currency && this.exchangeRate === other.exchangeRate;
    }

    static isEquals(fee1 : Fee, fee2 : Fee) : boolean { // static isEquals(fee1, fee2) {
        return fee1.name === fee2.name && fee1.amount === fee2.amount && fee1.currency === fee2.currency && fee1.exchangeRate === fee2.exchangeRate;
    }
}

export { Fee };