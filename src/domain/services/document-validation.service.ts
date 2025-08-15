import { NFeDocument } from '../entities/nfe.entity';
import { NFSeDocument } from '../entities/nfse.entity';

export class DocumentValidationService {
  validateNFe(nfe: NFeDocument): ValidationResult {
    const errors: string[] = [];

    // Validações básicas
    if (!nfe.company) {
      errors.push('Empresa emitente é obrigatória');
    }

    if (!nfe.customer) {
      errors.push('Cliente/destinatário é obrigatório');
    }

    if (nfe.items.length === 0) {
      errors.push('NFe deve ter pelo menos um item');
    }

    if (nfe.totalValue <= 0) {
      errors.push('Valor total deve ser maior que zero');
    }

    // Validações dos itens
    nfe.items.forEach((item, index) => {
      if (!item.productCode?.trim()) {
        errors.push(`Item ${index + 1}: Código do produto é obrigatório`);
      }
      
      if (!item.description?.trim()) {
        errors.push(`Item ${index + 1}: Descrição é obrigatória`);
      }
      
      if (item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantidade deve ser maior que zero`);
      }
      
      if (item.unitPrice <= 0) {
        errors.push(`Item ${index + 1}: Preço unitário deve ser maior que zero`);
      }
      
      if (!this.isValidNCM(item.ncm)) {
        errors.push(`Item ${index + 1}: NCM inválido`);
      }
      
      if (!this.isValidCFOP(item.cfop)) {
        errors.push(`Item ${index + 1}: CFOP inválido`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateNFSe(nfse: NFSeDocument): ValidationResult {
    const errors: string[] = [];

    // Validações básicas
    if (!nfse.company) {
      errors.push('Empresa prestadora é obrigatória');
    }

    if (!nfse.customer) {
      errors.push('Cliente/tomador é obrigatório');
    }

    if (nfse.services.length === 0) {
      errors.push('NFSe deve ter pelo menos um serviço');
    }

    if (nfse.totalValue <= 0) {
      errors.push('Valor total deve ser maior que zero');
    }

    if (!nfse.cityServiceCode?.trim()) {
      errors.push('Código do serviço municipal é obrigatório');
    }

    // Validações dos serviços
    nfse.services.forEach((service, index) => {
      if (!service.serviceCode?.trim()) {
        errors.push(`Serviço ${index + 1}: Código do serviço é obrigatório`);
      }
      
      if (!service.description?.trim()) {
        errors.push(`Serviço ${index + 1}: Descrição é obrigatória`);
      }
      
      if (service.quantity <= 0) {
        errors.push(`Serviço ${index + 1}: Quantidade deve ser maior que zero`);
      }
      
      if (service.unitPrice <= 0) {
        errors.push(`Serviço ${index + 1}: Preço unitário deve ser maior que zero`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private isValidNCM(ncm: string): boolean {
    // NCM deve ter 8 dígitos
    return /^\d{8}$/.test(ncm);
  }

  private isValidCFOP(cfop: string): boolean {
    // CFOP deve ter 4 dígitos
    return /^\d{4}$/.test(cfop);
  }
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
