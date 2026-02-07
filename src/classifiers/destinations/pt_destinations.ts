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
    }
} satisfies Record<string, Destination>;

export { PTDestinations };