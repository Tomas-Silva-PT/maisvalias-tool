import { DateTime } from "luxon";
import { Transaction, TransactionType } from "../../../models/transaction";
import { Strike } from "../../../models/brokers/strike";
import { Fee } from "../../../models/fee";
import { Asset } from "../../../models/asset";
import { BrokerRecord, BrokerSection } from "../../../models/brokerRecord";
import { IStrikeParser } from "./strikeparser";
class StrikeParser2026_v1 implements IStrikeParser {
  canParse(sections: BrokerSection[]): boolean {
    console.log("Checking if file can be parsed with StrikeParser2026_v1...");
    if (!sections.length || !sections[0].rows.length) return false;

    // pega numa linha representativa
    const sample = Object.fromEntries(sections[0].rows.find(row => row[2][1] === "Purchase" || row[2][1] === "Sale") || []);
    console.log("Sample found: " + JSON.stringify(sample));
    if (!sample) return false;

    // valida headers base (estrutura do ficheiro)
    // Date;Ticker;Type;Quantity;Price per share;Total Amount;Currency;FX Rate
    const headers = Object.keys(sample);
    const hasRequiredHeaders = headers.includes("Date & Time (UTC)") &&
      headers.includes("Transaction Type") &&
      headers.includes("Amount EUR") &&
      headers.includes("Fee EUR") &&
      headers.includes("Amount BTC");

    console.log("Has required headers: " + hasRequiredHeaders);
    if (!hasRequiredHeaders) return false;

    // heuristica para a data
    // Jan 10 2026 10:04:08
    const hDate = /^\w{3} \d{2} \d{4} \d{2}:\d{2}:\d{2}$/;
    console.log("Has valid date format: " + hDate.test(sample["Date & Time (UTC)"]));
    if (!hDate.test(sample["Date & Time (UTC)"])) return false;

    //  heurística para o montante:
    // 5.00
    const hAmount = /^-?\d+\.\d+$/.test(sample["Amount EUR"]);
    //  reforço (opcional): vírgula decimal
    console.log("Has valid amount format: " + hAmount);
    if (!hAmount) return false;

    // heuristica para a quantidade:
    // 0.0480192
    const hQuantity = /^-?\d+\.\d+$/.test(sample["Amount BTC"]);
    console.log("Has valid quantity format: " + !(sample["Amount BTC"] && !hQuantity));
    if (sample["Amount BTC"] && !hQuantity) return false;

    return true;
  }

  parse(sections: BrokerSection[]): Transaction[] {
    const transactions: Transaction[] = [];

    const section = sections[0];
    const oRecords: BrokerRecord[] = section.rows.map((record) => Object.fromEntries(record));

    oRecords.forEach((record) => {
      // Empty row, ignore it
      if (!record["Date & Time (UTC)"]) return;

      const utcDate = DateTime.fromFormat(record["Date & Time (UTC)"], "LLL dd yyyy HH:mm:ss", { zone: "utc" });

      let type: TransactionType;
      if (record["Transaction Type"].toLowerCase().includes("purchase")) type = "Buy";
      else if (record["Transaction Type"].toLowerCase().includes("sale")) type = "Sell";
      else return;

      if (record["Description"] != "") return; // If it has a description, it's has either been cancelled or it was a target order, not a completed transaction.

      const ticker = "BTC"; // Strike only supports Bitcoin currently
      const isin = "BTC";
      const shares = Math.abs(parseFloat(record["Amount BTC"]));
      const amount = Math.abs(parseFloat(record["Amount EUR"]));
      const amountCurrency = "EUR";
      const assetCurrency = "EUR";

      const fees: Fee[] = [];
      console.log("Fee: ", parseFloat(record["Fee EUR"]));
      const fee = new Fee("Fee", parseFloat(record["Fee EUR"]), "EUR");
      fees.push(fee);


      const transaction: Transaction = {
        date: utcDate,
        type: type,
        asset: new Asset("Bitcoin", ticker, isin, assetCurrency),
        shares: shares,
        amount: amount,
        currency: amountCurrency,
        broker: new Strike(),
        taxes: undefined,
        fees: fees,
        exchangeRate: undefined // Assumes every transaction is in EUR, so no exchange rate needed
      };

      if (transaction.type) transactions.push(transaction);

    });

    return transactions;
  }
}

export { StrikeParser2026_v1 };