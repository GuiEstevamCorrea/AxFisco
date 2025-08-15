import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EmitirNotaFiscalUseCase } from '../../src/application/use-cases/emitir-nota-fiscal.use-case';
import { CompanyRepository } from '../../src/domain/repositories/company.repository';
import { CustomerRepository } from '../../src/domain/repositories/customer.repository';
import { ProductRepository } from '../../src/domain/repositories/product.repository';
import { EmitirNotaFiscalDto } from '../../src/application/dtos/emitir-nota-fiscal.dto';
import { Company } from '../../src/domain/entities/company.entity';
import { Customer } from '../../src/domain/entities/customer.entity';
import { Product } from '../../src/domain/entities/product.entity';
import { CNPJ } from '../../src/domain/value-objects/cnpj.vo';
import { CPF } from '../../src/domain/value-objects/cpf.vo';
import { Address } from '../../src/domain/value-objects/address.vo';

describe('EmitirNotaFiscalUseCase', () => {
  let useCase: EmitirNotaFiscalUseCase;
  let companyRepository: jest.Mocked<CompanyRepository>;
  let customerRepository: jest.Mocked<CustomerRepository>;
  let productRepository: jest.Mocked<ProductRepository>;

  const mockCompany = new Company(
    new CNPJ('12.345.678/0001-90'),
    'Empresa Teste Ltda',
    'Empresa de Teste',
    new Address(
      'Rua Teste, 123',
      'São Paulo',
      'SP',
      '01234-567',
      'Brasil'
    ),
    'test@empresa.com',
    '(11) 1234-5678',
    '123456789',
    'company-id-1'
  );

  const mockCustomer = new Customer(
    'João Silva',
    new CPF('123.456.789-10'),
    'PF',
    new Address(
      'Rua Cliente, 456',
      'São Paulo',
      'SP',
      '01234-567',
      'Brasil'
    ),
    'joao@teste.com',
    '(11) 9876-5432',
    'customer-id-1'
  );

  const mockProduct = new Product(
    'Produto Teste',
    'Descrição do produto teste',
    100.0,
    'UN',
    'product-id-1'
  );

  beforeEach(async () => {
    const mockCompanyRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
    };

    const mockCustomerRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
    };

    const mockProductRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmitirNotaFiscalUseCase,
        {
          provide: CompanyRepository,
          useValue: mockCompanyRepository,
        },
        {
          provide: CustomerRepository,
          useValue: mockCustomerRepository,
        },
        {
          provide: ProductRepository,
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    useCase = module.get<EmitirNotaFiscalUseCase>(EmitirNotaFiscalUseCase);
    companyRepository = module.get(CompanyRepository);
    customerRepository = module.get(CustomerRepository);
    productRepository = module.get(ProductRepository);
  });

  describe('execute', () => {
    const validDto: EmitirNotaFiscalDto = {
      companyId: 'company-id-1',
      customerId: 'customer-id-1',
      tipo: 'NFe',
      naturezaOperacao: 'Venda',
      itens: [
        {
          productId: 'product-id-1',
          descricao: 'Produto Teste',
          quantidade: 2,
          valorUnitario: 100.0,
          valorDesconto: 10.0,
          codigoNcm: '12345678',
          cfop: '5102',
        },
      ],
      observacoes: 'Observações da nota',
    };

    it('deve emitir uma NFe com sucesso', async () => {
      // Arrange
      companyRepository.findById.mockResolvedValue(mockCompany);
      customerRepository.findById.mockResolvedValue(mockCustomer);
      productRepository.findById.mockResolvedValue(mockProduct);

      // Act
      const result = await useCase.execute(validDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.tipo).toBe('NFe');
      expect(result.valorTotal).toBe(190); // (2 * 100) - 10
      expect(result.status).toBe('PENDENTE');
      expect(result.companyId).toBe('company-id-1');
      expect(result.customerId).toBe('customer-id-1');
      expect(result.chaveAcesso).toBeDefined();
      expect(result.numero).toBeDefined();
      expect(result.serie).toBe('001');
    });

    it('deve emitir uma NFSe com sucesso', async () => {
      // Arrange
      const nfseDto = { ...validDto, tipo: 'NFSe' as const };
      companyRepository.findById.mockResolvedValue(mockCompany);
      customerRepository.findById.mockResolvedValue(mockCustomer);
      productRepository.findById.mockResolvedValue(mockProduct);

      // Act
      const result = await useCase.execute(nfseDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.tipo).toBe('NFSe');
      expect(result.valorTotal).toBe(190);
      expect(result.status).toBe('PENDENTE');
      expect(result.chaveAcesso).toBeUndefined(); // NFSe não tem chave de acesso
    });

    it('deve lançar NotFoundException quando empresa não existe', async () => {
      // Arrange
      companyRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(validDto)).rejects.toThrow(
        new NotFoundException('Empresa não encontrada')
      );
    });

    it('deve lançar NotFoundException quando cliente não existe', async () => {
      // Arrange
      companyRepository.findById.mockResolvedValue(mockCompany);
      customerRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(validDto)).rejects.toThrow(
        new NotFoundException('Cliente não encontrado')
      );
    });

    it('deve lançar NotFoundException quando produto não existe', async () => {
      // Arrange
      companyRepository.findById.mockResolvedValue(mockCompany);
      customerRepository.findById.mockResolvedValue(mockCustomer);
      productRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(validDto)).rejects.toThrow(
        new NotFoundException('Produto não encontrado: product-id-1')
      );
    });

    it('deve lançar BadRequestException quando não há itens', async () => {
      // Arrange
      const dtoSemItens = { ...validDto, itens: [] };
      companyRepository.findById.mockResolvedValue(mockCompany);
      customerRepository.findById.mockResolvedValue(mockCustomer);

      // Act & Assert
      await expect(useCase.execute(dtoSemItens)).rejects.toThrow(
        new BadRequestException('Nota fiscal deve ter pelo menos um item')
      );
    });

    it('deve lançar BadRequestException quando valor total é zero ou negativo', async () => {
      // Arrange
      const dtoValorZero = {
        ...validDto,
        itens: [
          {
            ...validDto.itens[0],
            quantidade: 1,
            valorUnitario: 10,
            valorDesconto: 20, // Desconto maior que valor bruto
          },
        ],
      };
      companyRepository.findById.mockResolvedValue(mockCompany);
      customerRepository.findById.mockResolvedValue(mockCustomer);
      productRepository.findById.mockResolvedValue(mockProduct);

      // Act & Assert
      await expect(useCase.execute(dtoValorZero)).rejects.toThrow(
        new BadRequestException('Valor total da nota fiscal deve ser maior que zero')
      );
    });

    it('deve calcular corretamente o valor total com múltiplos itens', async () => {
      // Arrange
      const dtoMultiplosItens = {
        ...validDto,
        itens: [
          {
            productId: 'product-id-1',
            descricao: 'Produto 1',
            quantidade: 2,
            valorUnitario: 100.0,
            valorDesconto: 10.0,
          },
          {
            productId: 'product-id-1',
            descricao: 'Produto 2',
            quantidade: 1,
            valorUnitario: 50.0,
            valorDesconto: 5.0,
          },
        ],
      };
      companyRepository.findById.mockResolvedValue(mockCompany);
      customerRepository.findById.mockResolvedValue(mockCustomer);
      productRepository.findById.mockResolvedValue(mockProduct);

      // Act
      const result = await useCase.execute(dtoMultiplosItens);

      // Assert
      expect(result.valorTotal).toBe(235); // (2*100-10) + (1*50-5) = 190 + 45
    });

    it('deve gerar chave de acesso apenas para NFe', async () => {
      // Arrange
      companyRepository.findById.mockResolvedValue(mockCompany);
      customerRepository.findById.mockResolvedValue(mockCustomer);
      productRepository.findById.mockResolvedValue(mockProduct);

      // Act - NFe
      const resultNFe = await useCase.execute({ ...validDto, tipo: 'NFe' });
      
      // Act - NFSe
      const resultNFSe = await useCase.execute({ ...validDto, tipo: 'NFSe' });

      // Assert
      expect(resultNFe.chaveAcesso).toBeDefined();
      expect(resultNFe.chaveAcesso).toHaveLength(44); // Chave de acesso tem 44 dígitos
      expect(resultNFSe.chaveAcesso).toBeUndefined();
    });

    it('deve verificar se todos os repositórios são chamados', async () => {
      // Arrange
      companyRepository.findById.mockResolvedValue(mockCompany);
      customerRepository.findById.mockResolvedValue(mockCustomer);
      productRepository.findById.mockResolvedValue(mockProduct);

      // Act
      await useCase.execute(validDto);

      // Assert
      expect(companyRepository.findById).toHaveBeenCalledWith('company-id-1');
      expect(customerRepository.findById).toHaveBeenCalledWith('customer-id-1');
      expect(productRepository.findById).toHaveBeenCalledWith('product-id-1');
    });
  });
});
