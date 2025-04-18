import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardEntity } from '../../../../cards/infrastructure/persistence/relational/entities/card.entity';
import { DeckEntity } from '../../../../decks/infrastructure/persistence/relational/entities/deck.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CardSeedService {
  constructor(
    @InjectRepository(CardEntity)
    private cardRepository: Repository<CardEntity>,
    @InjectRepository(DeckEntity)
    private deckRepository: Repository<DeckEntity>,
  ) {}

  async run() {
    const cardsCount = await this.cardRepository.count();

    if (!cardsCount) {
      // Получаем все колоды
      const decks = await this.deckRepository.find();

      if (decks.length === 0) {
        console.log('Не найдено колод для создания карточек. Пропускаем...');
        return;
      }

      // Находим нужные колоды по названию
      const japaneseBasicsDeck = decks.find(
        (deck) => deck.name === 'Японский язык: Базовые фразы',
      );
      const mathDeck = decks.find(
        (deck) => deck.name === 'Математика: Тригонометрия',
      );
      const englishDeck = decks.find(
        (deck) => deck.name === 'Английский: Неправильные глаголы',
      );
      const jsDeck = decks.find(
        (deck) => deck.name === 'Программирование: JavaScript',
      );
      const geographyDeck = decks.find(
        (deck) => deck.name === 'География: Столицы мира',
      );

      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Карточки японского языка
      if (japaneseBasicsDeck) {
        await this.cardRepository.save([
          this.createCard(japaneseBasicsDeck.id, japaneseBasicsDeck.userId),
          this.createCard(japaneseBasicsDeck.id, japaneseBasicsDeck.userId),
          this.createCard(japaneseBasicsDeck.id, japaneseBasicsDeck.userId),
        ]);
      }

      // Карточки математики
      if (mathDeck) {
        await this.cardRepository.save([
          this.createCard(mathDeck.id, mathDeck.userId),
          this.createCard(mathDeck.id, mathDeck.userId),
        ]);
      }

      // Карточки английского
      if (englishDeck) {
        await this.cardRepository.save([
          this.createCard(englishDeck.id, englishDeck.userId),
          this.createCard(englishDeck.id, englishDeck.userId),
          this.createCard(englishDeck.id, englishDeck.userId),
        ]);
      }

      // Карточки JavaScript
      if (jsDeck) {
        await this.cardRepository.save([
          this.createCard(jsDeck.id, jsDeck.userId),
          this.createCard(jsDeck.id, jsDeck.userId),
        ]);
      }

      // Карточки географии
      if (geographyDeck) {
        await this.cardRepository.save([
          this.createCard(geographyDeck.id, geographyDeck.userId),
          this.createCard(geographyDeck.id, geographyDeck.userId),
          this.createCard(geographyDeck.id, geographyDeck.userId),
        ]);
      }
    }
  }

  private createCard(deckId: string, userId: string): CardEntity {
    const now = new Date();

    return this.cardRepository.create({
      id: uuidv4(),
      due: now,
      stability: 0,
      difficulty: 0,
      elapsed_days: 0,
      scheduled_days: 0,
      reps: 0,
      lapses: 0,
      state: 'New',
      suspended: now,
      userId: userId,
      deckId: deckId,
      deleted: false,
    });
  }
}
