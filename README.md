# AQ54 project Frontend

Cette documentation fourni les étapes à suivre pour deployer le frontend dans un environnement local.

Il est déjà deployé et vous pouvez y accéder via l'url suivante: (http://srv507834.hstgr.cloud:8080/)

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
