import clsx from "clsx";
import styles from "./styles.module.css";

function AboutPageSection({ title, description }) {
  return (
    <>
      <h1 className={clsx(styles.title)}>{title}</h1>
      <div className={clsx(styles.paragraph)}>
        <p className={clsx(styles.text)}>{description}</p>
      </div>
    </>
  );
}

export default function AboutpageContent() {
  return (
    <>
      <section className={clsx(styles.section, styles.fadeIn)}>
        <h1 className={clsx(styles.title)}>Quem Somos</h1>
        <div className={clsx(styles.paragraph)}>
          <p className={clsx(styles.text)}>
            Bem, na verdade, <b>"somos"</b> mas no singular. O meu nome é Tomás,
            e sou programador de coração. Desde de que aprendi a programar que
            quis entrar no mundo do Open-Source e sentir que estou a entregar
            "valor" para a sociedade. Só há pouco tempo é que consegui orientar
            a minha vida para que tal desejo se possa tornar realidade, e como
            tal, aqui estou eu!
          </p>
        </div>
        <h1 className={clsx(styles.title)}>Porquê criar o maisvalias-tool</h1>
        <div className={clsx(styles.paragraph)}>
          <p className={clsx(styles.text)}>
            Esta aplicação na verdade surgiu de uma necessidade pessoal. Quando
            começei a trabalhar e a investir o meu dinheiro surgiu-me a dúvida
            existencial de <b>"como é que eu vou declarar isto?"</b>. Decidi
            então fazer a minha pesquisa e, numa fase inicial, desenvolver esta
            aplicação para uso próprio. Após conversar com pessoas à minha volta
            percebi a dúvida existencial era compartilhada pelo que surgiu a
            oportunidade ideal para um projeto Open-Source.
          </p>
        </div>
        <h1 className={clsx(styles.title)}>Como nos contactar</h1>
        <div className={clsx(styles.paragraph)}>
          <p className={clsx(styles.text)}>
            Para partilhares ideias, sugestões, ou dúvidas, sugiro que o faças
            no nosso repositório <a href="https://github.com/Tomas-Silva-PT/maisvalias-tool">Github</a>.
          </p>
        </div>
        <h1 className={clsx(styles.title)}>Como nos apoiar</h1>
        <div className={clsx(styles.paragraph)}>
          <p className={clsx(styles.text)}>
          Se gostares da ferramenta maisvalias-tool, podes sempre contribuir com <a href="https://github.com/Tomas-Silva-PT/maisvalias-tool/issues">sugestões de melhorias</a>, ou então podes apoiar-nos com uma <a href="https://github.com/sponsors/Tomas-Silva-PT">doação</a>.
          </p>
        </div>
      </section>
    </>
  );
}
