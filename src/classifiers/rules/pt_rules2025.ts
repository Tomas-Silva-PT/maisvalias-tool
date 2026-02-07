import { DividendTransaction, MatchedTransaction, TaxEvent } from "../../models/transaction";
import { PTDestinations } from "../destinations/pt_destinations";
import { Rule } from "./rule";

const PTIRSRules2025: Rule[] = [
    // Add rules here
    {
        destination: PTDestinations.ANEXO_J_QUADRO_8A, 
        condition: (e : TaxEvent ) => isDividendEvent(e) && isForeignDividend(e)
    },
    {
        destination: PTDestinations.ANEXO_J_QUADRO_92A,
        condition: (e : TaxEvent ) => isCapitalGainEvent(e) && isForeignCapitalGain(e)
    },
];

/**
 * Returns true if the tax event is a capital gain event and false otherwise.
 * @param event The tax event to check.
 * @returns True if the tax event is a capital gain event, false otherwise.
 */

function isCapitalGainEvent(event: TaxEvent): event is TaxEvent & MatchedTransaction {
    return "realizedValue" in event && "buy" in event && "sell" in event;
}

/**
 * Returns true if the tax event is a dividend event and false otherwise.
 * @param event The tax event to check.
 * @returns True if the tax event is a dividend event, false otherwise.
 */
function isDividendEvent(event: TaxEvent): event is TaxEvent & DividendTransaction {
    return "amount" in event;
}

/**
 * Returns true if the matched transaction is a foreign capital gain event
 * and false otherwise.
 * A foreign capital gain event is a capital gain event where the broker
 * that sold the asset is not based in Portugal.
 * @param event The matched transaction to check.
 * @returns True if the matched transaction is a foreign capital gain event, false otherwise.
 */
function isForeignCapitalGain(event: MatchedTransaction): boolean {
    return event.sell.broker.country.alpha2 !== "PT";
}

/**
 * Returns true if the dividend transaction is a foreign dividend event
 * and false otherwise.
 * A foreign dividend event is a dividend event where the broker
 * that distributed the dividend is not based in Portugal.
 * @param event The dividend transaction to check.
 * @returns True if the dividend transaction is a foreign dividend event, false otherwise.
 */
function isForeignDividend(event: DividendTransaction): boolean {
    return "transaction" in event && event.transaction.broker.country.alpha2 !== "PT";
}



export { PTIRSRules2025 };