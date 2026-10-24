@echo off
setlocal
echo ========================================================
echo   Zatrzymywanie srodowiska lokalnego MatGraph
echo ========================================================

set "PATH=%PATH%;C:\Users\macie\AppData\Local\Programs\DockerDesktop\resources\bin;C:\Program Files\Docker\Docker\resources\bin"

echo Zatrzymywanie kontenerow Docker (backend i baza danych)...
cd /d "%~dp0backend"
docker compose down

echo.
echo ========================================================
echo   Uslugi zostaly pomyslnie zatrzymane!
echo ========================================================
pause