import { Fee } from "../../../models/fee.js";
import { Tax } from "../../../models/tax.js";
import { Transaction, TransactionType } from "../../../models/transaction.js";
import { DateTime } from "luxon";
import { LightYear } from "../../../models/brokers/lightyear";
import { Asset } from "../../../models/asset.js";
import { BrokerRecord, BrokerSection } from "../../../models/brokerRecord.js";
import { ILightYearParser } from "./lightyearparser.js";

class LightYearParser2026_v1 implements ILightYearParser {
  canParse(sections: BrokerSection[]): boolean {
    console.log("Checking if file can be parsed with LightYearParser2026_v1...");
    if (!sections.length || !sections[0].rows.length) return false;

    // pega numa linha representativa
    const sample = Object.fromEntries(sections[0].rows.find(row => row[4][1] === "Buy" || row[4][1] === "Sell" || row[4][1] ==="Dividend" || row[4][1] === "Interest") || []);
    console.log("Sample found: " + JSON.stringify(sample));
    if(!sample) return false;

    // valida headers base (estrutura do ficheiro)
    const headers = Object.keys(sample);
    const hasRequiredHeaders = headers.includes("Date") &&
                               headers.includes("Ticker") && 
                               headers.includes("ISIN") && 
                               headers.includes("Type") && 
                               headers.includes("Quantity") && 
                               headers.includes("CCY") && 
                               headers.includes("Price/share") &&
                               headers.includes("Gross Amount") &&
                               headers.includes("FX Rate") &&
                               headers.includes("Fee") &&
                               headers.includes("Net Amt.") &&
                               headers.includes("Tax Amt.");

    console.log("Has required headers: " + hasRequiredHeaders);
    if (!hasRequiredHeaders) return false;

    // heuristica para a data
    // 16/12/2025 06:45:08
    const hDate = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}\.?\d*\s*$/;
    console.log("Has valid date format: " + hDate.test(sample["Date"]));
    if (!hDate.test(sample["Date"])) return false;

    //  heurística para o montante:
    // 12.08
    const hAmount = /^-?\d+\.\d+$/.test(sample["Gross Amount"]);
    console.log("Has valid amount format: " + hAmount);
    if(!hAmount) return false;

    // heuristica para a quantidade:
    // 0.0480192 ou -0.0480192
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
      if (!record["Date"]) return;

      const [date, time] = record["Date"].split(" ");
      const utcDate = DateTime.fromFormat(
        `${date} ${time}`,
        "dd/MM/yyyy HH:mm:ss", { zone: "utc" });

      let type : TransactionType;
      if (record["Type"].toLowerCase().includes("buy")) type = "Buy";
      else if (record["Type"].toLowerCase().includes("sell")) type = "Sell";
      else if (record["Type"].toLowerCase().includes("dividend")) type = "Dividend";
      else if (record["Type"].toLowerCase().includes("interest")) type = "Interest";
      else return;
      
      const name = "";
      const ticker = record["Ticker"];
      const isin = record["ISIN"];
      const shares = parseFloat(record["Quantity"]);
      let amount = Math.abs(parseFloat(record["Gross Amount"]));
      const amountCurrency = record["CCY"].replaceAll('"', "");
      const assetCurrency = amountCurrency;

      const fees: Fee[] = [];
      const taxes: Tax[] = [];

      if(record["Fee"]) fees.push(new Fee("Fee", Math.abs(parseFloat(record["Fee"])), amountCurrency));
      if(record["Tax Amt."]) taxes.push(new Tax("Tax", Math.abs(parseFloat(record["Tax Amt."])), amountCurrency));

      if(type === "Sell") amount = amount - (fees.reduce((acc, fee) => acc + fee.amount, 0) + taxes.reduce((acc, tax) => acc + tax.amount, 0));

      let exchangeRate = 1 / parseFloat(record["FX Rate"]) || 1;
      console.log("Gross Amount: " + amount + ", FX Rate: " + record["FX Rate"] + ", Exchange Rate: " + exchangeRate);

      const transaction: Transaction = {
        id: transactions.length + 1,
        date: utcDate,
        type: type,
        asset: new Asset(name, ticker, isin, assetCurrency),
        shares: shares,
        amount: amount,
        currency: amountCurrency,
        broker: new LightYear(),
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

export { LightYearParser2026_v1 };
