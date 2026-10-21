/**
 * @file ColumnDefinition.ts
 * @description Definicja niemutowalnego interfejsu opisującego pojedynczą kolumnę tabeli bazodanowej.
 */

import { SqlDataType } from '../enums/SqlDataType';

/**
 * Reprezentuje niemutowalną definicję kolumny w schemacie tabeli SQL.
 */
export interface IColumnDefinition {
    /** Oryginalna nazwa kolumny odczytana z nagłówka pliku CSV */
    readonly originalName: string;

    /** Znormalizowana nazwa kolumny bezpieczna dla języka SQL */
    readonly sqlName: string;

    /** Typ danych automatycznie wykryty przez silnik wnioskowania na podstawie zawartości */
    readonly detectedType: SqlDataType;

    /** Typ danych nadpisany ręcznie przez użytkownika w formularzu (opcjonalny) */
    readonly userOverrideType?: SqlDataType;

    /** Flaga określająca, czy kolumna może zawierać wartości NULL (true) czy wymaga NOT NULL (false) */
    readonly isNullable: boolean;
}