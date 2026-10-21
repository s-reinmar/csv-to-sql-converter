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