import paisesJson from "./codigos_paises.json" with { type: "json" };

class Country {
    code: string;
    alpha2: string;
    alpha3: string;
    namePt: string;
    nameEn: string;

    constructor(alpha2 : string) {
        const paises = paisesJson;
        const country = paises.find(p => p.alpha_2 === alpha2);
        
        if (country) {
            this.code = country.code;
            this.alpha2 = country.alpha_2;
            this.alpha3 = country.alpha_3;
            this.namePt = country.name_pt;
            this.nameEn = country.name_en;
        } else {
            throw new Error(`Country with alpha_2 '${alpha2}' not found`);
        }
    }

    toString() {
        return `Country(alpha_2: ${this.alpha2})`;
    }

    equals(other : Country) : boolean {
        return this.code === other.code;
    }
}

export { Country };