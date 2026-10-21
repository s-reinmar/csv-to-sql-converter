import { IFileUploadView } from '../contracts/IViewComponents';
import { IConversionStateData } from '../../application/ConversionState';

/**
 * Komponent widoku odpowiedzialny za obsługę wyboru pliku CSV (oraz Drag & Drop),
 * wybór separatora oraz docelowej nazwy tabeli SQL w warstwie prezentacji DOM.
 */
export class FileUploadView implements IFileUploadView {
    private fileInput: HTMLInputElement;
    private dropZone: HTMLElement;
    private delimiterSelect: HTMLSelectElement;
    private tableNameInput: HTMLInputElement;
    private fileSelectedCallback?: (file: File, delimiter?: string, tableName?: string) => void;

    constructor() {
        const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
        const dropZone = document.getElementById('drop-zone') as HTMLElement;
        const delimiterSelect = document.getElementById('delimiter-select') as HTMLSelectElement;
        const tableNameInput = document.getElementById('table-name-input') as HTMLInputElement;

        if (!fileInput || !dropZone || !delimiterSelect || !tableNameInput) {
            throw new Error('Nie znaleziono wymaganych elementów DOM dla komponentu FileUploadView.');
        }

        this.fileInput = fileInput;
        this.dropZone = dropZone;
        this.delimiterSelect = delimiterSelect;
        this.tableNameInput = tableNameInput;

        this.bindEvents();
    }

    /**
     * Rejestruje nasłuchiwacz zdarzenia wyboru pliku.
     */
    public onFileSelected(callback: (file: File, delimiter?: string, tableName?: string) => void): void {
        this.fileSelectedCallback = callback;
    }

    /**
     * Renderuje lub aktualizuje stan widoku wgrania pliku na podstawie stanu aplikacji.
     */
    public render(state: Readonly<IConversionStateData>): void {
        const isLoading = state.isLoading;

        // Blokowanie kontrolek w trakcie trwania asynchronicznej konwersji
        this.fileInput.disabled = isLoading;
        this.delimiterSelect.disabled = isLoading;
        this.tableNameInput.disabled = isLoading;

        if (isLoading) {
            this.dropZone.style.opacity = '0.6';
            this.dropZone.style.pointerEvents = 'none';
        } else {
            this.dropZone.style.opacity = '1';
            this.dropZone.style.pointerEvents = 'auto';
        }

        // Automatyczne uzupełnienie nazwy tabeli, jeśli została wygenerowana ze stanu, a pole jest puste
        if (state.tableSchema && state.tableSchema.tableName && !this.tableNameInput.value) {
            this.tableNameInput.value = state.tableSchema.tableName;
        }
    }

    /**
     * Wyświetla błąd powiązany z formularzem wgrania pliku.
     */
    public showError(message: string): void {
        console.warn(`[FileUploadView Error]: ${message}`);
        alert(`Błąd wgrania pliku: ${message}`);
    }

    /**
     * Czyści formularz wgrania pliku.
     */
    public clear(): void {
        this.fileInput.value = '';
        this.delimiterSelect.value = '';
        this.tableNameInput.value = '';
    }

    /**
     * Wiąże natywne zdarzenia DOM (click, change, dragover, dragleave, drop).
     */
    private bindEvents(): void {
        // Wybór pliku przez standardowy input type="file"
        this.fileInput.addEventListener('change', () => {
            const files = this.fileInput.files;
            if (files && files.length > 0) {
                this.handleFile(files[0]);
            }
        });

        // Obsługa przeciągania nad strefą (Drag Over)
        this.dropZone.addEventListener('dragover', (event: DragEvent) => {
            event.preventDefault();
            event.stopPropagation();
            this.dropZone.classList.add('dragover');
        });

        // Opuszczenie strefy (Drag Leave)
        this.dropZone.addEventListener('dragleave', (event: DragEvent) => {
            event.preventDefault();
            event.stopPropagation();
            this.dropZone.classList.remove('dragover');
        });

        // Upuszczenie pliku w strefie (Drop)
        this.dropZone.addEventListener('drop', (event: DragEvent) => {
            event.preventDefault();
            event.stopPropagation();
            this.dropZone.classList.remove('dragover');

            const dataTransfer = event.dataTransfer;
            if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
                const file = dataTransfer.files[0];

                // Przypisanie upuszczonego pliku do ukrytego inputu file
                const dataTransferContainer = new DataTransfer();
                dataTransferContainer.items.add(file);
                this.fileInput.files = dataTransferContainer.files;

                this.handleFile(file);
            }
        });
    }

    /**
     * Odczytuje parametry formularza i wywołuje zarejestrowany callback kontrolera.
     */
    private handleFile(file: File): void {
        if (!this.fileSelectedCallback) {
            return;
        }

        const delimiter = this.delimiterSelect.value ? this.delimiterSelect.value : undefined;
        const tableName = this.tableNameInput.value ? this.tableNameInput.value : undefined;

        this.fileSelectedCallback(file, delimiter, tableName);
    }
}