/** @type{HTMLCanvasElement} */

window.addEventListener("load", function () {
  /** @type {HTMLCanvasElement} */
  // canvas setup
  const canvas = document.getElementById("canva");
  const ctx = canvas.getContext("2d");
  canvas.width = 1280;
  canvas.height = 720;

  ctx.fillStyle = "white";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "white";

  // Player class:
  class Player {
    constructor(game) {
      this.game = game;
      this.collisionX = this.game.width * 0.5;
      this.collisionY = this.game.height * 0.5;
      this.collisionRadius = 40;
      this.speedX = 0;
      this.speedY = 0;
      this.dx = 0;
      this.dy = 0;
      this.speedModifier = 20;
    }
    draw(context) {
      context.beginPath();
      context.arc(
        this.collisionX,
        this.collisionY,
        this.collisionRadius,
        0,
        Math.PI * 2
      );
      context.save();
      context.globalAlpha = 0.5;
      context.fill();
      context.restore();
      context.stroke();
      // draw the direction line
      context.beginPath();
      context.moveTo(this.collisionX, this.collisionY);
      context.lineTo(this.game.mouse.x, this.game.mouse.y);
      context.stroke();
    }
    update() {
      this.dx = this.game.mouse.x - this.collisionX;
      this.dy = this.game.mouse.y - this.collisionY;
      // if we want continuos constant speed, we need to calculate the 'Hypotenuse':
      const distance = Math.hypot(this.dy, this.dx);
      if (distance > this.speedModifier) {
        this.speedX = this.dx / distance || 0; // OR zero " || 0 " just a backup if any values is not defined
        this.speedY = this.dy / distance || 0;
      } else {
        this.speedX = 0;
        this.speedY = 0;
      }
      // console.log(`distance: ${distance.toFixed(2)} | speedX: ${this.speedX.toFixed(2)} | speedY: ${this.speedY.toFixed(2)}`);

      /* this method will not give us a continuous constant 'same' speed,
      at beginning the speed is maximum, and then will be slower
      at begining :
      this.speedX = this.dx / 10;
      this.speedY = this.dy / 10;
      */
      this.collisionX += this.speedX * this.speedModifier;
      this.collisionY += this.speedY * this.speedModifier;
      // check if collision:
      this.game.obstacles.forEach(obstacle => {
        if(this.game.checkCollision(this, obstacle)){
          console.log('did');
        }
      })
    }
  }

  // Obstacles class:
  class Obstacle {
    constructor(game) {
      this.game = game;
      this.collisionX = Math.random() * this.game.width;
      this.collisionY = Math.random() * this.game.height;
      this.collisionRadius = 70; // hard coded, just to fit the base of obstacle picture
      this.image = document.getElementById("obstacles");
      this.spriteWidth = 250; // sprite picture size is 250*250px
      this.spriteHeight = 250;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.spriteX = this.collisionX - this.width * 0.5; // find the center of sprite
      this.spriteY = this.collisionY - this.height * 0.5 - 75;
      // the value " -75 " // hard coded, just to fit the base of obstacle picture
      this.frameX = Math.floor(Math.random() * 4); // numbers from 0 to 3, to choose one of the sprites from the image
      this.frameY = Math.floor(Math.random() * 3); // numbers from 0 to 2
    }
    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        this.spriteX,
        this.spriteY,
        this.width,
        this.height
      );
      context.beginPath();
      context.arc(
        this.collisionX,
        this.collisionY,
        this.collisionRadius,
        0,
        Math.PI * 2
      );
      context.save();
      context.globalAlpha = 0.5;
      context.fill();
      context.restore();
      context.stroke();
    }
  }

  // main Game class :
  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.topMargin = 260; //hardcoded: add top buffer, to avoid draw obstacles on the grass, trees and bushes, those already drawn the background image
      // create new Player:
      this.player = new Player(this);
      // create Obstacles:
      this.numberOfObstacles = 10;
      this.obstacles = [];

      this.mouse = {
        x: this.width * 0.5,
        y: this.height * 0.5,
        pressed: false,
      };

      // events:
      canvas.addEventListener("mousedown", (e) => {
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
        this.mouse.pressed = true;
        // console.log(this.mouse.x , this.mouse.y);
      });
      canvas.addEventListener("mouseup", (e) => {
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
        this.mouse.pressed = false;
        // console.log(this.mouse.x , this.mouse.y);
      });
      canvas.addEventListener("mousemove", (e) => {
        if (this.mouse.pressed) {
          this.mouse.x = e.offsetX;
          this.mouse.y = e.offsetY;
        }
        // console.log(this.mouse.x , this.mouse.y);
      });
    }

    render(context) {
      this.player.draw(context);
      this.player.update();
      this.obstacles.forEach((obstcale) => obstcale.draw(context));
    }

    checkCollision(a, b) {
      const dx = a.collisionX - b.collisionX;
      const dy = a.collisionY - b.collisionY;
      const distance = Math.hypot(dy, dx);
      const sumOfRadius = a.collisionRadius + b.collisionRadius;
      return distance < sumOfRadius; // return TRUE if there is collision
    }

    init() {
      // basic technique to create and locate obstacles in random positions:
      // for (let i = 0; i < this.numberOfObstacles; i++) this.obstacles.push(new Obstacle(this));

      // brute force algorithm, to avoid overlapping and relocate things in specific area:
      let attempts = 0; // to set maximum number of attempts
      while (this.obstacles.length < this.numberOfObstacles && attempts < 500) {
        /* second condition is to limit the maximum attempts to 500 times,
        if these attempt not enough to fine all the empty positions for all the Obstacles, then the WHILE loop will stop, that's safer then enter infinite loop */
        attempts++;
        let overlap = false;
        let testObstacle = new Obstacle(this);
        // forLoop to check each created obstacle in the acceptable position
        this.obstacles.forEach((obstacle) => {
          const dx = testObstacle.collisionX - obstacle.collisionX;
          const dy = testObstacle.collisionY - obstacle.collisionY;
          const distance = Math.hypot(dy, dx); // distance between to centers (by calculating the long side of triangle)
          const distanceBuffer = 100; // to add minimum distance between obstacles
          const sumOfRadius =
            testObstacle.collisionRadius +
            obstacle.collisionRadius + // find the total size of both of obstacles
            distanceBuffer;

          if (distance < sumOfRadius) overlap = true; // if TRUE then try to fine new position (Math.random(); it self in Obstacl Class above in constructor)
        });
        const margin = testObstacle.collisionRadius * 2; // just add more space between abstacles to allow player and enemies move around and between
        // here we make sure the correct positioning:
        if (
          !overlap &&
          testObstacle.spriteX > 0 &&
          testObstacle.spriteX < this.width - testObstacle.width &&
          testObstacle.collisionY > this.topMargin + margin &&
          testObstacle.collisionY < this.height - margin
        )
          this.obstacles.push(testObstacle);
      }
    }
  }

  const game = new Game(canvas);
  game.init();

  function animation() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(ctx);
    requestAnimationFrame(animation);
  }

  animation();
});
