const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d');
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;


let score = 0;
let gameOver = false;
let howManyZombieEscaped = 0;
let timeToNextZombie = 0;

ctx.font = '45px Verdana';

const rankURL = "https://jsonblob.com/api/jsonBlob/909838802340823040";
const rankURL2 = "https://jsonblob.com/909838802340823040";


let zombies = [];
class Zombie{
    constructor(){

        this.spriteWidth = 200;
        this.spriteHeight = 312;

        this.zombieSizeIndicator = Math.random() * 0.4 + 0.6;

        this.width = this.spriteWidth * this.zombieSizeIndicator;
        this.height = this.spriteHeight * this.zombieSizeIndicator;


        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);

        this.speed = Math.random() * 10 + 1;

        this.toDelete = false;
        this.image = new Image();
        this.image.src = 'img/walkingdead.png';

        this.frame = 0;
        this.maxFrame = 8;

        this.timeSinceLastFrame = 0;
        this.frameInterval = Math.random() * 50 + 50;
        
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';

    }

    update(deltaTime){

        this.x -= this.speed;

        if (this.x < 0 - this.width){
            this.toDelete = true;
        }

        this.timeSinceLastFrame += deltaTime;
        if (this.timeSinceLastFrame > this.frameInterval){
            if(this.frame > this.maxFrame){
                this.frame = 0;
            }
            else{
                this.frame++;
            }
            this.timeSinceLastFrame = 0;
        }


        if (this.x < 0 - this.width) howManyZombieEscaped++ ;
        if (howManyZombieEscaped == 3) {
            gameOver = true;
        }

    }

    draw(){
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}


let shoots = []; 
class Shoot{
    constructor(x, y, size){
        this.size = size;
        this.x = x;
        this.y = y;

        this.image = new Image();
        this.image.src = "img/fire.png";
        this.sound = new Audio();
        this.sound.src = 'sounds/zombie-2.wav';

        this.spriteWidth = 643 / 5;
        this.spriteHeight = 123;
        
        this.frame = 0;
        this.timeSinceLastFrame = 0;
        this.frameInterval = 100;
        this.markedForDeletion = false;
    }
    update(deltatime){
        if (this.frame === 0) this.sound.play();
        this.timeSinceLastFrame += deltatime;
        if (this.timeSinceLastFrame > this.frameInterval){
            this.frame++;
            this.timeSinceLastFrame = 0;
            if (this.frame > 5) this.markedForDeletion = true;
        }
    }
    draw(){
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y - this.size/4, 
            this.size, this.size);
    }
}

function drawScore(){
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' + score, canvas.width / 8, canvas.height / 10 );
    ctx.fillText('Not killed: ' + howManyZombieEscaped + '/3', canvas.width / 8, canvas.height / 5 );

}

function drawGameOver(){
    ctx.textAlign = 'center';
    ctx.fillStyle = 'yellow';
    ctx.fillText('GAME OVER!!! Score: ' + score, canvas.width/2 , canvas.height/2 - 70);
}

window.addEventListener('click', function(e){
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
    const pixel = detectPixelColor.data;
    zombies.forEach(object => {
        if(object.randomColors[0] === pixel[0] && object.randomColors[1] === pixel[1] && object.randomColors[2] === pixel[2]){
            object.toDelete = true;
            score += 12;
            shoots.push(new Shoot(object.x, object.y, object.width));
        }
    })

    if (pixel[0] === 0 && pixel[1] === 0 && pixel[2] === 0 && pixel[3] === 0){
        score -= 6;
    }

}); 

function getPlayerNick() {
    playerName = prompt("Podaj nick: ");
    if (playerName === ""){
        return getPlayerNick();
    } 
    document.getElementById("nick").innerHTML = "Player: " + playerName;
}

function SortOrder(p) {
    return function(a, b) {
        if (parseInt(a[p]) > parseInt(b[p])) {
            return -1;
        } else if (parseInt(a[p]) < parseInt(b[p])) {
            return 1;
        }
        return 0;
    }
}

function showHighscore(data) {
    gameArea.style.visibility = "visible";
    document.getElementById("highcoresHeader").style.visibility = "visible";
    document.getElementById("playAgainBtn").style.visibility = "visible";
    document.getElementById("highscores").style.visibility = "visible";

    let table = document.getElementById("highscores");

    table.innerHTML = '';

    for (let d of data) {
        let newtTr = document.createElement("tr");
        let newTd1 = document.createElement("td");
        let newTd2 = document.createElement("td");
        let newTd3 = document.createElement("td");
        let newTd4 = document.createElement("td");

        newTd1.innerText = d.id;
        newTd2.innerText = d.nick;
        newTd3.innerText = d.score;
        newTd4.innerText = d.date;

        newtTr.appendChild(newTd1);
        newtTr.appendChild(newTd2);
        newtTr.appendChild(newTd3);
        newtTr.appendChild(newTd4);
        table.appendChild(newtTr);
    }

}

async function updateHighscore() {
    let data = await fetch(rankURL).then(r => r.json());

    if (data['Results'].length < 7) {
        data['Results'].push({ "nick": playerName, "score": score, "date": new Date() });
        data['Results'].sort(SortOrder("score"));
    } 
    else {
        data['Results'].sort(SortOrder("score"));
        if (data['Results'][6].score <= score) {
            data['Results'][6].score = score;
            data['Results'][6].nick = playerName;
            data['Results'][6].date = new Date();
            data['Results'].sort(SortOrder("score"));
        }

        for (let i = 0; i < data['Results'].length; i++) {
            data['Results'][i].id = i + 1;
        }

    }
    showHighscore(data['Results']);


    let res = await fetch(rankURL, {
        method: 'PUT',
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify(data)
    });

}


let lastTime = 0;
function animate(timestamp){
    ctx.clearRect(0,0, canvas.width, canvas.height);
    collisionCtx.clearRect(0,0, canvas.width, canvas.height);


    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextZombie += deltaTime;

    if (timeToNextZombie > 500){
        zombies.push(new Zombie());
        timeToNextZombie = 0;
        zombies.sort(function(a,b){
            return a.width - b.width;
        });
    };

    [...zombies, ...shoots].forEach(object => object.update(deltaTime));
    [...zombies, ...shoots].forEach(object => object.draw());

    zombies = zombies.filter(object => !object.toDelete);
    shoots = shoots.filter(object => !object.toDelete);
    drawScore();

    if(!gameOver) requestAnimationFrame(animate);
    else 
    {
        drawGameOver();
        gameArea.style.cursor = "default";
        updateHighscore();
    }
}



let playAgainBtn = document.getElementById("playAgainBtn");
playAgainBtn.addEventListener('click', playAgain);

function playAgain() {
    playerName = "";
    gameArea.style.visibility = "hidden";
    document.getElementById("highcoresHeader").style.visibility = "hidden";
    document.getElementById("playAgainBtn").style.visibility = "hidden";

    let tab = document.getElementById("highscores");
    tab.style.visibility = "hidden";
    while (tab.firstChild) {
        tab.removeChild(tab.lastChild);
    }
    
    score = 6;
    gameOver = false;
    howManyZombieEscaped = 0;
    zombies = [];
    shoots = [];

    getPlayerNick();
    animate(0);
}



let date = new Date();
let playerName = "";
let gameArea = document.getElementById("gameArea");
getPlayerNick();
animate(0);
