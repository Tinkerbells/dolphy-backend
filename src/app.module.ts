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
import telegramConfig from './config/telegram-config';

// Модули
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { SessionModule as AuthSessionModule } from './session/session.module';
import { MailModule } from './mail/mail.module';
import { MailerModule } from './mailer/mailer.module';
import { HomeModule } from './home/home.module';
import { TelegramAuthModule } from './telegram-auth/telegram-auth.module';

// Модули для карточек (обновленная архитектура)
import { DecksModule } from './decks/decks.module';
import { CardsModule } from './cards/cards.module';
import { FsrsModule } from './fsrs/fsrs.module';
import { SessionModule } from './session/session.module';

// Модули маркетплейса
import { MarketDecksModule } from './market-decks/market-decks.module';
import { MarketCommentsModule } from './market-comments/market-comments.module';

// Статистика
import { StatisticsModule } from './statistics/statistics.module';

// I18n
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import path from 'path';

const infrastructureDatabaseModule = TypeOrmModule.forRootAsync({
  useClass: TypeOrmConfigService,
  dataSourceFactory: async (options: DataSourceOptions) => {
    return new DataSource(options).initialize();
  },
});

@Module({
  imports: [
    // Конфигурация
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        authConfig,
        appConfig,
        mailConfig,
        fileConfig,
        telegramConfig,
      ],
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
    UsersModule,
    FilesModule,
    AuthModule,
    AuthSessionModule,
    MailModule,
    MailerModule,
    HomeModule,
    TelegramAuthModule,

    // Модули для карточек (обновленная архитектура)
    FsrsModule, // Алгоритм обучения
    DecksModule, // Колоды
    CardsModule, // Карточки с контентом
    SessionModule, // Сессии

    // Статистика
    StatisticsModule,

    // Маркетплейс
    MarketDecksModule,
    MarketCommentsModule,
  ],
})
export class AppModule {}
