/**
 * @file CsvTokenizer.ts
 * @description Moduł pomocniczy rozbijający linie tekstu CSV na tokeny z uwzględnieniem cudzysłowów, znaków ucieczki i separatorów.
 */

/**
 * Odpowiada za bezpieczną tokenizację rekordów CSV z obsługą cytowanych separatorów i nowych linii.
 */
export class CsvTokenizer {
    public tokenizeRecords(content: string, delimiter: string = ','): ReadonlyArray<ReadonlyArray<string>> {
        if (delimiter.length !== 1) {
            throw new Error('Separator CSV musi być pojedynczym znakiem.');
        }

        const records: string[][] = [];
        let record: string[] = [];
        let field = '';
        let inQuotes = false;
        let afterQuote = false;
        let recordStarted = false;
        let lineNumber = 1;

        const finishRecord = (): void => {
            if (recordStarted) {
                record.push(field);
                records.push(record);
            }
            record = [];
            field = '';
            afterQuote = false;
            recordStarted = false;
        };

        for (let i = content.charCodeAt(0) === 0xFEFF ? 1 : 0; i < content.length; i++) {
            const char = content[i];
            const nextChar = content[i + 1];

            if (inQuotes) {
                if (char === '"') {
                    if (nextChar === '"') {
                        field += '"';
                        i++;
                    } else {
                        inQuotes = false;
                        afterQuote = true;
                    }
                } else if (char === '\r' || char === '\n') {
                    if (char === '\r' && nextChar === '\n') {
                        i++;
                    }
                    field += '\n';
                    lineNumber++;
                } else {
                    field += char;
                }
                continue;
            }

            if (char === delimiter) {
                record.push(field);
                field = '';
                afterQuote = false;
                recordStarted = true;
            } else if (char === '\r' || char === '\n') {
                if (char === '\r' && nextChar === '\n') {
                    i++;
                }
                finishRecord();
                lineNumber++;
            } else if (char === '"') {
                if (field.length !== 0) {
                    throw new Error(`Nieoczekiwany cudzysłów w wierszu ${lineNumber}.`);
                }
                inQuotes = true;
                recordStarted = true;
            } else {
                if (afterQuote) {
                    throw new Error(`Nieoczekiwany znak po zamykającym cudzysłowie w wierszu ${lineNumber}.`);
                }
                field += char;
                recordStarted = true;
            }
        }

        if (inQuotes) {
            throw new Error(`Niezamknięty cudzysłów w wierszu ${lineNumber}.`);
        }

        if (recordStarted || record.length > 0 || field.length > 0) {
            finishRecord();
        }

        return records;
    }

    /**
     * Rozbija pojedynczą linię tekstu CSV na tablicę surowych tokenów (wartości komórek),
     * uwzględniając cudzysłowy oraz znaki ucieczki.
     *
     * @param line Pojedyncza linia tekstu CSV.
     * @param delimiter Separator kolumn (np. ',' lub ';'). Domyślnie ','.
     * @returns Niemutowalna tablica tokenów tekstowych.
     */
    public tokenizeLine(line: string, delimiter: string = ','): ReadonlyArray<string> {
        const records = this.tokenizeRecords(line, delimiter);
        return records[0] ?? [''];
    }
}