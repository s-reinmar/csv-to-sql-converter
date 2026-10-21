/**
 * @file CsvTokenizer.ts
 * @description Moduł pomocniczy rozbijający linie tekstu CSV na tokeny z uwzględnieniem cudzysłowów, znaków ucieczki i separatorów.
 */

/**
 * Odpowiada za bezpieczną tokenizację pojedynczego wiersza tekstu CSV.
 */
export class CsvTokenizer {
    /**
     * Rozbija pojedynczą linię tekstu CSV na tablicę surowych tokenów (wartości komórek),
     * uwzględniając cudzysłowy oraz znaki ucieczki.
     *
     * @param line Pojedyncza linia tekstu CSV.
     * @param delimiter Separator kolumn (np. ',' lub ';'). Domyślnie ','.
     * @returns Niemutowalna tablica tokenów tekstowych.
     */
    public tokenizeLine(line: string, delimiter: string = ','): ReadonlyArray<string> {
        const tokens: string[] = [];
        let currentToken = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (inQuotes) {
                if (char === '"') {
                    if (nextChar === '"') {
                        // Obsługa escaped quotes ("") wewnątrz cudzysłowów
                        currentToken += '"';
                        i++; // Pomiń następny cudzysłów
                    } else {
                        // Zamknięcie bloku w cudzysłowach
                        inQuotes = false;
                    }
                } else {
                    currentToken += char;
                }
            } else {
                if (char === '"') {
                    inQuotes = true;
                } else if (char === delimiter) {
                    tokens.push(currentToken);
                    currentToken = '';
                } else {
                    currentToken += char;
                }
            }
        }

        // Dodanie ostatniego tokenu w linii
        tokens.push(currentToken);
        return tokens;
    }
}