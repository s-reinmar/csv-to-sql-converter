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