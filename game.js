// game.js for Perlenspiel 3.2.x

/*
Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
Perlenspiel is Copyright © 2009-17 Worcester Polytechnic Institute.
This file is part of Perlenspiel.

Perlenspiel is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Perlenspiel is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You may have received a copy of the GNU Lesser General Public License
along with Perlenspiel. If not, see <http://www.gnu.org/licenses/>.
*/

// The "use strict" directive in the following line is important. Don't remove it!
"use strict";

// The following comment lines are for JSLint/JSHint. Don't remove them!

/*jshint -W097*/
/*jslint nomen: true, white: true */
/*global PS: false, NONE: false, HUMAN: false, COMP: false, isLegal: false, Move: false, Board: false, makeMove: false, checkWin: false, max: false, getMoveFromDifferingBoards: false*/

// This is a template for creating new Perlenspiel games

// All of the functions below MUST exist, or the engine will complain!

// PS.init( system, options )
// Initializes the game
// This function should normally begin with a call to PS.gridSize( x, y )
// where x and y are the desired initial dimensions of the grid
// [system] = an object containing engine and platform information; see documentation for details
// [options] = an object with optional parameters; see documentation for details

var playerTurn = HUMAN;
var board = new Board();
var AIDEPTH = 2;

var DAVIDAI = true;

PS.init = function( system, options ) {
	// Use PS.gridSize( x, y ) to set the grid to
	// the initial dimensions you want (32 x 32 maximum)
	// Do this FIRST to avoid problems!
	// Otherwise you will get the default 8x8 grid

	PS.gridSize( 15, 15 );
	// Set the borders
	PS.color(PS.ALL, PS.ALL, 0xff0000);
	PS.gridColor(0xcccccc);
	PS.borderColor(PS.ALL, PS.ALL, 0x000000);
};

// PS.touch ( x, y, data, options )
// Called when the mouse button is clicked on a bead, or when a bead is touched
// It doesn't have to do anything
// [x] = zero-based x-position of the bead on the grid
// [y] = zero-based y-position of the bead on the grid
// [data] = the data value associated with this bead, 0 if none has been set
// [options] = an object with optional parameters; see documentation for details

PS.touch = function( x, y, data, options ) {
	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.touch() @ " + x + ", " + y + "\n" );
	var move;
	
	switch (playerTurn) {
		case HUMAN:
			move = new Move(HUMAN, x, y);
			if (isLegal(board)(move)) {
				board = makeMove(board)(move); // make the move
				drawNewPiece(move);
				if (handleWinnerIfNecessary(board)) {return;}
			}
			else {
				PS.statusText("Illegal move...");
				return;
			}
			PS.statusText("AI is thinking. Please wait...");
			playerTurn = COMP;
			
			if(DAVIDAI){
				var nummax = 0;//Number of locations with the max score
				var maxscore = 0;
				
				var scores = [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]];
				
				for(var a=0;a<15;a++){
					for(var b=0;b<15;b++){
						if(!board[a][b]){
							board[a][b] = COMP;//See how adding a piece affects
							//Store in array, as to only calculate once
							scores[a][b] = heuristic(board);
							if(scores[a][b] > maxscore){
								maxscore = scores[a][b];
								nummax = 1;
							} else if(scores[a][b] === maxscore){
								nummax++;
							}
							board[a][b] = NONE;//Revert board
						 }
					}
				}
				
				var pos = Math.ceil(Math.random()*nummax);//Select a random one
				for(var a=0;a<15;a++){
					for(var b=0;b<15;b++){
						if(!board[a][b]&&scores[a][b] === maxscore){
							if(nummax === pos++){
								board[a][b] = COMP;//Place a piece there
								//PS.debug("Gotta ("+a+","+b+")");
								a = 99, b=99;//Break doesn't seem to work here
							}
						}
					}
				}
				
				/*for(var a=0;a<15;a++){
					for(var b=0;b<15;b++){
						PS.debug(scores[a][b]+" ");
					}
					PS.debug("\n");
				}
				PS.debug("--------------------------------\n");
				PS.debug(nummax+" "+maxscore+" "+pos+"\n");
				PS.debug("--------------------------------\n");
				*/
			} else
				board = max(AIDEPTH)(board);
						
			if (board === null) {PS.debug("Board is Null!");}
			drawBoard(board);
			if (handleWinnerIfNecessary(board)) {return;}
			
			playerTurn = HUMAN;
			PS.statusText("Your turn!");
			
			break;
		case COMP:
			return;
		default:
			return;
	}
	
};

var handleWinnerIfNecessary = function (board) {
	switch (checkWin(board)) {
		case NONE:
			return false;
		case HUMAN:
			PS.statusText("Congratulations! You win!");
			return true;
		case COMP:
			PS.statusText("Sorry! You lose.");
			return true;
	}
};

var drawBoard = function (board) {
	var x, y;
	
	for (x = 0; x < 15; ++x) {
		for (y = 0; y < 15; ++y) {
			switch (board[x][y]) {
				case HUMAN:
					drawNewPiece(new Move(HUMAN, x, y));
					break;
				case COMP:
					drawNewPiece(new Move(COMP, x, y));
					break;
				case NONE:
					PS.glyph(x, y, PS.NONE);
			}
		}
	}
};

var drawNewPiece = function (move) {
	PS.glyphColor(move.posX, move.posY, move.player === HUMAN ? 0x000000 : 0xfffffff);
	PS.glyph(move.posX, move.posY, '\u2B24');
};

// PS.release ( x, y, data, options )
// Called when the mouse button is released over a bead, or when a touch is lifted off a bead
// It doesn't have to do anything
// [x] = zero-based x-position of the bead on the grid
// [y] = zero-based y-position of the bead on the grid
// [data] = the data value associated with this bead, 0 if none has been set
// [options] = an object with optional parameters; see documentation for details

PS.release = function( x, y, data, options ) {
	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.release() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse button/touch is released over a bead
};

// PS.enter ( x, y, button, data, options )
// Called when the mouse/touch enters a bead
// It doesn't have to do anything
// [x] = zero-based x-position of the bead on the grid
// [y] = zero-based y-position of the bead on the grid
// [data] = the data value associated with this bead, 0 if none has been set
// [options] = an object with optional parameters; see documentation for details

PS.enter = function( x, y, data, options ) {
	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.enter() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch enters a bead
};

// PS.exit ( x, y, data, options )
// Called when the mouse cursor/touch exits a bead
// It doesn't have to do anything
// [x] = zero-based x-position of the bead on the grid
// [y] = zero-based y-position of the bead on the grid
// [data] = the data value associated with this bead, 0 if none has been set
// [options] = an object with optional parameters; see documentation for details

PS.exit = function( x, y, data, options ) {
	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch exits a bead
};

// PS.exitGrid ( options )
// Called when the mouse cursor/touch exits the grid perimeter
// It doesn't have to do anything
// [options] = an object with optional parameters; see documentation for details

PS.exitGrid = function( options ) {
	// Uncomment the following line to verify operation
	// PS.debug( "PS.exitGrid() called\n" );

	// Add code here for when the mouse cursor/touch moves off the grid
};

// PS.keyDown ( key, shift, ctrl, options )
// Called when a key on the keyboard is pressed
// It doesn't have to do anything
// [key] = ASCII code of the pressed key, or one of the PS.KEY constants documented at:
// http://users.wpi.edu/~bmoriarty/ps/constants.html
// [shift] = true if shift key is held down, else false
// [ctrl] = true if control key is held down, else false
// [options] = an object with optional parameters; see documentation for details

PS.keyDown = function( key, shift, ctrl, options ) {
	// Uncomment the following line to inspect parameters
	//	PS.debug( "DOWN: key = " + key + ", shift = " + shift + "\n" );

	// Add code here for when a key is pressed
	
	//line = [2,2,2,2,2,2,1,1,0,0,0,0,0];
	//PS.debug(linescore(COMP)+"\n");
	
	for(var a=0;a<15;a++){
		for(var b=0;b<15;b++){
			if(!board[a][b]){
				board[a][b] = COMP;
				PS.debug(heuristic(board)+" ");
				board[a][b] = NONE;
			 }
		}
		PS.debug("\n");
	}
	PS.debug("--------------------------------");
};

// PS.keyUp ( key, shift, ctrl, options )
// Called when a key on the keyboard is released
// It doesn't have to do anything
// [key] = ASCII code of the pressed key, or one of the PS.KEY constants documented at:
// http://users.wpi.edu/~bmoriarty/ps/constants.html
// [shift] = true if shift key is held down, false otherwise
// [ctrl] = true if control key is held down, false otherwise
// [options] = an object with optional parameters; see documentation for details

PS.keyUp = function( key, shift, ctrl, options ) {
	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.keyUp(): key = " + key + ", shift = " + shift + ", ctrl = " + ctrl + "\n" );

	// Add code here for when a key is released
};

// PS.input ( sensors, options )
// Called when an input device event (other than mouse/touch/keyboard) is detected
// It doesn't have to do anything
// [sensors] = an object with sensor information; see documentation for details
// [options] = an object with optional parameters; see documentation for details

PS.input = function( sensors, options ) {
	// Uncomment the following block to inspect parameters
	/*
	PS.debug( "PS.input() called\n" );
	var device = sensors.wheel; // check for scroll wheel
	if ( device )
	{
		PS.debug( "sensors.wheel = " + device + "\n" );
	}
	*/
	
	// Add code here for when an input event is detected
};

// PS.shutdown ( options )
// Called when the browser window running Perlenspiel is about to close
// It doesn't have to do anything
// [options] = an object with optional parameters; see documentation for details

PS.shutdown = function( options ) {

	// Add code here for when Perlenspiel is about to close
};