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