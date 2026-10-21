import { ISqlFileRepository } from '../domain/contracts/ISqlFileRepository';

/**
 * Implementacja interfejsu ISqlFileRepository komunikująca się z lokalnym
 * endpointem API w celu trwałego zapisu wygenerowanego pliku SQL na serwerze / w środowisku Vite.
 */
export class ApiSqlFileRepository implements ISqlFileRepository {
    private readonly endpointUrl: string;

    /**
     * @param endpointUrl Adres endpointu API odpowiedzialnego za zapis plików (domyślnie '/api/save-sql').
     */
    constructor(endpointUrl: string = '/api/save-sql') {
        this.endpointUrl = endpointUrl;
    }

    /**
     * Wysyła żądanie do lokalnego serwisu zapisu pliku SQL.
     *
     * @param fileName Nazwa pliku docelowego (np. 'users.sql').
     * @param sqlContent Treść skryptu SQL do zapisu.
     * @returns Promise zwracający ścieżkę lub komunikat o pomyślnym zapisie zwrócony przez serwer.
     */
    public async saveSqlFile(fileName: string, sqlContent: string): Promise<string> {
        if (!fileName || fileName.trim() === '') {
            throw new Error('Nazwa pliku nie może być pusta.');
        }

        if (sqlContent === null || sqlContent === undefined) {
            throw new Error('Treść pliku SQL nie może być null lub undefined.');
        }

        try {
            const response = await fetch(this.endpointUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileName,
                    sqlContent,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const serverMessage = (errorData as { message?: string }).message || response.statusText;
                throw new Error(`Błąd serwera (${response.status}): ${serverMessage}`);
            }

            const result = (await response.json()) as { filePath?: string; message?: string };
            return result.filePath || result.message || `Plik ${fileName} został pomyślnie zapisany.`;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Nie udało się wysłać żądania zapisu pliku SQL: ${error.message}`);
            }
            throw new Error('Wystąpił nieznany błąd podczas komunikacji z serwerem zapisu plików.');
        }
    }
}