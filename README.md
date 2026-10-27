# 🚀 CSV to SQL Converter (TypeScript) - v1.1.0

<p align="center">
  <img src="public/convert-csv-to-sql.jpg" alt="PWA Preview">
</p>

Zaawansowana, lekka aplikacja webowa napisana w czystym **TypeScript**, służąca do konwersji plików wsadowych **CSV** do formatu SQL (`CREATE TABLE` + `INSERT INTO`). Narzędzie automatycznie rozpoznaje typy danych, normalizuje nazwy (usuwając polskie znaki i znaki specjalne do formatu `snake_case`), wykrywa separator, umożliwia interaktywną korektę schematu (w tym zmianę kolejności kolumn) oraz generuje i zapisuje wynikowy skrypt.

Projekt został zrealizowany z zachowaniem rygorystycznych standardów inżynieryjnych: wzorców **Clean Architecture**, **Domain-Driven Design (DDD)** oraz zasad **SOLID**.

---

## 🌐 Linki do aplikacji i wersji

* **Aplikacja na żywo (Netlify, v.1.1.1):** [https://dazzling-pothos-00b6ea.netlify.app/](https://dazzling-pothos-00b6ea.netlify.app/)
* **Wersja stabilna (GitHub Pages - v1.1.1):** [https://s-reinmar.github.io/csv-to-sql-converter/](https://s-reinmar.github.io/csv-to-sql-converter/)
* **Paczki dystrybucyjne (.zip z katalogu `dist/`):** [GitHub Releases (v1.1.1)](https://github.com/s-reinmar/csv-to-sql-converter/releases/download/app-fix/converter.zip)

---

## ✨ Główne funkcje i Usprawnienia (v1.1.1)

* **Headless Architecture:** Całkowite odseparowanie logiki domenowej i aplikacyjnej od warstwy widoku HTML DOM.
* **Strict TypeScript:** Rygorystyczne typowanie (`strict: true`, brak typu `any`).
* **Automatyczna normalizacja:** Usuwanie polskich znaków i znaków specjalnych do formatu `snake_case` dla nazw tabel i kolumn.
* **Inteligentna detekcja:** Automatyczne wykrywanie separatora pliku CSV na podstawie heurystyki pierwszej próbki.
* **Edytor schematu:** Dynamiczna zmiana typów, wartości NULL oraz zmiana kolejności kolumn (↑ / ↓) z natychmiastową regeneracją kodu SQL.
* **Ciemny motyw:** Nowoczesny i czytelny interfejs w kolorystyce czarno-niebieskiej.

---

## 💻 Instrukcja Uruchomienia i Budowania

### 1. Wymagania wstępne
Upewnij się, że masz zainstalowane środowisko **Node.js** (zalecana wersja LTS) oraz menedżer pakietów **npm**.

### 2. Uruchomienie lokalne w trybie deweloperskim (Dev)
Aby uruchomić projekt lokalnie na swoim komputerze w celach testowych lub rozwojowych:

```bash
# 1. Sklonuj repozytorium
git clone https://github.com/s-reinmar/csv-to-sql-converter.git
cd csv-to-sql-converter

# 2. Zainstaluj wymagane zależności
npm install

# 3. Uruchom serwer deweloperski Vite
npm run dev
```
Aplikacja zostanie uruchomiona lokalnie (zazwyczaj pod adresem `http://localhost:5173` lub innym wskazanym w terminalu).

### 3. Budowanie wersji produkcyjnej (Build)
Aby wygenerować skompilowaną i zoptymalizowaną paczkę produkcyjną do wdrożenia (folder `dist/`):

```bash
npm run build
```
Skompilowane pliki statyczne znajdziesz w folderze `dist/`. Możesz je wgrać bezpośrednio na dowolny hosting statyczny lub spakować do archiwum `.zip` i opublikować w sekcji [Releases](https://github.com/s-reinmar/csv-to-sql-converter/releases).

---

## 📁 Struktura Katalogów (Clean Architecture)

Struktura projektu w WebStorm zorganizowana zgodnie z Clean Architecture:
```text
csv-to-sql-converter/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── README.md
├── public/
│   └── resources/                  # Katalog zasobów i plików testowych
│       ├── .gitkeep
│       └── sample.csv              # Testowy plik wsadowy CSV
└── src/
    ├── main.ts                     # Punkt wejścia i Composition Root (DI)
    ├── domain/                     # Czysta logika biznesowa (Zero zależności od UI / I/O)
    │   ├── enums/
    │   ├── models/
    │   ├── contracts/              # Interfejsy domenowe (DIP)
    │   └── services/               # Parsowanie, normalizacja, typowanie i SQL generator
    ├── infrastructure/             # Operacje I/O i odczyt/zapis plików
    ├── application/                # Przypadki użycia i zarządzanie stanem
    └── presentation/               # Warstwa widoku (DOM) i stylizacja
        ├── styles/
        ├── contracts/
        ├── components/             # FileUploadView, SchemaEditorView, StatusNotificationView
        └── controllers/            # AppController
```

## Status Realizacji Projektu - radmap v1.0.0 - zakończone

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

## Usprawnienia Post-MVP - roadmap v1.1.0 - zakończone

- [X] KROK 1.1: Automatyczna normalizacja nazw tabel i kolumn (usuwanie polskich znaków, zamiana na snake_case, np. IMIĘ $\rightarrow$ imie).
- [X] KROK 1.2: Automatyczna detekcja separatora pliku CSV na podstawie heurystyki pierwszej próbki.
- [X] KROK 1.3: Rozszerzona walidacja danych wejściowych i prezentacja ostrzeżeń (warnings).
- [X] KROK 1.4: Dynamiczna zmiana kolejności kolumn w edytorze schematu (↑ / ↓) z natychmiastową regeneracją kodu SQL.
- [X] KROK 1.5: Usprawnienia w ustawieniach wersji build PWA (vite.config.ts), niektórych plików.

---

## 👤 Autor

* **s-reinmar** - [GitHub Profile](https://github.com/s-reinmar)