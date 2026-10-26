/**
 * @file DataValidationService.ts
 * @description Serwis domenowy odpowiedzialny za walidację danych CSV
 * i zbieranie ostrzeżeń dotyczących struktury, zawartości oraz typów.
 */

import {IDataValidator} from '../contracts/IDataValidator';
import {IValidationError} from '../contracts/IValidationError';
import {ICsvParseResult} from '../contracts/ICsvParser';
import {ITableSchema} from '../models/TableSchema';
import {TypeMatchers} from './TypeMatchers';
import {SqlDataType} from '../enums/SqlDataType';

/**
 * Implementacja serwisu walidacyjnego analizującego sparsowane dane CSV
 * i kolekcjonującego ostrzeżenia dotyczące brakujących wartości,
 * niedopasowanych typów i innych potencjalnych problemów.
 */
export class DataValidationService implements IDataValidator {
    private readonly matchers: TypeMatchers;

    constructor(matchers: TypeMatchers = new TypeMatchers()) {
        this.matchers = matchers;
    }

    /**
     * Przeprowadza pełną walidację danych CSV w kontekście schematu tabeli.
     * @param parseResult Wynik parsowania CSV (nagłówki i wiersze)
     * @param schema Schemat tabeli z informacjami o typach i kolumnach
     * @returns Tablica ostrzeżeń; pusta tablica = brak problemów
     */
    public validate(
        parseResult: ICsvParseResult,
        schema: ITableSchema
    ): ReadonlyArray<IValidationError> {
        const warnings: IValidationError[] = [];

        // 1. Walidacja liczby kolumn
        this.validateColumnCount(parseResult, warnings);

        // 2. Walidacja zawartości per kolumna
        this.validateColumnData(parseResult, schema, warnings);

        // 3. Walidacja liczby wierszy
        this.validateRowCount(parseResult, warnings);

        return warnings;
    }

    /**
     * Sprawdza, czy liczba kolumn w wierszach zgadza się z nagłówkami.
     */
    private validateColumnCount(
        parseResult: ICsvParseResult,
        warnings: IValidationError[]
    ): void {
        const headerCount = parseResult.headers.length;
        const inconsistentRows: number[] = [];

        for (const row of parseResult.rows) {
            if (row.cells.length !== headerCount) {
                inconsistentRows.push(row.rowIndex);
            }
        }

        if (inconsistentRows.length > 0) {
            warnings.push({
                message: `${inconsistentRows.length} wiersz(ów) ma niezgodną liczbę kolumn (wiersz nr: ${inconsistentRows.slice(0, 5).join(', ')}${inconsistentRows.length > 5 ? ', ...' : ''}).`
            });
        }
    }

    /**
     * Sprawdza zawartość każdej kolumny pod kątem typów i brakujących wartości.
     */
    private validateColumnData(
        parseResult: ICsvParseResult,
        schema: ITableSchema,
        warnings: IValidationError[]
    ): void {
        schema.columns.forEach((column, columnIndex) => {
            const columnData = this.extractColumnValues(parseResult, columnIndex);
            this.validateColumnValues(
                column.originalName,
                columnData,
                column.userOverrideType ?? column.detectedType,
                column.isNullable,
                warnings
            );
        });
    }

    /**
     * Sprawdza poszczególne wartości kolumny pod kątem dopasowania do wykrytego typu.
     */
    private validateColumnValues(
        columnName: string,
        values: ReadonlyArray<string>,
        detectedType: SqlDataType,
        isNullable: boolean,
        warnings: IValidationError[]
    ): void {
        const mismatchedRows: number[] = [];
        const nullRows: number[] = [];

        values.forEach((value, idx) => {
            const isTextType = detectedType === SqlDataType.VARCHAR || detectedType === SqlDataType.TEXT;
            const isNull = value === '' || (!isTextType && value.trim().toUpperCase() === 'NULL');
            if (isNull) {
                if (!isNullable) {
                    nullRows.push(idx);
                }
                return;
            }

            const matches = this.valueMatchesType(value, detectedType);
            if (!matches) {
                mismatchedRows.push(idx);
            }
        });

        if (nullRows.length > 0) {
            warnings.push({
                message: `Kolumna "${columnName}" ma wartości NULL mimo ustawienia NOT NULL (wiersze: ${this.formatRowNumbers(nullRows)}).`
            });
        }

        if (mismatchedRows.length > 0) {
            warnings.push({
                message: `Kolumna "${columnName}" (typ: ${detectedType}) zawiera ${mismatchedRows.length} wartość/wartości niezgodne z typem (wiersze: ${this.formatRowNumbers(mismatchedRows)}).`
            });
        }
    }

    /**
     * Sprawdza, czy dana wartość pasuje do określonego typu SQL.
     */
    private valueMatchesType(value: string, dataType: SqlDataType): boolean {
        const trimmed = value.trim();

        switch (dataType) {
            case SqlDataType.INTEGER:
                return this.matchers.isInteger(trimmed);
            case SqlDataType.DECIMAL:
                return this.matchers.isDecimal(trimmed);
            case SqlDataType.BOOLEAN:
                return this.matchers.isBoolean(trimmed);
            case SqlDataType.DATE:
                return this.matchers.isDate(trimmed);
            case SqlDataType.DATETIME:
                // Brak dedykowanego matchera, przyjmujemy jako tekst
                return true;
            case SqlDataType.VARCHAR:
            case SqlDataType.TEXT:
            default:
                // Wszystkie wartości są ważne dla VARCHAR/TEXT
                return true;
        }
    }

    /**
     * Wyodrębnia wartości danej kolumny ze wszystkich wierszy.
     */
    private extractColumnValues(
        parseResult: ICsvParseResult,
        columnIndex: number
    ): ReadonlyArray<string> {
        return parseResult.rows.map(row => row.cells[columnIndex]?.rawValue ?? '');
    }

    private formatRowNumbers(indexes: ReadonlyArray<number>): string {
        const rows = indexes.slice(0, 3).map(index => index + 1);
        return `${rows.join(', ')}${indexes.length > 3 ? ', ...' : ''}`;
    }

    /**
     * Sprawdza, czy liczba wierszy nie jest alarmująco mała.
     */
    private validateRowCount(
        parseResult: ICsvParseResult,
        warnings: IValidationError[]
    ): void {
        if (parseResult.rows.length === 0) {
            warnings.push({
                message: 'Plik CSV zawiera tylko nagłówki, brak wierszy danych.'
            });
        } else if (parseResult.rows.length === 1) {
            warnings.push({
                message: 'Plik CSV zawiera tylko jeden wiersz danych — schemat może być niedostatecznie reprezentatywny.'
            });
        }
    }
}