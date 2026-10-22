# Krok 21 (src/infrastructure/BrowserFileReader.ts): Adapter opakowujący API FileReader w bezpieczny, otypowany Promise<string> wczytujący zawartość pliku CSV.

Adapter `BrowserFileReader` opakowuje natywne API `FileReader` w bezpieczny, otypowany `Promise<string>`, umożliwiając asynchroniczne wczytanie zawartości pliku CSV w przeglądarce. Dzięki temu można łatwo obsłużyć wczytywanie plików w aplikacjach webowych, zapewniając czytelny interfejs i obsługę błędów.

src/infrastructure/BrowserFileReader.ts
```typescript
/**
 * Adapter opakowujący natywne API przeglądarki FileReader w bezpieczny, otypowany Promise<string>,
 * służący do odczytu zawartości plików tekstowych oraz CSV w warstwie infrastruktury.
 */
export class BrowserFileReader {
    /**
     * Wczytuje zawartość przekazanego pliku jako tekst.
     *
     * @param file Obiekt pliku (File) pobrany z elementu input[type="file"] lub operacji Drag & Drop.
     * @param encoding Kodowanie znaków (domyślnie 'utf-8').
     * @returns Promise zwracający treść pliku w formacie string.
     */
    public readFileAsText(file: File, encoding: string = 'utf-8'): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('Nie przekazano poprawnego pliku do odczytu.'));
                return;
            }

            const reader = new FileReader();

            reader.onload = (event: ProgressEvent<FileReader>) => {
                const result = event.target?.result;
                if (typeof result === 'string') {
                    resolve(result);
                } else {
                    reject(new Error('Wynik odczytu pliku nie jest tekstem.'));
                }
            };

            reader.onerror = () => {
                reject(new Error(`Wystąpił błąd podczas odczytu pliku: ${file.name}`));
            };

            reader.onabort = () => {
                reject(new Error(`Odczyt pliku został przerwany: ${file.name}`));
            };

            try {
                reader.readAsText(file, encoding);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    reject(error);
                } else {
                    reject(new Error('Nieznany błąd podczas uruchamiania odczytu pliku.'));
                }
            }
        });
    }
}
```

## Podsumowanie i weryfikacja (Faza 5, Krok 20)

#### [SOLID CHECK]:
- Single Responsibility Principle (SRP): Klasa BrowserFileReader pełni wyłącznie rolę adaptera do natywnego API FileReader, koncentrując się na asynchronicznym odczycie plików tekstowych i CSV w przeglądarce, bez mieszania logiki biznesowej czy prezentacyjnej.
- Dependency Inversion Principle (DIP): Klasa nie zależy od konkretnej implementacji FileReader, lecz opakowuje jego funkcjonalność w otypowany interfejs Promise, co ułatwia testowanie jednostkowe i integrację w różnych kontekstach aplikacji webowej.

### [INTERFACE SUMMARY]:
- `BrowserFileReader`: Klasa implementująca metodę `readFileAsText(file: File, encoding?: string): Promise<string>`, umożliwiającą asynchroniczny odczyt zawartości plików tekstowych i CSV w przeglądarce, z obsługą błędów i kodowania znaków.

### [REFACTORING ALERT]:
- Zastosowano pełne rozdzielenie odpowiedzialności: BrowserFileReader zarządza wyłącznie odczytem plików w przeglądarce, pozostawiając logikę parsowania CSV i generowania SQL w innych komponentach systemu, co zapewnia modularność i łatwość testowania.
- Kod w pełni zachowuje rygorystyczne typowanie TypeScript (strict: true, bez użycia typu any), zapewniając bezpieczeństwo typów i przewidywalność działania w środowisku przeglądarki.