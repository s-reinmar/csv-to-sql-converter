# Krok 26 (src/application/ConversionUseCase.ts): Główny koordynator przepływu pracy (Orkiestrator) przyjmujący zależności przez konstruktor (Dependency Injection): wczytuje CSV, uruchamia detekcję typów, przyjmuje poprawki i zleca zapis gotowego pliku .sql. 

Główny koordynator przepływu pracy (Orkiestrator) `ConversionUseCase` przyjmuje zależności przez konstruktor (Dependency Injection) i zarządza całym procesem konwersji CSV do SQL. Odpowiada za wczytanie pliku CSV, uruchomienie detekcji typów danych, przyjęcie ewentualnych poprawek od użytkownika oraz zlecenie zapisu gotowego pliku .sql.

src/application/ConversionUseCase.ts
```typescript
import { ICsvParser } from '../domain/contracts/ICsvParser';
import { ITypeInferenceEngine } from '../domain/contracts/ITypeInferenceEngine';
import { ISqlGenerator } from '../domain/contracts/ISqlGenerator';
import { ISqlFileRepository } from '../domain/contracts/ISqlFileRepository';
import { ConversionState, IConversionStateData } from './ConversionState';
import { SchemaOverrideService } from './SchemaOverrideService';
import { SqlDataType } from '../domain/enums/SqlDataType';

/**
 * Główny orkiestrator przepływu pracy (Use Case) dla konwersji CSV do SQL.
 * Koordynuje wczytywanie pliku, wnioskowanie typów, modyfikacje schematu,
 * generowanie kodu SQL oraz jego trwały zapis, utrzymując niemutowalny stan aplikacji.
 */
export class ConversionUseCase {
    private currentState: ConversionState;

    constructor(
        private readonly csvParser: ICsvParser,
        private readonly typeInferenceEngine: ITypeInferenceEngine,
        private readonly sqlGenerator: ISqlGenerator,
        private readonly sqlFileRepository: ISqlFileRepository,
        private readonly schemaOverrideService: SchemaOverrideService
    ) {
        this.currentState = new ConversionState();
    }

    /**
     * Zwraca aktualny stan aplikacji.
     */
    public getState(): Readonly<IConversionStateData> {
        return this.currentState.getState();
    }

    /**
     * Wczytuje i sparsuje zawartość pliku CSV, uruchamia detekcję typów i inicjalizuje schemat tabeli.
     * 
     * @param fileContent Surowa treść pliku CSV.
     * @param fileName Nazwa pliku wejściowego.
     * @param delimiter Opcjonalny separator (domyślnie wykrywany automatycznie lub przecinek).
     */
    public async loadAndParseCsv(
        fileContent: string,
        fileName: string,
        delimiter?: string
    ): Promise<Readonly<IConversionStateData>> {
        this.currentState = this.currentState.cloneWith({
            isLoading: true,
            errorMessage: null,
            fileName
        });

        try {
            // 1. Parsowanie CSV
            const csvData = this.csvParser.parse(fileContent, delimiter);

            // 2. Automatyczne wnioskowanie schematu i typów
            const defaultTableName = this.extractTableNameFromFileName(fileName);
            const tableSchema = this.typeInferenceEngine.inferTableSchema(
                csvData.headers,
                csvData.rows,
                defaultTableName
            );

            // 3. Automatyczne wygenerowanie wstępnego SQL
            const generatedSql = this.sqlGenerator.generateSql(tableSchema, csvData.rows);

            this.currentState = this.currentState.cloneWith({
                csvData,
                tableSchema,
                generatedSql,
                isLoading: false
            });

            return this.currentState.getState();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Nieznany błąd podczas parsowania CSV.';
            this.currentState = this.currentState.cloneWith({
                isLoading: false,
                errorMessage: message
            });
            throw error;
        }
    }

    /**
     * Zmienia nazwę SQL wybranej kolumny i odświeża podgląd SQL.
     */
    public updateColumnName(targetOriginalName: string, newSqlName: string): Readonly<IConversionStateData> {
        const schema = this.currentState.getState().tableSchema;
        if (!schema) {
            throw new Error('Brak aktywnego schematu tabeli.');
        }

        const updatedSchema = this.schemaOverrideService.updateColumnName(
            schema,
            targetOriginalName,
            newSqlName
        );

        return this.refreshSchemaAndSql(updatedSchema);
    }

    /**
     * Nadpisuje typ danych kolumny i odświeża podgląd SQL.
     */
    public overrideColumnType(
        targetOriginalName: string,
        newDataType: SqlDataType | undefined
    ): Readonly<IConversionStateData> {
        const schema = this.currentState.getState().tableSchema;
        if (!schema) {
            throw new Error('Brak aktywnego schematu tabeli.');
        }

        const updatedSchema = this.schemaOverrideService.overrideColumnType(
            schema,
            targetOriginalName,
            newDataType
        );

        return this.refreshSchemaAndSql(updatedSchema);
    }

    /**
     * Przełącza flagę NULL / NOT NULL dla kolumny i odświeża podgląd SQL.
     */
    public toggleColumnNullable(
        targetOriginalName: string,
        isNullable: boolean
    ): Readonly<IConversionStateData> {
        const schema = this.currentState.getState().tableSchema;
        if (!schema) {
            throw new Error('Brak aktywnego schematu tabeli.');
        }

        const updatedSchema = this.schemaOverrideService.toggleColumnNullable(
            schema,
            targetOriginalName,
            isNullable
        );

        return this.refreshSchemaAndSql(updatedSchema);
    }

    /**
     * Zmienia główną nazwę tabeli docelowej i odświeża podgląd SQL.
     */
    public updateTableName(newTableName: string): Readonly<IConversionStateData> {
        const schema = this.currentState.getState().tableSchema;
        if (!schema) {
            throw new Error('Brak aktywnego schematu tabeli.');
        }

        const updatedSchema = this.schemaOverrideService.updateTableName(schema, newTableName);

        return this.refreshSchemaAndSql(updatedSchema);
    }

    /**
     * Zleca zapis wygenerowanego kodu SQL na dysk za pomocą repozytorium plików.
     */
    public async saveSqlFile(customFileName?: string): Promise<string> {
        const state = this.currentState.getState();
        if (!state.generatedSql || !state.tableSchema) {
            throw new Error('Brak wygenerowanego kodu SQL do zapisu.');
        }

        const fileNameToSave = customFileName && customFileName.trim() !== ''
            ? customFileName.trim()
            : `${state.tableSchema.tableName}.sql`;

        this.currentState = this.currentState.cloneWith({ isLoading: true, errorMessage: null });

        try {
            const savedPath = await this.sqlFileRepository.saveSqlFile(fileNameToSave, state.generatedSql);

            this.currentState = this.currentState.cloneWith({
                isLoading: false,
                savedFilePath: savedPath
            });

            return savedPath;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Błąd podczas zapisu pliku SQL.';
            this.currentState = this.currentState.cloneWith({
                isLoading: false,
                errorMessage: message
            });
            throw error;
        }
    }

    /**
     * Pomocnicza metoda aktualizująca schemat i generująca ponownie kod SQL.
     */
    private refreshSchemaAndSql(updatedSchema: import('../domain/models/TableSchema').ITableSchema): Readonly<IConversionStateData> {
        const csvData = this.currentState.getState().csvData;
        let generatedSql = this.currentState.getState().generatedSql;

        if (csvData) {
            generatedSql = this.sqlGenerator.generateSql(updatedSchema, csvData.rows);
        }

        this.currentState = this.currentState.cloneWith({
            tableSchema: updatedSchema,
            generatedSql
        });

        return this.currentState.getState();
    }

    /**
     * Pomocnicza metoda wyciągająca domyślną nazwę tabeli z nazwy pliku CSV.
     */
    private extractTableNameFromFileName(fileName: string): string {
        const cleanName = fileName.replace(/\.[^/.]+$/, ''); // usunięcie rozszerzenia
        return cleanName
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '_')
            .replace(/^_+|_+$/g, '') || 'imported_data';
    }
}
```

## Podsumowanie i weryfikacja (Faza 6, Krok 26)

### [SOLID CHECK]
- **S** - Single Responsibility: `ConversionUseCase` pełni rolę orkiestratora przepływu pracy, delegując konkretne zadania do odpowiednich serwisów i repozytoriów.
- **O** - Open/Closed: Klasa jest otwarta na rozszerzenia (można dodać nowe funkcje lub zmienić implementacje zależności), ale zamknięta na modyfikacje istniejącej logiki, co pozwala na łatwe wprowadzanie nowych funkcjonalności bez ryzyka naruszenia istniejącego kodu.
- **L** - Liskov Substitution: Klasa korzysta z interfejsów (`ICsvParser`, `ITypeInferenceEngine`, `ISqlGenerator`, `ISqlFileRepository`), co umożliwia podmianę implementacji bez wpływu na działanie orkiestratora.
- **I** - Interface Segregation: Klasa korzysta z wielu wyspecjalizowanych interfejsów, unikając nadmiernego obciążenia pojedynczych interfejsów.
- **D** - Dependency Inversion: Klasa zależy od abstrakcji (interfejsów) zamiast konkretnych implementacji, co ułatwia testowanie i utrzymanie kodu.

### [INTERFACE SUMMARY]
- `ICsvParser`: Interfejs odpowiedzialny za parsowanie plików CSV.
- `ITypeInferenceEngine`: Interfejs odpowiedzialny za wnioskowanie typów danych na podstawie zawartości CSV.
- `ISqlGenerator`: Interfejs odpowiedzialny za generowanie kodu SQL na podstawie schematu tabeli i danych.
- `ISqlFileRepository`: Interfejs odpowiedzialny za trwały zapis wygenerowanego kodu SQL do pliku.
- `SchemaOverrideService`: Serwis odpowiedzialny za modyfikację schematu tabeli, w tym zmianę nazw kolumn, nadpisywanie typów danych i przełączanie flagi NULL/NOT NULL.

### [REFACTORING ALERT]
- Klasa `ConversionUseCase` jest centralnym punktem orkiestracji przepływu pracy konwersji CSV do SQL, co ułatwia zarządzanie logiką biznesową i utrzymanie kodu. Wszelkie zmiany w logice konwersji są realizowane poprzez delegowanie zadań do odpowiednich serwisów i repozytoriów, co zapewnia spójność i bezpieczeństwo danych w całej aplikacji. Metody klasy są zaprojektowane w sposób, który minimalizuje ryzyko błędów i zapewnia czytelność kodu, a także umożliwia łatwe rozszerzanie funkcjonalności w przyszłości.