import { IsString, IsNotEmpty, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ItemNotaFiscalDto } from './emitir-nota-fiscal.dto';

export class ValidarDadosNotaFiscalDto {
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
}

export class ErroValidacaoDto {
  campo: string;
  mensagem: string;
  valor?: any;
}

export class ResultadoValidacaoDto {
  valido: boolean;
  erros: ErroValidacaoDto[];
  avisos: ErroValidacaoDto[];
  valorTotalCalculado: number;
  impostoTotalCalculado: number;
}
