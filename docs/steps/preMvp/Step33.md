# Krok 33 (src/presentation/components/StatusNotificationView.ts): Komponent wyświetlający podgląd wygenerowanego kodu SQL oraz komunikaty o pomyślnym zapisie pliku w public/resources/.

Komponent `StatusNotificationView` jest odpowiedzialny za wyświetlanie podglądu wygenerowanego kodu SQL oraz komunikatów o pomyślnym zapisie pliku w katalogu `../../../public/resources`. Umożliwia użytkownikowi przeglądanie wygenerowanych instrukcji SQL przed ich zapisaniem lub dalszym przetwarzaniem.

src/presentation/components/StatusNotificationView.ts
```typescript
import { IStatusNotificationView } from '../contracts/IViewComponents';
import { IConversionStateData } from '../../application/ConversionState';

/**
 * Komponent widoku odpowiedzialny za wyświetlanie podglądu wygenerowanego kodu SQL,
 * obsługę akcji zapisu pliku oraz prezentację powiadomień (sukces, błąd, ładowanie) w warstwie DOM.
 */
export class StatusNotificationView implements IStatusNotificationView {
    private previewSectionElement: HTMLElement;
    private sqlCodePreviewElement: HTMLElement;
    private saveSqlButton: HTMLButtonElement;
    private notificationRegion: HTMLElement;

    private saveFileClickedCallback?: (customFileName?: string) => void;

    constructor() {
        const previewSectionElement = document.getElementById('sql-preview-section') as HTMLElement;
        const sqlCodePreviewElement = document.getElementById('sql-code-preview') as HTMLElement;
        const saveSqlButton = document.getElementById('save-sql-btn') as HTMLButtonElement;
        const notificationRegion = document.getElementById('status-notification-region') as HTMLElement;

        if (!previewSectionElement || !sqlCodePreviewElement || !saveSqlButton || !notificationRegion) {
            throw new Error('Nie znaleziono wymaganych elementów DOM dla komponentu StatusNotificationView.');
        }

        this.previewSectionElement = previewSectionElement;
        this.sqlCodePreviewElement = sqlCodePreviewElement;
        this.saveSqlButton = saveSqlButton;
        this.notificationRegion = notificationRegion;

        this.bindEvents();
    }

    /**
     * Rejestruje nasłuchiwacz kliknięcia przycisku zapisu pliku .sql.
     */
    public onSaveFileClicked(callback: (customFileName?: string) => void): void {
        this.saveFileClickedCallback = callback;
    }

    /**
     * Renderuje lub aktualizuje podgląd kodu SQL oraz statusy na podstawie aktualnego stanu aplikacji.
     */
    public render(state: Readonly<IConversionStateData>): void {
        const generatedSql = state.generatedSql;
        const isLoading = state.isLoading;
        const errorMessage = state.errorMessage;
        const savedFilePath = state.savedFilePath;

        // 1. Zarządzanie widocznością sekcji podglądu SQL
        if (!generatedSql) {
            this.previewSectionElement.classList.add('hidden');
            this.sqlCodePreviewElement.textContent = '-- Tutaj pojawi się wygenerowany kod SQL...';
        } else {
            this.previewSectionElement.classList.remove('hidden');
            this.sqlCodePreviewElement.textContent = generatedSql;
        }

        // 2. Blokowanie przycisku zapisu podczas operacji asynchronicznej
        this.saveSqlButton.disabled = isLoading || !generatedSql;
        this.saveSqlButton.textContent = isLoading ? 'Zapisywanie...' : 'Zapisz plik .sql';

        // 3. Obsługa komunikatów o błędach ze stanu
        if (errorMessage) {
            this.showError(errorMessage);
        }

        // 4. Obsługa komunikatu o pomyślnym zapisie pliku
        if (savedFilePath) {
            this.showSuccess(`Plik został pomyślnie zapisany w lokalizacji: ${savedFilePath}`);
        }
    }

    /**
     * Wyświetla powiadomienie o sukcesie operacji w regionie powiadomień.
     */
    public showSuccess(message: string): void {
        this.addNotification(message, 'success');
    }

    /**
     * Wyświetla powiadomienie o błędzie w regionie powiadomień.
     */
    public showError(message: string): void {
        this.addNotification(message, 'error');
    }

    /**
     * Wiąże zdarzenie kliknięcia przycisku zapisu pliku SQL.
     */
    private bindEvents(): void {
        this.saveSqlButton.addEventListener('click', () => {
            if (this.saveFileClickedCallback) {
                // Możliwość pobrania nazwy pliku z inputu tabeli, jeśli istnieje
                const tableNameInput = document.getElementById('table-name-input') as HTMLInputElement;
                const customFileName = tableNameInput && tableNameInput.value 
                    ? `${tableNameInput.value.trim()}.sql` 
                    : undefined;

                this.saveFileClickedCallback(customFileName);
            }
        });
    }

    /**
     * Tworzy i wstrzykuje element powiadomienia do DOM z automatycznym czyszczeniem.
     */
    private addNotification(message: string, type: 'success' | 'error'): void {
        // Unikanie duplikatów identycznych komunikatów
        const existingNotifications = this.notificationRegion.querySelectorAll('.notification');
        for (const item of Array.from(existingNotifications)) {
            if (item.textContent?.includes(message)) {
                return;
            }
        }

        const notificationDiv = document.createElement('div');
        notificationDiv.className = `notification notification-${type}`;
        
        const textSpan = document.createElement('span');
        textSpan.textContent = message;
        notificationDiv.appendChild(textSpan);

        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.className = 'notification-close-btn';
        closeButton.style.background = 'transparent';
        closeButton.style.border = 'none';
        closeButton.style.color = 'inherit';
        closeButton.style.fontSize = '1.25rem';
        closeButton.style.cursor = 'pointer';
        closeButton.style.marginLeft = '1rem';

        closeButton.addEventListener('click', () => {
            notificationDiv.remove();
        });

        notificationDiv.appendChild(closeButton);
        this.notificationRegion.appendChild(notificationDiv);

        // Automatyczne ukrycie powiadomienia po 6 sekundach
        setTimeout(() => {
            if (notificationDiv.isConnected) {
                notificationDiv.remove();
            }
        }, 6000);
    }
}
```

## Podsumowanie i weryfikacja (Faza 8, Krok 33):

### [SOLID CHECK]:
- Komponent `StatusNotificationView` w pełni realizuje zasadę pojedynczej odpowiedzialności (SRP), koncentrując się wyłącznie na prezentacji podglądu kodu SQL i powiadomień w interfejsie użytkownika, bez ingerencji w logikę biznesową czy warstwę danych.

### [INTERFACE SUMMARY]:
- Implementuje interfejs `IStatusNotificationView`, który definiuje kontrakt dla komponentu widoku odpowiedzialnego za wyświetlanie podglądu SQL i powiadomień. Metody obejmują `render`, `showSuccess`, `showError` oraz rejestrację callbacku dla akcji zapisu pliku.

### [REFACTORING ALERT]:
- Kod komponentu został podzielony na metody pomocnicze (`bindEvents`, `addNotification`) w celu zachowania niskiej złożoności cyklomatycznej i ograniczenia liczby linii kodu w pojedynczej metodzie, zgodnie z założeniem 25–30 linii na metodę.
- Zastosowano mechanizm unikania duplikatów powiadomień, aby poprawić doświadczenie użytkownika i uniknąć nadmiernego zaśmiecania interfejsu.
- Wprowadzono automatyczne usuwanie powiadomień po określonym czasie (6 sekund), co poprawia czytelność interfejsu i eliminuje konieczność ręcznego zamykania powiadomień przez użytkownika.
- Zastosowano bezpieczne manipulacje DOM, w tym sprawdzanie istnienia elementów przed ich użyciem, co zwiększa odporność komponentu na błędy w przypadku nieoczekiwanych zmian w strukturze HTML.
- Zastosowano typowanie TypeScript dla wszystkich elementów DOM i callbacków, co zwiększa bezpieczeństwo typów i ułatwia refaktoryzację w przyszłości.
