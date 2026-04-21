import { Fee } from "../../../models/fee.js";
import { Tax } from "../../../models/tax.js";
import { Transaction, TransactionType } from "../../../models/transaction.js";
import { Trading212 } from "../../../models/brokers/trading212.js";
import { DateTime } from "luxon";
import { Asset } from "../../../models/asset.js";
import { BrokerRecord, BrokerSection } from "../../../models/brokerRecord.js";
import { ITrading212Parser } from "./trading212parser.js";

class Trading212Parser2025_v1 implements ITrading212Parser {
  canParse(sections: BrokerSection[]): boolean {
    console.log("Checking if file can be parsed with Trading212Parser2025_v1...");
    if (!sections.length || !sections[0].rows.length) return false;

    // pega numa linha representativa
    const sample = Object.fromEntries(sections[0].rows.find(row => row[0][1] === "Market buy" || row[0][1] === "Market sell" || row[0][1].includes("Dividend")) || []);
    console.log("Sample found: " + JSON.stringify(sample));
    if(!sample) return false;

    // valida headers base (estrutura do ficheiro)
    const headers = Object.keys(sample);
    const hasRequiredHeaders = headers.includes("Time") &&
                               headers.includes("Ticker") && 
                               headers.includes("ISIN") && 
                               headers.includes("No. of shares") && 
                               headers.includes("Currency (Total)") && 
                               headers.includes("Exchange rate") && 
                               headers.includes("Total");

    console.log("Has required headers: " + hasRequiredHeaders);
    if (!hasRequiredHeaders) return false;

    // heuristica para a data
    // 2022-12-08 20:12:02
    const hDate = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    console.log("Has valid date format: " + hDate.test(sample["Time"]));
    if (!hDate.test(sample["Time"])) return false;

    //  heurística para o montante:
    // 12.08
    const hAmount = /^\d+\.\d+$/.test(sample["Total"]);
    console.log("Has valid amount format: " + hAmount);
    if(!hAmount) return false;

    // heuristica para a quantidade:
    // 0.0480192
    const hQuantity = /^\d+\.\d+$/.test(sample["Quantity"]);
    console.log("Has valid quantity format: " + !(sample["Quantity"] && !hQuantity));
    if (sample["Quantity"] && !hQuantity) return false;

    // heuristica taxa de câmbio:
    // 1.218
    const hExchangeRate = /^\d+\.\d+$/.test(sample["Exchange rate"]);
    console.log("Has valid exchange rate format: " + !(sample["Exchange rate"] && sample["Exchange rate"] !== "Not available" && !hExchangeRate));
    if (sample["Exchange rate"] && sample["Exchange rate"] !== "Not available" && !hExchangeRate) return false;

    return true;
  }

  parse(sections: BrokerSection[]): Transaction[] {
    const transactions: Transaction[] = [];

    const section = sections[0];
    const oRecords : BrokerRecord[] = section.rows.map((record) => Object.fromEntries(record));

    oRecords.forEach((record) => {
      if (!record["Time"]) return;

      const [date, time] = record["Time"].split(" ");
      const utcDate = DateTime.fromFormat(
        `${date} ${time}`,
        "yyyy-MM-dd HH:mm:ss", { zone: "utc" });

      let type : TransactionType;
      if (record["Action"].toLowerCase().includes("buy")) type = "Buy";
      else if (record["Action"].toLowerCase().includes("sell")) type = "Sell";
      else if (record["Action"].toLowerCase().includes("dividend")) type = "Dividend";
      else if (record["Action"].toLowerCase().includes("interest on cash")) type = "Interest";
      else return;

      const ticker = record["Ticker"];
      const isin = record["ISIN"];
      const shares = parseFloat(record["No. of shares"]);
      const amount = parseFloat(record["Total"]);
      const amountCurrency = record["Currency (Total)"].replaceAll('"', "");
      const assetCurrency = record["Currency (Price / share)"];

      const fees = Object.keys(record)
        .filter((key) => key.toLowerCase().includes("fee"))
        .map((feeName) => {
          const feeAmount = parseFloat(record[feeName]);
          if (isNaN(feeAmount) || feeAmount < Number.EPSILON) return;
          const feeCurrency = record[`Currency (${feeName})`].replaceAll(
            '"',
            ""
          );
          return new Fee(feeName, feeAmount, feeCurrency);
        })
        .filter((fee) => fee != undefined);

      const taxes = Object.keys(record)
        .filter((key) => key.toLowerCase().includes("tax"))
        .map((taxName) => {
          const taxAmount = parseFloat(record[taxName]);
          if (isNaN(taxAmount) || taxAmount < Number.EPSILON) return;
          const taxCurrency = record[`Currency (${taxName})`].replaceAll(
            '"',
            ""
          );
          return new Tax(taxName, taxAmount, taxCurrency);
        })
        .filter((tax) => tax != undefined);

      let exchangeRate = 1 / parseFloat(record["Exchange rate"]);

      const transaction: Transaction = {
        date: utcDate,
        type: type,
        asset: new Asset(ticker, isin, assetCurrency),
        shares: shares,
        amount: amount,
        currency: amountCurrency,
        broker: new Trading212(),
        taxes: taxes,
        fees: fees,
        exchangeRate: exchangeRate
      };
      if (transaction.type) transactions.push(transaction);
    });

    // console.log("Transactions: " + JSON.stringify(transactions));

    return transactions;
  }
}

export { Trading212Parser2025_v1 };
