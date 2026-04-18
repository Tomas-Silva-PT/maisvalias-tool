import { Fee } from "../../models/fee.js";
import { Tax } from "../../models/tax.js";
import { Transaction, TransactionType } from "../../models/transaction.js";
import { BrokerParser } from "../parser.js";
import { DateTime } from "luxon";
import { Asset } from "../../models/asset.js";
import { BrokerRecord, BrokerSection } from "../../models/brokerRecord.js";
import { InteractiveBrokers } from "../../models/brokers/ibkr.js";

class InteractiveBrokersParser implements BrokerParser {

  parse(records: BrokerSection[]): Transaction[] {
    const transactions: Transaction[] = [];

    // Obter a secção correspondente às transações
    const transactionsSection = records.find(section => section.rows[0][0][0] === "Trades");
    const parsedTransactions = this.parseTransactionsSection(transactionsSection!);
    transactions.push(...parsedTransactions);

    // Obter a secção correspondente a dividendos
    const dividendsSection = records.find(section => section.rows[0][0][0] === "Dividends");
    const parsedDividends = this.parseDividendsSection(dividendsSection!);
    transactions.push(...parsedDividends);

    // Obter a secção correspondente a juros
    const interestsSection = records.find(section => section.rows[0][0][0] === "Interest");
    const parsedInterests = this.parseInterestSection(interestsSection!);
    transactions.push(...parsedInterests);

    return transactions;
  }

  private parseTransactionsSection(section: BrokerSection): Transaction[] {
    const transactions: Transaction[] = [];
    // console.log("Parsing transactions section: ", JSON.stringify(section));

    const oRecords: BrokerRecord[] = section.rows.map((record) => Object.fromEntries(record));
    oRecords.forEach((record) => {
      if (record["Header"] !== "Data") return;

      const [date, time] = record["Date/Time"].split(", ");
      const utcDate = DateTime.fromFormat(
        `${date} ${time}`,
        "yyyy-MM-dd HH:mm:ss", { zone: "utc" });

      let type: TransactionType;
      if (Number(record["Quantity"]) > 0) type = "Buy";
      else if (Number(record["Quantity"]) < 0) type = "Sell";
      else return;



      const ticker = record["Symbol"];
      const shares = parseFloat(record["Quantity"]);
      const amount = parseFloat(record["T. Price"]);
      const amountCurrency = record["Currency"];
      const assetCurrency = record["Currency"];

      const fees: Fee[] = [];
      const fee = new Fee("Comm/Fee", Math.abs(parseFloat(record["Comm/Fee"])), amountCurrency, 1);
      fees.push(fee);
      let totalAmount;
      if (type === "Buy") totalAmount = Math.abs(Math.round((shares * amount + fee.amount) * 100) / 100);
      else totalAmount = Math.abs(Math.round((shares * amount + fee.amount) * 100) / 100);


      const transaction: Transaction = {
        date: utcDate,
        type: type,
        asset: new Asset(ticker, "", assetCurrency),
        shares: Math.abs(shares),
        amount: totalAmount,
        currency: amountCurrency,
        broker: new InteractiveBrokers(),
        taxes: [],
        fees: fees,
        exchangeRate: undefined
      };
      if (transaction.type) transactions.push(transaction);
    });


    return transactions;
  }

  private parseDividendsSection(section: BrokerSection): Transaction[] {
    const transactions: Transaction[] = [];
    // console.log("Parsing dividends section: ", JSON.stringify(section));

    const oRecords: BrokerRecord[] = section.rows.map((record) => Object.fromEntries(record));
    oRecords.forEach((record) => {
      if (record["Header"] !== "Data" || !record["Date"]) return;

      const date = record["Date"];
      const utcDate = DateTime.fromFormat(
        `${date}`,
        "yyyy-MM-dd", { zone: "utc" });

      let type: TransactionType;
      type = "Dividend";

      const ticker = record["Description"].split(" ")[0].replace("(", " ").replace(")", " ").split(" ")[0];
      const isin = record["Description"].split(" ")[0].replace("(", " ").replace(")", " ").split(" ")[1];
      const amount = parseFloat(record["Amount"]);
      const amountCurrency = record["Currency"];
      const assetCurrency = record["Currency"];

      const fees: Fee[] = [];


      const transaction: Transaction = {
        date: utcDate,
        type: type,
        asset: new Asset(ticker, isin || "", assetCurrency),
        shares: undefined,
        amount: Math.abs(amount),
        currency: amountCurrency,
        broker: new InteractiveBrokers(),
        taxes: [],
        fees: fees,
        exchangeRate: undefined
      };
      if (transaction.type) transactions.push(transaction);
    });


    return transactions;
  }

  private parseInterestSection(section: BrokerSection): Transaction[] {
    const transactions: Transaction[] = [];
    // console.log("Parsing interest section: ", JSON.stringify(section));

    const oRecords: BrokerRecord[] = section.rows.map((record) => Object.fromEntries(record));
    oRecords.forEach((record) => {
      if (record["Header"] !== "Data" || !record["Date"]) return;

      const date = record["Date"];
      const utcDate = DateTime.fromFormat(
        `${date}`,
        "yyyy-MM-dd", { zone: "utc" });

      let type: TransactionType;
      type = "Interest";

      const amount = parseFloat(record["Amount"]);
      const amountCurrency = record["Currency"];

      // const fees : Fee[] = [];
      // const fee = new Fee("Comm/Fee", parseFloat(record["Comm/Fee"]), amountCurrency, 1);
      // fees.push(fee);

      const transaction: Transaction = {
        date: utcDate,
        type: type,
        asset: undefined,
        shares: undefined,
        amount: Math.abs(amount),
        currency: amountCurrency,
        broker: new InteractiveBrokers(),
        taxes: [],
        fees: [],
        exchangeRate: undefined
      };
      if (transaction.type) transactions.push(transaction);
    });


    return transactions;
  }
}

export { InteractiveBrokersParser };
