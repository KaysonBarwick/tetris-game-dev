namespace Screens {
    export interface Screen {
        id: string;
        run?: () => void;
        init?: () => void;
    }
    let screens: { [id: string] : Screen } = {};

    export function showSubScreen(id: string) {
        let screen = screens[id];
        if(screen){
            document.getElementById(id).classList.add('sub-active');
        }
    }

    export function showScreen(id: string) {
        for(let screen in screens){
            let div: HTMLDivElement = <HTMLDivElement>document.getElementById(screens[screen].id);
            div.classList.remove('sub-active');
            div.classList.remove('active');
        }

        let screen = screens[id];
        if(screen){
            document.getElementById(id).classList.add('active');
            if(screen.run){
                screen.run();
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

    Screens.addScreen({id: 'screen-options', init: () => {}, run: () => {}});
    (<HTMLDivElement>document.getElementById('button-options')).addEventListener('click', () => Screens.showScreen('screen-options'));
    (<HTMLDivElement>document.getElementById('button-back-options')).addEventListener('click', () => Screens.showScreen('screen-main-menu'));

    Screens.addScreen({id: 'screen-credits', init: () => {}, run: () => {}});
    (<HTMLDivElement>document.getElementById('button-credits')).addEventListener('click', () => Screens.showScreen('screen-credits'));
    (<HTMLDivElement>document.getElementById('button-back-credits')).addEventListener('click', () => Screens.showScreen('screen-main-menu'));

    Screens.addScreen({id: 'screen-main-menu'})
    Screens.showScreen('screen-main-menu');
}
