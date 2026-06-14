@echo off
echo Uruchamianie serwerow backendowych...

:: Przejscie do folderu ze skryptem (DB_manager)
cd /d "%~dp0"

:: Uruchomienie backendu main_panel w osobnym oknie
start "Main Panel Backend (Port 5000)" cmd /k "python main_panel_backend.py"

:: Uruchomienie backendu task_generator w osobnym oknie
start "Task Generator Backend (Port 5001)" cmd /k "cd task_generator && python task_generator_backend.py"

echo Gotowe! Serwery zostaly uruchomione w osobnych oknach.
echo Mozesz zamknac to okno.
