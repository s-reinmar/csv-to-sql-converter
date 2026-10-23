# ROADMAP: CSV to SQL Converter (Faza Post-MVP)

Poniższa roadmapa kategoryzuje zadania z pliku `Todoist.md` w logiczną sekwencję technologiczną. Uwzględnia rygorystyczne wytyczne architektoniczne (Clean Architecture, SOLID, brak "God Classes", ścisłe typowanie) narzucone w `coding-standard.md`.

## Faza 1: Usprawnienia Domenowe i Czystość Danych (Stabilizacja i Quick Wins)
W pierwszej kolejności skupiamy się na stabilności parsowania, precyzji wykrywania danych oraz ich normalizacji, co bezpośrednio poprawia jakość generowanego kodu SQL bez wprowadzania rewolucji w infrastrukturze.

- [X] **KROK 1.1: Automatyczna normalizacja nazw tabel i kolumn**
  - **Powiązanie z Todoist:** *Automatyczne generowanie i czyszczenie nazw tabel oraz kolumn (usuwanie polskich znaków, zamiana spacji na podkreślenia, konwersja na małe litery).*
  - **Cel i DoD:** 
    - Utworzenie nowej, bezstanowej klasy domenowej (np. `NameNormalizationService` lub rozbudowa `TypeInferenceEngine`), która przekształca dowolny ciąg znaków na format bezpieczny dla SQL (snake_case, brak znaków diakrytycznych).
    - Metody przetestowane jednostkowo; zintegrowane w przepływie generowania `TableSchema`.
    - Dodanie obsługi w `SchemaOverrideService`, by znormalizowane nazwy trafiały do `ConversionState`.
  - **Zależności:** Brak.

- [X] **KROK 1.2: Automatyczna detekcja separatora pliku CSV**
  - **Powiązanie z Todoist:** *Automatyczne rozpoznawanie separatora pliku CSV bez konieczności ręcznego wyboru.*
  - **Cel i DoD:** 
    - Rozszerzenie interfejsu `ICsvParser` oraz jego implementacji.
    - Stworzenie mikro-serwisu `SeparatorDetector` (zgodnie z SRP), który analizuje pierwszą próbkę danych (np. 10 linii) i na podstawie heurystyki zwraca najbardziej prawdopodobny separator (`,`, `;`, `\t`).
    - Zastąpienie statycznego przekazywania separatora wywołaniem detektora w `ConversionUseCase`.
  - **Zależności:** Brak.

- [ ] **KROK 1.3: Wybór separatora w UI (Fallback)**
  - **Powiązanie z Todoist:** *Obsługa różnych separatorów CSV: Dodanie możliwości wyboru separatora (np. przecinek, średnik, tabulator) w interfejsie użytkownika.*
  - **Cel i DoD:** 
    - Zaktualizowanie interfejsu `IFileUploadView` oraz modyfikacja DOM (nowy `<select>` z opcją "Auto-detect" jako domyślną).
    - Zaktualizowanie `AppController`, aby przekazywał wymuszony separator (lub null dla auto-detekcji) do `ConversionUseCase`.
  - **Zależności:** Wykonany KROK 1.2 (Detekcja musi działać jako wariant domyślny).

- [ ] **KROK 1.4: Rozszerzona walidacja danych wejściowych**
  - **Powiązanie z Todoist:** *Walidacja danych wejściowych (np. brakujące wartości, niepoprawne formaty dat).*
  - **Cel i DoD:** 
    - Utworzenie `DataValidationService` działającego po tokenizacji.
    - Zdefiniowanie interfejsu dla obiektów błędów (np. `IValidationError`).
    - Aktualizacja interfejsu powiadomień (`IStatusNotificationView`), by obok błędu krytycznego móc wyświetlać zbiór ostrzeżeń (warnings) o np. pominiętych wierszach lub wymuszonym zrzutowaniu na `NULL`.
  - **Zależności:** Brak (niezależny serwis domenowy).

## Faza 2: Skalowalność, Wydajność i Asynchroniczność (Przetwarzanie Dużych Danych)
Przebudowa warstwy aplikacji i infrastruktury w celu obsługi dużych i licznych plików bez blokowania głównego wątku przeglądarki (Headless Architecture / UI Separation).

- [ ] **KROK 2.1: Asynchroniczne przetwarzanie w tle i raportowanie postępu**
  - **Powiązanie z Todoist:** *Przetwarzanie plików w tle (asynchronicznie) z informowaniem użytkownika o postępie.*
  - **Cel i DoD:** 
    - Wydzielenie ciężkich operacji CPU (`CsvParser`, `TypeInferenceEngine`, `SqlGenerator`) do osobnego wątku za pomocą Web Workerów (wymóg techniczny, by nie łamać izolacji UI blokując DOM).
    - Rozszerzenie `IStatusNotificationView` o metody wspierające pasek postępu / procenty.
    - Aktualizacja `ConversionState` o pola `progressPercentage` i `isProcessing`.
  - **Zależności:** Wykonana Faza 1 (aby przenoszona logika była kompletna i stabilna).

- [ ] **KROK 2.2: Strumieniowe przetwarzanie dużych plików**
  - **Powiązanie z Todoist:** *Obsługa większych plików CSV (mechanizmy stronicowania lub przetwarzania strumieniowego).*
  - **Cel i DoD:** 
    - Refaktoryzacja `BrowserFileReader` – zastąpienie wczytywania całości do pamięci na rzecz użycia API `ReadableStream` lub paczkowania FileReader (Chunking).
    - Przebudowa `ICsvParser` na przetwarzanie przyrostowe (np. emisja paczek wierszy po 500 sztuk zamiast zwracania jednego wielkiego obiektu `ICsvParseResult`).
  - **Zależności:** Wykonany KROK 2.1 (Strumieniowanie wymaga asynchronicznej orkiestracji bez blokowania UI).

- [ ] **KROK 2.3: Obsługa wielu plików CSV**
  - **Powiązanie z Todoist:** *Obsługa wielu plików CSV jednocześnie.*
  - **Cel i DoD:** 
    - Zmiana `ConversionState` z obsługi pojedynczego pliku na zarządzanie kolekcją zadań (`ReadonlyArray<IConversionTaskState>`).
    - Aktualizacja `FileUploadView` (`<input multiple>`) oraz dodanie warstwy widoku menedżera zadań (lista wgrywanych/przetwarzanych plików).
    - Wymusza pętlę asynchroniczną w `ConversionUseCase`, orkiestrującą wiele plików.
  - **Zależności:** Wykonany KROK 2.1 i KROK 2.2 (System musi być gotowy na współbieżne obciążenie).

## Faza 3: Rozbudowa Domeny SQL i Integracje (Nowe Możliwości)
Finalna faza rozszerzająca kompatybilność wygenerowanego kodu SQL z konkretnymi silnikami bazodanowymi oraz zaawansowanymi typami.

- [ ] **KROK 3.1: Rozszerzenie typów danych SQL (JSON, UUID)**
  - **Powiązanie z Todoist:** *Rozszerzenie typów danych SQL (np. JSON, UUID).*
  - **Cel i DoD:** 
    - Dodanie nowych wartości do wyliczenia `SqlDataType`.
    - Wzbogacenie `TypeMatchers` o nowe predykaty `isUuid()` (walidacja RegEx formatu 8-4-4-4-12) oraz `isJson()` (próba `JSON.parse` dla dłuższych stringów owiniętych w klamry).
    - Rozbudowa logiki kaskadowej wnioskowania typów w `TypeInferenceEngine`.
  - **Zależności:** Brak zależności infrastrukturalnych, lecz wymaga modyfikacji istniejącego rdzenia domenowego z Fazy 1.

- [ ] **KROK 3.2: Wzorzec Strategii dla dialektów bazodanowych (PostgreSQL, MySQL)**
  - **Powiązanie z Todoist:** *Możliwość eksportu danych do innych formatów bazodanowych (np. PostgreSQL, MySQL).*
  - **Cel i DoD:** 
    - *Zależność techniczna wynikająca z OCP / DIP:* Wprowadzenie wzorca abstrakcyjnej fabryki / strategii dla generatorów SQL.
    - Wyodrębnienie specyficznych klas (np. `PostgresDdlBuilder`, `MySqlDdlBuilder`) implementujących wspólny interfejs `ISqlDdlBuilder`.
    - Dodanie wyboru silnika bazodanowego w interfejsie użytkownika (nowy komponent lub rozbudowa `IFileUploadView`).
    - Orkiestrator w `ConversionUseCase` dynamicznie wybiera właściwą implementację buildera przy zapisie.
  - **Zależności:** Wykonany KROK 3.1 (Generatory dialektów muszą umieć obsłużyć nowe typy danych, np. `JSON` w PG vs `JSON` w MySQL).