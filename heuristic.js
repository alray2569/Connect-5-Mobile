// AUTHOR: DAVID TANG

/// Helper function for determining score
var linepoints = function(width, numblock, delayblocks, superdelay, plusone, plustwo){
	switch(width){
		case 5:
			return 1000000;
		case 4:
			if(numblock === 2)
				return 0;//Blocked on both sides, no good
			else if (numblock === 1){
				//XOOOO-
				return 2100;
			} else if (numblock === 0){
				//-OOOO-
				return 5000;
			} else
				return 0;//Shouldn't happen
		case 3:
			if(numblock === 2)
				return 0;//Blocked on both sides, no good
			else if (numblock === 1){
				if(plusone)
					//XOOO-O
					return 2100;
				else if(delayblocks)
					//XOOO-X
					return 0;//Will be blocked, no good
				else
					//XOOO--
					return 600;
			} else if (numblock === 0){
				if(plusone === 2)
					//O-OOO-O, unstoppable win
					return 5000;
				else if(plusone === 1)
					//O-OOO--, 4-in-a-row spread
					return 2100;
				else if(plusone === 0){
					if(delayblocks === 2)
						//X-OOO-X, not great, but doable
						return 600;
					else if(delayblocks === 1)
						//X-OOO--
						return 1200;
					else if(delayblocks === 0)
						//--OOO--
						return 1800;
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
						return 2100;
					} else
						//XOO-O-
						return 600;
				}
				else if(delayblocks)
					//XOO-X
					return 0;//Will be blocked, no good
				else
					return 100;
					
			} else if (numblock === 0){
				if(plusone === 2){
					if(plustwo === 2){
						//OO-OO-OO, unstoppable win
						return 5000;
					} else if(plustwo === 1){
						//00-00-0-
						return 2100
					} else if(superdelay=== 2){
						//XO-OO-OX
						return 600;
					} else if(superdelay === 1){
						//XO-OO-O-
						return 2100;//4-in-a-row-spread
					} else if(superdelay === 0){
						//-O-OO-O-
						return 1800;//equal in str to 3-in-a-row
					} else
						return 0;//Shouldn't happen
				} else if(plusone === 1){
					if(plustwo){
						//OO-OO--
						return 2100;
					} else if(delayblocks){
						//XO-OO--
						return 600;
					} else
						//-O-OO--
						return 1200;
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
					return 15;
				else //XO-X
					return 0;
			} else if (numblock === 0){
				if(delayblocks === 2){
					//X-O-X
					return 0;
				} else
					return 50;
			} else
				return 0;//Shouldn't happen
		default:
			return 0;
	}
};

/// For other player
var otherscore = function(val){
	switch(val){
		case 15:
			return 10;
		case 50:
			return 40;
		case 100:
			return 80;
		case 230:
			return 200;
		case 300:
			return 240;
		case 600:
			return 480;
		case 1200:
			return 1000;
		case 1800:
			return 1200;
		case 2100:
			return 1800;
		case 5000:
			return 3000;
		case 1000000:
			return 10000;
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
		if(player === COMP)
			return linescore(len, 0,0,0,0,0);//No need to check any further
		if(player === HUMAN)
			return otherplayer(linescore(len, 0,0,0,0,0));
	}
	if(boundleft > 0){//Check for pieces to the left of the main string
		if(line[boundleft-1] === other){
			blockleft = 1;
		} else if(boundleft > 1){//EMPTY
			if(line[boundleft-2] === other){
				delayleft = 1;
			} else if(line[boundleft-2] === player){
				plusone++;
				a = boundleft-1;
				while(a > 0 && line[a - 1] === player){
					a--;
				}
				lenleft = boundleft-1 - a;
				//Pieces form lenleft-in-an-row on the left side: lenleft-OOO---
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
				a = boundright+1;
				while(a <12 && line[a + 1] === player){
					a++;
				}
				lenright = a - (boundright+1);
				//Pieces form lenright-in-an-row on the left side: lenright-OOO---
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
	return linepoints(len, blockleft+blockright, delayleft+delayright,
					  superleft+superright, plusone, plustwo);
};

/// Heuristic returns a score for a boardstate.
var heuristic = function (board) {
	
	//return Math.random()*100;
	
	//O being AI piece, X being player piece
	var x, y, a, b;
	var maxscore = 0, maxscore2 = 0, score = 0, score2 = 0;
	for(x=0;x<15;++x){
		for(y=0;y<15;++y){
			if(!board[y][x]){//Unoccupied
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
					vert[b] = board[y+a][x-a];
					--b;//move position in array
				}
				a = 0; b = 7;//Slash bottom left
				while(y+a<14 && x-a<14 && b<=12){
					++a;//move position on board
					vert[b] = board[y+a][x-a];
					++b;//move position in array
				}

				a = 0; b = 5;//BSlash top left
				while(y+a>0 && x+a>0 && b>=0){
					--a;//move position on board
					vert[b] = board[y+a][x+a];
					--b;//move position in array
				}
				a = 0; b = 7;//BSlash bottom right
				while(y+a<14 && x+a<14 && b<=12){
					++a;//move position on board
					vert[b] = board[y+a][x+a];
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
				if(score > maxscore)
					maxscore = score;

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
					vert[b] = board[y+a][x-a];
					--b;//move position in array
				}
				a = 0; b = 7;//Slash bottom left
				while(y+a<14 && x-a<14 && b<=12){
					++a;//move position on board
					vert[b] = board[y+a][x-a];
					++b;//move position in array
				}

				a = 0; b = 5;//BSlash top left
				while(y+a>0 && x+a>0 && b>=0){
					--a;//move position on board
					vert[b] = board[y+a][x+a];
					--b;//move position in array
				}
				a = 0; b = 7;//BSlash bottom right
				while(y+a<14 && x+a<14 && b<=12){
					++a;//move position on board
					vert[b] = board[y+a][x+a];
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
				if(score2 > maxscore2)
					maxscore2 = score2;
								
				//if(x>=2 && x<7 && y>=2 && y<7){
					//	PS.debug((maxscore - maxscore2) + "\n");
					//PS.debug(y+" "+x+": "+score+","+ score2+ "\n");
				//}
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
		return maxscore - maxscore2;
};