import { Transaction, TransactionType } from "../../../models/transaction.js";
import { Fee } from "../../../models/fee.js";
import { Revolut } from "../../../models/brokers/revolut.js";
import { DateTime } from "luxon";
import { Asset } from "../../../models/asset.js";
import { BrokerRecord, BrokerSection } from "../../../models/brokerRecord.js";
import { IRevolutParser } from "./revolutparser.js";

class RevolutParser2025_v1 implements IRevolutParser {

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

  parse(sections: BrokerSection[]): Transaction[] {
    if (!this.isins) {
      throw new Error("Isins not loaded");
    }
    const transactions: Transaction[] = [];
    const section = sections[0];
    const oRecords: BrokerRecord[] = section.rows.map((record) => Object.fromEntries(record));

    oRecords.forEach((record) => {
      const parser = RevolutParserFactory.createParser(record);
      if (!parser) return;
      const transaction = parser.parse(record);
      if (!transaction) return;

      // Fill in the ISIN for the transaction's asset, if it exists in the loaded ISINs
      if (transaction.asset) {
        const isin = this.isins?.find((i) => i.ticker === transaction.asset?.ticker)?.isin;
        if (isin) {
          transaction.asset.isin = isin;
        }
        if (!isin && (transaction.type === "Sell" || transaction.type === "Dividend")) {
          throw new Error(
            "Invalid file data: no isin found for " +
            transaction.type +
            " of ticker " +
            transaction.asset?.ticker
          );
        }
      }
      transactions.push(transaction);
    });

    return transactions;
  }

  canParse(sections: BrokerSection[]): boolean {
    console.log("Checking if file can be parsed with RevolutParser2025_v1...");
    if (!sections.length || !sections[0].rows.length) return false;

    // pega numa linha representativa
    const sample = Object.fromEntries(sections[0].rows.find(row => row[2][1] === "BUY - MARKET" || row[2][1] === "SELL - MARKET" || row[2][1] === "DIVIDEND") || []);
    console.log("Sample found: " + JSON.stringify(sample));
    if(!sample) return false;

    // valida headers base (estrutura do ficheiro)
    // Date;Ticker;Type;Quantity;Price per share;Total Amount;Currency;FX Rate
    const headers = Object.keys(sample);
    const hasRequiredHeaders = headers.includes("Date") &&
                               headers.includes("Ticker") && 
                               headers.includes("Type") && 
                               headers.includes("Quantity") && 
                               headers.includes("Price per share") && 
                               headers.includes("Total Amount") && 
                               headers.includes("Currency") && 
                               headers.includes("FX Rate");

    console.log("Has required headers: " + hasRequiredHeaders);
    if (!hasRequiredHeaders) return false;

    // heuristica para a data
    // 2021-02-26T20:07:50.011692Z
    const hDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$/;
    console.log("Has valid date format: " + hDate.test(sample["Date"]));
    if (!hDate.test(sample["Date"])) return false;

    //  heurística para o montante:
    // $12,08
    const hAmount = sample["Total Amount"].split(" ").length === 1;
    //  reforço (opcional): vírgula decimal
    const hAmountHasCommaDecimal = /,\d+$/.test(sample["Total Amount"]);
    console.log("Has valid amount format: " + hAmount);
    console.log("Has comma as decimal separator: " + hAmountHasCommaDecimal);
    if(!hAmount || !hAmountHasCommaDecimal) return false;

    // heuristica para a quantidade:
    // 0,0480192
    const hQuantity = /^\d+,\d+$/.test(sample["Quantity"]);
    console.log("Has valid quantity format: " + !(sample["Quantity"] && !hQuantity));
    if (sample["Quantity"] && !hQuantity) return false;

    // heuristica taxa de câmbio:
    // 1,218
    const hExchangeRate = /^\d+,\d+$/.test(sample["FX Rate"]);
    console.log("Has valid exchange rate format: " + !(sample["FX Rate"] && !hExchangeRate));
    if (sample["FX Rate"] && !hExchangeRate) return false;

    return true;
  }

}


class RevolutCapitalGainAndDividendParser {
  parse(record: BrokerRecord): Transaction | undefined {
    let transaction: Transaction;
    if (!record["Date"]) return;

    const oDate = new Date(record["Date"]);
    const date = oDate.toISOString().split("T")[0];
    const time = oDate.toLocaleTimeString("pt-PT", { hour12: false });

    const utcDate = DateTime.fromFormat(
      `${date} ${time}`,
      "yyyy-MM-dd HH:mm:ss", { zone: "utc" }
    )

    let type: TransactionType;
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
    let exchangeRate = 1 / parseFloat(record["FX Rate"].replace("\r", "").replace(",", ".")); // Porque a taxa de câmbio vem do EUR para a moeda do ativo, e nós queremos ao contrário
    if (isNaN(exchangeRate) || exchangeRate < Number.EPSILON) exchangeRate = 1;
    const feeAmount = Math.abs(Math.round((totalAmount - priceShare * shares) * 100) / 100);

    const fees: Fee[] = [];
    let amount = totalAmount;
    if (feeAmount >= 0.01) {
      // amount = totalAmount - feeAmount;
      const fee = new Fee("Fee", feeAmount, amountCurrency, exchangeRate);
      fees.push(fee);
    }

    // const isin = this.isins?.find((i) => i.ticker === ticker)?.isin;
    // if (isin) {

    transaction = {
      date: utcDate,
      type: type,
      asset: new Asset("", ticker, "", assetCurrency), // O ISIN será preenchido posteriormente, após a correspondência com a lista de ISINs carregada
      shares: shares,
      amount: amount,
      currency: amountCurrency,
      broker: new Revolut(),
      taxes: undefined,
      fees: fees,
      exchangeRate: exchangeRate
    };

    return transaction;
  }
}

class RevolutInterestGainParser {
  parse(record: BrokerRecord): Transaction | undefined {
    // console.log("Parsing record: " + JSON.stringify(record));
    let transaction: Transaction;
    if (!record["Data"] || !record["Entrada de dinheiro"]) return;

    // Como o header "Descrição" vem com caracteres manhosos, vamos identificar as linhas de juros procurando pela presença da string "Pagamento de juros" em qualquer coluna
    if (!Object.entries(record).find(([key, value]) => value.includes("Pagamento de juros"))) return;

    const date = record["Data"];

    const utcDate = DateTime.fromFormat(
      `${date}`,
      "dd/MM/yyyy", { zone: "utc" }
    )

    let type: TransactionType;
    type = "Interest";

    const amount = parseFloat(record["Entrada de dinheiro"].replace(/[^\d.-]/g, ""));  // remove currency and commas);
    const amountCurrency = "EUR";

    transaction = {
      date: utcDate,
      type: type,
      asset: undefined, // O ISIN será preenchido posteriormente, após a correspondência com a lista de ISINs carregada
      shares: undefined,
      amount: amount,
      currency: amountCurrency,
      broker: new Revolut(),
      taxes: undefined,
      fees: undefined,
      exchangeRate: undefined
    };

    console.log("Parsed interest transaction: " + JSON.stringify(transaction));

    return transaction;
  }
}

class RevolutParserFactory {
  // Rules to identify the file type based on headers
  static fileRules = [
    {
      condition: (headers: string[]) => headers.includes("Ticker") && headers.includes("Type") && headers.includes("Quantity") && headers.includes("Price per share") && headers.includes("Total Amount") && headers.includes("Currency") && headers.includes("FX Rate"),
      parser: new RevolutCapitalGainAndDividendParser()
    },
    {
      condition: (headers: string[]) => headers.includes("TANB ganho") && headers.includes("Entrada de dinheiro"),
      parser: new RevolutInterestGainParser()
    }
  ]

  static createParser(record: BrokerRecord) {
    // console.log("Record: " + JSON.stringify(record));
    const headers = Object.keys(record);
    if (!headers) {
      throw new Error("Invalid record: no headers found");
    }
    const rule = this.fileRules.find(rule => rule.condition(headers));

    if (!rule) {
      throw new Error("No parser found for the given record");
    }

    return rule.parser;
  }
}



export { RevolutParser2025_v1 };
