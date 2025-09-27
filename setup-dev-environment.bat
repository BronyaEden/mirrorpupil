@echo off
echo Setting up development environment for File Social Platform...

echo Installing backend dependencies...
cd backend
npm install
echo Backend dependencies installed.

echo Installing frontend dependencies...
cd ..\frontend
npm install
echo Frontend dependencies installed.

echo.
echo Setup complete!
echo.
echo To run the application:
echo 1. Make sure MongoDB and Redis are running locally
echo 2. Update the .env files in backend and frontend directories with correct configurations
echo 3. Run the backend: cd backend ^&^& npm run dev
echo 4. Run the frontend: cd frontend ^&^& npm run dev
echo.
echo For Docker-based setup (recommended):
echo 1. Make sure Docker and Docker Compose are installed
echo 2. Run: docker-compose up -d
echo.