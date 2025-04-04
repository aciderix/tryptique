@echo off
echo Lancement du Createur de Triptyques Web...
echo.

REM Vérifier si Python est installé
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Demarrage du serveur web avec Python...
    start http://localhost:8000
    cd "%~dp0"
    python -m http.server
    goto :end
)

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Demarrage du serveur web avec Node.js...
    cd "%~dp0"
    npx serve
    goto :end
)

REM Si ni Python ni Node.js n'est installé, ouvrir directement le fichier HTML
echo Aucun serveur web disponible. Ouverture directe du fichier HTML...
start "" "%~dp0index.html"

:end