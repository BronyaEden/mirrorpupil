@echo off
echo Starting File Social Platform with Docker...

echo Building and starting all services...
docker-compose up -d

echo Waiting for services to start...
timeout /t 10 /nobreak >nul

echo Checking service status...
docker-compose ps

echo.
echo Services started successfully!
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:5000/api
echo Admin Panel: http://localhost:3000/admin
echo.
echo To stop services, run: docker-compose down
echo To view logs, run: docker-compose logs -f
echo.