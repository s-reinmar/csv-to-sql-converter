/**
 * Kontrakt dla serwisu odpowiedzialnego za przekształcanie ciągów znaków
 * na bezpieczne identyfikatory SQL.
 */
export interface INameNormalizationService {
    normalizeColumnName(originalName: string): string;
    normalizeTableName(originalName: string): string;
}