import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AllConfigType } from './config/config.type';

// Конфигурация
import appConfig from './config/app.config';
import authConfig from './auth/config/auth.config';
import databaseConfig from './database/config/database.config';
import fileConfig from './files/config/file.config';
import mailConfig from './mail/config/mail.config';

// Модули
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { SessionModule as AuthSessionModule } from './session/session.module';
import { MailModule } from './mail/mail.module';
import { MailerModule } from './mailer/mailer.module';
import { HomeModule } from './home/home.module';
import { TelegramAuthModule } from './telegram-auth/telegram-auth.module';

// Модули для карточек
import { DecksModule } from './decks/decks.module';
import { CardsModule } from './cards/cards.module';
import { ReviewLogsModule } from './review-logs/review-logs.module';
import { FsrsModule } from './fsrs/fsrs.module';
import { SessionModule } from './session/session.module';

// I18n
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import path from 'path';

const infrastructureDatabaseModule = TypeOrmModule.forRootAsync({
  useClass: TypeOrmConfigService,
  dataSourceFactory: async (options: DataSourceOptions) => {
    return new DataSource(options).initialize();
  },
});

import { NotesModule } from './notes/notes.module';

import { StatisticsModule } from './statistics/statistics.module';

import { MarketDecksModule } from './market-decks/market-decks.module';

import { MarketCommentsModule } from './market-comments/market-comments.module';

@Module({
  imports: [
    MarketCommentsModule,
    MarketDecksModule,
    NotesModule,
    // Конфигурация
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig, appConfig, mailConfig, fileConfig],
      envFilePath: ['.env'],
    }),

    // База данных
    infrastructureDatabaseModule,

    // I18n
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
          infer: true,
        }),
        loaderOptions: { path: path.join(__dirname, '/i18n/'), watch: true },
      }),
      resolvers: [
        {
          use: HeaderResolver,
          useFactory: (configService: ConfigService<AllConfigType>) => {
            return [
              configService.get('app.headerLanguage', {
                infer: true,
              }),
            ];
          },
          inject: [ConfigService],
        },
      ],
      imports: [ConfigModule],
      inject: [ConfigService],
    }),

    // Основные модули
    StatisticsModule,
    TelegramAuthModule,
    UsersModule,
    FilesModule,
    AuthModule,
    AuthSessionModule,
    MailModule,
    MailerModule,
    HomeModule,

    // Модули для карточек
    DecksModule,
    CardsModule,
    ReviewLogsModule,
    FsrsModule,
    SessionModule,
  ],
})
export class AppModule {}
