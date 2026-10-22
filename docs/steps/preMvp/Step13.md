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
Zasada pojedynczej odpowiedzialności (SRP): Klasa CsvTokenizer skupia się wyłącznie na czystym algorytmie rozbijania linii tekstu CSV na tablicę tokenów (wartości), obsługując cudzysłowy oraz znaki ucieczki, całkowicie bez wiedzy o strukturze plików, parsowaniu całych dokumentów czy warstwie prezentacji.
Odwrócenie zależności (DIP): Moduł stanowi samowystarczalny komponent logiki domenowej, który może być wstrzykiwany (lub używany bezpośrednio) przez parser CSV, nie zależąc od żadnych szczegółów infrastrukturalnych ani elementów I/O.

### [INTERFACE SUMMARY]
- `CsvTokenizer`: Klasa implementująca metodę `tokenizeLine(line: string, delimiter?: string): ReadonlyArray<string>`, odpowiedzialną za poprawną obsługę cudzysłowów oraz znaków ucieczki ("").

### [REFACTORING ALERT]
- Brak zastrzeżeń architektonicznych – algorytm działa w czasie $O(n)$, operuje na jawnych typach bez użycia typu any, zachowuje pełną niemutowalność zwracanych danych (ReadonlyArray<string>) i spełnia zasady Headless Architecture.