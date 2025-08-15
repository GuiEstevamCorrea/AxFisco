import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CompanyEntity } from './company.entity';
import { CustomerEntity } from './customer.entity';

@Entity('nfe_documents')
export class NFeEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  number: number;

  @Column()
  series: number;

  @Column({ name: 'access_key', unique: true })
  accessKey: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column('json')
  items: any[];

  @Column('decimal', { precision: 15, scale: 2, name: 'total_value' })
  totalValue: number;

  @Column('decimal', { precision: 15, scale: 2, name: 'total_taxes' })
  totalTaxes: number;

  @Column({ name: 'issue_date' })
  issueDate: Date;

  @Column()
  status: string;

  @Column({ name: 'xml_content', type: 'text', nullable: true })
  xmlContent?: string;

  @Column({ name: 'protocol_number', nullable: true })
  protocolNumber?: string;

  @Column({ name: 'status_reason', nullable: true })
  statusReason?: string;

  @Column()
  operation: string;

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
