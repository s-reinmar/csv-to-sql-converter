# Raport z Projektu: Faza 1 – Konfiguracja środowiska i projektu w WebStorm

Niniejszy raport dokumentuje przebieg oraz konfigurację pierwszego etapu prac nad projektem, obejmującego przygotowanie środowiska deweloperskiego w środowisku WebStorm oraz definicję kluczowych plików konfiguracyjnych i struktury katalogów.

---

## Krok 1 (`package.json`): Inicjalizacja projektu Node.js i zależności
Podczas inicjalizacji projektu w środowisku WebStorm utworzony został plik manifestu `package.json`. Zawiera on definicję projektu jako aplikacji Node.js, niezbędne skrypty uruchomieniowe (w tym uruchomienie serwera deweloperskiego oraz budowanie aplikacji) oraz zestaw zależności deweloperskich (`devDependencies`) niezbędnych do działania nowoczesnego stosu opartego o TypeScript oraz Vite.

*   **Zależności deweloperskie:**
    *   `typescript` – kompilator oraz typowanie statyczne języka TypeScript.
    *   `vite` – superszybki bundler i serwer deweloperski.
    *   `@types/node` – definicje typów środowiska Node.js dla wsparcia operacji plikowych i middleware.

---

## Krok 2 (`tsconfig.json`): Konfiguracja kompilatora TypeScript
W celu zapewnienia najwyższej jakości kodu, bezpieczeństwa typów oraz wczesnego wykrywania błędów, plik konfiguracyjny kompilatora TypeScript (`tsconfig.json`) został wzbogacony o rygorystyczne flagi kontrolne:

*   `strict: true` – włącza ogólny rygorystyczny tryb sprawdzania typów.
*   `noImplicitAny: true` – uniemożliwia stosowanie domniemanego typu `any`, wymuszając jawne deklarowanie typów.
*   `strictNullChecks: true` – rygorystycznie traktuje wartości `null` oraz `undefined`, zapobiegając powszechnym błędom wykonania.
*   `noUnusedLocals: true` – zgłasza błędy w przypadku wykrycia nieużywanych zmiennych lokalnych, co pomaga utrzymać czystość kodu.

---

## Krok 3 (`vite.config.ts`): Konfiguracja serwera deweloperskiego i middleware
Plik konfiguracyjny Vite (`vite.config.ts`) integruje frontendową część aplikacji z lokalnym środowiskiem Node.js za pomocą dedykowanego middleware. 
*   **Kluczowa funkcjonalność:** Middleware rejestruje lokalny endpoint API, który obsługuje żądania zapisu plików bezpośrednio w systemie plików serwera deweloperskiego.
*   **Cel:** Umożliwia to automatyczne zapisywanie wygenerowanych skryptów `.sql` bezpośrednio do folderu docelowego bez konieczności ręcznego pobierania plików przez przeglądarkę.

---

## Krok 4 (`public/resources/.gitkeep`): Struktura katalogów statycznych
W oparciu o załączony skrypt automatyzujący PowerShell, w projekcie została utworzona kompletna architektoniczna struktura katalogów (podział na warstwy `domain`, `infrastructure`, `application`, `presentation`).

*   **Miejsce zapisu:** Utworzono docelowy katalog statyczny `public/resources`.
*   **Plik `.gitkeep`:** Wewnątrz katalogu `resources` umieszczono pusty plik `.gitkeep`, co pozwala na śledzenie tego folderu w systemie kontroli wersji Git, pomimo jego początkowej pustej zawartości.

```powershell
$directories = @(
"csv-to-sql-converter/public/resources",
"csv-to-sql-converter/src/domain/enums",
"csv-to-sql-converter/src/domain/models",
"csv-to-sql-converter/src/domain/contracts",
"csv-to-sql-converter/src/domain/services",
"csv-to-sql-converter/src/infrastructure",
"csv-to-sql-converter/src/application",
"csv-to-sql-converter/src/presentation/styles",
"csv-to-sql-converter/src/presentation/contracts",
"csv-to-sql-converter/src/presentation/components",
"csv-to-sql-converter/src/presentation/controllers"
)

foreach ($dir in $directories) {
New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

New-Item -ItemType File -Force -Path "csv-to-sql-converter/public/resources/.gitkeep" | Out-Null
```

---

## Podsumowanie
Faza 1 została w pełni zrealizowana. Środowisko WebStorm, struktura plików, konfiguracja TypeScript oraz środowisko uruchomieniowe Vite z mechanizmem zapisu plików są gotowe do dalszego etapu implementacji logiki biznesowej konwertera CSV na SQL.