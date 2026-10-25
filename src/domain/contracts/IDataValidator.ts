/**
 * @file IDataValidator.ts
 * @description Kontrakt dla serwisu walidacji danych wejściowych (CSV).
 */

import { ICsvParseResult } from './ICsvParser';
import { ITableSchema } from '../models/TableSchema';
import { IValidationError } from './IValidationError';

/**
 * Kontrakt dla serwisu odpowiedzialnego za walidację danych CSV
 * i zbieranie ostrzeżeń (warnings) dotyczących struktury i zawartości.
 */
export interface IDataValidator {
    /**
     * Analizuje sparsowane dane CSV i zbiera ostrzeżenia dotyczące:
     * - brakujących wartości w kolumnach
     * - niedostosowanych formatów (np. niepoprawne daty)
     * - potencjalnych niezgodności typów
     *
     * @param parseResult Wynik parsowania CSV
     * @param schema Schemat tabeli (zawiera info o typach)
     * @returns Tablica ostrzeżeń; pusta tablica = brak problemów
     */
    validate(
        parseResult: ICsvParseResult,
        schema: ITableSchema
    ): ReadonlyArray<IValidationError>;
}