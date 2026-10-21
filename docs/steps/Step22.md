# Krok 22 (src/infrastructure/NodeSqlFileWriter.ts): Moduł serwerowy zapisujący przesłaną treść bezpośrednio do public/resources/<nazwa_pliku>.sql przy użyciu modułu fs/promises.

Moduł serwerowy `NodeSqlFileWriter` umożliwia zapisanie przesłanej treści SQL bezpośrednio do pliku w katalogu `public/resources/`, korzystając z modułu `fs/promises` w Node.js. Dzięki temu można łatwo generować i przechowywać skrypty SQL na serwerze, zapewniając asynchroniczny zapis plików oraz obsługę błędów.

src/infrastructure/NodeSqlFileWriter.ts
```typescript
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Serwis infrastrukturalny odpowiedzialny za trwały zapis wygenerowanego kodu SQL
 * bezpośrednio do pliku w katalogu public/resources/ przy użyciu asynchronicznego API fs/promises.
 */
export class NodeSqlFileWriter {
    private readonly targetDirectory: string;

    /**
     * @param targetDirectory Docelowy katalog zapisu (domyślnie 'public/resources').
     */
    constructor(targetDirectory: string = 'public/resources') {
        this.targetDirectory = targetDirectory;
    }

    /**
     * Zapisuje przesłaną treść SQL do pliku na dysku w katalogu docelowym.
     * 
     * @param fileName Nazwa pliku docelowego (np. 'users.sql').
     * @param sqlContent Treść skryptu SQL do zapisu.
     * @returns Promise zwracający pełną, znormalizowaną ścieżkę do zapisanego pliku.
     */
    public async saveSqlFile(fileName: string, sqlContent: string): Promise<string> {
        if (!fileName || fileName.trim() === '') {
            throw new Error('Nazwa pliku nie może być pusta.');
        }

        if (sqlContent === null || sqlContent === undefined) {
            throw new Error('Treść pliku SQL nie może być null lub undefined.');
        }

        // Zabezpieczenie przed atakami typu Path Traversal (wyciągnięcie samej nazwy pliku)
        const sanitizedFileName = path.basename(fileName);
        const fullPath = path.resolve(process.cwd(), this.targetDirectory, sanitizedFileName);

        try {
            // Upewnienie się, że katalog docelowy istnieje (rekurencyjnie)
            await fs.mkdir(path.dirname(fullPath), { recursive: true });

            // Zapis pliku tekstowego z kodowaniem UTF-8
            await fs.writeFile(fullPath, sqlContent, 'utf-8');

            return fullPath;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd zapisu pliku.';
            throw new Error(`Nie udało się zapisać pliku SQL pod ścieżką ${fullPath}: ${errorMessage}`);
        }
    }
}
```

## Poprawa błędów TypeScript związanych z modułami Node.js

Błędy które powstały w tym etapie, wynikają z tego, że środowisko TypeScript nie rozpoznaje wbudowanych modułów Node.js (fs/promises, path, process), ponieważ w projekcie brakuje zainstalowanych typów dla Node (@types/node) lub nie są one zdefiniowane w pliku konfiguracyjnym tsconfig.json.
Rozwiązaniem jest zainstalowanie w Terminalu (w katalogu głównym projektu, Terminal z IDE).

## Krok 1: Instalacja typów Node.js

```powershell
npm install --save-dev @types/node
```

## Krok 2: Konfiguracja pliku tsconfig.json

Należy zaktualizować, plik tsconfig.json (w głównej katalogu projektu) tak aby posiadał w sekcji compilerOptions odpowiedni wpis types lub lib, który uwzględnia Node.js.
Otwórz tsconfig.json i dodaj lub upewnij się, że masz następującą konfigurację:

```editorconfig
{
"compilerOptions": {
"target": "ESNext",
"module": "ESNext",
"moduleResolution": "bundler",
"strict": true,
"noImplicitAny": true,
"strictNullChecks": true,
"noUnusedLocals": true,
"skipLibCheck": true,
"types": ["node"]
}
}
```

## Podsumowanie i weryfikacja (Faza 4, Krok 22)

### [SOLID CHECK]
- Single Responsibility Principle (SRP): Klasa NodeSqlFileWriter zajmuje się wyłącznie zapisem treści SQL do pliku w katalogu public/resources/, bez mieszania logiki biznesowej czy prezentacyjnej.
- Dependency Injection & DIP: Klasa przyjmuje w konstruktorze opcjonalny parametr targetDirectory, co pozwala na łatwe testowanie i zmianę katalogu docelowego bez modyfikacji kodu klasy.
- Open/Closed Principle (OCP): Dodanie nowych funkcjonalności związanych z zapisem plików (np. logowanie, walidacja nazwy pliku) można zrealizować poprzez rozszerzenie klasy lub dekoratory, bez naruszania istniejącej logiki zapisu plików.

### [INTERFACE SUMMARY]
- `NodeSqlFileWriter`: Klasa implementująca metodę `saveSqlFile(fileName: string, sqlContent: string): Promise<string>`, umożliwiającą asynchroniczny zapis treści SQL do pliku w katalogu public/resources/, z obsługą błędów i zabezpieczeniem przed atakami typu Path Traversal.

### [REFACTORING ALERT]
- Zastosowano pełne rozdzielenie odpowiedzialności: NodeSqlFileWriter zarządza wyłącznie zapisem plików SQL na serwerze, pozostawiając logikę generowania SQL w innych komponentach systemu, co zapewnia modularność i łatwość testowania.
- Kod w pełni zachowuje rygorystyczne typowanie TypeScript (strict: true, bez użycia typu any), zapewniając bezpieczeństwo typów i przewidywalność działania w środowisku Node.js.