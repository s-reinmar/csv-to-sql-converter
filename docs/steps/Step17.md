# Krok 17 (src/domain/services/SqlValueEscaper.ts): Serwis odpowiedzialny za bezpieczne formatowanie wartości (ochrona przed błędami składni i SQL Injection, obsługa apostrofów, rzutowanie NULL, formatowanie liczb i dat).

Serwis `SqlValueEscaper` jest odpowiedzialny za bezpieczne formatowanie i escape'owanie wartości komórek CSV przed umieszczeniem ich w instrukcjach SQL DML (INSERT INTO). Chroni przed SQL Injection, obsługuje apostrofy, rzutowanie NULL oraz formatowanie typów danych.

src/domain/services/SqlValueEscaper.ts
```typescript
import { SqlDataType } from '../enums/SqlDataType';

/**
 * Serwis odpowiedzialny za bezpieczne formatowanie i escape'owanie wartości komórek CSV
 * przed umieszczeniem ich w instrukcjach SQL DML (INSERT INTO).
 * Chroni przed SQL Injection, obsługuje apostrofy, rzutowanie NULL oraz formatowanie typów.
 */
export class SqlValueEscaper {
    /**
     * Formatuje surową wartość tekstową na bezpieczny literał SQL w zależności od typu danych.
     *
     * @param rawValue Surowa wartość z komórki CSV
     * @param dataType Docelowy typ danych SQL kolumny
     */
    public escapeValue(rawValue: string | null | undefined, dataType: SqlDataType): string {
        if (this.isNullOrEmpty(rawValue)) {
            return 'NULL';
        }

        // Zabezpieczenie typu za pomocą operatora non-null (!) lub optional chaining
        const trimmed = (rawValue as string).trim();
        if (trimmed.toUpperCase() === 'NULL') {
            return 'NULL';
        }

        switch (dataType) {
            case SqlDataType.INTEGER:
                return this.formatInteger(trimmed);
            case SqlDataType.DECIMAL:
                return this.formatDecimal(trimmed);
            case SqlDataType.BOOLEAN:
                return this.formatBoolean(trimmed);
            case SqlDataType.DATE:
            case SqlDataType.DATETIME:
                return this.formatDateOrDateTime(trimmed);
            case SqlDataType.VARCHAR:
            case SqlDataType.TEXT:
            default:
                return this.formatString(trimmed);
        }
    }

    /**
     * Sprawdza, czy wartość jest pusta, null lub undefined.
     */
    private isNullOrEmpty(value: string | null | undefined): boolean {
        if (value === null || value === undefined) {
            return true;
        }
        return value.trim() === '';
    }

    /**
     * Formatuje wartość liczbową całkowitą (INTEGER).
     */
    private formatInteger(value: string): string {
        const cleaned = value.replace(/\s+/g, '');
        const parsed = Number(cleaned);
        if (isNaN(parsed)) {
            return this.formatString(value);
        }
        return Math.trunc(parsed).toString();
    }

    /**
     * Formatuje wartość liczbową zmiennoprzecinkową (DECIMAL).
     * Obsługuje zarówno kropkę, jak i przecinek jako separator dziesiętny.
     */
    private formatDecimal(value: string): string {
        const normalized = value.replace(/\s+/g, '').replace(',', '.');
        const parsed = Number(normalized);
        if (isNaN(parsed)) {
            return this.formatString(value);
        }
        return parsed.toString();
    }

    /**
     * Formatuje wartość logiczną (BOOLEAN) na standardowe słowa kluczowe SQL.
     */
    private formatBoolean(value: string): string {
        const lower = value.toLowerCase().trim();
        const trueValues = ['true', '1', 'yes', 'y', 't', 'tak'];
        if (trueValues.includes(lower)) {
            return 'TRUE';
        }
        const falseValues = ['false', '0', 'no', 'n', 'f', 'nie'];
        if (falseValues.includes(lower)) {
            return 'FALSE';
        }
        return this.formatString(value);
    }

    /**
     * Formatuje datę lub datę z czasem (DATE / DATETIME) w cudzysłowach SQL.
     */
    private formatDateOrDateTime(value: string): string {
        const escaped = value.replace(/'/g, "''");
        return `'${escaped}'`;
    }

    /**
     * Formatuje ciąg tekstowy (VARCHAR / TEXT) z pełną ochroną przed SQL Injection (escape apostrofów).
     */
    private formatString(value: string): string {
        const escaped = value.replace(/'/g, "''");
        return `'${escaped}'`;
    }
}
```

## Podsumowanie i weryfikacja (Faza 3, Krok 17)

### [SOLID CHECK]
Single Responsibility Principle (SRP): Klasa SqlValueEscaper zajmuje się wyłącznie transformacją i bezpiecznym escape'owaniem surowych ciągów tekstowych na bezpieczne literały SQL zgodnie z określonym typem danych.
Open/Closed Principle (OCP): Obsługa nowych typów danych lub dialektów może być łatwo rozszerzona bez modyfikacji istniejącej logiki bazowej.
Brak stanu (Stateless): Klasa nie przechowuje stanu konwersji, co czyni ją całkowicie bezpieczną do wielokrotnego użycia współbieżnego (Thread-Safe / Worker-Ready).

### [INTERFACE SUMMARY]
escapeValue(rawValue: string | null | undefined, dataType: SqlDataType): string – główna metoda koordynująca formatowanie.
Prywatne metody pomocnicze odpowiedzialne za poszczególne typy: formatInteger, formatDecimal, formatBoolean, formatDateOrDateTime, formatString oraz walidację isNullOrEmpty.

### [REFACTORING ALERT]
- Metody pomocnicze zostały wydzielone w celu zachowania niskiej złożomości cyklomatycznej oraz ograniczenia liczby linii kodu w pojedynczej metodzie (zgodnie z założeniem 25–30 linii na metodę).
- Kod spełnia rygorystyczne wymagania kompilatora TypeScript (strict: true, brak użycia typu any).