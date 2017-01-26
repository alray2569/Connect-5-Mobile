
/// Vars for players
var NONE  = 0,
	COMP  = 1,
	HUMAN = 2;

/// Create a new move object where the given player makes a move at posX, posY
var Move = function (player, posX, posY) {
	"use strict";
	return {
		player: player,
		posX: posX,
		posY: posY
	};
};

/// Create a new blank board object
var Board = function () {
	"use strict";
	return [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // you've got to be kidding
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // me, javascript. is there
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // really no better way to
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // do this than to write
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // 15^2 zeroes?
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
};

var checkWin = function (board) {
	var x, y, i;
	var winner = NONE;
	var color, found, foundDL, foundDR;
	
	//Check for horizontal wins!
	for (x = 0; x < 11; ++x) {
		for (y = 0; y < 15; ++y) {
			color = board[y][x];
			found = true;
			for(i=1; i<=4;i++){
				if(board[y][x+i]!=color){
					found = false;
					break;
				}
			}
			if(found){
				return color;
			}
		}
	}
	//Check for vertical wins!
	for (x = 0; x < 15; ++x) {
		for (y = 0; y < 11; ++y) {
			color = board[y][x];
			found = true;
			for(i=1; i<=4;i++){
				if(board[y+i][x]!=color){
					found = false;
					break;
				}
			}
			if(found){
				return color;
			}
		}
	}
	//Check for diagonal wins!
	for (x = 0; x < 11; ++x) {
		for (y = 0; y < 11; ++y) {
			color = board[y][x];
			foundDR = true;//found from top left to bottom right
			foundDL = true;//found from top right to bottom left
			for(i=1; i<=4;i++){
				if(board[y+i][x+1]!=color){
					foundDR = false;
				}
				if(board[y+5-i][x+i]!=color){
					
				}
			}
			if(foundDR||foundDL){
				return color;
			}
		}
	}
};

/// Heuristic returns a score for a boardstate.
var heuristic = function (board) { "use strict"; return 1; };


/// Min's turn: probably don't call directly (leave that to max)
var min = function (itersLeft) {
	"use strict";
	
	return function (board) { // for currying!
		if (itersLeft === 0) {
			// final case: find the worst board
			return board;
		}
		else {
			// recursive case, call to max then find worst board
			return nextBoards(board, getLegalMoves(HUMAN, board)).reduce(function (board1, board2) {
				return worseBoard(max(itersLeft - 1)(board1), max(itersLeft - 1)(board2)) === board1 ? board1 : board2;
			});
		}
	};
};

/// Max's turn: call as max(itersLeft)(board).
var max = function (itersLeft) {
	"use strict";
	
	return function (board) { // for currying!
		if (itersLeft === 0) {
			// final case
			return board;
		}
		else {
			// recursive case, call to min then find worst board
			return nextBoards(board, getLegalMoves(HUMAN, board)).reduce(function (board1, board2) {
				return betterBoard(min(itersLeft - 1)(board1), min(itersLeft - 1)(board2)) === board1 ? board1 : board2;
			});
		}
	};
};

/// Picks the best board based on the value from the heuristic.
var bestBoard = function (boards) {
	"use strict";
	return boards.reduce(betterBoard, null);
};

/// Picks the better board of two, picking out one that isn't null
var betterBoard = function (board1, board2) {
	"use strict";
	return board1 === null ? board2 : // board1 is null, return board2
		   board2 === null ? board1 : // board2 is null, return board1
		   heuristic(board1) > heuristic(board2) ? board1 : // board1 is better, return board1
		   board2; // board1 is not better, neither null, return board2
};

var worstBoard = function (boards) {
	"use strict";
	return boards.reduce(worseBoard, null);
};

var worseBoard = function (board1, board2) {
	"use strict";
	return board1 === null ? board2 : // board1 is null, return board2
		   board2 === null ? board1 : // board2 is null, return board1
		   heuristic(board1) > heuristic(board2) ? board2 : // board1 is better, return board2
		   board1; // board1 is not better, neither null, return board1
};

/// Returns an array of next possible boards given a set of legal moves and 
/// a starting board
var nextBoards = function (board, legalMoves) {
	return legalMoves.map(makeMove(board));
};

/// Returns a copy of the board with the next possible state
var makeMove = function (board) {
	"use strict";
	return function (move) { // for currying!
		var newboard = new Board(), x, y; // copy the board deeply
		
		for (x = 0; x < 15; ++x) {
			for (y = 0; y < 15; ++y) {
				newboard[x][y] = board[x][y];
			}
		}
		
		newboard[move.posX][move.posY] = move.player; // update new board
		return newboard;
	};
};

/// Returns all moves that are legal for player turn and given board.
var getLegalMoves = function (player, board) {
	"use strict";
	return getAllMoves(player).filter(isLegal(board));
};

/// Gets all possible moves for player turn
var getAllMoves = function (player) {
	"use strict";
	var x, y,
		toRet = new Array(15^2);
	
	// iterate over all possible board array locations.
	for (x = 0; x < 15; ++x) {
		for (y = 0; y < 15; ++y) {
			toRet[x * 15 + y] = new Move(player,x,y);
		}
	}
	
	return toRet;
};

/// Returns true iff move is legal
var isLegal = function (board) {
	"use strict";
	return function (move) {
		return board[move.posX][move.posY] === NONE;
	};
};
