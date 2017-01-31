// AUTHOR: DAVID TANG

//Scoring based on each direction
//Note that dashes represent spaces that must not be X (can be O)
/*
		if piece is blocked on one side: XO--
			score += 15->10
		eif piece is not blocked on any side: --O--
			score += 50->5
		eif forms 2-in-a-row with at most one side blocked: XOO--
			score += 100
		eif forms 2-in-a-row spread: --O-O--
			score += 230
		eif forms 2-in-a-row connected: --OO--
			score += 300
		eif forms 3-in-a-row with one side blocked: XOOO--
			score += 600->6000
		eif forms 3-in-a-row spread, or delayed block: -OO-O-, X-OOO--
			score += 1200->12000
		eif forms 3-in-a-row connected: --OOO--
			score += 1800->18000
		eif forms 4-in-a-row blocked/spread: XOOO-O, XOOOO-, -OOO-O
			score += 2100->210000
		eif forms 4-in-a-row unblocked: -OOOO-
			score += 5000->500000
		eif forms 5-in-a-row: OOOOO
			score += 100000->10000000
			
	Numbers based on http://citeseerx.ist.psu.edu/viewdoc/download;jsessionid=311229C6DFD388D914A04BFD612384D9?doi=10.1.1.677.2553&rep=rep1&type=pdf
		*/

/// Helper function for determining score
var linepoints = function(width, numblock, delayblocks, superdelay, plusone, plustwo){
	switch(width){
		case 5:
			return 10000000;
		case 4:
			if(numblock === 2)
				return 0;//Blocked on both sides, no good
			else if (numblock === 1){
				//XOOOO-
				return 210000;
			} else if (numblock === 0){
				//-OOOO-
				return 500000;
			} else
				return 0;//Shouldn't happen
		case 3:
			if(numblock === 2)
				return 0;//Blocked on both sides, no good
			else if (numblock === 1){
				if(plusone)
					//XOOO-O
					return 210000;
				else if(delayblocks)
					//XOOO-X
					return 0;//Will be blocked, no good
				else
					//XOOO--
					return 6000;
			} else if (numblock === 0){
				if(plusone === 2)
					//O-OOO-O, unstoppable win
					return 500000;
				else if(plusone === 1)
					//O-OOO--, 4-in-a-row spread
					return 210000;
				else if(plusone === 0){
					if(delayblocks === 2)
						//X-OOO-X, not great, but doable
						return 6000;
					else if(delayblocks === 1)
						//X-OOO--
						return 12000;
					else if(delayblocks === 0)
						//--OOO--
						return 18000;
					else
						return 0;//Shouldn't happen
				}
			} else
				return 0;//Shouldn't happen
		case 2:
			if(numblock === 2)
				return 0;//Blocked on both sides, no good
			else if (numblock === 1){
				if(plusone){
					if(superdelay){
						//XOO-OX, no good
						return 0;
					} else if (plustwo) {
						//XOO-OO
						return 210000;
					} else
						//XOO-O-
						return 6000;
				}
				else if(delayblocks)
					//XOO-X
					return 0;//Will be blocked, no good
				else
					return 0;
					
			} else if (numblock === 0){
				if(plusone === 2){
					if(plustwo === 2){
						//OO-OO-OO, unstoppable win
						return 500000;
					} else if(plustwo === 1){
						//00-00-0-
						return 210000
					} else if(superdelay=== 2){
						//XO-OO-OX
						return 6000;
					} else if(superdelay === 1){
						//XO-OO-O-
						return 210000;//4-in-a-row-spread
					} else if(superdelay === 0){
						//-O-OO-O-
						return 18000;//equal in str to 3-in-a-row
					} else
						return 0;//Shouldn't happen
				} else if(plusone === 1){
					if(plustwo){
						//OO-OO--
						return 210000;
					} else if(delayblocks){
						//XO-OO--
						return 6000;
					} else
						//-O-OO--
						return 12000;
				} else if(plusone === 0){
					if(delayblocks === 2)
						//X-OO-X, No good
						return 0;
					else if(delayblocks === 1)
						//X-OO--
						return 230;
					else if(delayblocks === 0)
						//--OO--
						return 300;
					else
						return 0;//Shouldn't happen
				}
			}
		case 1:
			if(numblock === 2)
				return 0;//Blocked on both sides, no good
			else if (numblock === 1){
				if(!delayblocks)
					//XO--
					return 10;//Switched priority with open space
				else //XO-X
					return 0;
			} else if (numblock === 0){
				if(delayblocks === 2){
					//X-O-X
					return 0;
				} else
					return 5;
			} else
				return 0;//Shouldn't happen
		default:
			return 0;
	}
};

/// For other player
var otherscore = function(val){
	switch(val){
		case 5:
			return 1;//So their first move is placing next to opponent
		case 10:
			return 200;
		case 100:
			return 200;
		case 230:
			return 400;
		case 300:
			return 1000;
		case 6000:
			return 10000;
		case 12000:
			return 200000;
		case 18000:
			return 180000;
		case 210000:
			return 1000000;
		case 500000:
			return 2000000;
		case 10000000:
			return 20000000;
		case 0:
			return 0;
	}
};


var otherplayer = function(player){
	if(player === HUMAN){
		return COMP;
	} else if(player === COMP){
		return HUMAN;
	} else
		return NONE;
};

var line = [0,0,0,0,0,0,0,0,0,0,0,0,0];


var linescore = function(player){
	const other = otherplayer(player);//For abbreviation
	var boundleft = 6, boundright = 6;
	var len = 0, lenleft = 0, lenright = 0;
	var blockleft = 0, blockright = 0;//--OX
	var delayleft = 0, delayright = 0;//--O-X
	var superleft = 0, superright = 0;//--O--X
	var plusone = 0, plustwo = 0;

	while(boundleft > 0 && line[boundleft - 1] === player){
			boundleft--;//Find the extents of the main string
	}
	while(boundright < 12 && line[boundright + 1] === player){
			boundright++;//Find the extents of the main string
	}
	len = boundright - boundleft + 1;
	if(len >= 5){
		len = 5;
	}
	if(boundleft > 0){//Check for pieces to the left of the main string
		if(line[boundleft-1] === other){
			blockleft = 1;
		} else if(boundleft > 1){//EMPTY
			if(line[boundleft-2] === other){
				delayleft = 1;
			} else if(line[boundleft-2] === player){
				plusone++;
			} else if(boundleft > 2) {//EMPTY
				if(line[boundleft-3] === other){
					superleft = 1;
				} else if(line[boundleft-3] === player){
					plustwo++;
				}
			}
		}
	}
	if(boundright < 12){//Check for pieces to the right of the main string
		if(line[boundright+1] === other){
			blockright = 1;
		} else if(boundright < 11){//EMPTY
			if(line[boundright+2] === other){
				delayright = 1;
			} else if(line[boundright+2] === player){
				plusone++;
			} else if(boundright <10) {//EMPTY
				if(line[boundright+3] === other){
					superright = 1;
				} else if(line[boundright+3] === player){
					plustwo++;
				}
			}
		}
	}
	
	//	PS.debug(len+" "+blockleft+blockright+" "+delayleft+delayright+" "+superleft+superright+" "+plusone+" "+plustwo+";");
	if(player === COMP)
		return linepoints(len, blockleft+blockright, delayleft+delayright,
					  superleft+superright, plusone, plustwo);
	else
		return otherscore(linepoints(len, blockleft+blockright, delayleft+delayright,
					  superleft+superright, plusone, plustwo));
};

var spacescore = function(x, y){
	score = 0, score2 = 0;
	//for each direction (horiz, vert, diag, backdiag):

	//Center represents the newly added piece
	var horiz = [HUMAN,HUMAN,HUMAN,HUMAN,HUMAN,HUMAN, COMP,
				HUMAN,HUMAN,HUMAN,HUMAN,HUMAN,HUMAN];//13 long
	var vert = [HUMAN,HUMAN,HUMAN,HUMAN,HUMAN,HUMAN, COMP,
				HUMAN,HUMAN,HUMAN,HUMAN,HUMAN,HUMAN];
	var slash = [HUMAN,HUMAN,HUMAN,HUMAN,HUMAN,HUMAN, COMP,
				HUMAN,HUMAN,HUMAN,HUMAN,HUMAN,HUMAN];
	var bslash = [HUMAN,HUMAN,HUMAN,HUMAN,HUMAN,HUMAN, COMP,
				HUMAN,HUMAN,HUMAN,HUMAN,HUMAN,HUMAN];

	//Copy data from board into the arrays

	a = x; b = 5;//Horizontal left side
	while(a>0 && b>=0){
		--a;//move position on board
		horiz[b] = board[y][a];
		--b;//move position in array
	}
	a = x; b = 7;//Horizontal right side
	while(a<14 && b<=12){
		++a;//move position on board
		horiz[b] = board[y][a];
		++b;//move position in array
	}

	a = y; b = 5;//Vertical top side
	while(a>0 && b>=0){
		--a;//move position on board
		vert[b] = board[a][x];
		--b;//move position in array
	}
	a = y; b = 7;//Vertical bottom side
	while(a<14 && b<=12){
		++a;//move position on board
		vert[b] = board[a][x];
		++b;//move position in array
	}

	a = 0; b = 5;//Slash top right
	while(y+a>0 && x-a>0 && b>=0){
		--a;//move position on board
		slash[b] = board[y+a][x-a];
		--b;//move position in array
	}
	a = 0; b = 7;//Slash bottom left
	while(y+a<14 && x-a<14 && b<=12){
		++a;//move position on board
		slash[b] = board[y+a][x-a];
		++b;//move position in array
	}

	a = 0; b = 5;//BSlash top left
	while(y+a>0 && x+a>0 && b>=0){
		--a;//move position on board
		bslash[b] = board[y+a][x+a];
		--b;//move position in array
	}
	a = 0; b = 7;//BSlash bottom right
	while(y+a<14 && x+a<14 && b<=12){
		++a;//move position on board
		bslash[b] = board[y+a][x+a];
		++b;//move position in array
	}

	for(a=0; a<13;++a)
		line[a] = horiz[a];
	score += linescore(COMP);
	for(a=0; a<13;++a)
		line[a] = vert[a];
	score += linescore(COMP);
	for(a=0; a<13;++a)
		line[a] = slash[a];
	score += linescore(COMP);
	for(a=0; a<13;++a)
		line[a] = bslash[a];
	score += linescore(COMP);
	//if(score > maxscore)
	//	maxscore = score;

	//See what would happen if the player placed there
	for(a=0; a< 13; ++a){
		horiz[a] = COMP;
		vert[a] = COMP;
		slash[a] = COMP;
		bslash[a] = COMP;
	}
	horiz[6] = HUMAN;
	vert[6] = HUMAN;
	slash[6] = HUMAN;
	bslash[6] = HUMAN;
	//Copy data from board into the arrays

	a = x; b = 5;//Horizontal left side
	while(a>0 && b>=0){
		--a;//move position on board
		horiz[b] = board[y][a];
		--b;//move position in array
	}
	a = x; b = 7;//Horizontal right side
	while(a<14 && b<=12){
		++a;//move position on board
		horiz[b] = board[y][a];
		++b;//move position in array
	}

	a = y; b = 5;//Vertical top side
	while(a>0 && b>=0){
		--a;//move position on board
		vert[b] = board[a][x];
		--b;//move position in array
	}
	a = y; b = 7;//Vertical bottom side
	while(a<14 && b<=12){
		++a;//move position on board
		vert[b] = board[a][x];
		++b;//move position in array
	}

	a = 0; b = 5;//Slash top right
	while(y+a>0 && x-a>0 && b>=0){
		--a;//move position on board
		slash[b] = board[y+a][x-a];
		--b;//move position in array
	}
	a = 0; b = 7;//Slash bottom left
	while(y+a<14 && x-a<14 && b<=12){
		++a;//move position on board
		slash[b] = board[y+a][x-a];
		++b;//move position in array
	}

	a = 0; b = 5;//BSlash top left
	while(y+a>0 && x+a>0 && b>=0){
		--a;//move position on board
		bslash[b] = board[y+a][x+a];
		--b;//move position in array
	}
	a = 0; b = 7;//BSlash bottom right
	while(y+a<14 && x+a<14 && b<=12){
		++a;//move position on board
		bslash[b] = board[y+a][x+a];
		++b;//move position in array
	}

	for(a=0; a<13;++a)
		line[a] = horiz[a];
	score2 += linescore(HUMAN);
	for(a=0; a<13;++a)
		line[a] = vert[a];
	score2 += linescore(HUMAN);
	for(a=0; a<13;++a)
		line[a] = slash[a];
	score2 += linescore(HUMAN);
	for(a=0; a<13;++a)
		line[a] = bslash[a];
	score2 += linescore(HUMAN);
	
	return score + score2;
}

/// Heuristic returns a score for a boardstate.
var heuristic = function (board) {
	
	//return Math.random()*100;
	
	//O being AI piece, X being player piece
	var x, y, a, b;
	var maxscore = 0, maxscore2 = 0, score = 0, score2 = 0;
	for(x=0;x<15;++x){
		for(y=0;y<15;++y){
			if(!board[y][x]){//Unoccupied
				
				if(spacescore(y,x) > maxscore)
					maxscore = spacescore(y,x);
				//PS.debug(score+score2);
			}
		}
	}
	//line = [0,0,0,0,0,HUMAN,COMP,0,0,0,0,0,0];
	//PS.debug(linescore(COMP)+"\n");
	
	//PS.debug(maxscore +"," + maxscore2+ "\n");

/*for(x=2;x<8;++x){
	for(y=2;y<8;++y){
		if(board[y][x]===COMP){
			PS.debug(y+" "+x+": "+score+","+ score2+ "\n");
		}
	}
}*/

	
//boardscore = Max(scoreArray) - Max(score2Array)

//The program can maybe filter moves if there is a significantly better move (10x score)
		return maxscore;
};