/**
 * @file CsvParser.ts
 * @description Implementacja interfejsu ICsvParser odpowiedzialna za ekstrakcję nagłówków,
 * walidację spójności liczby kolumn oraz budowę ustrukturyzowanych obiektów wierszy.
 */

import { ICsvParser, ICsvParseResult } from '../contracts/ICsvParser';
import { ICsvRow, ICsvCell } from '../models/CsvRow';
import { CsvTokenizer } from './CsvTokenizer';
/**
 * Główny serwis domenowy parsujący surowy tekst CSV do ustrukturyzowanego modelu domenowego.
 */
export class CsvParser implements ICsvParser {
    private readonly tokenizer: CsvTokenizer;

    /**
     * Tworzy instancję parsera CSV z wstrzykiwanym tokenizatorem (Dependency Injection).
     * @param tokenizer Komponent odpowiedzialny za bezpieczną tokenizację pojedynczych linii CSV.
     */
    constructor(tokenizer: CsvTokenizer) {
        this.tokenizer = tokenizer;
    }

    /**
     * Parsuje zawartość tekstową pliku CSV do ustrukturyzowanego wyniku zawierającego nagłówki i wiersze.
     * @param csvContent Surowa zawartość tekstowa pliku CSV.
     * @param delimiter Opcjonalny separator kolumn (np. ',' lub ';'). Domyślnie ','.
     */
    public parse(csvContent: string, delimiter: string = ','): ICsvParseResult {
        if (!csvContent || csvContent.trim() === '') {
            return { headers: [], rows: [] };
        }

        // Rozbicie na linie z obsługą standardowych znaków nowej linii (\r\n lub \n)
        const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);

        if (lines.length === 0) {
            return { headers: [], rows: [] };
        }

        // Ekstrakcja nagłówków z pierwszej linii pliku
        const rawHeaders = this.tokenizer.tokenizeLine(lines[0], delimiter);
        const headers = rawHeaders.map(h => h.trim());
        const expectedColumnCount = headers.length;

        const rows: ICsvRow[] = [];

        // Przetwarzanie wierszy danych (pomijając linię nagłówkową pod indeksem 0)
        for (let i = 1; i < lines.length; i++) {
            const lineIndex = i + 1; // Realny numer wiersza w pliku źródłowym (1-indexed)
            const rawTokens = this.tokenizer.tokenizeLine(lines[i], delimiter);

            // Walidacja spójności liczby kolumn w wierszu względem nagłówka
            if (rawTokens.length !== expectedColumnCount) {
                throw new Error(
                    `Błąd spójności struktury CSV w wierszu ${lineIndex}: Oczekiwano ${expectedColumnCount} kolumn, ale wykryto ${rawTokens.length}.`
                );
            }

            // Budowa komórek wiersza
            const cells: ICsvCell[] = rawTokens.map((token, colIndex) => ({
                rawValue: token,
                columnIndex: colIndex
            }));

            // Budowa słownika mapującego nazwy kolumn na surowe wartości
            const values: Record<string, string> = {};
            headers.forEach((header, colIndex) => {
                values[header] = rawTokens[colIndex];
            });

            rows.push({
                rowIndex: i, // Indeks wiersza danych (1-indexed, pomijając nagłówek)
                cells,
                values
            });
        }

        return {
            headers,
            rows
        };
    }
}