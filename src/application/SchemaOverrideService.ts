import { ITableSchema } from '../domain/models/TableSchema';
import { IColumnDefinition } from '../domain/models/ColumnDefinition';
import { SqlDataType } from '../domain/enums/SqlDataType';
import { INameNormalizationService } from '../domain/contracts/INameNormalizationService';

/**
 * Serwis aplikacyjny odpowiedzialny za obsługę modyfikacji schematu tabeli (Schema Overrides)
 * dokonywanych przez użytkownika (zmiana nazwy kolumny, nadpisanie typu danych, flaga NULL oraz kolejność).
 */
export class SchemaOverrideService {
    constructor(
        private readonly normalizationService: INameNormalizationService
    ) {}

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

    /**
     * Przesuwa kolumnę w górę lub w dół w schemacie tabeli.
     * @param schema Aktualny schemat tabeli (ITableSchema)
     * @param columnName Nazwa kolumny do przesunięcia
     * @param direction Kierunek ('up' lub 'down')
     * @returns Nowy, zmodyfikowany ITableSchema z zachowaniem niemutowalności
     */
    public moveColumn(
        schema: ITableSchema,
        columnName: string,
        direction: 'up' | 'down'
    ): ITableSchema {
        if (!schema || !schema.columns) {
            throw new Error('Nie podano poprawnego schematu tabeli.');
        }

        const columns = [...schema.columns];
        const index = columns.findIndex(col => col.originalName === columnName);

        if (index === -1) {
            return schema;
        }

        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        // Sprawdzenie granic tabeli
        if (targetIndex < 0 || targetIndex >= columns.length) {
            return schema;
        }

        // Zamiana miejscami (swap)
        const temp = columns[index];
        columns[index] = columns[targetIndex];
        columns[targetIndex] = temp;

        // Zwracamy nowy obiekt schematu z zachowaniem immutability (zgodnie z resztą serwisów)
        return {
            ...schema,
            columns
        };
    }
}