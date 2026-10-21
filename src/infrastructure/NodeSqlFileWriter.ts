import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Serwis infrastrukturalny odpowiedzialny za trwały zapis wygenerowanego kodu SQL
 * bezpośrednio do pliku w katalogu public/resources/ przy użyciu asynchronicznego API fs/promises.
 */
export class NodeSqlFileWriter {
    private readonly targetDirectory: string;

    /**
     * @param targetDirectory Docelowy katalog zapisu (domyślnie 'public/resources').
     */
    constructor(targetDirectory: string = 'public/resources') {
        this.targetDirectory = targetDirectory;
    }

    /**
     * Zapisuje przesłaną treść SQL do pliku na dysku w katalogu docelowym.
     *
     * @param fileName Nazwa pliku docelowego (np. 'users.sql').
     * @param sqlContent Treść skryptu SQL do zapisu.
     * @returns Promise zwracający pełną, znormalizowaną ścieżkę do zapisanego pliku.
     */
    public async saveSqlFile(fileName: string, sqlContent: string): Promise<string> {
        if (!fileName || fileName.trim() === '') {
            throw new Error('Nazwa pliku nie może być pusta.');
        }

        if (sqlContent === null || sqlContent === undefined) {
            throw new Error('Treść pliku SQL nie może być null lub undefined.');
        }

        // Zabezpieczenie przed atakami typu Path Traversal (wyciągnięcie samej nazwy pliku)
        const sanitizedFileName = path.basename(fileName);
        const fullPath = path.resolve(process.cwd(), this.targetDirectory, sanitizedFileName);

        try {
            // Upewnienie się, że katalog docelowy istnieje (rekurencyjnie)
            await fs.mkdir(path.dirname(fullPath), { recursive: true });

            // Zapis pliku tekstowego z kodowaniem UTF-8
            await fs.writeFile(fullPath, sqlContent, 'utf-8');

            return fullPath;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd zapisu pliku.';
            throw new Error(`Nie udało się zapisać pliku SQL pod ścieżką ${fullPath}: ${errorMessage}`);
        }
    }
}