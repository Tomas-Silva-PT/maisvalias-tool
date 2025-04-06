import clsx from "clsx";
import styles from "./styles.module.css";

export default function HomepageDisclaimer() {
  return (
    <>
      <section className={clsx(styles.section)}>
        <p className={clsx(styles.text)}>
          A maisvalias-tool é uma ferramenta independente, cujos resultados
          produzidos não têm carácter vinculativo. Como tal, deve haver uma
          retificação dos resultados, assim como a consulta da legislação em
          vigor, consultando sempre que necessário a Autoridade Tributária e
          Aduaneira (AT). Deste modo não somos responsáveis por quaisquer perdas
          causadas pelo uso direto ou indireto desta ferramenta.
        </p>
      </section>
    </>
  );
}
