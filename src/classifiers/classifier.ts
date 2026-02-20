import { TaxEvent } from "../models/taxevent";
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

        // If you want to ensure that all categories are present in the result, even if they have no matching events, you can initialize the map with empty arrays for each category:
        // for (const rule of this.rules) {
        //     result.set(rule.destination, []);
        // }

        for (const taxEvent of taxEvents) {
            for (const rule of this.rules) {
                if (rule.condition(taxEvent)) {
                    if (!result.has(rule.destination)) { // Initialize the category if it doesn't exist, which means only classifications with at least one tax event will be included in the result
                        result.set(rule.destination, []);
                    }
                    result.get(rule.destination)?.push(taxEvent);
                    break; // Assuming one transaction matches only one rule
                }
            }
        }

        return result;
    }
}

export { Classifier };