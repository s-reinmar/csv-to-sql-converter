/**
 * @file SqlDataType.ts
 * @description Definicja wspieranych typów danych SQL w procesie konwersji plików CSV.
 */

/**
 * Reprezentuje obsługiwane typy danych SQL.
 */
export enum SqlDataType {
    /** Liczba całkowita (np. INT / INTEGER) */
    INTEGER = 'INTEGER',

    /** Liczba zmiennoprzecinkowa / stałoprzecinkowa (np. DECIMAL / NUMERIC) */
    DECIMAL = 'DECIMAL',

    /** Wartość logiczna prawda/fałsz (np. BOOLEAN / BOOL) */
    BOOLEAN = 'BOOLEAN',

    /** Data w formacie YYYY-MM-DD (np. DATE) */
    DATE = 'DATE',

    /** Data wraz z czasem w formacie YYYY-MM-DD HH:MM:SS (np. DATETIME / TIMESTAMP) */
    DATETIME = 'DATETIME',

    /** Krótki tekst o zmiennej długości (np. VARCHAR) */
    VARCHAR = 'VARCHAR',

    /** Długi tekst / blok danych (np. TEXT / LONGTEXT) */
    TEXT = 'TEXT'
}