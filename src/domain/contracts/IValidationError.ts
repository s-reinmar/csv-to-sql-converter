export type ValidationSeverity = 'warning' | 'error';

/**
 * Kontrakt reprezentujący pojedynczy błąd lub ostrzeżenie walidacji danych wejściowych.
 */
export interface IValidationError {
    readonly severity: ValidationSeverity;
    readonly message: string;
    readonly rowIndex?: number;
    readonly columnName?: string;
}