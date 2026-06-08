@echo off
setlocal enabledelayedexpansion

set "basedir=C:\Users\hp\Documents\ONCOST WEBSITE"

REM Create app subdirectories
mkdir "!basedir!\src\app\shop" 2>nul
mkdir "!basedir!\src\app\collections" 2>nul
mkdir "!basedir!\src\app\signup" 2>nul
mkdir "!basedir!\src\app\login" 2>nul
mkdir "!basedir!\src\app\forgot-password" 2>nul
mkdir "!basedir!\src\app\contact" 2>nul
mkdir "!basedir!\src\app\account" 2>nul
mkdir "!basedir!\src\app\bulk-orders" 2>nul
mkdir "!basedir!\src\app\about" 2>nul
mkdir "!basedir!\src\app\privacy" 2>nul
mkdir "!basedir!\src\app\terms" 2>nul
mkdir "!basedir!\src\app\services" 2>nul
mkdir "!basedir!\src\app\careers" 2>nul

REM Create pages/api directory
mkdir "!basedir!\pages\api" 2>nul

echo All directories created successfully!
