# CSV converter to SQL (tool TypeScript)

Plan budowy aplikacji do konwersji plików CSV do formatu SQL w języku TypeScript został zaprojektowany w oparciu o architekturę czystą (Clean Architecture / Domain-Driven Design) oraz zasady SOLID. 

Aby umożliwić interaktywny interfejs formularza (pozwalający na ręczną korektę rozpoznanych typów danych) oraz bezpośredni zapis wygenerowanego pliku na dysku w katalogu `../public/resources`, architektura zakłada lekki układ Klient-Serwer (lub środowisko z lokalnym backendem Node.js/Vite) z całkowitym odseparowaniem logiki domenowej od warstwy widoku HTML DOM (Headless Architecture). Podczas implementacji każdego kolejnego kroku kod będzie generowany zgodnie z protokołem weryfikacji (`[SOLID CHECK]`, `[INTERFACE SUMMARY]`, `[SOURCE CODE]`, `[REFACTORING ALERT]`), z rygorystycznym typowaniem (zakaz `any`) i zachowaniem limitów linii kodu (SLOC).

## Docelowa struktura katalogów projektu (WebStorm)

```text
csv-to-sql-converter/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── public/
│   └── resources/                  # Docelowy katalog zapisu plików .sql
└── src/
    ├── domain/                     # Czysta logika biznesowa (Zero wiedzy o UI / I/O)
    │   ├── enums/
    │   │   └── SqlDataType.ts
    │   ├── models/
    │   │   ├── ColumnDefinition.ts
    │   │   ├── CsvRow.ts
    │   │   └── TableSchema.ts
    │   ├── contracts/              # Interfejsy (Dependency Inversion Principle)
    │   │   ├── ICsvParser.ts
    │   │   ├── ITypeInferenceEngine.ts
    │   │   ├── ISqlGenerator.ts
    │   │   └── ISqlFileRepository.ts
    │   └── services/               # Implementacje logiki domenowej
    │       ├── CsvTokenizer.ts
    │       ├── CsvParser.ts
    │       ├── TypeMatchers.ts
    │       ├── TypeInferenceEngine.ts
    │       ├── SqlValueEscaper.ts
    │       ├── SqlDdlBuilder.ts
    │       ├── SqlDmlBuilder.ts
    │       └── SqlGenerator.ts
    ├── infrastructure/             # Operacje wejścia/wyjścia i zapisu plików
    │   ├── BrowserFileReader.ts
    │   ├── NodeSqlFileWriter.ts
    │   └── ApiSqlFileRepository.ts
    ├── application/                # Przypadki użycia i stan aplikacji (Headless)
    │   ├── ConversionState.ts
    │   ├── SchemaOverrideService.ts
    │   └── ConversionUseCase.ts
    ├── presentation/               # Warstwa widoku (DOM) i stylizacja
    │   ├── styles/
    │   │   ├── theme-variables.css
    │   │   └── components.css
    │   ├── contracts/
    │   │   └── IViewComponents.ts
    │   ├── components/
    │   │   ├── FileUploadView.ts
    │   │   ├── SchemaEditorView.ts
    │   │   └── StatusNotificationView.ts
    │   └── controllers/
    │       └── AppController.ts
    └── main.ts                     # Punkt wejścia i kontener Dependency Injection
```

## Szczegółowy plan realizacji (Krok po kroku)

### Faza 1: Konfiguracja środowiska i projektu w WebStorm
Celem tej fazy jest przygotowanie rygorystycznego środowiska TypeScript, które na poziomie kompilatora wymusza brak niejawnych typów `any` oraz przygotowuje obsługę zapisu do `../public/resources`.
* **Krok 1 (`../package.json`)**: Inicjalizacja projektu Node.js, konfiguracja skryptów uruchomieniowych oraz zależności deweloperskich (`typescript`, `vite`, `@types/node`).
* **Krok 2 (`../tsconfig.json`)**: Konfiguracja kompilatora TypeScript z włączonymi flagami rygorystycznymi (`strict: true`, `noImplicitAny: true`, `strictNullChecks: true`, `noUnusedLocals: true`). 
* **Krok 3 (`vite.config.ts`)**: Konfiguracja serwera deweloperskiego z dedykowanym middlewarem Node.js obsługującym lokalny endpoint zapisu plików bezpośrednio do folderu `../public/resources`.
* **Krok 4 (`../public/resources/.gitkeep`)**: Utworzenie struktury katalogów statycznych i docelowego miejsca zapisu wygenerowanych skryptów `.sql`.

### Faza 2: Warstwa Domeny – Modele i Kontrakty (Interface-Driven Development)
Zgodnie z zasadą odwrócenia zależności (DIP), przed napisaniem jakiejkolwiek logiki definiujemy czyste typy, wyliczenia oraz interfejsy. 
* **Krok 5 (`../src/domain/enums/SqlDataType.ts`)**: Definicja wspieranych typów danych SQL (`INTEGER`, `DECIMAL`, `BOOLEAN`, `DATE`, `DATETIME`, `VARCHAR`, `TEXT`).
* **Krok 6 (`../src/domain/models/ColumnDefinition.ts`)**: Definicja niemutowalnych interfejsów opisujących pojedynczą kolumnę (nazwa oryginalna, znormalizowana nazwa SQL, wykryty typ, typ nadpisany przez użytkownika, flaga `isNullable`).
* **Krok 7 (`src/domain/models/CsvRow.ts`)**: Definicja struktur reprezentujących surowe wiersze, komórki oraz wynik wstępnego parsowania pliku CSV.
* **Krok 8 (`src/domain/models/TableSchema.ts`)**: Definicja pełnego schematu tabeli docelowej (nazwa tabeli, lista kolumn, opcje dialektu SQL).
* **Krok 9 (`src/domain/contracts/ICsvParser.ts`)**: Kontrakt dla serwisu parsującego surowy tekst CSV do ustrukturyzowanego modelu domenowego. 
* **Krok 10 (`src/domain/contracts/ITypeInferenceEngine.ts`)**: Kontrakt dla silnika wnioskującego typy danych na podstawie próbek wartości z kolumn. 
* **Krok 11 (`src/domain/contracts/ISqlGenerator.ts`)**: Kontrakty dla budowniczych zapytań DDL (`CREATE TABLE`), DML (`INSERT INTO`) oraz głównego generatora SQL. 
* **Krok 12 (`src/domain/contracts/ISqlFileRepository.ts`)**: Kontrakt dla repozytorium odpowiedzialnego za trwały zapis wygenerowanego kodu `.sql` w docelowej lokalizacji. 

### Faza 3: Warstwa Domeny – Silnik Parsowania CSV i Rozpoznawania Typów
Implementacja czystej logiki obliczeniowej (całkowicie odizolowanej od HTML DOM i API przeglądarki), podzielonej na małe klasy spełniające zasadę pojedynczej odpowiedzialności (SRP). 
* **Krok 13 (`src/domain/services/CsvTokenizer.ts`)**: Moduł pomocniczy rozbijający linie tekstu CSV na tokeny z uwzględnieniem cudzysłowów, znaków ucieczki i separatorów (np. `,` lub `;`).
* **Krok 14 (`src/domain/services/CsvParser.ts`)**: Implementacja `ICsvParser` – ekstrakcja nagłówków, walidacja spójności liczby kolumn i budowa obiektów wierszy. 
* **Krok 15 (`src/domain/services/TypeMatchers.ts`)**: Zestaw małych, atomowych predykatów (Type Guards / RegEx) sprawdzających, czy pojedynczy ciąg znaków pasuje do typu `INTEGER`, `DECIMAL`, `BOOLEAN` lub `DATE`. 
* **Krok 16 (`src/domain/services/TypeInferenceEngine.ts`)**: Implementacja `ITypeInferenceEngine` – agregacja wyników z `TypeMatchers` dla wszystkich wierszy w kolumnie, wykrywanie wartości `NULL` i dobór najbardziej precyzyjnego typu domyślnego. 

### Faza 4: Warstwa Domeny – Generator Kodów SQL
Rozbicie procesu generowania pliku `.sql` na trzy niezależne moduły (formatowanie wartości, struktura tabeli, wsadowe wstawianie danych), aby zachować limit 25–30 linii na metodę. 
* **Krok 17 (`src/domain/services/SqlValueEscaper.ts`)**: Serwis odpowiedzialny za bezpieczne formatowanie wartości (ochrona przed błędami składni i SQL Injection, obsługa apostrofów, rzutowanie `NULL`, formatowanie liczb i dat).
* **Krok 18 (`src/domain/services/SqlDdlBuilder.ts`)**: Budowniczy instrukcji `CREATE TABLE` na podstawie zatwierdzonego przez użytkownika schematu `TableSchema`.
* **Krok 19 (`src/domain/services/SqlDmlBuilder.ts`)**: Budowniczy instrukcji `INSERT INTO` przekształcający wiersze CSV zgodnie z wybranymi typami kolumn przy użyciu `SqlValueEscaper`.
* **Krok 20 (`src/domain/services/SqlGenerator.ts`)**: Implementacja `ISqlGenerator` – koordynator łączący nagłówki komentarzy, kod z `SqlDdlBuilder` oraz paczki danych z `SqlDmlBuilder` w finalny skrypt SQL. 

### Faza 5: Warstwa Infrastruktury – Obsługa Plików i Zapisu
Moduły realizujące fizyczny odczyt pliku wsadowego oraz jego zapis na dysku w folderze `../public/resources`.
* **Krok 21 (`src/infrastructure/BrowserFileReader.ts`)**: Adapter opakowujący API `FileReader` w bezpieczny, otypowany `Promise<string>` wczytujący zawartość pliku CSV.
* **Krok 22 (`src/infrastructure/NodeSqlFileWriter.ts`)**: Moduł serwerowy zapisujący przesłaną treść bezpośrednio do `public/resources/<nazwa_pliku>.sql` przy użyciu modułu `fs/promises`.
* **Krok 23 (`src/infrastructure/ApiSqlFileRepository.ts`)**: Implementacja interfejsu `ISqlFileRepository` komunikująca się z lokalnym endpointem w celu trwałego zapisu pliku `.sql` w `../public/resources`. 

### Faza 6: Warstwa Aplikacji – Zarządzanie Stanem i Przypadki Użycia
Warstwa pośrednicząca (Application Layer), która pozwala na modyfikację rozpoznanych typów danych przed wygenerowaniem SQL, nie posiadając żadnej wiedzy o elementach HTML. 
* **Krok 24 (`src/application/ConversionState.ts`)**: Niemutowalny kontener stanu przechowujący aktualnie wczytane dane CSV, roboczą wersję schematu tabeli oraz statusy błędów.
* **Krok 25 (`src/application/SchemaOverrideService.ts`)**: Serwis aplikacyjny umożliwiający ręczną zmianę typu danych konkretnej kolumny, zmianę nazwy kolumny lub przełączenie flagi `NULL` / `NOT NULL` przez użytkownika.
* **Krok 26 (`src/application/ConversionUseCase.ts`)**: Główny koordynator przepływu pracy (Orkiestrator) przyjmujący zależności przez konstruktor (Dependency Injection): wczytuje CSV, uruchamia detekcję typów, przyjmuje poprawki i zleca zapis gotowego pliku `.sql`. 

### Faza 7: Warstwa Prezentacji – Szata Graficzna (Czarno-Niebieski / Jasny Niebieski)
Stworzenie interfejsu użytkownika w zadanej kolorystyce ciemnego motywu z jasnoniebieskimi akcentami.
* **Krok 27 (`index.html`)**: Semantyczny szkielet dokumentu HTML5 z kontenerami na formularz wgrania pliku, tabelę edycji typów kolumn, podgląd SQL oraz panel powiadomień.
* **Krok 28 (`src/presentation/styles/theme-variables.css`)**: Definicja zmiennych CSS (Custom Properties) realizujących paletę barw: głębokie czarno-granatowe tła (`#0a0e17`, `#111827`), ciemnoniebieskie panele (`#1e293b`) oraz jasnoniebieskie akcenty, obramowania i kontrolki (`#38bdf8`, `#0ea5e9`).
* **Krok 29 (`src/presentation/styles/components.css`)**: Stylizacja formularza, tabel edycji typów, list rozwijanych (`<select>`), przycisków akcji oraz bloku podglądu kodu SQL.

### Faza 8: Warstwa Prezentacji – Komponenty Widoku i Kontrolery (DOM)
Cienka warstwa widoku odpowiedzialna wyłącznie za renderowanie danych na ekranie i przekazywanie zdarzeń użytkownika do warstwy aplikacji. 
* **Krok 30 (`src/presentation/contracts/IViewComponents.ts`)**: Kontrakty definiujące metody komunikacji pomiędzy kontrolerem a poszczególnymi sekcjami widoku HTML. 
* **Krok 31 (`src/presentation/components/FileUploadView.ts`)**: Komponent obsługujący pole wyboru pliku CSV (oraz Drag & Drop), wybór separatora i docelowej nazwy tabeli SQL.
* **Krok 32 (`src/presentation/components/SchemaEditorView.ts`)**: Komponent generujący dynamiczny formularz tabelaryczny – wyświetla wykryte kolumny, przykładowe wartości z CSV oraz pola `<select>` pozwalające poprawić rozpoznany typ danych na właściwy.
* **Krok 33 (`src/presentation/components/StatusNotificationView.ts`)**: Komponent wyświetlający podgląd wygenerowanego kodu SQL oraz komunikaty o pomyślnym zapisie pliku w `../public/resources`.
* **Krok 34 (`src/presentation/controllers/AppController.ts`)**: Kontroler spinający zdarzenia z komponentów widoku (`FileUploadView`, `SchemaEditorView`) z metodami `ConversionUseCase` oraz `SchemaOverrideService`.

### Faza 9: Inicjalizacja (Composition Root) i Weryfikacja
Złożenie wszystkich warstw w jednym punkcie startowym z wykorzystaniem wstrzykiwania zależności (Dependency Injection). 
* **Krok 35 (`src/main.ts`)**: Utworzenie instancji serwisów domenowych, repozytoriów infrastruktury, przypadków użycia oraz widoków i wstrzyknięcie ich przez konstruktory do `AppController`. 
* **Krok 36 (`public/resources/sample.csv`)**: Przygotowanie testowego pliku wsadowego CSV zawierającego różnorodne typy danych (liczby całkowite, kwoty zmiennoprzecinkowe, wartości logiczne, daty oraz teksty ze znakami specjalnymi) w celu przetestowania pełnego cyklu konwersji i zapisu `.sql`.