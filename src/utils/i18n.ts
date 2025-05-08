import { I18nContext } from 'nestjs-i18n';

/**
 * Возвращает текущий контекст i18n или выбрасывает ошибку, если он недоступен
 * Это упрощает проверку и получение контекста в сервисах и контроллерах
 */
export function getI18n(): I18nContext {
  const i18n = I18nContext.current();
  if (!i18n) {
    throw new Error('I18nContext is not available');
  }
  return i18n;
}

/**
 * Переводит ключ с помощью i18n
 * @param key Ключ перевода
 * @param args Аргументы для подстановки в перевод
 * @returns Переведенная строка
 */
export function t(key: string, args?: Record<string, any>): string {
  return getI18n().t(key, args);
}
