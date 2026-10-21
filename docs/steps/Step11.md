# Krok 11 (src/domain/contracts/ISqlGenerator.ts): Kontrakty dla budowniczych zapytań DDL (CREATE TABLE), DML (INSERT INTO) oraz głównego generatora SQL.

Kontrakty definiują interfejsy dla budowniczych zapytań SQL, umożliwiając generowanie instrukcji DDL i DML na podstawie schematu tabeli oraz danych. Interfejsy te są kluczowe dla separacji logiki generowania SQL od reszty aplikacji, co ułatwia testowanie i wymianę implementacji.

src/domain/contracts/ISqlGenerator.ts
```typescript
/**
 * @file ISqlGenerator.ts
 * @description Kontrakty dla budowniczych zapytań DDL (CREATE TABLE), DML (INSERT INTO) oraz głównego generatora SQL.
 */

import { ITableSchema } from '../models/TableSchema';
import { ICsvRow } from '../models/CsvRow';

/**
 * Kontrakt dla budowniczego instrukcji DDL (np. CREATE TABLE).
 */
export interface ISqlDdlBuilder {
    /**
     * Generuje zapytanie SQL tworzące tabelę (CREATE TABLE) na podstawie schematu.
     * @param schema Schemat tabeli zawierający definicje kolumn i opcje dialektu.
     */
    generateDdl(schema: ITableSchema): string;
}

/**
 * Kontrakt dla budowniczego instrukcji DML (np. INSERT INTO).
 */
export interface ISqlDmlBuilder {
    /**
     * Generuje instrukcje wstawiania danych (INSERT INTO) na podstawie schematu i wierszy CSV.
     * @param schema Schemat tabeli określający typy danych i nazwy kolumn.
     * @param rows Tablica sparsowanych wierszy CSV do skonwertowania na instrukcje INSERT.
     */
    generateDml(schema: ITableSchema, rows: ReadonlyArray<ICsvRow>): string;
}

/**
 * Główny kontrakt koordynatora generowania kompletnego skryptu SQL.
 */
export interface ISqlGenerator {
    /**
     * Generuje pełny skrypt SQL (nagłówki, DDL oraz DML) na podstawie schematu i wierszy.
     * @param schema Pełny schemat docelowy tabeli.
     * @param rows Sparsowane wiersze danych wejściowych.
     */
    generateSql(schema: ITableSchema, rows: ReadonlyArray<ICsvRow>): string;
}
```

## Podsumowanie i weryfikacja (Faza 2, Krok 11):

### [SOLID CHECK]
Zasada pojedynczej odpowiedzialności (SRP): Plik skupia się wyłącznie na definicji kontraktów interfejsowych dla budowniczych zapytań DDL, DML oraz głównego generatora SQL, bez implementacji logiki formatowania czy operacji I/O.
Odwrócenie zależności (DIP): Umożliwia warstwie aplikacyjnej i koordynatorom zależenienie od abstrakcji zamiast od konkretnych implementacji budowniczych SQL, co ułatwia testowanie i wymianę komponentów.

### [INTERFACE SUMMARY]
ISqlDdlBuilder: Kontrakt dla budowniczego instrukcji DDL (CREATE TABLE).
ISqlDmlBuilder: Kontrakt dla budowniczego instrukcji DML (INSERT INTO).
ISqlGenerator: Główny kontrakt koordynujący generowanie kompletnego skryptu SQL.

### [REFACTORING ALERT]
Brak zastrzeżeń architektonicznych – interfejsy operują wyłącznie na strukturach niemutowalnych (ReadonlyArray), spełniają rygorystyczne zasady TypeScript (strict: true) i są całkowicie odizolowane od warstwy prezentacji oraz I/O (Headless Architecture).