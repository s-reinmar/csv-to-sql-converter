# Krok 25 (src/application/SchemaOverrideService.ts): Serwis aplikacyjny umożliwiający ręczną zmianę typu danych konkretnej kolumny, zmianę nazwy kolumny lub przełączenie flagi NULL / NOT NULL przez użytkownika.

Serwis `SchemaOverrideService` umożliwia użytkownikowi ręczne nadpisanie typu danych konkretnej kolumny, zmianę nazwy kolumny lub przełączenie flagi NULL / NOT NULL w schemacie tabeli. Dzięki temu użytkownik ma pełną kontrolę nad ostatecznym schematem tabeli przed wygenerowaniem kodu SQL.

src/application/SchemaOverrideService.ts
```typescript
import { ITableSchema } from '../domain/models/TableSchema';
import { IColumnDefinition } from '../domain/models/ColumnDefinition';
import { SqlDataType } from '../domain/enums/SqlDataType';

/**
 * Serwis aplikacyjny odpowiedzialny za obsługę modyfikacji schematu tabeli (Schema Overrides)
 * dokonywanych przez użytkownika (zmiana nazwy kolumny, nadpisanie typu danych oraz flaga NULL/NOT NULL).
 */
export class SchemaOverrideService {

    /**
     * Aktualizuje nazwę kolumny o wskazanym indeksie lub oryginalnej nazwie.
     */
    public updateColumnName(
        schema: ITableSchema,
        targetOriginalName: string,
        newSqlName: string
    ): ITableSchema {
        if (!schema || !schema.columns) {
            throw new Error('Nie podano poprawnego schematu tabeli.');
        }

        const trimmedName = newSqlName ? newSqlName.trim() : '';
        if (trimmedName === '') {
            throw new Error('Nazwa kolumny nie może być pusta.');
        }

        const updatedColumns: ReadonlyArray<IColumnDefinition> = schema.columns.map((col) => {
            if (col.originalName === targetOriginalName) {
                return {
                    ...col,
                    sqlName: trimmedName
                };
            }
            return col;
        });

        return {
            ...schema,
            columns: updatedColumns
        };
    }

    /**
     * Nadpisuje typ danych kolumny (userOverrideType) wskazany przez użytkownika.
     */
    public overrideColumnType(
        schema: ITableSchema,
        targetOriginalName: string,
        newDataType: SqlDataType | undefined
    ): ITableSchema {
        if (!schema || !schema.columns) {
            throw new Error('Nie podano poprawnego schematu tabeli.');
        }

        const updatedColumns: ReadonlyArray<IColumnDefinition> = schema.columns.map((col) => {
            if (col.originalName === targetOriginalName) {
                return {
                    ...col,
                    userOverrideType: newDataType
                };
            }
            return col;
        });

        return {
            ...schema,
            columns: updatedColumns
        };
    }

    /**
     * Przełącza flagę dopuszczalności wartości NULL (isNullable) dla wskazanej kolumny.
     */
    public toggleColumnNullable(
        schema: ITableSchema,
        targetOriginalName: string,
        isNullable: boolean
    ): ITableSchema {
        if (!schema || !schema.columns) {
            throw new Error('Nie podano poprawnego schematu tabeli.');
        }

        const updatedColumns: ReadonlyArray<IColumnDefinition> = schema.columns.map((col) => {
            if (col.originalName === targetOriginalName) {
                return {
                    ...col,
                    isNullable
                };
            }
            return col;
        });

        return {
            ...schema,
            columns: updatedColumns
        };
    }

    /**
     * Aktualizuje nazwę całej tabeli docelowej.
     */
    public updateTableName(schema: ITableSchema, newTableName: string): ITableSchema {
        if (!schema) {
            throw new Error('Nie podano poprawnego schematu tabeli.');
        }

        const trimmed = newTableName ? newTableName.trim() : '';
        if (trimmed === '') {
            throw new Error('Nazwa tabeli nie może być pusta.');
        }

        return {
            ...schema,
            tableName: trimmed
        };
    }
}
```

## Podsumowanie i weryfikacja (Faza 6, Krok 25)

### [SOLID CHECK]
- Zasada pojedynczej odpowiedzialności (SRP): Serwis `SchemaOverrideService` koncentruje się wyłącznie na logice modyfikacji schematu tabeli, umożliwiając użytkownikowi zmianę nazw kolumn, nadpisanie typów danych oraz przełączanie flagi NULL/NOT NULL. Nie zajmuje się parsowaniem plików CSV ani generowaniem kodu SQL, co zapewnia klarowny podział odpowiedzialności.
- Zasada otwarte/zamknięte (OCP): Serwis jest otwarty na rozszerzenia (można dodać nowe metody modyfikacji schematu), ale zamknięty na modyfikacje istniejącej logiki, co pozwala na łatwe wprowadzanie nowych funkcjonalności bez ryzyka naruszenia istniejącego kodu.
- Zasada podstawienia Liskov (LSP): Serwis `SchemaOverrideService` może być używany w kontekście interfejsu `ITableSchema` bez naruszania poprawności działania, co umożliwia jego integrację z innymi komponentami systemu, które oczekują schematu tabeli.

### [INTERFACE SUMMARY]
Serwis `SchemaOverrideService` operuje na interfejsie `ITableSchema`, który definiuje strukturę schematu tabeli, w tym listę kolumn (`IColumnDefinition`) oraz nazwę tabeli. Metody serwisu przyjmują schemat tabeli jako argument i zwracają nową instancję schematu z wprowadzonymi zmianami, zachowując niemutowalność danych.

### [REFACTORING ALERT]
- Serwis `SchemaOverrideService` jest całkowicie odizolowany od warstwy prezentacji i logiki biznesowej, co pozwala na łatwe testowanie i utrzymanie kodu. Wszelkie zmiany w schemacie tabeli są realizowane poprzez tworzenie nowych instancji schematu, co zapewnia spójność i bezpieczeństwo danych w całej aplikacji. Metody serwisu są zaprojektowane w sposób, który minimalizuje ryzyko błędów i zapewnia czytelność kodu, a także umożliwia łatwe rozszerzanie funkcjonalności w przyszłości.