import { IsString, IsNotEmpty, IsArray, ValidateNested, IsEnum, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class ItemNotaFiscalDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsNumber()
  quantidade: number;

  @IsNumber()
  valorUnitario: number;

  @IsNumber()
  @IsOptional()
  valorDesconto?: number;

  @IsString()
  @IsOptional()
  codigoNcm?: string;

  @IsString()
  @IsOptional()
  cfop?: string;
}

export class EmitirNotaFiscalDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsEnum(['NFe', 'NFSe'])
  tipo: 'NFe' | 'NFSe';

  @IsString()
  @IsNotEmpty()
  naturezaOperacao: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemNotaFiscalDto)
  itens: ItemNotaFiscalDto[];

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsBoolean()
  @IsOptional()
  emitirEmContingencia?: boolean;
}

export class NotaFiscalEmitidaDto {
  id: string;
  numero: string;
  serie: string;
  chaveAcesso?: string;
  dataEmissao: Date;
  valorTotal: number;
  status: string;
  tipo: 'NFe' | 'NFSe';
  companyId: string;
  customerId: string;
  observacoes?: string;
}
