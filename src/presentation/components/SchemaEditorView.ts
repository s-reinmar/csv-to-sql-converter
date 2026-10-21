import { ISchemaEditorView } from '../contracts/IViewComponents';
import { IConversionStateData } from '../../application/ConversionState';
import { SqlDataType } from '../../domain/enums/SqlDataType';
import { IColumnDefinition } from '../../domain/models/ColumnDefinition';

/**
 * Komponent widoku odpowiedzialny za renderowanie dynamicznej tabeli edycji schematu
 * (Schema Editor) w warstwie DOM, umożliwiający korektę nazw kolumn, typów oraz flag NULL.
 */
export class SchemaEditorView implements ISchemaEditorView {
    private sectionElement: HTMLElement;
    private tableBodyElement: HTMLElement;
    private tableNameInput: HTMLInputElement;

    private columnNameChangedCallback?: (originalName: string, newName: string) => void;
    private columnTypeChangedCallback?: (originalName: string, newType: SqlDataType | undefined) => void;
    private columnNullableChangedCallback?: (originalName: string, isNullable: boolean) => void;
    private tableNameChangedCallback?: (newTableName: string) => void;

    constructor() {
        const sectionElement = document.getElementById('schema-editor-section') as HTMLElement;
        const tableBodyElement = document.getElementById('schema-table-body') as HTMLElement;
        const tableNameInput = document.getElementById('table-name-input') as HTMLInputElement;

        if (!sectionElement || !tableBodyElement || !tableNameInput) {
            throw new Error('Nie znaleziono wymaganych elementów DOM dla komponentu SchemaEditorView.');
        }

        this.sectionElement = sectionElement;
        this.tableBodyElement = tableBodyElement;
        this.tableNameInput = tableNameInput;

        this.bindTableNameEvent();
    }

    /**
     * Rejestruje nasłuchiwacz zmiany nazwy kolumny SQL.
     */
    public onColumnNameChanged(callback: (originalName: string, newName: string) => void): void {
        this.columnNameChangedCallback = callback;
    }

    /**
     * Rejestruje nasłuchiwacz nadpisania typu danych kolumny.
     */
    public onColumnTypeChanged(callback: (originalName: string, newType: SqlDataType | undefined) => void): void {
        this.columnTypeChangedCallback = callback;
    }

    /**
     * Rejestruje nasłuchiwacz zmiany flagi NULL / NOT NULL.
     */
    public onColumnNullableChanged(callback: (originalName: string, isNullable: boolean) => void): void {
        this.columnNullableChangedCallback = callback;
    }

    /**
     * Rejestruje nasłuchiwacz zmiany nazwy tabeli docelowej.
     */
    public onTableNameChanged(callback: (newTableName: string) => void): void {
        this.tableNameChangedCallback = callback;
    }

    /**
     * Renderuje lub aktualizuje tabelę edycji schematu na podstawie aktualnego stanu aplikacji.
     */
    public render(state: Readonly<IConversionStateData>): void {
        const schema = state.tableSchema;
        const csvData = state.csvData;

        // Jeśli brak schematu lub danych, ukryj sekcję edycji
        if (!schema || !schema.columns || schema.columns.length === 0) {
            this.sectionElement.classList.add('hidden');
            this.tableBodyElement.innerHTML = '';
            return;
        }

        // Pokaż sekcję edycji schematu
        this.sectionElement.classList.remove('hidden');

        // Synchronizacja nazwy tabeli w inpucie, jeśli różni się od stanu
        if (this.tableNameInput.value !== schema.tableName) {
            this.tableNameInput.value = schema.tableName;
        }

        // Generowanie wierszy tabeli edycji schematu
        this.tableBodyElement.innerHTML = '';

        schema.columns.forEach((column: IColumnDefinition, index: number) => {
            const tr = document.createElement('tr');

            // 1. Oryginalna nazwa kolumna (z podglądem pierwszej próbki wartości z CSV)
            const tdOriginal = document.createElement('td');
            const sampleValue = this.extractSampleValue(csvData?.rows, index);
            tdOriginal.innerHTML = `<strong>${this.escapeHtml(column.originalName)}</strong><br><small style="color: var(--text-muted);">Próbka: ${this.escapeHtml(sampleValue)}</small>`;
            tr.appendChild(tdOriginal);

            // 2. Edytowalna nazwa SQL kolumny
            const tdSqlName = document.createElement('td');
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.value = column.sqlName;
            nameInput.className = 'form-control';
            nameInput.disabled = state.isLoading;
            nameInput.addEventListener('change', () => {
                if (this.columnNameChangedCallback) {
                    this.columnNameChangedCallback(column.originalName, nameInput.value);
                }
            });
            tdSqlName.appendChild(nameInput);
            tr.appendChild(tdSqlName);

            // 3. Wykryty typ (informacyjnie)
            const tdDetected = document.createElement('td');
            tdDetected.textContent = column.detectedType;
            tdDetected.style.color = 'var(--text-secondary)';
            tr.appendChild(tdDetected);

            // 4. Pole wyboru (<select>) typu docelowego (Override)
            const tdOverride = document.createElement('td');
            const typeSelect = document.createElement('select');
            typeSelect.className = 'form-control';
            typeSelect.disabled = state.isLoading;

            // Opcja domyślna (automatyczna)
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = `Automatyczny (${column.detectedType})`;
            typeSelect.appendChild(defaultOption);

            // Wypełnienie wszystkimi dostępnymi typami SQL
            Object.values(SqlDataType).forEach((dataType) => {
                const opt = document.createElement('option');
                opt.value = dataType;
                opt.textContent = dataType;
                if (column.userOverrideType === dataType) {
                    opt.selected = true;
                }
                typeSelect.appendChild(opt);
            });

            typeSelect.addEventListener('change', () => {
                const selectedValue = typeSelect.value as SqlDataType;
                const newType = selectedValue ? selectedValue : undefined;
                if (this.columnTypeChangedCallback) {
                    this.columnTypeChangedCallback(column.originalName, newType);
                }
            });

            tdOverride.appendChild(typeSelect);
            tr.appendChild(tdOverride);

            // 5. Flaga NULL / NOT NULL
            const tdNullable = document.createElement('td');
            const nullableCheckbox = document.createElement('input');
            nullableCheckbox.type = 'checkbox';
            nullableCheckbox.checked = column.isNullable;
            nullableCheckbox.disabled = state.isLoading;
            nullableCheckbox.style.accentColor = 'var(--accent-primary)';
            nullableCheckbox.style.width = '1.2rem';
            nullableCheckbox.style.height = '1.2rem';
            nullableCheckbox.style.cursor = 'pointer';

            nullableCheckbox.addEventListener('change', () => {
                if (this.columnNullableChangedCallback) {
                    this.columnNullableChangedCallback(column.originalName, nullableCheckbox.checked);
                }
            });

            tdNullable.appendChild(nullableCheckbox);
            tr.appendChild(tdNullable);

            this.tableBodyElement.appendChild(tr);
        });
    }

    /**
     * Wiąże zdarzenie zmiany nazwy tabeli docelowej w głównym formularzu.
     */
    private bindTableNameEvent(): void {
        this.tableNameInput.addEventListener('change', () => {
            if (this.tableNameChangedCallback) {
                this.tableNameChangedCallback(this.tableNameInput.value);
            }
        });
    }

    /**
     * Pomocnicza metoda wyciągająca przykładową wartość komórki z wierszy CSV dla danej kolumny.
     */
    private extractSampleValue(rows: ReadonlyArray<import('../../domain/models/CsvRow').ICsvRow> | undefined, columnIndex: number): string {
        if (!rows || rows.length === 0) {
            return '(brak danych)';
        }
        const firstRow = rows[0];
        if (firstRow && firstRow.cells && firstRow.cells[columnIndex]) {
            const val = firstRow.cells[columnIndex].rawValue;
            return val !== '' ? val : '(puste)';
        }
        return '(puste)';
    }

    /**
     * Bezpieczne kodowanie HTML zapobiegające XSS.
     */
    private escapeHtml(text: string): string {
        const map: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }
}