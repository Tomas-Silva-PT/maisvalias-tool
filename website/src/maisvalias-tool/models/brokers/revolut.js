import { Country } from "../country.js";
class Revolut {
    static isEquals(broker, broker1) {
        throw new Error("Method not implemented.");
    }
    constructor() {
        this.name = "Revolut";
        this.country = new Country("LT");
    }
    isEquals(broker1, broker2) {
        return broker1.name === broker2.name && broker1.country.equals(broker2.country);
    }
}
export { Revolut };
