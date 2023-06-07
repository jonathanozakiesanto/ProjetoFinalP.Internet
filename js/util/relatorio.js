/**
 * Gera um relatório em PDF a partir do conteúdo de um elemento HTML.
 * Nesta função, você fornece o nome do relatório (nomeRelatorio) e o ID do elemento HTML (idElemento) que contém o conteúdo que será convertido em PDF.
 * A função utiliza a biblioteca html2pdf para gerar o relatório em PDF. As opções de configuração (opt) são definidas para controlar o formato e a aparência do PDF gerado. Por exemplo, você pode configurar a margem do documento, o nome do arquivo PDF, o formato da imagem, a escala do html2canvas e as configurações do jsPDF.
 * Em seguida, a função chama o método set da biblioteca html2pdf para definir as opções de configuração e utiliza o método from para especificar o elemento HTML de origem. Por fim, o método save é chamado para salvar o relatório em PDF.
 * Certifique-se de ter a biblioteca html2pdf incluída no seu projeto e de que todas as dependências necessárias estejam satisfeitas para que a função seja executada corretamente.
 * @param {string} nomeRelatorio - O nome do relatório a ser gerado.
 * @param {string} idElemento - O ID do elemento HTML que contém o conteúdo a ser convertido em PDF.
 */
function gerarRelatorioPDF(nomeRelatorio, idElemento) {
  // Obtém a referência do elemento HTML pelo seu ID
  const element = document.getElementById(idElemento);

  // Opções de configuração para a geração do PDF
  var opt = {
    margin: 1,                                     // Margem do documento em polegadas
    filename: nomeRelatorio + '.pdf',               // Nome do arquivo PDF gerado
    image: { type: 'jpeg', quality: 0.98 },         // Configurações da imagem (formato e qualidade)
    html2canvas: { scale: 2 },                      // Configurações do html2canvas (escala)
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } // Configurações do jsPDF (unidade, formato e orientação)
  };

  // Chama a biblioteca html2pdf para gerar o PDF
  html2pdf().set(opt).from(element).save();
}
