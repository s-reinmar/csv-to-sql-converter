## Krok 5 (src/domain/enums/SqlDataType.ts): Definicja wspieranych typów danych SQL (INTEGER, DECIMAL, BOOLEAN, DATE, DATETIME, VARCHAR, TEXT).

Definicja wspieranych typów danych SQL w procesie konwersji plików CSV.

src/domain/enums/SqlDataType.ts
```typescript
export enum SqlDataType {
    INTEGER = "INTEGER",
    DECIMAL = "DECIMAL",
    BOOLEAN = "BOOLEAN",
    DATE = "DATE",
    DATETIME = "DATETIME",
    VARCHAR = "VARCHAR",
    TEXT = "TEXT"
}
```

## Podsumowanie i weryfikacja (Faza 2, Krok 5):

### [SOLID CHECK]:
Wyliczenie SqlDataType w pełni realizuje zasadę pojedynczej odpowiedzialności (SRP), skupiając się wyłącznie na deklaracji dozwolonych typów danych SQL obsługiwanych przez system konwersji, bez żadnych powiązań z widokiem czy I/O.

### [INTERFACE SUMMARY]:
Brak własnych interfejsów – plik definiuje czyste wyliczenie (enum), które posłuży jako kontrakt typów w modelach kolumn.

### [REFACTORING ALERT]:
Kod spełnia rygorystyczne zasady typowania i jest całkowicie odizolowany od warstwy prezentacji.
