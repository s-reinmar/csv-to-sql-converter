# Raport z realizacji: Faza 7: Warstwa Prezentacji – Szata Graficzna (Czarno-Niebieski / Jasny Niebieski)

Poniżej znajduje się szczegółowy raport podsumowujący kroki od 27 do 29, które realizują warstwę prezentacji aplikacji **CSV to SQL Converter**, wprowadzając semantyczny szkielet HTML5 oraz spójny arkusz stylów oparty na czarno-granatowych tłach i jasnoniebieskich akcentach.

---

## Krok 27 (index.html): Semantyczny szkielet dokumentu HTML5

* **Opis:** Utworzenie głównego pliku strukturalnego aplikacji (`index.html`) z uwzględnieniem semantycznych tagów HTML5 oraz kontenerów na poszczególne etapy konwersji danych.
* **Kluczowe komponenty strukturalne:**
    * `<header>`: Nagłówek aplikacji z tytułem oraz podtytułem objaśniającym cel narzędzia.
    * `<main>`: Główny kontener roboczy dzielący się na sekcje:
        * `#file-upload-section`: Formularz wgrania pliku CSV ze strefą Drag & Drop oraz opcjami wyboru separatora i nazwy tabeli SQL.
        * `#schema-editor-section`: Tabela edycji typów kolumn (widoczna dynamicznie po wgraniu pliku) pozwalająca na zarządzanie schematem.
        * `#sql-preview-section`: Podgląd wygenerowanego skryptu SQL wraz z przyciskiem eksportu/zapisu pliku `.sql`.
    * `<aside>`: Panel powiadomień (`#status-notification-region`) dla komunikatów błędów, statusów ładowania i sukcesu operacji.
    * `<footer>`: Stopka informacyjna z oznaczeniem roku oraz standardów Clean Architecture i SOLID.
* **Weryfikacja [Accessibility & SOLID]:** Wykorzystanie atrybutów ARIA (`aria-labelledby`, `aria-live`) oraz podział na niezależne sekcje gwarantuje zachowanie czystości kodu i wysokiej dostępności (WCAG).

---

## Krok 28 (src/presentation/styles/theme-variables.css): Definicja zmiennych CSS (Custom Properties)

* **Opis:** Utworzenie globalnego pliku stylów definiującego paletę barw w postaci zmiennych CSS dla zachowania spójności wizualnej w całej aplikacji.
* **Kluczowe właściwości i kolory:**
    * **Głębokie czarno-granatowe tła:** `--bg-primary: #0a0e17`, `--bg-secondary: #111827`, `--bg-input: #0f172a`.
    * **Ciemnoniebieskie panele:** `--bg-panel: #1e293b`, `--bg-panel-hover: #334155`.
    * **Jasnoniebieskie akcenty i kontrolki:** `--accent-primary: #38bdf8`, `--accent-hover: #0ea5e9`, `--accent-light`, `--accent-glow`.
    * **Obramowania i kolory tekstów:** Rygorystycznie zdefiniowane zmienne `--border-color`, `--text-primary` i `--text-secondary` zapewniające wysoki kontrast.
* **Weryfikacja [SOLID]:** Centralizacja palety barw w bloku `:root` spełnia zasadę pojedynczej odpowiedzialności (SRP), umożliwiając łatwą modyfikację motywu bez naruszania struktury komponentów.

---

## Krok 29 (src/presentation/styles/components.css): Stylizacja komponentów interfejsu

* **Opis:** Implementacja kompleksowych reguł CSS dla wszystkich elementów interfejsu użytkownika, w tym formularzy, tabel schematów, pól wyboru (`<select>`), przycisków oraz paneli podglądu kodu.
* **Kluczowe elementy stylowe:**
    * **Reset i Układ:** Globalny box-sizing oraz elastyczny układ kolumnowy oparty na kontenerze aplikacji z zachowaniem responsywności (Media Queries dla szerokości mniejszych niż 768px).
    * **Strefa Uploadu:** Interaktywna strefa drag-and-drop (`.drop-zone`) z efektami wizualnymi podświetlenia przy najechaniu myszą lub przeciąganiu pliku.
    * **Tabela Schematu:** Stylowana tabela `.schema-table` z responsywnym kontenerem (`.table-responsive`) i płynnym efektem podświetlania wierszy (`hover`).
    * **Podgląd kodu SQL:** Monospace'owy kontener `.code-preview-wrapper` z czytelnym formatowaniem dla bloków kodu źródłowego.
* **Weryfikacja [Responsive Design & SOLID]:** Stylizacja została w pełni odseparowana od logiki domenowej i aplikacyjnej, ściśle współgrając ze zmiennymi zdefiniowanymi w kroku 28.

---

## Podsumowanie Fazy 7
Faza 7 dostarcza kompletny, nowoczesny i czytelny interfejs graficzny w ciemnej tonacji czarno-niebieskiej (Dark Theme), charakteryzujący się wysoką czytelnością, pełną responsywnością (RWD) oraz ścisłym przestrzeganiem dobrych praktyk semantycznych HTML5 i CSS.