## BDE Builder

Bienvenue dans le projet BDE Builder! Ce projet est un mono-repo en cours de création, conçu pour aider les associations étudiantes à organiser et gérer des événements comme des soirées. Il comporte une application mobile en React Native pour le front-end et un back-end en Express.js pour gérer les données.


BDE Builder permet aux associations étudiantes de :

    Organiser et gérer des soirées.
    Ajouter des photos d'événements.
    Éditer les profils des associations.

## Front-End
L'application mobile est développée avec React Native.
Nous utilisons firebase pour l'authentification et le storage des datas, ajoutez un projet firebase au .env


## Back-End
Le back-end utilise Express.js pour fournir des données de manière propre et efficace à l'application mobile.

## Installation

Clonez le repository :
```bash
git@github.com:jean-baptisteAZAN/BDE_builder.git
cd BDE_builder
````

## Completez le .env
`API_KEY`
`API_URL`
`AUTH_DOMAIN`
`PROJECT_ID`
`STORAGE_BUCKET`
`MESSAGING_SENDER_ID`
`APP_ID`
`MEASUREMENT_ID`

## Executez les commandes d'Installation
```bash
cd frontend/ && npm install && cd .. && cd backend/ && npm install
````

## Lancez le projet
```bash
cd frontend/ && npm start && cd .. && cd backend/ && npm start
````
