import * as XLSX from "xlsx";
import { FileParser } from "../parser";
import { BrokerRecordRow, BrokerSection } from "../../models/brokerRecord";

class ExcelParser implements FileParser {

    async parse(file: ArrayBuffer | Buffer): Promise<BrokerSection[]> {

        let workbook: XLSX.WorkBook;

        if (file instanceof ArrayBuffer) {
            workbook = XLSX.read(file, { type: "array", cellDates: true });
        } else {
            workbook = XLSX.read(file, { type: "buffer", cellDates: true });
        }

        const sections: BrokerSection[] = [];
        let sectionCounter = 0;

        workbook.SheetNames.forEach((sheetName) => {
            const sheet = workbook.Sheets[sheetName];

            const rawRows = XLSX.utils.sheet_to_json<any[]>(sheet, {
                header: 1,
                defval: ""
            });

            let currentHeaders: string[] | null = null;
            let currentSection: BrokerSection | null = null;

            for (const rawRow of rawRows) {
                // const cleanedRow = rawRow.map(cell => String(cell).trim());
                const cleanedRow = rawRow.map(cell => {
                    if (cell instanceof Date) {
                        // const utc = new Date(cell.getTime() - cell.getTimezoneOffset() * 60000);
                        return new Date(cell).toISOString().replace("T", " ").substring(0, 19);
                    }
                    return String(cell).trim();
                });

                // Ignorar linhas completamente vazias
                if (cleanedRow.every(cell => cell === "")) continue;

                // Detectar header: nenhuma célula contém um dígito
                const isHeaderRow = !cleanedRow.some(cell => /\d/.test(cell));

                if (!currentHeaders || isHeaderRow) {
                    currentHeaders = cleanedRow;
                    currentSection = { number: sectionCounter++, rows: [] };
                    sections.push(currentSection);
                    continue;
                }

                // Data row
                const record: BrokerRecordRow = currentHeaders.map((header, i) => [
                    header,
                    cleanedRow[i] ?? ""
                ]);

                currentSection?.rows.push(record);
            }
        });

        // Remover secções vazias e renumerar
        const nonEmptySections = sections.filter(s => s.rows.length > 0);
        nonEmptySections.forEach((section, index) => {
            section.number = index;
        });

        console.log("[ExcelParser] Parsed sections: " + JSON.stringify(nonEmptySections));

        return nonEmptySections;
    }
}

export { ExcelParser };
// import * as XLSX from "xlsx";
// import { FileParser } from "../parser";
// import { BrokerRecordRow, BrokerSection } from "../../models/brokerRecord";

// class ExcelParser implements FileParser {

//     async parse(file: ArrayBuffer | Buffer): Promise<BrokerSection[]> {

//         let workbook: XLSX.WorkBook;

//         if (file instanceof ArrayBuffer) {
//             workbook = XLSX.read(file, { type: "array" });
//         } else {
//             workbook = XLSX.read(file, { type: "buffer" });
//         }

//         const sections: BrokerSection[] = [];

//         workbook.SheetNames.forEach((sheetName, index) => {
//             const sheet = workbook.Sheets[sheetName];

//             const rows = XLSX.utils.sheet_to_json<any[]>(sheet, {
//                 header: 1,
//                 defval: ""
//             });

//             const result: BrokerRecordRow[] = rows
//                 .filter(row => row.some(cell => String(cell).trim() !== ""))
//                 .map(row =>
//                     row.map((cell, i) => [
//                         `col${i}`,
//                         String(cell).trim()
//                     ])
//                 );

//             const section: BrokerSection = {
//                 number: index,
//                 rows: result
//             };

//             sections.push(section);
//         });

//         console.log("[ExcelParser] Parsed sections: " + JSON.stringify(sections));

//         return sections;
//     }

// }

// export { ExcelParser };