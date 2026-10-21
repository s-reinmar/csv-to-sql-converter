/**
 * @file CsvRow.ts
 * @description Definicja struktur reprezentujących surowe wiersze, komórki oraz wynik wstępnego parsowania pliku CSV.
 */

/**
 * Reprezentuje pojedynczą komórkę w wierszu pliku CSV.
 */
export interface ICsvCell {
    /** Surowa wartość tekstowa odczytana z komórki */
    readonly rawValue: string;

    /** Indeks kolumny w wierszu */
    readonly columnIndex: number;
}

/**
 * Reprezentuje pojedynczy wiersz danych po wstępnym sparsowaniu pliku CSV.
 */
export interface ICsvRow {
    /** Numer wiersza w pliku źródłowym (1-indexed, pomijając nagłówek) */
    readonly rowIndex: number;

    /** Tablica komórek wchodzących w skład wiersza */
    readonly cells: ReadonlyArray<ICsvCell>;

    /** Słownik mapujący nazwy kolumn bezpośrednio na surowe wartości tekstowe */
    readonly values: Readonly<Record<string, string>>;
}