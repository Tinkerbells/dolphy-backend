import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  FsrsCard,
  FsrsCardWithContent,
  StateType,
  states,
} from './domain/fsrs-card';
import {
  fsrs,
  type Card as FsrsApiCard,
  Rating,
  State,
  createEmptyCard,
  FSRS,
  RatingType,
} from 'ts-fsrs';
import { FsrsCardRepository } from './infrastructure/persistence/fsrs-card.repository';
import { CardRepository } from '../cards/infrastructure/persistence/card.repository';
import { User } from 'src/users/domain/user';
import { Card } from '../cards/domain/card';
import { t } from '../utils/i18n';
import { DueCardResponseDto } from './dto/due-card-response.dto';

@Injectable()
export class FsrsService {
  private readonly fsrsInstance: FSRS;

  constructor(
    private readonly fsrsCardRepository: FsrsCardRepository,
    private readonly cardRepository: CardRepository,
  ) {
    // Инициализация с параметрами по умолчанию
    this.fsrsInstance = fsrs();
  }

  /**
   * Инициализирует новую FSRS карточку с параметрами по умолчанию
   */
  async initializeCard(cardId: string): Promise<FsrsCard> {
    // Создаем пустую карточку с помощью ts-fsrs
    const now = new Date();
    const emptyFsrsCard = createEmptyCard();

    // Создаем нашу доменную FsrsCard
    const fsrsCard = new FsrsCard();
    fsrsCard.cardId = cardId;
    fsrsCard.due = emptyFsrsCard.due;
    fsrsCard.stability = emptyFsrsCard.stability;
    fsrsCard.difficulty = emptyFsrsCard.difficulty;
    fsrsCard.elapsed_days = emptyFsrsCard.elapsed_days;
    fsrsCard.scheduled_days = emptyFsrsCard.scheduled_days;
    fsrsCard.reps = emptyFsrsCard.reps;
    fsrsCard.lapses = emptyFsrsCard.lapses;
    fsrsCard.state = states[emptyFsrsCard.state];
    fsrsCard.last_review = emptyFsrsCard.last_review;
    fsrsCard.suspended = now;
    fsrsCard.deleted = false;

    return this.fsrsCardRepository.create(fsrsCard);
  }

  /**
   * Преобразует доменную FsrsCard в формат ts-fsrs
   */
  private toFsrsApiCard(fsrsCard: FsrsCard): FsrsApiCard {
    return {
      due: fsrsCard.due,
      stability: fsrsCard.stability,
      difficulty: fsrsCard.difficulty,
      elapsed_days: fsrsCard.elapsed_days,
      scheduled_days: fsrsCard.scheduled_days,
      reps: fsrsCard.reps,
      lapses: fsrsCard.lapses,
      state: this.getStateEnum(fsrsCard.state),
      last_review: fsrsCard.last_review,
    };
  }

  /**
   * Преобразует строковое представление состояния в enum ts-fsrs
   */
  private getStateEnum(state: StateType): State {
    switch (state) {
      case 'New':
        return State.New;
      case 'Learning':
        return State.Learning;
      case 'Review':
        return State.Review;
      case 'Relearning':
        return State.Relearning;
      default:
        return State.New;
    }
  }

  /**
   * Преобразует строковое представление рейтинга в enum ts-fsrs
   */
  private getRatingEnum(rating: RatingType): Rating {
    switch (rating) {
      case 'Manual':
        return Rating.Manual;
      case 'Again':
        return Rating.Again;
      case 'Hard':
        return Rating.Hard;
      case 'Good':
        return Rating.Good;
      case 'Easy':
        return Rating.Easy;
      default:
        return Rating.Good;
    }
  }

  /**
   * Применяет оценку к FSRS карточке по алгоритму FSRS
   */
  async applyRating(cardId: string, rating: RatingType): Promise<FsrsCard> {
    const fsrsCard = await this.fsrsCardRepository.findByCardId(cardId);
    if (!fsrsCard) {
      throw new Error('FsrsCard not found');
    }

    // Преобразуем доменную карточку в формат ts-fsrs
    const fsrsApiCard = this.toFsrsApiCard(fsrsCard);

    // Применяем оценку
    const now = new Date();
    const ratingEnum = this.getRatingEnum(rating);

    // Если оценка не Manual, то обновляем карточку с помощью FSRS
    if (ratingEnum !== Rating.Manual) {
      const result = this.fsrsInstance.next(fsrsApiCard, now, ratingEnum);

      // Копируем обновленные данные из результата FSRS в нашу доменную карточку
      fsrsCard.due = result.card.due;
      fsrsCard.stability = result.card.stability;
      fsrsCard.difficulty = result.card.difficulty;
      fsrsCard.elapsed_days = result.card.elapsed_days;
      fsrsCard.scheduled_days = result.card.scheduled_days;
      fsrsCard.reps = result.card.reps;
      fsrsCard.lapses = result.card.lapses;
      fsrsCard.state = states[result.card.state];
      fsrsCard.last_review = now;
    }

    // Сохраняем обновленную карточку
    const updatedFsrsCard = await this.fsrsCardRepository.update(
      fsrsCard.id,
      fsrsCard,
    );
    if (!updatedFsrsCard) {
      throw new Error('Failed to update FsrsCard');
    }

    return updatedFsrsCard;
  }

  /**
   * Оценить карточку и обновить ее состояние (перенесено из CardsService)
   */
  async gradeCard(
    cardId: string,
    rating: RatingType,
    userId: User['id'],
  ): Promise<{ card: Card; fsrsCard: FsrsCard }> {
    const card = await this.cardRepository.findById(cardId);
    if (!card) {
      throw new NotFoundException(t('fsrs.errors.cardNotFound'));
    }

    // Проверяем, что пользователь является владельцем карточки
    if (card.userId !== String(userId)) {
      throw new ForbiddenException(t('fsrs.errors.noPermission'));
    }

    // Применяем оценку с помощью FSRS
    const fsrsCard = await this.applyRating(cardId, rating);

    return { card, fsrsCard };
  }

  /**
   * Приостановить карточку до указанной даты (перенесено из CardsService)
   */
  async suspendCard(
    cardId: string,
    until: Date,
    userId?: string,
  ): Promise<{ card: Card; fsrsCard: FsrsCard }> {
    const card = await this.cardRepository.findById(cardId);
    if (!card) {
      throw new NotFoundException(t('fsrs.errors.cardNotFound'));
    }

    // Проверяем права доступа, если передан userId
    if (userId && card.userId !== userId) {
      throw new ForbiddenException(t('fsrs.errors.noPermission'));
    }

    const fsrsCard = await this.fsrsCardRepository.findByCardId(cardId);
    if (!fsrsCard) {
      throw new Error('FsrsCard not found');
    }

    fsrsCard.suspended = until;
    const updatedFsrsCard = await this.fsrsCardRepository.update(
      fsrsCard.id,
      fsrsCard,
    );
    if (!updatedFsrsCard) {
      throw new Error('Failed to update FsrsCard');
    }

    return { card, fsrsCard: updatedFsrsCard };
  }

  /**
   * Сбросить состояние карточки до начального (перенесено из CardsService)
   */
  async resetCard(
    cardId: string,
    userId?: string,
  ): Promise<{ card: Card; fsrsCard: FsrsCard }> {
    const card = await this.cardRepository.findById(cardId);
    if (!card) {
      throw new NotFoundException(t('fsrs.errors.cardNotFound'));
    }

    // Проверяем права доступа, если передан userId
    if (userId && card.userId !== userId) {
      throw new ForbiddenException(t('fsrs.errors.noPermission'));
    }

    const fsrsCard = await this.fsrsCardRepository.findByCardId(cardId);
    if (!fsrsCard) {
      throw new Error('FsrsCard not found');
    }

    // Сбрасываем состояние карточки до начального
    const now = new Date();
    const emptyCard = createEmptyCard();

    fsrsCard.state = states[emptyCard.state];
    fsrsCard.due = emptyCard.due;
    fsrsCard.stability = emptyCard.stability;
    fsrsCard.difficulty = emptyCard.difficulty;
    fsrsCard.elapsed_days = emptyCard.elapsed_days;
    fsrsCard.scheduled_days = emptyCard.scheduled_days;
    fsrsCard.reps = emptyCard.reps;
    fsrsCard.lapses = emptyCard.lapses;
    fsrsCard.suspended = now;
    fsrsCard.last_review = undefined;

    const updatedFsrsCard = await this.fsrsCardRepository.update(
      fsrsCard.id,
      fsrsCard,
    );
    if (!updatedFsrsCard) {
      throw new Error('Failed to update FsrsCard');
    }

    return { card, fsrsCard: updatedFsrsCard };
  }

  /**
   * Отменить последнюю оценку карточки (перенесено из CardsService)
   */
  async undoLastGrade(
    cardId: string,
    userId?: string,
  ): Promise<{ card: Card; fsrsCard: FsrsCard }> {
    const card = await this.cardRepository.findById(cardId);
    if (!card) {
      throw new NotFoundException(t('fsrs.errors.cardNotFound'));
    }

    // Проверяем права доступа, если передан userId
    if (userId && card.userId !== userId) {
      throw new ForbiddenException(t('fsrs.errors.noPermission'));
    }

    const fsrsCard = await this.undoLastRating(cardId);

    return { card, fsrsCard };
  }

  /**
   * Возвращает вероятность запоминания карточки на текущий момент
   */
  async getRetentionProbability(cardId: string): Promise<number> {
    const fsrsCard = await this.fsrsCardRepository.findByCardId(cardId);
    if (!fsrsCard) {
      throw new Error('FsrsCard not found');
    }

    // Преобразуем доменную карточку в формат ts-fsrs
    const fsrsApiCard = this.toFsrsApiCard(fsrsCard);

    // Получаем вероятность запоминания
    const now = new Date();
    const retention = this.fsrsInstance.get_retrievability(
      fsrsApiCard,
      now,
      false,
    );

    return retention;
  }

  /**
   * Предварительный просмотр результатов применения разных оценок
   */
  async previewRatings(cardId: string): Promise<
    Record<
      RatingType,
      {
        due: Date;
        interval: number;
        state: StateType;
      }
    >
  > {
    const fsrsCard = await this.fsrsCardRepository.findByCardId(cardId);
    if (!fsrsCard) {
      throw new Error('FsrsCard not found');
    }

    // Преобразуем доменную карточку в формат ts-fsrs
    const fsrsApiCard = this.toFsrsApiCard(fsrsCard);

    // Получаем предварительный просмотр для всех оценок
    const now = new Date();
    const preview = this.fsrsInstance.repeat(fsrsApiCard, now);

    // Преобразуем результаты в удобный формат
    const result: Record<
      RatingType,
      {
        due: Date;
        interval: number;
        state: StateType;
      }
    > = {} as any;

    // Пропускаем Rating.Manual, начинаем с Rating.Again (1)
    for (let i = Rating.Again; i <= Rating.Easy; i++) {
      const rating = ['Manual', 'Again', 'Hard', 'Good', 'Easy'][
        i
      ] as RatingType;
      const previewResult = preview[i];

      const due = previewResult.card.due;
      const currentDate = new Date();
      const interval = Math.round(
        (due.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      result[rating] = {
        due: previewResult.card.due,
        interval,
        state: states[previewResult.card.state] as StateType,
      };
    }

    return result;
  }

  /**
   * Находит все карточки готовые к повторению для пользователя
   */
  async findDueCards(userId: User['id']): Promise<FsrsCardWithContent[]> {
    const now = new Date();

    const fsrsCards = await this.fsrsCardRepository.findDueCards(userId, now);

    const result: FsrsCardWithContent[] = [];

    for (const fsrsCard of fsrsCards) {
      const card = await this.cardRepository.findById(fsrsCard.cardId);
      if (card) {
        result.push({
          ...fsrsCard,
          card,
        });
      }
    }

    return result;
  }

  /**
   * Находит все карточки готовые к повторению из конкретной колоды
   */
  async findDueCardsByDeckId(deckId: string): Promise<FsrsCardWithContent[]> {
    const now = new Date();

    const fsrsCards = await this.fsrsCardRepository.findDueCardsByDeckId(
      deckId,
      now,
    );

    const result: FsrsCardWithContent[] = [];

    for (const fsrsCard of fsrsCards) {
      const card = await this.cardRepository.findById(fsrsCard.cardId);
      if (card) {
        result.push({
          ...fsrsCard,
          card,
        });
      }
    }

    return result;
  }

  /**
   * Находит FSRS карточку по ID обычной карточки
   */
  async findByCardId(cardId: string): Promise<FsrsCard | null> {
    return this.fsrsCardRepository.findByCardId(cardId);
  }

  /**
   * Отменяет последнюю оценку карточки
   * Упрощенная версия - просто сбрасывает на одно повторение назад
   */
  async undoLastRating(cardId: string): Promise<FsrsCard> {
    const fsrsCard = await this.fsrsCardRepository.findByCardId(cardId);
    if (!fsrsCard) {
      throw new Error('FsrsCard not found');
    }

    // Упрощенная логика отмены: уменьшаем reps и возвращаем к предыдущему состоянию
    if (fsrsCard.reps > 0) {
      fsrsCard.reps = Math.max(0, fsrsCard.reps - 1);

      // Если reps стало 0, возвращаем к состоянию New
      if (fsrsCard.reps === 0) {
        const emptyCard = createEmptyCard();
        fsrsCard.state = states[emptyCard.state];
        fsrsCard.due = emptyCard.due;
        fsrsCard.stability = emptyCard.stability;
        fsrsCard.difficulty = emptyCard.difficulty;
        fsrsCard.elapsed_days = emptyCard.elapsed_days;
        fsrsCard.scheduled_days = emptyCard.scheduled_days;
        fsrsCard.lapses = emptyCard.lapses;
        fsrsCard.last_review = undefined;
      }
    }

    const updatedCard = await this.fsrsCardRepository.update(
      fsrsCard.id,
      fsrsCard,
    );
    if (!updatedCard) {
      throw new Error('Failed to update FsrsCard');
    }

    return updatedCard;
  }

  // Методы для совместимости с контроллером

  /**
   * Найти все FSRS карточки с пагинацией
   */
  async findAllWithPagination({
    paginationOptions,
    deckId,
  }: {
    paginationOptions: { page: number; limit: number };
    deckId?: string;
  }): Promise<FsrsCard[]> {
    return this.fsrsCardRepository.findAllWithPagination({
      paginationOptions,
      deckId,
    });
  }

  /**
   * Найти FSRS карточку по ID
   */
  async findById(id: string): Promise<FsrsCard | null> {
    return this.fsrsCardRepository.findById(id);
  }

  /**
   * Обновить FSRS карточку
   */
  async update(
    id: string,
    updateData: Partial<FsrsCard>,
  ): Promise<FsrsCard | null> {
    return this.fsrsCardRepository.update(id, updateData);
  }

  /**
   * Удалить FSRS карточку
   */
  async remove(id: string): Promise<void> {
    return this.fsrsCardRepository.remove(id);
  }

  /**
   * Создать FSRS карточку (для API совместимости)
   */
  create(): Promise<FsrsCard> {
    throw new Error('Use initializeCard method instead');
  }
}
