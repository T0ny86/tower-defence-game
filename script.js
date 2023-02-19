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
    }
  }

  // Obstacles class:
  class Obstacle {
    constructor(game) {
      this.game = game;
      this.collisionX = Math.random() * this.game.width;
      this.collisionY = Math.random() * this.game.height;
      this.collisionRadius = 60;
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
    }
  }

  // main Game class :
  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      // create new Player:
      this.player = new Player(this);
      // create Obstacles:
      this.numberOfObstacles = 5;
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
        // 
        this.obstacles.forEach((obstacle) => {
          const dx = testObstacle.collisionX - obstacle.collisionX;
          const dy = testObstacle.collisionY - obstacle.collisionY;
          const distance = Math.hypot(dy, dx);  // distance between to centers (by calculating the long side of triangle)
          const sumOfRadius = testObstacle.collisionRadius + obstacle.collisionRadius; // find the total size of both of obstacles
          if (distance < sumOfRadius) overlap = true; // if TRUE then try to fine new position (Math.random(); it self in Obstacl Class above in constructor)
        });
        // 
        if(!overlap) this.obstacles.push(testObstacle)
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
