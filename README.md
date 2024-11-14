# AQ54 project Frontend

Cette documentation fourni les étapes à suivre pour deployer le projet complet ou le frontend uniquement dans un environnement local.

Il est déjà deployé et vous pouvez y accéder via l'url suivante: (http://srv507834.hstgr.cloud:8080/)

## deploiement complet du projet avec docker compose 

renommer le fichier compose.example.yml en compose.yml et lancer la commande

NB: la base de donnée existe déja dans le fichier compose donc il s'uffit juste de créer le fichier d'environnement et d'executer la commande ci-dessous.

```js
docker compose up -d
```

À la racine du projet creons un fichier .env et rajoutons les variables ci-dessous avec leurs valeurs

```js
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=database
DB_USERNAME=username
DB_PASSWORD=password
DB_URL=postgresql://username:password@localhost:5432/database

# Token
JWT_SECRET=AZERTYUIOPQSDFGHJKLMWXCVBNAZERTYUIOPQSDFGHJKLM

# Admin credentials  
ADMIN_EMAIL='admin@example.com'
ADMIN_PASSWORD='votremotdepasse'
ADMIN_USERNAME='Admin'

NB: le compte admin sera crée automatiquement au démarrage du projet et les accès ci-dessus pourront être utilisé comme credential pour se connecter

# Allow Origin 
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## deploiement du frontend uniquement

## I - Deployer dans un environnement local

## etape 1 : cloner le repo

```js
git clone https://github.com/mrseck/AQ54-fe.git
```

## etape 2 : installer les dependances du projet

aller dans le repertoire du projet

```js
cd AQ54-fe
```

puis lancer

```js
npm i ou npm install
```

## etape 3 : lancer le projet

```js
npm run dev
```

puis lancer dans un navigateur l'url

```js
http://localhost:5173
```

## II - Deployer avec docker

## etape 1 : cloner le repo

```js
git clone https://github.com/mrseck/AQ54-fe.git
```

## etape 2 : build l'image puis l'executer

aller dans le repertoire du projet

```js
cd AQ54-fe
```

puis construire l'image

```js
docker build -t aq54-fe .
```

enfin executer l'image

```js
docker run -p 8080:80 aq54-fe
```

puis lancer dans un navigateur l'url

```js
http://localhost:8080
```
