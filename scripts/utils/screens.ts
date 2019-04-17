namespace Screens {
    export interface Screen {
        id: string;
        run?: (any?) => void;
        init?: (any?) => void;
        leave?: (any?) => void;
    }
    let screens: { [id: string] : Screen } = {};

    export function showSubScreen(id: string) {
        let screen = screens[id];
        if(screen){
            document.getElementById(id).classList.add('sub-active');
            if(screen.run){
                screen.run();
            }
        }
    }

    export function showScreen(id: string, param?: any) {
        for(let screen in screens){
            let div: HTMLDivElement = <HTMLDivElement>document.getElementById(screens[screen].id);
            if(div.classList.contains('sub-active') || div.classList.contains('active')){
                if(screens[screen].leave){
                    screens[screen].leave();
                }
            }
            div.classList.remove('sub-active');
            div.classList.remove('active');
        }

        let screen = screens[id];
        if(screen){
            document.getElementById(id).classList.add('active');
            if(screen.run){
                screen.run(param);
            }
        }
    }

	export function addScreen(screen: Screen) {
        if(document.getElementById(screen.id) == null){
            console.warn("Screen div not found. id: ", screen.id);
        }

        screens[screen.id] = screen;
        if(screen.init){
            screen.init();
        }
    }

    Screens.addScreen({id: 'screen-characters', init: () => {}, run: () => {}});
    (<HTMLDivElement>document.getElementById('button-characters')).addEventListener('click', () => Screens.showScreen('screen-characters'));    
    (<HTMLDivElement>document.getElementById('button-yoshi')).addEventListener('click', () => Screens.showScreen('screen-game', {char: 'yoshi', init: true}));
    (<HTMLDivElement>document.getElementById('button-raven')).addEventListener('click', () => Screens.showScreen('screen-game', {char: 'raven', init: true}));
    (<HTMLDivElement>document.getElementById('button-poochy')).addEventListener('click', () => Screens.showScreen('screen-game', {char: 'poochy', init: true}));
    (<HTMLDivElement>document.getElementById('button-blargg')).addEventListener('click', () => Screens.showScreen('screen-game', {char: 'blargg', init: true}));
    (<HTMLDivElement>document.getElementById('button-froggy')).addEventListener('click', () => Screens.showScreen('screen-game', {char: 'froggy', init: true}));
    (<HTMLDivElement>document.getElementById('button-lakitu')).addEventListener('click', () => Screens.showScreen('screen-game', {char: 'lakitu', init: true}));
    (<HTMLDivElement>document.getElementById('button-back-characters')).addEventListener('click', () => Screens.showScreen('screen-main-menu'));

    Screens.addScreen({id: 'screen-credits', init: () => {}, run: () => {}});
    (<HTMLDivElement>document.getElementById('button-credits')).addEventListener('click', () => Screens.showScreen('screen-credits'));
    (<HTMLDivElement>document.getElementById('button-back-credits')).addEventListener('click', () => Screens.showScreen('screen-main-menu'));

}

