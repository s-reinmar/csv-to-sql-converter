# Krok 15 (src/domain/services/TypeMatchers.ts): Zestaw małych, atomowych predykatów (Type Guards / RegEx) sprawdzających, czy pojedynczy ciąg znaków pasuje do typu INTEGER, DECIMAL, BOOLEAN lub DATE.

Zestaw małych, atomowych predykatów (Type Guards / RegEx) sprawdzających, czy pojedynczy ciąg znaków pasuje do typu INTEGER, DECIMAL, BOOLEAN lub DATE.

src/domain/services/TypeMatchers.ts
```typescript
/**
 * @file TypeMatchers.ts
 * @description Zestaw małych, atomowych predykatów (Type Guards / RegEx) sprawdzających,
 * czy pojedynczy ciąg znaków pasuje do typu INTEGER, DECIMAL, BOOLEAN lub DATE.
 */

/**
 * Serwis domenowy zawierający predykaty i wyrażenia regularne do walidacji typów danych SQL.
 */
export class TypeMatchers {
    private static readonly INTEGER_REGEX = /^-?\d+$/;
    private static readonly DECIMAL_REGEX = /^-?\d+([.,]\d+)?$/;
    private static readonly BOOLEAN_REGEX = /^(true|false|1|0|yes|no|t|f|y|n)$/i;
    private static readonly DATE_REGEX = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/;

    /**
     * Sprawdza, czy podany ciąg znaków reprezentuje liczbę całkowitą (INTEGER).
     * @param value Ciąg znaków do sprawdzenia.
     */
    public isInteger(value: string): boolean {
        if (!value || value.trim() === '') {
            return false;
        }
        return TypeMatchers.INTEGER_REGEX.test(value.trim());
    }

    /**
     * Sprawdza, czy podany ciąg znaków reprezentuje liczbę zmiennoprzecinkową/stałoprzecinkową (DECIMAL).
     * @param value Ciąg znaków do sprawdzenia.
     */
    public isDecimal(value: string): boolean {
        if (!value || value.trim() === '') {
            return false;
        }
        const normalized = value.trim().replace(',', '.');
        return TypeMatchers.DECIMAL_REGEX.test(normalized);
    }

    /**
     * Sprawdza, czy podany ciąg znaków reprezentuje wartość logiczną (BOOLEAN).
     * @param value Ciąg znaków do sprawdzenia.
     */
    public isBoolean(value: string): boolean {
        if (!value || value.trim() === '') {
            return false;
        }
        return TypeMatchers.BOOLEAN_REGEX.test(value.trim());
    }

    /**
     * Sprawdza, czy podany ciąg znaków reprezentuje datę w formacie YYYY-MM-DD (DATE).
     * @param value Ciąg znaków do sprawdzenia.
     */
    public isDate(value: string): boolean {
        if (!value || value.trim() === '') {
            return false;
        }
        const trimmed = value.trim();
        if (!TypeMatchers.DATE_REGEX.test(trimmed)) {
            return false;
        }

        // Dodatkowa walidacja poprawności kalendarzowej daty
        const parts = trimmed.split(/[-/]/);
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);

        if (month < 1 || month > 12 || day < 1 || day > 31) {
            return false;
        }

        const dateObj = new Date(year, month - 1, day);
        return (
            dateObj.getFullYear() === year &&
            dateObj.getMonth() === month - 1 &&
            dateObj.getDate() === day
        );
    }
}
```

## Podsumowanie i weryfikacja (Faza 3, Krok 15)

### [SOLID CHECK]
1. **Zasada pojedynczej odpowiedzialności (SRP):** Klasa `TypeMatchers` skupia się wyłącznie na dostarczeniu małych, atomowych predykatów i wyrażeń regularnych sprawdzających dopasowanie pojedynczego ciągu znaków do podstawowych typów danych SQL (`INTEGER`, `DECIMAL`, `BOOLEAN`, `DATE`), bez logiki agregacji wierszy czy operacji I/O.
2. **Odwrócenie zależności (DIP):** Moduł stanowi samowystarczalny serwis domenowy, który może być bezpośrednio wstrzykiwany lub wykorzystywany przez silnik wnioskowania typów (`TypeInferenceEngine`), zachowując całkowitą izolację od warstwy prezentacji i UI.

### [INTERFACE SUMMARY]
* `TypeMatchers`: Klasa zawierająca atomowe metody predykatów walidujących:
    * `isInteger(value: string): boolean`
    * `isDecimal(value: string): boolean`
    * `isBoolean(value: string): boolean`
    * `isDate(value: string): boolean`

### [REFACTORING ALERT]
Brak zastrzeżeń architektonicznych – klasa operuje na czystych funkcjach walidujących o stałej złożoności czasowej $O(1)$, nie korzysta z typu any, ściśle przestrzega rygorystycznego typowania w TypeScript oraz spełnia założenia Headless Architecture.