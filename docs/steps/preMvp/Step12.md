#Krok 12 (src/domain/contracts/ISqlFileRepository.ts): Kontrakt dla repozytorium odpowiedzialnego za trwały zapis wygenerowanego kodu .sql w docelowej lokalizacji.

Kontrakt `ISqlFileRepository` definiuje metody, które muszą być zaimplementowane przez repozytorium odpowiedzialne za zapis wygenerowanego kodu SQL w docelowej lokalizacji. Repozytorium to może obsługiwać różne źródła danych, takie jak system plików, bazy danych lub inne mechanizmy przechowywania.

src/domain/contracts/ISqlFileRepository.ts
```typescript
/**
 * @file ISqlFileRepository.ts
 * @description Kontrakt dla repozytorium odpowiedzialnego za trwały zapis wygenerowanego kodu SQL w docelowej lokalizacji.
 */

/**
 * Reprezentuje kontrakt repozytorium zarządzającego operacjami zapisu wygenerowanych plików SQL.
 */
export interface ISqlFileRepository {
    /**
     * Zapisuje wygenerowany skrypt SQL w docelowej lokalizacji.
     * @param fileName Docelowa nazwa pliku (np. 'export.sql').
     * @param sqlContent Pełna treść wygenerowanego skryptu SQL.
     * @returns Obietnica (Promise) zwracająca ścieżkę lub potwierdzenie pomyślnego zapisu.
     */
    saveSqlFile(fileName: string, sqlContent: string): Promise<string>;
}
```

## Podsumowanie i weryfikacja (Faza 2, Krok 12):

### [SOLID CHECK]
Zasada pojedynczej odpowiedzialności (SRP): Kontrakt ISqlFileRepository skupia się wyłącznie na definicji abstrakcji dla trwałego zapisu wygenerowanego kodu SQL w docelowej lokalizacji, całkowicie oddzielając logikę domenową od konkretnych szczegółów operacji I/O (np. API REST czy modułu fs Node.js).
Odwrócenie zależności (DIP): Definiuje czysty interfejs repozytorium dla warstwy domeny lub aplikacji, dzięki czemu przypadki użycia mogą zlecać zapis plików bez wiązania się z konkretną implementacją infrastrukturalną.

### [INTERFACE SUMMARY]
ISqlFileRepository: Kontrakt repozytorium z metodą saveSqlFile(fileName: string, sqlContent: string): Promise<string> przeznaczoną do trwałego zapisu wygenerowanych skryptów SQL.

### [REFACTORING ALERT]
Brak zastrzeżeń architektonicznych – interfejs spełnia rygorystyczne wymagania TypeScript (strict: true), operuje na jednoznacznych typach bez użycia any i w pełni realizuje wzorzec Headless Architecture oraz zasady czystej architektury (Clean Architecture).