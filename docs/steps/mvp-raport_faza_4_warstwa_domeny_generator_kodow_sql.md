# Raport z realizacji: Faza 4: Warstwa Domeny – Generator Kodów SQL

Niniejszy raport podsumowuje realizację **Fazy 4** projektu **CSV&SQL = MVP**, która obejmuje implementację kluczowych serwisów odpowiedzialnych za bezpieczne formatowanie wartości oraz generowanie pełnych skryptów SQL (DDL i DML) na podstawie zatwierdzonych schematów tabel i danych CSV.

---

## Szczegółowy opis kroków realizacji

### Krok 17 (`src/domain/services/SqlValueEscaper.ts`): Bezpieczne formatowanie wartości
* **Cel:** Zapewnienie bezpiecznego formatowania i escape'owania wartości komórek CSV przed umieszczeniem ich w instrukcjach SQL DML (`INSERT INTO`).
* **Kluczowe mechanizmy:**
  * **Ochrona przed SQL Injection:** Pełna obsługa zamiany pojedynczych apostrofów (`'`) na podwójne (`''`) w ciągach tekstowych oraz datach.
  * **Rzutowanie NULL:** Automatyczna detekcja pustych ciągów, wartości `null`, `undefined` oraz jawnego tekstu `'NULL'`, rzutująca je na słowo kluczowe `NULL`.
  * **Formatowanie typów:** Precyzyjne parsowanie i formatowanie liczb całkowitych (`INTEGER`), zmiennoprzecinkowych (`DECIMAL` z obsługą kropki i przecinka), wartości logicznych (`BOOLEAN`) oraz dat/czasu (`DATE` / `DATETIME`).
* **Zasady SOLID:** Realizacja zasady pojedynczej odpowiedzialności (SRP) oraz pełna bezstanowość (Stateless / Thread-Safe).

---

### Krok 18 (`src/domain/services/SqlDdlBuilder.ts`): Budowniczy instrukcji DDL
* **Cel:** Generowanie instrukcji SQL typu `CREATE TABLE` (oraz opcjonalnie `DROP TABLE IF EXISTS`) na podstawie zatwierdzonego schematu tabeli (`ITableSchema`).
* **Kluczowe mechanizmy:**
  * **Dynamiczne mapowanie typów:** Przekształcanie domenowego wyliczenia `SqlDataType` na konkretne typy bazodanowe SQL (`INT`, `DECIMAL(18, 4)`, `BOOLEAN`, `DATE`, `DATETIME`, `VARCHAR(255)`, `TEXT`).
  * **Konfiguracja dialektu:** Uwzględnianie opcji otaczania identyfikatorów odpowiednimi znakami (`identifierQuote`) oraz flagi `includeDropTable`.
  * **Priorytetyzacja typów:** Uwzględnianie ewentualnych korekt wprowadzonych przez użytkownika (`column.userOverrideType ?? column.detectedType`).
* **Zasady SOLID:** Czysta separacja logiki struktur DDL (SRP) i brak stanu wewnętrznego.

---

### Krok 19 (`src/domain/services/SqlDmlBuilder.ts`): Budowniczy instrukcji DML
* **Cel:** Generowanie instrukcji `INSERT INTO` przekształcających wiersze CSV zgodnie z typami kolumn przy użyciu serwisu `SqlValueEscaper`.
* **Kluczowe mechanizmy:**
  * **Paczkowanie danych (Batching):** Gruperowanie rekordów w paczki po maksymalnie 500 wierszy w celu optymalizacji wydajności zapytań SQL i uniknięcia przekraczania limitów wielkości zapytań.
  * **Odporność na kolejność kolumn:** Mapowanie wartości na podstawie słownika kluczy (`row.values[col.originalName]`), co zapewnia pełną odporność na niezgodności w kolejności nagłówków.
  * **Wstrzykiwanie zależności (DIP):** Powiązanie z serwisem `SqlValueEscaper` poprzez konstruktor.
* **Zasady SOLID:** Przestrzeganie Dependency Inversion Principle oraz Single Responsibility Principle.

---

### Krok 20 (`src/domain/services/SqlGenerator.ts`): Główny koordynator generatora SQL
* **Cel:** Implementacja kontraktu `ISqlGenerator` łączącego nagłówki komentarzy, strukturę tabeli (`SqlDdlBuilder`) oraz paczki danych (`SqlDmlBuilder`) w finalny skrypt SQL.
* **Kluczowe mechanizmy:**
  * **Orkiestracja procesów:** Koordynacja pracy poszczególnych builderów w jedną spójną całość.
  * **Nagłówki metadanych:** Automatyczne doklejanie na początku pliku komentarza informacyjnego zawierającego nazwę tabeli, liczbę wierszy oraz znacznik czasowy wygenerowania (`timestamp`).
  * **Modułowość:** Pełna niezależność komponentów składowych.
* **Zasady SOLID:** Wzorcowa realizacja wzorca koordynatora (Orchestrator) z zachowaniem wstrzykiwania zależności.

---

## Podsumowanie Fazy 4

Wszystkie kroki (17–20) zostały zaimplementowane w czystym języku TypeScript z zachowaniem rygorystycznych reguł kompilatora (`strict: true`, brak użycia typu `any`). Warstwa generatora kodów SQL stanowi w pełni gotowy, wydajny i bezpieczny motor transformacji danych CSV do skryptów bazodanowych.