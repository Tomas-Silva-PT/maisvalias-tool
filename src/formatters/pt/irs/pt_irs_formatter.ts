import { Classifications } from "../../../classifiers/classifications/classification";
import { PTAnexoG1Quadro7Formatter } from "./anexos/G1/quadro_7_formatter";
import { PTAnexoJQuadro8AFormatter } from "./anexos/J/quadro_8A_formatter";
import { PTAnexoJQuadro92AFormatter } from "./anexos/J/quadro_9_2_A_formatter";
import { PTAnexoJQuadro94AFormatter } from "./anexos/J/quadro_9_4_A_formatter";
import { IRSFormatter } from "./IRSFormatter";

class PTIRSFormatter {
    static async format(xml: string, classifications: Classifications): Promise<string> {
        xml = xml.replace(/^\uFEFF/, "").trimStart();

        if (typeof window !== "undefined" && typeof window.DOMParser !== "undefined") {
            return this._formatBrowserVersion(xml, classifications);
        } else {
            return this._formatServerVersion(xml, classifications);
        }
    }

    static async _formatBrowserVersion(
        xml: string,
        classification: Classifications
    ): Promise<string> {

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");

        const anexoJ = xmlDoc.querySelector("AnexoJ");
        if (!anexoJ) {
            throw new Error(
                "O Anexo J não foi encontrado na declaração IRS."
            );
        }

        // 👉 PONTO CRÍTICO DA ARQUITETURA
        for (const [destination, events] of classification) {
            const formatter = PTIRSFormatterRegistry.getFormatter(destination.code);
            formatter.toXML(xmlDoc, events);
        }

        return new XMLSerializer().serializeToString(xmlDoc);
    }

    static async _formatServerVersion(
        xml: string,
        classification: Classifications
    ): Promise<string> {

        const { DOMParser, XMLSerializer } = await import("@xmldom/xmldom");
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");

        const anexoJ = xmlDoc.getElementsByTagName("AnexoJ")[0];
        if (!anexoJ) {
            throw new Error(
                "O Anexo J não foi encontrado na declaração IRS."
            );
        }

        for (const [destination, events] of classification) {
            const formatter = PTIRSFormatterRegistry.getFormatter(destination.code);
            formatter.toXML(xmlDoc, events);
        }

        return new XMLSerializer().serializeToString(xmlDoc);
    }


}

class PTIRSFormatterRegistry {
    private static formatters: Map<string, IRSFormatter<any, any>> = new Map();

    static register(destinationCode: string, formatter: IRSFormatter<any, any>): void {
        this.formatters.set(destinationCode, formatter);
    }

    static getFormatter(destinationCode: string): IRSFormatter<any, any> {
        const formatter = this.formatters.get(destinationCode);
        if (!formatter) {
            throw new Error(`No formatter registered for destination code: ${destinationCode}`);
        }
        return formatter;
    }
}

PTIRSFormatterRegistry.register(
    "ANEXO_J_QUADRO_8A",
    new PTAnexoJQuadro8AFormatter()
);

PTIRSFormatterRegistry.register(
    "ANEXO_J_QUADRO_92A",
    new PTAnexoJQuadro92AFormatter()
);

PTIRSFormatterRegistry.register(
    "ANEXO_J_QUADRO_94A",
    new PTAnexoJQuadro94AFormatter()
);

PTIRSFormatterRegistry.register(
    "ANEXO_G1_QUADRO_7",
    new PTAnexoG1Quadro7Formatter()
);



export { PTIRSFormatter, PTIRSFormatterRegistry };