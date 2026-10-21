/**
 * @file ITypeInferenceEngine.ts
 * @description Kontrakt dla silnika wnioskującego typy danych na podstawie próbek wartości z kolumn.
 */

import { SqlDataType } from '../enums/SqlDataType';
import { ITableSchema } from '../models/TableSchema';
import { ICsvRow } from '../models/CsvRow';

/**
 * Kontrakt dla silnika odpowiedzialnego za automatyczne rozpoznawanie typów danych SQL
 * na podstawie próbek wartości z kolumn pliku CSV.
 */
export interface ITypeInferenceEngine {
    /**
     * Wnioskuje najbardziej precyzyjny typ danych SQL na podstawie tablicy próbek tekstowych z kolumny.
     * @param sampleValues Tablica surowych wartości tekstowych z danej kolumny.
     */
    inferColumnType(sampleValues: ReadonlyArray<string>): SqlDataType;

    /**
     * Wnioskuje pełny schemat tabeli SQL na podstawie nagłówków oraz wierszy danych.
     * @param headers Tablica nagłówków kolumn.
     * @param rows Tablica sparsowanych wierszy CSV.
     * @param tableName Nazwa docelowa tabeli w bazie danych.
     */
    inferTableSchema(
        headers: ReadonlyArray<string>,
        rows: ReadonlyArray<ICsvRow>,
        tableName: string
    ): ITableSchema;
}