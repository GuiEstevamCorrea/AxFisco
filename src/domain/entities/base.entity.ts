import { randomUUID } from 'crypto';

export abstract class BaseEntity {
  private _id: string;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(id?: string) {
    this._id = id || randomUUID();
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  get id(): string {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  protected touch(): void {
    this._updatedAt = new Date();
  }

  equals(entity: BaseEntity): boolean {
    if (this === entity) return true;
    if (entity.constructor !== this.constructor) return false;
    return this._id === entity._id;
  }
}
