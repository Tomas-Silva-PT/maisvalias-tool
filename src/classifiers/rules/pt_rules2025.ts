import { CapitalGainEvent, TaxEvent } from "../../models/taxevent";
import { PTDestinations } from "../destinations/pt_destinations";
import { Rule } from "./rule";

// Note: the order of the rules matters, as they are applied sequentially.
const PTIRSRules2025: Rule[] = [
    // Add rules here
    {
        destination: PTDestinations.ANEXO_J_QUADRO_94A,
        condition: (e : TaxEvent ) => isCapitalGainEvent(e) && !isCapitalGainHoldForMoreThanOneYear(e) && isCrypto(e)
    },
    {
        destination: PTDestinations.ANEXO_G1_QUADRO_7,
        condition: (e : TaxEvent ) => isCapitalGainEvent(e) && isCapitalGainHoldForMoreThanOneYear(e) && isCrypto(e)
    },
    {
        destination: PTDestinations.ANEXO_J_QUADRO_8A, 
        condition: (e : TaxEvent ) => ( isDividendEvent(e) || isInterestEvent(e) ) && isForeignBroker(e)
    },
    {
        destination: PTDestinations.ANEXO_J_QUADRO_92A,
        condition: (e : TaxEvent ) => isCapitalGainEvent(e) && isForeignBroker(e)
    },
];

/**
 * Returns true if the tax event is a capital gain event and false otherwise.
 * @param event The tax event to check.
 * @returns True if the tax event is a capital gain event, false otherwise.
 */

function isCapitalGainEvent(event: TaxEvent) {
    return event.kind === "capitalGain";
}

/**
 * Returns true if the tax event is a dividend event and false otherwise.
 * @param event The tax event to check.
 * @returns True if the tax event is a dividend event, false otherwise.
 */
function isDividendEvent(event: TaxEvent) {
    return event.kind === "dividend";
}

/**
 * Returns true if the tax event is an interest event and false otherwise.
 * @param event The tax event to check.
 * @returns True if the tax event is an interest event, false otherwise.
 */
function isInterestEvent(event: TaxEvent) {
    return event.kind === "interest";
}

/**
 * Returns true if the tax event was executed by a foreign broker and false otherwise.
 * 
 * This function checks if the broker associated with the tax event is a foreign broker.
 * A foreign broker is defined as a broker whose country is not Portugal.
 * 
 * @param event The tax event to check.
 * @returns True if the tax event was executed by a foreign broker, false otherwise.
 */
function isForeignBroker(event: TaxEvent): boolean {
    switch (event.kind) {
        case "capitalGain":
            return event.sell.broker.country.alpha2 !== "PT";
        case "dividend":
        case "interest":
            return event.transaction.broker.country.alpha2 !== "PT";
    }

    return false;
}

/**
 * Returns true if the matched transaction is a capital gain event
 * where the asset was held for more than one year, and false otherwise.
 * @param event The matched transaction to check.
 * @returns True if the matched transaction is a capital gain event
 * where the asset was held for more than one year, false otherwise.
 */
function isCapitalGainHoldForMoreThanOneYear(event: CapitalGainEvent): boolean {
    const buyDate = event.buy.date;
    const sellDate = event.sell.date;

    const differenceInYears = sellDate.diff(buyDate, "days").days;

    return differenceInYears >= 365;
}

/**
 * Returns true if the matched transaction is a cryptocurrency
 * event, and false otherwise.
 * @param event The matched transaction to check.
 * @returns True if the matched transaction is a cryptocurrency
 * event, false otherwise.
 */
function isCrypto(event: TaxEvent): boolean {
    return event.kind == "capitalGain" && event.sell.asset!!.assetType === "CRYPTOCURRENCY";
}


export { PTIRSRules2025 };