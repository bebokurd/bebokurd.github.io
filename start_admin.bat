@echo off
title Cydia Elite Admin Server
echo Starting Cydia Elite Admin Dashboard Server...

:: Open the browser to the admin page
start http://localhost:3000/admin/

:: Start the Node.js server
node server.js

:: Keep the window open if the server crashes
pause
