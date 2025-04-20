import { PTIRSFormatter } from "../formatters/pt/irs/irs_xml_formatter.js";

import { Statement } from "../models/statement.js";
import { Trading212Parser } from "../parsers/trading212parser.js";
import { AssetBuffer } from "../models/asset.js";
import { PTCapitalGainsFormatter } from "../formatters/pt/irs/capital_gains_formatter.js";
import { PTDividendsFormatter } from "../formatters/pt/irs/dividends_formatter.js";
import fs from "fs";

async function test() {
  const filesPath = [
    "./data/t212_2023.csv",
    "./data/t212_2024.csv",
    "./data/t212_2024.csv",
    "./data/t212_2022.csv",
  ];
  const statement = new Statement([]);

  for (let file of filesPath) {
    const data = fs.readFileSync(file, "utf8");
    const parser = new Trading212Parser();
    const transactions = parser.parse(data);
    statement.addTransactions(transactions);
  }

  await statement.fetchData(new AssetBuffer());

  const capitalGainsformatter = new PTCapitalGainsFormatter();
  const dividendsformatter = new PTDividendsFormatter();
  let capitalGains = await capitalGainsformatter.format(statement);
  let dividends = await dividendsformatter.format(statement);
  dividends = dividends["toIRS"];
  console.log(dividends);

  const df = capitalGains;

  const irs_xml = fs.readFileSync("./data/irs_xml.xml", "utf8");

  let result = await PTIRSFormatter.format(irs_xml, capitalGains.filter((g) => g["Ano de Realização"] == '2023'), dividends.filter((d) => d["Ano rendimento"] == '2023'));

  console.log(result);
}

test();
