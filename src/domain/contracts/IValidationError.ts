/**
 * @file IValidationError.ts
 * @description Interfejs reprezentujący błąd lub ostrzeżenie walidacyjne.
 */

/**
 * Reprezentuje ostrzeżenie dotyczące niepoprawnych lub pominiętych danych wejściowych.
 */
export interface IValidationError {
    readonly message: string;
}