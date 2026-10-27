import { describe, it, expect, beforeEach } from 'vitest'; // lub '@jest/globals'
import { NameNormalizationService } from '../../src/domain/services/NameNormalizationService';

describe('NameNormalizationService', () => {
    let service: NameNormalizationService;

    beforeEach(() => {
        service = new NameNormalizationService();
    });

    describe('normalizeColumnName (snake_case)', () => {
        it('powinien zamienić polskie znaki diakrytyczne na ich łacińskie odpowiedniki', () => {
            const input = 'zażółć gęślą jaźń';
            const result = service.normalizeColumnName(input);
            expect(result).toBe('zazolc_gesla_jazn');
        });

        it('powinien poprawnie obsłużyć litery Ł oraz ł', () => {
            expect(service.normalizeColumnName('ŁÓDŹ_PŁOCK')).toBe('lodz_plock');
        });

        it('powinien zamienić znaki specjalne i wielokrotne spacje na pojedynczy podkreślnik', () => {
            const input = '  Cena (brutto) / PLN  ';
            const result = service.normalizeColumnName(input);
            expect(result).toBe('cena_brutto_pln');
        });

        it('powinien zwrócić fallback dla pustego ciągu znaków', () => {
            expect(service.normalizeColumnName('')).toBe('unnamed_column');
            expect(service.normalizeColumnName('   ')).toBe('unnamed_column');
        });
    });

    describe('normalizeTableName (lowerCamelCase)', () => {
        it('powinien zamienić nazwę pliku z polskimi znakami i rozszerzeniem na lowerCamelCase', () => {
            const input = 'zażółć gęślą jaźń.csv';
            const result = service.normalizeTableName(input);
            expect(result).toBe('zazolcGeslaJazn');
        });

        it('powinien usunąć spacje i podkreślenia, łącząc słowa w wielką literę', () => {
            const input = 'rejestr_sprzedazy_2026.csv';
            const result = service.normalizeTableName(input);
            expect(result).toBe('rejestrSprzedazy2026');
        });

        it('powinien zwrócić fallback dla pustej nazwy pliku', () => {
            expect(service.normalizeTableName('.csv')).toBe('importedData');
        });
    });
});