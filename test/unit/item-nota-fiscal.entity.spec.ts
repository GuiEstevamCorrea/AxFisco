import { ItemNotaFiscal, TipoItem, OrigemMercadoria, TributoItem } from '../../src/domain/entities/item-nota-fiscal.entity';

describe('ItemNotaFiscal', () => {
  const criarItemValido = () => {
    return new ItemNotaFiscal(
      'nota-fiscal-123',
      'produto-456',
      1,
      TipoItem.PRODUTO,
      'PROD001',
      'Produto de teste',
      '12345678',
      '5101',
      'UN',
      10,
      50.00,
      OrigemMercadoria.NACIONAL
    );
  };

  const criarTributoICMS = (): TributoItem => ({
    cst: '00',
    aliquota: 18,
    valorBase: 500.00,
    valorTributo: 90.00
  });

  describe('Construção', () => {
    it('deve criar item com dados válidos', () => {
      expect(() => criarItemValido()).not.toThrow();
    });

    it('deve calcular valor total automaticamente', () => {
      const item = criarItemValido();
      expect(item.valorTotal).toBe(500.00); // 10 * 50.00
    });

    it('deve rejeitar nota fiscal ID vazio', () => {
      expect(() => {
        new ItemNotaFiscal('', 'produto-456', 1, TipoItem.PRODUTO, 'PROD001', 'Produto teste', '12345678', '5101', 'UN', 10, 50.00);
      }).toThrow('ID da nota fiscal é obrigatório');
    });

    it('deve rejeitar produto ID vazio', () => {
      expect(() => {
        new ItemNotaFiscal('nota-123', '', 1, TipoItem.PRODUTO, 'PROD001', 'Produto teste', '12345678', '5101', 'UN', 10, 50.00);
      }).toThrow('ID do produto é obrigatório');
    });

    it('deve rejeitar número do item zero ou negativo', () => {
      expect(() => {
        new ItemNotaFiscal('nota-123', 'produto-456', 0, TipoItem.PRODUTO, 'PROD001', 'Produto teste', '12345678', '5101', 'UN', 10, 50.00);
      }).toThrow('Número do item deve ser maior que zero');
    });

    it('deve rejeitar código do produto vazio', () => {
      expect(() => {
        new ItemNotaFiscal('nota-123', 'produto-456', 1, TipoItem.PRODUTO, '', 'Produto teste', '12345678', '5101', 'UN', 10, 50.00);
      }).toThrow('Código do produto é obrigatório');
    });

    it('deve rejeitar descrição vazia', () => {
      expect(() => {
        new ItemNotaFiscal('nota-123', 'produto-456', 1, TipoItem.PRODUTO, 'PROD001', '', '12345678', '5101', 'UN', 10, 50.00);
      }).toThrow('Descrição do produto é obrigatória');
    });

    it('deve rejeitar NCM inválido', () => {
      expect(() => {
        new ItemNotaFiscal('nota-123', 'produto-456', 1, TipoItem.PRODUTO, 'PROD001', 'Produto teste', '123456', '5101', 'UN', 10, 50.00);
      }).toThrow('NCM inválido - deve ter 8 dígitos');
    });

    it('deve rejeitar CFOP inválido', () => {
      expect(() => {
        new ItemNotaFiscal('nota-123', 'produto-456', 1, TipoItem.PRODUTO, 'PROD001', 'Produto teste', '12345678', '51', 'UN', 10, 50.00);
      }).toThrow('CFOP inválido - deve ter 4 dígitos');
    });

    it('deve rejeitar quantidade zero ou negativa', () => {
      expect(() => {
        new ItemNotaFiscal('nota-123', 'produto-456', 1, TipoItem.PRODUTO, 'PROD001', 'Produto teste', '12345678', '5101', 'UN', 0, 50.00);
      }).toThrow('Quantidade deve ser maior que zero');
    });

    it('deve rejeitar valor unitário negativo', () => {
      expect(() => {
        new ItemNotaFiscal('nota-123', 'produto-456', 1, TipoItem.PRODUTO, 'PROD001', 'Produto teste', '12345678', '5101', 'UN', 10, -50.00);
      }).toThrow('Valor unitário não pode ser negativo');
    });
  });

  describe('Cálculos', () => {
    it('deve calcular valor total corretamente', () => {
      const item = criarItemValido();
      expect(item.calcularValorTotal()).toBe(500.00); // 10 * 50.00
    });

    it('deve recalcular valor total com desconto', () => {
      const item = criarItemValido();
      item.aplicarDesconto(50.00);
      
      expect(item.valorDesconto).toBe(50.00);
      expect(item.valorTotal).toBe(450.00); // 500 - 50
    });

    it('deve recalcular valor total com valores outros', () => {
      const item = criarItemValido();
      item.adicionarValorOutros(25.00);
      
      expect(item.valorOutros).toBe(25.00);
      expect(item.valorTotal).toBe(525.00); // 500 + 25
    });

    it('deve rejeitar desconto maior que valor bruto', () => {
      const item = criarItemValido();
      
      expect(() => {
        item.aplicarDesconto(600.00); // Maior que 500
      }).toThrow('Desconto não pode ser maior que o valor bruto do item');
    });

    it('deve rejeitar desconto negativo', () => {
      const item = criarItemValido();
      
      expect(() => {
        item.aplicarDesconto(-10.00);
      }).toThrow('Valor do desconto não pode ser negativo');
    });

    it('deve rejeitar valor outros negativo', () => {
      const item = criarItemValido();
      
      expect(() => {
        item.adicionarValorOutros(-10.00);
      }).toThrow('Valor outros não pode ser negativo');
    });
  });

  describe('Atualizações', () => {
    it('deve atualizar quantidade e recalcular valor total', () => {
      const item = criarItemValido();
      item.atualizarQuantidade(20);
      
      expect(item.quantidade).toBe(20);
      expect(item.valorTotal).toBe(1000.00); // 20 * 50.00
    });

    it('deve atualizar valor unitário e recalcular valor total', () => {
      const item = criarItemValido();
      item.atualizarValorUnitario(75.00);
      
      expect(item.valorUnitario).toBe(75.00);
      expect(item.valorTotal).toBe(750.00); // 10 * 75.00
    });

    it('deve rejeitar quantidade zero ou negativa na atualização', () => {
      const item = criarItemValido();
      
      expect(() => {
        item.atualizarQuantidade(0);
      }).toThrow('Quantidade deve ser maior que zero');
    });

    it('deve rejeitar valor unitário negativo na atualização', () => {
      const item = criarItemValido();
      
      expect(() => {
        item.atualizarValorUnitario(-10.00);
      }).toThrow('Valor unitário não pode ser negativo');
    });
  });

  describe('Tributos', () => {
    it('deve definir tributo ICMS', () => {
      const item = criarItemValido();
      const tributoICMS = criarTributoICMS();
      
      item.definirTributoICMS(tributoICMS);
      
      expect(item.tributos.icms).toEqual(tributoICMS);
    });

    it('deve calcular total de tributos', () => {
      const item = criarItemValido();
      const tributoICMS = criarTributoICMS();
      
      item.definirTributoICMS(tributoICMS);
      
      expect(item.calcularTotalTributos()).toBe(90.00);
    });

    it('deve calcular alíquota total de tributos', () => {
      const item = criarItemValido();
      const tributoICMS = criarTributoICMS();
      const tributoPIS: TributoItem = {
        cst: '01',
        aliquota: 1.65,
        valorBase: 500.00,
        valorTributo: 8.25
      };
      
      item.definirTributoICMS(tributoICMS);
      item.definirTributoPIS(tributoPIS);
      
      expect(item.obterAliquotaTotalTributos()).toBe(19.65); // 18 + 1.65
    });

    it('deve rejeitar tributo com CST vazio', () => {
      const item = criarItemValido();
      const tributoInvalido: TributoItem = {
        cst: '',
        aliquota: 18,
        valorBase: 500.00,
        valorTributo: 90.00
      };
      
      expect(() => {
        item.definirTributoICMS(tributoInvalido);
      }).toThrow('CST do tributo é obrigatório');
    });

    it('deve rejeitar tributo com alíquota inválida', () => {
      const item = criarItemValido();
      const tributoInvalido: TributoItem = {
        cst: '00',
        aliquota: 150, // Maior que 100
        valorBase: 500.00,
        valorTributo: 90.00
      };
      
      expect(() => {
        item.definirTributoICMS(tributoInvalido);
      }).toThrow('Alíquota deve estar entre 0 e 100');
    });

    it('deve rejeitar tributo com valor base negativo', () => {
      const item = criarItemValido();
      const tributoInvalido: TributoItem = {
        cst: '00',
        aliquota: 18,
        valorBase: -500.00,
        valorTributo: 90.00
      };
      
      expect(() => {
        item.definirTributoICMS(tributoInvalido);
      }).toThrow('Valor base do tributo não pode ser negativo');
    });
  });

  describe('Códigos adicionais', () => {
    it('deve definir código EAN válido', () => {
      const item = criarItemValido();
      const ean = '7891234567890'; // 13 dígitos
      
      item.definirCodigoEAN(ean);
      
      expect(item.codigoEAN).toBe(ean);
    });

    it('deve rejeitar código EAN inválido', () => {
      const item = criarItemValido();
      
      expect(() => {
        item.definirCodigoEAN('123'); // Muito curto
      }).toThrow('Código EAN inválido');
    });

    it('deve definir CEST válido', () => {
      const item = criarItemValido();
      const cest = '1234567';
      
      item.definirCEST(cest);
      
      expect(item.cest).toBe(cest);
    });

    it('deve rejeitar CEST inválido', () => {
      const item = criarItemValido();
      
      expect(() => {
        item.definirCEST('123'); // Muito curto
      }).toThrow('CEST inválido - deve ter 7 dígitos');
    });
  });

  describe('Métodos de consulta', () => {
    it('deve identificar se é produto', () => {
      const item = criarItemValido();
      expect(item.ehProduto()).toBe(true);
      expect(item.ehServico()).toBe(false);
    });

    it('deve identificar se é serviço', () => {
      const item = new ItemNotaFiscal(
        'nota-123',
        'servico-456',
        1,
        TipoItem.SERVICO,
        'SERV001',
        'Serviço de teste',
        '12345678',
        '5933',
        'UN',
        1,
        100.00
      );
      
      expect(item.ehServico()).toBe(true);
      expect(item.ehProduto()).toBe(false);
    });
  });

  describe('Formato NF-e', () => {
    it('deve gerar formato NF-e corretamente', () => {
      const item = criarItemValido();
      const formato = item.toNFeFormat();
      
      expect(formato).toHaveProperty('nItem', 1);
      expect(formato).toHaveProperty('prod');
      expect(formato).toHaveProperty('imposto');
      
      const prod = (formato as any).prod;
      expect(prod.cProd).toBe('PROD001');
      expect(prod.xProd).toBe('Produto de teste');
      expect(prod.NCM).toBe('12345678');
      expect(prod.CFOP).toBe('5101');
      expect(prod.qCom).toBe(10);
      expect(prod.vUnCom).toBe(50.00);
      expect(prod.vProd).toBe(500.00);
    });

    it('deve incluir código EAN ou "SEM GTIN"', () => {
      const item = criarItemValido();
      const formato = item.toNFeFormat();
      
      expect((formato as any).prod.cEAN).toBe('SEM GTIN');
      
      item.definirCodigoEAN('7891234567890');
      const formatoComEAN = item.toNFeFormat();
      
      expect((formatoComEAN as any).prod.cEAN).toBe('7891234567890');
    });
  });
});
