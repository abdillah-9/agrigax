#!/bin/bash

# phase 1 - prepare git and pull the project/app
mkdir ~/apps
chmod 700
git init
git remote add origin https://gut-hub/abdillah-rajabu/agigax
git pull origin main

# phase 2 - now we arlready have the app in our server, what comes next is tomake it executable
cd ~/apps
rm -r agrigax/agrigax_backend_fast/node_modules
rm agrigax/agrigax_backend_fast/package-lock.json
cd agrigax
chmod 700
npm install

# phase 3 - start server using pm2
pm2 restart --name agrigax --start || pm2 start --name agrigax --start