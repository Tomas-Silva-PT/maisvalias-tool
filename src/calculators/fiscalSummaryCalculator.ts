import { FiscalSummary } from "../models/fiscalSummary";
import { DividendTransaction, RealizedTransaction } from "../models/transaction";

class FiscalSummaryCalculator {

    calculate(capitalGains: RealizedTransaction[], dividends: DividendTransaction[]): FiscalSummary {
        const summary: FiscalSummary = {
            currency: "EUR",
            dividends: 0,
            fees: 0,
            gains: 0,
            losses: 0,
            numTransactions: 0,
            taxes: 0
        }

        for (const capitalGain of capitalGains) {
            let balance = capitalGain.realizedValue - capitalGain.acquiredValue;
            balance < 0 ? summary.losses += Math.abs(balance) : summary.gains += Math.abs(balance);
            summary.fees += capitalGain.buyFees + capitalGain.sellFees;
            summary.taxes += capitalGain.buyTaxes + capitalGain.sellTaxes;
            summary.numTransactions++;
        }

        for (const dividend of dividends) {
            summary.dividends += dividend.amount;
            summary.fees += dividend.fees;
            summary.taxes += dividend.taxes;
            summary.numTransactions++;
        }

        summary.gains = Math.round(summary.gains * 100) / 100;
        summary.losses = Math.round(summary.losses * 100) / 100;
        summary.fees = Math.round(summary.fees * 100) / 100;
        summary.taxes = Math.round(summary.taxes * 100) / 100;
        summary.dividends = Math.round(summary.dividends * 100) / 100;

        return summary;
    }
}

export { FiscalSummaryCalculator };