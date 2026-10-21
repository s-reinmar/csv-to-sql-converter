
# Krok 29 (src/presentation/styles/components.css): Stylizacja formularza, tabel edycji typów, list rozwijanych (<select>), przycisków akcji oraz bloku podglądu kodu SQL.

Stylizacja formularza, tabel edycji typów, list rozwijanych (<select>), przycisków akcji oraz bloku podglądu kodu SQL.

src/presentation/styles/components.css
```css
/**
 * Stylizacja Komponentów UI (components.css)
 * Spójny ciemny motyw z jasnoniebieskimi akcentami i czytelną typografią.
 */

/* Ogólne resetowanie i układy */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: var(--font-family);
    background-color: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.5;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.app-container {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 2rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    flex: 1;
}

/* Nagłówek aplikacji */
.app-header {
    text-align: center;
    margin-bottom: 0.5rem;
}

.app-header h1 {
    font-size: 2.25rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    letter-spacing: -0.025em;
}

.app-subtitle {
    color: var(--text-secondary);
    font-size: 1rem;
}

/* Karty i panele */
.card {
    background-color: var(--bg-panel);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: border-color var(--transition-speed);
}

.card:hover {
    border-color: var(--border-focus);
}

.card h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--accent-primary);
}

/* Ukrywanie komponentów (Headless State Binding) */
.hidden {
    display: none !important;
}

/* 1. Formularz wgrania pliku i strefa Drag & Drop */
.drop-zone {
    border: 2px dashed var(--border-color);
    border-radius: var(--border-radius);
    background-color: var(--bg-input);
    padding: 2.5rem 1.5rem;
    text-align: center;
    cursor: pointer;
    position: relative;
    transition: all var(--transition-speed);
}

.drop-zone:hover, .drop-zone.dragover {
    border-color: var(--accent-primary);
    background-color: var(--accent-light);
}

.file-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
}

.drop-zone-prompt {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    pointer-events: none;
}

.drop-zone-icon {
    font-size: 2.5rem;
}

.file-browse-link {
    color: var(--accent-primary);
    text-decoration: underline;
    cursor: pointer;
}

.file-browse-link:hover {
    color: var(--accent-hover);
}

.upload-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 1.5rem;
}

@media (max-width: 768px) {
    .upload-options {
        grid-template-columns: 1fr;
    }
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
}

.form-control {
    background-color: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-sm);
    color: var(--text-primary);
    padding: 0.625rem 0.875rem;
    font-size: 0.95rem;
    transition: border-color var(--transition-speed), box-shadow var(--transition-speed);
}

.form-control:focus {
    outline: none;
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px var(--accent-glow);
}

/* 2. Tabela edycji typów kolumn */
.table-responsive {
    width: 100%;
    overflow-x: auto;
}

.schema-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 0.9rem;
}

.schema-table th, .schema-table td {
    padding: 0.875rem 1rem;
    border-bottom: 1px solid var(--border-color);
}

.schema-table th {
    background-color: var(--bg-secondary);
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
}

.schema-table tbody tr {
    transition: background-color var(--transition-speed);
}

.schema-table tbody tr:hover {
    background-color: var(--bg-panel-hover);
}

/* 3. Podgląd SQL i przyciski */
.preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.625rem 1.25rem;
    font-size: 0.95rem;
    font-weight: 600;
    border-radius: var(--border-radius-sm);
    border: none;
    cursor: pointer;
    transition: background-color var(--transition-speed), transform 0.1s ease;
}

.btn:active {
    transform: scale(0.98);
}

.btn-primary {
    background-color: var(--accent-primary);
    color: var(--text-on-accent);
}

.btn-primary:hover {
    background-color: var(--accent-hover);
}

.code-preview-wrapper {
    background-color: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-sm);
    padding: 1rem;
    max-height: 400px;
    overflow-y: auto;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.875rem;
    color: var(--accent-primary);
}

/* 4. Panel powiadomień i stopka */
.notification-region {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.notification {
    padding: 1rem;
    border-radius: var(--border-radius-sm);
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.notification-success {
    background-color: var(--success-bg);
    color: var(--success-color);
    border: 1px solid rgba(34, 197, 94, 0.3);
}

.notification-error {
    background-color: var(--error-bg);
    color: var(--error-color);
    border: 1px solid rgba(239, 68, 68, 0.3);
}

.app-footer {
    text-align: center;
    color: var(--text-muted);
    font-size: 0.875rem;
    padding: 1rem 0;
    border-top: 1px solid var(--border-color);
    margin-top: auto;
}
```

### Podsumowanie i weryfikacja (Faza 7, Krok 29):

### [SOLID CHECK]:
Zdefiniowane style CSS są zgodne z zasadą pojedynczej odpowiedzialności (SRP), ponieważ koncentrują się wyłącznie na wizualnej prezentacji komponentów interfejsu użytkownika, bez ingerencji w logikę biznesową czy strukturę danych. Każda sekcja stylów odpowiada za konkretny aspekt wizualny, co ułatwia utrzymanie i modyfikację wyglądu aplikacji w przyszłości.

### [INTERFACE SUMMARY]:
- Zdefiniowane klasy CSS i zmienne (Custom Properties) tworzą spójny zestaw stylów dla komponentów interfejsu użytkownika, takich jak formularze, tabele, przyciski, panele powiadomień i stopka. Dzięki temu możliwe jest łatwe dostosowanie wyglądu interfejsu poprzez zmianę wartości zmiennych w jednym miejscu, co zwiększa elastyczność i spójność wizualną aplikacji.

### [RESPONSIVE DESIGN CHECK]:
Zdefiniowane style CSS mogą być używane w połączeniu z mediami zapytaniowymi (media queries) i innymi technikami responsywnego projektowania, co pozwala na dynamiczne dostosowywanie wyglądu komponentów interfejsu w zależności od rozdzielczości ekranu, trybu jasnego/ciemnego oraz preferencji użytkownika. Dzięki temu aplikacja może zachować spójny wygląd i czytelność na różnych urządzeniach i w różnych warunkach oświetleniowych, co jest zgodne z zasadami projektowania responsywnego (RWD) i dostępności (WCAG).