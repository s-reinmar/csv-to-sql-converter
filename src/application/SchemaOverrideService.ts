import {ITableSchema} from '../domain/models/TableSchema';
import {IColumnDefinition} from '../domain/models/ColumnDefinition';
import {SqlDataType} from '../domain/enums/SqlDataType';
import {INameNormalizationService} from '../domain/contracts/INameNormalizationService';

/**
 * Serwis aplikacyjny odpowiedzialny za obsługę modyfikacji schematu tabeli (Schema Overrides)
 * dokonywanych przez użytkownika (zmiana nazwy kolumny, nadpisanie typu danych oraz flaga NULL/NOT NULL).
 */
export class SchemaOverrideService {
    constructor(
        private readonly normalizationService: INameNormalizationService
    ) {
    }

    /**
     * Aktualizuje nazwę kolumny o wskazanym indeksie lub oryginalnej nazwie,
     * normalizując nową nazwę za pomocą serwisu normalizacyjnego.
     */
    public updateColumnName(
        schema: ITableSchema,
        targetOriginalName: string,
        newSqlName: string
    ): ITableSchema {
        if (!schema || !schema.columns) {
            throw new Error('Nie podano poprawnego schematu tabeli.');
        }

        const trimmedName = newSqlName ? newSqlName.trim() : '';
        if (trimmedName === '') {
            throw new Error('Nazwa kolumny nie może być pusta.');
        }

        const safeSqlName = this.normalizationService.normalizeColumnName(trimmedName);
        if (schema.columns.some(col => col.originalName !== targetOriginalName && col.sqlName === safeSqlName)) {
            throw new Error(`Nazwa SQL "${safeSqlName}" jest już używana przez inną kolumnę.`);
        }

        const updatedColumns: ReadonlyArray<IColumnDefinition> = schema.columns.map((col) => {
            if (col.originalName === targetOriginalName) {
                return {
                    ...col,
                    sqlName: safeSqlName
                };
            }
            return col;
        });

        return {
            ...schema,
            columns: updatedColumns
        };
    }

    /**
     * Nadpisuje typ danych kolumny (userOverrideType) wskazany przez użytkownika.
     */
    public overrideColumnType(
        schema: ITableSchema,
        targetOriginalName: string,
        newDataType: SqlDataType | undefined
    ): ITableSchema {
        if (!schema || !schema.columns) {
            throw new Error('Nie podano poprawnego schematu tabeli.');
        }

        const updatedColumns: ReadonlyArray<IColumnDefinition> = schema.columns.map((col) => {
            if (col.originalName === targetOriginalName) {
                return {
                    ...col,
                    userOverrideType: newDataType
                };
            }
            return col;
        });

        return {
            ...schema,
            columns: updatedColumns
        };
    }

    /**
     * Przełącza flagę dopuszczalności wartości NULL (isNullable) dla wskazanej kolumny.
     */
    public toggleColumnNullable(
        schema: ITableSchema,
        targetOriginalName: string,
        isNullable: boolean
    ): ITableSchema {
        if (!schema || !schema.columns) {
            throw new Error('Nie podano poprawnego schematu tabeli.');
        }

        const updatedColumns: ReadonlyArray<IColumnDefinition> = schema.columns.map((col) => {
            if (col.originalName === targetOriginalName) {
                return {
                    ...col,
                    isNullable
                };
            }
            return col;
        });

        return {
            ...schema,
            columns: updatedColumns
        };
    }

    /**
     * Aktualizuje nazwę całej tabeli docelowej, normalizując ją za pomocą serwisu normalizacyjnego.
     */
    public updateTableName(schema: ITableSchema, newTableName: string): ITableSchema {
        if (!schema) {
            throw new Error('Nie podano poprawnego schematu tabeli.');
        }

        const trimmed = newTableName ? newTableName.trim() : '';
        if (trimmed === '') {
            throw new Error('Nazwa tabeli nie może być pusta.');
        }

        const safeTableName = this.normalizationService.normalizeTableName(trimmed);

        return {
            ...schema,
            tableName: safeTableName
        };
    }
}