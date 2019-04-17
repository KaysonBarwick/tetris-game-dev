import Board from './objects/board';
import Settings from './settings';

export enum Moves {
    Rotate_Left,
    Rotate_Right,
    Left,
    Right,
    Drop
}

export default class AI {
    private next_moves: Moves[] = [];
    private move_speed: number = 175;
    private move_speed_carryover: number = 0;

    constructor(private board: Board){

    }

    update(elapsedTime: DOMHighResTimeStamp){
        let speed = this.move_speed - this.board.getLevel() * Settings.fall_rate_per_level / 2;
        if(this.next_moves.length){
            this.move_speed_carryover += elapsedTime;
            while(this.move_speed_carryover >= speed && this.next_moves.length){
                this.move_speed_carryover -= speed;
                let move = this.next_moves.shift();
                switch(move){
                    case Moves.Rotate_Left:
                        this.board.rotateLeft();
                        break;
                    case Moves.Rotate_Right:
                        this.board.rotateRight();
                        break;
                    case Moves.Left:
                        this.board.moveLeft();
                        break;
                    case Moves.Right:
                        this.board.moveRight();
                        break;
                    case Moves.Drop:
                        this.board.hardDrop();
                }
            }
        }
        else{
            this.findNextMove();
        }
    }

    private findNextMove(){
        let best = {score: 0, moves: 0, rotates: 0};
        let moves: number = 0; // -1 left, 1 right
        let rotates: number = 0;
        if(this.board.isActive()){
            for(let i = 0; i < 4; ++i){
                // Check each rotation
                rotates++;
                this.board.rotateLeft(false);
                while(this.board.moveRight(false)){
                    //Start from right and work way left
                    moves++;
                }
                let score = this.score();
                if(score >= best.score){
                    best = {score, moves, rotates};
                }
                while(this.board.moveLeft(false)){
                    //Try each position and get a score
                    moves--;
                    let score = this.score();
                    if(score >= best.score){
                        best = {score, moves, rotates};
                    }
                }

                // Reset block position
                while(moves < 0){
                    this.board.moveRight(false);
                    moves++;
                }
            }
            // Reset block orientation
            while(rotates > 0){
                this.board.rotateRight(false);
                rotates--;
            }

            // Set next moves based on best score
            if(best.rotates == 1){
                this.next_moves.push(Moves.Rotate_Left);
            }
            if(best.rotates == 2){
                this.next_moves.push(Moves.Rotate_Left);
                this.next_moves.push(Moves.Rotate_Left);
            }
            if(best.rotates == 3){
                this.next_moves.push(Moves.Rotate_Right);
            }

            while(best.moves){
                if(best.moves >= 0){
                    this.next_moves.push(Moves.Right);
                    best.moves--;
                }
                else if(best.moves < 0){
                    this.next_moves.push(Moves.Left);
                    best.moves++;
                }
            }
            this.next_moves.push(Moves.Drop);
        }
    }

    private score(): number {
        let score = 0;
        let shadowBlocks = this.board.getShadowBlocks();
        let shadowBlockHash = {};
        let board = this.board.getBoard();

        shadowBlocks.forEach(block => {
            let y = block.getIndex().y
            if(shadowBlockHash.hasOwnProperty(y)){
                shadowBlockHash[y].push(block.getIndex().x);
            }
            else{
                shadowBlockHash[y] = [block.getIndex().x]
            }
        });
        
        for(let key in shadowBlockHash){
            let clear = true;
            if(shadowBlockHash.hasOwnProperty(key)){
                for(let j = 0; j < board[key].length; j++){
                    if(!(shadowBlockHash[key].includes(j)) && board[key][j] == null){
                        clear = false;
                        break;
                    }
                }
                if(clear){
                    score += 7.1; // We like to clear lines :)
                }
            }
        }


        shadowBlocks.forEach(block => {
            let y = block.getIndex().y;
            if(y <= 2){
                score == -99999; // Avoid game over!
                return -99999;
            }

            score += y; // get as low as possible

            while(y < board.length - 1 && board[y + 1][block.getIndex().x] == null){
                if(shadowBlockHash[y + 1] == null || !(shadowBlockHash[y + 1].includes(block.getIndex().x))){
                    score -= 2.99; // holes suck!
                }
                y++;
            }
        });
        return score;
    }
}