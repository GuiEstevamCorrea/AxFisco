import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('customers')
export class CustomerEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column()
  document: string;

  @Column({ name: 'document_type' })
  documentType: string;

  @Column({ name: 'customer_type' })
  customerType: string;

  @Column({ name: 'state_registration', nullable: true })
  stateRegistration?: string;

  @Column({ name: 'municipal_registration', nullable: true })
  municipalRegistration?: string;

  @Column({ name: 'indicador_ie', default: 9 })
  indicadorIE: number;

  @Column({ nullable: true })
  suframa?: string;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  // Address fields
  @Column({ nullable: true })
  street?: string;

  @Column({ nullable: true })
  number?: string;

  @Column({ nullable: true })
  complement?: string;

  @Column({ nullable: true })
  neighborhood?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ name: 'zip_code', nullable: true })
  zipCode?: string;

  @Column({ default: 'Brasil', nullable: true })
  country?: string;

  @Column({ name: 'codigo_ibge', nullable: true })
  codigoIbge?: string;

  @Column({ name: 'codigo_pais', nullable: true })
  codigoPais?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
