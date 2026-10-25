# CSV to SQL Converter (TypeScript) - MVP

Aplikacja webowa w języku **TypeScript** służąca do konwersji plików wsadowych **CSV** do formatu SQL (`CREATE TABLE` + `INSERT INTO`). Narzędzie automatycznie rozpoznaje typy danych na podstawie zawartości kolumn, umożliwia ich ręczną korektę w interaktywnym formularzu oraz zapisuje wynikowy skrypt bezpośrednio w katalogu `public/resources/`.

Projekt został zrealizowany jako **Minimum Viable Product (MVP)** w oparciu o rygorystyczne typowanie TypeScript, wzorce projektowe **Clean Architecture**, **Domain-Driven Design (DDD)** oraz zasady **SOLID**.

Projekt realizuje następujące założenia:
- **Headless Architecture:** Całkowite odseparowanie logiki domenowej i aplikacyjnej od warstwy widoku HTML DOM.
- **Strict TypeScript:** Rygorystyczne typowanie (`strict: true`, `noImplicitAny: true`, `strictNullChecks: true`, całkowity zakaz używania typu `any`).
- **Interface-Driven Development (DIP):** Komunikacja pomiędzy warstwami odbywa się wyłącznie za pośrednictwem jawnych kontraktów (interfejsów).
- **Niskie SLOC i SRP:** Podział logiki na małe, atomowe klasy i metody o pojedynczej odpowiedzialności.
- **Ciemny motyw graficzny:** Interfejs użytkownika w kolorystyce czarno-niebieskiej z jasnoniebieskimi akcentami, zapewniający komfort pracy w warunkach słabego oświetlenia.
- **Wersja 1.0.0 (MVP):** Projekt jest w pełni funkcjonalny, przetestowany i gotowy do użycia w środowisku przeglądarkowym.

---

## Założenia Architektoniczne

Projekt realizuje zasady **Clean Architecture**, **Domain-Driven Design (DDD)** oraz **SOLID**:
- **Headless Architecture:** Odseparowanie logiki od widoku DOM.
- **Strict TypeScript:** Pełne bezpieczeństwo typów.
- **Interface-Driven Development (DIP):** Komunikacja przez kontrakty.
- **Niskie SLOC i SRP:** Atomowe klasy o pojedynczej odpowiedzialności.

---

## Struktura Katalogów

```text
csv-to-sql-converter/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── README.md
├── public/
│   └── resources/                  # Docelowy katalog zapisu wygenerowanych plików .sql
│       ├── .gitkeep
│       └── sample.csv              # Testowy plik wsadowy CSV
└── src/
    ├── main.ts                     # Punkt wejścia i Composition Root (DI)
    ├── domain/                     # Czysta logika biznesowa
    │   ├── enums/
    │   ├── models/
    │   ├── contracts/              # Interfejsy domenowe (DIP)
    │   └── services/               # Parsowanie, wnioskowanie typów i generowanie SQL
    ├── infrastructure/             # Operacje wejścia/wyjścia (I/O) i zapis plików
    ├── application/                # Przypadki użycia i zarządzanie stanem (Headless)
    └── presentation/               # Warstwa widoku (DOM) i stylizacja
        ├── styles/
        ├── contracts/
        ├── components/
        └── controllers/
```

---

## Status Realizacji Projektu (MVP - Fazy 1–9 ukończone)

- [x] **Faza 1: Konfiguracja środowiska i projektu w WebStorm (Zakończona)**
  Środowisko projektowe, pakiet `package.json`, konfiguracja `tsconfig.json` oraz middleware zapisu plików w `vite.config.ts` zostały w pełni skonfigurowane.
- [x] **Faza 2: Warstwa Domeny – Modele i Kontrakty (Zakończona)**
  Definicja `SqlDataType`, modeli `ColumnDefinition`, `CsvRow`, `TableSchema` oraz interfejsów `ICsvParser`, `ITypeInferenceEngine`, `ISqlGenerator`, `ISqlFileRepository`.
- [x] **Faza 3: Warstwa Domeny – Silnik Parsowania CSV i Rozpoznawania Typów (Zakończona)**
  Implementacja `CsvTokenizer`, `CsvParser`, `TypeMatchers` oraz `TypeInferenceEngine`.
- [x] **Faza 4: Warstwa Domeny – Generator Kodów SQL (Zakończona)**
  Implementacja `SqlValueEscaper`, `SqlDdlBuilder`, `SqlDmlBuilder` oraz `SqlGenerator`.
- [x] **Faza 5: Warstwa Infrastruktury – Obsługa Plików i Zapisu (Zakończona)**
  Implementacja `BrowserFileReader`, `NodeSqlFileWriter` oraz `ApiSqlFileRepository`.
- [x] **Faza 6: Warstwa Aplikacji – Zarządzanie Stanem i Przypadki Użycia (Zakończona)**
  Implementacja niemutowalnego kontenera `ConversionState`, `SchemaOverrideService` oraz `ConversionUseCase`.
- [x] **Faza 7: Warstwa Prezentacji – Szata Graficzna (Zakończona)**
  Stworzenie `index.html`, `theme-variables.css` oraz `components.css` (ciemny motyw czarno-niebieski z jasnoniebieskimi akcentami).
- [x] **Faza 8: Warstwa Prezentacji – Komponenty Widoku i Kontrolery DOM (Zakończona)**
  Implementacja `IViewComponents`, `FileUploadView`, `SchemaEditorView`, `StatusNotificationView` oraz `AppController`.
- [x] **Faza 9: Inicjalizacja (Composition Root) i Dane Testowe (Zakończona)**
  Wstrzyknięcie zależności w `src/main.ts` oraz przygotowanie pliku testowego `public/resources/sample.csv`.

---

## CSV to SQL Converter (Faza Post-MVP)

- [X] KROK 1.1: Automatyczna normalizacja nazw tabel i kolumn
- [X] KROK 1.2: Automatyczna detekcja separatora pliku CSV

---

## Uruchomienie projektu (MVP)

1. Zainstaluj zależności:
   ```bash
   npm install
   ```
2. Uruchom serwer deweloperski:
   ```bash
   npm run dev
   ```
3. Otwórz aplikację w przeglądarce pod wskazanym adresem (np. `http://localhost:3000`).