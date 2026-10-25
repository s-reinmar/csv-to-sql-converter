import { ConversionUseCase } from './application/ConversionUseCase';
import { SchemaOverrideService } from './application/SchemaOverrideService';
import { NameNormalizationService } from './domain/services/NameNormalizationService';
import { CsvParser } from './domain/services/CsvParser';
import { TypeInferenceEngine } from './domain/services/TypeInferenceEngine';
import { CsvTokenizer } from './domain/services/CsvTokenizer';
import { TypeMatchers } from './domain/services/TypeMatchers';
import { SqlValueEscaper } from './domain/services/SqlValueEscaper';
import { SqlDdlBuilder } from './domain/services/SqlDdlBuilder';
import { SqlDmlBuilder } from './domain/services/SqlDmlBuilder';
import { SqlGenerator } from './domain/services/SqlGenerator';
import { ApiSqlFileRepository } from './infrastructure/ApiSqlFileRepository';
import { FileUploadView } from './presentation/components/FileUploadView';
import { SchemaEditorView } from './presentation/components/SchemaEditorView';
import { StatusNotificationView } from './presentation/components/StatusNotificationView';
import { AppController } from './presentation/controllers/AppController';
import { SeparatorDetector } from './domain/services/SeparatorDetector';

/**
 * Punkt wejścia aplikacji (Composition Root).
 * Inicjalizuje kontener Dependency Injection oraz spina wszystkie warstwy aplikacji.
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        // 0. Inicjalizacja bezstanowych serwisów pomocniczych
        const normalizationService = new NameNormalizationService();
        const separatorDetector = new SeparatorDetector();

        // 1. Inicjalizacja zależności domenowych
        const csvTokenizer = new CsvTokenizer();
        const csvParser = new CsvParser(csvTokenizer);
        const typeMatchers = new TypeMatchers();
        const typeInferenceEngine = new TypeInferenceEngine(typeMatchers, normalizationService);

        const sqlValueEscaper = new SqlValueEscaper();
        const sqlDdlBuilder = new SqlDdlBuilder();
        const sqlDmlBuilder = new SqlDmlBuilder(sqlValueEscaper);
        const sqlGenerator = new SqlGenerator(sqlDdlBuilder, sqlDmlBuilder);

        // 2. Inicjalizacja infrastruktury
        const sqlFileRepository = new ApiSqlFileRepository('/api/save-sql');

        // 3. Inicjalizacja serwisu aplikacji i przypadków użycia
        const schemaOverrideService = new SchemaOverrideService(normalizationService);
        const conversionUseCase = new ConversionUseCase(
            csvParser,
            typeInferenceEngine,
            sqlGenerator,
            sqlFileRepository,
            schemaOverrideService,
            separatorDetector,
        );

        // 4. Inicjalizacja komponentów widoku prezentacji (DOM)
        const fileUploadView = new FileUploadView();
        const schemaEditorView = new SchemaEditorView();
        const statusNotificationView = new StatusNotificationView();

        // 5. Inicjalizacja głównego kontrolera aplikacji (Composition Root / DI container)
        const appController = new AppController(
            conversionUseCase,
            fileUploadView,
            schemaEditorView,
            statusNotificationView
        );

        // Przypisanie do obiektu window unika błędu TS6133 (zmienna nieużywana)
        // oraz umożliwia łatwe debugowanie w konsoli przeglądarki.
        (window as unknown as Record<string, unknown>).appController = appController;

        console.log('[CSV to SQL Converter]: Aplikacja została pomyślnie zainicjalizowana.');
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Nieznany błąd podczas inicjalizacji aplikacji.';
        console.error(`[CRITICAL ERROR in main.ts]: ${message}`);

        const notificationRegion = document.getElementById('status-notification-region');
        if (notificationRegion) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'notification notification-error';
            errorDiv.textContent = `Błąd krytyczny uruchomienia aplikacji: ${message}`;
            notificationRegion.appendChild(errorDiv);
        }
    }
});