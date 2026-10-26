import {SqlDataType} from '../enums/SqlDataType';

/**
 * Serwis odpowiedzialny za bezpieczne formatowanie i escape'owanie wartości komórek CSV
 * przed umieszczeniem ich w instrukcjach SQL DML (INSERT INTO).
 * Chroni przed SQL Injection, obsługuje apostrofy, rzutowanie NULL oraz formatowanie typów.
 */
export class SqlValueEscaper {
    /**
     * Formatuje surową wartość tekstową na bezpieczny literał SQL w zależności od typu danych.
     *
     * @param rawValue Surowa wartość z komórki CSV
     * @param dataType Docelowy typ danych SQL kolumny
     */
    public escapeValue(rawValue: string | null | undefined, dataType: SqlDataType): string {
        if (this.isNullOrEmpty(rawValue)) {
            return 'NULL';
        }

        const value = rawValue ?? '';
        const trimmed = value.trim();
        switch (dataType) {
            case SqlDataType.INTEGER:
                if (trimmed.toUpperCase() === 'NULL') {
                    return 'NULL';
                }
                return this.formatInteger(trimmed);
            case SqlDataType.DECIMAL:
                if (trimmed.toUpperCase() === 'NULL') {
                    return 'NULL';
                }
                return this.formatDecimal(trimmed);
            case SqlDataType.BOOLEAN:
                if (trimmed.toUpperCase() === 'NULL') {
                    return 'NULL';
                }
                return this.formatBoolean(trimmed);
            case SqlDataType.DATE:
            case SqlDataType.DATETIME:
                if (trimmed.toUpperCase() === 'NULL') {
                    return 'NULL';
                }
                return this.formatDateOrDateTime(trimmed);
            case SqlDataType.VARCHAR:
            case SqlDataType.TEXT:
            default:
                return this.formatString(value);
        }
    }

    /**
     * Sprawdza, czy wartość jest pusta, null lub undefined.
     */
    private isNullOrEmpty(value: string | null | undefined): boolean {
        if (value === null || value === undefined) {
            return true;
        }
        return value === '';
    }

    /**
     * Formatuje wartość liczbową całkowitą (INTEGER).
     */
    private formatInteger(value: string): string {
        if (!/^-?\d+$/.test(value)) {
            return this.formatString(value);
        }
        return value;
    }

    /**
     * Formatuje wartość liczbową zmiennoprzecinkową (DECIMAL).
     * Obsługuje zarówno kropkę, jak i przecinek jako separator dziesiętny.
     */
    private formatDecimal(value: string): string {
        const normalized = value.replace(',', '.');
        if (!/^-?\d+(?:\.\d+)?$/.test(normalized)) {
            return this.formatString(value);
        }
        return normalized;
    }

    /**
     * Formatuje wartość logiczną (BOOLEAN) na standardowe słowa kluczowe SQL.
     */
    private formatBoolean(value: string): string {
        const lower = value.toLowerCase().trim();
        const trueValues = ['true', '1', 'yes', 'y', 't', 'tak'];
        if (trueValues.includes(lower)) {
            return 'TRUE';
        }
        const falseValues = ['false', '0', 'no', 'n', 'f', 'nie'];
        if (falseValues.includes(lower)) {
            return 'FALSE';
        }
        return this.formatString(value);
    }

    /**
     * Formatuje datę lub datę z czasem (DATE / DATETIME) w cudzysłowach SQL.
     */
    private formatDateOrDateTime(value: string): string {
        const escaped = value.replace(/'/g, "''");
        return `'${escaped}'`;
    }

    /**
     * Formatuje ciąg tekstowy (VARCHAR / TEXT) z pełną ochroną przed SQL Injection (escape apostrofów).
     */
    private formatString(value: string): string {
        const escaped = value.replace(/'/g, "''");
        return `'${escaped}'`;
    }
}