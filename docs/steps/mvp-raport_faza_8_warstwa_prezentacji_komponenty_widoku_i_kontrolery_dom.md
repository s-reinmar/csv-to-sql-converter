# Raport z realizacji: Faza 8: Warstwa Prezentacji – Komponenty Widoku i Kontrolery (DOM)

Poniżej znajduje się szczegółowy raport podsumowujący kroki od 30 do 34, które realizują budowę warstwy prezentacji DOM oraz kontrolerów aplikacji opartych na architekturze interfejsów i wzorcu Model-View-Controller (MVC).

---

## Krok 30 (src/presentation/contracts/IViewComponents.ts): Kontrakty komponentów widoku

* **Opis:** Definicja interfejsów (`IFileUploadView`, `ISchemaEditorView`, `IStatusNotificationView`) określających kontrakt komunikacyjny pomiędzy kontrolerem a poszczególnymi sekcjami interfejsu HTML.
* **Kluczové elementy:**
  * `IFileUploadView`: Rejestracja zdarzenia wyboru pliku, renderowanie stanu zablokowania kontrolek w trakcie ładowania oraz obsługa błędów.
  * `ISchemaEditorView`: Rejestracja nasłuchiwaczy zmian nazw kolumn, typów danych, flag NULL / NOT NULL oraz nazwy tabeli docelowej.
  * `IStatusNotificationView`: Rejestracja akcji zapisu pliku `.sql`, podgląd kodu oraz system powiadomień o sukcesach i błędach.
* **Weryfikacja [SOLID / TS]:** Zgodność z zasadą pojedynczej odpowiedzialności (SRP) oraz odwróceniem zależności (DIP). Interfejsy ściśle oddzielają logikę kontrolera od konkretnych elementów DOM.

---

## Krok 31 (src/presentation/components/FileUploadView.ts): Komponent wgrania pliku CSV

* **Opis:** Implementacja interfejsu `IFileUploadView` zarządzająca elementami DOM formularza pliku, strefą Drag & Drop, selektorem separatora oraz polem nazwy tabeli.
* **Kluczowe funkcjonalności:**
  * Obsługa natywnego wyboru pliku przez `input[type="file"]` oraz zdarzeń przeciągania (`dragover`, `dragleave`, `drop`).
  * Dynamiczne blokowanie kontrolek i zmiana stylów strefy upuszczania w trakcie asynchronicznego przetwarzania (`isLoading`).
  * Automatyczne uzupełnianie domyślnej nazwy tabeli na podstawie sparsowanego schematu.
* **Weryfikacja [SOLID]:** Pełna izolacja operacji DOM związanych z wgrywaniem plików w jednym komponencie, zachowując czysty kontrakt interfejsu.

---

## Krok 32 (src/presentation/components/SchemaEditorView.ts): Edytor schematu tabeli

* **Opis:** Implementacja interfejsu `ISchemaEditorView` generująca dynamiczny formularz tabelaryczny w DOM dla wykrytych kolumn CSV.
* **Kluczowe funkcjonalności:**
  * Wyświetlanie oryginalnej nazwy kolumny wraz z próbką pierwszej wartości z pliku CSV.
  * Generowanie pól tekstowych do edycji znormalizowanej nazwy SQL kolumny.
  * Tworzenie list rozwijanych (`<select>`) z dostępnymi typami SQL (`SqlDataType`) umożliwiających nadpisanie wykrytego typu.
  * Obsługa pól wyboru (`checkbox`) dla flagi `isNullable`.
  * Bezpieczne kodowanie HTML (`escapeHtml`) zapobiegające podatnościom XSS.
* **Weryfikacja [SOLID]:** Skupienie wyłącznie na renderowaniu widoku edycji schematu i mapowaniu zdarzeń DOM na callbacki kontrolera.

---

## Krok 33 (src/presentation/components/StatusNotificationView.ts): Podgląd SQL i powiadomienia

* **Opis:** Implementacja interfejsu `IStatusNotificationView` odpowiedzialna za prezentację wygenerowanego kodu SQL oraz zarządzanie panelem powiadomień użytkownika.
* **Kluczowe funkcjonalności:**
  * Renderowanie zawartości wygenerowanego skryptu SQL w dedykowanym bloku podglądu z automatycznym ukrywaniem sekcji, jeśli brak kodu.
  * Aktywacja i zmiana etykiety przycisku zapisu pliku (`Zapisz plik .sql` / `Zapisywanie...`).
  * Dynamiczne wstrzykiwanie powiadomień o sukcesie lub błędzie z funkcją automatycznego zamykania po 6 sekundach oraz unikaniem duplikatów.
* **Weryfikacja [SOLID]:** Czysta separacja odpowiedzialności za prezentację statusów i powiadomień systemowych.

---

## Krok 34 (src/presentation/controllers/AppController.ts): Główny kontroler aplikacji

* **Opis:** Koordynator (Orchestrator) łączący zdarzenia z komponentów widoku (`FileUploadView`, `SchemaEditorView`, `StatusNotificationView`) z logiką aplikacji (`ConversionUseCase`) oraz infrastruktury (`BrowserFileReader`).
* **Kluczowe funkcjonalności:**
  * Obsługa wczytywania pliku, parsowania zawartości oraz aktualizacji nazwy tabeli.
  * Przekazywanie modyfikacji schematu (zmiany nazw kolumn, nadpisywania typów, flag nullable) do use case'a.
  * Koordynacja zapisu pliku SQL i odświeżanie stanu wszystkich widoków (`updateViews`).
  * Centralna obsługa błędów z przekazywaniem komunikatów do widoków powiadomień.
* **Weryfikacja [SOLID]:** Kontroler nie zawiera logiki biznesowej ani manipulacji DOM, pełniąc rolę czystego spinacza architektonicznego (MVC / Clean Architecture).

---

## Podsumowanie Faza 8
Wszystkie kroki (30–34) zostały w pełni zaimplementowane w czystym TypeScript z zachowaniem rygorystycznego typowania, zasad SOLID oraz pełnej integracji z warstwą aplikacji i domeną. Warstwa prezentacji DOM zapewnia responsywny, czytelny interfejs użytkownika blisko współpracujący z modelem stanu.