/**
 * @file ConversionUseCase.ts
 * @description Główny orkiestrator przepływu pracy dla konwersji CSV do SQL,
 * z pełną integracją walidacji danych i zbieraniem ostrzeżeń.
 */

import { ICsvParser } from '../domain/contracts/ICsvParser';
import { ITypeInferenceEngine } from '../domain/contracts/ITypeInferenceEngine';
import { ISqlGenerator } from '../domain/contracts/ISqlGenerator';
import { ISqlFileRepository } from '../domain/contracts/ISqlFileRepository';
import { ConversionState, IConversionStateData } from './ConversionState';
import { SchemaOverrideService } from './SchemaOverrideService';
import { SqlDataType } from '../domain/enums/SqlDataType';
import { ISeparatorDetector } from '../domain/contracts/ISeparatorDetector';
import { IDataValidator } from '../domain/contracts/IDataValidator';
import { ITableSchema } from '../domain/models/TableSchema';

/**
 * Główny orkiestrator przepływu pracy (Use Case) dla konwersji CSV do SQL.
 * Koordynuje wczytywanie pliku, wnioskowanie typów, modyfikacje schematu, walidację danych,
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
        private readonly separatorDetector: ISeparatorDetector,
        private readonly dataValidator: IDataValidator
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
     * Wczytuje i sparsuje zawartość pliku CSV, uruchamia detekcję typów, wykonuje walidację danych,
     * generuje kod SQL i zbiera ostrzeżenia walidacyjne w trakcie procesu.
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
            fileName,
            validationWarnings: []  // ← Reset ostrzeżeń z nowego wgrania
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

            // 4. Walidacja danych i zbieranie ostrzeżeń
            const validationWarnings = this.dataValidator.validate(csvData, tableSchema);

            // 5. Automatyczne wygenerowanie wstępnego SQL
            const generatedSql = this.sqlGenerator.generateSql(tableSchema, csvData.rows);

            // 6. Aktualizacja stanu z pełnym wynikiem (dane, schemat, SQL, ostrzeżenia)
            this.currentState = this.currentState.cloneWith({
                csvData,
                tableSchema,
                generatedSql,
                validationWarnings,  // ← Przechowywanie ostrzeżeń w stanie
                isLoading: false
            });

            return this.currentState.getState();
        } catch (error: unknown) {
            const message = error instanceof Error
                ? error.message
                : 'Nieznany błąd podczas parsowania CSV.';

            this.currentState = this.currentState.cloneWith({
                isLoading: false,
                errorMessage: message,
                validationWarnings: []  // ← Czyszczenie ostrzeżeń przy błędzie
            });

            throw error;
        }
    }

    /**
     * Zmienia nazwę SQL wybranej kolumny i odświeża podgląd SQL.
     * Powtarza walidację po modyfikacji schematu.
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

        return this.refreshSchemaAndSqlWithValidation(updatedSchema);
    }

    /**
     * Nadpisuje typ danych kolumny i odświeża podgląd SQL.
     * Powtarza walidację po modyfikacji schematu.
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

        return this.refreshSchemaAndSqlWithValidation(updatedSchema);
    }

    /**
     * Przełącza flagę NULL / NOT NULL dla kolumny i odświeża podgląd SQL.
     * Powtarza walidację po modyfikacji schematu.
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

        return this.refreshSchemaAndSqlWithValidation(updatedSchema);
    }

    /**
     * Zmienia główną nazwę tabeli docelowej i odświeża podgląd SQL.
     * Powtarza walidację po modyfikacji schematu.
     */
    public updateTableName(newTableName: string): Readonly<IConversionStateData> {
        const schema = this.currentState.getState().tableSchema;
        if (!schema) {
            throw new Error('Brak aktywnego schematu tabeli.');
        }

        const updatedSchema = this.schemaOverrideService.updateTableName(schema, newTableName);

        return this.refreshSchemaAndSqlWithValidation(updatedSchema);
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

        this.currentState = this.currentState.cloneWith({
            isLoading: true,
            errorMessage: null
        });

        try {
            const savedPath = await this.sqlFileRepository.saveSqlFile(
                fileNameToSave,
                state.generatedSql
            );

            this.currentState = this.currentState.cloneWith({
                isLoading: false,
                savedFilePath: savedPath
            });

            return savedPath;
        } catch (error: unknown) {
            const message = error instanceof Error
                ? error.message
                : 'Błąd podczas zapisu pliku SQL.';

            this.currentState = this.currentState.cloneWith({
                isLoading: false,
                errorMessage: message
            });

            throw error;
        }
    }

    /**
     * Pomocnicza metoda aktualizująca schemat, regenerująca SQL oraz przeprowadzająca
     * ponowną walidację danych względem zmienionego schematu.
     */
    private refreshSchemaAndSqlWithValidation(updatedSchema: ITableSchema): Readonly<IConversionStateData> {
        const csvData = this.currentState.getState().csvData;
        let generatedSql = this.currentState.getState().generatedSql;
        let validationWarnings = this.currentState.getState().validationWarnings;

        if (csvData) {
            // Regeneracja SQL na podstawie zaktualizowanego schematu
            generatedSql = this.sqlGenerator.generateSql(updatedSchema, csvData.rows);

            // Ponowna walidacja danych względem zmienionego schematu
            validationWarnings = this.dataValidator.validate(csvData, updatedSchema);
        }

        this.currentState = this.currentState.cloneWith({
            tableSchema: updatedSchema,
            generatedSql,
            validationWarnings  // ← Aktualizacja ostrzeżeń po zmianie schematu
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