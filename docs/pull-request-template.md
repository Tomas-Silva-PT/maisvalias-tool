# Template para _pull request_

### Título 
Adicionar suporte para corretora Revolut

### Descrição  
Este PR pretende adicionar a capacidade da ferramenta **maisvalias-tool** calcular mais valias obtidas na Revolut.

### Issue  
Fecha issue #999  

### Motivação  
Muitos utilizadores utilizam a Revolut para realizar investimentos no mercado financeiro. 
Incorporar suporte para a Revolut na ferramenta **maisvalias-tool** permitirá um cálculo mais preciso e automatizado das mais-valias para quem utiliza esta corretora.

### Alterações  
- Foi desenvolvido o código para dar _parse_ dos extratos da Revolut.
- Foi atualizado o website para permitir escolher a Revolut como corretora.  
- Foram adicionados scripts de teste à nova funcionalidade

### Testes  
Para testar a funcionalidade, foi criado o arquivo `teste-revolut.js`, que verifica o _parsing_ dos extratos da Revolut.  
Além disso, o teste foi realizado diretamente no site, selecionando a Revolut como corretora e verificando a precisão dos cálculos.  
Todos os testes passaram com sucesso.
