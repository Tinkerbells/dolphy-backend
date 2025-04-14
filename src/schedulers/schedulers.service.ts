import { Injectable } from '@nestjs/common';
import { CardRepository } from '../cards/infrastructure/persistence/card.repository';
import { RevlogRepository } from './infrastructure/persistence/revlog.repository';
import { DeckRepository } from '../decks/infrastructure/persistence/deck.repository';
import {
  fsrs,
  createEmptyCard,
  State,
  Grade,
  RecordLogItem,
  Rating,
} from 'ts-fsrs';
import { ReviewResult } from './domain/review-result';
import { FSRSParameters } from '../fsrs/domain/fsrs-parameters';
import { Card } from '../cards/domain/card';
import { DeepPartial } from '../utils/types/deep-partial.type';
import { EntityManager } from 'typeorm';
import { Revlog } from './domain/revlog';

@Injectable()
export class SchedulersService {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly revlogRepository: RevlogRepository,
    private readonly deckRepository: DeckRepository,
    private readonly entityManager: EntityManager,
  ) {}

  async getReviewCardDetails(uid: number, timestamp: number) {
    // Здесь был бы сложный запрос к БД через репозиторий
    // Для примера реализуем упрощенную логику поиска карточек для обзора

    // Получаем карточки со временем повторения меньше текущего времени
    const dueCards = await this.cardRepository.findDueCards(
      uid,
      timestamp,
      100,
    );

    // Распределить карточки по состояниям и учесть лимиты
    const result = new Map<State, any[]>([
      [State.New, []],
      [State.Learning, []],
      [State.Relearning, []],
      [State.Review, []],
    ]);

    for (const card of dueCards) {
      const stateArr = result.get(card.state);
      if (stateArr) {
        stateArr.push(card);
      }
    }

    return result;
  }

  async next(
    uid: number,
    cid: number,
    timestamp: number,
    grade: Grade,
    offset: number,
    duration: number = 0,
  ): Promise<ReviewResult> {
    return this.entityManager.transaction(async () => {
      // Получаем информацию о карточке
      const card = await this.cardRepository.findById(cid, uid);
      if (!card) {
        throw new Error(`Card with id ${cid} not found`);
      }
      // Получаем колоду
      const deck = await this.deckRepository.findById(card.did, uid);
      if (!deck) {
        throw new Error(`Deck with id ${card.did} not found`);
      }

      // Создаем экземпляр FSRS с параметрами колоды
      const f = fsrs(deck.fsrs);

      // Лимит для автоматической приостановки карточки
      const lapses = deck.card_limit.suspended || 8;

      // Преобразуем нашу карточку в формат, ожидаемый ts-fsrs
      const fsrsCard = {
        due: new Date(card.due),
        stability: card.stability,
        difficulty: card.difficulty,
        elapsed_days: card.elapsed_days,
        scheduled_days: card.scheduled_days,
        reps: card.reps,
        lapses: card.lapses,
        state: card.state,
        last_review: card.last_review ? new Date(card.last_review) : undefined,
      };

      // Выполняем расчет следующего интервала
      const result = f.next(
        fsrsCard,
        timestamp,
        grade,
        (recordItem: RecordLogItem) => {
          const suspended =
            grade === Rating.Again &&
            recordItem.card.lapses > 0 &&
            recordItem.card.lapses % lapses === 0;

          // Результат для обновления карточки
          const resultCard = {
            due: +recordItem.card.due,
            stability: recordItem.card.stability,
            difficulty: recordItem.card.difficulty,
            elapsed_days: recordItem.card.elapsed_days,
            scheduled_days: recordItem.card.scheduled_days,
            reps: recordItem.card.reps,
            lapses: recordItem.card.lapses,
            state: recordItem.card.state,
            last_review: recordItem.card.last_review?.getTime() || null,
            suspended,
            updatedAt: Date.now(),
          };

          // Запись для журнала повторений
          const resultLog = {
            grade: recordItem.log.rating as unknown as Grade, // Explicit cast to resolve type incompatibility
            state: recordItem.log.state,
            due: +recordItem.log.due,
            stability: recordItem.log.stability,
            difficulty: recordItem.log.difficulty,
            elapsed_days: recordItem.log.elapsed_days,
            last_elapsed_days: recordItem.log.last_elapsed_days,
            scheduled_days: recordItem.log.scheduled_days,
            review: +recordItem.log.review,
            duration,
            offset,
            cid: card.id,
            nid: card.nid,
            did: card.did,
            uid: card.uid,
            deleted: false,
          } satisfies Omit<Revlog, 'id'>;

          return { card: resultCard, log: resultLog };
        },
      );

      // Обновляем карточку
      await this.cardRepository.update(cid, result.card, uid);

      // Создаем запись в журнале повторений
      const revlog = await this.revlogRepository.create(result.log);

      // Возвращаем результат
      return {
        nextState: result.card.state,
        nextDue: new Date(result.card.due),
        suspended: result.card.suspended,
        uid: card.uid,
        did: card.did,
        nid: card.nid,
        cid: card.id,
        lid: revlog.id,
      };
    });
  }

  async forget(
    uid: number,
    cid: number,
    timestamp: number,
    offset: number,
    resetCount: boolean = false,
  ): Promise<ReviewResult> {
    return this.entityManager.transaction(async () => {
      const cardInfo = await this.cardRepository.findById(cid, uid);

      if (!cardInfo) {
        throw new Error(`Card with id ${cid} not found`);
      }

      const deck = await this.deckRepository.findById(cardInfo.did, uid);

      if (!deck) {
        throw new Error(`Deck with id ${cardInfo.did} not found`);
      }

      // Создаем экземпляр FSRS с параметрами колоды
      const f = fsrs(deck.fsrs);

      // Выполняем операцию забывания
      const { card, log } = f.forget(
        cardInfo,
        timestamp,
        resetCount,
        (recordItem: RecordLogItem) => {
          const data = {
            card: {
              due: +recordItem.card.due,
              stability: recordItem.card.stability,
              difficulty: recordItem.card.difficulty,
              elapsed_days: recordItem.card.elapsed_days,
              scheduled_days: recordItem.card.scheduled_days,
              reps: recordItem.card.reps,
              lapses: recordItem.card.lapses,
              state: recordItem.card.state,
              last_review: recordItem.card.last_review?.getTime() || null,
              updated: Date.now(),
            },
            log: {
              grade: recordItem.log.rating as Grade,
              state: recordItem.log.state,
              due: +recordItem.log.due,
              stability: recordItem.log.stability,
              difficulty: recordItem.log.difficulty,
              elapsed_days: recordItem.log.elapsed_days,
              last_elapsed_days: recordItem.log.last_elapsed_days,
              scheduled_days: recordItem.log.scheduled_days,
              review: +recordItem.log.review,
              duration: 0,
              offset,
              cid: card.id,
              nid: card.nid,
              did: card.did,
              uid: card.uid,
              deleted: false,
            } satisfies Omit<Revlog, 'id'>,
          };
          return data;
        },
      );

      // Обновляем карточку
      const updatedCard = await this.cardRepository.update(cid, card, uid);

      if (!updatedCard) {
        throw new Error(`Card with id ${cid} can't update`);
      }

      // Создаем запись в журнале повторений

      const revlog = await this.revlogRepository.create({
        ...log,
        cid: cardInfo.id,
        did: cardInfo.did,
        nid: cardInfo.nid,
        uid: cardInfo.uid,
        deleted: false,
        duration: 0,
        offset: offset,
      });

      return {
        nextState: card.state,
        nextDue: new Date(card.due),
        suspended: card.suspended,
        uid: card.uid,
        did: card.did,
        nid: card.nid,
        cid: card.id,
        lid: revlog.id,
      };
    });
  }

  async undo(uid: number, cid: number, lid: number): Promise<ReviewResult> {
    return this.entityManager.transaction(async () => {
      const card = await this.cardRepository.findById(cid, uid);

      if (!card) {
        throw new Error(`Card with id ${cid} not found`);
      }

      const log = await this.revlogRepository.findById(lid, uid);

      if (!log) {
        throw new Error(`Log with id ${lid} not found`);
      }

      const deck = await this.deckRepository.findById(card.did, uid);

      if (!deck) {
        throw new Error(`Deck with id ${card.did} not found`);
      }

      // Создаем экземпляр FSRS с параметрами колоды
      const f = fsrs(deck.fsrs);

      // Создаем объект лога с полем rating для совместимости с ts-fsrs
      const logWithRating = { ...log, rating: log.grade };

      // Лимит для автоматической приостановки карточки
      const lapses = deck.card_limit.suspended || 8;

      // Откатываем изменения
      const prevCard = f.rollback(card, logWithRating, (rollbackCard) => {
        const suspended =
          log.grade === 1 &&
          rollbackCard.lapses > 0 &&
          rollbackCard.lapses % lapses === 0;
        return {
          due: +rollbackCard.due,
          stability: rollbackCard.stability,
          difficulty: rollbackCard.difficulty,
          elapsed_days: rollbackCard.elapsed_days,
          scheduled_days: rollbackCard.scheduled_days,
          reps: rollbackCard.reps,
          lapses: rollbackCard.lapses,
          state: rollbackCard.state,
          last_review: rollbackCard.last_review?.getTime() || null,
          suspended,
          updated: Date.now(),
        };
      });

      // Обновляем карточку
      await this.cardRepository.update(cid, prevCard as DeepPartial<Card>, uid);

      // Помечаем лог как удаленный
      await this.revlogRepository.markAsDeleted(lid, uid);

      return {
        nextState: prevCard.state,
        nextDue: new Date(prevCard.due),
        suspended: prevCard.suspended,
        uid: card.uid,
        did: card.did,
        nid: card.nid,
        cid: card.id,
      };
    });
  }

  async reschedule(
    uid: number,
    cids: number[],
    useParams?: FSRSParameters,
  ): Promise<number[]> {
    // Получаем карточки
    const cards = await this.cardRepository.findByIds(cids, uid);

    if (cards.length === 0) {
      return [];
    }

    // Группируем карточки по колодам для получения параметров
    const cardsByDeckId = new Map<number, Card[]>();
    for (const card of cards) {
      if (!cardsByDeckId.has(card.did)) {
        cardsByDeckId.set(card.did, []);
      }
      cardsByDeckId.get(card.did)?.push(card);
    }

    // Получаем параметры колод
    const deckIds = [...cardsByDeckId.keys()];
    const deckMap = new Map<number, FSRSParameters>();

    if (!useParams) {
      // Если параметры не переданы, получаем их из колод
      for (const deckId of deckIds) {
        const deck = await this.deckRepository.findById(deckId, uid);
        if (deck) {
          deckMap.set(deckId, deck.fsrs);
        }
      }
    } else {
      // Если переданы пользовательские параметры, используем их для всех колод
      for (const deckId of deckIds) {
        deckMap.set(deckId, useParams);
      }
    }

    const cardLogs = new Map<number, any[]>();

    for (const card of cards) {
      const logs = await this.revlogRepository.findByCardId(card.id, uid);
      if (logs.length > 0) {
        // Преобразуем логи в формат, подходящий для ts-fsrs
        const formattedLogs = logs.map((log) => ({
          rating: log.grade,
          review: new Date(log.review),
          due: new Date(log.due),
          state: log.state,
        }));
        cardLogs.set(card.id, formattedLogs);
      }
    }

    // Перепланируем каждую карточку
    const updatedCardIds: number[] = [];
    const f = fsrs();

    for (const card of cards) {
      // Получаем параметры для текущей колоды
      if (!deckMap.get(card.did) || !useParams) continue;
      f.parameters = deckMap.get(card.did) || useParams;

      const logs = cardLogs.get(card.id) || [];
      const record = f.reschedule(card, logs);

      if (record.reschedule_item) {
        updatedCardIds.push(card.id);
        await this.cardRepository.update(
          card.id,
          {
            stability: record.reschedule_item.card.stability,
            difficulty: record.reschedule_item.card.difficulty,
            due: +record.reschedule_item.card.due,
          } as DeepPartial<Card>,
          uid,
        );
      }
    }

    return updatedCardIds;
  }

  async switchSuspend(
    uid: number,
    cid: number,
    timestamp: number,
    suspended: boolean,
  ): Promise<ReviewResult> {
    const card = await this.cardRepository.findById(cid, uid);

    if (!card) {
      throw new Error(`Card with id ${cid} not found`);
    }

    // Обновляем состояние приостановки
    await this.cardRepository.update(
      cid,
      {
        suspended,
        updated: timestamp,
      } as DeepPartial<Card>,
      uid,
    );

    return {
      nextState: card.state,
      nextDue: new Date(card.due),
      suspended,
      uid: card.uid,
      did: card.did,
      nid: card.nid,
      cid: card.id,
    };
  }

  async createCard(uid: number, did: number, nid: number, timestamp: number) {
    const emptyCard = createEmptyCard(timestamp);

    return this.cardRepository.create({
      uid,
      did,
      nid,
      due: +emptyCard.due,
      stability: emptyCard.stability,
      difficulty: emptyCard.difficulty,
      elapsed_days: emptyCard.elapsed_days,
      scheduled_days: emptyCard.scheduled_days,
      reps: emptyCard.reps,
      lapses: emptyCard.lapses,
      state: emptyCard.state,
      last_review: null,
      suspended: false,
      deleted: false,
    });
  }
}
