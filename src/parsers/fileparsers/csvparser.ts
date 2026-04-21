import { BrokerRecordRow, BrokerSection } from "../../models/brokerRecord";
import { FileParser } from "../parser";
import * as Papa from "papaparse";

class CSVParser implements FileParser {

  async parse(file: string): Promise<BrokerSection[]> {

    const rows = Papa.parse(file).data as string[][];

    const sections: BrokerSection[] = [];

    let currentHeaders: string[] | null = null;
    let currentSection: BrokerSection | null = null;
    let sectionCounter = 0;

    for (const row of rows) {
      // console.log("Processing row: ", row); 
      // limpar linha
      if (!row || row.every(cell => !cell || cell.trim() === "")) continue;

      const cleanedRow = row.map(cell => cell?.trim() ?? "");

      // -------------------------
      // NOVO HEADER DETECTADO
      // -------------------------
      // console.log("Is NaN check: ", cleanedRow.every(cell => cell.trim() === '' || isNaN(Number(cell))));
      const isHeaderRow = !cleanedRow.some(cell => /\d/.test(cell)); // Se nenhuma célula contém um dígito, é um header
      if (!currentHeaders || isHeaderRow) {
        // console.log("Is Header");
        currentHeaders = cleanedRow;

        currentSection = {
          number: sectionCounter++,
          rows: []
        };

        // console.log("New section detected: ", currentHeaders);
        // console.log("Current section: ", sectionCounter);

        sections.push(currentSection);

        continue; // header não entra como data
      }

      // -------------------------
      // DATA ROW
      // -------------------------
      const record: BrokerRecordRow = currentHeaders.map((header, i) => [
        header,
        cleanedRow[i] ?? ""
      ]);

      currentSection?.rows.push(record);
    }
    // console.log("Parsed sections: ", sections);
    // console.log("First section: ", sections[7]);

    // Remover seções vazias (que podem ocorrer se houver headers seguidos sem dados, ou no final do arquivo)
    const nonEmptySections = sections.filter(section => section.rows.length > 0);
    
    // Recalcular números das seções para refletir a remoção das vazias
    nonEmptySections.forEach((section, index) => {
      section.number = index;
    });

    // console.log("Non-empty sections: ", nonEmptySections);

    return Promise.resolve(nonEmptySections);
  }
}

export { CSVParser };