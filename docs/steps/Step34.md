# Krok 34 (src/presentation/controllers/AppController.ts): Kontroler spinający zdarzenia z komponentów widoku (FileUploadView, SchemaEditorView) z metodami ConversionUseCase oraz SchemaOverrideService.

Kontroller `AppController` pełni rolę pośrednika między komponentami widoku (FileUploadView, SchemaEditorView) a logiką biznesową (ConversionUseCase, SchemaOverrideService). Odpowiada za obsługę zdarzeń generowanych przez interfejs użytkownika, takich jak przesyłanie plików CSV, edycja schematu kolumn czy zapis wygenerowanego kodu SQL. Kontroler zapewnia spójne przepływy danych i koordynuje interakcje między warstwą prezentacji a warstwą domeny.

src/presentation/controllers/AppController.ts
```typescript
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

                // Jeśli użytkownik podał własną nazwę tabeli w formularzu, nadpisujemy ją
                if (tableName && tableName.trim() !== '') {
                    this.conversionUseCase.updateTableName(tableName.trim());
                }

                this.statusNotificationView.showSuccess(`Plik "${file.name}" został pomyślnie sparsowany.`);
                this.updateViews();
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Nieznany błąd podczas wczytywania pliku.';
                this.fileUploadView.showError(message);
                this.statusNotificationView.showError(message);
                this.updateViews();
            }
        });

        // 2. Obsługa zmiany nazwy tabeli docelowej w edytorze schematu
        this.schemaEditorView.onTableNameChanged((newTableName: string) => {
            try {
                this.conversionUseCase.updateTableName(newTableName);
                this.updateViews();
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Błąd zmiany nazwy tabeli.';
                this.statusNotificationView.showError(message);
            }
        });

        // 3. Obsługa zmiany nazwy kolumny SQL
        this.schemaEditorView.onColumnNameChanged((originalName: string, newName: string) => {
            try {
                this.conversionUseCase.updateColumnName(originalName, newName);
                this.updateViews();
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Błąd zmiany nazwy kolumny.';
                this.statusNotificationView.showError(message);
            }
        });

        // 4. Obsługa nadpisania typu danych kolumny
        this.schemaEditorView.onColumnTypeChanged((originalName: string, newType: SqlDataType | undefined) => {
            try {
                this.conversionUseCase.overrideColumnType(originalName, newType);
                this.updateViews();
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Błąd nadpisania typu kolumny.';
                this.statusNotificationView.showError(message);
            }
        });

        // 5. Obsługa zmiany flagi NULL / NOT NULL
        this.schemaEditorView.onColumnNullableChanged((originalName: string, isNullable: boolean) => {
            try {
                this.conversionUseCase.toggleColumnNullable(originalName, isNullable);
                this.updateViews();
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Błąd zmiany flagi NULL.';
                this.statusNotificationView.showError(message);
            }
        });

        // 6. Obsługa kliknięcia zapisu wygenerowanego pliku SQL
        this.statusNotificationView.onSaveFileClicked(async (customFileName?: string) => {
            try {
                const savedPath = await this.conversionUseCase.saveSqlFile(customFileName);
                this.statusNotificationView.showSuccess(`Plik SQL zapisany pomyślnie: ${savedPath}`);
                this.updateViews();
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Błąd podczas zapisu pliku SQL.';
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
}
```

## Podsumowanie i weryfikacja (Faza 8, Krok 34)

### [SOLID CHECK]:
Kontroler `AppController` w pełni realizuje zasadę pojedynczej odpowiedzialności (SRP), skupiając się wyłącznie na koordynacji zdarzeń między komponentami widoku a logiką biznesową. Nie zawiera logiki parsowania ani transformacji danych, delegując te zadania do `ConversionUseCase` i `SchemaOverrideService`. Dzięki temu kontroler pozostaje lekki i łatwy do testowania, a zmiany w logice biznesowej nie wpływają na jego implementację.

### [INTERFACE SUMMARY]:
- `AppController`: Klasa implementująca kontroler aplikacji, który łączy komponenty widoku (`IFileUploadView`, `ISchemaEditorView`, `IStatusNotificationView`) z logiką biznesową (`ConversionUseCase`). Metody obejmują obsługę zdarzeń takich jak wybór pliku, zmiana nazwy tabeli, zmiana nazwy kolumny, nadpisanie typu danych kolumny, zmiana flagi NULL oraz zapis wygenerowanego pliku SQL. Kontroler zapewnia spójny przepływ danych i aktualizację widoków na podstawie stanu aplikacji.

### [REFACTORING ALERT]:
- Kontroler `AppController` jest dobrze odizolowany od logiki biznesowej i infrastruktury, co ułatwia jego testowanie i utrzymanie. Wszelkie zmiany w sposobie przetwarzania danych lub logice biznesowej mogą być wprowadzane w `ConversionUseCase` i `SchemaOverrideService` bez konieczności modyfikacji kontrolera. Dodatkowo, kontroler obsługuje błędy w sposób spójny, przekazując komunikaty do widoków powiadomień, co poprawia doświadczenie użytkownika i ułatwia debugowanie.1