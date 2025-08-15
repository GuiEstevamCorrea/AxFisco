import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class ConsultarStatusNotaFiscalDto {
  @IsString()
  @IsNotEmpty()
  notaFiscalId: string;
}

export class StatusNotaFiscalDto {
  id: string;
  numero: string;
  serie: string;
  chaveAcesso?: string;
  status: string;
  dataEmissao: Date;
  dataUltimaConsulta?: Date;
  protocolo?: string;
  motivo?: string;
  valorTotal: number;
  tipo: 'NFe' | 'NFSe';
  situacaoSefaz?: string;
  codigoRetorno?: string;
  mensagemRetorno?: string;
}

export class ListarNotasFiscaisDto {
  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsEnum(['NFe', 'NFSe'])
  tipo?: 'NFe' | 'NFSe';

  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  numero?: string;

  @IsOptional()
  @IsString()
  chaveAcesso?: string;
}

export class NotaFiscalResumoDto {
  id: string;
  numero: string;
  serie: string;
  chaveAcesso?: string;
  dataEmissao: Date;
  valorTotal: number;
  status: string;
  tipo: 'NFe' | 'NFSe';
  nomeCliente: string;
  documentoCliente: string;
  observacoes?: string;
}

export class ListaNotasFiscaisDto {
  notas: NotaFiscalResumoDto[];
  total: number;
  pagina: number;
  totalPaginas: number;
}
