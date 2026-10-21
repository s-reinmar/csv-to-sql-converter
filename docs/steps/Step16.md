# Krok 16 (src/domain/services/TypeInferenceEngine.ts): Implementacja ITypeInferenceEngine – agregacja wyników z TypeMatchers dla wszystkich wierszy w kolumnie, wykrywanie wartości NULL i dobór najbardziej precyzyjnego typu domyślnego.

Implementacja `TypeInferenceEngine` realizuje kontrakt `ITypeInferenceEngine`, agregując wyniki z `TypeMatchers` dla wszystkich wierszy w kolumnie, wykrywając wartości NULL i dobierając najbardziej precyzyjny typ domyślny. Klasa ta jest kluczowa dla automatycznego wykrywania typów danych w kolumnach CSV przed generowaniem skryptów SQL.

src/domain/services/TypeInferenceEngine.ts
```typescript
/**
 * @file TypeInferenceEngine.ts
 * @description Implementacja interfejsu ITypeInferenceEngine odpowiedzialna za automatyczne
 * wnioskowanie typów danych SQL oraz budowę schematu tabeli na podstawie danych z pliku CSV.
 */

import { ITypeInferenceEngine } from '../contracts/ITypeInferenceEngine';
import { SqlDataType } from '../enums/SqlDataType';
import { ITableSchema } from '../models/TableSchema';
import { IColumnDefinition } from '../models/ColumnDefinition';
import { ICsvRow } from '../models/CsvRow';
import { TypeMatchers } from './TypeMatchers';

/**
 * Serwis domenowy realizujący wnioskowanie typów danych oraz struktury tabeli SQL.
 */
export class TypeInferenceEngine implements ITypeInferenceEngine {
    private readonly matchers: TypeMatchers;

    /**
     * Tworzy instancję silnika wnioskowania typów z wstrzykiwanym matcherem (Dependency Injection).
     * @param matchers Serwis zawierający predykaty walidujące typy SQL.
     */
    constructor(matchers: TypeMatchers) {
        this.matchers = matchers;
    }

    /**
     * Wnioskuje najbardziej precyzyjny typ danych SQL na podstawie tablicy próbek tekstowych z kolumny.
     * @param sampleValues Tablica surowych wartości tekstowych z danej kolumny.
     */
    public inferColumnType(sampleValues: ReadonlyArray<string>): SqlDataType {
        const nonNullValues = sampleValues.filter(val => val !== null && val !== undefined && val.trim() !== '');

        if (nonNullValues.length === 0) {
            return SqlDataType.VARCHAR; // Domyślny typ dla pustych kolumn
        }

        // 1. Sprawdzenie czy wszystkie wartości to INTEGER
        const allIntegers = nonNullValues.every(val => this.matchers.isInteger(val));
        if (allIntegers) {
            return SqlDataType.INTEGER;
        }

        // 2. Sprawdzenie czy wszystkie wartości to DECIMAL
        const allDecimals = nonNullValues.every(val => this.matchers.isDecimal(val));
        if (allDecimals) {
            return SqlDataType.DECIMAL;
        }

        // 3. Sprawdzenie czy wszystkie wartości to BOOLEAN
        const allBooleans = nonNullValues.every(val => this.matchers.isBoolean(val));
        if (allBooleans) {
            return SqlDataType.BOOLEAN;
        }

        // 4. Sprawdzenie czy wszystkie wartości to DATE
        const allDates = nonNullValues.every(val => this.matchers.isDate(val));
        if (allDates) {
            return SqlDataType.DATE;
        }

        // 5. Analiza pod kątem długości tekstów dla VARCHAR vs TEXT
        const maxLength = Math.max(...nonNullValues.map(val => val.length));
        if (maxLength > 255) {
            return SqlDataType.TEXT;
        }

        return SqlDataType.VARCHAR;
    }

    /**
     * Wnioskuje pełny schemat tabeli SQL na podstawie nagłówków oraz wierszy danych.
     * @param headers Tablica nagłówków kolumn.
     * @param rows Tablica sparsowanych wierszy CSV.
     * @param tableName Nazwa docelowa tabeli w bazie danych.
     */
    public inferTableSchema(
        headers: ReadonlyArray<string>,
        rows: ReadonlyArray<ICsvRow>,
        tableName: string
    ): ITableSchema {
        const columns: IColumnDefinition[] = headers.map((header, colIndex) => {
            // Ekstrakcja próbek wartości dla danej kolumny ze wszystkich wierszy
            const columnValues = rows.map(row => {
                const cell = row.cells.find(c => c.columnIndex === colIndex);
                return cell ? cell.rawValue : '';
            });

            // Określenie czy kolumna zawiera jakiekolwiek wartości puste (NULL)
            const hasEmptyValues = columnValues.some(val => !val || val.trim() === '');
            const isNullable = hasEmptyValues || rows.length === 0;

            // Wnioskowanie typu danych
            const detectedType = this.inferColumnType(columnValues);

            // Normalizacja nazwy kolumny do bezpiecznego identyfikatora SQL
            const sqlName = this.normalizeColumnName(header);

            return {
                originalName: header,
                sqlName,
                detectedType,
                isNullable
            };
        });

        return {
            tableName: this.normalizeTableName(tableName),
            columns,
            dialectOptions: {
                identifierQuote: '`',
                includeDropTable: true
            }
        };
    }

    /**
     * Normalizuje nazwę kolumny do bezpiecznego formatu identyfikatora SQL.
     * @param originalName Oryginalna nazwa kolumny.
     */
    private normalizeColumnName(originalName: string): string {
        const trimmed = originalName.trim();
        if (!trimmed) {
            return 'column_unnamed';
        }

        return trimmed
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^(_+)/, '')
            .replace(/(_+)$/, '');
    }

    /**
     * Normalizuje nazwę tabeli do bezpiecznego formatu SQL.
     * @param rawTableName Oryginalna nazwa tabeli.
     */
    private normalizeTableName(rawTableName: string): string {
        const trimmed = rawTableName.trim();
        if (!trimmed) {
            return 'imported_table';
        }

        return trimmed
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '_')
            .replace(/_+/g, '_');
    }
}
```

## Podsumowanie i weryfikacja (Faza 3, Krok 16)

### [SOLID CHECK]
1. **Zasada pojedynczej odpowiedzialności (SRP):** Klasa `TypeInferenceEngine` skupia się wyłącznie na algorytmie wnioskowania typów danych SQL na podstawie próbek z kolumn oraz budowie pełnego schematu tabeli (`TableSchema`), delegując walidację pojedynczych wartości do serwisu `TypeMatchers`.
2. **Odwrócenie zależności (DIP):** Implementuje kontrakt `ITypeInferenceEngine`, a zależność od `TypeMatchers` jest wstrzykiwana przez konstruktor, co zapewnia pełną izolację, elastyczność i łatwość testów jednostkowych.

### [INTERFACE SUMMARY]
* `TypeInferenceEngine`: Klasa implementująca kontrakt `ITypeInferenceEngine`, zawierająca metody `inferColumnType` oraz `inferTableSchema`.

### [REFACTORING ALERT]
Brak zastrzeżeń architektonicznych – silnik wnioskowania operuje na czystych funkcjach, wstrzykuje zależności przez konstruktor (DIP), nie korzysta z typu any oraz spełnia założenia Headless Architecture.