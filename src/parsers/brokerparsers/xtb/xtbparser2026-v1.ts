import { Fee } from "../../../models/fee.js";
import { Tax } from "../../../models/tax.js";
import { Transaction, TransactionType } from "../../../models/transaction.js";
import { DateTime } from "luxon";
import { Asset, AssetType } from "../../../models/asset.js";
import { BrokerRecord, BrokerSection } from "../../../models/brokerRecord.js";
import { XTB } from "../../../models/brokers/xtb.js";
import { IXTBParser } from "./xtbparser.js";

class XTBParser2026_v1 implements IXTBParser {
  canParse(sections: BrokerSection[]): boolean {
    console.log("Checking if file can be parsed with XTBParser2026_v1...");
    console.log("Sections: " + JSON.stringify(sections));
    if (!sections.length || !sections[1].rows.length) return false;

    // pega numa linha representativa
    const sample = Object.fromEntries(sections[1].rows.find(row => row[3][1] === "BUY" || row[3][1] === "SELL" || row[3][1].includes("DIVIDEND")) || []);
    console.log("Sample found: " + JSON.stringify(sample));
    if (!sample) return false;

    // valida headers base (estrutura do ficheiro)
    const headers = Object.keys(sample);
    console.log("Headers found: " + headers.join(", "));
    const hasRequiredHeaders = headers.includes("Ticker") &&
      headers.includes("Type") &&
      headers.includes("Volume") &&
      headers.includes("Open Price") &&
      headers.includes("Close Price") &&
      headers.includes("Open Time (UTC)") &&
      headers.includes("Close Time (UTC)") &&
      headers.includes("Purchase Value") &&
      headers.includes("Sale Value") &&
      headers.includes("Commission") &&
      headers.includes("Open Conversion Rate") &&
      headers.includes("Close Conversion Rate");

    console.log("Has required headers: " + hasRequiredHeaders);
    if (!hasRequiredHeaders) return false;

    // heuristica para a data
    // 2022-12-08 20:12:02
    const hDate = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.?\d*\s*$/;
    console.log("Has valid date format: " + hDate.test(sample["Close Time (UTC)"]));
    if (!hDate.test(sample["Close Time (UTC)"])) return false;

    //  heurística para o montante:
    // 12,08
    const hAmount = /^\d+([.,]\d+)?$/.test(sample["Purchase Value"]);
    console.log("Has valid amount format: " + hAmount);
    if (!hAmount) return false;

    // heuristica para a quantidade:
    // 0,0480192
    const hQuantity = /^\d+([.,]\d+)?$/.test(sample["Volume"]);
    console.log("Volume: " + sample["Volume"]);
    console.log("Has valid quantity format: " + !(sample["Volume"] && !hQuantity));
    if (sample["Volume"] && !hQuantity) return false;

    // heuristica taxa de câmbio:
    // 1,218
    const hExchangeRate = /^\d+([.,]\d+)?$/.test(sample["Close Conversion Rate"]);
    console.log("Has valid exchange rate format: " + !(sample["Close Conversion Rate"] && sample["Close Conversion Rate"] !== "Not available" && !hExchangeRate));
    if (sample["Close Conversion Rate"] && sample["Close Conversion Rate"] !== "Not available" && !hExchangeRate) return false;

    return true;
  }

  parse(sections: BrokerSection[]): Transaction[] {
    const transactions: Transaction[] = [];

    const section = sections[1];
    const oRecords: BrokerRecord[] = section.rows.map((record) => Object.fromEntries(record));

    oRecords.forEach((record) => {
      console.log("Parsing record: " + JSON.stringify(record));

      if (!record["Close Time (UTC)"] || !record["Open Time (UTC)"]) return;

      const name = record["Instrument"] || "";
      const ticker = record["Ticker"];
      const isin = "";
      const amountCurrency = "EUR"; // Assume-se que a moeda é sempre EUR, porque a XTB não indica a moeda nas colunas de montante, e o montante está sempre em EUR
      const assetCurrency = "EUR";
      const shares = parseFloat(record["Volume"].replace(",", "."));
      const category = record["Category"];
      let assetType: AssetType;
      switch (category) {
        case "STOCK":
          assetType = "STOCK";
          break;
        case "ETF":
          assetType = "ETF";
          break;
        default:
          assetType = "";
      }


      switch (record["Type"].toLowerCase()) {
        case "buy":
          let [date, time] = record["Open Time (UTC)"].split(" ");
          let utcDate = DateTime.fromFormat(
            `${date} ${time}`,
            "yyyy-MM-dd HH:mm:ss", { zone: "utc" });

          let type: TransactionType = "Buy";
          let amount = parseFloat(record["Purchase Value"].replace(",", "."));
          console.log("Purchase Value: " + record["Purchase Value"]);
          console.log("Parsed amount: " + amount);

          const fees = [new Fee("Commission", parseFloat(record["Commission"].replace(",", ".")), "EUR")];
          const taxes: Tax[] = [];

          const buyTransaction: Transaction = {
            id: transactions.length + 1,
            date: utcDate,
            type: type,
            asset: new Asset(name, ticker, isin, assetCurrency, assetType),
            shares: shares,
            amount: amount,
            currency: amountCurrency,
            broker: new XTB(),
            taxes: taxes,
            fees: fees, // Como as comissões são fornecidas numa só coluna, colocamos o valor todo na compra, porque não há discriminação em que momento da operação as comissões foram cobradas
            exchangeRate: 1 // Como não é fornecido a moeda dos montantes, assume-se que estão todos em EUR, e portanto a taxa de câmbio é 1
          };
          if (buyTransaction.type) transactions.push(buyTransaction);
        // case "sell":
          [date, time] = record["Close Time (UTC)"].split(" ");
          utcDate = DateTime.fromFormat(
            `${date} ${time}`,
            "yyyy-MM-dd HH:mm:ss", { zone: "utc" });

          type = "Sell";
          amount = parseFloat(record["Sale Value"].replace(",", "."));
          console.log("Sale Value: " + record["Sale Value"]);
          console.log("Parsed amount: " + amount);

          const sellTransaction = {
            id: transactions.length + 1,
            date: utcDate,
            type: type,
            asset: new Asset(name, ticker, isin, assetCurrency, assetType),
            shares: shares,
            amount: amount,
            currency: amountCurrency,
            broker: new XTB(),
            taxes: [],
            fees: [],
            exchangeRate: 1,
            matches: [buyTransaction]
          };
          if (sellTransaction.type) transactions.push(sellTransaction);
        case "dividend":
          break;
        default:
          return;
      }

    });

    // console.log("Transactions: " + JSON.stringify(transactions));

    return transactions;
  }
}

export { XTBParser2026_v1 };
