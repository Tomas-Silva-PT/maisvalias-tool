import { Transaction, TransactionType } from "../models/transaction.js";
import { BrokerParser } from "./parser.js";
import { Fee } from "../models/fee.js";
import { Revolut } from "../models/brokers/revolut.js";
import { DateTime } from "luxon";
import { Asset } from "../models/asset.js";
import { BrokerRecord, BrokerRecordRow } from "../models/brokerRecord.js";

class RevolutParser implements BrokerParser {
  isins?: Record<string, string>[];
  loadIsins(fileData: string): void {
    this.isins = [];
    const lines = fileData.split("\n");
    let sellLines: string[] = [];
    let otherIncomeLines: string[] = [];
    let currentSet: number = 0;

    lines.forEach((line) => {
      if (line.includes("Income from Sells")) {
        currentSet = 0;
      } else if (line.includes("Other income & fees")) {
        currentSet = 1;
      }
      switch (currentSet) {
        case 0:
          sellLines.push(line);
          break;
        case 1:
          otherIncomeLines.push(line);
      }
    });

    // console.log("Sell lines: " + sellLines.length);
    // console.log("Other lines: " + otherIncomeLines.length);

    const sellRows = sellLines.map((line) => line.split(","));
    const otherIncomeRows = otherIncomeLines.map((line) => line.split(","));
    // console.log("Sell rows: " + sellRows);
    // console.log("Other rows: " + otherIncomeRows);

    sellRows.shift();
    otherIncomeRows.shift();
    const sellHeaders = sellRows.shift();
    const otherIncomeHeaders = otherIncomeRows.shift();
    // console.log("Sell headers: " + sellHeaders);
    // console.log("Other headers: " + otherIncomeHeaders);

    if (!sellHeaders || !otherIncomeHeaders) {
      throw new Error("Invalid file data: no headers found");
    }

    for (const row of sellRows) {
      const record = Object.fromEntries(sellHeaders.map((h, i) => [h, row[i]]));
      if (!record["Date acquired"]) continue;
      const ticker = record["Symbol"];
      const isin = record["ISIN"];
      this.isins?.push({ ticker, isin });
    }

    for (const row of otherIncomeRows) {
      const record = Object.fromEntries(
        otherIncomeHeaders.map((h, i) => [h, row[i]])
      );
      if (!record["Date"]) continue;
      const ticker = record["Symbol"];
      const isin = record["ISIN"];
      this.isins?.push({ ticker, isin });
    }

    this.isins = this.isins.filter(
      (item, index, self) =>
        index ===
        self.findIndex((t) => t.ticker === item.ticker && t.isin === item.isin)
    );

    // console.log("Isins: " + JSON.stringify(this.isins));

    if (!this.isins || this.isins.length === 0) {
      throw new Error("Invalid file data: no isins found");
    }

    // console.log("Isins loaded: " + JSON.stringify(this.isins));
  }

  parse(records: BrokerRecordRow[]): Transaction[] {
    if (!this.isins) {
      throw new Error("Isins not loaded");
    }
    const transactions: Transaction[] = [];

    const oRecords : BrokerRecord[] = records.map((record) => Object.fromEntries(record));

    oRecords.forEach((record) => {
      // console.log("Record: " + JSON.stringify(record));
      if (!record["Date"]) return;

      const oDate = new Date(record["Date"]);
      const date = oDate.toISOString().split("T")[0];
      const time = oDate.toLocaleTimeString("pt-PT", { hour12: false });

      const utcDate = DateTime.fromFormat(
        `${date} ${time}`,
        "yyyy-MM-dd HH:mm:ss", { zone: "utc" }
      )

      let type : TransactionType;
      // console.log("Type: " + type);
      if (record["Type"] == "BUY - MARKET") type = "Buy";
      else if (record["Type"] == "SELL - MARKET") type = "Sell";
      else if (record["Type"] == "DIVIDEND") type = "Dividend";
      else return;

      const ticker = record["Ticker"];
      const shares = parseFloat(record["Quantity"].replace(",", "."));
      const priceShare = parseFloat(record["Price per share"].replace(/[^\d,]/g, "").replace(",", "."));
      const totalAmount = parseFloat(record["Total Amount"].replace(/[^\d,]/g, "").replace(",", "."));
      const assetCurrency = record["Currency"];
      const amountCurrency = record["Currency"];
      // console.log("Currency: " + amountCurrency);
      let exchangeRate = 1 / parseFloat(record["FX Rate"].replace("\r", "").replace(",", ".")); // Porque a taxa de câmbio vem do EUR para a moeda do ativo, e nós queremos ao contrário
      if (isNaN(exchangeRate) || exchangeRate < Number.EPSILON) exchangeRate = 1;
      const feeAmount = Math.abs(Math.round((totalAmount - priceShare * shares) * 100) / 100);

      // if (ticker === "SPOT" || ticker === "NVDA") console.log(`[${ticker}] Fee Amount: ` + feeAmount);
      const fees: Fee[] = [];
      let amount = totalAmount;
      if (feeAmount >= 0.01) {
        // amount = totalAmount - feeAmount;
        const fee = new Fee("Fee", feeAmount, amountCurrency, exchangeRate);
        fees.push(fee);
      }

      const isin = this.isins?.find((i) => i.ticker === ticker)?.isin;
      if (isin) {

        const transaction: Transaction = {
                date: utcDate,
                type: type,
                asset: new Asset(ticker, isin, assetCurrency),
                shares: shares,
                amount: amount,
                currency: amountCurrency,
                broker: new Revolut(),
                taxes: undefined,
                fees: fees,
                exchangeRate: exchangeRate
            };
        // console.log("Transaction: " + JSON.stringify(transaction));
        if (transaction.type) transactions.push(transaction);
      }
      if (!isin && type !== "Buy") {
        throw new Error(
          "Invalid file data: no isin found for " +
          type +
          " of ticker " +
          ticker
        );
      }
    });

    // console.log("Transactions: " + JSON.stringify(transactions));

    return transactions;
  }
}

export { RevolutParser };
