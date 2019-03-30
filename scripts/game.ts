/// <reference path="./graphics/graphics.ts" />
/// <reference path="./utils/screens.ts" />

import Settings from './settings';
import Input from './utils/input';
import Score from './utils/scores';
import Timer from './utils/timer';
import Particles from './graphics/particles';
import Sprite from './graphics/sprite-sheet';
import Animation from './graphics/animated-model';

namespace Game {

    let prevTime: DOMHighResTimeStamp;
    let nextFrame: boolean = false;
    let elapsedTime: DOMHighResTimeStamp = 0;

    let input = new Input();
    let timer = new Timer('div-timer');

    let sprite = new Sprite('./assets/blocks.png', 7);
    let animation = new Animation('./assets/blocks/green_pop_animation.png', 8, [200,200,200,200,200,200,200,10000]);

    //input.register_hold('ArrowUp', () => player.thrust(elapsedTime));
    //input.register_hold('ArrowLeft', () => player.turnLeft(elapsedTime));
    //input.register_hold('ArrowRight', () => player.turnRight(elapsedTime));
    input.register_press('Escape', () => pause());

    function init(){
        Score.resetScore();
        timer.resetTime();
    }

    function run(){
        // (<HTMLAudioElement>document.getElementById('myMusic')).play();
        // (<HTMLVideoElement>document.getElementById('myVideo')).play();

        nextFrame = true;
        prevTime = performance.now();
        requestAnimationFrame(gameLoop);
    }

    function pause(){
        nextFrame = false;
        (<HTMLVideoElement>document.getElementById('myVideo')).pause();
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
        Particles.update(elapsedTime);
        timer.updateTime(elapsedTime);
        animation.update(elapsedTime);
    }

    function render(){
        Graphics.clear();
        sprite.render({center: {x: 10, y: 10}, size: {width: 10, height: 10}}, 0);
        sprite.render({center: {x: 20, y: 20}, size: {width: 10, height: 10}}, 1);
        sprite.render({center: {x: 30, y: 30}, size: {width: 10, height: 10}}, 2);
        sprite.render({center: {x: 40, y: 40}, size: {width: 10, height: 10}}, 3);
        sprite.render({center: {x: 50, y: 50}, size: {width: 10, height: 10}}, 4);
        sprite.render({center: {x: 60, y: 60}, size: {width: 10, height: 10}}, 5);
        sprite.render({center: {x: 500, y: 500}, size: {width: 100, height: 100}}, 6);
        animation.render({center: {x: 80, y: 80}, size: {width: 20, height: 20}});
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
