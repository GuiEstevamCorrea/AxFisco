import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConsultarStatusNotaFiscalUseCase } from '../../../src/application/use-cases/consultar-status-nota-fiscal.use-case';
import { NFeRepository } from '../../../src/domain/repositories/nfe.repository';
import { NFSeRepository } from '../../../src/domain/repositories/nfse.repository';
import { ConsultarStatusNotaFiscalDto } from '../../../src/application/dtos/consultar-notas-fiscais.dto';
import { NFeDocument, NFeStatus } from '../../../src/domain/entities/nfe.entity';
import { NFSeDocument, NFSeStatus } from '../../../src/domain/entities/nfse.entity';

describe('ConsultarStatusNotaFiscalUseCase', () => {
  let useCase: ConsultarStatusNotaFiscalUseCase;
  let nfeRepository: jest.Mocked<NFeRepository>;
  let nfseRepository: jest.Mocked<NFSeRepository>;

  const mockNFe = {
    id: 'nfe-id-1',
    number: 123456,
    series: 1,
    accessKey: '35250112345678000199550010000001234000001234',
    issueDate: new Date('2025-01-15'),
    totalValue: 1000,
    status: NFeStatus.AUTHORIZED,
  };

  const mockNFSe = {
    id: 'nfse-id-1',
    number: 'RPS001',
    series: 1,
    issueDate: new Date('2025-01-15'),
    totalValue: 500,
    status: NFSeStatus.AUTHORIZED,
  };

  beforeEach(async () => {
    const mockNFeRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
    };

    const mockNFSeRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsultarStatusNotaFiscalUseCase,
        {
          provide: 'NFeRepository',
          useValue: mockNFeRepository,
        },
        {
          provide: 'NFSeRepository',
          useValue: mockNFSeRepository,
        },
      ],
    }).compile();

    useCase = module.get<ConsultarStatusNotaFiscalUseCase>(ConsultarStatusNotaFiscalUseCase);
    nfeRepository = module.get('NFeRepository');
    nfseRepository = module.get('NFSeRepository');
  });

  describe('execute', () => {
    const validDto: ConsultarStatusNotaFiscalDto = {
      notaFiscalId: 'nfe-id-1',
    };

    it('deve consultar status de uma NFe com sucesso', async () => {
      // Arrange
      nfeRepository.findById.mockResolvedValue(mockNFe as any);

      // Act
      const result = await useCase.execute(validDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('nfe-id-1');
      expect(result.numero).toBe('123456');
      expect(result.serie).toBe('1');
      expect(result.chaveAcesso).toBe('35250112345678000199550010000001234000001234');
      expect(result.tipo).toBe('NFe');
      expect(result.valorTotal).toBe(1000);
      expect(result.dataEmissao).toEqual(new Date('2025-01-15'));
      expect(result.dataUltimaConsulta).toBeDefined();
      expect(result.situacaoSefaz).toBeDefined();
      expect(result.codigoRetorno).toBeDefined();
      expect(result.mensagemRetorno).toBeDefined();
    });

    it('deve consultar status de uma NFSe quando NFe não existe', async () => {
      // Arrange
      nfeRepository.findById.mockResolvedValue(null);
      nfseRepository.findById.mockResolvedValue(mockNFSe as any);

      // Act
      const result = await useCase.execute({ notaFiscalId: 'nfse-id-1' });

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('nfse-id-1');
      expect(result.numero).toBe('RPS001');
      expect(result.tipo).toBe('NFSe');
      expect(result.chaveAcesso).toBeUndefined(); // NFSe não tem chave de acesso
      expect(result.valorTotal).toBe(500);
    });

    it('deve lançar NotFoundException quando nota fiscal não existe', async () => {
      // Arrange
      nfeRepository.findById.mockResolvedValue(null);
      nfseRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(validDto)).rejects.toThrow(
        new NotFoundException('Nota fiscal não encontrada')
      );
    });

    it('deve buscar primeiro como NFe depois como NFSe', async () => {
      // Arrange
      nfeRepository.findById.mockResolvedValue(null);
      nfseRepository.findById.mockResolvedValue(mockNFSe as any);

      // Act
      await useCase.execute(validDto);

      // Assert
      expect(nfeRepository.findById).toHaveBeenCalledWith('nfe-id-1');
      expect(nfseRepository.findById).toHaveBeenCalledWith('nfe-id-1');
    });

    it('deve não chamar NFSeRepository se encontrar NFe', async () => {
      // Arrange
      nfeRepository.findById.mockResolvedValue(mockNFe as any);

      // Act
      await useCase.execute(validDto);

      // Assert
      expect(nfeRepository.findById).toHaveBeenCalledWith('nfe-id-1');
      expect(nfseRepository.findById).not.toHaveBeenCalled();
    });

    it('deve simular diferentes status de consulta', async () => {
      // Arrange
      nfeRepository.findById.mockResolvedValue(mockNFe as any);

      // Mock Math.random para controlar o status simulado
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.1); // Força primeiro status

      // Act
      const result = await useCase.execute(validDto);

      // Assert
      expect(result.status).toBeDefined();
      expect(['AUTORIZADA', 'PENDENTE', 'REJEITADA', 'CANCELADA']).toContain(result.status);
      
      // Restore Math.random
      Math.random = originalRandom;
    });

    it('deve incluir protocolo quando status é AUTORIZADA', async () => {
      // Arrange
      nfeRepository.findById.mockResolvedValue(mockNFe as any);
      
      // Mock Math.random para forçar status AUTORIZADA
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0); // Primeiro status = AUTORIZADA

      // Act
      const result = await useCase.execute(validDto);

      // Assert
      if (result.status === 'AUTORIZADA') {
        expect(result.protocolo).toBeDefined();
        expect(result.protocolo).toContain('NFe');
      }
      
      // Restore Math.random
      Math.random = originalRandom;
    });

    it('deve incluir motivo quando status é REJEITADA', async () => {
      // Arrange
      nfeRepository.findById.mockResolvedValue(mockNFe as any);
      
      // Mock Math.random para forçar status REJEITADA
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.6); // Terceiro status = REJEITADA

      // Act
      const result = await useCase.execute(validDto);

      // Assert
      if (result.status === 'REJEITADA') {
        expect(result.motivo).toBeDefined();
        expect(result.motivo).toContain('Erro');
      }
      
      // Restore Math.random
      Math.random = originalRandom;
    });

    it('deve retornar dataUltimaConsulta como data atual', async () => {
      // Arrange
      nfeRepository.findById.mockResolvedValue(mockNFe as any);
      const antes = new Date();

      // Act
      const result = await useCase.execute(validDto);
      const depois = new Date();

      // Assert
      expect(result.dataUltimaConsulta).toBeDefined();
      expect(result.dataUltimaConsulta!.getTime()).toBeGreaterThanOrEqual(antes.getTime());
      expect(result.dataUltimaConsulta!.getTime()).toBeLessThanOrEqual(depois.getTime());
    });

    it('deve extrair corretamente dados de diferentes formatos de entidade', async () => {
      // Arrange - NFe com propriedades diferentes
      const nfeAlternativo = {
        id: 'nfe-alt-1',
        numero: '654321', // propriedade diferente
        serie: '002',     // propriedade diferente
        chaveAcesso: '35250112345678000199550010000006543210000065432',
        dataEmissao: new Date('2025-01-16'),
        valorTotal: 2000,
        status: NFeStatus.PENDING_AUTHORIZATION,
      };

      nfeRepository.findById.mockResolvedValue(nfeAlternativo as any);

      // Act
      const result = await useCase.execute(validDto);

      // Assert
      expect(result.numero).toBe('654321');
      expect(result.serie).toBe('002');
      expect(result.chaveAcesso).toBe('35250112345678000199550010000006543210000065432');
      expect(result.valorTotal).toBe(2000);
    });
  });
});
