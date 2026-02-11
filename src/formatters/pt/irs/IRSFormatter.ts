import { XMLDoc } from "./dom_types";


interface IRSFormatter<TaxEventType, IRSPanelType> {
    format(events: TaxEventType[]): IRSPanelType[];
    toXML(xmlDoc: XMLDoc, events: TaxEventType[]): void;
}

export { IRSFormatter };