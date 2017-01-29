/* global heuristic: false, BOARDSIZE: false */

// AUTHOR ANDREW RAY

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

// CHECKS FOR THE EXISTANCE OF ANY 5-PIECE RUNS
var checkWin = function (board) {
	// If the number of runs of five is greater than 0,
	// i.e. truthy, return the player who won.
	if (countPlayerRuns(board, HUMAN, 5)) return HUMAN;
	if (countPlayerRuns(board, COMP , 5)) return COMP ;
	
	// If both players have (falsy) 0 runs, return NONE
	return NONE;
};

/*// SIMPLISTIC HEURISTIC, HERE AS AN EXAMPLE
var heuristic = function (board) {
	var total = 0;
	
	var hasWin = checkWin(board);
	if (hasWin === HUMAN)return -Infinity;
	if (hasWin === COMP) return Infinity;
	
	total += 10* countPlayerRuns(board, COMP, 4);
	total += 4 * countPlayerRuns(board, COMP, 3);
	total += 2 * countPlayerRuns(board, COMP, 2);
	total -= 12* countPlayerRuns(board, HUMAN, 4);
	total -= 5 * countPlayerRuns(board, HUMAN, 3);
	total -= 3 * countPlayerRuns(board, HUMAN, 2);
	
	total += Math.random() * 2 - 1;
	
	return total;
};
*/

// COUNTS THE NUMBER OF RUNS OF SPECIFIED LENGTH SPECIFIED
// PLAYER HAS ON SPECIFIED BOARD.
var countPlayerRuns = function (board, player, length) {
	var x, i, q, color, count = 0,
	// flatten the array so we only need to do a single for loop.
		fb = board.reduce(function (a,b) {return a.concat(b);});
	
	// loop over all positions
	for (x = 0; x < BOARDSIZE ^ 2; ++x) {
		color = fb[x];
		
		if (color === player) { 
			
			// Check horizontal - win
			i = q = 0;
			if (x % BOARDSIZE <= BOARDSIZE - 1 - length) {// horizontal can't start in last n - 1 columns
				while (true) {
					// increment i
					++i;
					
					// check if n in a row
					if (i === length)
						++count;
						
					// check if not same color, in which case stop looking here
					if (fb[x + i] !== color)
						break;
				}
			}
			
			// Check diagonal / win
			i = q = 0;
			if (x % BOARDSIZE >= length - 1) { // left diagonal can't start in first n - 1 columns
				while (true) {
					++i; q += BOARDSIZE - 1; // BS - 1 is the distance between diag-down-left consecutives
					if (i === length) 
						++count;
					if (fb[x + q] !== color)
						break;
				}
			}
			
			// Check vertical | win
			i = q = 0;
			while (true) {
				++i; q += BOARDSIZE; // BS is dist between consec verticals
				if (i === length)
					++count;
				if (fb[x + q] !== color)
					break;
			}
			
			// Check diagonal \ win
			i = q = 0;
			if (x % BOARDSIZE <= BOARDSIZE - 1 - length) {// right diagonal can't start in last n - 1 columns
				while (true) {
					++i; q += BOARDSIZE + 1; // BS + 1 is dist btwn consec diag-down-right
					if (i === length)
						++count;
					if (fb[x + q] !== color)
						break;
				}
			}
			
		}
	}
	
	return count;
};

/// Min's turn: probably don't call directly (leave that to max)
var min = function (itersLeft) {
	"use strict";
	
	return function (board) { // for currying!
		if (itersLeft === 0) {
			// final case: find the worst board
			return board;
		}
		else {
			// recursive case, get the worst next board
			return getWorst(
				nextBoards(board, getLegalMoves(HUMAN, board)), 
				itersLeft
			);
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
			// recursive case, get the best next board
			return getBest(
				nextBoards(board, getLegalMoves(COMP, board)),
				itersLeft
			);
		}
	};
};

var getBest = function (boards, itersLeft) {
	var boardsWIdx = boards.map(function (board, index) {
			return {board: board, idx: index};
		}),
		boardHeurs = boards.map(heuristic),
		averageHeur = boardHeurs.reduce(function (a,b) {
			return a + b;
		}, 0) / boardHeurs.length,
		filtrd = boardsWIdx.filter(function (board) {
			return heuristic(board.board) >= averageHeur;
		}),
		chosen = filtrd.map(function (obj) {
			return {board: min(itersLeft - 1)(obj.board), idx: obj.idx};
		}),
		scores = chosen.map(function (obj) {
			return heuristic(obj.board);
		}),
		maxidx = scores.indexOf(Math.max.apply(null, scores));
	
	return boards[chosen[maxidx].idx];
};

var getWorst = function (boards, itersLeft) {
	var boardsWIdx = boards.map(function (board, index) {
			return {board: board, idx: index};
		}),
		boardHeurs = boards.map(heuristic),
		averageHeur = boardHeurs.reduce(function (a,b) {
			return a + b;
		}, 0) / boardHeurs.length,
		filtrd = boardsWIdx.filter(function (board) {
			return heuristic(board.board) <= averageHeur;
		}),
		chosen = filtrd.map(function (obj) {
			return {board: max(itersLeft - 1)(obj.board), idx: obj.idx};
		}),
		scores = chosen.map(function (obj) {
			return heuristic(obj.board);
		}),
		minidx = scores.indexOf(Math.min.apply(null, scores));
	
	return boards[chosen[minidx].idx];
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
	return getAllMoves(player).filter(shouldKeep(board)).filter(isLegal(board));
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

var shouldKeep = function (board) {
	"use strict";
	return function (move) {
		var x, y;
		for (x = move.posX - 2; x <= move.posX + 2; ++x) {
			if (x < 0 || x >= 15) continue; // avoid bad values
			for (y = move.posY - 2; y <= move.posY + 2; ++y) {
				if (board[x][y]) {
					return true;
				}
			}
		}
		return false;
	};
};
