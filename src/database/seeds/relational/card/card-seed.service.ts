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

      // Карточки японского языка (20 карточек)
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
          {
            question: 'Как сказать "извините" на японском?',
            answer: 'すみません (сумимасэн)',
            metadata: { tags: ['извинение', 'вежливость'], level: 'beginner' },
          },
          {
            question: 'Как сказать "да" на японском?',
            answer: 'はい (хаи)',
            metadata: { tags: ['ответы', 'базовые фразы'], level: 'beginner' },
          },
          {
            question: 'Как сказать "нет" на японском?',
            answer: 'いいえ (иие)',
            metadata: { tags: ['ответы', 'базовые фразы'], level: 'beginner' },
          },
          {
            question: 'Как сказать "доброе утро" на японском?',
            answer: 'おはようございます (охаё гозаимас)',
            metadata: { tags: ['приветствие', 'время дня'], level: 'beginner' },
          },
          {
            question: 'Как сказать "добрый вечер" на японском?',
            answer: 'こんばんは (конбанва)',
            metadata: { tags: ['приветствие', 'время дня'], level: 'beginner' },
          },
          {
            question: 'Как сказать "один" на японском?',
            answer: '一 / いち (ичи)',
            metadata: { tags: ['числа', 'счёт'], level: 'beginner' },
          },
          {
            question: 'Как сказать "два" на японском?',
            answer: '二 / に (ни)',
            metadata: { tags: ['числа', 'счёт'], level: 'beginner' },
          },
          {
            question: 'Как сказать "три" на японском?',
            answer: '三 / さん (сан)',
            metadata: { tags: ['числа', 'счёт'], level: 'beginner' },
          },
          {
            question: 'Как сказать "красный" на японском?',
            answer: '赤い (акаи)',
            metadata: { tags: ['цвета', 'прилагательные'], level: 'beginner' },
          },
          {
            question: 'Как сказать "синий" на японском?',
            answer: '青い (аои)',
            metadata: { tags: ['цвета', 'прилагательные'], level: 'beginner' },
          },
          {
            question: 'Как сказать "вода" на японском?',
            answer: '水 (мидзу)',
            metadata: {
              tags: ['еда и напитки', 'существительные'],
              level: 'beginner',
            },
          },
          {
            question: 'Как сказать "еда" на японском?',
            answer: '食べ物 (табэмоно)',
            metadata: {
              tags: ['еда и напитки', 'существительные'],
              level: 'beginner',
            },
          },
          {
            question: 'Как сказать "я" на японском?',
            answer: '私 (ваташи)',
            metadata: {
              tags: ['местоимения', 'грамматика'],
              level: 'beginner',
            },
          },
          {
            question: 'Как сказать "вы" на японском?',
            answer: 'あなた (аната)',
            metadata: {
              tags: ['местоимения', 'грамматика'],
              level: 'beginner',
            },
          },
          {
            question: 'Как сказать "мать" на японском?',
            answer: 'お母さん (окаасан)',
            metadata: { tags: ['семья', 'родственники'], level: 'beginner' },
          },
          {
            question: 'Как сказать "отец" на японском?',
            answer: 'お父さん (отоосан)',
            metadata: { tags: ['семья', 'родственники'], level: 'beginner' },
          },
          {
            question: 'Как сказать "понимаю" на японском?',
            answer: 'わかります (вакаримас)',
            metadata: {
              tags: ['понимание', 'полезные фразы'],
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

      // Карточки математики (18 карточек)
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
          {
            question: 'Чему равен sin(0°)?',
            answer: '0',
            metadata: {
              tags: ['тригонометрия', 'синус'],
              level: 'intermediate',
            },
          },
          {
            question: 'Чему равен cos(90°)?',
            answer: '0',
            metadata: {
              tags: ['тригонометрия', 'косинус'],
              level: 'intermediate',
            },
          },
          {
            question: 'Чему равен tan(45°)?',
            answer: '1',
            metadata: {
              tags: ['тригонометрия', 'тангенс'],
              level: 'intermediate',
            },
          },
          {
            question: 'Чему равен sin(30°)?',
            answer: '1/2 или 0.5',
            metadata: {
              tags: ['тригонометрия', 'синус'],
              level: 'intermediate',
            },
          },
          {
            question: 'Чему равен cos(60°)?',
            answer: '1/2 или 0.5',
            metadata: {
              tags: ['тригонометрия', 'косинус'],
              level: 'intermediate',
            },
          },
          {
            question: 'Чему равен sin(60°)?',
            answer: '√3/2 или ~0.866',
            metadata: {
              tags: ['тригонометрия', 'синус'],
              level: 'intermediate',
            },
          },
          {
            question: 'Чему равен cos(30°)?',
            answer: '√3/2 или ~0.866',
            metadata: {
              tags: ['тригонометрия', 'косинус'],
              level: 'intermediate',
            },
          },
          {
            question: 'Основное тригонометрическое тождество?',
            answer: 'sin²(x) + cos²(x) = 1',
            metadata: {
              tags: ['тригонометрия', 'тождества'],
              level: 'intermediate',
            },
          },
          {
            question: 'Формула tan(x) через sin и cos?',
            answer: 'tan(x) = sin(x) / cos(x)',
            metadata: {
              tags: ['тригонометрия', 'формулы'],
              level: 'intermediate',
            },
          },
          {
            question: 'Период функции sin(x)?',
            answer: '2π',
            metadata: {
              tags: ['тригонометрия', 'периодичность'],
              level: 'intermediate',
            },
          },
          {
            question: 'Период функции cos(x)?',
            answer: '2π',
            metadata: {
              tags: ['тригонометрия', 'периодичность'],
              level: 'intermediate',
            },
          },
          {
            question: 'Период функции tan(x)?',
            answer: 'π',
            metadata: {
              tags: ['тригонометрия', 'периодичность'],
              level: 'intermediate',
            },
          },
          {
            question: 'Область значений sin(x)?',
            answer: '[-1; 1]',
            metadata: {
              tags: ['тригонометрия', 'область значений'],
              level: 'intermediate',
            },
          },
          {
            question: 'Область значений cos(x)?',
            answer: '[-1; 1]',
            metadata: {
              tags: ['тригонометрия', 'область значений'],
              level: 'intermediate',
            },
          },
          {
            question: 'sin(-x) = ?',
            answer: '-sin(x) (нечётная функция)',
            metadata: {
              tags: ['тригонометрия', 'свойства'],
              level: 'intermediate',
            },
          },
          {
            question: 'cos(-x) = ?',
            answer: 'cos(x) (чётная функция)',
            metadata: {
              tags: ['тригонометрия', 'свойства'],
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

      // Карточки английского (20 карточек)
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
          {
            question: 'Как переводится неправильный глагол "come"?',
            answer: 'come - came - come (приходить, приезжать)',
            metadata: {
              tags: ['неправильные глаголы', 'движение'],
              level: 'intermediate',
            },
          },
          {
            question: 'Как переводится неправильный глагол "do"?',
            answer: 'do - did - done (делать)',
            metadata: {
              tags: ['неправильные глаголы', 'действие'],
              level: 'intermediate',
            },
          },
          {
            question: 'Как переводится неправильный глагол "have"?',
            answer: 'have - had - had (иметь)',
            metadata: {
              tags: ['неправильные глаголы', 'обладание'],
              level: 'intermediate',
            },
          },
          {
            question: 'Как переводится неправильный глагол "make"?',
            answer: 'make - made - made (делать, создавать)',
            metadata: {
              tags: ['неправильные глаголы', 'создание'],
              level: 'intermediate',
            },
          },
          {
            question: 'Как переводится неправильный глагол "know"?',
            answer: 'know - knew - known (знать)',
            metadata: {
              tags: ['неправильные глаголы', 'знание'],
              level: 'intermediate',
            },
          },
          {
            question: 'Как переводится неправильный глагол "think"?',
            answer: 'think - thought - thought (думать)',
            metadata: {
              tags: ['неправильные глаголы', 'мышление'],
              level: 'intermediate',
            },
          },
          {
            question: 'Как переводится неправильный глагол "say"?',
            answer: 'say - said - said (сказать)',
            metadata: {
              tags: ['неправильные глаголы', 'речь'],
              level: 'intermediate',
            },
          },
          {
            question: 'Как переводится неправильный глагол "tell"?',
            answer: 'tell - told - told (рассказывать)',
            metadata: {
              tags: ['неправильные глаголы', 'речь'],
              level: 'intermediate',
            },
          },
          {
            question: 'Как переводится неправильный глагол "give"?',
            answer: 'give - gave - given (давать)',
            metadata: {
              tags: ['неправильные глаголы', 'передача'],
              level: 'intermediate',
            },
          },
          {
            question: 'Как переводится неправильный глагол "get"?',
            answer: 'get - got - got/gotten (получать)',
            metadata: {
              tags: ['неправильные глаголы', 'получение'],
              level: 'intermediate',
            },
          },
          {
            question: 'Как переводится неправильный глагол "find"?',
            answer: 'find - found - found (находить)',
            metadata: {
              tags: ['неправильные глаголы', 'поиск'],
              level: 'intermediate',
            },
          },
          {
            question: 'Как переводится неправильный глагол "leave"?',
            answer: 'leave - left - left (оставлять, уходить)',
            metadata: {
              tags: ['неправильные глаголы', 'движение'],
              level: 'intermediate',
            },
          },
          {
            question: 'Как переводится неправильный глагол "put"?',
            answer: 'put - put - put (класть, ставить)',
            metadata: {
              tags: ['неправильные глаголы', 'размещение'],
              level: 'intermediate',
            },
          },
          {
            question: 'Как переводится неправильный глагол "buy"?',
            answer: 'buy - bought - bought (покупать)',
            metadata: {
              tags: ['неправильные глаголы', 'покупки'],
              level: 'intermediate',
            },
          },
          {
            question: 'Как переводится неправильный глагол "write"?',
            answer: 'write - wrote - written (писать)',
            metadata: {
              tags: ['неправильные глаголы', 'письмо'],
              level: 'intermediate',
            },
          },
          {
            question: 'Как переводится неправильный глагол "read"?',
            answer: 'read - read - read (читать)',
            metadata: {
              tags: ['неправильные глаголы', 'чтение'],
              level: 'intermediate',
            },
          },
          {
            question: 'Как переводится неправильный глагол "run"?',
            answer: 'run - ran - run (бегать)',
            metadata: {
              tags: ['неправильные глаголы', 'движение'],
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

      // Карточки JavaScript (18 карточек)
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
          {
            question: 'Какие есть примитивные типы данных в JavaScript?',
            answer: 'string, number, boolean, undefined, null, symbol, bigint',
            metadata: { tags: ['типы данных', 'основы'], level: 'beginner' },
          },
          {
            question: 'Как проверить тип переменной в JavaScript?',
            answer: 'typeof variable',
            metadata: { tags: ['типы данных', 'операторы'], level: 'beginner' },
          },
          {
            question: 'Что такое hoisting в JavaScript?',
            answer:
              'Механизм поднятия объявлений переменных и функций в начало области видимости',
            metadata: {
              tags: ['hoisting', 'концепции'],
              level: 'intermediate',
            },
          },
          {
            question: 'В чём разница между let, const и var?',
            answer:
              'var - функциональная область видимости, let/const - блочная, const нельзя переназначить',
            metadata: {
              tags: ['переменные', 'область видимости'],
              level: 'intermediate',
            },
          },
          {
            question: 'Как создать функцию в JavaScript?',
            answer:
              'function myFunc() {} или const myFunc = () => {} или const myFunc = function() {}',
            metadata: { tags: ['функции', 'синтаксис'], level: 'beginner' },
          },
          {
            question: 'Что такое замыкание (closure) в JavaScript?',
            answer:
              'Функция, которая имеет доступ к переменным внешней функции даже после её завершения',
            metadata: {
              tags: ['замыкания', 'концепции'],
              level: 'intermediate',
            },
          },
          {
            question: 'Как добавить элемент в конец массива?',
            answer: 'array.push(element)',
            metadata: { tags: ['массивы', 'методы'], level: 'beginner' },
          },
          {
            question: 'Как удалить последний элемент из массива?',
            answer: 'array.pop()',
            metadata: { tags: ['массивы', 'методы'], level: 'beginner' },
          },
          {
            question: 'Что такое this в JavaScript?',
            answer:
              'Ключевое слово, которое ссылается на контекст выполнения функции',
            metadata: { tags: ['this', 'контекст'], level: 'intermediate' },
          },
          {
            question: 'Как создать объект в JavaScript?',
            answer:
              'const obj = {} или const obj = new Object() или const obj = {key: value}',
            metadata: { tags: ['объекты', 'синтаксис'], level: 'beginner' },
          },
          {
            question: 'Что такое Promise в JavaScript?',
            answer:
              'Объект для работы с асинхронными операциями, имеющий состояния: pending, fulfilled, rejected',
            metadata: {
              tags: ['промисы', 'асинхронность'],
              level: 'intermediate',
            },
          },
          {
            question: 'Что делает метод map() у массивов?',
            answer:
              'Создаёт новый массив, применяя функцию к каждому элементу исходного массива',
            metadata: { tags: ['массивы', 'методы'], level: 'intermediate' },
          },
          {
            question: 'Что делает метод filter() у массивов?',
            answer:
              'Создаёт новый массив с элементами, прошедшими проверку в callback функции',
            metadata: { tags: ['массивы', 'методы'], level: 'intermediate' },
          },
          {
            question: 'Как превратить строку в число?',
            answer: 'Number(str), parseInt(str), parseFloat(str) или +str',
            metadata: {
              tags: ['преобразование типов', 'строки'],
              level: 'beginner',
            },
          },
          {
            question: 'Что такое деструктуризация в JavaScript?',
            answer:
              'Синтаксис для извлечения данных из массивов или объектов: [a, b] = array, {x, y} = object',
            metadata: {
              tags: ['деструктуризация', 'ES6'],
              level: 'intermediate',
            },
          },
          {
            question: 'Что такое spread оператор (...)?',
            answer:
              'Оператор распространения для "раскрытия" массивов или объектов: [...array], {...object}',
            metadata: { tags: ['spread', 'ES6'], level: 'intermediate' },
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

      // Карточки географии (20 карточек)
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
          {
            question: 'Какая столица Германии?',
            answer: 'Берлин',
            metadata: { tags: ['европа', 'столицы'], level: 'beginner' },
          },
          {
            question: 'Какая столица Италии?',
            answer: 'Рим',
            metadata: { tags: ['европа', 'столицы'], level: 'beginner' },
          },
          {
            question: 'Какая столица Канады?',
            answer: 'Оттава',
            metadata: {
              tags: ['северная америка', 'столицы'],
              level: 'intermediate',
            },
          },
          {
            question: 'Какая столица Австралии?',
            answer: 'Канберра',
            metadata: { tags: ['океания', 'столицы'], level: 'intermediate' },
          },
          {
            question: 'Какая столица Индии?',
            answer: 'Нью-Дели',
            metadata: { tags: ['азия', 'столицы'], level: 'beginner' },
          },
          {
            question: 'Какая столица Египта?',
            answer: 'Каир',
            metadata: { tags: ['африка', 'столицы'], level: 'beginner' },
          },
          {
            question: 'Какая столица Испании?',
            answer: 'Мадрид',
            metadata: { tags: ['европа', 'столицы'], level: 'beginner' },
          },
          {
            question: 'Какая столица Китая?',
            answer: 'Пекин',
            metadata: { tags: ['азия', 'столицы'], level: 'beginner' },
          },
          {
            question: 'Какая столица Великобритании?',
            answer: 'Лондон',
            metadata: { tags: ['европа', 'столицы'], level: 'beginner' },
          },
          {
            question: 'Какая столица Мексики?',
            answer: 'Мехико',
            metadata: {
              tags: ['северная америка', 'столицы'],
              level: 'beginner',
            },
          },
          {
            question: 'Какая столица Турции?',
            answer: 'Анкара',
            metadata: { tags: ['азия', 'столицы'], level: 'intermediate' },
          },
          {
            question: 'Какая столица Аргентины?',
            answer: 'Буэнос-Айрес',
            metadata: { tags: ['южная америка', 'столицы'], level: 'beginner' },
          },
          {
            question: 'Какая столица ЮАР?',
            answer:
              'Кейптаун (законодательная), Претория (исполнительная), Блумфонтейн (судебная)',
            metadata: { tags: ['африка', 'столицы'], level: 'advanced' },
          },
          {
            question: 'Какая столица Норвегии?',
            answer: 'Осло',
            metadata: { tags: ['европа', 'столицы'], level: 'intermediate' },
          },
          {
            question: 'Какая столица Таиланда?',
            answer: 'Бангкок',
            metadata: { tags: ['азия', 'столицы'], level: 'beginner' },
          },
          {
            question: 'Какая столица Швеции?',
            answer: 'Стокгольм',
            metadata: { tags: ['европа', 'столицы'], level: 'intermediate' },
          },
          {
            question: 'Какая столица Нидерландов?',
            answer: 'Амстердам',
            metadata: { tags: ['европа', 'столицы'], level: 'beginner' },
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
