import { Statement } from "../models/statement.js";
import { Trading212Parser } from "../parsers/trading212parser.js";
import { AssetBuffer } from "../models/asset.js";
import { PTCapitalGainsFormatter } from "../formatters/pt/irs/capital_gains_formatter.js";
import fs from "fs";

async function test() {
  const startTime = Date.now();
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
  var parsingTime;
  await statement.fetchData(new AssetBuffer());
  parsingTime = Date.now() - startTime;
  const formatter = new PTCapitalGainsFormatter();
  const capitalGains = await formatter.format(statement, "2023");
  const formattingTime = Date.now() - startTime;

  const df = capitalGains;
  console.log(df);
  console.log("Nº de linhas: " + df.length);

  const endTime = Date.now();
  const elapsedTime = endTime - startTime;
  console.log(`Parsing Time: ${parsingTime / 1000} seconds`);
  console.log(`Formatting Time: ${formattingTime / 1000} seconds`);
  console.log(`Total elapsed time: ${elapsedTime / 1000} seconds`);
}

test();
