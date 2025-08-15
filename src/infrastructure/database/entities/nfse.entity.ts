import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CompanyEntity } from './company.entity';
import { CustomerEntity } from './customer.entity';

@Entity('nfse_documents')
export class NFSeEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ nullable: true })
  number?: number;

  @Column({ name: 'rps_number' })
  rpsNumber: number;

  @Column({ name: 'rps_series' })
  rpsSeries: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column('json')
  services: any[];

  @Column('decimal', { precision: 15, scale: 2, name: 'total_value' })
  totalValue: number;

  @Column('decimal', { precision: 15, scale: 2, name: 'total_taxes' })
  totalTaxes: number;

  @Column({ name: 'issue_date' })
  issueDate: Date;

  @Column({ name: 'competence_date' })
  competenceDate: Date;

  @Column()
  status: string;

  @Column({ name: 'xml_content', type: 'text', nullable: true })
  xmlContent?: string;

  @Column({ name: 'verification_code', nullable: true })
  verificationCode?: string;

  @Column({ name: 'status_reason', nullable: true })
  statusReason?: string;

  @Column({ name: 'city_service_code' })
  cityServiceCode: string;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;

  @ManyToOne(() => CustomerEntity)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
