import { ITableSchema } from '../models/TableSchema';
import { IColumnDefinition } from '../models/ColumnDefinition';
import { SqlDataType } from '../enums/SqlDataType';

/**
 * Serwis odpowiedzialny za budowanie instrukcji DDL (CREATE TABLE oraz opcjonalnie DROP TABLE)
 * na podstawie zatwierdzonego przez użytkownika schematu tabeli (ITableSchema).
 */
export class SqlDdlBuilder {
    /**
     * Generuje instrukcję DDL SQL dla podanego schematu tabeli.
     *
     * @param schema Zatwierdzony schemat tabeli
     */
    public generateDdl(schema: ITableSchema): string {
        const lines: string[] = [];
        const quote = schema.dialectOptions.identifierQuote || '';
        const escapedTableName = `${quote}${schema.tableName}${quote}`;

        if (schema.dialectOptions.includeDropTable) {
            lines.push(`DROP TABLE IF EXISTS ${escapedTableName};`);
        }

        lines.push(`CREATE TABLE ${escapedTableName} (`);

        const columnDefinitions = schema.columns.map(col => this.buildColumnDefinition(col, quote));
        lines.push(columnDefinitions.map(def => `    ${def}`).join(',\n'));

        lines.push(');');

        return lines.join('\n');
    }

    /**
     * Buduje definicję pojedynczej kolumny w instrukcji CREATE TABLE.
     */
    private buildColumnDefinition(column: IColumnDefinition, quote: string): string {
        const columnName = `${quote}${column.sqlName}${quote}`;
        const dataType = column.userOverrideType ?? column.detectedType;
        const sqlTypeMapping = this.mapDataTypeToSql(dataType);
        const nullability = column.isNullable ? '' : ' NOT NULL';

        return `${columnName} ${sqlTypeMapping}${nullability}`;
    }

    /**
     * Mapuje typ domenowy SqlDataType na konkretny typ SQL.
     */
    private mapDataTypeToSql(dataType: SqlDataType): string {
        switch (dataType) {
            case SqlDataType.INTEGER:
                return 'INT';
            case SqlDataType.DECIMAL:
                return 'DECIMAL(18, 4)';
            case SqlDataType.BOOLEAN:
                return 'BOOLEAN';
            case SqlDataType.DATE:
                return 'DATE';
            case SqlDataType.DATETIME:
                return 'DATETIME';
            case SqlDataType.VARCHAR:
                return 'VARCHAR(255)';
            case SqlDataType.TEXT:
            default:
                return 'TEXT';
        }
    }
}