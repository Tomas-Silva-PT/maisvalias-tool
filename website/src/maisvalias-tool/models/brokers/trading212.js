import { Country } from "../country.js";
class Trading212 {
    static isEquals(broker, broker1) {
        throw new Error("Method not implemented.");
    }
    constructor() {
        this.name = "Trading 212 Markets Ltd.";
        this.country = new Country("CY");
    }
    isEquals(broker1, broker2) {
        return broker1.name === broker2.name && broker1.country.equals(broker2.country);
    }
}
export { Trading212 };
