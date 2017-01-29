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


// AUTHOR: ANDREW RAY

var playerTurn = HUMAN; // Whose turn is it?
var board = new Board();// Representation of the board
var AIDEPTH = 2;        // Minimax depth
var BOARDSIZE = 15;
var database;

PS.init = function( system, options ) {
	// Use PS.gridSize( x, y ) to set the grid to
	// the initial dimensions you want (32 x 32 maximum)
	// Do this FIRST to avoid problems!
	// Otherwise you will get the default 8x8 grid

	PS.gridSize( BOARDSIZE, BOARDSIZE );
	PS.color(PS.ALL, PS.ALL, 0xf0e0b0);
	PS.gridColor(0xf0e0b0);
	PS.gridShadow(true,0xeeeeee);
	PS.borderColor(PS.ALL, PS.ALL, 0x000000);
	
	database = PS.dbInit("dart-cnx5-" + Date.now);
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
		case HUMAN: // Human player's turn
			move = new Move(HUMAN, x, y);
			if (isLegal(board)(move)) { // check legality of player move
				board = makeMove(board)(move); // make the move
				drawNewPiece(move);//Also unhighlight any moves
				PS.border(x, y, 5);//Thick border
				PS.borderColor(x, y, PS.COLOR_RED);//Red border
				
				if (handleWinnerIfNecessary(board)) {// If a player has won, we're done here
					PS.dbEvent(database, 
							   "turn", "HUMAN",
							   "win" , "HUMAN"
							  );
					return;
				}
				PS.dbEvent(database, 
						   "turn", "HUMAN",
						   "win" , "NONE"
						  );
			}
			else { // Illegal move
				PS.statusText("Illegal move...");
				return;
			}
			
			// AI Turn
			PS.statusText("AI is thinking. Please wait...");
			playerTurn = COMP;
			var oldboard = board;
			move = max(AIDEPTH)(board).move;
			board = makeMove(board)(move); // COMP turn here
			
			if (board === null) {PS.debug("Board is Null!");}
			drawNewPiece(move);
			if (handleWinnerIfNecessary(board)) {
				PS.dbEvent(database, 
						   "turn", "COMP",
						   "win" , "COMP"
						  );
				return;
			}
			
			for(var a=0;a<BOARDSIZE;++a){
				for(var b=0;b<BOARDSIZE;++b){
					if(oldboard[a][b]!==board[a][b]){
						//Highlight any new pieces (should only have one)
						PS.border(a, b, 5);//Thick border
						PS.borderColor(a, b, PS.COLOR_RED);//Red border
					}
				}
			}
			
			playerTurn = HUMAN; // HUMAN turn again
			PS.statusText("Your turn!");
			break;
		case COMP:
			// Ignore on COMP turn
			return;
		default:
			return;
	}
	
};

// UPDATE THE STATUS LINE BASED ON THE RETURN OF CHECKWIN
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

// DRAW THE BOARD
var drawBoard = function (board) {
	var x, y;
	
	// double iteration to cover all spaces
	for (x = 0; x < BOARDSIZE; ++x) {
		for (y = 0; y < BOARDSIZE; ++y) {
			switch (board[x][y]) {
				case HUMAN:
					drawNewPiece(new Move(HUMAN, x, y));
					break;
				case COMP:
					drawNewPiece(new Move(COMP, x, y));
					break;
				//case NONE:
					//PS.glyph(x, y, PS.NONE);
			}
		}
	}
};

// DRAW A PIECE
var drawNewPiece = function (move) {
	//PS.glyphColor(move.posX, move.posY, move.player === HUMAN ? 0x000000 : 0xfffffff);
	//PS.glyph(move.posX, move.posY, '\u2B24');
	
	//I think off-white/black looks better
	PS.color(move.posX, move.posY, (move.player === HUMAN) ? 0x404040 : 0xdfdfdf);
	PS.radius(move.posX, move.posY, 50);
	PS.border(move.posX, move.posY, 2);
	PS.borderColor(move.posX, move.posY, PS.COLOR_BLACK);//Outline in black
};

