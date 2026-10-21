# Krok 13 (src/domain/services/CsvTokenizer.ts): Moduł pomocniczy rozbijający linie tekstu CSV na tokeny z uwzględnieniem cudzysłowów, znaków ucieczki i separatorów (np. , lub ;).

Moduł `CsvTokenizer` jest odpowiedzialny za przetwarzanie wierszy tekstu CSV i rozbijanie ich na tokeny, które mogą być następnie użyte do dalszego przetwarzania danych. Obsługuje on różne przypadki, takie jak wartości ujęte w cudzysłowy, znaki ucieczki oraz różne separatory.

src/domain/services/CsvTokenizer.ts
```typescript
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
```

## Podsumowanie i weryfikacja (Faza 3, Krok 13)

### [SOLID CHECK]
- Zasada pojedynczej odpowiedzialności (SRP): Klasa `CsvTokenizer` skupia się wyłącznie na tokenizacji wierszy CSV, bez implementacji logiki zapisu, walidacji czy przetwarzania danych. Oddziela logikę tokenizacji od reszty aplikacji, co ułatwia testowanie i utrzymanie.
- Odwrócenie zależności (DIP): Moduł `CsvTokenizer` może być używany przez różne komponenty aplikacji, które potrzebują tokenizacji CSV, bez wiązania się z konkretnymi implementacjami przetwarzania danych. Umożliwia to łatwe testowanie i wymianę implementacji tokenizacji w przyszłości.

### [INTERFACE SUMMARY]
- `CsvTokenizer`: Klasa odpowiedzialna za tokenizację pojedynczych linii tekstu CSV, obsługująca cudzysłowy, znaki ucieczki i różne separatory. Metoda `tokenizeLine` zwraca niemutowalną tablicę tokenów tekstowych, co zapewnia bezpieczeństwo i spójność danych w dalszym przetwarzaniu.

### [REFACTORING ALERT]
- Brak zastrzeżeń architektonicznych – klasa `CsvTokenizer` spełnia rygorystyczne wymagania TypeScript (strict: true), operuje na jednoznacznych typach bez użycia `any` i w pełni realizuje wzorzec Headless Architecture oraz zasady czystej architektury (Clean Architecture). Kod jest modularny, łatwy do testowania i utrzymania, a jego odpowiedzialność jest jasno określona.