# Krok 9 (src/domain/contracts/ICsvParser.ts): Kontrakt dla serwisu parsującego surowy tekst CSV do ustrukturyzowanego modelu domenowego. 

Kontrakt definiuje metody odpowiedzialne za wczytywanie i parsowanie danych CSV, zwracając wynik w postaci kolekcji wierszy i komórek. Interfejs ten jest kluczowy dla separacji logiki parsowania od reszty aplikacji, umożliwiając łatwe testowanie i wymianę implementacji.

src/domain/contracts/ICsvParser.ts
```typescript
/**
* @file ICsvParser.ts
* @description Kontrakt dla serwisu parsującego surowy tekst CSV do ustrukturyzowanego modelu domenowego.
  */

import { ICsvRow } from '../models/CsvRow';

/**
* Reprezentuje wynik parsowania surowego pliku CSV.
  */
  export interface ICsvParseResult {
  /** Lista nagłówków kolumn wyodrębniona z pierwszego wiersza pliku CSV */
  readonly headers: ReadonlyArray<string>;

  /** Lista sparsowanych wierszy danych w pliku CSV */
  readonly rows: ReadonlyArray<ICsvRow>;
  }

/**
* Kontrakt dla serwisu odpowiedzialnego za przekształcanie surowego tekstu CSV na ustrukturyzowany model domenowy.
  */
  export interface ICsvParser {
  /**
    * Parsuje zawartość tekstową pliku CSV do ustrukturyzowanego wyniku zawierającego nagłówki i wiersze.
    * @param csvContent Surowa zawartość tekstowa pliku CSV.
    * @param delimiter Opcjonalny separator kolumn (np. ',' lub ';').
      */
      parse(csvContent: string, delimiter?: string): ICsvParseResult;
      }
```

## Podsumowanie i weryfikacja (Faza 2, Krok 9):

### [SOLID CHECK]
Krok 9 realizuje zasadę pojedynczej odpowiedzialności (SRP), definiując kontrakt dla serwisu parsującego surowy tekst CSV do ustrukturyrowanego modelu domenowego, oddzielając logikę parsowania od reszty aplikacji.

### [INTERFACE SUMMARY]
Wprowadza interfejsy ICsvParseResult oraz ICsvParser, które umożliwiają precyzyjne określenie struktury wyniku parsowania CSV oraz kontraktu dla implementacji serwisu parsującego, co jest kluczowe dla testowalności i wymienności komponentów w architekturze aplikacji.

### [REFACTORING ALERT]
Modele są całkowicie niemutowalne (readonly), co zapobiega niezamierzonym modyfikacjom stanu podczas parsowania i wnioskowania typów, w pełni respektując rygorystyczne zasady TypeScript (strict: true).