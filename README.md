# One Dot To Rule Them All
![dot](https://user-images.githubusercontent.com/59053870/77830576-514bc100-7121-11ea-829d-28308c5d86a0.png)
#### A free forall multiplayer game socket IO to connect with other players. Designed to be accessed via our social gaming app:
https://github.com/Selerski/vapour-frontend

Inspiratation was taken from the popular game Agario.

Direct link without names or images:
https://db-game1.herokuapp.com/

## Installation

run `npm install` to install dependecies and create a .env file in the root directory with the following properties:  
DB_USER = <insert user>  
DB_PASS = <inser password>  
Please note, the app is designed to connect to the social gaming database which contains player information.  

## Features
* Free for all game with multiple players in the same instance
* Use the mouse to move your character and collect food to gain mass and ammo
* The size of the map will scale down as your character gets bigger ensuring your character remains the same relative size
* Shoot other players to reduce their size 
* Consume players with a lower mass
* When your size gets too small, you lose. When you are consumed by another player, you lose
* Names and player images are fetched from the social gaming app database


## Built With
* Canvas and p5 library
* Socket IO
* Express Server
* Mongo DB
