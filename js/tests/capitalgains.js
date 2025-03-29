import { Statement } from "../models/statement.js";
import { Trading212Parser } from "../parsers/trading212parser.js";
import { AssetBuffer } from "../models/asset.js";
import { PTCapitalGainsFormatter } from "../formatters/pt/irs/capital_gains_formatter.js";


const startTime = Date.now();
const filesPath = ["./data/t212_2023.csv", "./data/t212_2024.csv", "./data/t212_2024.csv", "./data/t212_2022.csv"];
const statement = new Statement([]);

filesPath.forEach((file) => {
  const parser = new Trading212Parser();
  const transactions = parser.parse(file);
  statement.addTransactions(transactions);
});
var parsingTime;
statement.fetchData(new AssetBuffer()).then(() => {
    parsingTime = Date.now() - startTime; 
}).then(() => {
    const formatter = new PTCapitalGainsFormatter();
    const capitalGains = formatter.format(statement, "2023");
    return capitalGains;
}).then((capitalGains) => {
    const formattingTime = Date.now() - startTime;
    
    const df = capitalGains;
    console.log(df);
    console.log("Nº de linhas: " + df.length);
    
    const endTime = Date.now();
    const elapsedTime = endTime - startTime;
    console.log(`Parsing Time: ${parsingTime / 1000} seconds`);
    console.log(`Formatting Time: ${formattingTime / 1000} seconds`);
    console.log(`Total elapsed time: ${elapsedTime / 1000} seconds`); 
});
