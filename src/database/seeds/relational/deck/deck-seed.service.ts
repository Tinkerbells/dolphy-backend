import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeckEntity } from '../../../../decks/infrastructure/persistence/relational/entities/deck.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DeckSeedService {
  constructor(
    @InjectRepository(DeckEntity)
    private repository: Repository<DeckEntity>,
  ) {}

  async run() {
    const count = await this.repository.count();

    if (!count) {
      await this.repository.save([
        this.repository.create({
          id: uuidv4(),
          name: 'Японский язык: Базовые фразы',
          description: 'Колода для изучения базовых фраз на японском языке',
          userId: '2',
          deleted: false,
        }),
        this.repository.create({
          id: uuidv4(),
          name: 'Математика: Тригонометрия',
          description: 'Формулы и концепции тригонометрии',
          userId: '2',
          deleted: false,
        }),
        this.repository.create({
          id: uuidv4(),
          name: 'Английский: Неправильные глаголы',
          description: 'Неправильные глаголы в английском языке',
          userId: '2',
          deleted: false,
        }),
        this.repository.create({
          id: uuidv4(),
          name: 'Программирование: JavaScript',
          description: 'Основные концепции JavaScript',
          userId: '2',
          deleted: false,
        }),
        this.repository.create({
          id: uuidv4(),
          name: 'География: Столицы мира',
          description: 'Столицы стран мира',
          userId: '2',
          deleted: false,
        }),
      ]);
    }
  }
}
