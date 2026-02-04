import { TaxEvent } from "../models/transaction";
import { Classification } from "./classifications/classification";
import { Rule } from "./rules/rule";

class Classifier<D> {
    constructor(private rules: Rule<D>[]) {}

    classify(taxEvents: TaxEvent[]): Classification<D> {
        const result: Classification<D> = new Map();

        for (const rule of this.rules) {
            result.set(rule.destination, []);
        }

        for (const taxEvent of taxEvents) {
            for (const rule of this.rules) {
                if (rule.condition(taxEvent)) {
                    result.get(rule.destination)?.push(taxEvent);
                    break; // Assuming one transaction matches only one rule
                }
            }
        }

        return result;
    }
}

export { Classifier };