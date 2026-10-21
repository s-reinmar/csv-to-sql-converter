import { ICsvParseResult } from '../domain/contracts/ICsvParser';
import { ITableSchema } from '../domain/models/TableSchema';

/**
 * Interfejs definiujący niemutowalną strukturę stanu aplikacji konwersji CSV do SQL.
 */
export interface IConversionStateData {
    readonly fileName: string | null;
    readonly csvData: ICsvParseResult | null;
    readonly tableSchema: ITableSchema | null;
    readonly generatedSql: string | null;
    readonly savedFilePath: string | null;
    readonly isLoading: boolean;
    readonly errorMessage: string | null;
}

/**
 * Niemutowalny kontener stanu (State Container) zarządzający danymi wejściowymi CSV,
 * schematem tabeli, wygenerowanym kodem SQL oraz statusami błędów i ładowania.
 * Każda modyfikacja stanu zwraca nową instancję klasy (wzorzec Immutability).
 */
export class ConversionState {
    private readonly stateData: IConversionStateData;

    /**
     * @param initialData Opcjonalny początkowy stan aplikacji.
     */
    constructor(initialData?: Partial<IConversionStateData>) {
        this.stateData = Object.freeze({
            fileName: null,
            csvData: null,
            tableSchema: null,
            generatedSql: null,
            savedFilePath: null,
            isLoading: false,
            errorMessage: null,
            ...(initialData ? initialData : {})
        });
    }

    /**
     * Zwraca aktualny, zamrożony (niemutowalny) stan aplikacji.
     */
    public getState(): Readonly<IConversionStateData> {
        return this.stateData;
    }

    /**
     * Tworzy i zwraca nową instancję kontenera z zaktualizowanymi polami,
     * zachowując nienaruszalność dotychczasowego stanu.
     *
     * @partials Fragmenty stanu do nadpisania.
     */
    public cloneWith(partialState: Partial<IConversionStateData>): ConversionState {
        return new ConversionState({
            ...this.stateData,
            ...partialState
        });
    }
}