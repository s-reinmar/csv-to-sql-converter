# Krok 30 (src/presentation/contracts/IViewComponents.ts): Kontrakty definiujące metody komunikacji pomiędzy kontrolerem a poszczególnymi sekcjami widoku HTML.

Kontrakty `IViewComponents` definiują metody komunikacji pomiędzy kontrolerem a poszczególnymi sekcjami widoku HTML. Umożliwiają one kontrolerowi wywoływanie funkcji aktualizacji interfejsu użytkownika, takich jak renderowanie tabel, aktualizacja podglądu SQL czy obsługa zdarzeń formularza.

src/presentation/contracts/IViewComponents.ts
```typescript
import { IConversionStateData } from '../../application/ConversionState';
import { SqlDataType } from '../../domain/enums/SqlDataType';

/**
 * Kontrakt dla komponentu obsługującego wgranie pliku CSV oraz parametry początkowe.
 */
export interface IFileUploadView {
    /**
     * Rejestruje nasłuchiwacz zdarzenia wyboru pliku.
     */
    onFileSelected(callback: (file: File, delimiter?: string, tableName?: string) => void): void;

    /**
     * Renderuje lub aktualizuje stan widoku wgrania pliku.
     */
    render(state: Readonly<IConversionStateData>): void;

    /**
     * Wyświetla błąd powiązany z formularzem wgrania pliku.
     */
    showError(message: string): void;

    /**
     * Czyści formularz wgrania pliku.
     */
    clear(): void;
}

/**
 * Kontrakt dla komponentu edycji schematu tabeli i typów kolumn.
 */
export interface ISchemaEditorView {
    /**
     * Rejestruje nasłuchiwacz zmiany nazwy kolumny SQL.
     */
    onColumnNameChanged(callback: (originalName: string, newName: string) => void): void;

    /**
     * Rejestruje nasłuchiwacz nadpisania typu danych kolumny.
     */
    onColumnTypeChanged(callback: (originalName: string, newType: SqlDataType | undefined) => void): void;

    /**
     * Rejestruje nasłuchiwacz zmiany flagi NULL / NOT NULL.
     */
    onColumnNullableChanged(callback: (originalName: string, isNullable: boolean) => void): void;

    /**
     * Rejestruje nasłuchiwacz zmiany nazwy tabeli docelowej.
     */
    onTableNameChanged(callback: (newTableName: string) => void): void;

    /**
     * Renderuje tabelę edycji schematu na podstawie aktualnego stanu aplikacji.
     */
    render(state: Readonly<IConversionStateData>): void;
}

/**
 * Kontrakt dla komponentu podglądu kodu SQL oraz panelu powiadomień.
 */
export interface IStatusNotificationView {
    /**
     * Rejestruje nasłuchiwacz kliknięcia przycisku zapisu pliku .sql.
     */
    onSaveFileClicked(callback: (customFileName?: string) => void): void;

    /**
     * Renderuje podgląd kodu SQL oraz statusy ładowania/zapisu.
     */
    render(state: Readonly<IConversionStateData>): void;

    /**
     * Wyświetla powiadomienie o sukcesie operacji.
     */
    showSuccess(message: string): void;

    /**
     * Wyświetla powiadomienie o błędzie.
     */
    showError(message: string): void;
}
```

## Podsumowanie i weryfikacja (Faza 8, Krok 30):

### [SOLID CHECK]:
- Zdefiniowane kontrakty `IViewComponents` są zgodne z zasadą pojedynczej odpowiedzialności (SRP), ponieważ każdy interfejs koncentruje się wyłącznie na komunikacji pomiędzy kontrolerem a konkretnym komponentem widoku, bez ingerencji w logikę biznesową czy strukturę danych. Każdy interfejs odpowiada za określony aspekt interakcji użytkownika, co ułatwia utrzymanie i modyfikację kodu w przyszłości.

### [INTERFACE SUMMARY]:
- Interfejsy `IFileUploadView`, `ISchemaEditorView` oraz ` IStatusNotificationView` definiują spójny zestaw metod umożliwiających kontrolerowi interakcję z różnymi sekcjami widoku HTML. Dzięki temu możliwe jest łatwe dostosowanie logiki prezentacji poprzez implementację tych interfejsów w konkretnych komponentach widoku, co zwiększa elastyczność i spójność architektury aplikacji.

### [ACCESSIBILITY CHECK]:
- Zdefiniowane kontrakty umożliwiają implementację komponentów widoku z uwzględnieniem zasad dostępności (WCAG), takich jak obsługa zdarzeń klawiatury, czytelne komunikaty błędów i powiadomień oraz odpowiednie oznaczenie elementów interfejsu dla technologii wspomagających. Dzięki temu aplikacja może być bardziej dostępna dla użytkowników z różnymi potrzebami, co jest zgodne z zasadami projektowania dostępnego interfejsu użytkownika.