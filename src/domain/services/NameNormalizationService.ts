import { INameNormalizationService } from '../contracts/INameNormalizationService';

/**
 * Serwis domenowy odpowiedzialny za normalizację nazw kolumn oraz tabel i plików,
 * zgodnie z regułami: usunięcie znaków diakrytycznych do standardowego a-z (w tym ł -> l), zamiana spacji na '_',
 * oraz zachowanie formatu lowerCamelCase dla nazw tabel/plików i snake_case dla kolumn SQL.
 */
export class NameNormalizationService implements INameNormalizationService {

    /**
     * Normalizuje nazwę kolumny do bezpiecznego identyfikatora SQL (snake_case, małe litery, bez diakrytyków).
     */
    public normalizeColumnName(originalName: string): string {
        const normalized = this.toSqlSafeSnakeCase(originalName);
        return normalized.length > 0 ? normalized : 'unnamed_column';
    }

    /**
     * Normalizuje nazwę tabeli / pliku do formatu lowerCamelCase z uwzględnieniem podkreśleń i bez znaków diakrytycznych.
     */
    public normalizeTableName(originalName: string): string {
        const normalized = this.toLowerCamelCase(originalName);
        return normalized.length > 0 ? normalized : 'importedData';
    }

    /**
     * Konwertuje polskie znaki diakrytyczne na ich łacińskie odpowiedniki.
     */
    private stripAccents(text: string): string {
        return text
            .replace(/[łŁ]/g, match => (match === 'Ł' ? 'L' : 'l'))
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    /**
     * Konwertuje ciąg znaków na bezpieczny format snake_case bez znaków diakrytycznych.
     * Np. "zażółć gęślą jaźń" -> "zazolc_gesla_jazn"
     */
    private toSqlSafeSnakeCase(text: string): string {
        if (!text) {
            return '';
        }

        return this.stripAccents(text)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
    }

    /**
     * Konwertuje nazwę pliku lub tabeli do formatu lowerCamelCase (bez spacji i podkreśleń).
     * Np. "zażółć gęślą jaźń.csv" -> "zazolcGeslaJazn"
     */
    private toLowerCamelCase(text: string): string {
        if (!text) {
            return '';
        }

        // 1. Usunięcie rozszerzenia pliku (np. .csv)
        const cleanName = text.replace(/\.[^/.]+$/, '');

        // 2. Usunięcie akcentów i podział na słowa
        const stripped = this.stripAccents(cleanName)
            .replace(/[^a-zA-Z0-9]+/g, ' ')
            .trim();

        if (!stripped) {
            return 'importedData';
        }

        // 3. Budowa lowerCamelCase
        const parts = stripped.split(/\s+/).filter(Boolean);
        if (parts.length === 0) {
            return 'importedData';
        }

        return parts[0].toLowerCase() + parts.slice(1).map(part =>
            part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        ).join('');
    }
}