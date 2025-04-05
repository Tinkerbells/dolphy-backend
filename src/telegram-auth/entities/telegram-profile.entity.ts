import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { EntityRelationalHelper } from '../../utils/relational-entity-helper';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';

@Entity({ name: 'telegram_profile' })
export class TelegramProfile extends EntityRelationalHelper {
  @Column({ primary: true })
  telegramId: number;

  @Column({ nullable: true })
  username?: string;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  photoUrl?: string;

  @Column()
  authDate: Date;

  @OneToOne(() => UserEntity, { eager: true })
  @JoinColumn()
  user: UserEntity;
}
