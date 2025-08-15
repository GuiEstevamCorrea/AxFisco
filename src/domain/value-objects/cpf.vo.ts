export class CPF {
  private readonly _value: string;

  constructor(value: string) {
    const cleanValue = this.clean(value);
    
    if (!this.isValid(cleanValue)) {
      throw new Error('CPF inválido');
    }
    
    this._value = cleanValue;
  }

  get value(): string {
    return this._value;
  }

  get formatted(): string {
    return this._value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }

  private clean(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }

  private isValid(cpf: string): boolean {
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false; // Todos os dígitos iguais

    let soma = 0;
    
    // Primeiro dígito verificador
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    // Segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf.charAt(10));
  }

  equals(other: CPF): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
