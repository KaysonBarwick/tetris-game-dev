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

    let board_renderer = new BoardRenderer();

    let board = new Board();

    input.register_press('ArrowUp', () => board.hardDrop());
    input.register_hold('ArrowDown', () => board.fastDrop(elapsedTime));
    input.register_press('ArrowLeft', () => board.moveLeft());
    input.register_press('ArrowRight', () => board.moveRight());

    input.register_press('w', () => board.hardDrop());
    // input.register_press('s', () => board.fastDrop(elapsedTime));
    input.register_hold('s', () => board.fastDrop(elapsedTime));
    input.register_press('a', () => board.moveLeft());
    input.register_press('d', () => board.moveRight());
    input.register_press('q', () => board.rotateLeft());
    input.register_press('e', () => board.rotateRight());

    input.register_press('Escape', () => pause());

    let backgroundImage: Graphics.Texture;


    function init(bg: string = 'raven.png'){
        Score.resetScore();
        timer.resetTime();
        board = new Board();

        backgroundImage = new Graphics.Texture({
            src: 'assets/player_backgrounds/' + bg,
            center: {x: Graphics.canvas.width / 2, y: Graphics.canvas.height / 2},
            size: {height: Graphics.canvas.height, width: Graphics.canvas.width}
        });
        console.log(Graphics.canvas.width, Graphics.canvas.height)
    }

    function run(){
        // (<HTMLAudioElement>document.getElementById('myMusic')).play();

        nextFrame = true;
        prevTime = performance.now();
        requestAnimationFrame(gameLoop);
    }

    function pause(){
        nextFrame = false;
        Screens.showScreen('sub-screen-pause');
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
        timer.updateTime(elapsedTime);
    }

    function render(){
        Graphics.clear();
        backgroundImage.draw();
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
