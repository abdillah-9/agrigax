#!/bin/bash

#prepare dir for the app
mkdir ~/apps
cd ~/apps
chmod 700 ~/apps

#fetch app from github
git init
git remote add origin https://github/Jumaa
git pull origin main

#Prepare app -part 01
chmod  700 ~/apps/agrigax
chmod  700 ~/apps/agrigax/agrigax_backend_fast
cd ~/apps/agrigax/backend
npm ci

#prepare app -part 02
#get env into my server USING GITHUB SECRETS
npx knex migrate:latest
pm2 restart agrigax_backend_fast || pm2 start npm --name agigax_backend_fast --start

