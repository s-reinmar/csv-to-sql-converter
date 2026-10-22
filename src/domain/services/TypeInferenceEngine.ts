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
import { INameNormalizationService } from '../contracts/INameNormalizationService';

/**
 * Serwis domenowy realizujący wnioskowanie typów danych oraz struktury tabeli SQL.
 */
export class TypeInferenceEngine implements ITypeInferenceEngine {
    private readonly matchers: TypeMatchers;
    private readonly normalizationService: INameNormalizationService;

    /**
     * Tworzy instancję silnika wnioskowania typów z wstrzykiwanymi zależnościami (Dependency Injection).
     * @param matchers Serwis zawierający predykaty walidujące typy SQL.
     * @param normalizationService Serwis normalizacji nazw kolumn i tabel.
     */
    constructor(
        matchers: TypeMatchers,
        normalizationService: INameNormalizationService
    ) {
        this.matchers = matchers;
        this.normalizationService = normalizationService;
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

            // Normalizacja nazwy kolumny do bezpiecznego identyfikatora SQL przy użyciu serwisu domenowego
            const sqlName = this.normalizationService.normalizeColumnName(header);

            return {
                originalName: header,
                sqlName,
                detectedType,
                isNullable
            };
        });

        return {
            tableName: this.normalizationService.normalizeTableName(tableName),
            columns,
            dialectOptions: {
                identifierQuote: '`',
                includeDropTable: true
            }
        };
    }
}