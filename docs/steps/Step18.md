# Krok 18 (src/domain/services/SqlDdlBuilder.ts): Budowniczy instrukcji CREATE TABLE na podstawie zatwierdzonego przez użytkownika schematu TableSchema.

Budowniczy `SqlDdlBuilder` jest odpowiedzialny za generowanie instrukcji SQL typu CREATE TABLE na podstawie zatwierdzonego przez użytkownika schematu tabeli (TableSchema). Umożliwia to tworzenie tabel w bazie danych zgodnie z określonymi typami danych i strukturą kolumn.

src/domain/services/SqlDdlBuilder.ts
```typescript
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
```

## Podsumowanie i weryfikacja (Faza 4, Krok 18)

### [SOLID CHECK]
- Single Responsibility Principle (SRP): Klasa SqlDdlBuilder skupia się wyłącznie na translacji modelu schematu tabeli (ITableSchema) na sformatowany tekst zapytania DDL SQL, uwzględniając dialekt oraz nadpisane przez użytkownika typy kolumn.
- Open/Closed Principle (OCP): Obsługa mapowania typów domenowych na typy SQL oraz obsługa cudzysłowów identyfikatorów (identifierQuote) pozwala na łatwe rozszerzanie bez modyfikacji logiki strukturalnej.
- Bezstanowość (Stateless): Klasa nie przechowuje stanu, co zapewnia jej pełne bezpieczeństwo współbieżne.

### [INTERFACE SUMMARY]
- generateDdl(schema: ITableSchema): string – główna metoda generująca kompletny skrypt DDL dla tabeli.

Prywatne metody pomocnicze:
- buildColumnDefinition(column: IColumnDefinition, quote: string): string – buduje linię definicji pojedynczej kolumny.
- mapDataTypeToSql(dataType: SqlDataType): string – mapuje typy domenowe SqlDataType na standardowe typy bazodanowe SQL (np. INT, VARCHAR(255), DECIMAL(18,4)).

### [REFACTORING ALERT]
- Logika budowania kolumn oraz mapowania typów została wydzielona do prywatnych metod pomocniczych, dzięki czemu główna metoda generateDdl pozostaje zwięzła i czytelna (poniżej 25 linii kodu).
- Zastosowano priorytetyzację typu nadpisanego przez użytkownika (column.userOverrideType ?? column.detectedType), co umożliwia bezproblemowe uwzględnienie korekt z interfejsu edycji schematu.
- Kod w pełni spełnia rygorystyczne wymagania kompilatora TypeScript (strict: true, bez użycia typu any).