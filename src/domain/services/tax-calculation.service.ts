import { Product, ProductTaxInfo } from '../entities/product.entity';
import { NFeItem, ItemTaxes } from '../entities/nfe.entity';

export class TaxCalculationService {
  calculateProductTaxes(
    product: Product,
    quantity: number,
    unitPrice?: number,
  ): ItemTaxes {
    const price = unitPrice || product.unitPrice;
    const totalValue = price * quantity;
    const taxInfo = product.taxInfo;

    return {
      icms: this.calculateIcms(totalValue, taxInfo),
      ipi: this.calculateIpi(totalValue, taxInfo),
      pis: this.calculatePis(totalValue, taxInfo),
      cofins: this.calculateCofins(totalValue, taxInfo),
    };
  }

  calculateNFeItemFromProduct(
    product: Product,
    quantity: number,
    unitPrice?: number,
  ): NFeItem {
    const price = unitPrice || product.unitPrice;
    const totalValue = price * quantity;
    const taxes = this.calculateProductTaxes(product, quantity, unitPrice);
    const totalTaxes = Object.values(taxes).reduce((sum, tax) => sum + tax, 0);

    return {
      productCode: product.code,
      description: product.description,
      ncm: product.ncm,
      cfop: product.cfop,
      unitOfMeasure: product.unitOfMeasure,
      quantity,
      unitPrice: price,
      totalValue,
      totalTaxes,
      taxes,
    };
  }

  private calculateIcms(totalValue: number, taxInfo: ProductTaxInfo): number {
    return (totalValue * taxInfo.icmsRate) / 100;
  }

  private calculateIpi(totalValue: number, taxInfo: ProductTaxInfo): number {
    return (totalValue * taxInfo.ipiRate) / 100;
  }

  private calculatePis(totalValue: number, taxInfo: ProductTaxInfo): number {
    return (totalValue * taxInfo.pisRate) / 100;
  }

  private calculateCofins(totalValue: number, taxInfo: ProductTaxInfo): number {
    return (totalValue * taxInfo.cofinsRate) / 100;
  }
}
