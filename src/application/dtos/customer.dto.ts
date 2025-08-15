import { CustomerType } from '@domain/entities/customer.entity';

export class CreateCustomerDto {
  name: string;
  email: string;
  document: string;
  customerType: CustomerType;
  phone?: string;
  stateRegistration?: string;

  // Address fields
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export class UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
  stateRegistration?: string;

  // Address fields
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}
