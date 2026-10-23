import { ISeparatorDetector } from '../contracts/ISeparatorDetector';

/**
 * Mikro-serwis domenowy realizujący heurystyczną detekcję separatora CSV.
 * Analizuje próbkę pierwszych linii tekstu, ignorując wartości w cudzysłowach.
 */
export class SeparatorDetector implements ISeparatorDetector {
    private readonly candidateDelimiters: ReadonlyArray<string> = [',', ';', '\t', '|'];
    private readonly sampleSize: number = 10;

    public detect(csvContent: string): string {
        if (!csvContent || csvContent.trim() === '') {
            return ',';
        }

        const lines = csvContent
            .split(/\r\n|\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .slice(0, this.sampleSize);

        if (lines.length === 0) {
            return ',';
        }

        let bestDelimiter = ',';
        let maxScore = -1;

        for (const delimiter of this.candidateDelimiters) {
            const score = this.evaluateDelimiter(lines, delimiter);
            if (score > maxScore) {
                maxScore = score;
                bestDelimiter = delimiter;
            }
        }

        return bestDelimiter;
    }

    private evaluateDelimiter(lines: ReadonlyArray<string>, delimiter: string): number {
        const counts: number[] = [];
        let inQuotes = false;

        for (const line of lines) {
            let count = 0;
            inQuotes = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    // Obsługa znaków ucieczki dla cudzysłowów
                    if (i + 1 < line.length && line[i + 1] === '"') {
                        i++;
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === delimiter && !inQuotes) {
                    count++;
                }
            }
            counts.push(count);
        }

        const totalOccurrences = counts.reduce((sum, c) => sum + c, 0);
        if (totalOccurrences === 0) {
            return -1;
        }

        const firstCount = counts[0];
        const isConsistent = counts.every(c => c === firstCount && c > 0);

        let score = totalOccurrences;
        // Znaczna premia punktowa za spójną strukturę w każdym wierszu
        if (isConsistent) {
            score *= 10;
        } else {
            // Kara punktowa za różną liczbę separatorów w badanych liniach
            const uniqueCounts = new Set(counts).size;
            score -= uniqueCounts * 5;
        }

        return score;
    }
}