/// <reference types="vite/client" />

/**
 * @file main.ts
 * @description Punkt wejścia aplikacji (Composition Root).
 * Inicjalizuje wszystkie zależności domenowe, infrastrukturalne, aplikacyjne i prezentacyjne,
 * spinając je w pełni funkcjonalny system konwersji CSV do SQL z walidacją danych.
 */

import { ConversionUseCase } from './application/ConversionUseCase';
import { SchemaOverrideService } from './application/SchemaOverrideService';
import { NameNormalizationService } from './domain/services/NameNormalizationService';
import { CsvParser } from './domain/services/CsvParser';
import { TypeInferenceEngine } from './domain/services/TypeInferenceEngine';
import { CsvTokenizer } from './domain/services/CsvTokenizer';
import { TypeMatchers } from './domain/services/TypeMatchers';
import { DataValidationService } from './domain/services/DataValidationService';
import { SqlValueEscaper } from './domain/services/SqlValueEscaper';
import { SqlDdlBuilder } from './domain/services/SqlDdlBuilder';
import { SqlDmlBuilder } from './domain/services/SqlDmlBuilder';
import { SqlGenerator } from './domain/services/SqlGenerator';
import { SeparatorDetector } from './domain/services/SeparatorDetector';
import { ApiSqlFileRepository } from './infrastructure/ApiSqlFileRepository';
import { BrowserSqlFileRepository } from './infrastructure/BrowserSqlFileRepository';
import { FileUploadView } from './presentation/components/FileUploadView';
import { SchemaEditorView } from './presentation/components/SchemaEditorView';
import { StatusNotificationView } from './presentation/components/StatusNotificationView';
import { AppController } from './presentation/controllers/AppController';

/**
 * Punkt wejścia aplikacji (Composition Root / DI Container).
 * Inicjalizuje kontener Dependency Injection oraz spina wszystkie warstwy aplikacji
 * w następującej kolejności:
 * 1. Serwisy pomocnicze (normalizacja, detekcja separatora)
 * 2. Zależności domenowe (parsowanie, wnioskowanie typów, generowanie SQL, walidacja)
 * 3. Infrastruktura (zapis plików)
 * 4. Warstwa aplikacji (use cases)
 * 5. Warstwa prezentacji (widoki i kontroler)
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        // ───────────────────────────────────────────────────────────────
        // 0. Inicjalizacja bezstanowych serwisów pomocniczych
        // ───────────────────────────────────────────────────────────────
        const normalizationService = new NameNormalizationService();
        const separatorDetector = new SeparatorDetector();

        // ───────────────────────────────────────────────────────────────
        // 1. Inicjalizacja zależności domenowych (Clean Architecture)
        // ───────────────────────────────────────────────────────────────

        // Parsowanie CSV
        const csvTokenizer = new CsvTokenizer();
        const csvParser = new CsvParser(csvTokenizer);

        // Wnioskowanie typów danych
        const typeMatchers = new TypeMatchers();
        const typeInferenceEngine = new TypeInferenceEngine(typeMatchers, normalizationService);

        // Walidacja danych (← NOWE)
        const dataValidator = new DataValidationService(typeMatchers);

        // Generowanie SQL
        const sqlValueEscaper = new SqlValueEscaper();
        const sqlDdlBuilder = new SqlDdlBuilder();
        const sqlDmlBuilder = new SqlDmlBuilder(sqlValueEscaper);
        const sqlGenerator = new SqlGenerator(sqlDdlBuilder, sqlDmlBuilder);

        // ───────────────────────────────────────────────────────────────
        // 2. Inicjalizacja infrastruktury (I/O i zapis plików)
        // ───────────────────────────────────────────────────────────────
        const sqlFileRepository = import.meta.env.DEV
            ? new ApiSqlFileRepository('./api/save-sql')
            : new BrowserSqlFileRepository();

        // ───────────────────────────────────────────────────────────────
        // 3. Inicjalizacja serwisu aplikacji i przypadków użycia (Headless)
        // ───────────────────────────────────────────────────────────────
        const schemaOverrideService = new SchemaOverrideService(normalizationService);

        const conversionUseCase = new ConversionUseCase(
            csvParser,
            typeInferenceEngine,
            sqlGenerator,
            sqlFileRepository,
            schemaOverrideService,
            separatorDetector,
            dataValidator  // ← NOWE: Wstrzyknięcie walidatora
        );

        // ───────────────────────────────────────────────────────────────
        // 4. Inicjalizacja komponentów widoku prezentacji (DOM)
        // ───────────────────────────────────────────────────────────────
        const fileUploadView = new FileUploadView();
        const schemaEditorView = new SchemaEditorView();
        const statusNotificationView = new StatusNotificationView();

        // ───────────────────────────────────────────────────────────────
        // 5. Inicjalizacja głównego kontrolera aplikacji
        // ───────────────────────────────────────────────────────────────
        const appController = new AppController(
            conversionUseCase,
            fileUploadView,
            schemaEditorView,
            statusNotificationView
        );

        // ───────────────────────────────────────────────────────────────
        // 6. Debugowanie i eksport do okna przeglądarki
        // ───────────────────────────────────────────────────────────────

        // Przypisanie do obiektu window unika błędu TS6133 (zmienna nieużywana)
        // oraz umożliwia łatwe debugowanie w konsoli przeglądarki.
        (window as unknown as Record<string, unknown>).appController = appController;
        (window as unknown as Record<string, unknown>).conversionUseCase = conversionUseCase;

        console.log('[CSV to SQL Converter]: Aplikacja została pomyślnie zainicjalizowana.');
        console.log('[CSV to SQL Converter]: Walidacja danych jest aktywna.');
        console.log('[CSV to SQL Converter]: Dostępne obiekty: window.appController, window.conversionUseCase');
    } catch (error: unknown) {
        const message = error instanceof Error
            ? error.message
            : 'Nieznany błąd podczas inicjalizacji aplikacji.';

        console.error(`[CRITICAL ERROR in main.ts]: ${message}`);

        // Wyświetlenie błędu krytycznego w interfejsie użytkownika
        const notificationRegion = document.getElementById('status-notification-region');
        if (notificationRegion) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'notification notification-error';
            errorDiv.textContent = `Błąd krytyczny uruchomienia aplikacji: ${message}`;
            notificationRegion.appendChild(errorDiv);
        }
    }
});