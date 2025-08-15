import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('companies')
export class CompanyEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'corporate_name' })
  corporateName: string;

  @Column({ name: 'trade_name' })
  tradeName: string;

  @Column()
  cnpj: string;

  @Column({ name: 'state_registration' })
  stateRegistration: string;

  @Column({ name: 'municipal_registration', nullable: true })
  municipalRegistration?: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ name: 'tax_regime' })
  taxRegime: string;

  // Address fields
  @Column()
  street: string;

  @Column()
  number: string;

  @Column({ nullable: true })
  complement?: string;

  @Column()
  neighborhood: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column({ name: 'zip_code' })
  zipCode: string;

  @Column({ default: 'Brasil' })
  country: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
