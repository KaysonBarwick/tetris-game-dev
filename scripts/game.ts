/// <reference path="./graphics/graphics.ts" />
/// <reference path="./utils/screens.ts" />

import Settings from './settings';
import Input from './utils/input';
import Score from './utils/scores';
import Timer from './utils/timer';
import Particles from './graphics/particles';

import Block, { BlockTypes } from './objects/block';
import Board from './objects/board';

import BlockRenderer from './render/block_renderer';
import BlockAnimator from './render/block_animator';
import BoardRenderer from './render/board_renderer';

namespace Game {

    let prevTime: DOMHighResTimeStamp;
    let nextFrame: boolean = false;
    let elapsedTime: DOMHighResTimeStamp = 0;

    let input = new Input();
    let timer = new Timer('div-timer');

    let block_renderer = new BlockRenderer();
    let block_animator = new BlockAnimator();
    let board_renderer = new BoardRenderer();

    let board = new Board();

    let block = new Block(BlockTypes.I, {x: 1, y: 1});
    let block2 = new Block(BlockTypes.J, {x: 2, y: 1});
    let block3 = new Block(BlockTypes.S, {x: 3, y: 1});
    let block4 = new Block(BlockTypes.Z, {x: 4, y: 1});
    let block5 = new Block(BlockTypes.L, {x: 5, y: 1});
    let block6 = new Block(BlockTypes.O, {x: 6, y: 1});
    let block7 = new Block(BlockTypes.T, {x: 7, y: 1});
    block_animator.popBlock(block2);
    block_animator.popBlock(block3);
    block_animator.popBlock(block4);
    block_animator.popBlock(block5);
    block_animator.popBlock(block6);
    block_animator.popBlock(block7);

    input.register_press('ArrowUp', () => board.hardDrop());
    input.register_press('ArrowDown', () => board.fastDrop(elapsedTime));
    input.register_press('ArrowLeft', () => board.moveLeft());
    input.register_press('ArrowRight', () => board.moveRight());

    input.register_press('w', () => board.hardDrop());
    input.register_press('s', () => board.fastDrop(elapsedTime));
    input.register_press('a', () => board.moveLeft());
    input.register_press('d', () => board.moveRight());
    input.register_press('q', () => board.rotateLeft());
    input.register_press('e', () => board.rotateRight());

    input.register_press('Escape', () => pause());


    function init(){
        Score.resetScore();
        timer.resetTime();
    }

    function run(){
        // (<HTMLAudioElement>document.getElementById('myMusic')).play();

        nextFrame = true;
        prevTime = performance.now();
        requestAnimationFrame(gameLoop);
    }

    function pause(){
        nextFrame = false;
        Screens.showSubScreen('sub-screen-pause');
    }

    function quit(){
        init();
        Screens.showScreen('screen-main-menu')
    }

    function updateInput(elapsedTime: DOMHighResTimeStamp){
        input.update(elapsedTime);
    }

    function update(elapsedTime: DOMHighResTimeStamp){
        // Update Objects
        board.update(elapsedTime);
        Particles.update(elapsedTime);
        block_animator.update(elapsedTime);
        timer.updateTime(elapsedTime);
    }

    function render(){
        Graphics.clear();
        block_animator.render();
        block_renderer.render(block);
        board_renderer.render(board);
        Particles.render();
    }

    function gameLoop(currTime: DOMHighResTimeStamp){
        elapsedTime = currTime - prevTime;

        updateInput(elapsedTime);
        update(elapsedTime)
        render();

        prevTime = currTime;
        if(nextFrame){
            requestAnimationFrame(gameLoop);
        }
    }

    function gameOver(){
        Score.saveScore();
        (<HTMLDivElement>document.getElementById('score-final')).innerHTML = 'Your score was: ' + Score.getScore().toString();
        Screens.showSubScreen('sub-screen-gameover');
    }

    Screens.addScreen({id: 'screen-game', init: () => init(), run: () => run()});
    (<HTMLDivElement>document.getElementById('button-start')).addEventListener('click', () => Screens.showScreen('screen-game'));

    Screens.addScreen({id: 'sub-screen-pause'});
    (<HTMLDivElement>document.getElementById('button-resume')).addEventListener('click', () => Screens.showScreen('screen-game'));
    (<HTMLDivElement>document.getElementById('button-quit')).addEventListener('click', () => quit());

    Screens.addScreen({id: 'sub-screen-gameover'});
    (<HTMLDivElement>document.getElementById('button-replay')).addEventListener('click', () => {init(); Screens.showScreen('screen-game')});
    (<HTMLDivElement>document.getElementById('button-highscores2')).addEventListener('click', () => {Screens.showScreen('screen-highscores')});
}
