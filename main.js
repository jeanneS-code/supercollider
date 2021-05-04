
/*import Paddle from '/src/paddle'; //this line is disabled in VS so I have to put the class in here*/ 

const GAMESTATE = {

    PAUSED: 0,
    RUNNING: 1,
    MENU: 2,
    GAMEOVER: 3,
    NEWLEVEL: 4
};


class Game {
    constructor(gameWidth, gameHeight){

        this.gameWidth = gameWidth;

        this.gameHeight = gameHeight;

        this.gamestate = GAMESTATE.MENU;

        this.paddle = new Paddle(this); //this is the Game's own instance

        this.ball = new Ball(this);

        this.gameObjects = [];

        this.bricks = [];

        this.lives = 3;

        this.levels = [level1, level2]; //level1 & level2 are multidimensional arrays

        this.currentLevel = 0; //index

        new inputHandler(this.paddle, this);
		//about the above: looking on stack overflow it would seem that this sort of non-assignment of the object to a variable
		//is usually because there is some side effect that is desired. They give an example of creating a new Animation(some_element) and maybe you'll need //to keep hold of the Animation instance so you can call animation.stop()

     }

     start() {

        if(this.gamestate !== GAMESTATE.MENU && this.gamestate !== GAMESTATE.NEWLEVEL) return; //only the menu can trigger the start of the game

        this.bricks = buildLevel(this, this.levels[this.currentLevel]);

        this.ball.reset();


        this.gameObjects = [this.ball, this.paddle]; //this array can hold all our objects - just add them here as you create them & you can call those methods below on them
                                                               
        
        this.gamestate = GAMESTATE.RUNNING;
     }

     update(deltaTime){

        if(this.lives === 0) this.gamestate = GAMESTATE.GAMEOVER;

        if(this.gamestate === GAMESTATE.PAUSED || this.gamestate === GAMESTATE.MENU 
           || this.gamestate === GAMESTATE.GAMEOVER) return; //we won't update anything

        if(this.bricks.length === 0){

            this.currentLevel++;

            this.gamestate = GAMESTATE.NEWLEVEL;

            this.start();
        
        }

        //spread operator - this will spread the game objects and the bricks together into in one array
        [...this.gameObjects,...this.bricks].forEach((object) => object.update(deltaTime)); //is this recursion? I think it's a recursive call minus any actual recursion.

        this.bricks = this.bricks.filter(brick => !brick.markedForDeletion);

     }

     draw(ctx){

        [...this.gameObjects, ...this.bricks].forEach((object) => object.draw(ctx));

            if(this.gamestate == GAMESTATE.PAUSED){

            ctx.rect(0, 0, this.gameWidth, this.gameHeight);

            ctx.fillStyle = "rgba(0,0,0,0.5)";

            ctx.fill();

            ctx.font = "30px Arial";

            ctx.fillStyle = "white";

            ctx.textAlign = "center";

            ctx.fillText("Paused", this.gameWidth / 2, this.gameHeight / 2);

        }

        if(this.gamestate == GAMESTATE.MENU){

            ctx.rect(0, 0, this.gameWidth, this.gameHeight);

            ctx.fillStyle = "rgba(0,0,0,1)";

            ctx.fill();

            ctx.font = "30px Arial";

            ctx.fillStyle = "white";

            ctx.textAlign = "center";

            ctx.fillText("Press SPACEBAR to start:", this.gameWidth / 2, this.gameHeight / 2);

        }

        if(this.gamestate == GAMESTATE.GAMEOVER){

            ctx.rect(0, 0, this.gameWidth, this.gameHeight);

            ctx.fillStyle = "rgba(0,0,0,1)";

            ctx.fill();

            ctx.font = "30px Arial";

            ctx.fillStyle = "white";

            ctx.textAlign = "center";

            ctx.fillText("GAME OVER", this.gameWidth / 2, this.gameHeight / 2);
        }
     }

     togglePause(){
         //here we're introducing game states - is it paused, is it running, is it at the title screen, etc

         if(this.gamestate == GAMESTATE.PAUSED){

            this.gamestate = GAMESTATE.RUNNING; //if it's paused & they click the pause button it will unpause the game

         } else {

            this.gamestate == GAMESTATE.PAUSED

         }
      }
    }

class Paddle {

    constructor(game){
        
    this.gameWidth = game.gameWidth;
    this.width = 150;
    this.height = 30;

    this.maxSpeed = 7;
    this.speed = 0; //current speed

    this.position = {
                      x: game.gameWidth / 2 - this.width / 2, //we want to center it between 0 and 600 so we take the game width and divide by 2 which puts us at 300 but since the square is built from the top left corner we need to move it to the left by half of the width and that gives us our center position
                      y: game.gameHeight - this.height - 10 //the square is drawn from the top left corner.so if we want this ti be at the bottom of the screen but off the page by about 10 px so we need to take the game height(800) & move it up the height of the square which is 30 and subtract 10 t0 give it that little bit of buffer

    };

}

   moveLeft(){

      this.speed = -this.maxSpeed; //so it will be moving at negative 7 pxs per second

   }

   moveRight(){

       this.speed = this.maxSpeed;
   }

   stop(){

       this.speed = 0;
   }

   draw(ctx) {
       ctx.fillStyle = "green";
       ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update(deltaTime){ //how much time has passed since last updated

      this.position.x += this.speed; //so when we tell it to move left the speed becomes negative 7 and then when we update the x position gets moved a minus 7 amount

      if(this.position.x < 0) this.position.x = 0; //when it gets to far left edge of the screen it stops instead of going off the page

      if(this.position.x + this.width > this.gameWidth) this.position.x = this.gameWidth - this.width;
  }
}

//create a simple input handler to listen for a couple of key events for moving the 
//arrows left and right - these will be used to move the paddle left and right on the screen.

class inputHandler {

    constructor(paddle, game){
        document.addEventListener("keydown", (event) => {
            
            switch(event.keyCode){
                case 37:
                    paddle.moveLeft();
                    break;
                case 39:
                    paddle.moveRight();
                    break;
                case 27:      //escape keycode to pause the game
                    game.togglePause();
                    break;
                case 32:
                    game.start();
                    break;
            }
        });

        document.addEventListener("keyup", (event) => { //stopping the paddle
            
            switch(event.keyCode){
                case 37:
                    if(paddle.speed < 0) //if its travelling left
                    paddle.stop();
                    break;
                case 39:
                    if(paddle.speed > 0) //if travelling right
                    paddle.stop();
                    break; 
            }
        });
    }
}

class Ball { //we also want to make it so the ball isn't trapped above the bricks

     constructor(game){

        this.image = document.getElementById("img_ball");

        this.gameWidth = game.gameWidth;
        this.gameHeight = game.gameHeight;

        this.game = game; //game available for the ball to use & we can use the game in any of our other functions. See console.log example in the update funuction below

        this.size = 16;

        this.reset();  //this will reset the position & speed of the ball

     }

     reset(){

        this.position = {x: 10, y: 400};

        this.speed = { x: 4, y: -2};

     }
     

     draw(ctx){
        
        ctx.drawImage(this.image, this.position.x, this.position.y, this.size, this.size);
     }

     update(deltaTime){

        /*console.log(this.game.paddle.position.x); //we can log where the paddle is even though we're looking at the ball object*/

        this.position.x += this.speed.x;
        this.position.y += this.speed.y;
        
        //if the ball is hitting a wall on the left or right
        if(this.position.x + this.size > this.gameWidth || this.position.x < 0) {
            this.speed.x = -this.speed.x //reverse the speed on the x axis - this makes it bounce off the walls
        }

        //hits a wall on the top
        if(this.position.y < 0) {
            this.speed.y = -this.speed.y //reverse the speed on the y axis - this makes it bounce off the walls
        }

        //bottom of game
        if(this.position.y + this.size > this.gameHeight){

            this.game.lives--;

            this.reset(); //reset when we lose a life
        } 

        if(detectCollision(this, this.game.paddle)){
            this.speed.y = -this.speed.y; //reverse the speed
            this.position.y = this.game.paddle.position.y - this.size;
        }

     }
}

class Brick {
     
    constructor(game, position) {

        this.image = document.getElementById("img_brick");

        this.game = game; 

        this.position = position;

        this.width = 80;

        this.height = 24;

        this.markedForDeletion = false;

    }

    update() {

        if(detectCollision(this.game.ball, this)){

            this.game.ball.speed.y = -this.game.ball.speed.y //reverse the speed

            this.markedForDeletion = true;
        }

    }

    draw(ctx) {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);

    }
}

function buildLevel(game, level){

    let bricks = [];
    
    level.forEach((row, rowIndex) => { //you would use nested forEach like this if iterating over a multi-dimensional array so level is a 2D array.
       row.forEach((brick, brickIndex) => {
    
           if(brick === 1){ //in the const arrays near the bottom 0 & 1 are values(1 = display brick)
    
              let position = {
                  x: 80 * brickIndex,
                  y: 75 + 24 * rowIndex
              };

              bricks.push(new Brick(game,position));
           }
    
         });
    
       });
    
       return bricks;
    
    }

const level1 = [  //each array in the array is a row of bricks & 0 means a space
    [0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0]

   ];

const level2 = [
    [0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];




//this function just tells us if there is a collision and not what to do with it(true or false)
function detectCollision(ball, gameObject){

    let bottomOfBall = ball.position.y + ball.size;

    let topOfBall = ball.position.y;



    let topOfObject = gameObject.position.y;

    let leftSideOfObject = gameObject.position.x;

    let rightSideOfObject = gameObject.position.x + gameObject.width;

    let bottomOfObject = gameObject.position.y + gameObject.height; 

    if(bottomOfBall >= topOfObject && topOfBall <= bottomOfObject && ball.position.x >= leftSideOfObject && ball.position.x + ball.size <= rightSideOfObject ){
        return true;

    } else {

        return false;
    }

}



let canvas = document.getElementById("gameScreen");

let ctx = canvas.getContext("2d");


const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

let game = new Game(GAME_WIDTH, GAME_HEIGHT);  

let lastTime = 0;

//the game loop runs every frame & calculates how much time has passed.
//it clears the screen & then updates the paddle
//It then redraws the paddle.
//It calls the gameLoop again with the next frames timestamp.

function gameLoop(timestamp){

    let deltaTime = timestamp - lastTime; //calculate how much time has passed
    lastTime = timestamp; //on the very first frame we're not passing a time stamp & we're starting at 0

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);//clears any recs on the screen & when you do draw, as those coordinates change the rec appears to be moving
    game.update(deltaTime);
    game.draw(ctx);

    //reuest the animation frame from the browser 
    requestAnimationFrame(gameLoop); //when the next frame is ready call this game loop again & pass the 
                                     //the timestamp
    
}

requestAnimationFrame(gameLoop);

