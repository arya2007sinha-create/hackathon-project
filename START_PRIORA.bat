@echo off
title PRIORA Enterprise Work Orchestration Platform
echo ========================================================
echo   Launching PRIORA Enterprise Work Orchestration Platform
echo   Serving at: http://localhost:5000
echo ========================================================
echo.
echo Starting unified server...
start http://localhost:5000
npm run start
pause
