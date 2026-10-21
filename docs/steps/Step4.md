# Krok 4 (public/resources/.gitkeep): Utworzenie struktury katalogów statycznych i docelowego miejsca zapisu wygenerowanych skryptów .sql.

## PowerShell 
Skrypt PowerShell do utworzenia kompletnej struktury katalogów dla projektu `csv-to-sql-converter`:


```powershell
$directories = @(
"csv-to-sql-converter/public/resources",
"csv-to-sql-converter/src/domain/enums",
"csv-to-sql-converter/src/domain/models",
"csv-to-sql-converter/src/domain/contracts",
"csv-to-sql-converter/src/domain/services",
"csv-to-sql-converter/src/infrastructure",
"csv-to-sql-converter/src/application",
"csv-to-sql-converter/src/presentation/styles",
"csv-to-sql-converter/src/presentation/contracts",
"csv-to-sql-converter/src/presentation/components",
"csv-to-sql-converter/src/presentation/controllers"
)

foreach ($dir in $directories) {
New-Item -ItemType Directory -Force -Path $dir | Out-Null
}
```

## Utwórz .gitkeep w katalogu resources

```powershell
New-Item -ItemType File -Force -Path "csv-to-sql-converter/public/resources/.gitkeep" | Out-Null
Write-Host "Directory structure successfully created!" -ForegroundColor Green
```

Polecenie powyższego skryptu PowerShell tworzy kompletną strukturę katalogów dla projektu `csv-to-sql-converter`, w tym katalog docelowy `../../public/resources`, w którym zostanie zapisany wygenerowany plik `.sql`. Dodatkowo, w katalogu `resources` tworzony jest plik `.gitkeep`, aby umożliwić śledzenie pustego katalogu w systemie kontroli wersji Git.
To kończy etap tworzenia struktury katalogów i przygotowania środowiska do dalszej implementacji aplikacji.