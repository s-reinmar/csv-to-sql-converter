# Raport z realizacji: Faza 2: Warstwa Domeny – Modele i Kontrakty (Interface-Driven Development)

Poniżej znajduje się szczegółowy raport podsumowujący kroki od 5 do 12, które realizują budowę warstwy domeny opartej na podejściu **Interface-Driven Development (IDD)** oraz architekturze **Clean / Headless Architecture**.

---

### Krok 5 (`src/domain/enums/SqlDataType.ts`): Wspierane typy danych SQL
* **Opis:** Definicja wyliczenia (`enum`) reprezentującego obsługiwane przez system typy danych SQL w procesie konwersji plików CSV.
* **Wspierane typy:** `INTEGER`, `DECIMAL`, `BOOLEAN`, `DATE`, `DATETIME`, `VARCHAR`, `TEXT`.
* **Weryfikacja [SOLID]:** Pełna realizacja zasady pojedynczej odpowiedzialności (SRP) – plik skupia się wyłącznie na deklaracji dozwolonych typów danych, bez powiązań z warstwą prezentacji czy I/O.

---

### Krok 6 (`src/domain/models/ColumnDefinition.ts`): Definicja kolumny tabeli
* **Opis:** Utworzenie niemutowalnego interfejsu `IColumnDefinition` opisującego pojedynczą kolumnę w tabeli bazodanowej.
* **Kluczowe właściwości:**
  * `originalName` – oryginalna nazwa z nagłówka CSV.
  * `sqlName` – znormalizowana nazwa bezpieczna dla SQL.
  * `detectedType` – typ danych automatycznie wykryty przez silnik (`SqlDataType`).
  * `userOverrideType` – opcjonalny typ nadpisany ręcznie przez użytkownika.
  * `isNullable` – flaga określająca dopuszczalność wartości `NULL`.
* **Weryfikacja [SOLID / TS]:** Pełna niemutowalność (`readonly`) i ścisłe typowanie zgodne z `strict: true` w TypeScript.

---

### Krok 7 (`src/domain/models/CsvRow.ts`): Struktury wierszy i komórek CSV
* **Opis:** Definicja struktur danych reprezentujących wstępnie sparsowaną zawartość pliku CSV.
* **Kluczowe interfejsy:**
  * `ICsvCell` – pojedyncza komórka zawierająca surową wartość tekstową (`rawValue`) oraz indeks kolumny (`columnIndex`).
  * `ICsvRow` – pojedynczy wiersz danych zawierający numer (`rowIndex`), tablicę komórek oraz słownik mapujący nazwy kolumn bezpośrednio na wartości (`values`).
* **Weryfikacja [SOLID]:** Modele służą wyłącznie do bezpiecznego przechowywania surowych danych wejściowych bez domieszki logiki operacyjnej.

---

### Krok 8 (`src/domain/models/TableSchema.ts`): Schemat tabeli docelowej
* **Opis:** Definicja pełnego, niemutowalnego schematu tabeli docelowej oraz opcji konfiguracyjnych dialektu SQL.
* **Kluczowe interfejsy:**
  * `ISqlDialectOptions` – opcje obejmujące znak otaczający identyfikatory (`identifierQuote`: `` ` `` | `"` | `''`) oraz flagę dołączania instrukcji `DROP TABLE IF EXISTS` (`includeDropTable`).
  * `ITableSchema` – zawiera nazwę tabeli, kolekcję kolumn (`ReadonlyArray<IColumnDefinition>`) oraz opcje dialektu.
* **Weryfikacja [SOLID]:** Zapewnia czystą konfigurację generowania zapytań SQL odseparowaną od szczegółów transportowych i UI.

---

### Krok 9 (`src/domain/contracts/ICsvParser.ts`): Kontrakt parsera CSV
* **Opis:** Zdefiniowanie kontraktu dla serwisu odpowiedzialnego za przekształcanie surowego tekstu CSV do ustrukturyzowanego modelu domenowego.
* **Kluczowe elementy:**
  * `ICsvParseResult` – struktura zwracająca nagłówki (`headers`) oraz wiersze (`rows`).
  * `ICsvParser` – interfejs z metodą `parse(csvContent: string, delimiter?: string): ICsvParseResult`.
* **Weryfikacja [SOLID]:** Odwrócenie zależności (DIP) i separacja logiki parsowania tekstu od reszty aplikacji, co drastycznie ułatwia testowanie jednostkowe.

---

### Krok 10 (`src/domain/contracts/ITypeInferenceEngine.ts`): Kontrakt silnika wnioskowania typów
* **Opis:** Kontrakt dla mechanizmu analizującego próbki danych z kolumn w celu automatycznego doboru optymalnych typów SQL.
* **Kluczowe metody interfejsu `ITypeInferenceEngine`:**
  * `inferColumnType(sampleValues: ReadonlyArray<string>): SqlDataType` – wyznacza typ dla pojedynczej kolumny.
  * `inferTableSchema(headers: ReadonlyArray<string>, rows: ReadonlyArray<ICsvRow>, tableName: string): ITableSchema` – generuje kompletny schemat tabeli.
* **Weryfikacja [SOLID]:** Skupienie wyłącznie na regułach analitycznych (SRP) bez bezpośrednich operacji I/O.

---

### Krok 11 (`src/domain/contracts/ISqlGenerator.ts`): Kontrakty generatorów SQL (DDL i DML)
* **Opis:** Definicje interfejsów budowniczych zapytań oraz głównego koordynatora generowania kodu SQL.
* **Kluczowe interfejsy:**
  * `ISqlDdlBuilder` – kontrakt dla tworzenia instrukcji `CREATE TABLE` (`generateDdl`).
  * `ISqlDmlBuilder` – kontrakt dla tworzenia instrukcji `INSERT INTO` (`generateDml`).
  * `ISqlGenerator` – główny koordynator łączący DDL i DML w pełny skrypt SQL (`generateSql`).
* **Weryfikacja [SOLID]:** Modularny podział odpowiedzialności między budowniczymi struktur bazy danych a danymi wierszowymi.

---

### Krok 12 (`src/domain/contracts/ISqlFileRepository.ts`): Kontrakt repozytorium plików SQL
* **Opis:** Definicja abstrakcji odpowiedzialnej za trwały zapis wygenerowanego kodu SQL w docelowej lokalizacji.
* **Kluczowy interfejs:**
  * `ISqlFileRepository` z metodą `saveSqlFile(fileName: string, sqlContent: string): Promise<string>`.
* **Weryfikacja [SOLID]:** Pełna izolacja logiki domenowej od konkretnych mechanizmów zapisu (np. system plików Node.js `fs`, pamięć podręczna czy zewnętrzne API), spełniająca zasady Clean Architecture.

---

### Podsumowanie Fazy 2
Wszystkie kroki (5–12) zostały w pełni zdefiniowane przy użyciu czystego TypeScriptu z zachowaniem rygorystycznych reguł niemutowalności (`readonly`), braku rzutowań na `any` oraz pełnej zgodności z zasadami **SOLID** i **Interface-Driven Development**. Warstwa domeny stanowi teraz stabilny i niezależny fundament pod implementację logiki biznesowej w kolejnych fazach projektu.