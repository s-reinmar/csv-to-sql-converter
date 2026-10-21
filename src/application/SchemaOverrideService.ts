import { ITableSchema } from '../domain/models/TableSchema';
import { IColumnDefinition } from '../domain/models/ColumnDefinition';
import { SqlDataType } from '../domain/enums/SqlDataType';

/**
 * Serwis aplikacyjny odpowiedzialny za obsługę modyfikacji schematu tabeli (Schema Overrides)
 * dokonywanych przez użytkownika (zmiana nazwy kolumny, nadpisanie typu danych oraz flaga NULL/NOT NULL).
 */
export class SchemaOverrideService {

    /**
     * Aktualizuje nazwę kolumny o wskazanym indeksie lub oryginalnej nazwie.
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

        const updatedColumns: ReadonlyArray<IColumnDefinition> = schema.columns.map((col) => {
            if (col.originalName === targetOriginalName) {
                return {
                    ...col,
                    sqlName: trimmedName
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
     * Aktualizuje nazwę całej tabeli docelowej.
     */
    public updateTableName(schema: ITableSchema, newTableName: string): ITableSchema {
        if (!schema) {
            throw new Error('Nie podano poprawnego schematu tabeli.');
        }

        const trimmed = newTableName ? newTableName.trim() : '';
        if (trimmed === '') {
            throw new Error('Nazwa tabeli nie może być pusta.');
        }

        return {
            ...schema,
            tableName: trimmed
        };
    }
}