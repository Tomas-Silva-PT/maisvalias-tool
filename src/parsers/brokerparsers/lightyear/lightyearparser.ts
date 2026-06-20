import { Transaction } from "../../../models/transaction.js";
import { BrokerParser } from "../../parser.js";
import { BrokerSection } from "../../../models/brokerRecord.js";
import { LightYearParser2026_v1 } from "./lightyear2026-v1.js";

interface ILightYearParser extends BrokerParser {

}

class LightYearParser implements ILightYearParser {
  canParse(sections: BrokerSection[]): boolean {
    for (const parser of LightYearParserFactory.parsers) {
      if (parser.canParse(sections)) {
        return true;
      }
    }
    return false;
  }

  parse(sections: BrokerSection[]): Transaction[] {
    // escolher variante do parser dinamicamente - porque ao longo do tempo os ficheiros da trading212 têm vindo a mudar de formato, e é necessário ter parsers diferentes para cada formato
    console.log("Choosing parser for LightYear file...");
    const parser = LightYearParserFactory.createParser(sections);
    console.log("Chosen parser: " + parser.constructor.name);

    if (!parser) {
      throw new Error("Unsupported LightYear format");
    }

    const transactions = parser.parse(sections);

    return transactions;
  }


}

class LightYearParserFactory {

  static parsers: ILightYearParser[] = [
    new LightYearParser2026_v1(),
  ];

  static createParser(sections: BrokerSection[]): ILightYearParser {
    for (const parser of [...this.parsers].reverse()) { // reverse para tentar primeiro o parser mais recente, que é mais provável de ser o correto
      if (parser.canParse(sections)) {
        return parser;
      }
    }

    throw new Error("No suitable LightYear parser found");
  }
}

export { LightYearParser, ILightYearParser };
