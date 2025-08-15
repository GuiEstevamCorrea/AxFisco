export class Address {
  constructor(
    private readonly _street: string,
    private readonly _number: string,
    private readonly _complement: string,
    private readonly _neighborhood: string,
    private readonly _city: string,
    private readonly _state: string,
    private readonly _zipCode: string,
    private readonly _country: string = 'Brasil'
  ) {
    this.validate();
  }

  get street(): string { return this._street; }
  get number(): string { return this._number; }
  get complement(): string { return this._complement; }
  get neighborhood(): string { return this._neighborhood; }
  get city(): string { return this._city; }
  get state(): string { return this._state; }
  get zipCode(): string { return this._zipCode; }
  get country(): string { return this._country; }

  get formattedZipCode(): string {
    const clean = this._zipCode.replace(/\D/g, '');
    return clean.replace(/^(\d{5})(\d{3})$/, '$1-$2');
  }

  get fullAddress(): string {
    const complement = this._complement ? `, ${this._complement}` : '';
    return `${this._street}, ${this._number}${complement}, ${this._neighborhood}, ${this._city}/${this._state}, ${this.formattedZipCode}`;
  }

  private validate(): void {
    if (!this._street?.trim()) {
      throw new Error('Logradouro é obrigatório');
    }
    if (!this._number?.trim()) {
      throw new Error('Número é obrigatório');
    }
    if (!this._neighborhood?.trim()) {
      throw new Error('Bairro é obrigatório');
    }
    if (!this._city?.trim()) {
      throw new Error('Cidade é obrigatória');
    }
    if (!this._state?.trim()) {
      throw new Error('Estado é obrigatório');
    }
    if (!this.isValidZipCode(this._zipCode)) {
      throw new Error('CEP inválido');
    }
  }

  private isValidZipCode(zipCode: string): boolean {
    const clean = zipCode.replace(/\D/g, '');
    return clean.length === 8 && /^\d{8}$/.test(clean);
  }

  equals(other: Address): boolean {
    return (
      this._street === other._street &&
      this._number === other._number &&
      this._complement === other._complement &&
      this._neighborhood === other._neighborhood &&
      this._city === other._city &&
      this._state === other._state &&
      this._zipCode === other._zipCode &&
      this._country === other._country
    );
  }
}
