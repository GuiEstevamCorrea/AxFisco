import { CNPJ } from '../../src/domain/value-objects/cnpj.vo';

describe('CNPJ Value Object', () => {
  describe('Valid CNPJ', () => {
    it('should accept valid CNPJ with formatting', () => {
      const cnpj = new CNPJ('11.222.333/0001-81');
      expect(cnpj.value).toBe('11222333000181');
      expect(cnpj.formatted).toBe('11.222.333/0001-81');
    });

    it('should accept valid CNPJ without formatting', () => {
      const cnpj = new CNPJ('11222333000181');
      expect(cnpj.value).toBe('11222333000181');
      expect(cnpj.formatted).toBe('11.222.333/0001-81');
    });
  });

  describe('Invalid CNPJ', () => {
    it('should throw error for invalid CNPJ', () => {
      expect(() => new CNPJ('11.222.333/0001-82')).toThrow('CNPJ inválido');
    });

    it('should throw error for CNPJ with all same digits', () => {
      expect(() => new CNPJ('11111111111111')).toThrow('CNPJ inválido');
    });

    it('should throw error for CNPJ with wrong length', () => {
      expect(() => new CNPJ('1122233300018')).toThrow('CNPJ inválido');
    });
  });

  describe('Equality', () => {
    it('should be equal when CNPJs are the same', () => {
      const cnpj1 = new CNPJ('11.222.333/0001-81');
      const cnpj2 = new CNPJ('11222333000181');
      expect(cnpj1.equals(cnpj2)).toBe(true);
    });

    it('should not be equal when CNPJs are different', () => {
      const cnpj1 = new CNPJ('11.222.333/0001-81');
      const cnpj2 = new CNPJ('11.444.777/0001-61'); // Valid CNPJ
      expect(cnpj1.equals(cnpj2)).toBe(false);
    });
  });
});
