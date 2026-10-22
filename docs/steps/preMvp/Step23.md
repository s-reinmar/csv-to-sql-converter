# Krok 23 (src/infrastructure/ApiSqlFileRepository.ts): Implementacja interfejsu ISqlFileRepository komunikująca się z lokalnym endpointem w celu trwałego zapisu pliku .sql w public/resources/.

Implementacja interfejsu `ISqlFileRepository` w serwisie `ApiSqlFileRepository` umożliwia komunikację z lokalnym endpointem serwera w celu trwałego zapisu wygenerowanego pliku `.sql` w katalogu `../../../public/resources`. Serwis ten wykorzystuje mechanizm fetch API do wysyłania żądań HTTP POST, przesyłając nazwę pliku oraz jego zawartość w formacie JSON.

src/infrastructure/ApiSqlFileRepository.ts
```typescript
import { ISqlFileRepository } from '../domain/contracts/ISqlFileRepository';

/**
 * Implementacja interfejsu ISqlFileRepository komunikująca się z lokalnym
 * endpointem API w celu trwałego zapisu wygenerowanego pliku SQL na serwerze / w środowisku Vite.
 */
export class ApiSqlFileRepository implements ISqlFileRepository {
    private readonly endpointUrl: string;

    /**
     * @param endpointUrl Adres endpointu API odpowiedzialnego za zapis plików (domyślnie '/api/save-sql').
     */
    constructor(endpointUrl: string = '/api/save-sql') {
        this.endpointUrl = endpointUrl;
    }

    /**
     * Wysyła żądanie do lokalnego serwisu zapisu pliku SQL.
     * 
     * @param fileName Nazwa pliku docelowego (np. 'users.sql').
     * @param sqlContent Treść skryptu SQL do zapisu.
     * @returns Promise zwracający ścieżkę lub komunikat o pomyślnym zapisie zwrócony przez serwer.
     */
    public async saveSqlFile(fileName: string, sqlContent: string): Promise<string> {
        if (!fileName || fileName.trim() === '') {
            throw new Error('Nazwa pliku nie może być pusta.');
        }

        if (sqlContent === null || sqlContent === undefined) {
            throw new Error('Treść pliku SQL nie może być null lub undefined.');
        }

        try {
            const response = await fetch(this.endpointUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileName,
                    sqlContent,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const serverMessage = (errorData as { message?: string }).message || response.statusText;
                throw new Error(`Błąd serwera (${response.status}): ${serverMessage}`);
            }

            const result = (await response.json()) as { filePath?: string; message?: string };
            return result.filePath || result.message || `Plik ${fileName} został pomyślnie zapisany.`;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Nie udało się wysłać żądania zapisu pliku SQL: ${error.message}`);
            }
            throw new Error('Wystąpił nieznany błąd podczas komunikacji z serwerem zapisu plików.');
        }
    }
}
```

## Podsumowanie i weryfikacja (Faza 5, Krok 22)

### [SOLID CHECK]
- Single Responsibility Principle (SRP): Klasa ApiSqlFileRepository pełni wyłącznie rolę komunikatora z lokalnym endpointem API, delegując odpowiedzialność za faktyczny zapis pliku do serwera. Sama nie zajmuje się logiką zapisu ani strukturą plików.
- Open/Closed Principle (OCP): Klasa jest otwarta na rozszerzenia (np. zmiana endpointu lub dodanie dodatkowych nagłówków), ale zamknięta na modyfikacje wewnętrznej logiki zapisu, co pozwala na łatwe dostosowanie do różnych środowisk bez ingerencji w kod.
- Dependency Inversion Principle (DIP): Klasa zależy od abstrakcji (interfejsu ISqlFileRepository) i nie jest bezpośrednio powiązana z konkretną implementacją serwera, co ułatwia testowanie jednostkowe i integrację w różnych kontekstach aplikacji webowej.
- Interface Segregation Principle (ISP): Klasa implementuje tylko metody wymagane przez interfejs ISqlFileRepository, unikając nadmiarowych funkcji, które nie są potrzebne w kontekście zapisu plików SQL.
- Liskov Substitution Principle (LSP): Każda instancja ApiSqlFileRepository może być używana w miejscach, gdzie oczekiwany jest interfejs ISqlFileRepository, bez ryzyka naruszenia zachowania programu.
- Testowalność: Dzięki zastosowaniu interfejsu ISqlFileRepository, klasa ApiSqlFileRepository może być łatwo zastąpiona przez mocki lub stuby w testach jednostkowych, co umożliwia izolowane testowanie logiki biznesowej bez konieczności faktycznego wysyłania żądań HTTP.
- Bezpieczeństwo: Klasa implementuje podstawowe walidacje wejściowe (sprawdzenie pustej nazwy pliku i null/undefined treści), co minimalizuje ryzyko błędów w komunikacji z serwerem oraz potencjalnych ataków typu injection.

### [INTERFACE SUMMARY]
- `saveSqlFile(fileName: string, sqlContent: string): Promise<string>`:
  - Wysyła żądanie HTTP POST do lokalnego endpointu API w celu zapisania pliku SQL.
  - Parametry:
    - `fileName`: Nazwa pliku docelowego (np. 'users.sql').
    - `sqlContent`: Treść skryptu SQL do zapisu.
  - Zwraca Promise, który rozwiązuje się do ścieżki lub komunikatu o pomyślnym zapisie zwróconego przez serwer. W przypadku błędu, Promise zostaje odrzucony z odpowiednim komunikatem błędu.
  - Obsługuje błędy serwera oraz nieprawidłowe odpowiedzi, zapewniając bezpieczną komunikację z lokalnym endpointem API.
  
### [REFACTORING ALERT]
- Zastosowano pełne rozdzielenie odpowiedzialności: ApiSqlFileRepository zarządza wyłącznie komunikacją z lokalnym endpointem API, pozostawiając logikę generowania SQL i zarządzania plikami w innych komponentach systemu, co zapewnia modularność i łatwość testowania.
- Kod w pełni zachowuje rygorystyczne typowanie TypeScript (strict: true, bez użycia typu any), zapewniając bezpieczeństwo typów i przewidywalność działania w środowisku przeglądarki.
