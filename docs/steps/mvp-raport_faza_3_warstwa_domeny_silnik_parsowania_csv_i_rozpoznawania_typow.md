# Raport z realizacji: Faza 3: Warstwa Domeny – Silnik Parsowania CSV i Rozpoznawania Typów

Poniżej znajduje się szczegółowy raport podsumowujący kroki od 13 do 16, które realizują implementację logiki biznesowej odpowiedzialnej za bezpieczne tokenizowanie, parsowanie strukturalne plików CSV, walidację typów za pomocą atomowych predykatów oraz inteligentne wnioskowanie typów danych SQL (`INTEGER`, `DECIMAL`, `BOOLEAN`, `DATE`, `VARCHAR`, `TEXT`). Prace opierają się na architekturze **Clean / Headless Architecture** oraz zasadach **SOLID**.

---

## Krok 13 (src/domain/services/CsvTokenizer.ts): Tokenizacja linii CSV
* **Opis:** Implementacja modułu pomocniczego `CsvTokenizer`, którego zadaniem jest bezpieczne rozbijanie pojedynczych linii tekstu CSV na tablicę surowych tokenów (wartości komórek).
* **Kluczowe cechy mechanizmu:**
  * Obsługa wartości ujętych w cudzysłowy (`inQuotes`).
  * Obsługa znaków ucieczki dla cudzysłowów wewnątrz wartości (escaped quotes `""`).
  * Obsługa dynamicznych separatorów kolumn (np. przecinek `,` lub średnik `;`).
  * Zwracanie niemutowalnej struktury danych (`ReadonlyArray<string>`).
* **Weryfikacja [SOLID / Architektura]:** Pełna realizacja zasady pojedynczej odpowiedzialności (SRP) – klasa skupia się wyłącznie na algorytmie tokenizacji tekstowej bez wiedzy o strukturze całego pliku czy operacjach I/O. Algorytm działa w czasie $O(n)$ i nie korzysta z typu `any`.

---

## Krok 14 (src/domain/services/CsvParser.ts): Implementacja ICsvParser
* **Opis:** Implementacja kontraktu `ICsvParser` w klasie `CsvParser`, która koordynuje proces parsowania zawartości pliku CSV, ekstrakcję nagłówków, walidację spójności liczby kolumn oraz budowę obiektów wierszy.
* **Kluczowe cechy mechanizmu:**
  * Obsługa różnych formatów znaków nowej linii (`\r\n` lub `\n`).
  * Automatyczna ekstrakcja i oczyszczanie nagłówków z pierwszej linii pliku.
  * Walidacja spójności strukturalnej – rzucanie czytelnego błędu w przypadku niezgodności liczby kolumn w wierszu względem nagłówka.
  * Budowa struktury `ICsvParseResult` zawierającej kolekcję nagłówków oraz zindeksowane wiersze (`ICsvRow` i `ICsvCell` z mapowaniem nazw na surowe wartości).
* **Weryfikacja [SOLID / Architektura]:** Zastosowanie wzorca Dependency Injection (wstrzykiwanie `CsvTokenizer` przez konstruktor) oraz zasady Odwrócenia Zależności (DIP). Klasa pozostaje całkowicie odizolowana od warstwy prezentacji.

---

## Krok 15 (src/domain/services/TypeMatchers.ts): Zestaw atomowych predykatów
* **Opis:** Utworzenie klasy `TypeMatchers` dostarczającej zestaw małych, atomowych predykatów oraz wyrażeń regularnych (Type Guards) do walidacji pojedynczych ciągów znaków.
* **Wspierane walidacje:**
  * `isInteger`: Sprawdzenie dopasowania do liczby całkowitej (`INTEGER`).
  * `isDecimal`: Sprawdzenie dopasowania do liczby zmiennoprzecinkowej/stałoprzecinkowej (`DECIMAL`) z normalizacją separatorów dziesiętnych.
  * `isBoolean`: Sprawdzenie dopasowania do wartości logicznych (`BOOLEAN` – wsparcie dla `true`/`false`, `1`/`0`, `yes`/`no`, `t`/`f`, `y`/`n`).
  * `isDate`: Sprawdzenie dopasowania do daty w formacie `YYYY-MM-DD` (`DATE`) wraz z dodatkową rygorystyczną walidacją poprawności kalendarzowej.
* **Weryfikacja [SOLID / Architektura]:** Klasa spełnia zasady SRP (skupienie wyłącznie na atomowej walidacji tekstowej) oraz oferuje stałą złożoność czasową $O(1)$ dla operacji sprawdzających.

---

## Krok 16 (src/domain/services/TypeInferenceEngine.ts): Silnik wnioskowania typów
* **Opis:** Implementacja kontraktu `ITypeInferenceEngine` w klasie `TypeInferenceEngine`, realizująca agregację wyników z `TypeMatchers` dla wszystkich wierszy w kolumnie, wykrywanie wartości pustych (`NULL`) oraz dobór najbardziej precyzyjnego typu SQL.
* **Kluczowe cechy mechanizmu:**
  * Agregacja danych kolumnowych i pomijanie pustych wartości przy wnioskowaniu typu.
  * Hierarchiczne dopasowanie typów: `INTEGER` $\rightarrow$ `DECIMAL` $\rightarrow$ `BOOLEAN` $\rightarrow$ `DATE` $\rightarrow$ `VARCHAR` / `TEXT` (w zależności od długości tekstu powyżej 255 znaków).
  * Generowanie pełnego schematu tabeli (`ITableSchema`) z normalizacją nazw kolumn oraz tabel do bezpiecznych identyfikatorów SQL (obsługa znaków specjalnych, spacji i wielkości liter).
  * Automatyczne wykrywanie dopuszczalności wartości `NULL` (`isNullable`).
* **Weryfikacja [SOLID / Architektura]:** Pełna separacja logiki analitycznej od parsera oraz struktur danych. Zależność od `TypeMatchers` jest dostarczana przez mechanizm Dependency Injection, co gwarantuje pełną testowalność jednostkową.

---

## Podsumowanie Fazy 3
Warstwa domeny została rozbudowana o w pełni funkcjonalny, odporny na błędy i rygorystycznie otypowany silnik parsowania oraz analizy typów CSV. Wszystkie komponenty (`CsvTokenizer`, `CsvParser`, `TypeMatchers`, `TypeInferenceEngine`) ściśle przestrzegają zasad **Clean Architecture**, **SOLID** oraz standardu `strict: true` w TypeScript, stanowiąc niezawodny fundament pod generatory zapytań SQL.