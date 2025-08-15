import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class ProductEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ unique: true })
  code: string;

  @Column()
  ncm: string;

  @Column()
  cfop: string;

  @Column({ name: 'unit_of_measure' })
  unitOfMeasure: string;

  @Column('decimal', { precision: 10, scale: 2, name: 'unit_price' })
  unitPrice: number;

  @Column({ name: 'product_type' })
  productType: string;

  // Tax information
  @Column('decimal', { precision: 5, scale: 2, name: 'icms_rate' })
  icmsRate: number;

  @Column('decimal', { precision: 5, scale: 2, name: 'ipi_rate' })
  ipiRate: number;

  @Column('decimal', { precision: 5, scale: 2, name: 'pis_rate' })
  pisRate: number;

  @Column('decimal', { precision: 5, scale: 2, name: 'cofins_rate' })
  cofinsRate: number;

  @Column('decimal', { precision: 5, scale: 2, name: 'iss_rate', nullable: true })
  issRate?: number;

  @Column({ name: 'cst_icms' })
  cstIcms: string;

  @Column({ name: 'cst_ipi' })
  cstIpi: string;

  @Column({ name: 'cst_pis' })
  cstPis: string;

  @Column({ name: 'cst_cofins' })
  cstCofins: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
