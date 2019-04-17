/// <reference path="../utils/random.ts" />

import Block, { BlockTypes } from './block';

import Settings from '../settings';
import BlockAnimator from '../render/block_animator';
import Particles from '../graphics/particles';
import Audio from '../utils/audio';

export default class Board {
    private board: Block[][] = [];
    private nextTypes: BlockTypes[] = [];
    private nextBlocks: Block[][] = [];
    private toFall: Block[] = [];

    private next_group_id = 1;
    private activeBlocks: Block[] = [];
    private activeRotate: number = 0; // 0 = rotate 0, 1 = rotate 90, 2 = rotate 180, 3 = rotate -90
    private topLeft: {x: number, y: number};

    private fallCarryOver: number = 0;
    private blockDelayCarryOver: number = 0;

    private blockAnimator = new BlockAnimator();

    private cleared: number = 0;
    private score: number = 0;

    constructor(private level: number = 0){
        // board[0] and board[1] will be off screen and used to detect loss and
        // make the blocks appear to fall onto the screen.
        for(let i = 0; i <= Settings.board.height + 1; i++){
            let row = [];
            for(let j = 0; j < Settings.board.width; j++){
                row.push(null);
            }
            this.board.push(row);
        }
        this.activeBlocks = this.nextBlock();
    }
    
    //
    // ------------Getters------------
    public isActive(): boolean {
        return this.activeBlocks.length > 0;
    }

    public isCritical(): boolean {
        for(let i = 0; i < this.board[6].length; ++i){
            if(this.board[6][i] != null){
                return true;
            }
        }
        return false;
    }

    public getBoard(): Block[][] {
        return this.board;
    }

    public getActiveBlocks(): Block[] {
        return this.activeBlocks;
    }

    public getNextBlocks(): Block[][] {
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

    public getLevel(): number {
        return this.level;
    }

    public getScore(): number {
        return this.score;
    }

    public getRowsCleared(): number {
        return this.cleared;
    }

    public isGameOver(): boolean {
        let gameOver: boolean = false;
        this.board[0].forEach(block => {
            if(block){
                gameOver = true;
                return;
            }
        });
        return gameOver;
    }

    public isPopping(): boolean{
        return this.blockAnimator.isPopping();
    }

    //
    // ------------Game actions------------
    public update(elapsed_time: DOMHighResTimeStamp){
        this.level = Math.min(Settings.max_level, Math.floor(this.cleared / Settings.rows_per_level));

        this.blockAnimator.update(elapsed_time);
        if(this.blockAnimator.isPopping()){
            this.popRow();
            return;
        }
        else {
            let groups = {};
            this.toFall.forEach(block => {
                // Remove fall blocks from board and find groups
                let x = block.getIndex().x;
                let y = block.getIndex().y;
                this.board[y][x] = null;

                let id =  block.getGroupID();
                if(groups.hasOwnProperty(id)){
                    groups[id].push(block);
                }
                else{
                    groups[id] = [block];
                }
            });
            if(this.toFall.length > 0){
                Audio.blockLand();
            }
            while(this.toFall.length > 0){
                this.toFall.forEach(block => {
                    if(block.getIndex().y + 1 < this.board.length && this.board[block.getIndex().y + 1][block.getIndex().x] == null){
                        block.fall();
                    }
                    else{
                        this.board[block.getIndex().y][block.getIndex().x] = block;
                        this.toFall.splice(this.toFall.indexOf(block), 1);
                    }
                });
                let locking = true;
                while(locking){
                    locking = false;
                    for(let id in groups){
                        if(groups.hasOwnProperty(id)){
                            // Check if group hit bottom
                            let active = true;
                            groups[id].forEach(block => {
                                let x = block.getIndex().x;
                                let y = block.getIndex().y;
                                if(y >= this.board.length - 1 || this.board[y + 1][x] != null){
                                    active = false; // Hit bottom or block beneath
                                }
                            });
                            if(!active){
                                // Group hit bottom
                                locking = true;
                                // Add to board
                                groups[id].forEach(block => {
                                    this.board[block.getIndex().y][block.getIndex().x] = block;
                                    this.toFall.splice(this.toFall.indexOf(block), 1);
                                });
                                Particles.addBlockPlace(groups[id]);

                                // Remove from falling and groups
                                delete groups[id];
                            }
                        }
                    }
                }

            }

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
                this.activeBlocks = this.nextBlock();
            }
        }
    }

    private popRow(){
        let popped = 0;
        for(let i = 0; i < this.board.length; ++i){
            let shouldPop = true;
            for(let j = 0; j < this.board[i].length; j++){
                if(this.board[i][j] == null){
                    shouldPop = false;
                    break;
                }
            }
            if(shouldPop){
                popped++;
                this.cleared++;
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

        
        if(popped == 1){
            //Audio.fanfare(0);
            this.score += 40 * (this.level + 1)
        }
        if(popped == 2){
            Audio.fanfare(1);
            this.score += 100 * (this.level + 1)
        }
        if(popped == 3){
            Audio.fanfare(2);
            this.score += 300 * (this.level + 1)
        }
        if(popped == 4){
            Audio.fanfare(3);
            this.score += 1200 * (this.level + 1)
        }
    }

    private nextType(): BlockTypes {
        if(this.nextTypes.length == 0){
            for(let i = 0; i < 7; ++i){
                this.nextTypes.push(i);
            }
            //scramble
            for (let i = this.nextTypes.length - 1; i > 0; i--) { //https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
                const j = Math.floor(Math.random() * (i + 1));
                [this.nextTypes[i], this.nextTypes[j]] = [this.nextTypes[j], this.nextTypes[i]];
            }
        }
        return this.nextTypes.shift();
    }

    private nextBlock(): Block[] {
        // Add a blocks to next
        while(this.nextBlocks.length <= Settings.next_block_count){
            let type = this.nextType();
            let middle = Math.floor(Settings.board.width / 2);

            this.activeRotate = 0;
            this.topLeft = {x: middle - 1, y: 0};        
            
            let blocks: Block[] = []
            switch(type){
                case BlockTypes.L:
                    blocks.push(new Block(BlockTypes.L, {x: middle - 1, y: 0}, this.next_group_id));
                    for(let i = middle - 1; i <= middle + 1; ++i){
                        blocks.push(new Block(BlockTypes.L, {x: i, y: 1}, this.next_group_id));
                    }
                    break;
                case BlockTypes.I:
                    for(let i = middle - 1; i <= middle + 2; ++i){
                        blocks.push(new Block(BlockTypes.I, {x: i, y: 1}, this.next_group_id));
                    }
                    break;
                case BlockTypes.O:
                    blocks.push(new Block(BlockTypes.O, {x: middle, y: 0}, this.next_group_id));
                    blocks.push(new Block(BlockTypes.O, {x: middle + 1, y: 0}, this.next_group_id));
                    blocks.push(new Block(BlockTypes.O, {x: middle, y: 1}, this.next_group_id));
                    blocks.push(new Block(BlockTypes.O, {x: middle + 1, y: 1}, this.next_group_id));
                    break;
                case BlockTypes.T:
                    blocks.push(new Block(BlockTypes.T, {x: middle, y: 0}, this.next_group_id));
                    for(let i = middle - 1; i <= middle + 1; ++i){
                        blocks.push(new Block(BlockTypes.T, {x: i, y: 1}, this.next_group_id));
                    }
                    break;
                case BlockTypes.S:
                    blocks.push(new Block(BlockTypes.S, {x: middle, y: 0}, this.next_group_id));
                    blocks.push(new Block(BlockTypes.S, {x: middle + 1, y: 0}, this.next_group_id));
                    blocks.push(new Block(BlockTypes.S, {x: middle, y: 1}, this.next_group_id));
                    blocks.push(new Block(BlockTypes.S, {x: middle - 1, y: 1}, this.next_group_id));
                    break;
                case BlockTypes.J:
                    blocks.push(new Block(BlockTypes.J, {x: middle + 1, y: 0}, this.next_group_id));
                    for(let i = middle - 1; i <= middle + 1; ++i){
                        blocks.push(new Block(BlockTypes.J, {x: i, y: 1}, this.next_group_id));
                    }
                    break;
                case BlockTypes.Z:
                    blocks.push(new Block(BlockTypes.Z, {x: middle, y: 0}, this.next_group_id));
                    blocks.push(new Block(BlockTypes.Z, {x: middle - 1, y: 0}, this.next_group_id));
                    blocks.push(new Block(BlockTypes.Z, {x: middle, y: 1}, this.next_group_id));
                    blocks.push(new Block(BlockTypes.Z, {x: middle + 1, y: 1}, this.next_group_id));
                    break;
            }
            this.nextBlocks.push(blocks);
            this.next_group_id++;
        }

        let next = this.nextBlocks.shift();
        return next;
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
            if(y >= this.board.length - 1 || this.board[y + 1][x] != null){
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
            Particles.addBlockPlace(this.activeBlocks);
            Audio.blockLand();
            this.activeBlocks = [];
        }
    }

    //
    // ------------Player Actions------------
    public moveLeft(playSound: boolean = true): boolean{
        if(!this.isActive()){
            return false;
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
            if(playSound){
                Audio.blockMove();
            }
            return true;
        }
        return false;
    }

    public moveRight(playSound: boolean = true): boolean{
        if(!this.isActive()){
            return false;
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
            if(playSound){
                Audio.blockMove();
            }
            return true;
        }
        return false;
    }

    public rotateRight(playSound: boolean = true){
        if(!this.isActive()){
            return;
        }
        if(playSound){
            Audio.blockRotate();
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
                  y >= this.board.length || y < 0 ||
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

    public rotateLeft(playSound: boolean = true){
        if(!this.isActive()){
            return;
        }
        let type = this.activeBlocks[0].getType();
        this.activeRotate = (((this.activeRotate - 1) % 4) + 4) % 4; //https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
        
        if(playSound){
            Audio.blockRotate();
        }

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
                  y > Settings.board.height || y < 0 ||
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