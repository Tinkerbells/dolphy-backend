import { Expose } from 'class-transformer';

export class PublicUserDto {
  @Expose()
  id: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  photo: string | null;

  constructor(partial: Partial<PublicUserDto>) {
    Object.assign(this, partial);
  }
}
