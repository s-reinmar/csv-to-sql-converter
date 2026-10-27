import { ITableSchema } from '../models/TableSchema';
import { ICsvRow } from '../models/CsvRow';
import { SqlValueEscaper } from './SqlValueEscaper';

/**
 * Serwis odpowiedzialny za budowanie instrukcji DML (INSERT INTO) na podstawie
 * zatwierdzonego schematu tabeli oraz wierszy CSV, przy użyciu SqlValueEscaper.
 */
export class SqlDmlBuilder {
    private readonly valueEscaper: SqlValueEscaper;

    constructor(valueEscaper: SqlValueEscaper = new SqlValueEscaper()) {
        this.valueEscaper = valueEscaper;
    }

    /**
     * Generuje instrukcje INSERT INTO dla podanych wierszy CSV i schematu tabeli.
     * Grupuje wiersze w paczki (batch size = 500) w celu optymalizacji kodu SQL.
     *
     * @param schema Zatwierdzony schemat tabeli
     * @param rows Wiersze sparsowane z pliku CSV
     */
    public generateDml(schema: ITableSchema, rows: ReadonlyArray<ICsvRow>): string {
        if (rows.length === 0) {
            return '';
        }

        const quote = schema.dialectOptions.identifierQuote || '';
        const escapedTableName = `${quote}${schema.tableName}${quote}`;

        const columnNames = schema.columns
            .map(col => `${quote}${col.sqlName}${quote}`)
            .join(', ');

        const statements: string[] = [];
        const batchSize = 500;

        for (let i = 0; i < rows.length; i += batchSize) {
            const batchRows = rows.slice(i, i + batchSize);
            const valueClauses = batchRows.map(row => {
                const values = schema.columns.map(col => {
                    // Pobieramy wartość bezpośrednio po oryginalnej nazwie kolumny ze słownika wiersza CSV,
                    // dzięki czemu operacja moveColumn (zmiana kolejności) poprawnie przestawia dane w INSERT!
                    const cellValue = row.values[col.originalName] ?? '';
                    const dataType = col.userOverrideType ?? col.detectedType;
                    return this.valueEscaper.escapeValue(cellValue, dataType);
                });
                return `    (${values.join(', ')})`;
            });

            const insertStatement = `INSERT INTO ${escapedTableName} (${columnNames})
                                     VALUES  ` +
                valueClauses.join(',\n') + ';';

            statements.push(insertStatement);
        }

        return statements.join('\n\n');
    }
}