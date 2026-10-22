# Krok 36 (public/resources/sample.csv): Przygotowanie testowego pliku wsadowego CSV zawierającego różnorodne typy danych (liczby całkowite, kwoty zmiennoprzecinkowe, wartości logiczne, daty oraz teksty ze znakami specjalnymi) w celu przetestowania pełnego cyklu konwersji i zapisu .sql.

public/resources/sample.csv
```csv
id,product_name,quantity,unit_price,is_active,created_date,description
1,"Laptop ""Pro"" 15"", Gaming Edition",5,4599.99,true,2025-01-15,"Wydajny laptop dla profesjonalistów, z systemem i gwarancją."
2,"Mysz bezprzewodowa, ergonomiczna",25,129.50,1,2025-02-10,"Akcesoria biurowe, kolor czarny/szary."
3,"Kabel HDMI 2.0 (2m)",100,45.00,yes,2025-03-01,"Wysokiej jakości przewód 4K @ 60Hz."
4,"Monitor LED 27",12,1299.00,FALSE,2025-03-05,"Zakrzywiony ekran, matryca IPS."
5,"Podkładka pod mysz RGB",50,59.90,0,2025-03-12,"Podświetlenie LED USB, antypoślizgowa."
6,"Klawiatura mechaniczna ""RGB""",NULL,349.99,TRUE,2025-03-20,"Przełączniki mechaniczne Blue, wersja PL."
```

## Podsumowanie i weryfikacja (Faza 9, Krok 36)

### [SOLID CHECK]:
- **Single Responsibility Principle (SRP)**: Plik CSV pełni wyłącznie rolę danych wejściowych do testów konwersji, nie zawiera logiki ani funkcji. Jego jedynym zadaniem jest dostarczenie różnorodnych przypadków testowych
- **Open/Closed Principle (OCP)**: Plik może być łatwo rozszerzony o dodatkowe wiersze lub kolumny bez modyfikacji istniejącej logiki konwersji, co pozwala na testowanie nowych scenariuszy.
- **Liskov Substitution Principle (LSP)**: Plik CSV może być używany w dowolnym kontekście, który oczekuje danych wejściowych w formacie CSV, bez konieczności zmiany kodu testującego.
- **Interface Segregation Principle (ISP)**: Plik CSV nie wymaga implementacji żadnych interfejsów ani metod, co pozwala na jego użycie w różnych kontekstach testowych bez narzucania dodatkowych zależności.
- **Dependency Inversion Principle (DIP)**: Plik CSV jest niezależny od implementacji logiki konwersji i może być używany jako źródło danych w różnych warstwach aplikacji, co pozwala na testowanie konwersji w izolacji od szczegółów implementacyjnych.

### [INTERFACE SUMMARY]:
- Plik CSV zawiera nagłówki kolumn: `id`, `product_name`, `quantity`, `unit_price`, `is_active`, `created_date`, `description`.
- Zawiera różnorodne typy danych: liczby całkowite, liczby zmiennoprzecinkowe, wartości logiczne, daty oraz teksty z cudzysłowami i znakami specjalnymi, co pozwala na kompleksowe testowanie konwersji do SQL.

### [REFACTORING ALERT]:
- Plik CSV został przygotowany w sposób umożliwiający łatwe dodawanie nowych wierszy i kolumn w celu testowania różnych scenariuszy konwersji. Wartości w pliku zostały dobrane tak, aby obejmowały typowe przypadki użycia, jak również edge cases, takie jak wartości NULL, cudzysłowy w tekście oraz różne formaty dat i liczb. Dzięki temu testy konwersji mogą być przeprowadzone w sposób kompleksowy, zapewniając wysoką jakość i niezawodność aplikacji.