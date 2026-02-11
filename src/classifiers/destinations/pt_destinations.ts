// type PTDestination =
//     | "ANEXO_J_QUADRO_92A"
//     | "ANEXO_J_QUADRO_8A";

import { Destination } from "./destination";

const PTDestinations = {
    ANEXO_J_QUADRO_8A: {
        code: "ANEXO_J_QUADRO_8A",
        title: "Anexo J - Quadro 8A",
        subtitle: "Rendimentos de capitais"
    },
    ANEXO_J_QUADRO_92A: {
        code: "ANEXO_J_QUADRO_92A",
        title: "Anexo J - Quadro 9.2A",
        subtitle: "Rendimentos de Incrementos Patrimoniais"
    },
    ANEXO_J_QUADRO_94A: {
        code: "ANEXO_J_QUADRO_94A",
        title: "Anexo J - Quadro 9.4A",
        subtitle: "Alienação Onerosa de Criptoativos que Não Constituam Valores Mobiliários"
    },
    ANEXO_G1_QUADRO_7: {
        code: "ANEXO_G1_QUADRO_7",
        title: "Anexo G1 - Quadro 7",
        subtitle: "Criptoativos que não Constituam Valores Mobiliários Detidos por Período Superior ou igual a 365 Dias"
    }

} satisfies Record<string, Destination>;

export { PTDestinations };