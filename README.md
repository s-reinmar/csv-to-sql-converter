# CSV to SQL Converter (TypeScript)

Aplikacja webowa w języku **TypeScript** służąca do konwersji plików wsadowych **CSV** do formatu SQL (`CREATE TABLE` + `INSERT INTO`). Narzędzie automatycznie rozpoznaje typy danych na podstawie zawartości kolumn, umożliwia ich ręczną korektę w interaktywnym formularzu oraz zapisuje wynikowy skrypt bezpośrednio w katalogu `public/resources/`.

---

## Założenia Architektoniczne

Projekt jest realizowany zgodnie z zasadami **Clean Architecture**, **Domain-Driven Design (DDD)** oraz **SOLID**:
* **Headless Architecture:** Całkowite odseparowanie logiki domenowej i aplikacyjnej od warstwy widoku HTML DOM.
* **Strict TypeScript:** Rygorystyczne typowanie (`strict: true`, `noImplicitAny: true`, `strictNullChecks: true`, całkowity zakaz używania typu `any`).
* **Interface-Driven Development (DIP):** Komunikacja pomiędzy warstwami odbywa się wyłącznie za pośrednictwem jawnych kontraktów (interfejsów).
* **Niskie SLOC i SRP:** Podział logiki na małe, atomowe klasy i metody o pojedynczej odpowiedzialności.

---

## Struktura Katalogów

Struktura projektu przygotowana w środowisku **WebStorm IDE**:

```text
csv-to-sql-converter/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
├── public/
│   └── resources/                  # Docelowy katalog zapisu wygenerowanych plików .sql
│       └── .gitkeep
└── src/
    ├── domain/                     # Czysta logika biznesowa (Zero wiedzy o UI / I/O)
    │   ├── enums/
    │   ├── models/
    │   ├── contracts/              # Interfejsy domenowe (DIP)
    │   └── services/               # Implementacje parsera CSV, detekcji typów i generatora SQL
    ├── infrastructure/             # Operacje wejścia/wyjścia i zapisu plików
    ├── application/                # Przypadki użycia i zarządzanie stanem (Headless)
    └── presentation/               # Warstwa widoku (DOM) i stylizacja (Czarno-Niebieski / Jasny Niebieski)
        ├── styles/
        ├── contracts/
        ├── components/
        └── controllers/
```

---

## Status Realizacji Projektu

### ✅ Faza 1: Konfiguracja środowiska i projektu w WebStorm (Zakończona)
Środowisko projektowe oraz pełne drzewo katalogów zostały pomyślnie zainicjalizowane:

- [x] **Krok 1 (`package.json`):** Inicjalizacja projektu Node.js, konfiguracja skryptów uruchoményjnych oraz zależności deweloperskich (`typescript`, `vite`, `@types/node`) – *wygenerowano automatycznie w WebStorm IDE*.
- [x] **Krok 2 (`tsconfig.json`):** Konfiguracja kompilatora TypeScript z włączonymi flagami rygorystycznymi (`strict: true`, `noImplicitAny: true`, `strictNullChecks: true`, `noUnusedLocals: true`) – *wygenerowano automatycznie w WebStorm IDE*.
- [x] **Krok 3 (`vite.config.ts`):** Konfiguracja serwera deweloperskiego z dedykowanym middlewarem Node.js obsługującym lokalny endpoint zapisu plików bezpośrednio do folderu `public/resources/` – *wygenerowano automatycznie w WebStorm IDE*.
- [x] **Krok 4 (`public/resources/.gitkeep` oraz drzewo `src/`):** Utworzenie struktury katalogów statycznych i docelowego miejsca zapisu wygenerowanych skryptów `.sql` – *wykonano za pomocą skryptu PowerShell*.

---

### ⏳ Kolejne Fazy w Planie Budowy

- [ ] **Faza 2: Warstwa Domeny – Modele i Kontrakty (Kroki 5–12)**
    - Definicja `SqlDataType`, modeli `ColumnDefinition`, `CsvRow`, `TableSchema` oraz interfejsów `ICsvParser`, `ITypeInferenceEngine`, `ISqlGenerator`, `ISqlFileRepository`.
- [ ] **Faza 3: Warstwa Domeny – Silnik Parsowania CSV i Rozpoznawania Typów (Kroki 13–16)**
    - Implementacja `CsvTokenizer`, `CsvParser`, `TypeMatchers` oraz `TypeInferenceEngine`.
- [ ] **Faza 4: Warstwa Domeny – Generator Kodów SQL (Kroki 17–20)**
    - Implementacja `SqlValueEscaper`, `SqlDdlBuilder`, `SqlDmlBuilder` oraz `SqlGenerator`.
- [ ] **Faza 5: Warstwa Infrastruktury – Obsługa Plików i Zapisu (Kroki 21–23)**
    - Implementacja `BrowserFileReader`, `NodeSqlFileWriter` oraz `ApiSqlFileRepository`.
- [ ] **Faza 6: Warstwa Aplikacji – Zarządzanie Stanem i Przypadki Użycia (Kroki 24–26)**
    - Implementacja `ConversionState`, `SchemaOverrideService` oraz `ConversionUseCase`.
- [ ] **Faza 7: Warstwa Prezentacji – Szata Graficzna (Kroki 27–29)**
    - Stworzenie `index.html`, `theme-variables.css` oraz `components.css` (ciemny motyw czarno-niebieski z jasnoniebieskimi akcentami).
- [ ] **Faza 8: Warstwa Prezentacji – Komponenty Widoku i Kontrolery DOM (Kroki 30–34)**
    - Implementacja `IViewComponents`, `FileUploadView`, `SchemaEditorView`, `StatusNotificationView` oraz `AppController`.
- [ ] **Faza 9: Inicjalizacja (Composition Root) i Dane Testowe (Kroki 35–36)**
    - Wstrzyknięcie zależności w `src/main.ts` oraz przygotowanie pliku testowego `public/resources/sample.csv`.