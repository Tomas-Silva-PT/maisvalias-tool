import fs from "fs";

class Country {
    constructor(alpha2) {
        const data = fs.readFileSync("./data/codigos_paises.json", "utf-8");
        const paises = JSON.parse(data);
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

    toDict() {
        return {
            code: this.code,
            alpha_2: this.alpha2,
            alpha_3: this.alpha3,
            name_pt: this.namePt,
            name_en: this.nameEn
        };
    }

    fromDict(data) {
        this.code = data.code;
        this.alpha2 = data.alpha_2;
        this.alpha3 = data.alpha_3;
        this.namePt = data.name_pt;
        this.nameEn = data.name_en;
    }

    equals(other) {
        return this.code === other.code;
    }
}

export { Country };