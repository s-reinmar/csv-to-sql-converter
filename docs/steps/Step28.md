# Krok 28 (src/presentation/styles/theme-variables.css): Definicja zmiennych CSS (Custom Properties) realizujących paletę barw: głębokie czarno-granatowe tła (#0a0e17, #111827), ciemnoniebieskie panele (#1e293b) oraz jasnoniebieskie akcenty, obramowania i kontrolki (#38bdf8, #0ea5e9).

Definicja zmiennych CSS (Custom Properties) realizujących paletę barw: głębokie czarno-granatowe tła (#0a0e17, #111827), ciemnoniebieskie panele (#1e293b) oraz jasnoniebieskie akcenty, obramowania i kontrolki (#38bdf8, #0ea5e9).

src/presentation/styles/theme-variables.css
```css
/**
 * Zmienne CSS motywu (Custom Properties)
 * Paleta barw: Głębokie czarno-granatowe tła, ciemnoniebieskie panele oraz jasnoniebieskie akcenty.
 */
:root {
    /* Główna paleta tła */
    --bg-primary: #0a0e17;
    --bg-secondary: #111827;
    --bg-panel: #1e293b;
    --bg-panel-hover: #334155;
    --bg-input: #0f172a;

    /* Akcenty i kontrolki (jasny niebieski) */
    --accent-primary: #38bdf8;
    --accent-hover: #0ea5e9;
    --accent-light: rgba(56, 189, 248, 0.12);
    --accent-glow: rgba(56, 189, 248, 0.25);

    /* Obramowania i separatory */
    --border-color: #334155;
    --border-focus: #38bdf8;

    /* Kolory tekstu */
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --text-on-accent: #0a0e17;

    /* Statusy i powiadomienia */
    --success-bg: rgba(34, 197, 94, 0.15);
    --success-color: #22c55e;
    --error-bg: rgba(239, 68, 68, 0.15);
    --error-color: #ef4444;
    --warning-bg: rgba(245, 158, 11, 0.15);
    --warning-color: #f59e0b;

    /* Zmienne globalne layoutu */
    --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    --border-radius: 8px;
    --border-radius-sm: 4px;
    --transition-speed: 0.2s ease;
}
```

## Podsumowanie i weryfikacja (Faza 8, Krok 28):

### [SOLID CHECK]:
Zdefiniowane zmienne CSS są zgodne z zasadą pojedynczej odpowiedzialności (SRP), ponieważ koncentrują się wyłącznie na deklaracji palety barw i stylów wizualnych aplikacji, bez ingerencji w logikę biznesową czy strukturę danych. Każda zmienna odpowiada za konkretny aspekt wizualny, co ułatwia utrzymanie i modyfikację motywu kolorystycznego w przyszłości.

### [INTERFACE SUMMARY]:
- Zmienne CSS (Custom Properties) definiują spójny zestaw kolorów, tła, akcentów, obramowań i tekstu, które mogą być używane w całej aplikacji. Dzięki temu możliwe jest łatwe dostosowanie wyglądu interfejsu użytkownika poprzez zmianę wartości zmiennych w jednym miejscu, co zwiększa elastyczność i spójność wizualną aplikacji.

### [RESPONSIVE DESIGN CHECK]:
Zdefiniowane zmienne CSS mogą być używane w połączeniu z mediami zapytaniowymi (media queries) i innymi technikami responsywnego projektowania, co pozwala na dynamiczne dostosowywanie kolorów i stylów w zależności od rozdzielczości ekranu, trybu jasnego/ciemnego oraz preferencji użytkownika. Dzięki temu aplikacja może zachować spójny wygląd i czytelność na różnych urządzeniach i w różnych warunkach oświetleniowych, co jest zgodne z zasadami projektowania responsywnego (RWD) i dostępności (WCAG).