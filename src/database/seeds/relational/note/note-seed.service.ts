import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoteEntity } from '../../../../notes/infrastructure/persistence/relational/entities/note.entity';
import { CardEntity } from '../../../../cards/infrastructure/persistence/relational/entities/card.entity';
import { v4 as uuidv4 } from 'uuid';
import { japaneseContents } from './data/japanese';
import { mathContents } from './data/math';
import { englishContents } from './data/english';
import { jsContents } from './data/javascript';
import { geographyContents } from './data/geography';

export interface NoteContent {
  question: string;
  answer: string;
  tags?: string[];
}

@Injectable()
export class NoteSeedService {
  constructor(
    @InjectRepository(NoteEntity)
    private noteRepository: Repository<NoteEntity>,
    @InjectRepository(CardEntity)
    private cardRepository: Repository<CardEntity>,
  ) {}

  async run() {
    const notesCount = await this.noteRepository.count();

    if (!notesCount) {
      // Получаем все карточки без содержимого
      const cards = await this.cardRepository.find();

      if (cards.length === 0) {
        console.log('Не найдено карточек для создания заметок. Пропускаем...');
        return;
      }

      // Определим контент для разных типов колод

      // Распределим заметки по карточкам в зависимости от deckId
      for (const card of cards) {
        // Создаем заметку в зависимости от колоды
        let noteContent: NoteContent | null = null;

        // Найдем колоду для карточки
        const deck = await this.cardRepository
          .createQueryBuilder('card')
          .innerJoinAndSelect('card.deck', 'deck')
          .where('card.id = :id', { id: card.id })
          .getOne();

        if (!deck) {
          console.log(
            `Не найдена колода для карточки с ID ${card.id}. Пропускаем...`,
          );
          continue;
        }

        // Выберем контент в зависимости от названия колоды
        const deckName = deck.deck.name;

        if (deckName.includes('Японский')) {
          noteContent = japaneseContents.pop() || null;
        } else if (deckName.includes('Математика')) {
          noteContent = mathContents.pop() || null;
        } else if (deckName.includes('Английский')) {
          noteContent = englishContents.pop() || null;
        } else if (deckName.includes('JavaScript')) {
          noteContent = jsContents.pop() || null;
        } else if (deckName.includes('География')) {
          noteContent = geographyContents.pop() || null;
        }

        // Если не нашли подходящий контент, используем заглушку
        if (!noteContent) {
          noteContent = {
            question: `Вопрос для карточки в колоде "${deckName}"`,
            answer: `Ответ для карточки в колоде "${deckName}"`,
          };
        }

        // Создаем заметку
        await this.noteRepository.save(
          this.noteRepository.create({
            id: uuidv4(),
            cardId: card.id,
            question: noteContent.question,
            answer: noteContent.answer,
            extend: noteContent.tags,
            deleted: false,
          }),
        );
      }
    }
  }
}
