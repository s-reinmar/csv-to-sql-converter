import { ISchemaEditorView } from '../contracts/IViewComponents';
import { IConversionStateData } from '../../application/ConversionState';
import { SqlDataType } from '../../domain/enums/SqlDataType';
import { IColumnDefinition } from '../../domain/models/ColumnDefinition';

/**
 * Komponent widoku odpowiedzialny za renderowanie dynamicznej tabeli edycji schematu
 * (Schema Editor) w warstwie DOM, umożliwiający korektę nazw kolumn, typów, flag NULL oraz kolejności.
 */
export class SchemaEditorView implements ISchemaEditorView {
    private sectionElement: HTMLElement;
    private tableBodyElement: HTMLElement;
    private tableNameInput: HTMLInputElement;

    private columnNameChangedCallback?: (originalName: string, newName: string) => void;
    private columnTypeChangedCallback?: (originalName: string, newType: SqlDataType | undefined) => void;
    private columnNullableChangedCallback?: (originalName: string, isNullable: boolean) => void;
    private tableNameChangedCallback?: (newTableName: string) => void;
    private columnMovedCallback?: (columnName: string, direction: 'up' | 'down') => void;

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

    public onColumnNameChanged(callback: (originalName: string, newName: string) => void): void {
        this.columnNameChangedCallback = callback;
    }

    public onColumnTypeChanged(callback: (originalName: string, newType: SqlDataType | undefined) => void): void {
        this.columnTypeChangedCallback = callback;
    }

    public onColumnNullableChanged(callback: (originalName: string, isNullable: boolean) => void): void {
        this.columnNullableChangedCallback = callback;
    }

    public onTableNameChanged(callback: (newTableName: string) => void): void {
        this.tableNameChangedCallback = callback;
    }

    public onColumnMoved(callback: (columnName: string, direction: 'up' | 'down') => void): void {
        this.columnMovedCallback = callback;
    }

    /**
     * Renderuje lub aktualizuje tabelę edycji schematu na podstawie aktualnego stanu aplikacji.
     */
    public render(state: Readonly<IConversionStateData>): void {
        const schema = state.tableSchema;
        const csvData = state.csvData;

        if (!schema || !schema.columns || schema.columns.length === 0) {
            this.sectionElement.classList.add('hidden');
            this.tableBodyElement.innerHTML = '';
            return;
        }

        this.sectionElement.classList.remove('hidden');

        if (this.tableNameInput.value !== schema.tableName) {
            this.tableNameInput.value = schema.tableName;
        }

        this.tableBodyElement.innerHTML = '';
        const totalColumns = schema.columns.length;

        schema.columns.forEach((column: IColumnDefinition, index: number) => {
            const tr = document.createElement('tr');

            // 1. Oryginalna nazwa kolumny + próbka
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

            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = `Automatyczny (${column.detectedType})`;
            typeSelect.appendChild(defaultOption);

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

            // 6. Przyciski zmiany kolejności (↑ / ↓)
            const tdActions = document.createElement('td');
            tdActions.style.whiteSpace = 'nowrap';
            tdActions.appendChild(this.renderMoveButtons(column.originalName, index, totalColumns, state.isLoading));
            tr.appendChild(tdActions);

            this.tableBodyElement.appendChild(tr);
        });
    }

    /**
     * Tworzy kontener z przyciskami do zmiany kolejności kolumny (↑ / ↓).
     */
    private renderMoveButtons(columnName: string, index: number, totalColumns: number, isLoading: boolean): HTMLElement {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.gap = '4px';

        const upButton = document.createElement('button');
        upButton.type = 'button';
        upButton.textContent = '↑';
        upButton.className = 'btn-secondary';
        upButton.style.padding = '2px 8px';
        upButton.disabled = index === 0 || isLoading;
        upButton.onclick = () => {
            if (this.columnMovedCallback) {
                this.columnMovedCallback(columnName, 'up');
            }
        };

        const downButton = document.createElement('button');
        downButton.type = 'button';
        downButton.textContent = '↓';
        downButton.className = 'btn-secondary';
        downButton.style.padding = '2px 8px';
        upButton.style.padding = '2px 8px';
        downButton.disabled = index === totalColumns - 1 || isLoading;
        downButton.onclick = () => {
            if (this.columnMovedCallback) {
                this.columnMovedCallback(columnName, 'down');
            }
        };

        container.appendChild(upButton);
        container.appendChild(downButton);

        return container;
    }

    private bindTableNameEvent(): void {
        this.tableNameInput.addEventListener('change', () => {
            if (this.tableNameChangedCallback) {
                this.tableNameChangedCallback(this.tableNameInput.value);
            }
        });
    }

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