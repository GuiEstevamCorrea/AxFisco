export interface IXmlGateway {
  assinarXml(xml: string, certificado: Buffer, senha: string): Promise<string>;
  validarXml(xml: string, schema: string): Promise<boolean>;
  gerarXmlNFe(dadosNFe: any): Promise<string>;
  gerarXmlNFSe(dadosNFSe: any): Promise<string>;
  extrairDadosXml(xml: string): Promise<any>;
  formatarXml(xml: string): string;
}

export interface IDanfeGateway {
  gerarDanfe(xmlNFe: string): Promise<Buffer>;
  gerarDanfeSimplificada(xmlNFe: string): Promise<Buffer>;
  gerarDanfce(xmlNFce: string): Promise<Buffer>;
  configurarLogomarca(logomarca: Buffer): void;
}

export interface ISefazGateway {
  enviarNFe(xml: string, ambiente: number): Promise<IRetornoSefaz>;
  consultarStatusNFe(chaveAcesso: string, ambiente: number): Promise<IConsultaNFe>;
  cancelarNFe(chaveAcesso: string, motivo: string, ambiente: number): Promise<IRetornoSefaz>;
  inutilizarNumeracao(
    cnpj: string, 
    serie: number, 
    numeroInicial: number, 
    numeroFinal: number, 
    motivo: string, 
    ambiente: number
  ): Promise<IRetornoSefaz>;
  consultarStatusServico(ambiente: number): Promise<IStatusServico>;
  downloadXml(chaveAcesso: string, ambiente: number): Promise<string>;
}

export interface IRetornoSefaz {
  sucesso: boolean;
  protocolo?: string;
  dataProcessamento?: Date;
  xmlRetorno: string;
  codigo: string;
  descricao: string;
  erros?: IErroSefaz[];
}

export interface IConsultaNFe {
  situacao: string;
  protocolo?: string;
  dataAutorizacao?: Date;
  xmlCompleto?: string;
}

export interface IStatusServico {
  status: string;
  versaoAplicativo: string;
  tempoMedioResposta: number;
  dataHora: Date;
}

export interface IErroSefaz {
  codigo: string;
  descricao: string;
  correcao?: string;
}
