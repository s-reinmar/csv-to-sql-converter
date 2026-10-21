# Krok 7 (src/domain/models/CsvRow.ts): Definicja struktur reprezentujących surowe wiersze, komórki oraz wynik wstępnego parsowania pliku CSV.

Definicja struktur reprezentujących surowe wiersze, komórki oraz wynik wstępnego parsowania pliku CSV, które są wykorzystywane w procesie konwersji danych z formatu CSV do SQL. Struktury te są niemutowalne i służą wyłącznie do przechowywania danych bez logiki operacyjnej.

src/domain/models/CsvRow.ts
```typescript
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
```

## Podsumowanie i weryfikacja (Faza 2, Krok 7):

### [SOLID CHECK]
Krok 7 realizuje zasadę pojedynczej odpowiedzialności (SRP), definiując struktury danych wyłącznie dla surowego wiersza i komórek wynikowych parsowania pliku CSV, całkowicie bez domieszki logiki operacyjnej. Odpowiada za czysty model danych (Clean Architecture) bez wiedzy o warstwie prezentacji.

### [INTERFACE SUMMARY]
Wprowadza interfejsy ICsvCell oraz ICsvRow, reprezentujące pojedynczą komórkę oraz wiersz danych z uwzględnieniem indeksów i mapowania klucz-wartość.

### [REFACTORING ALERT]
Modele są całkowicie niemutowalne (readonly), co zapobiega niezamierzonym modyfikacjom stanu podczas parsowania i wnioskowania typów, w pełni respektując rygorystyczne zasady TypeScript (strict: true).