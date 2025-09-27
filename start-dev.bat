@echo off
echo Starting File Social Platform development environment...

echo Starting backend server...
cd backend
start "Backend Server" npm run dev

echo Starting frontend server...
cd ..\frontend
start "Frontend Server" npm run dev

echo.
echo Development servers started!
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:5000/api
echo Admin Panel: http://localhost:3000/admin
echo.
echo Press any key to exit...
pause >nul