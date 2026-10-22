import { INameNormalizationService } from '../contracts/INameNormalizationService';

export class NameNormalizationService implements INameNormalizationService {
    public normalizeColumnName(originalName: string): string {
        const normalized = this.toSqlSafeSnakeCase(originalName);
        return normalized.length > 0 ? normalized : 'unnamed_column';
    }

    public normalizeTableName(originalName: string): string {
        const normalized = this.toSqlSafeSnakeCase(originalName);
        return normalized.length > 0 ? normalized : 'unnamed_table';
    }

    /**
     * Konwertuje ciąg znaków na bezpieczny format snake_case bez znaków diakrytycznych.
     */
    private toSqlSafeSnakeCase(text: string): string {
        if (!text) {
            return '';
        }

        return text
            .normalize('NFD') // Rozbicie znaków diakrytycznych (np. 'ą' -> 'a' + ogonek)
            .replace(/[\u0300-\u036f]/g, '') // Usunięcie znaków diakrytycznych
            .replace(/[^a-zA-Z0-9_]/g, '_') // Zastąpienie znaków niealfanumerycznych podkreśleniem
            .replace(/_+/g, '_') // Redukcja wielokrotnych podkreśleń do jednego
            .replace(/^_|_$/g, '') // Usunięcie podkreśleń z początku i końca
            .toLowerCase();
    }
}