/**
 * @file TableSchema.ts
 * @description Definicja pełnego schematu tabeli docelowej w procesie konwersji CSV do SQL.
 */

import { IColumnDefinition } from './ColumnDefinition';

/**
 * Opcje konfiguracyjne dialektu SQL dla generowanej tabeli.
 */
export interface ISqlDialectOptions {
    /** Znaki używane do otaczania identyfikatorów w zapytaniach SQL (np. backticks `` ` ``, cudzysłowy `"` lub brak) */
    readonly identifierQuote: '`' | '"' | '';

    /** Czy dołączać instrukcję DROP TABLE IF EXISTS przed CREATE TABLE */
    readonly includeDropTable: boolean;
}

/**
 * Reprezentuje pełny, niemutowalny schemat tabeli docelowej.
 */
export interface ITableSchema {
    /** Nazwa docelowa tabeli w bazie danych */
    readonly tableName: string;

    /** Zbiór definicji kolumn wchodzących w skład schematu tabeli */
    readonly columns: ReadonlyArray<IColumnDefinition>;

    /** Opcje dialektu SQL używane podczas generowania kodu */
    readonly dialectOptions: ISqlDialectOptions;
}