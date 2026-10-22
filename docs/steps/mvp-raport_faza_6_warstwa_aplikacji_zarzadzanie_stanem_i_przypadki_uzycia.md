# Raport z realizacji: Faza 6: Warstwa Aplikacji – Zarządzanie Stanem i Przypadki Użycia

Poniżej znajduje się szczegółowy raport podsumowujący kroki 24, 25 oraz 26, które realizują budowę warstwy aplikacyjnej (Application Layer) odpowiedzialnej za zarządzanie niemutowalnym stanem, obsługę modyfikacji schematu przez użytkownika oraz orkiestrację całego procesu konwersji w architekturze Clean / Headless Architecture.

---

## Krok 24 (src/application/ConversionState.ts): Niemutowalny kontener stanu

*   **Opis:** Implementacja niemutowalnego kontenera stanu `ConversionState` wraz z interfejsem `IConversionStateData`, który przechowuje aktualnie wczytane dane CSV, roboczą wersję schematu tabeli, wygenerowany kod SQL, ścieżkę zapisu oraz statusy ładowania i błędów.
*   **Kluczowe elementy:**
    *   `IConversionStateData`: Zamrożony interfejs danych stanu (`fileName`, `csvData`, `tableSchema`, `generatedSql`, `savedFilePath`, `isLoading`, `errorMessage`).
    *   `ConversionState`: Klasa implementująca wzorzec *Immutability* poprzez metodę `cloneWith`, która zwraca nową instancję kontenera przy każdej modyfikacji stanu bez mutowania poprzedniej.
*   **Weryfikacja [SOLID / TS]:** 
    *   *SRP:* Klasa odpowiada wyłącznie za bezpieczne przechowywanie i przekazywanie stanu aplikacji.
    *   *Immutability:* Pełne wsparcie dla `Readonly` oraz zamrożonych obiektów w celu zapewnienia przewidywalności przepływu danych.

---

## Krok 25 (src/application/SchemaOverrideService.ts): Serwis modyfikacji schematu

*   **Opis:** Utworzenie serwisu aplikacyjnego `SchemaOverrideService`, który umożliwia użytkownikowi interaktywną modyfikację schematu tabeli w trakcie konwersji.
*   **Kluczowe metody:**
    *   `updateColumnName`: Zmienia znormalizowaną nazwę SQL wybranej kolumny z walidacją poprawności.
    *   `overrideColumnType`: Nadpisuje typ danych kolumny (`userOverrideType`) wybranym typem z `SqlDataType`.
    *   `toggleColumnNullable`: Przełącza flagę dopuszczalności wartości `NULL / NOT NULL` dla wskazanej kolumny.
    *   `updateTableName`: Aktualizuje główną nazwę tabeli docelowej.
*   **Weryfikacja [SOLID]:** 
    *   *SRP:* Skupienie wyłącznie na regułach biznesowych dotyczących ręcznych nadpisań schematu tabeli (`ITableSchema`), z zachowaniem niemutowalności struktur danych.

---

## Krok 26 (src/application/ConversionUseCase.ts): Główny orkiestrator przepływu pracy

*   **Opis:** Implementacja głównego koordynatora (`ConversionUseCase`), który integruje wszystkie dotychczasowe warstwy za pomocą wstrzykiwania zależności (*Dependency Injection*) przez konstruktor.
*   **Wstrzykiwane zależności:** `ICsvParser`, `ITypeInferenceEngine`, `ISqlGenerator`, `ISqlFileRepository` oraz `SchemaOverrideService`.
*   **Kluczowe operacje:**
    *   `loadAndParseCsv`: Wczytuje surową treść CSV, uruchamia parser, inicjalizuje detekcję typów i generuje wstępny kod SQL.
    *   Metody modyfikacji (`updateColumnName`, `overrideColumnType`, `toggleColumnNullable`, `updateTableName`): Delegują zmiany do serwisu nadpisań i automatycznie odświeżają wygenerowany kod SQL.
    *   `saveSqlFile`: Zleca repozytorium plików trwały zapis gotowego skryptu `.sql`.
*   **Weryfikacja [SOLID]:** 
    *   *DIP:* Pełne odwrócenie zależności – orkiestrator operuje wyłącznie na kontraktach (interfejsach).
    *   *SRP:* Koordynacja przepływu pracy aplikacji bez wiązania logiki z konkretnym frameworkiem UI.

---

## Podsumowanie Fazy 6

Wszystkie kroki (24–26) zostały poprawnie zaimplementowane w czystym TypeScript, tworząc stabilną, w pełni przetestowalną warstwę aplikacyjną. Warstwa ta skutecznie spina parsowanie, wnioskowanie typów, interaktywne nadpisywanie schematu oraz generowanie i zapis plików SQL.