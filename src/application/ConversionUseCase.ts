import { ICsvParser } from '../domain/contracts/ICsvParser';
import { ITypeInferenceEngine } from '../domain/contracts/ITypeInferenceEngine';
import { ISqlGenerator } from '../domain/contracts/ISqlGenerator';
import { ISqlFileRepository } from '../domain/contracts/ISqlFileRepository';
import { ConversionState, IConversionStateData } from './ConversionState';
import { SchemaOverrideService } from './SchemaOverrideService';
import { SqlDataType } from '../domain/enums/SqlDataType';
import { ISeparatorDetector } from '../domain/contracts/ISeparatorDetector';

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
        private readonly schemaOverrideService: SchemaOverrideService,
        private readonly separatorDetector: ISeparatorDetector
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
     * @param delimiter Opcjonalny separator (domyślnie wykrywany automatycznie przez detektor).
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
            // 1. Automatyczna detekcja separatora, jeśli nie został wymuszony z zewnątrz
            const resolvedDelimiter = (delimiter && delimiter.trim() !== '')
                ? delimiter
                : this.separatorDetector.detect(fileContent);

            // 2. Parsowanie CSV z wyznaczonym separatorem
            const csvData = this.csvParser.parse(fileContent, resolvedDelimiter);

            // 3. Automatyczne wnioskowanie schematu i typów
            const defaultTableName = this.extractTableNameFromFileName(fileName);
            const tableSchema = this.typeInferenceEngine.inferTableSchema(
                csvData.headers,
                csvData.rows,
                defaultTableName
            );

            // 4. Automatyczne wygenerowanie wstępnego SQL
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
        const cleanName = fileName.replace(/\.[^/.]+$/, '');
        return cleanName
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '_')
            .replace(/^_+|_+$/g, '') || 'imported_data';
    }
}