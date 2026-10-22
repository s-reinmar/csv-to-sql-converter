# Krok 10 (src/domain/contracts/ITypeInferenceEngine.ts): Kontrakt dla silnika wnioskującego typy danych na podstawie próbek wartości z kolumn.

Kontrakt `ITypeInferenceEngine` definiuje interfejs dla silnika, który analizuje próbki danych z kolumn i wnioskuje odpowiednie typy danych. Implementacja tego kontraktu powinna umożliwiać:

src/domain/contracts/ITypeInferenceEngine.ts
```typescript
/**
 * @file ITypeInferenceEngine.ts
 * @description Kontrakt dla silnika wnioskującego typy danych na podstawie próbek wartości z kolumn.
 */

import { SqlDataType } from '../enums/SqlDataType';
import { ITableSchema } from '../models/TableSchema';
import { ICsvRow } from '../models/CsvRow';

/**
 * Kontrakt dla silnika odpowiedzialnego za automatyczne rozpoznawanie typów danych SQL
 * na podstawie próbek wartości z kolumn pliku CSV.
 */
export interface ITypeInferenceEngine {
    /**
     * Wnioskuje najbardziej precyzyjny typ danych SQL na podstawie tablicy próbek tekstowych z kolumny.
     * @param sampleValues Tablica surowych wartości tekstowych z danej kolumny.
     */
    inferColumnType(sampleValues: ReadonlyArray<string>): SqlDataType;

    /**
     * Wnioskuje pełny schemat tabeli SQL na podstawie nagłówków oraz wierszy danych.
     * @param headers Tablica nagłówków kolumn.
     * @param rows Tablica sparsowanych wierszy CSV.
     * @param tableName Nazwa docelowa tabeli w bazie danych.
     */
    inferTableSchema(
        headers: ReadonlyArray<string>,
        rows: ReadonlyArray<ICsvRow>,
        tableName: string
    ): ITableSchema;
}
```

## Podsumowanie i weryfikacja (Faza 2, Krok 10):

### [SOLID CHECK]:
Zasada pojedynczej odpowiedzialności (SRP): Kontrakt ITypeInferenceEngine skupia się wyłącznie na definicji logiki wnioskowania typów danych na podstawie próbek wartości z kolumn, bez realizacji parsowania czy operacji I/O.
Odwrócenie zależności (DIP): Definiuje abstrakcję (interfejs) dla silnika wnioskowania, umożliwiając warstwie aplikacji i kontrolerom korzystanie z logiki analitycznej bez wiązania się z konkretną implementacją algorytmów.

### [INTERFACE SUMMARY]:
ITypeInferenceEngine: Kontrakt definiujący metodę inferColumnType(values: ReadonlyArray<string>): SqlDataType oraz metodę inferTableSchema(headers: ReadonlyArray<string>, rows: ReadonlyArray<ICsvRow>, tableName: string): ITableSchema.

### [REFACTORING ALERT]:
Brak zastrzeżeń architektonicznych – interfejs jest w pełni odizolowany od warstwy prezentacji, operacji I/O oraz struktur DOM, respektując zasady czystej architektury (Headless Architecture) oraz rygorystyczne typowanie w TypeScript.