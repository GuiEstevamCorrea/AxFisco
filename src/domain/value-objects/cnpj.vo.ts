export class CNPJ {
  private readonly _value: string;

  constructor(value: string) {
    const cleanValue = this.clean(value);
    
    if (!this.isValid(cleanValue)) {
      throw new Error('CNPJ inválido');
    }
    
    this._value = cleanValue;
  }

  get value(): string {
    return this._value;
  }

  get formatted(): string {
    return this._value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }

  private clean(cnpj: string): string {
    return cnpj.replace(/\D/g, '');
  }

  private isValid(cnpj: string): boolean {
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false; // Todos os dígitos iguais

    let soma = 0;
    let pos = 5;

    // Primeiro dígito verificador
    for (let i = 0; i < 12; i++) {
      soma += parseInt(cnpj.charAt(i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(cnpj.charAt(12))) return false;

    // Segundo dígito verificador
    soma = 0;
    pos = 6;
    for (let i = 0; i < 13; i++) {
      soma += parseInt(cnpj.charAt(i)) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado === parseInt(cnpj.charAt(13));
  }

  equals(other: CNPJ): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
