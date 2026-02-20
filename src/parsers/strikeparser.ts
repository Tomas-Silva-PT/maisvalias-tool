import { DateTime } from "luxon";
import { Transaction, TransactionType } from "../models/transaction";
import { Parser } from "./parser";
import { Strike } from "../models/brokers/strike";
import { Fee } from "../models/fee";
import { Asset } from "../models/asset";

class StrikeParser implements Parser {
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
        // Empty row, ignore it
        if(!record["Date & Time (UTC)"]) return;

        const utcDate = DateTime.fromFormat(record["Date & Time (UTC)"], "LLL dd yyyy HH:mm:ss", { zone: "utc" });

        let type : TransactionType;
        if (record["Transaction Type"].toLowerCase().includes("purchase")) type = "Buy";
        else if (record["Transaction Type"].toLowerCase().includes("sale")) type = "Sell";
        else return;

        if(record["Description"] != "") return; // If it has a description, it's has either been cancelled or it was a target order, not a completed transaction.

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

        // const transaction = new Transaction(
        //   utcDate,
        //   type,
        //   ticker,
        //   isin,
        //   shares,
        //   assetCurrency,
        //   amount,
        //   amountCurrency,
        //   new Strike(),
        //   undefined,
        //   fees,
        //   undefined // Assumes every transaction is in EUR, so no exchange rate needed
        // );
        const transaction: Transaction = {
                date: utcDate,
                type: type,
                asset: new Asset(ticker, isin, assetCurrency),
                shares: shares,
                amount: amount,
                currency: amountCurrency,
                broker: new Strike(),
                taxes: undefined,
                fees: fees,
                exchangeRate: undefined // Assumes every transaction is in EUR, so no exchange rate needed
            };

        if(transaction.type) transactions.push(transaction);

    });

    return transactions;
  }
}

export { StrikeParser };