class Tax {
    name: string;
    amount: number;
    currency: string;
    constructor(name : string, amount : number, currency : string) {
        this.name = name;
        this.amount = amount;
        this.currency = currency;
    }

    toString() : string {
        return `Tax(Name: ${this.name}, Amount: ${this.amount}, Currency: ${this.currency})`;
    }

    equals(other : Tax) : boolean {
        return this.name === other.name && this.amount === other.amount && this.currency === other.currency;
    }

    static isEquals(tax1 : Tax, tax2 : Tax) : boolean { 
        return tax1.name === tax2.name && tax1.amount === tax2.amount && tax1.currency === tax2.currency;
    }
}

export { Tax };