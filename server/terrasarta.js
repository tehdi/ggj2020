/** @class Terrasarta core interface for value storage and hardware interfacing.. */


const five = require("johnny-five");
const pixel = require("node-pixel");
const firmata = require('firmata');
const http = require('http');
const port = 8081;
const max_score = 10000;
const boardport = '/dev/tty.usbmodem14101';


const PixelStripColorOrder = "GRB";
const readline = require('readline');

class TerraSarta {
    /**
    * Creates an instance of TerraSarta.
    *
    * @constructor
    * @author: Rae O'Neil
    * @param {number} [obj.max_score=100] - Maximum score value
    * @param {number} [obj.start_score=50] - start score value
    */
  
    constructor(obj) {
      obj = obj || {};
      this._start_score = obj.start_score || 50;
      this.callback = obj.callback || function () { };
      let board = new IfBoard({
        controller: "FIRMATA",
        port: boardport,
        led_pins: [2,6]
      });
      console.log(board.controller);
      let thists = this;
      this.online = false;
      this._pixels = new PixelStrip({
        board: board,
        score_count:10, 
        turn_pins: [8,9,10,11], 
        color_order: PixelStripColorOrder,
        max_score: this.max_score,
        score: this._start_score,
        callback: function() {
          console.log("lights initialized");
          thists.score(thists._score);
          thists.online = true;
        }
      });
      this.score = function(value) {
        this._score = Math.ceil(Number(value));
        this._pixels.score(value);
      }
      this.turn = function(value) {
        this._turn = Math.ceil(Number(value));
        this._pixels.turn(value);
      }
    }



    
}

/** @class IfBoard class for controlling a pixel strip */
class IfBoard {
  /**
  * Creates an instance of IfBoard (interface board). Typically the Arduino properties
  *
  * @constructor
  * @author: Rae O'Neil
  * @param {Object} board - properties of the board
  * @param {string} board.port - Port of controller board
  * @param {string} [board.controller="FIRMATA"] - Board controller
  */
  constructor (board) {
      this.controller = board.controller || 'FIRMATA';
      this.port = board.port; 
      this.strip_pin = board.strip_pin || 2;
      this.turn_pins = board.turn_pins || [8,9,10,11];
  }
}


/** @class PixelStrip class for controlling a pixel strip */
class PixelStrip {
/**
* Creates an instance of Terrasarta.
*
* @constructor
* @author: Rae O'Neil
* @param {Object} strip - properties of the strip
* @param {Object} board - IfBoard object
* @param {number} [strip.score_count=22] - How many LEDs in the strip 
* @param {Object[]} [strip.turn_count=[8.9.10.11] - How many LEDs in the strip 
* @param {number} [strip.gamma=2.8] - LED gamma (default 2.8)
* @param {string} [strip.color_order=RGB] - Color order
* @param {number} [strip.max_score=100] - Color order
*/
    constructor(strip) {
        strip = strip || {};
        strip.score_count = this._score_count = strip.score_count || 22;  // default
        strip.turn_pins = this._turn_pins = strip.turn_pins || [8,9,10,11];  // default
        strip.color_order = this._color_order = strip.color_order || "GRB"; // default GRB
        strip.gamma = Number(strip.gamma || 2.8);
        strip.score = this._score = Math.ceil(Number(strip.score||0));
        console.log("SCORE: "+strip.score);
        strip.max_score = this._max_score = Math.ceil(Number(strip.max_score||10000));
        this._node_pixel = strip.node_pixel = this._node_pixel = {};
        this._board = strip.board;
        
        strip.turn = this._turn = (strip.turn || 0);
        let self = this;
        this._fboard = new firmata.Board(this._board.port,function(){
            self._node_pixel = strip.node_pixel  = new pixel.Strip({
              strips: [{pin: strip.board.strip_pin, length: strip.score_count}],
              firmata: self._fboard,
              controller: strip.board.controller,
              color_order: strip.color_order,
              gamma: strip.gamma
            });

            strip.node_pixel.on("ready", function() {
                 strip.node_pixel.clear();
                 self.lightScore();
                 self.redraw();
                 strip.callback();
                 //console.log(JSON.stringify(strip.board))
                 for(let i=0;i < strip.board.turn_pins.length; i++) {
                    self._fboard.pinMode(strip.board.turn_pins[i],self._fboard.MODES.OUTPUT);
                    self._fboard.digitalWrite(strip.board.turn_pins[i],self._fboard.LOW);
                 }

              });
          strip.node_pixel.show();
        });
        this.turn = function (value) {
          if(typeof value == 'undefined') {
            return this._turn;
          }
          console.log("TURN SET: "+value);
          this._turn = value;
          self.lightTurn();
        };
        this.score =   function (value) {
          if(typeof value == 'undefined') {
            return this._score;
          }
          console.log("SCORE SET: "+value);
          this._score = value;
          self.lightScore();
        };
        this.scoreCount = function(count) {
          if(typeof count == 'undefined') {
            return this._score_count;
          }
          this._score_count = Math.ceil(Number(count));
          this.redraw;
        };
        this.recalculateLEDs = function(pixels,value,max) {
          let percentage = value/max;
          let ret  = Math.ceil(pixels*percentage);
          return ret;
        };
        this.turnPins = function(pins) {
          if(typeof pins == 'undefined') {
            return this._turn_pins;
          }
          this._turn_pins = pins;
          this.redraw;
        };
        this.redraw = function() {
          this.lightScore();
        };
        this.lightScore = function() {
          var scoreLEDs = this.recalculateLEDs(this._score_count,this._score, 100);
          let lit = true;
          for(var i = 0; i < this._score_count; i++) {          
            if(i <= scoreLEDs) {
              let p = this._node_pixel.pixel(i);
              p.color('#800');
            }
            else {
              let p = this._node_pixel.pixel(i);
              p.color('#000');
            }
          }
          if(scoreLEDs) {
            this._node_pixel.pixel(0).color("#800");
          }
          this._node_pixel.show();
        }
        this.lightTurn = function() {          
          let self = this;
          let pinslit = 0;
          self._turn_pins.forEach(function(pin) {
              var turnLEDs = self.recalculateLEDs(self._turn_pins.length,self._turn, 100);
              if(pinslit >= turnLEDs) {
                self._fboard.digitalWrite(pin,self._fboard.HIGH);
              }
              else {
                self._fboard.digitalWrite(pin,self._fboard.LOW);
                pinslit++;
              }
          });
        }
  }
    



    

}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var ts = {};
ts = new TerraSarta({max_score: max_score});

var serv = http.createServer();
serv.listen(port);
var online = false;
serv.on('request', function(request, response) {
  response.writeHead(200);
  if(request.url.match(/favicon\.ico/)) {
    response.end();
  }
  else {
    console.log(request.method);
    console.log(request.headers);
    console.log(request.url);
    let data = '';
    async function processData(chunk) {
      while(!ts || !ts.online) {
        await sleep(500);
      }
      data = JSON.parse(chunk);
    }
    async function processEnd(data) {
      while(!ts || !ts.online) {
        await sleep(500);
      }
      let ret = {};
      for (var property in data) {
        if (data.hasOwnProperty(property)) {
           switch (property) {
            case "score":
              console.log("Setting score to "+data['score'])
              ts.score(data[property]);
              ret.score = ts._score;
              break;
            case "turn":
              ts.turn(data['turn']);
              ret.turn = ts._turn;
              break;

             default: 
              ret = {score: ts._score, turn: ts._turn}
           }
        }
      }
      response.write(JSON.stringify(ret));
      response.end();
    }
    request.on('data',processData );
    request.on('end', function() { processEnd(data) });
    
  }
});

function promptInput() {
  rl.question('Score? ', function (answer) {
    console.log("Input: "+answer);
    console.log(ts);
    ts.score(answer);
    promptInput();
  })
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



