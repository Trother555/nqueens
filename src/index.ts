import * as PIXI from 'pixi.js';
import { HelloWorld } from './scenes/helloWorld';

const load = (app: PIXI.Application) => {
    return new Promise<void>((resolve) => {
        app.loader.add('assets/queen.png').load(() => {
            resolve();
        });
    });
};

interface F { (): any; app: PIXI.Application; }

const main = async () => {
    // Main app
    let app = new PIXI.Application();


    // Display application properly
    document.body.style.margin = '5';
    app.renderer.view.style.display = 'block';

    // Load assets
    await load(app);
    // document.body.appendChild(app.view);
    document.getElementById("board")?.appendChild(app.view);

    const create_board = () => {
        const n = Number((<HTMLInputElement>document.getElementById("board_size")).value)
        create_board_helper(app, n);
    };
    document.getElementById("create_board")!.onclick = create_board;
    create_board_helper(app, 5);
};

const create_board_helper = (app: PIXI.Application, n: number) => {
    if (n <= 3) {
        console.log('Invalid board size');
        return null;
    }
    app.stage.removeChildren();
    // Set scene
    var scene = new HelloWorld(app, n);
    app.renderer.resize(scene.size, scene.size)
    app.stage.addChild(scene);
}

main();
