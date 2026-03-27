@echo off
cd /d "%~dp0"
set REACT_NATIVE_PACKAGER_HOSTNAME=192.168.0.147
node node_modules\expo\bin\cli start --clear --port 8081
