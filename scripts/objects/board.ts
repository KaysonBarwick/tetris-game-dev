/// <reference path="../utils/random.ts" />

import Block, { BlockTypes } from './block';

import Settings from '../settings';

export default class Board {
    private board: Block[][] = [];
    private nextBlocks: BlockTypes[] = [];

    private activeBlocks: Block[] = [];
    private activeRotate: number = 0; // 0 = rotate 0, 1 = rotate 90, 2 = rotate 180, 3 = rotate -90
    private topLeft: {x: number, y: number};

    private fallCarryOver: number = 0;
    private blockDelayCarryOver: number = 0;

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

    //
    // ------------Game actions------------
    public update(elapsed_time: DOMHighResTimeStamp){
        if(this.isActive()){
            this.fallCarryOver += elapsed_time;
            let fall_rate = Settings.fall_rate - Settings.fall_rate_per_level * this.level;
            if(this.fallCarryOver >= fall_rate){
                this.fallCarryOver -= fall_rate;
                this.fall();
            }
        }
        else{
            this.blockDelayCarryOver += elapsed_time;
            if(this.blockDelayCarryOver >= Settings.block_respawn_delay){
                this.blockDelayCarryOver -= Settings.block_respawn_delay;
                this.addBlock();
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

    private fall(){
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
        //let type = this.activeBlocks[0].getType();

        //let next_active: Block[] = this.activeBlocks.slice();
        // let next_rotate: number = this.activeRotate + 1 % 4;

        // let success: boolean = false;
        // if(type == BlockTypes.I){
        // }
        // else if(type == BlockTypes.J || type == BlockTypes.L || type == BlockTypes.S || type == BlockTypes.Z || type == BlockTypes.T){

        // }
        // else if(type == BlockTypes.O){
        //     success = true;
        // }

        // if(success){
        //     this.activeBlocks = next_active;
        //     this.activeRotate = next_rotate;
        // }
        this.activeBlocks.forEach(block =>{
            block.rotateRight(this.topLeft);
        });
    }

    public rotateLeft(){
        this.activeBlocks.forEach(block =>{
            block.rotateLeft(this.topLeft);
        });
    }

    public fastDrop(elapsed_time: DOMHighResTimeStamp){

    }

    public hardDrop(){
        
    }
}