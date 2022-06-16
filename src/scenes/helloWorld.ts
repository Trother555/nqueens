import { Application, Container } from 'pixi.js';
import { Board } from './board';

export class HelloWorld extends Container {
    app: Application;
    size: number

    constructor(app: Application, n: number) {
        super();
        this.app = app;
        
        const board = new Board(app, n);
        this.size = board.field_size;
        this.addChild(board);
    }
}
