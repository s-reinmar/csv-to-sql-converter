/**
 * @file CsvParser.ts
 * @description Implementacja interfejsu ICsvParser odpowiedzialna za ekstrakcję nagłówków,
 * walidację spójności liczby kolumn oraz budowę ustrukturyzowanych obiektów wierszy.
 */

import {ICsvParser, ICsvParseResult} from '../contracts/ICsvParser';
import {ICsvRow, ICsvCell} from '../models/CsvRow';
import {CsvTokenizer} from './CsvTokenizer';

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
            throw new Error('Plik CSV jest pusty i nie zawiera nagłówków.');
        }

        const records = this.tokenizer.tokenizeRecords(csvContent, delimiter);
        if (records.length === 0) {
            throw new Error('Plik CSV jest pusty i nie zawiera nagłówków.');
        }

        const headers = records[0].map(header => header.trim());
        if (headers.some(header => header.length === 0)) {
            throw new Error('Każda kolumna w pliku CSV musi mieć nazwę nagłówka.');
        }
        if (new Set(headers).size !== headers.length) {
            throw new Error('Plik CSV zawiera powtarzające się nazwy kolumn.');
        }

        const expectedColumnCount = headers.length;

        const rows: ICsvRow[] = [];

        for (let i = 1; i < records.length; i++) {
            const rowIndex = rows.length + 1;
            const rawTokens = records[i];

            if (rawTokens.length !== expectedColumnCount) {
                throw new Error(
                    `Błąd spójności struktury CSV w wierszu danych ${rowIndex}: Oczekiwano ${expectedColumnCount} kolumn, ale wykryto ${rawTokens.length}.`
                );
            }

            const cells: ICsvCell[] = rawTokens.map((token, colIndex) => ({
                rawValue: token,
                columnIndex: colIndex
            }));

            const values: Record<string, string> = Object.create(null) as Record<string, string>;
            headers.forEach((header, colIndex) => {
                values[header] = rawTokens[colIndex];
            });

            rows.push({
                rowIndex,
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