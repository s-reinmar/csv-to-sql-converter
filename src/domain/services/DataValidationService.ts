import { IDataValidationService } from '../contracts/IDataValidationService';
import { ICsvParseResult } from '../models/CsvRow';
import { IValidationError } from '../contracts/IValidationError';

export class DataValidationService implements IDataValidationService {
    public validate(parseResult: ICsvParseResult): ReadonlyArray<IValidationError> {
        const errors: IValidationError[] = [];

        for (const row of parseResult.rows) {
            for (const header of parseResult.headers) {
                const cellValue = row.values[header];

                // Walidacja brakujących wartości
                if (cellValue === undefined || cellValue === null || cellValue.trim() === '') {
                    errors.push({
                        severity: 'warning',
                        message: `Wykryto pustą wartość. Komórka zostanie wyeksportowana jako NULL.`,
                        rowIndex: row.rowIndex,
                        columnName: header
                    });
                }

                // Przestrzeń na kolejne reguły (np. niepoprawne formaty dat) można dodawać tutaj
            }
        }

        return errors;
    }
}