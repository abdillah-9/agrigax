#! /binbash/
set -e
#create directory apps if not available and git it permission 700
cd apps || mkdir apps && cd apps && chmod 700 .

#install the app from the github server
git branch -Main main
git pull orign main || git init && git remote add origin https://github/agrigax && git pull origin main

#enter in the app dir and achange its permission and node modules and migrations
cd ~/agrigax/agrigax_backend_fast
chmod 700 .
npm ci
# I will insert .env manually in the app in the server , for me it is safest compared to placing it in this file ie by using >> OR even pushing it in github --> what do you say???
npx knex migrate:latest

#now run the app using pm2
pm2 restart agrigax_backend_fast || pm2 npm --name agrigax_backend_fast --start 
