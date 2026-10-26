/**
 * Adapter opakowujący natywne API przeglądarki FileReader w bezpieczny, otypowany Promise<string>.
 */
export class BrowserFileReader {
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