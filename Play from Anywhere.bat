@echo off
REM Golden Sun: play from anywhere - starts the server and a Cloudflare tunnel.
REM Open the https://...trycloudflare.com address this window prints on your phone.
REM The address is new every time you run it, and it only works while this window is open.
cd /d "%~dp0"
python serve.py --tunnel
pause
