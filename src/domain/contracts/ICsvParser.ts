/**
 * @file ICsvParser.ts
 * @description Kontrakt dla serwisu parsującego surowy tekst CSV do ustrukturyzowanego modelu domenowego.
 */

import { ICsvRow } from '../models/CsvRow';

/**
 * Reprezentuje wynik parsowania surowego pliku CSV.
 */
export interface ICsvParseResult {
    /** Lista nagłówków kolumn wyodrębniona z pierwszego wiersza pliku CSV */
    readonly headers: ReadonlyArray<string>;

    /** Lista sparsowanych wierszy danych w pliku CSV */
    readonly rows: ReadonlyArray<ICsvRow>;
}

/**
 * Kontrakt dla serwisu odpowiedzialnego za przekształcanie surowego tekstu CSV na ustrukturyzowany model domenowy.
 */
export interface ICsvParser {
    /**
     * Parsuje zawartość tekstową pliku CSV do ustrukturyzowanego wyniku zawierającego nagłówki i wiersze.
     * @param csvContent Surowa zawartość tekstowa pliku CSV.
     * @param delimiter Opcjonalny separator kolumn (np. ',' lub ';').
     */
    parse(csvContent: string, delimiter?: string): ICsvParseResult;
}