import { NotaFiscal, TipoNotaFiscal, StatusNotaFiscal, FinalidadeNF } from '../../src/domain/entities/nota-fiscal.entity';

describe('NotaFiscal', () => {
  const criarNotaFiscalValida = () => {
    return new NotaFiscal(
      1, // numero
      1, // serie
      TipoNotaFiscal.NFE,
      'empresa-id-123',
      'cliente-id-456',
      1000.00, // valorTotal
      150.00, // valorTributos
      FinalidadeNF.NORMAL,
      'Observações de teste',
      'Informações adicionais de teste'
    );
  };

  describe('Construção', () => {
    it('deve criar nota fiscal com dados válidos', () => {
      expect(() => criarNotaFiscalValida()).not.toThrow();
    });

    it('deve inicializar com status RASCUNHO', () => {
      const nota = criarNotaFiscalValida();
      expect(nota.status).toBe(StatusNotaFiscal.RASCUNHO);
    });

    it('deve definir data de emissão atual', () => {
      const antes = new Date();
      const nota = criarNotaFiscalValida();
      const depois = new Date();

      expect(nota.dataEmissao.getTime()).toBeGreaterThanOrEqual(antes.getTime());
      expect(nota.dataEmissao.getTime()).toBeLessThanOrEqual(depois.getTime());
    });

    it('deve rejeitar número zero ou negativo', () => {
      expect(() => {
        new NotaFiscal(0, 1, TipoNotaFiscal.NFE, 'empresa-id', 'cliente-id', 1000, 150);
      }).toThrow('Número da nota fiscal deve ser maior que zero');

      expect(() => {
        new NotaFiscal(-1, 1, TipoNotaFiscal.NFE, 'empresa-id', 'cliente-id', 1000, 150);
      }).toThrow('Número da nota fiscal deve ser maior que zero');
    });

    it('deve rejeitar série zero ou negativa', () => {
      expect(() => {
        new NotaFiscal(1, 0, TipoNotaFiscal.NFE, 'empresa-id', 'cliente-id', 1000, 150);
      }).toThrow('Série da nota fiscal deve ser maior que zero');

      expect(() => {
        new NotaFiscal(1, -1, TipoNotaFiscal.NFE, 'empresa-id', 'cliente-id', 1000, 150);
      }).toThrow('Série da nota fiscal deve ser maior que zero');
    });

    it('deve rejeitar empresa ID vazio', () => {
      expect(() => {
        new NotaFiscal(1, 1, TipoNotaFiscal.NFE, '', 'cliente-id', 1000, 150);
      }).toThrow('ID da empresa é obrigatório');

      expect(() => {
        new NotaFiscal(1, 1, TipoNotaFiscal.NFE, '   ', 'cliente-id', 1000, 150);
      }).toThrow('ID da empresa é obrigatório');
    });

    it('deve rejeitar cliente ID vazio', () => {
      expect(() => {
        new NotaFiscal(1, 1, TipoNotaFiscal.NFE, 'empresa-id', '', 1000, 150);
      }).toThrow('ID do cliente é obrigatório');
    });

    it('deve rejeitar valor total negativo', () => {
      expect(() => {
        new NotaFiscal(1, 1, TipoNotaFiscal.NFE, 'empresa-id', 'cliente-id', -100, 150);
      }).toThrow('Valor total não pode ser negativo');
    });

    it('deve rejeitar valor de tributos negativo', () => {
      expect(() => {
        new NotaFiscal(1, 1, TipoNotaFiscal.NFE, 'empresa-id', 'cliente-id', 1000, -50);
      }).toThrow('Valor dos tributos não pode ser negativo');
    });

    it('deve rejeitar valor de tributos maior que valor total', () => {
      expect(() => {
        new NotaFiscal(1, 1, TipoNotaFiscal.NFE, 'empresa-id', 'cliente-id', 1000, 1500);
      }).toThrow('Valor dos tributos não pode ser maior que o valor total');
    });
  });

  describe('Gerenciamento de itens', () => {
    it('deve adicionar item com sucesso', () => {
      const nota = criarNotaFiscalValida();
      nota.adicionarItem('item-123');
      
      expect(nota.itens).toContain('item-123');
      expect(nota.itens.length).toBe(1);
    });

    it('deve rejeitar item duplicado', () => {
      const nota = criarNotaFiscalValida();
      nota.adicionarItem('item-123');
      
      expect(() => {
        nota.adicionarItem('item-123');
      }).toThrow('Item já adicionado à nota fiscal');
    });

    it('deve remover item com sucesso', () => {
      const nota = criarNotaFiscalValida();
      nota.adicionarItem('item-123');
      nota.removerItem('item-123');
      
      expect(nota.itens).not.toContain('item-123');
      expect(nota.itens.length).toBe(0);
    });

    it('deve rejeitar remoção de item inexistente', () => {
      const nota = criarNotaFiscalValida();
      
      expect(() => {
        nota.removerItem('item-inexistente');
      }).toThrow('Item não encontrado na nota fiscal');
    });

    it('não deve permitir adicionar item se não estiver em rascunho', () => {
      const nota = criarNotaFiscalValida();
      nota.adicionarItem('item-123');
      nota.gerarChaveAcesso('SP', '12345678901234');
      nota.prepararParaEnvio();
      
      expect(() => {
        nota.adicionarItem('item-456');
      }).toThrow('Não é possível adicionar itens a uma nota que não está em rascunho');
    });
  });

  describe('Geração de chave de acesso', () => {
    it('deve gerar chave de acesso com 44 dígitos', () => {
      const nota = criarNotaFiscalValida();
      const chave = nota.gerarChaveAcesso('SP', '12345678901234');
      
      expect(chave).toHaveLength(44);
      expect(/^\d{44}$/.test(chave)).toBe(true);
    });

    it('deve incluir UF no início da chave', () => {
      const nota = criarNotaFiscalValida();
      const chave = nota.gerarChaveAcesso('SP', '12345678901234');
      
      expect(chave.substring(0, 2)).toBe('35'); // Código de SP
    });

    it('deve rejeitar geração se não estiver em rascunho', () => {
      const nota = criarNotaFiscalValida();
      nota.adicionarItem('item-123');
      nota.gerarChaveAcesso('SP', '12345678901234');
      nota.prepararParaEnvio();
      
      expect(() => {
        nota.gerarChaveAcesso('SP', '12345678901234');
      }).toThrow('Chave de acesso só pode ser gerada para notas em rascunho');
    });

    it('deve rejeitar UF inválida', () => {
      const nota = criarNotaFiscalValida();
      
      expect(() => {
        nota.gerarChaveAcesso('XX', '12345678901234');
      }).toThrow('UF inválida: XX');
    });
  });

  describe('Fluxo de status', () => {
    it('deve preparar para envio com sucesso', () => {
      const nota = criarNotaFiscalValida();
      nota.adicionarItem('item-123');
      nota.gerarChaveAcesso('SP', '12345678901234');
      
      nota.prepararParaEnvio();
      
      expect(nota.status).toBe(StatusNotaFiscal.AGUARDANDO_ENVIO);
    });

    it('deve rejeitar preparação sem itens', () => {
      const nota = criarNotaFiscalValida();
      nota.gerarChaveAcesso('SP', '12345678901234');
      
      expect(() => {
        nota.prepararParaEnvio();
      }).toThrow('Nota fiscal deve ter pelo menos um item');
    });

    it('deve rejeitar preparação sem chave de acesso', () => {
      const nota = criarNotaFiscalValida();
      nota.adicionarItem('item-123');
      
      expect(() => {
        nota.prepararParaEnvio();
      }).toThrow('Chave de acesso deve ser gerada antes do envio');
    });

    it('deve marcar como enviada', () => {
      const nota = criarNotaFiscalValida();
      nota.adicionarItem('item-123');
      nota.gerarChaveAcesso('SP', '12345678901234');
      nota.prepararParaEnvio();
      
      nota.marcarComoEnviada();
      
      expect(nota.status).toBe(StatusNotaFiscal.ENVIADA);
    });

    it('deve autorizar nota enviada', () => {
      const nota = criarNotaFiscalValida();
      nota.adicionarItem('item-123');
      nota.gerarChaveAcesso('SP', '12345678901234');
      nota.prepararParaEnvio();
      nota.marcarComoEnviada();
      
      const protocolo = 'PROT123456789';
      const xml = '<xml>conteudo</xml>';
      
      nota.autorizar(protocolo, xml);
      
      expect(nota.status).toBe(StatusNotaFiscal.AUTORIZADA);
      expect(nota.protocoloAutorizacao).toBe(protocolo);
      expect(nota.xmlAssinado).toBe(xml);
    });

    it('deve rejeitar nota enviada', () => {
      const nota = criarNotaFiscalValida();
      nota.adicionarItem('item-123');
      nota.gerarChaveAcesso('SP', '12345678901234');
      nota.prepararParaEnvio();
      nota.marcarComoEnviada();
      
      const motivo = 'CNPJ do destinatário inválido';
      
      nota.rejeitar(motivo);
      
      expect(nota.status).toBe(StatusNotaFiscal.REJEITADA);
      expect(nota.motivoRejeicao).toBe(motivo);
    });

    it('deve cancelar nota autorizada', () => {
      const nota = criarNotaFiscalValida();
      nota.adicionarItem('item-123');
      nota.gerarChaveAcesso('SP', '12345678901234');
      nota.prepararParaEnvio();
      nota.marcarComoEnviada();
      nota.autorizar('PROT123', '<xml>conteudo</xml>');
      
      const motivo = 'Cancelamento a pedido do cliente';
      
      nota.cancelar(motivo);
      
      expect(nota.status).toBe(StatusNotaFiscal.CANCELADA);
      expect(nota.motivoRejeicao).toBe(motivo);
    });
  });

  describe('Métodos de consulta', () => {
    it('deve identificar se pode ser editada', () => {
      const nota = criarNotaFiscalValida();
      expect(nota.podeSerEditada()).toBe(true);
      
      nota.adicionarItem('item-123');
      nota.gerarChaveAcesso('SP', '12345678901234');
      nota.prepararParaEnvio();
      expect(nota.podeSerEditada()).toBe(false);
    });

    it('deve identificar se está autorizada', () => {
      const nota = criarNotaFiscalValida();
      expect(nota.estaAutorizada()).toBe(false);
      
      // Simular fluxo completo
      nota.adicionarItem('item-123');
      nota.gerarChaveAcesso('SP', '12345678901234');
      nota.prepararParaEnvio();
      nota.marcarComoEnviada();
      nota.autorizar('PROT123', '<xml>conteudo</xml>');
      
      expect(nota.estaAutorizada()).toBe(true);
    });

    it('deve identificar se está cancelada', () => {
      const nota = criarNotaFiscalValida();
      expect(nota.estaCancelada()).toBe(false);
      
      // Simular fluxo completo até cancelamento
      nota.adicionarItem('item-123');
      nota.gerarChaveAcesso('SP', '12345678901234');
      nota.prepararParaEnvio();
      nota.marcarComoEnviada();
      nota.autorizar('PROT123', '<xml>conteudo</xml>');
      nota.cancelar('Motivo do cancelamento');
      
      expect(nota.estaCancelada()).toBe(true);
    });
  });

  describe('Definir data de vencimento', () => {
    it('deve definir data de vencimento futura', () => {
      const nota = criarNotaFiscalValida();
      const vencimento = new Date();
      vencimento.setDate(vencimento.getDate() + 30);
      
      nota.definirDataVencimento(vencimento);
      
      expect(nota.dataVencimento).toEqual(vencimento);
    });

    it('deve rejeitar data de vencimento passada', () => {
      const nota = criarNotaFiscalValida();
      const vencimento = new Date();
      vencimento.setDate(vencimento.getDate() - 1);
      
      expect(() => {
        nota.definirDataVencimento(vencimento);
      }).toThrow('Data de vencimento deve ser posterior à data de emissão');
    });
  });
});
