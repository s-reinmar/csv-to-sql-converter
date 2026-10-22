# CSV to SQL Converter (TypeScript)

Aplikacja webowa w języku **TypeScript** służąca do konwersji plików wsadowych **CSV** do formatu SQL (`CREATE TABLE` + `INSERT INTO`). Narzędzie automatycznie rozpoznaje typy danych na podstawie zawartości kolumn, umożliwia ich ręczną korektę w interaktywnym formularzu oraz zapisuje wynikowy skrypt bezpośrednio w katalogu `public/resources/`.
W tym projekcie zastosowano rygorystyczne typowanie TypeScript, wzorce projektowe **Clean Architecture**, **Domain-Driven Design (DDD)** oraz zasady **SOLID**.
W szczególności, projekt realizuje następujące założenia:
* **Headless Architecture:** Całkowite odseparowanie logiki domenowej i aplikacyjnej od warstwy widoku HTML DOM.
* **Strict TypeScript:** Rygorystyczne typowanie (`strict: true`, `noImplicitAny: true`, `strictNullChecks: true`, całkowity zakaz używania typu `any`).
* **Interface-Driven Development (DIP):** Komunikacja pomiędzy warstwami odbywa się wyłącznie za pośrednictwem jawnych kontraktów (interfejsów).
* **Niskie SLOC i SRP:** Podział logiki na małe, atomowe klasy i metody o pojedynczej odpowiedzialności.
* **Ciemny motyw graficzny:** Interfejs użytkownika w kolorystyce czarno-niebieskiej z jasnoniebieskimi akcentami, zapewniający komfort pracy w warunkach słabego oświetlenia.
* **Wersja 1.0.0:** Projekt jest w pełni funkcjonalny i gotowy do użycia w środowisku przeglądarkowym, z możliwością dalszej rozbudowy o dodatkowe funkcje i integracje.

Specyfikacja zawarta w CODING_STANDARDS.md oraz w dokumentacji krok po kroku w katalogu `docs/steps/` opisuje szczegółowo proces implementacji, strukturę katalogów, interfejsy, modele danych oraz przypadki użycia, umożliwiając łatwe zrozumienie i rozwijanie projektu przez innych programistów.
Dodatkowo opatrzone plikiem ROADMAP.md zawierają plan dalszego rozwoju projektu, w tym potencjalne funkcje i usprawnienia, które mogą zostać wprowadzone w kolejnych wersjach.

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
Środowisko projektowe oraz pełne drzewo katalogów zostały pomyślnie zainicjalizowane. (Kroki 1-4 w dokumentacji krok po kroku).

---

### ⏳ Kolejne Fazy w Planie Budowy

- [X] **Faza 2: Warstwa Domeny – Modele i Kontrakty (Kroki 5–12)**
    - Definicja `SqlDataType`, modeli `ColumnDefinition`, `CsvRow`, `TableSchema` oraz interfejsów `ICsvParser`, `ITypeInferenceEngine`, `ISqlGenerator`, `ISqlFileRepository`.
- [X] **Faza 3: Warstwa Domeny – Silnik Parsowania CSV i Rozpoznawania Typów (Kroki 13–16)**
    - Implementacja `CsvTokenizer`, `CsvParser`, `TypeMatchers` oraz `TypeInferenceEngine`.
- [X] **Faza 4: Warstwa Domeny – Generator Kodów SQL (Kroki 17–20)**
    - Implementacja `SqlValueEscaper`, `SqlDdlBuilder`, `SqlDmlBuilder` oraz `SqlGenerator`.
- [X] **Faza 5: Warstwa Infrastruktury – Obsługa Plików i Zapisu (Kroki 21–23)**
    - Implementacja `BrowserFileReader`, `NodeSqlFileWriter` oraz `ApiSqlFileRepository`.
- [X] **Faza 6: Warstwa Aplikacji – Zarządzanie Stanem i Przypadki Użycia (Kroki 24–26)**
    - Implementacja `ConversionState`, `SchemaOverrideService` oraz `ConversionUseCase`.
- [X] **Faza 7: Warstwa Prezentacji – Szata Graficzna (Kroki 27–29)**
    - Stworzenie `index.html`, `theme-variables.css` oraz `components.css` (ciemny motyw czarno-niebieski z jasnoniebieskimi akcentami).
- [X] **Faza 8: Warstwa Prezentacji – Komponenty Widoku i Kontrolery DOM (Kroki 30–34)**
    - Implementacja `IViewComponents`, `FileUploadView`, `SchemaEditorView`, `StatusNotificationView` oraz `AppController`.
- [X] **Faza 9: Inicjalizacja (Composition Root) i Dane Testowe (Kroki 35–36)**
    - Wstrzyknięcie zależności w `src/main.ts` oraz przygotowanie pliku testowego `public/resources/sample.csv`.