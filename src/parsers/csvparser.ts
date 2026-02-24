import { BrokerRecord, BrokerRecordRow } from "../models/brokerRecord";
import { FileParser } from "./parser";

class CSVParser implements FileParser {

  separator: string;
  constructor(separator: string = ",") {
    this.separator = separator;
  }

  parse(file: string): BrokerRecordRow[] {

    const rows = file
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .map((row) => row.split(this.separator));

    const headers = rows.shift();

    if (!headers) {
      throw new Error("Invalid CSV: no headers found");
    }

    const cleanHeaders = headers.map(h => h.trim());
    const nonEmptyRows = rows.filter(row => row.some(cell => cell.trim() !== ""));

    if (nonEmptyRows.length === 0) {
      throw new Error("Invalid CSV: no data found");
    }

    if (nonEmptyRows.some(row => row.length !== cleanHeaders.length)) {
      throw new Error("Invalid CSV: number of columns does not match headers");
    }

    // return nonEmptyRows.map((row) =>
    //   Object.fromEntries(
    //     cleanHeaders.map((h, i) => [
    //       h,
    //       row[i]?.trim() ?? ""
    //     ])
    //   )
    // );
    // O formato de saída é um array de arrays de tuplas [header, value], para manter a ordem dos campos e permitir múltiplas colunas com o mesmo nome (caso existam).
    // A Degiro, por exemplo, tem extratos com múltiplas colunas com nome vazio, o que impossibilita o uso de um objeto simples para representar os registros.
    return nonEmptyRows.map((row) =>
        cleanHeaders.map((h, i) => [
          h,
          row[i]?.trim() ?? ""
        ])
    );
  }
}

export { CSVParser };