# Krok 8 (src/domain/models/TableSchema.ts): Definicja pełnego schematu tabeli docelowej (nazwa tabeli, lista kolumn, opcje dialektu SQL).

Definicja pełnego schematu tabeli docelowej w procesie konwersji CSV do SQL, obejmująca nazwę tabeli, listę kolumn oraz opcje dialektu SQL. Schemat ten jest niemutowalny i służy wyłącznie do przechowywania danych konfiguracyjnych dla generowania zapytań SQL.

src/domain/models/TableSchema.ts
```typescript
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
```

## Podsumowanie i weryfikacja (Faza 2, Krok 8):

### [SOLID CHECK]
Krok 8 realizuje zasadę pojedynczej odpowiedzialności (SRP), definiując pełny schemat tabeli docelowej w procesie konwersji CSV do SQL, w tym nazwy tabeli, definicje kolumn oraz opcje dialektu SQL.

### [INTERFACE SUMMARY]
Wprowadza interfejsy ISqlDialectOptions oraz ITableSchema, które umożliwiają precyzyjne określenie struktury tabeli docelowej oraz konfiguracji dialektu SQL, co jest kluczowe dla generowania poprawnych zapytań SQL.

### [REFACTORING ALERT]
Modele są całkowicie niemutowalne (readonly), co zapobiega niezamierzonym modyfikacjom stanu podczas definiowania schematu tabeli, w pełni respektując rygorystyczne zasady TypeScript (strict: true).