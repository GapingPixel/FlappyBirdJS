var debugmode = false;

var states = Object.freeze({
   GameLoading: -1,
   SplashScreen: 0,
   GameScreen: 1,
   ScoreScreen: 2
});

var soundExtension;
let userAgent = navigator.userAgent;

if (userAgent.match(/chrome|chromium|crios/i)) {
   soundExtension = ".mp3";
} else if (userAgent.match(/firefox|fxios/i)) {
   soundExtension = ".mp3"
} else if (userAgent.match(/safari/i)) {
   soundExtension = ".m4a";
} else if (userAgent.match(/opr\//i)) {
   soundExtension = ".mp3"
} else if (userAgent.match(/edg/i)) {
   soundExtension = ".mp3"
} else {
   soundExtension = "No browser detection";
}
var currentstate = states.GameLoading;

var gravity = 0.25;
var velocity = 0;
var position = 180;
var rotation = 0;
var jump = -4.6;
var flyArea = $("#flyarea").height();

var score = 0;
var highscore = 0;

var pipeheight;
var pipewidth = 52;
var pipes = new Array();
var ends = new Array();

var replayclickable = false;

var soundJump;
var soundScore;
var soundHit;
var soundDie;
var soundSwoosh;
var music;



const params = new URLSearchParams(window.location.search);
var gameid = params.get("gameid");
var ipfs = 'https://ipfs.io/ipfs/';
var json;


var loopGameloop;
var loopPipeloop;

const url = 'metadata/' + gameid + ".json";

function loadingScreen() {
   let loadingDiv = document.getElementById('loading');
   if (loadingDiv.innerHTML.length < 10) {
      loadingDiv.innerHTML += ".";
   } else {
      loadingDiv.innerHTML = loadingDiv.innerHTML.substring(0, 7);
   }
}


var loading = setInterval(loadingScreen, 1000);
var images = [];

function preload(args) { 
    for (var i = 0; i < args.length; i++) {
      images[i] = new Image();
      images[i].src = args[i];
    }
}

$.getJSON(url, (data) => {
   json = data;

}).success(function() {
   document.getElementById('loading').parentNode.removeChild(document.getElementById('loading'));
   setupSprites(json);
}).fail(function(e, s) {
   document.getElementById('loading').innerHTML = "Invalid Game ID";
}).always(function() {
   clearInterval(loading);
})



function setupSprites(json) {
      bgMusic = `${json.attributes[1].value}`;
      soundSetTrait = `${json.attributes[2].value.toLowerCase()}/`;
      difficulty = json.attributes[0].value.toLowerCase();
      levelTrait = `${json.attributes[3].value.toLowerCase()}`;
      playerTrait = `${json.name.toLowerCase().split("#")[1]}`;

      switch (difficulty) {
         case "easy":
            pipeheight = 150;
            break;
         case "medium":
            pipeheight = 125;
            break;
         case "hard":
            pipeheight = 100;
            break;
         default:
            pipeheight = 125;
            break;
      } 
      
      var _images = [
         `assets/${playerTrait}.png`,
         `assets/${levelTrait}_bg.png`,
         `assets/${levelTrait}_land.png`,
         `assets/${levelTrait}_pipe.png`,
         `assets/${levelTrait}_pipe-end.png`,

         "assets/splash.png",
         "assets/splash.png",
         "assets/gameover.png",
         "assets/medal_bronze.png",
         "assets/medal_silver.png",
         "assets/medal_gold.png",
         "assets/medal_platinum.png",
         "assets/replay.png",
      ];
      for (var j = 0; j<2; j++) {
         let size = j == 0 ? "font_big_" : "font_small_";
         for (var i = 0; i<10; i++) {
            _images.push("assets/" + size + String(i) + ".png");
         }
      }

      preload(_images);
      applyAssets();
      applyBGHex();
      showSplash();
}

function applyAssets() {
   $('#land').css('background-image', `url('assets/${levelTrait}_land.png')`);
   $('#bg').css('background-image', `url('assets/${levelTrait}_bg.png')`);
   $('.player').css('background-image', `url('assets/${playerTrait}.png')`);
   $('.pipe_upper').css('background-image', `url('assets/${levelTrait}_pipe.png')`);
   $('.pipe_lower').css('background-image', `url('assets/${levelTrait}_pipe.png')`);
   $('.pipe-end_upper').css('background-image', `url('assets/${levelTrait}_pipe-end.png')`);
   $('.pipe-end_lower').css('background-image', `url('assets/${levelTrait}_pipe-end.png')`);
   $('#splash').css('background-image', 'url("assets/splash.png")');

   music = new Howl({src: `assets/sounds/music/${bgMusic}${soundExtension}`, autoplay: true, loop: true, volume: 0.3});
   soundDie = new Howl ({src: [`assets/sounds/${soundSetTrait}sfx_die${soundExtension}`], volume: 0.15, onend: function() {
      showScore();
   }});
   soundScore = new Howl({ src: [`assets/sounds/${soundSetTrait}sfx_score${soundExtension}`], volume: 0.15});
   soundHit = new Howl({ src: [`assets/sounds/${soundSetTrait}sfx_hit${soundExtension}`], volume: 0.15, onend: function() {
      soundDie.play();
   }});
   soundSwoosh = new Howl({ src: [`assets/sounds/${soundSetTrait}sfx_swoosh${soundExtension}`], volume: 0.3 });
   soundJump = new Howl({ src: [`assets/sounds/${soundSetTrait}sfx_flap${soundExtension}`], volume: 0.15});
   music.play();
}
   
function applyBGHex() {
   switch (levelTrait) {
      case "ancient":
         bghex = "#8DE3FF";
         landhex = "#AEA59A";
         break;
      case "beach":
         bghex = "#FBBBAD";
         landhex = "#27232A";
         break;
      case "city":
         bghex = "#734DA0";
         landhex = "#964C83";
         break;
      case "crimson":
         bghex = "#EF87C3";
         landhex = "#70567B";
         break;
      case "desert":
         bghex = "#B5ECFF";
         landhex = "#9D502A";
         break;
      case "future":
         bghex = "#375193";
         landhex = "#283C6E";
         break;
      case "ice":
         bghex = "#A2E2FF";
         landhex = "#6CA7FF";
         break;
      case "jungle":
         bghex = "#FAD6B8";
         landhex = "#4A1D20";
         break;
      case "lava":
         bghex = "#793131";
         landhex = "#7E2C22";
         break;     
      case "mine":
         bghex = "#7DACFC";
         landhex = "#7B5A29";
         break;
      case "mountain":
         bghex = "#D08159";
         landhex = "#FFAA5E";
         break;
      case "neo tokyo":
         bghex = "#42208A";
         landhex = "#26164A";
         break;
      case "plague":
         bghex = "#203E36";
         landhex = "#2D3C27";
         break;
      case "space":
         bghex = "#05081E";
         landhex = "#081956";
         break;
      case "sword":
         bghex = "#0F052D";
         landhex = "#36868F";
         break;
      case "tetra":
         bghex = "#000000";
         landhex = "#D0D058";
         break;
      default: 
         bghex = "#777777";
         landhex = "#777777";
         break;
   }

   $('#bg').css('background-color', bghex);
   $('#land').css('background-color', landhex);
}

   
var doubleTapTime = 0;
$(document).ready(function() {

   document.addEventListener('touchstart', function(e) {
      var now = +(new Date());
    if (doubleTapTime + 500 > now){
      e.preventDefault();
    }
    doubleTapTime = now;
   }, { passive: false });
});

function showSplash()
{
   currentstate = states.SplashScreen;

   velocity = 0;
   position = 180;
   rotation = 0;
   score = 0;
   $("#player").css({ y: 0, x: 0 });
   updatePlayer($("#player"));

   $(".pipe").remove();
   $(".pipe-end").remove();
   pipes = new Array();
   pipeEnds = new Array();

   $(".animated").css('animation-play-state', 'running');
   $(".animated").css('-webkit-animation-play-state', 'running');

   $("#splash").transition({ opacity: 1 }, 2000, 'ease');
}

function startGame()
{
   currentstate = states.GameScreen;
   $("#splash").stop();
   $("#splash").transition({ opacity: 0 }, 500, 'ease');

   setBigScore();

   if(debugmode)
   {
      $(".boundingbox").show();
   }

   var updaterate = 1000.0 / 60.0 ;
   loopGameloop = setInterval(gameloop, updaterate);
   loopPipeloop = setInterval(updatePipes, 1400);

   playerJump();
}

function updatePlayer(player)
{
   rotation = Math.min((velocity / 10) * 90, 90);

   $(player).css({ rotate: rotation, top: position });
}

function gameloop() {
   var player = $("#player");

   velocity += gravity;
   position += velocity;

   updatePlayer(player);

   var box = document.getElementById('player').getBoundingClientRect();
   var origwidth = 34.0;
   var origheight = 24.0;

   var boxwidth = origwidth - (Math.sin(Math.abs(rotation) / 90) * 8);
   var boxheight = (origheight + box.height) / 2;
   var boxleft = ((box.width - boxwidth) / 2) + box.left;
   var boxtop = ((box.height - boxheight) / 2) + box.top;
   var boxright = boxleft + boxwidth;
   var boxbottom = boxtop + boxheight;

   if(debugmode)
   {
      var boundingbox = $("#playerbox");
      boundingbox.css('left', boxleft);
      boundingbox.css('top', boxtop);
      boundingbox.css('height', boxheight);
      boundingbox.css('width', boxwidth);
   }

   if(box.bottom >= $("#land").offset().top)
   {
      playerDead();
      return;
   }

   var ceiling = $("#ceiling");
   if(boxtop <= (ceiling.offset().top + ceiling.height()))
      position = ceiling.height();

   if(pipes[0] == null || ends[0] == null)
      return;

   var nextpipe = pipes[0];
   var nextpipeupper = nextpipe.children(".pipe_upper");

   var pipetop = nextpipeupper.offset().top + nextpipeupper.height() + 26;
   var pipeleft = nextpipeupper.offset().left - 2;
   var piperight = pipeleft + pipewidth;
   var pipebottom = pipetop + pipeheight - 26;

   if(debugmode)
   {
      var boundingbox = $("#pipebox");
      boundingbox.css('left', pipeleft);
      boundingbox.css('top', pipetop);
      boundingbox.css('height', pipeheight-26);
      boundingbox.css('width', pipewidth);
   }

   if((boxright-4) > pipeleft)
   {
      if((boxtop+4) > pipetop && boxbottom < pipebottom)
      {
         // ok
      }
      else
      {
         playerDead();
         return;
      }
   }


   if((boxleft+10) > piperight)
   {
      pipes.splice(0, 1);
      ends.splice(0,1);

      playerScore();
   }
}

$(document).keydown(function(e){
   if(e.keyCode == 32)
   {
      if(currentstate == states.ScoreScreen)
         $("#replay").click();
      else if (currentstate == states.GameScreen || currentstate == states.SplashScreen)
         screenClick();
      else if (currentstate == states.GameLoading)
         return;
   }
});

if("ontouchstart" in window)
   $(document).on("touchstart", screenClick);
else
   $(document).on("mousedown", screenClick);



function screenClick()
{
   if(currentstate == states.GameScreen)
   {
      playerJump();
   }
   else if(currentstate == states.SplashScreen)
   {
      startGame();
   }
}

function playerJump()
{
   velocity = jump;
   soundJump.currentTime = 0;
   soundJump.play();
}

function setBigScore(erase)
{
   var elemscore = $("#bigscore");
   elemscore.empty();

   if(erase)
      return;

   var digits = score.toString().split('');
   for(var i = 0; i < digits.length; i++)
      elemscore.append("<img src='assets/font_big_" + digits[i] + ".png' alt='" + digits[i] + "'>");
}

function setSmallScore()
{
   var elemscore = $("#currentscore");
   elemscore.empty();

   var digits = score.toString().split('');
   for(var i = 0; i < digits.length; i++)
      elemscore.append("<img src='assets/font_small_" + digits[i] + ".png' alt='" + digits[i] + "'>");
}

function setHighScore()
{
   var elemscore = $("#highscore");
   elemscore.empty();

   var digits = highscore.toString().split('');
   for(var i = 0; i < digits.length; i++)
      elemscore.append("<img src='assets/font_small_" + digits[i] + ".png' alt='" + digits[i] + "'>");
}

function setMedal()
{
   var elemmedal = $("#medal");
   elemmedal.empty();

   if(score < 10)
      return false;

   if(score >= 10)
      medal = "bronze";
   if(score >= 25)
      medal = "silver";
   if(score >= 50)
      medal = "gold";
   if(score >= 100)
      medal = "platinum";

   elemmedal.append('<img src="assets/medal_' + medal +'.png" alt="' + medal +'">');

   return true;
}

function playerDead()
{
   $(".animated").css('animation-play-state', 'paused');
   $(".animated").css('-webkit-animation-play-state', 'paused');

   var playerbottom = $("#player").position().top + $("#player").width();
   var floor = flyArea;
   var movey = Math.max(0, floor - playerbottom);
   $("#player").transition({ y: movey + 'px', rotate: 90}, 1000, 'easeInOutCubic');

   currentstate = states.ScoreScreen;

   clearInterval(loopGameloop);
   clearInterval(loopPipeloop);
   loopGameloop = null;
   loopPipeloop = null;

   soundHit.play();
}

function showScore()
{
   $("#gameover").css("display", "inline-block");

   setBigScore(true);

   if(score > highscore)
   {
      highscore = score;
   }
   setSmallScore();
   setHighScore();
   var wonmedal = setMedal();

   soundSwoosh.play();

   $("#gameover").css({x: '-50%', y: '-35%', opacity: 0 }); 
   $("#replay").css({ y: '40px', opacity: 0 });
   $("#gameover").transition({x: '-50%', y: '-45%', opacity: 1}, 600, 'ease', function() {
      soundSwoosh.currentTime = 0;
      soundSwoosh.play();
      $("#replay").transition({ y: '0px', opacity: 1}, 600, 'ease');

      if(wonmedal)
      {
         $("#medal").css({ scale: 2, opacity: 0 });
         $("#medal").transition({ opacity: 1, scale: 1 }, 1200, 'ease');
      }
   });

   replayclickable = true;
}

$("#replay").click(function() {
   if(!replayclickable)
      return;
   else
      replayclickable = false;
   soundSwoosh.play();

   $("#gameover").transition({ y: '-40px', opacity: 0}, 1000, 'ease', function() {
      $("#gameover").css("display", "none");
      showSplash();
   });
});

function playerScore()
{
   score += 1;
   soundScore.play();
   setBigScore();
}

function updatePipes()
{
   $(".pipe").filter(function() { return $(this).position().left <= -60; }).remove()
   $(".pipe-end").filter(function() { return $(this).position().left <= -60; }).remove()

   var padding = 35;
   var constraint = flyArea - pipeheight - (padding * 2);
   var topheight = Math.floor((Math.random()*constraint) + padding);
   var bottomheight = (flyArea - pipeheight) - topheight -26 ;

   var newpipe = $('<div class="pipe animated"><div class="pipe_upper" style="height: ' + topheight + 'px; background-image: url(\'assets/' + levelTrait + '_pipe.png\');"></div><div class="pipe_lower" style="height: ' + bottomheight + 'px; background-image: url(\'assets/' + levelTrait + '_pipe.png\');"></div></div>');
   var newend = $('<div class="pipe-end animated"><div class="pipe-end_upper" style="top: ' + topheight + 'px; background-image: url(\'assets/' + levelTrait + '_pipe-end.png\');"></div><div class="pipe-end_lower" style="bottom: ' + bottomheight + 'px; background-image: url(\'assets/' + levelTrait + '_pipe-end.png\');"></div></div>')
   $("#flyarea").append(newpipe);
   $("#flyarea").append(newend);
   pipes.push(newpipe);
   ends.push(newend);
}