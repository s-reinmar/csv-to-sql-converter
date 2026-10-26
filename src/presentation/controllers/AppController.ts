/**
 * @file AppController.ts
 * @description Główny kontroler aplikacji łączący warstwę prezentacji (widoki DOM)
 * z warstwą aplikacji (ConversionUseCase), orkiestrujący przepływ zdarzeń
 * i automatycznie wyświetlający ostrzeżenia walidacyjne.
 */

import { ConversionUseCase } from '../../application/ConversionUseCase';
import { IFileUploadView, ISchemaEditorView, IStatusNotificationView } from '../contracts/IViewComponents';
import { BrowserFileReader } from '../../infrastructure/BrowserFileReader';
import { SqlDataType } from '../../domain/enums/SqlDataType';

/**
 * Główny kontroler aplikacji (AppController) łączący warstwę prezentacji (widoki DOM)
 * z warstwą aplikacji (ConversionUseCase) i infrastruktury (BrowserFileReader).
 */
export class AppController {
    private fileReader: BrowserFileReader;

    constructor(
        private readonly conversionUseCase: ConversionUseCase,
        private readonly fileUploadView: IFileUploadView,
        private readonly schemaEditorView: ISchemaEditorView,
        private readonly statusNotificationView: IStatusNotificationView
    ) {
        this.fileReader = new BrowserFileReader();
        this.bindEvents();
        this.updateViews();
    }

    /**
     * Wiąże zdarzenia z komponentów widoku do metod kontrolera.
     */
    private bindEvents(): void {
        // 1. Obsługa wyboru pliku CSV w formularzu wgrania
        this.fileUploadView.onFileSelected(async (file: File, delimiter?: string, tableName?: string) => {
            try {
                const fileContent = await this.fileReader.readFileAsText(file);
                await this.conversionUseCase.loadAndParseCsv(fileContent, file.name, delimiter);

                if (tableName && tableName.trim() !== '') {
                    this.conversionUseCase.updateTableName(tableName.trim());
                }

                const currentState = this.conversionUseCase.getState();
                if (currentState.validationWarnings.length > 0) {
                    this.statusNotificationView.showWarnings(currentState.validationWarnings);
                }

                this.statusNotificationView.showSuccess(`Plik "${file.name}" został pomyślnie sparsowany.`);
                this.updateViews();
            } catch (error: unknown) {
                const message = error instanceof Error
                    ? error.message
                    : 'Nieznany błąd podczas wczytywania pliku.';
                this.fileUploadView.showError(message);
                this.statusNotificationView.showError(message);
                this.updateViews();
            }
        });

        // 2. Obsługa zmiany nazwy tabeli docelowej w edytorze schematu
        this.schemaEditorView.onTableNameChanged((newTableName: string) => {
            try {
                this.conversionUseCase.updateTableName(newTableName);
                this.displayValidationWarningsIfAny();
                this.updateViews();
            } catch (error: unknown) {
                const message = error instanceof Error
                    ? error.message
                    : 'Błąd zmiany nazwy tabeli.';
                this.statusNotificationView.showError(message);
            }
        });

        // 3. Obsługa zmiany nazwy kolumny SQL
        this.schemaEditorView.onColumnNameChanged((originalName: string, newName: string) => {
            try {
                this.conversionUseCase.updateColumnName(originalName, newName);
                this.displayValidationWarningsIfAny();
                this.updateViews();
            } catch (error: unknown) {
                const message = error instanceof Error
                    ? error.message
                    : 'Błąd zmiany nazwy kolumny.';
                this.statusNotificationView.showError(message);
            }
        });

        // 4. Obsługa nadpisania typu danych kolumny
        this.schemaEditorView.onColumnTypeChanged((originalName: string, newType: SqlDataType | undefined) => {
            try {
                this.conversionUseCase.overrideColumnType(originalName, newType);
                this.displayValidationWarningsIfAny();
                this.updateViews();
            } catch (error: unknown) {
                const message = error instanceof Error
                    ? error.message
                    : 'Błąd nadpisania typu kolumny.';
                this.statusNotificationView.showError(message);
            }
        });

        // 5. Obsługa zmiany flagi NULL / NOT NULL
        this.schemaEditorView.onColumnNullableChanged((originalName: string, isNullable: boolean) => {
            try {
                this.conversionUseCase.toggleColumnNullable(originalName, isNullable);
                this.displayValidationWarningsIfAny();
                this.updateViews();
            } catch (error: unknown) {
                const message = error instanceof Error
                    ? error.message
                    : 'Błąd zmiany flagi NULL.';
                this.statusNotificationView.showError(message);
            }
        });

        // 6. Obsługa zmiany kolejności kolumn (Przesunięcie w górę / w dół)
        this.schemaEditorView.onColumnMoved((columnName: string, direction: 'up' | 'down') => {
            try {
                this.conversionUseCase.moveColumn(columnName, direction);
                this.displayValidationWarningsIfAny();
                this.updateViews();
            } catch (error: unknown) {
                const message = error instanceof Error
                    ? error.message
                    : 'Błąd podczas zmiany kolejności kolumny.';
                this.statusNotificationView.showError(message);
            }
        });

        // 7. Obsługa kliknięcia zapisu wygenerowanego pliku SQL
        this.statusNotificationView.onSaveFileClicked(async (customFileName?: string) => {
            try {
                const savedPath = await this.conversionUseCase.saveSqlFile(customFileName);
                this.statusNotificationView.showSuccess(`Plik SQL zapisany pomyślnie: ${savedPath}`);
                this.updateViews();
            } catch (error: unknown) {
                const message = error instanceof Error
                    ? error.message
                    : 'Błąd podczas zapisu pliku SQL.';
                this.statusNotificationView.showError(message);
                this.updateViews();
            }
        });
    }

    /**
     * Odświeża stan wszystkich widoków na podstawie aktualnego stanu z ConversionUseCase.
     */
    private updateViews(): void {
        const currentState = this.conversionUseCase.getState();
        this.fileUploadView.render(currentState);
        this.schemaEditorView.render(currentState);
        this.statusNotificationView.render(currentState);
    }

    /**
     * Pomocnicza metoda sprawdzająca, czy istnieją ostrzeżenia walidacyjne,
     * i jeśli tak, wyświetlająca je w panelu powiadomień.
     */
    private displayValidationWarningsIfAny(): void {
        const currentState = this.conversionUseCase.getState();
        if (currentState.validationWarnings && currentState.validationWarnings.length > 0) {
            this.statusNotificationView.showWarnings(currentState.validationWarnings);
        }
    }
}