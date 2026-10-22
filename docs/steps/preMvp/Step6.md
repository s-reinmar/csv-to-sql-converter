# Krok 6 (src/domain/models/ColumnDefinition.ts): Definicja niemutowalnych interfejsów opisujących pojedynczą kolumnę (nazwa oryginalna, znormalizowana nazwa SQL, wykryty typ, typ nadpisany przez użytkownika, flaga isNullable).

Definicja niemutowalnych interfejsów opisujących pojedynczą kolumnę w tabeli, zawierających oryginalną nazwę z pliku CSV, znormalizowaną nazwę SQL, wykryty automatycznie typ danych (SqlDataType), opcjonalny typ nadpisany przez użytkownika oraz flagę określającą dopuszczalność wartości NULL.

src/domain/models/ColumnDefinition.ts
```typescript
/**
 * @file ColumnDefinition.ts
 * @description Definicja niemutowalnego interfejsu opisującego pojedynczą kolumnę tabeli bazodanowej.
 */

import { SqlDataType } from '../enums/SqlDataType';

/**
 * Reprezentuje niemutowalną definicję kolumny w schemacie tabeli SQL.
 */
export interface IColumnDefinition {
    /** Oryginalna nazwa kolumny odczytana z nagłówka pliku CSV */
    readonly originalName: string;

    /** Znormalizowana nazwa kolumny bezpieczna dla języka SQL */
    readonly sqlName: string;

    /** Typ danych automatycznie wykryty przez silnik wnioskowania na podstawie zawartości */
    readonly detectedType: SqlDataType;

    /** Typ danych nadpisany ręcznie przez użytkownika w formularzu (opcjonalny) */
    readonly userOverrideType?: SqlDataType;

    /** Flaga określająca, czy kolumna może zawierać wartości NULL (true) czy wymaga NOT NULL (false) */
    readonly isNullable: boolean;
}
```

## Podsumowanie i weryfikacja (Faza 2, Krok 6)

### [SOLID CHECK]
Zasada pojedynczej odpowiedzialności (SRP): Plik ColumnDefinition.ts skupia się wyłącznie na definicji struktury danych i kontraktu reprezentującego pojedynczą kolumnę w tabeli, całkowicie izolując ją od logiki przetwarzania i warstwy prezentacji.
Odwrócenie zależności (DIP): Definicja interfejsu (lub typu niemutowalnego) stanowi czysty kontrakt domenowy, z którego korzystają silniki wnioskowania oraz budownicze SQL bez wiązania się z konkretnymi implementacjami.

### [INTERFACE SUMMARY]
IColumnDefinition: Niemutowalny interfejs opisujący pojedynczą kolumnę, zawierający oryginalną nazwę z pliku CSV, znormalizowaną nazwę SQL, wykryty automatycznie typ danych (SqlDataType), opcjonalny typ nadpisany przez użytkownika oraz flagę określającą dopuszczalność wartości NULL.

### [REFACTORING ALERT]
Brak zastrzeżeń architektonicznych – interfejs w pełni respektuje zasady niemutowalności (readonly), rygorystycznego typowania w TypeScript oraz czystej architektury domenowej (Headless).