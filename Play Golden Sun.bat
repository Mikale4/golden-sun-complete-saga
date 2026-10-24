@echo off
REM Golden Sun: The Complete Saga - double-click to play.
REM Starts the local server (needed for music) and opens the title screen. Phones on the same Wi-Fi can use
REM the "On this network" address this window prints.
cd /d "%~dp0"
python serve.py --open
pause
