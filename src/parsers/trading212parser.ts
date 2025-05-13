import { Fee } from "../models/fee.js";
import { Tax } from "../models/tax.js";
import { Transaction } from "../models/transaction.js";
import { Trading212 } from "../models/brokers/trading212.js";
import { Parser } from "./parser.js";
import { Statement } from "../models/statement.js";

class Trading212Parser implements Parser {
  parse(fileData: string): Transaction[] {
    const transactions: Transaction[] = [];
    const data = fileData;
    const rows = data.split("\n").map((row) => row.split(","));
    const headers = rows.shift();

    if (!headers) {
      throw new Error("Invalid file data: no headers found");
    }

    rows.forEach((row) => {
      const record = Object.fromEntries(headers.map((h, i) => [h, row[i]]));
      if (!record["Time"]) return;

      const [date, time] = record["Time"].split(" ");
      let type = record["Action"].toLowerCase();
      if (type.includes("buy")) type = "Buy";
      else if (type.includes("sell")) type = "Sell";
      else if (type.includes("dividend")) type = "Dividend";
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
          if (isNaN(feeAmount)) return;
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
          if (isNaN(taxAmount)) return;
          const taxCurrency = record[`Currency (${taxName})`].replaceAll(
            '"',
            ""
          );
          return new Tax(taxName, taxAmount, taxCurrency);
        })
        .filter((tax) => tax != undefined);

      const exchangeRate = parseFloat(record["Exchange rate"]);

      const transaction = new Transaction(
        date,
        time,
        type,
        ticker,
        isin,
        shares,
        assetCurrency,
        amount,
        amountCurrency,
        new Trading212(),
        taxes,
        fees,
        exchangeRate
      );
      if (transaction.type) transactions.push(transaction);
    });

    return transactions;
  }
}

export { Trading212Parser };
