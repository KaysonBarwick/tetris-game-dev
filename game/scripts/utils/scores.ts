/// <reference path="screens.ts" />

export class Score {
    private score: number = 0;
    private highscores: number[] = [];

    private scoreLabel: HTMLDivElement; 

    constructor(private id: string){
        let item = JSON.parse(localStorage.getItem(this.id));
        if(item){
            this.highscores = item;
        }
        this.scoreLabel = <HTMLDivElement>document.getElementById(this.id);
        if(this.scoreLabel == null){
            console.warn("No score div found for id:", this.id);
        }
        this.scoreLabel.innerHTML = '0';
    }

    addScore(points: number): void {
        this.score += points;
        this.scoreLabel.innerHTML = this.score.toString();
    }

    saveScore(score: number = this.score): number {
        let position: number = 0;
        while(score < this.highscores[position] && position < this.highscores.length){
            position++
        }

        this.highscores.splice(position, 0, score);
        this.highscores = this.highscores.slice(0, 5);
        localStorage.setItem(this.id, JSON.stringify(this.highscores)); 
        return position + 1;
    }

    resetScore(): void {
        this.score = 0;
        this.scoreLabel.innerHTML = this.score.toString();
    }

    getScore(): number {
        return this.score;
    }

    getHighscores(): number[] {
        return this.highscores;
    }

    updateHighscore(id: string){
        let highScoreContainer: HTMLDivElement = <HTMLDivElement>document.getElementById(id);
        if(highScoreContainer == null){
            console.warn("No highscore div found for id:", id);
        }

        highScoreContainer.innerHTML = '';
        for(let i = 1; i <= 5; ++i){
            let highScore: HTMLDivElement = document.createElement('div');
            let currScore: number = 0
            if(this.highscores[i - 1]){
                currScore = this.highscores[i - 1];
            }
            highScore.innerHTML = i.toString() + ": " + currScore;
            highScoreContainer.appendChild(highScore);
        }
    }
}

let score = new Score('div-score');
Screens.addScreen({id: 'screen-highscores', init: () => {}, run: () => { score.updateHighscore('highscores')}});
(<HTMLDivElement>document.getElementById('button-highscores')).addEventListener('click', () => Screens.showScreen('screen-highscores'));
(<HTMLDivElement>document.getElementById('button-back-highscores')).addEventListener('click', () => Screens.showScreen('screen-main-menu'));

export default score;