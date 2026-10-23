/**
 * Kontrakt dla serwisu odpowiedzialnego za automatyczne wykrywanie
 * najbardziej prawdopodobnego separatora w pliku CSV.
 */
export interface ISeparatorDetector {
    /**
     * Analizuje surową zawartość CSV i zwraca optymalny separator.
     * @param csvContent Surowy tekst pliku CSV
     * @returns Znak separatora (np. ',', ';', '\t')
     */
    detect(csvContent: string): string;
}