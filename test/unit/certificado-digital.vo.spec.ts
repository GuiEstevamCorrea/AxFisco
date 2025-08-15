import { CertificadoDigital } from '../../src/domain/value-objects/certificado-digital.vo';

describe('CertificadoDigital', () => {
  const criarCertificadoValido = () => {
    const arquivo = Buffer.from('certificado-teste-conteudo');
    const senha = 'senha123';
    const validade = new Date();
    validade.setFullYear(validade.getFullYear() + 1); // 1 ano no futuro
    const proprietario = '12345678901234 - Empresa Teste';
    const numeroCertificado = 'CERT123456789';

    return new CertificadoDigital(arquivo, senha, validade, proprietario, numeroCertificado);
  };

  describe('Construção', () => {
    it('deve criar certificado com dados válidos', () => {
      expect(() => criarCertificadoValido()).not.toThrow();
    });

    it('deve rejeitar arquivo vazio', () => {
      const arquivo = Buffer.alloc(0);
      const senha = 'senha123';
      const validade = new Date();
      validade.setFullYear(validade.getFullYear() + 1);
      const proprietario = 'Empresa Teste';
      const numeroCertificado = 'CERT123456789';

      expect(() => {
        new CertificadoDigital(arquivo, senha, validade, proprietario, numeroCertificado);
      }).toThrow('Arquivo do certificado é obrigatório');
    });

    it('deve rejeitar senha vazia', () => {
      const arquivo = Buffer.from('certificado-teste');
      const senha = '';
      const validade = new Date();
      validade.setFullYear(validade.getFullYear() + 1);
      const proprietario = 'Empresa Teste';
      const numeroCertificado = 'CERT123456789';

      expect(() => {
        new CertificadoDigital(arquivo, senha, validade, proprietario, numeroCertificado);
      }).toThrow('Senha do certificado é obrigatória');
    });

    it('deve rejeitar validade passada', () => {
      const arquivo = Buffer.from('certificado-teste');
      const senha = 'senha123';
      const validade = new Date();
      validade.setFullYear(validade.getFullYear() - 1); // 1 ano no passado
      const proprietario = 'Empresa Teste';
      const numeroCertificado = 'CERT123456789';

      expect(() => {
        new CertificadoDigital(arquivo, senha, validade, proprietario, numeroCertificado);
      }).toThrow('Certificado deve ter validade futura');
    });

    it('deve rejeitar proprietário vazio', () => {
      const arquivo = Buffer.from('certificado-teste');
      const senha = 'senha123';
      const validade = new Date();
      validade.setFullYear(validade.getFullYear() + 1);
      const proprietario = '';
      const numeroCertificado = 'CERT123456789';

      expect(() => {
        new CertificadoDigital(arquivo, senha, validade, proprietario, numeroCertificado);
      }).toThrow('Proprietário do certificado é obrigatório');
    });

    it('deve rejeitar número do certificado vazio', () => {
      const arquivo = Buffer.from('certificado-teste');
      const senha = 'senha123';
      const validade = new Date();
      validade.setFullYear(validade.getFullYear() + 1);
      const proprietario = 'Empresa Teste';
      const numeroCertificado = '';

      expect(() => {
        new CertificadoDigital(arquivo, senha, validade, proprietario, numeroCertificado);
      }).toThrow('Número do certificado é obrigatório');
    });
  });

  describe('Métodos de negócio', () => {
    it('deve retornar true para certificado válido', () => {
      const certificado = criarCertificadoValido();
      expect(certificado.estaValido()).toBe(true);
    });

    it('deve retornar false para certificado vencido', () => {
      const arquivo = Buffer.from('certificado-teste');
      const senha = 'senha123';
      const validade = new Date();
      validade.setTime(validade.getTime() - 1000); // 1 segundo atrás
      const proprietario = 'Empresa Teste';
      const numeroCertificado = 'CERT123456789';

      // Criar manualmente para simular certificado que venceu após criação
      const certificado = Object.create(CertificadoDigital.prototype);
      certificado._arquivo = arquivo;
      certificado._senha = senha;
      certificado._validade = validade;
      certificado._proprietario = proprietario;
      certificado._numeroCertificado = numeroCertificado;

      expect(certificado.estaValido()).toBe(false);
    });

    it('deve validar proprietário corretamente', () => {
      const certificado = criarCertificadoValido();
      expect(certificado.validarProprietario('12345678901234')).toBe(true);
      expect(certificado.validarProprietario('12.345.678/9012-34')).toBe(true);
      expect(certificado.validarProprietario('98765432109876')).toBe(false);
    });

    it('deve calcular dias para vencimento', () => {
      const arquivo = Buffer.from('certificado-teste');
      const senha = 'senha123';
      const validade = new Date();
      validade.setDate(validade.getDate() + 30); // 30 dias no futuro
      const proprietario = 'Empresa Teste';
      const numeroCertificado = 'CERT123456789';

      const certificado = new CertificadoDigital(arquivo, senha, validade, proprietario, numeroCertificado);
      const dias = certificado.diasParaVencimento();
      
      expect(dias).toBeGreaterThanOrEqual(29);
      expect(dias).toBeLessThanOrEqual(30);
    });

    it('deve comparar certificados corretamente', () => {
      const certificado1 = criarCertificadoValido();
      const certificado2 = criarCertificadoValido();
      
      // Mesmo número de certificado
      expect(certificado1.equals(certificado2)).toBe(true);
      
      // Número diferente
      const arquivo = Buffer.from('certificado-teste');
      const senha = 'senha123';
      const validade = new Date();
      validade.setFullYear(validade.getFullYear() + 1);
      const proprietario = 'Empresa Teste';
      const numeroCertificado = 'CERT987654321'; // Diferente

      const certificado3 = new CertificadoDigital(arquivo, senha, validade, proprietario, numeroCertificado);
      expect(certificado1.equals(certificado3)).toBe(false);
    });
  });

  describe('Getters', () => {
    it('deve retornar propriedades corretamente', () => {
      const arquivo = Buffer.from('certificado-teste');
      const senha = 'senha123';
      const validade = new Date();
      validade.setFullYear(validade.getFullYear() + 1);
      const proprietario = 'Empresa Teste';
      const numeroCertificado = 'CERT123456789';

      const certificado = new CertificadoDigital(arquivo, senha, validade, proprietario, numeroCertificado);

      expect(certificado.arquivo).toEqual(arquivo);
      expect(certificado.senha).toBe(senha);
      expect(certificado.validade).toEqual(validade);
      expect(certificado.proprietario).toBe(proprietario);
      expect(certificado.numeroCertificado).toBe(numeroCertificado);
    });
  });
});
