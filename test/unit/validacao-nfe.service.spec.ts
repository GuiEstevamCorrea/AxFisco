import { ValidacaoNFeService, IResultadoValidacao } from '../../src/domain/services/validacao-nfe.service';
import { NotaFiscal, TipoNotaFiscal, StatusNotaFiscal, FinalidadeNF } from '../../src/domain/entities/nota-fiscal.entity';
import { ItemNotaFiscal, TipoItem, OrigemMercadoria } from '../../src/domain/entities/item-nota-fiscal.entity';
import { Company, TaxRegime, TipoAmbiente } from '../../src/domain/entities/company.entity';
import { Customer, CustomerType, IndicadorIE } from '../../src/domain/entities/customer.entity';
import { CNPJ } from '../../src/domain/value-objects/cnpj.vo';
import { CPF } from '../../src/domain/value-objects/cpf.vo';
import { Address } from '../../src/domain/value-objects/address.vo';

describe('ValidacaoNFeService', () => {
  const criarEmpresaValida = (): Company => {
    const cnpj = new CNPJ('11222333000181');
    const endereco = new Address(
      'Rua Teste',
      '123',
      'Sala 1',
      'Centro',
      'São Paulo',
      'SP',
      '01234567',
      'Brasil',
      '3550308'
    );

    return new Company(
      'Empresa Teste Ltda',
      'Empresa Teste',
      cnpj,
      '123456789',
      endereco,
      'teste@empresa.com',
      '11999999999',
      TaxRegime.LUCRO_PRESUMIDO,
      '987654321'
    );
  };

  const criarClienteValido = (): Customer => {
    const cnpj = new CNPJ('11222333000181');
    const endereco = new Address(
      'Rua Cliente',
      '456',
      '',
      'Vila Test',
      'São Paulo',
      'SP',
      '01234567',
      'Brasil'
    );

    return new Customer(
      'Cliente Teste Ltda',
      'cliente@teste.com',
      cnpj,
      CustomerType.LEGAL_ENTITY,
      IndicadorIE.CONTRIBUINTE,
      '11888888888',
      endereco,
      '987654321'
    );
  };

  const criarNotaFiscalValida = (): NotaFiscal => {
    return new NotaFiscal(
      1,
      1,
      TipoNotaFiscal.NFE,
      'empresa-123',
      'cliente-456',
      1000.00,
      180.00,
      FinalidadeNF.NORMAL
    );
  };

  const criarItemValido = (): ItemNotaFiscal => {
    return new ItemNotaFiscal(
      'nota-123',
      'produto-456',
      1,
      TipoItem.PRODUTO,
      'PROD001',
      'Produto Teste',
      '12345678',
      '5101',
      'UN',
      10,
      100.00,
      OrigemMercadoria.NACIONAL
    );
  };

  describe('validarDadosObrigatorios', () => {
    it('deve validar dados corretos', () => {
      const empresa = criarEmpresaValida();
      const cliente = criarClienteValido();
      const nota = criarNotaFiscalValida();
      nota.adicionarItem('item-123');

      const resultado = ValidacaoNFeService.validarDadosObrigatorios(nota, empresa, cliente);

      expect(resultado.valida).toBe(true);
      expect(resultado.erros).toHaveLength(0);
    });

    it('deve rejeitar empresa inativa', () => {
      const empresa = criarEmpresaValida();
      empresa.deactivate();
      const cliente = criarClienteValido();
      const nota = criarNotaFiscalValida();

      const resultado = ValidacaoNFeService.validarDadosObrigatorios(nota, empresa, cliente);

      expect(resultado.valida).toBe(false);
      expect(resultado.erros).toContain('Empresa deve estar ativa para emissão de NF-e');
    });

    it('deve rejeitar cliente inativo', () => {
      const empresa = criarEmpresaValida();
      const cliente = criarClienteValido();
      cliente.deactivate();
      const nota = criarNotaFiscalValida();

      const resultado = ValidacaoNFeService.validarDadosObrigatorios(nota, empresa, cliente);

      expect(resultado.valida).toBe(false);
      expect(resultado.erros).toContain('Cliente deve estar ativo');
    });

    it('deve rejeitar nota sem itens', () => {
      const empresa = criarEmpresaValida();
      const cliente = criarClienteValido();
      const nota = criarNotaFiscalValida();

      const resultado = ValidacaoNFeService.validarDadosObrigatorios(nota, empresa, cliente);

      expect(resultado.valida).toBe(false);
      expect(resultado.erros).toContain('Nota fiscal deve ter pelo menos um item');
    });

    it('deve rejeitar nota com valor zero', () => {
      const empresa = criarEmpresaValida();
      const cliente = criarClienteValido();
      const nota = new NotaFiscal(
        1, 1, TipoNotaFiscal.NFE, 'empresa-123', 'cliente-456', 0, 0
      );
      nota.adicionarItem('item-123');

      const resultado = ValidacaoNFeService.validarDadosObrigatorios(nota, empresa, cliente);

      expect(resultado.valida).toBe(false);
      expect(resultado.erros).toContain('Valor total da nota fiscal deve ser maior que zero');
    });
  });

  describe('validarItens', () => {
    it('deve validar itens corretos', () => {
      const itens = [criarItemValido()];

      const resultado = ValidacaoNFeService.validarItens(itens);

      expect(resultado.valida).toBe(true);
      expect(resultado.erros).toHaveLength(0);
    });

    it('deve rejeitar lista vazia de itens', () => {
      const resultado = ValidacaoNFeService.validarItens([]);

      expect(resultado.valida).toBe(false);
      expect(resultado.erros).toContain('Nota fiscal deve ter pelo menos um item');
    });

    it('deve rejeitar mais de 990 itens', () => {
      const itens = Array.from({ length: 991 }, (_, i) => {
        const item = criarItemValido();
        // Simular propriedade numeroItem
        (item as any)._numeroItem = i + 1;
        return item;
      });

      const resultado = ValidacaoNFeService.validarItens(itens);

      expect(resultado.valida).toBe(false);
      expect(resultado.erros).toContain('Nota fiscal não pode ter mais de 990 itens');
    });

    it('deve validar numeração sequencial', () => {
      const item1 = criarItemValido();
      const item2 = new ItemNotaFiscal(
        'nota-123', 'produto-789', 3, TipoItem.PRODUTO, 'PROD002', 
        'Produto 2', '87654321', '5102', 'KG', 5, 200.00
      );

      const resultado = ValidacaoNFeService.validarItens([item1, item2]);

      expect(resultado.valida).toBe(false);
      expect(resultado.erros.some(erro => erro.includes('Numeração dos itens deve ser sequencial'))).toBe(true);
    });
  });

  describe('validarLimites', () => {
    it('deve aprovar valores normais', () => {
      const nota = criarNotaFiscalValida();

      const resultado = ValidacaoNFeService.validarLimites(nota);

      expect(resultado.valida).toBe(true);
    });

    it('deve rejeitar valor muito alto', () => {
      const nota = new NotaFiscal(
        1, 1, TipoNotaFiscal.NFE, 'empresa-123', 'cliente-456', 
        1000000000, 0 // Acima do limite
      );

      const resultado = ValidacaoNFeService.validarLimites(nota);

      expect(resultado.valida).toBe(false);
      expect(resultado.erros.some(erro => erro.includes('excede o limite máximo'))).toBe(true);
    });

    it('deve avisar sobre valor alto', () => {
      const nota = new NotaFiscal(
        1, 1, TipoNotaFiscal.NFE, 'empresa-123', 'cliente-456', 
        150000, 0
      );

      const resultado = ValidacaoNFeService.validarLimites(nota);

      expect(resultado.valida).toBe(true);
      expect(resultado.avisos).toContain('Nota fiscal com valor alto - verificar se está correto');
    });

    it('deve rejeitar observações muito longas', () => {
      const nota = criarNotaFiscalValida();
      nota.atualizarObservacoes('a'.repeat(5001)); // Mais de 5000 caracteres

      const resultado = ValidacaoNFeService.validarLimites(nota);

      expect(resultado.valida).toBe(false);
      expect(resultado.erros).toContain('Observações não podem exceder 5000 caracteres');
    });
  });

  describe('validarCoerencia', () => {
    it('deve validar coerência correta', () => {
      const nota = criarNotaFiscalValida();
      const itens = [criarItemValido()];
      
      // Ajustar valores para bater
      const valorTotalItens = itens.reduce((total, item) => total + item.valorTotal, 0);
      (nota as any)._valorTotal = valorTotalItens;
      (nota as any)._valorTributos = 0;
      (itens[0] as any)._notaFiscalId = nota.id; // Corrigir ID da nota
      
      const resultado = ValidacaoNFeService.validarCoerencia(nota, itens);

      expect(resultado.valida).toBe(true);
    });

    it('deve rejeitar divergência no valor total', () => {
      const nota = criarNotaFiscalValida();
      const itens = [criarItemValido()];
      (itens[0] as any)._notaFiscalId = nota.id; // Corrigir ID da nota

      const resultado = ValidacaoNFeService.validarCoerencia(nota, itens);

      expect(resultado.valida).toBe(false);
      expect(resultado.erros.length).toBeGreaterThan(0);
      // Pode ter erro de valor total ou de tributos - ambos são válidos
      const temErroValor = resultado.erros.some(erro => 
        erro.includes('não confere') || erro.includes('valor total') || erro.includes('tributos')
      );
      expect(temErroValor).toBe(true);
    });

    it('deve rejeitar itens de outra nota', () => {
      const nota = criarNotaFiscalValida();
      const item = criarItemValido();
      (item as any)._notaFiscalId = 'outra-nota-456'; // ID diferente

      const resultado = ValidacaoNFeService.validarCoerencia(nota, [item]);

      expect(resultado.valida).toBe(false);
      expect(resultado.erros.some(erro => erro.includes('não pertencem a esta nota fiscal'))).toBe(true);
    });
  });

  describe('validarParaEnvio', () => {
    it('deve validar tudo para envio', () => {
      const empresa = criarEmpresaValida();
      const cliente = criarClienteValido();
      const nota = criarNotaFiscalValida();
      const itens = [criarItemValido()];
      
      nota.adicionarItem('item-123');
      
      // Ajustar valores para validação passar
      const valorTotalItens = itens.reduce((total, item) => total + item.valorTotal, 0);
      (nota as any)._valorTotal = valorTotalItens;
      (nota as any)._valorTributos = 0;
      (itens[0] as any)._notaFiscalId = nota.id;

      const resultado = ValidacaoNFeService.validarParaEnvio(nota, empresa, cliente, itens);

      expect(resultado.valida).toBe(true);
    });

    it('deve consolidar todos os erros', () => {
      const empresa = criarEmpresaValida();
      empresa.deactivate(); // Tornar inválida
      
      const cliente = criarClienteValido();
      cliente.deactivate(); // Tornar inválido
      
      const nota = new NotaFiscal(1, 1, TipoNotaFiscal.NFE, 'empresa-123', 'cliente-456', 0, 0); // Valor zero
      const itens: ItemNotaFiscal[] = []; // Sem itens

      const resultado = ValidacaoNFeService.validarParaEnvio(nota, empresa, cliente, itens);

      expect(resultado.valida).toBe(false);
      expect(resultado.erros.length).toBeGreaterThan(1); // Múltiplos erros
      expect(resultado.erros).toContain('Empresa deve estar ativa para emissão de NF-e');
      expect(resultado.erros).toContain('Cliente deve estar ativo');
      expect(resultado.erros).toContain('Valor total da nota fiscal deve ser maior que zero');
      expect(resultado.erros).toContain('Nota fiscal deve ter pelo menos um item');
    });
  });

  describe('validarItem', () => {
    it('deve validar item correto', () => {
      const item = criarItemValido();

      const resultado = ValidacaoNFeService.validarItem(item, 1);

      expect(resultado.valida).toBe(true);
      expect(resultado.erros).toHaveLength(0);
    });

    it('deve rejeitar número incorreto', () => {
      const item = criarItemValido();

      const resultado = ValidacaoNFeService.validarItem(item, 2); // Esperado 2, mas item tem 1

      expect(resultado.valida).toBe(false);
      expect(resultado.erros.some(erro => erro.includes('Numeração deve ser sequencial'))).toBe(true);
    });

    it('deve rejeitar quantidade zero', () => {
      const item = criarItemValido();
      item.atualizarQuantidade(1);
      (item as any)._quantidade = 0; // Forçar valor inválido

      const resultado = ValidacaoNFeService.validarItem(item, 1);

      expect(resultado.valida).toBe(false);
      expect(resultado.erros.some(erro => erro.includes('Quantidade deve ser maior que zero'))).toBe(true);
    });

    it('deve rejeitar valor unitário negativo', () => {
      const item = criarItemValido();
      (item as any)._valorUnitario = -10; // Forçar valor inválido

      const resultado = ValidacaoNFeService.validarItem(item, 1);

      expect(resultado.valida).toBe(false);
      expect(resultado.erros.some(erro => erro.includes('Valor unitário não pode ser negativo'))).toBe(true);
    });

    it('deve rejeitar desconto maior que valor bruto', () => {
      const item = criarItemValido();
      (item as any)._valorDesconto = 1500; // Maior que 10 * 100

      const resultado = ValidacaoNFeService.validarItem(item, 1);

      expect(resultado.valida).toBe(false);
      expect(resultado.erros.some(erro => erro.includes('Desconto não pode ser maior que o valor bruto'))).toBe(true);
    });
  });
});
