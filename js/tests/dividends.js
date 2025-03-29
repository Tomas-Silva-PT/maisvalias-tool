import { Statement } from "../models/statement.js";
import { Trading212Parser } from "../parsers/trading212parser.js";
import { AssetBuffer } from "../models/asset.js";
import { PTDividendsFormatter } from "../formatters/pt/irs/dividends_formatter.js";

const startTime = Date.now();
const filesPath = [
  "./data/t212_2023.csv",
  "./data/t212_2024.csv",
  "./data/t212_2024.csv",
  "./data/t212_2022.csv",
];
const statement = new Statement([]);

filesPath.forEach((file) => {
  const parser = new Trading212Parser();
  const transactions = parser.parse(file);
  statement.addTransactions(transactions);
});
var parsingTime;
statement
  .fetchData(new AssetBuffer())
  .then(() => {
    parsingTime = Date.now() - startTime;
  })
  .then(() => {
    const formatter = new PTDividendsFormatter();
    const dividends = formatter.format(statement, "2023");
    return dividends;
  })
  .then((dividends) => {
    const formattingTime = Date.now() - startTime;

    console.log(dividends);
    console.log("Nº de linhas: " + dividends.length);

    const endTime = Date.now();
    const elapsedTime = endTime - startTime;
    console.log(`Parsing Time: ${parsingTime / 1000} seconds`);
    console.log(`Formatting Time: ${formattingTime / 1000} seconds`);
    console.log(`Total elapsed time: ${elapsedTime / 1000} seconds`);
  });