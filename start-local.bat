@echo off
setlocal
title MatGraph - Srodowisko Lokalne

echo ========================================================
echo   Uruchamianie srodowiska lokalnego MatGraph
echo ========================================================
echo.

set "PATH=%PATH%;C:\Users\macie\AppData\Local\Programs\DockerDesktop\resources\bin;C:\Program Files\Docker\Docker\resources\bin"

echo [1/3] Sprawdzanie silnika Docker...
docker ps >nul 2>&1
if %ERRORLEVEL% equ 0 goto docker_ready

echo.
echo [INFO] Docker Desktop nie jest jeszcze aktywny.
echo Proba uruchomienia aplikacji Docker Desktop...

if exist "C:\Users\macie\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe" (
    start "" "C:\Users\macie\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe"
) else if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
)

echo.
echo Czekam na zaladowanie silnika Docker...
echo (Jezeli to pierwsze uruchomienie, moze to potrwac 30-45 sekund)

set attempts=0
:wait_docker_loop
ping 127.0.0.1 -n 4 >nul
docker ps >nul 2>&1
if %ERRORLEVEL% equ 0 goto docker_ready

set /a attempts+=1
echo   ...oczekiwanie na Docker (proba %attempts%/15)...
if %attempts% lss 15 goto wait_docker_loop

echo.
echo ========================================================
echo [UWAGA] Docker Desktop nie zdazyl wystartowac.
echo Otworz program Docker Desktop recznie z menu Start.
echo Gdy ikona wieloryba bedzie zielona, uruchom ten skrypt ponownie.
echo ========================================================
pause
exit /b 1

:docker_ready
echo Silnik Docker jest gotowy!

echo.
echo [2/3] Uruchamianie kontenerow bazy danych i backendu...
cd /d "%~dp0backend"
docker compose up -d
if %ERRORLEVEL% neq 0 (
    echo.
    echo [BLAD] Nie udalo sie uruchomic kontenerow bazy/backendu.
    pause
    exit /b 1
)

echo.
echo Czekam 3 sekundy na gotowosc API...
ping 127.0.0.1 -n 4 >nul

echo.
echo [3/3] Uruchamianie frontendu (Next.js)...
cd /d "%~dp0frontend"

start http://localhost:3000

echo.
echo ========================================================
echo   Wszystko gotowe!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo.
echo   Aby zakonczyc prace, zamknij to okno lub wcisnij Ctrl + C.
echo ========================================================
echo.
call npm run dev
if %ERRORLEVEL% neq 0 (
    echo.
    echo [BLAD] Aplikacja frontendu zakonczyla dzialanie z bledem.
    pause
)