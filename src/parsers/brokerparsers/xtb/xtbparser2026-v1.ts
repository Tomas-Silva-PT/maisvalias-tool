import { Fee } from "../../../models/fee.js";
import { Tax } from "../../../models/tax.js";
import { Transaction, TransactionType } from "../../../models/transaction.js";
import { DateTime } from "luxon";
import { Asset, AssetType } from "../../../models/asset.js";
import { BrokerRecord, BrokerSection } from "../../../models/brokerRecord.js";
import { XTB } from "../../../models/brokers/xtb.js";
import { IXTBParser } from "./xtbparser.js";
import { Country } from "../../../models/country.js";

class XTBParser2026_v1 implements IXTBParser {
  canParse(sections: BrokerSection[]): boolean {
    console.log("Checking if file can be parsed with XTBParser2026_v1...");
    console.log("Sections: " + JSON.stringify(sections));
    if (!sections.length || !sections[1].rows.length) return false;

    return this.canParseCapitalGains(sections) || this.canParseCashOperations(sections);
  }

  canParseCashOperations(sections: BrokerSection[]): boolean {
    console.log("Checking if file can be parsed for cash operations with XTBParser2026_v1...");
    // pega numa linha representativa
    const cashOperationSample = Object.fromEntries(sections[3].rows.find(row => row[0][1] === "Dividend" || row[0][1] === "Free funds interest") || []);
    console.log("Sample found: " + JSON.stringify(cashOperationSample));
    if (!cashOperationSample) return false;

    // valida headers base (estrutura do ficheiro)
    const headers = Object.keys(cashOperationSample);
    console.log("Headers found: " + headers.join(", "));
    const hasRequiredHeaders = headers.includes("Ticker") &&
      headers.includes("Type") &&
      headers.includes("Ticker") &&
      headers.includes("Time") &&
      headers.includes("Amount");

    console.log("Has required headers: " + hasRequiredHeaders);
    if (!hasRequiredHeaders) return false;

    // heuristica para a data
    // 2022-12-08 20:12:02
    const hDate = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.?\d*\s*$/;
    console.log("Has valid date format: " + hDate.test(cashOperationSample["Time"]));
    if (!hDate.test(cashOperationSample["Time"])) return false;

    //  heurística para o montante:
    // 12,08
    const hAmount = /^\d+([.,]\d+)?$/.test(cashOperationSample["Amount"]);
    console.log("Has valid amount format: " + hAmount);
    if (!hAmount) return false;

    return true;
  }

  canParseCapitalGains(sections: BrokerSection[]): boolean {
    console.log("Checking if file can be parsed for capital gains with XTBParser2026_v1...");
    // pega numa linha representativa
    const capitalGainSample = Object.fromEntries(sections[1].rows.find(row => row[3][1] === "BUY") || []);
    console.log("Sample found: " + JSON.stringify(capitalGainSample));
    if (!capitalGainSample) return false;

    // valida headers base (estrutura do ficheiro)
    const headers = Object.keys(capitalGainSample);
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
    console.log("Has valid date format: " + hDate.test(capitalGainSample["Close Time (UTC)"]));
    if (!hDate.test(capitalGainSample["Close Time (UTC)"])) return false;

    //  heurística para o montante:
    // 12,08
    const hAmount = /^\d+([.,]\d+)?$/.test(capitalGainSample["Purchase Value"]);
    console.log("Has valid amount format: " + hAmount);
    if (!hAmount) return false;

    // heuristica para a quantidade:
    // 0,0480192
    const hQuantity = /^\d+([.,]\d+)?$/.test(capitalGainSample["Volume"]);
    console.log("Volume: " + capitalGainSample["Volume"]);
    console.log("Has valid quantity format: " + !(capitalGainSample["Volume"] && !hQuantity));
    if (capitalGainSample["Volume"] && !hQuantity) return false;

    // heuristica taxa de câmbio:
    // 1,218
    const hExchangeRate = /^\d+([.,]\d+)?$/.test(capitalGainSample["Close Conversion Rate"]);
    console.log("Has valid exchange rate format: " + !(capitalGainSample["Close Conversion Rate"] && capitalGainSample["Close Conversion Rate"] !== "Not available" && !hExchangeRate));
    if (capitalGainSample["Close Conversion Rate"] && capitalGainSample["Close Conversion Rate"] !== "Not available" && !hExchangeRate) return false;

    return true;
  }

  parse(sections: BrokerSection[]): Transaction[] {
    const transactions: Transaction[] = [];

    if (this.canParseCapitalGains(sections)) {
      transactions.push(...this.parseCapitalGains(sections));
    }

    if (this.canParseCashOperations(sections)) {
      transactions.push(...this.parseCashOperations(sections));
    }

    // console.log("Transactions: " + JSON.stringify(transactions));

    return transactions;
  }

  parseCashOperations(sections: BrokerSection[]): Transaction[] {
    const transactions: Transaction[] = [];

    const section = sections[3];
    const oRecords: BrokerRecord[] = section.rows.map((record) => Object.fromEntries(record));

    oRecords.forEach((record, index) => {
      console.log("Parsing record: " + JSON.stringify(record));

      if (!record["Time"]) return;
      if (record["Type"] !== "Dividend" && record["Type"] !== "Free funds interest") return;

      const name = record["Instrument"] || "";
      const ticker = record["Ticker"];
      const isin = "";
      const amountCurrency = "EUR"; // Assume-se que a moeda é sempre EUR, porque a XTB não indica a moeda nas colunas de montante, e o montante está sempre em EUR
      const assetCurrency = "EUR";
      const countryCode = ticker.split(".")[1];
      let country;
      if(countryCode) {
        country = new Country(countryCode);
      }

      let [date, time] = record["Time"].split(" ");
      let utcDate = DateTime.fromFormat(
        `${date} ${time}`,
        "yyyy-MM-dd HH:mm:ss", { zone: "utc" });

      let type: TransactionType = record["Type"] === "Dividend" ? "Dividend" : "Interest";
      let amount = parseFloat(record["Amount"].replace(",", "."));

      const fees: Fee[] = [];
      const taxes: Tax[] = [];

      // Verificar se houve witholding tax
      const nextRecord = oRecords[index + 1];
      const prevRecord = oRecords[index - 1];

      if (type === "Dividend") {
        if (prevRecord && prevRecord["Type"].includes("tax") && prevRecord["Ticker"] === ticker && prevRecord["Time"] === record["Time"]) {
          let taxAmount = Math.abs(parseFloat(prevRecord["Amount"].replace(",", ".")));
          taxes.push(new Tax(prevRecord["Type"], taxAmount, "EUR"));
          // amount = amount - taxAmount;
        }
      } else {
        if (prevRecord && prevRecord["Type"].includes("tax") && prevRecord["Ticker"] === ticker) {
          let taxAmount = Math.abs(parseFloat(prevRecord["Amount"].replace(",", ".")));
          taxes.push(new Tax(prevRecord["Type"], taxAmount, "EUR"));
          // amount = amount - taxAmount;
        }
        else if (nextRecord && nextRecord["Type"].includes("tax") && nextRecord["Ticker"] === ticker) {
          let taxAmount = Math.abs(parseFloat(nextRecord["Amount"].replace(",", ".")));
          taxes.push(new Tax(nextRecord["Type"], taxAmount, "EUR"));
          // amount = amount - taxAmount;
        }
      }








      const transaction: Transaction = {
        id: transactions.length + 1,
        date: utcDate,
        type: type,
        asset: new Asset(name, ticker, isin, assetCurrency, "", country),
        amount: amount,
        currency: amountCurrency,
        broker: new XTB(),
        taxes: taxes,
        fees: fees, // Como as comissões são fornecidas numa só coluna, colocamos o valor todo na compra, porque não há discriminação em que momento da operação as comissões foram cobradas
        exchangeRate: 1 // Como não é fornecido a moeda dos montantes, assume-se que estão todos em EUR, e portanto a taxa de câmbio é 1
      };

      if (transaction.type) transactions.push(transaction);

    });

    // console.log("Transactions: " + JSON.stringify(transactions));

    return transactions;

  }

  parseCapitalGains(sections: BrokerSection[]): Transaction[] {
    const transactions: Transaction[] = [];

    const section = sections[1];
    const oRecords: BrokerRecord[] = section.rows.map((record) => Object.fromEntries(record));

    const cashSection = sections[3];
    const oCashRecords: BrokerRecord[] = cashSection.rows.map((record) => Object.fromEntries(record));

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
      const countryCode = oCashRecords.find(r => r["Ticker"] === ticker)?.["Ticker"].split(".")[1];
      let country;
      if(countryCode) {
        country = new Country(countryCode);
      }

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
        asset: new Asset(name, ticker, isin, assetCurrency, assetType, country),
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
        asset: new Asset(name, ticker, isin, assetCurrency, assetType, country),
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

    });

    // console.log("Transactions: " + JSON.stringify(transactions));

    return transactions;
  }
}

export { XTBParser2026_v1 };
