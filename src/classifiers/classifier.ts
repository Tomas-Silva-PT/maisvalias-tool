import { TaxEvent } from "../models/transaction";
import { Classifications } from "./classifications/classification";
import { Rule } from "./rules/rule";

class Classifier {
    constructor(private rules: Rule[]) {}

    /**
     * Classify the given tax events into their respective categories.
     *
     * @param taxEvents The tax events to classify.
     * @returns A map where the keys are the category names and the values are arrays of tax events that belong to those categories.
     */
    classify(taxEvents: TaxEvent[]): Classifications {
        const result: Classifications = new Map();

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