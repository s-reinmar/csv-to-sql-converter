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
import { INameNormalizationService } from '../domain/contracts/INameNormalizationService';
import { NameNormalizationService } from '../domain/services/NameNormalizationService';

export class ConversionUseCase {
    private currentState: ConversionState;
    private readonly nameNormalizationService: INameNormalizationService;

    constructor(
        private readonly csvParser: ICsvParser,
        private readonly typeInferenceEngine: ITypeInferenceEngine,
        private readonly sqlGenerator: ISqlGenerator,
        private readonly sqlFileRepository: ISqlFileRepository,
        private readonly schemaOverrideService: SchemaOverrideService,
        private readonly separatorDetector: ISeparatorDetector,
        private readonly dataValidator: IDataValidator,
        nameNormalizationService?: INameNormalizationService // Opcjonalny parametr
    ) {
        this.currentState = new ConversionState();
        // Jeśli nie został przekazany z zewnątrz, tworzymy instancję domyślną
        this.nameNormalizationService = nameNormalizationService ?? new NameNormalizationService();
    }

    public getState(): Readonly<IConversionStateData> {
        return this.currentState.getState();
    }

    public async loadAndParseCsv(
        fileContent: string,
        fileName: string,
        delimiter?: string
    ): Promise<Readonly<IConversionStateData>> {
        this.currentState = this.currentState.cloneWith({
            isLoading: true,
            errorMessage: null,
            fileName,
            csvData: null,
            tableSchema: null,
            generatedSql: null,
            savedFilePath: null,
            validationWarnings: []
        });

        try {
            const resolvedDelimiter = (delimiter && delimiter.trim() !== '')
                ? delimiter
                : this.separatorDetector.detect(fileContent);

            const csvData = this.csvParser.parse(fileContent, resolvedDelimiter);
            const defaultTableName = this.extractTableNameFromFileName(fileName);
            const tableSchema = this.typeInferenceEngine.inferTableSchema(
                csvData.headers,
                csvData.rows,
                defaultTableName
            );

            const validationWarnings = this.dataValidator.validate(csvData, tableSchema);
            const generatedSql = this.sqlGenerator.generateSql(tableSchema, csvData.rows);

            this.currentState = this.currentState.cloneWith({
                csvData,
                tableSchema,
                generatedSql,
                validationWarnings,
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
                validationWarnings: []
            });

            throw error;
        }
    }

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

    public updateTableName(newTableName: string): Readonly<IConversionStateData> {
        const schema = this.currentState.getState().tableSchema;
        if (!schema) {
            throw new Error('Brak aktywnego schematu tabeli.');
        }

        const updatedSchema = this.schemaOverrideService.updateTableName(schema, newTableName);

        return this.refreshSchemaAndSqlWithValidation(updatedSchema);
    }

    public moveColumn(columnName: string, direction: 'up' | 'down'): Readonly<IConversionStateData> {
        const schema = this.currentState.getState().tableSchema;
        if (!schema) {
            throw new Error('Brak aktywnego schematu tabeli.');
        }

        const updatedSchema = this.schemaOverrideService.moveColumn(
            schema,
            columnName,
            direction
        );

        return this.refreshSchemaAndSqlWithValidation(updatedSchema);
    }

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
            errorMessage: null,
            savedFilePath: null
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

    private refreshSchemaAndSqlWithValidation(updatedSchema: ITableSchema): Readonly<IConversionStateData> {
        const csvData = this.currentState.getState().csvData;
        let generatedSql = this.currentState.getState().generatedSql;
        let validationWarnings = this.currentState.getState().validationWarnings;

        if (csvData) {
            generatedSql = this.sqlGenerator.generateSql(updatedSchema, csvData.rows);
            validationWarnings = this.dataValidator.validate(csvData, updatedSchema);
        }

        this.currentState = this.currentState.cloneWith({
            tableSchema: updatedSchema,
            generatedSql,
            validationWarnings
        });

        return this.currentState.getState();
    }

    private extractTableNameFromFileName(fileName: string): string {
        return this.nameNormalizationService.normalizeTableName(fileName);
    }
}