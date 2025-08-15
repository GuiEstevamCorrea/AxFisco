export interface IEmailGateway {
  enviarEmail(destinatario: string, assunto: string, corpo: string, anexos?: IAnexoEmail[]): Promise<boolean>;
  enviarNotaFiscalPorEmail(destinatario: string, chaveAcesso: string, xmlContent: string, pdfContent?: Buffer): Promise<boolean>;
  validarEmail(email: string): boolean;
}

export interface IAnexoEmail {
  nome: string;
  conteudo: Buffer;
  tipo: string;
}
