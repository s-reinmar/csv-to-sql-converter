# CSV to SQL Converter - Lista TODO (Rozwój Projektu)

Aplikacja webowa w języku **TypeScript** służąca do konwersji plików wsadowych **CSV** do formatu SQL (CREATE TABLE + INSERT INTO), realizowana zgodnie z Clean Architecture, DDD oraz zasadami SOLID.

---

## 🚀 Nowe / Priorytetowe Funkcje (Wymaganie Użytkownika)

- [ ] **Inteligentne przetwarzanie w tle i auto-detekcja:**
    - Automatyczne rozpoznawanie separatora pliku CSV bez konieczności ręcznego wyboru.
    - Automatyczne generowanie i czyszczenie nazw tabel oraz kolumn (usuwanie polskich znaków, zamiana spacji na podkreślenia, konwersja na małe litery, np. `IMIĘ` $\rightarrow$ `imie`).
    - Przetwarzanie plików w tle (asynchronicznie) z informowaniem użytkownika o postępie.

---

## 📁 Przetwarzanie i Obsługa Plików

- [ ] **Obsługa wielu plików CSV:** Dodanie możliwości wgrywania i przetwarzania wielu plików CSV jednocześnie.
- [ ] **Obsługa większych plików CSV:** Wprowadzenie mechanizmów stronicowania lub przetwarzania strumieniowego dla dużych plików.
- [ ] **Obsługa różnych separatorów CSV:** Dodanie możliwości wyboru separatora (np. przecinek, średnik, tabulator) w interfejsie użytkownika (jako fallback dla auto-detekcji).

---

## 🔍 Walidacja i Typy Danych

- [ ] **Walidacja danych wejściowych:** Dodanie walidacji poprawności danych w pliku CSV (np. brakujące wartości, niepoprawne formaty dat).
- [ ] **Rozszerzenie typów danych SQL:** Dodanie obsługi dodatkowych typów danych (np. JSON, UUID).

---

## 🗄️ Eksport i Integracje

- [ ] **Eksport do innych formatów:** Możliwość eksportu danych do innych formatów bazodanowych (np. PostgreSQL, MySQL).

---

## 🛠️ Jakość Kodu i Optymalizacja

- [ ] **Testy jednostkowe i integracyjne:** Rozbudowa zestawu testów w celu zapewnienia wysokiej jakości kodu.
- [ ] **Optymalizacja wydajności:** Wprowadzenie optymalizacji algorytmów przetwarzania CSV i generowania SQL.

---

## 🎨 Interfejs Użytkownika (UI/UX)

- [ ] **Ulepszenie interfejsu użytkownika:** Dodanie funkcji podglądu danych, podświetlania błędów i sugestii typów danych w czasie rzeczywistym.