import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardEntity } from '../../../../cards/infrastructure/persistence/relational/entities/card.entity';
import { DeckEntity } from '../../../../decks/infrastructure/persistence/relational/entities/deck.entity';
import { FsrsCardEntity } from '../../../../fsrs/infrastructure/persistence/relational/entities/fsrs-card.entity';
import { v4 as uuidv4 } from 'uuid';
import { State } from 'src/fsrs/domain/fsrs-card';

@Injectable()
export class CardSeedService {
  constructor(
    @InjectRepository(CardEntity)
    private cardRepository: Repository<CardEntity>,
    @InjectRepository(DeckEntity)
    private deckRepository: Repository<DeckEntity>,
    @InjectRepository(FsrsCardEntity)
    private fsrsCardRepository: Repository<FsrsCardEntity>,
  ) {}

  async run() {
    const count = await this.cardRepository.count();
    if (!count) {
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

      const cards: CardEntity[] = [];
      const fsrsCards: FsrsCardEntity[] = [];

      // Карточки японского языка
      if (japaneseBasicsDeck) {
        const japaneseCardData = [
          {
            question: 'Как сказать "привет" на японском?',
            answer: 'こんにちは (конничива)',
            metadata: {
              tags: ['приветствие', 'базовые фразы'],
              level: 'beginner',
            },
          },
          {
            question: 'Как сказать "спасибо" на японском?',
            answer: 'ありがとうございます (аригато гозаимас)',
            metadata: {
              tags: ['благодарность', 'вежливость'],
              level: 'beginner',
            },
          },
          {
            question: 'Как сказать "до свидания" на японском?',
            answer: 'さようなら (саёнара)',
            metadata: {
              tags: ['прощание', 'базовые фразы'],
              level: 'beginner',
            },
          },
        ];

        japaneseCardData.forEach((cardData) => {
          const cardId = uuidv4();
          const { card, fsrsCard } = this.createCardWithFsrs(
            cardId,
            cardData,
            japaneseBasicsDeck,
          );
          cards.push(card);
          fsrsCards.push(fsrsCard);
        });
      }

      // Карточки математики
      if (mathDeck) {
        const mathCardData = [
          {
            question: 'Чему равен sin(90°)?',
            answer: '1',
            metadata: {
              tags: ['тригонометрия', 'синус'],
              level: 'intermediate',
            },
          },
          {
            question: 'Чему равен cos(0°)?',
            answer: '1',
            metadata: {
              tags: ['тригонометрия', 'косинус'],
              level: 'intermediate',
            },
          },
        ];

        mathCardData.forEach((cardData) => {
          const cardId = uuidv4();
          const { card, fsrsCard } = this.createCardWithFsrs(
            cardId,
            cardData,
            mathDeck,
          );
          cards.push(card);
          fsrsCards.push(fsrsCard);
        });
      }

      // Карточки английского
      if (englishDeck) {
        const englishCardData = [
          {
            question: 'Как переводится неправильный глагол "go"?',
            answer: 'go - went - gone (идти, ехать)',
            metadata: {
              tags: ['неправильные глаголы', 'движение'],
              level: 'intermediate',
            },
          },
          {
            question: 'Как переводится неправильный глагол "see"?',
            answer: 'see - saw - seen (видеть)',
            metadata: {
              tags: ['неправильные глаголы', 'чувства'],
              level: 'intermediate',
            },
          },
          {
            question: 'Как переводится неправильный глагол "take"?',
            answer: 'take - took - taken (брать, взять)',
            metadata: {
              tags: ['неправильные глаголы', 'действие'],
              level: 'intermediate',
            },
          },
        ];

        englishCardData.forEach((cardData) => {
          const cardId = uuidv4();
          const { card, fsrsCard } = this.createCardWithFsrs(
            cardId,
            cardData,
            englishDeck,
          );
          cards.push(card);
          fsrsCards.push(fsrsCard);
        });
      }

      // Карточки JavaScript
      if (jsDeck) {
        const jsCardData = [
          {
            question: 'Как объявить переменную в JavaScript?',
            answer:
              'let myVariable = value; или const myVariable = value; или var myVariable = value;',
            metadata: { tags: ['переменные', 'основы'], level: 'beginner' },
          },
          {
            question: 'Как создать массив в JavaScript?',
            answer:
              'const myArray = []; или const myArray = [1, 2, 3]; или const myArray = new Array();',
            metadata: {
              tags: ['массивы', 'структуры данных'],
              level: 'beginner',
            },
          },
        ];

        jsCardData.forEach((cardData) => {
          const cardId = uuidv4();
          const { card, fsrsCard } = this.createCardWithFsrs(
            cardId,
            cardData,
            jsDeck,
          );
          cards.push(card);
          fsrsCards.push(fsrsCard);
        });
      }

      // Карточки географии
      if (geographyDeck) {
        const geographyCardData = [
          {
            question: 'Какая столица Франции?',
            answer: 'Париж',
            metadata: { tags: ['европа', 'столицы'], level: 'beginner' },
          },
          {
            question: 'Какая столица Японии?',
            answer: 'Токио',
            metadata: { tags: ['азия', 'столицы'], level: 'beginner' },
          },
          {
            question: 'Какая столица Бразилии?',
            answer: 'Бразилиа',
            metadata: {
              tags: ['южная америка', 'столицы'],
              level: 'intermediate',
            },
          },
        ];

        geographyCardData.forEach((cardData) => {
          const cardId = uuidv4();
          const { card, fsrsCard } = this.createCardWithFsrs(
            cardId,
            cardData,
            geographyDeck,
          );
          cards.push(card);
          fsrsCards.push(fsrsCard);
        });
      }

      if (cards.length > 0) {
        await this.cardRepository.save(cards);
        await this.fsrsCardRepository.save(fsrsCards);
        console.log(`Создано ${cards.length} карточек с FSRS данными`);
      }
    }
  }

  /**
   * Создает карточку с контентом и соответствующую FSRS карточку
   */
  private createCardWithFsrs(
    cardId: string,
    cardData: { question: string; answer: string; metadata: any },
    deck: DeckEntity,
  ): { card: CardEntity; fsrsCard: FsrsCardEntity } {
    const now = new Date();

    // Создаем карточку с контентом
    const card = this.cardRepository.create({
      id: cardId,
      question: cardData.question,
      answer: cardData.answer,
      source: 'manual',
      metadata: cardData.metadata,
      deckId: deck.id,
      userId: deck.userId,
      deleted: false,
    });

    // Создаем FSRS карточку с начальными параметрами
    const fsrsCard = this.fsrsCardRepository.create({
      cardId: cardId,
      due: now, // Новые карточки доступны сразу
      stability: 0,
      difficulty: 0,
      elapsed_days: 0,
      scheduled_days: 0,
      reps: 0,
      lapses: 0,
      state: State.New,
      last_review: undefined,
      suspended: now,
      deleted: false,
    });

    return { card, fsrsCard };
  }
}
