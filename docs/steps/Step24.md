# Krok 24 (src/application/ConversionState.ts): Niemutowalny kontener stanu przechowujący aktualnie wczytane dane CSV, roboczą wersję schematu tabeli oraz statusy błędów.

Niemutowalny kontener `ConversionState` pełni rolę centralnego magazynu stanu aplikacji, przechowując aktualnie wczytane dane CSV, roboczą wersję schematu tabeli oraz statusy błędów. Dzięki temu możliwe jest łatwe zarządzanie stanem konwersji i zapewnienie spójności danych w całej aplikacji.

src/application/ConversionState.ts
```typescript
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
```

## Podsumowanie i weryfikacja (Faza 6, Krok 24)

### [SOLID CHECK]
- Single Responsibility Principle (SRP): Klasa ConversionState pełni wyłącznie rolę kontenera stanu aplikacji, zarządzając danymi wejściowymi CSV, schematem tabeli, wygenerowanym kodem SQL oraz statusami błędów i ładowania, bez mieszania logiki biznesowej czy prezentacyjnej.
- Open/Closed Principle (OCP): Klasa jest otwarta na rozszerzenia (można dodawać nowe pola stanu), ale zamknięta na modyfikacje (istniejący kod nie wymaga zmian przy dodawaniu nowych funkcjonalności).
- Liskov Substitution Principle (LSP): Klasa ConversionState może być używana w miejscach oczekujących IConversionStateData bez naruszania poprawności działania.
- Interface Segregation Principle (ISP): Interfejs IConversionStateData jest spójny i nie wymusza implementacji niepotrzebnych metod.
- Dependency Inversion Principle (DIP): Klasa nie zależy od konkretnych implementacji zewnętrznych, lecz operuje na abstrakcjach (interfejsach), co ułatwia testowanie i utrzymanie kodu.

### [INTERFACE SUMMARY]
- `IConversionStateData`: Interfejs definiujący strukturę stanu aplikacji konwersji CSV do SQL, zawierający pola takie jak `fileName`, `csvData`, `tableSchema`, `generatedSql`, `savedFilePath`, `isLoading` oraz `errorMessage`.
- `ConversionState`: Klasa implementująca niemutowalny kontener stanu, umożliwiająca tworzenie nowych instancji stanu poprzez metodę `cloneWith`, zachowując nienaruszalność dotychczasowego stanu.

### [REFACTORING ALERT]
- Klasa ConversionState jest całkowicie odizolowana od warstwy prezentacji i logiki biznesowej, co pozwala na łatwe testowanie i utrzymanie kodu. Wszelkie zmiany stanu aplikacji są realizowane poprzez tworzenie nowych instancji klasy, co zapewnia spójność i bezpieczeństwo danych w całej aplikacji.