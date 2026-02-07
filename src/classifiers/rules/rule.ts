import { TaxEvent } from "../../models/transaction";
import { Destination } from "../destinations/destination";

type Rule = {
    destination : Destination;
    condition : (taxEvent: TaxEvent) => boolean;
}



export { Rule };