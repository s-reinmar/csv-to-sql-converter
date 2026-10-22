# Raport z realizacji: Faza 5: Warstwa Infrastruktury – Obsługa Plików i Zapisu

Poniżej znajduje się szczegółowy raport podsumowujący kroki 21 do 23, które realizują warstwę infrastruktury odpowiedzialną za bezpieczny odczyt plików CSV w przeglądarce oraz zapis wygenerowanych skryptów SQL po stronie serwera i poprzez dedykowany endpoint API.

---

## Krok 21 (src/infrastructure/BrowserFileReader.ts): Adapter odczytu plików CSV w przeglądarce

*   **Opis:** Klasa `BrowserFileReader` opakowuje natywne API przeglądarki `FileReader` w bezpieczny, otypowany `Promise<string>`, umożliwiając asynchroniczne wczytanie zawartości pliku CSV.
*   **Kluczowe mechanizmy:**
    *   Bezpieczna walidacja przekazanego obiektu `File`.
    *   Obsługa zdarzeń `onload`, `onerror` oraz `onabort` z mapowaniem na czytelne komunikaty błędów.
    *   Wsparcie dla wybranego kodowania znaków (domyślnie `'utf-8'`).
*   **Weryfikacja [SOLID / TypeScript]:**
    *   **Single Responsibility Principle (SRP):** Klasa skupia się wyłącznie na roli adaptera do natywnego API `FileReader`, bez domieszki logiki biznesowej.
    *   **Dependency Inversion Principle (DIP):** Pakuje mechanizmy natywne w czysty interfejs bazujący na `Promise`, ułatwiając testowanie i integrację.
    *   Zachowanie pełnego rygorystycznego typowania (`strict: true`, bez użycia typu `any`).

---

## Krok 22 (src/infrastructure/NodeSqlFileWriter.ts): Moduł serwerowy zapisu plików SQL

*   **Opis:** Serwis infrastrukturalny `NodeSqlFileWriter` zapisuje przesłaną treść SQL bezpośrednio do pliku w katalogu docelowym (np. `public/resources/<nazwa_pliku>.sql`) przy użyciu modułu `fs/promises` w środowisku Node.js.
*   **Kluczowe mechanizmy:**
    *   Walidacja poprawności nazwy pliku oraz obecności treści SQL.
    *   Zabezpieczenie przed atakami typu **Path Traversal** przy użyciu `path.basename`.
    *   Automatyczne tworzenie struktury katalogów rekurencyjnie (`fs.mkdir` z opcją `{ recursive: true }`).
    *   Asynchroniczny zapis pliku w kodowaniu UTF-8.
*   **Konfiguracja środowiskowa:**
    *   Wymaga instalacji pakietu typów `@types/node` oraz odpowiedniej konfiguracji `compilerOptions.types` w pliku `tsconfig.json`.
*   **Weryfikacja [SOLID]:**
    *   **SRP oraz OCP:** Odpowiedzialność ograniczona wyłącznie do fizycznego zapisu na dysku, z możliwością łatwej rozbudowy (np. o logowanie czy dodatkowe walidacje).

---

## Krok 23 (src/infrastructure/ApiSqlFileRepository.ts): Implementacja repozytorium SQL przez API

*   **Opis:** Klasa `ApiSqlFileRepository` implementuje kontrakt `ISqlFileRepository`, zapewniając komunikację z lokalnym endpointem serwera (np. `/api/save-sql`) w celu trwałego zapisu pliku `.sql`.
*   **Kluczowe mechanizmy:**
    *   Wykorzystanie nowoczesnego API `fetch` do wysyłania żądań HTTP `POST` z nagłówkiem `Content-Type: application/json`.
    *   Przesyłanie w ciele żądania struktury zawierającej `fileName` oraz `sqlContent`.
    *   Kompleksowa obsługa błędów HTTP oraz odczyt komunikatów zwracanych przez serwer.
*   **Weryfikacja [SOLID / Clean Architecture]:**
    *   **DIP / ISP:** Implementacja interfejsu domenowego `ISqlFileRepository` pozwala na całkowite odizolowanie logiki biznesowej od szczegółów transportu sieciowego.
    *   Pełne bezpieczeństwo typów TypeScript i odporność na błędne dane wejściowe.

---

## Podsumowanie Fazy 5

Faza 5 dostarcza kompletny zestaw adapterów i repozytoriów infrastrukturalnych. Umożliwiają one bezproblemowe wczytywanie danych wejściowych od użytkownika (pliki CSV w przeglądarce) oraz trwały zapis gotowych rezultatów (skrypty SQL na serwerze i przez endpoint API), zachowując rygorystyczne standardy architektury czystego kodu oraz silnego typowania.