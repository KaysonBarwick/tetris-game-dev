/// <reference path="../utils/random.ts" />

import Block, { BlockTypes } from './block';

import Settings from '../settings';
import BlockAnimator from '../render/block_animator';

export default class Board {
    private board: Block[][] = [];
    private nextBlocks: BlockTypes[] = [];
    private toFall: Block[] = [];

    private activeBlocks: Block[] = [];
    private activeRotate: number = 0; // 0 = rotate 0, 1 = rotate 90, 2 = rotate 180, 3 = rotate -90
    private topLeft: {x: number, y: number};

    private fallCarryOver: number = 0;
    private blockDelayCarryOver: number = 0;

    private blockAnimator = new BlockAnimator();

    constructor(private level: number = 1){
        // board[0] and board[1] will be off screen and used to detect loss and
        // make the blocks appear to fall onto the screen.
        for(let i = 0; i <= Settings.board.height + 1; i++){
            let row = [];
            for(let j = 0; j < Settings.board.width; j++){
                row.push(null);
            }
            this.board.push(row);
        }

        for(let i = 0; i < Settings.next_block_count; ++i){
            this.nextBlocks.push(Random.randomInt(0, 6));
        }
    }
    
    //
    // ------------Getters------------
    public isActive(): boolean {
        return this.activeBlocks.length > 0;
    }

    public getBoard(): Block[][] {
        return this.board;
    }

    public getActiveBlocks(): Block[] {
        return this.activeBlocks;
    }

    public getNextBlocks(): BlockTypes[] {
        return this.nextBlocks;
    }

    public getShadowBlocks(): Block[] {
        let shadowBlocks: Block[] = []
        this.activeBlocks.forEach(block => {
            shadowBlocks.push(block.duplicate());
        });

        if(shadowBlocks.length == 0){
            return [];
        }

        let active: boolean = true;

        // Check for blocks below active blocks
        while(active){
            shadowBlocks.forEach(block => {
                let x = block.getIndex().x;
                let y = block.getIndex().y;
                if(y > Settings.board.height || this.board[y + 1][x] != null){
                    active = false; // Hit bottom or block beneath
                }
            });
            if(active){
                shadowBlocks.forEach(block => {
                    block.fall();
                });
            }
        }

        return shadowBlocks;
    }

    public getBlockAnimator(): BlockAnimator{
        return this.blockAnimator;
    }

    //
    // ------------Game actions------------
    public update(elapsed_time: DOMHighResTimeStamp){
        this.blockAnimator.update(elapsed_time);
        if(this.blockAnimator.isPopping()){
            return;
        }
        else {
            this.toFall.forEach(block => {
                let x = block.getIndex().x;
                let y = block.getIndex().y;
                this.board[y + 1][x] = block;
                this.board[y][x] = null;
                block.fall();
            });
            this.toFall = [];
        }
        if(this.isActive()){
            this.fallCarryOver += elapsed_time;
            let fall_rate = Settings.fall_rate - Settings.fall_rate_per_level * this.level;
            if(this.fallCarryOver >= fall_rate){
                this.fallCarryOver -= fall_rate;
                this.fall();
            }
        }
        else{
            this.popRow();
            this.blockDelayCarryOver += elapsed_time;
            if(this.blockDelayCarryOver >= Settings.block_respawn_delay){
                this.blockDelayCarryOver -= Settings.block_respawn_delay;
                this.addBlock();
            }
        }
    }

    private popRow(){
        for(let i = 0; i < this.board.length; ++i){
            let shouldPop = true;
            for(let j = 0; j < this.board[i].length; j++){
                if(this.board[i][j] == null){
                    shouldPop = false;
                    break;
                }
            }
            if(shouldPop){
                for(let j = 0; j < this.board[i].length; j++){
                    this.blockAnimator.popBlock(this.board[i][j]);
                    this.board[i][j] = null;
                }
                for(let row = i; row >= 0; --row){
                    for(let j = 0; j < this.board[row].length; j++){
                        if(this.board[row][j]){
                            this.toFall.push(this.board[row][j]);
                        }
                    }
                }
            }
        }
    }

    private nextBlock(): BlockTypes {
        let next = this.nextBlocks.shift();
        this.nextBlocks.push(Random.randomInt(0, 6));
        return next;
    }

    private addBlock(){
        let type = this.nextBlock();
        let middle = Math.floor(Settings.board.width / 2);

        this.activeRotate = 0;
        this.topLeft = {x: middle - 1, y: 0};        

        switch(type){
            case BlockTypes.L:
                this.activeBlocks.push(new Block(BlockTypes.L, {x: middle - 1, y: 0}));
                for(let i = middle - 1; i <= middle + 1; ++i){
                    this.activeBlocks.push(new Block(BlockTypes.L, {x: i, y: 1}));
                }
                break;
            case BlockTypes.I:
                for(let i = middle - 1; i <= middle + 2; ++i){
                    this.activeBlocks.push(new Block(BlockTypes.I, {x: i, y: 1}));
                }
                break;
            case BlockTypes.O:
                this.activeBlocks.push(new Block(BlockTypes.O, {x: middle, y: 0}));
                this.activeBlocks.push(new Block(BlockTypes.O, {x: middle + 1, y: 0}));
                this.activeBlocks.push(new Block(BlockTypes.O, {x: middle, y: 1}));
                this.activeBlocks.push(new Block(BlockTypes.O, {x: middle + 1, y: 1}));
                break;
            case BlockTypes.T:
                this.activeBlocks.push(new Block(BlockTypes.T, {x: middle, y: 0}));
                for(let i = middle - 1; i <= middle + 1; ++i){
                    this.activeBlocks.push(new Block(BlockTypes.T, {x: i, y: 1}));
                }
                break;
            case BlockTypes.S:
                this.activeBlocks.push(new Block(BlockTypes.S, {x: middle, y: 0}));
                this.activeBlocks.push(new Block(BlockTypes.S, {x: middle + 1, y: 0}));
                this.activeBlocks.push(new Block(BlockTypes.S, {x: middle, y: 1}));
                this.activeBlocks.push(new Block(BlockTypes.S, {x: middle - 1, y: 1}));
                break;
            case BlockTypes.J:
            this.activeBlocks.push(new Block(BlockTypes.J, {x: middle + 1, y: 0}));
                for(let i = middle - 1; i <= middle + 1; ++i){
                    this.activeBlocks.push(new Block(BlockTypes.J, {x: i, y: 1}));
                }
                break;
            case BlockTypes.Z:
                this.activeBlocks.push(new Block(BlockTypes.Z, {x: middle, y: 0}));
                this.activeBlocks.push(new Block(BlockTypes.Z, {x: middle - 1, y: 0}));
                this.activeBlocks.push(new Block(BlockTypes.Z, {x: middle, y: 1}));
                this.activeBlocks.push(new Block(BlockTypes.Z, {x: middle + 1, y: 1}));
                break;
        }
    }

    public fall(){
        if(!this.isActive()){
            return;
        }
        let active: boolean = true;
        // Check for blocks below active blocks
        this.activeBlocks.forEach(block => {
            let x = block.getIndex().x;
            let y = block.getIndex().y;
            if(y > Settings.board.height || this.board[y + 1][x] != null){
                active = false; // Hit bottom or block beneath
            }
        });

        if(active){
            // Make blocks fall
            this.activeBlocks.forEach(block => {
                block.fall();
            });
            this.topLeft.y++;
        }
        else {
            // Deactivate blocks by moving them to board
            this.activeBlocks.forEach(block => {
                this.board[block.getIndex().y][block.getIndex().x] = block;
            });
            this.activeBlocks = [];
        }
    }

    //
    // ------------Player Actions------------
    public moveLeft(){
        if(!this.isActive()){
            return;
        }
        let canMove: boolean = true;
        this.activeBlocks.forEach(block => {
            let x = block.getIndex().x;
            let y = block.getIndex().y;
            if(x < 1 || this.board[y][x - 1] != null){
                canMove = false;
            }
        });
        if(canMove){
            this.activeBlocks.forEach(block => {
                block.moveLeft();
            });
            this.topLeft.x--;
        }
    }

    public moveRight(){
        if(!this.isActive()){
            return;
        }
        let canMove: boolean = true;
        this.activeBlocks.forEach(block => {
            let x = block.getIndex().x;
            let y = block.getIndex().y;
            if(x >= Settings.board.width - 1 || this.board[y][x + 1] != null){
                canMove = false;
            }
        });
        if(canMove){
            this.activeBlocks.forEach(block => {
                block.moveRight();
            });
            this.topLeft.x++;
        }
    }

    public rotateRight(){
        if(!this.isActive()){
            return;
        }
        let type = this.activeBlocks[0].getType();
        this.activeRotate = (((this.activeRotate + 1) % 4) + 4) % 4; //https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
        

        this.activeBlocks.forEach(block =>{
            block.rotateRight(this.topLeft);
        });

        let wallKick: {x: number, y: number}[] = [];
        let success: boolean = false;
        if(type == BlockTypes.I){
            if(this.activeRotate == 1){ // 0 --> 1
                wallKick = [{x: 0, y: 0}, {x: -2, y: 0}, {x: 1, y: 0}, {x: -2, y: 1}, {x: 1, y: -2}];
            }
            if(this.activeRotate == 2){ // 1 --> 2
                wallKick = [{x: 0, y: 0}, {x: -1, y: 0}, {x: 2, y: 0}, {x: -1, y: -2}, {x: 2, y: 1}];
            }
            if(this.activeRotate == 3){ // 2 --> 3
                wallKick = [{x: 0, y: 0}, {x: 2, y: 0}, {x: -1, y: 0}, {x: 2, y: -1}, {x: -1, y: 2}];
            }
            if(this.activeRotate == 0){ // 3 --> 0
                wallKick = [{x: 0, y: 0}, {x: 1, y: 0}, {x: -2, y: 0}, {x: 1, y: 2}, {x: -2, y: -1}];
            }
        }
        else if(type == BlockTypes.J || type == BlockTypes.L || type == BlockTypes.S || type == BlockTypes.Z || type == BlockTypes.T){
            if(this.activeRotate == 1){ // 0 --> 1
                wallKick = [{x: 0, y: 0}, {x: -1, y: 0}, {x: -1, y: -1}, {x: 0, y: 2}, {x: -1, y: 2}];
            }
            if(this.activeRotate == 2){ // 1 --> 2
                wallKick = [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: -2}, {x: 1, y: -2}];
            }
            if(this.activeRotate == 3){ // 2 --> 3
                wallKick = [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: -1}, {x: 0, y: 2}, {x: 1, y: 2}];
            }
            if(this.activeRotate == 0){ // 3 --> 0
                wallKick = [{x: 0, y: 0}, {x: -1, y: 0}, {x: -1, y: 1}, {x: 0, y: -2}, {x: -1, y: -2}];
            }
        }
        else if(type == BlockTypes.O){
            success = true; // Don't need to rotate O blocks
        }

        for(let kick of wallKick){
            let canMove = true;
            for(let block of this.activeBlocks){
                let x = block.getIndex().x + kick.x;
                let y = block.getIndex().y + kick.y;

                if(x < 0 || x >= Settings.board.width ||
                  y > Settings.board.height ||
                  this.board[y][x] != null){
                    canMove = false;
                    break;
                }
            }
            if(canMove){
                this.activeBlocks.forEach(block => {
                    block.setIndex(block.getIndex().x + kick.x, block.getIndex().y + kick.y)
                });
                this.topLeft.x += kick.x;
                this.topLeft.y += kick.y;
                success = true;
                break;
            }
        }

        if(!success){
            // Rotate back, no places to rotate
            this.activeBlocks.forEach(block => {
                block.rotateLeft(this.topLeft);
            });
            this.activeRotate = (((this.activeRotate - 1) % 4) + 4) % 4; //https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
        }
    }

    public rotateLeft(){
        if(!this.isActive()){
            return;
        }
        let type = this.activeBlocks[0].getType();
        this.activeRotate = (((this.activeRotate - 1) % 4) + 4) % 4; //https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers

        this.activeBlocks.forEach(block =>{
            block.rotateLeft(this.topLeft);
        });

        let wallKick: {x: number, y: number}[] = [];
        let success: boolean = false;
        if(type == BlockTypes.I){
            if(this.activeRotate == 0){ // 1 --> 0
                wallKick = [{x: 0, y: 0}, {x: 2, y: 0}, {x: -1, y: 0}, {x: 2, y: -1}, {x: -1, y: 2}];
            }
            if(this.activeRotate == 1){ // 2 --> 1
                wallKick = [{x: 0, y: 0}, {x: 1, y: 0}, {x: -2, y: 0}, {x: 1, y: 2}, {x: -2, y: -1}];
            }
            if(this.activeRotate == 2){ // 3 --> 2
                wallKick = [{x: 0, y: 0}, {x: -2, y: 0}, {x: 1, y: 0}, {x: -2, y: 1}, {x: 1, y: -2}];
            }
            if(this.activeRotate == 3){ // 0 --> 3
                wallKick = [{x: 0, y: 0}, {x: -1, y: 0}, {x: 2, y: 0}, {x: -1, y: -2}, {x: 2, y: 1}];
            }
        }
        else if(type == BlockTypes.J || type == BlockTypes.L || type == BlockTypes.S || type == BlockTypes.Z || type == BlockTypes.T){
            if(this.activeRotate == 0){ // 1 --> 0
                wallKick = [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: -2}, {x: 1, y: -2}];
            }
            if(this.activeRotate == 1){ // 2 --> 1
                wallKick = [{x: 0, y: 0}, {x: -1, y: 0}, {x: -1, y: -1}, {x: 0, y: 2}, {x: -1, y: 2}];
            }
            if(this.activeRotate == 2){ // 3 --> 2
                wallKick = [{x: 0, y: 0}, {x: -1, y: 0}, {x: -1, y: 1}, {x: 0, y: -2}, {x: -1, y: -2}];
            }
            if(this.activeRotate == 3){ // 0 --> 3
                wallKick = [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: -1}, {x: 0, y: 2}, {x: 1, y: 2}];
            }
        }
        else if(type == BlockTypes.O){
            success = true; // Don't need to rotate O blocks
        }

        for(let kick of wallKick){
            let canMove = true;
            for(let block of this.activeBlocks){
                let x = block.getIndex().x + kick.x;
                let y = block.getIndex().y + kick.y;

                if(x < 0 || x >= Settings.board.width ||
                  y > Settings.board.height ||
                  this.board[y][x] != null){
                    canMove = false;
                    break;
                }
            }
            if(canMove){
                this.activeBlocks.forEach(block => {
                    block.setIndex(block.getIndex().x + kick.x, block.getIndex().y + kick.y)
                });
                this.topLeft.x += kick.x;
                this.topLeft.y += kick.y;
                success = true;
                break;
            }
        }

        if(!success){
            // Rotate back, no places to rotate
            this.activeBlocks.forEach(block => {
                block.rotateRight(this.topLeft);
            });
            this.activeRotate = (((this.activeRotate + 1) % 4) + 4) % 4; //https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
        }
    }

    public fastDrop(elapsed_time: DOMHighResTimeStamp){
        this.fallCarryOver += Settings.fast_drop_rate * elapsed_time;
    }

    public hardDrop(){
        while(this.isActive()){
            this.fall();
        }
    }
}