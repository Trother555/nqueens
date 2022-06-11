import { Application, Container, Graphics, interaction, Sprite, Texture, RenderTexture, SCALE_MODES} from 'pixi.js';

const config = {
    cell_size: 50,
    bg_field_color: 0x3fb797,
    
    // line 
    line_color: 0x3a2e4e,
    line_width: 2,
    
    //selection
    selection_color: 0x00ffbb,
    selection_border_width: 3,

    // hint
    hint_border_width: 2,
    hint_color: 0x3a2e4e
}

class InnerBoard {
    board: boolean[][]
    diag: boolean[]
    sub_diag: boolean[]
    row: boolean[]
    col: boolean[]
    n: number

    constructor(n: number) {
        this.n = n
        this.board = Array(n).fill(false).map(() => Array(n).fill(false))
        this.diag = Array(2*n+1).fill(false);
        this.sub_diag = Array(2*n+1).fill(false);
        this.row = Array(n).fill(false);
        this.col = Array(n).fill(false);
    }

    can_occupy(i: number, j: number): boolean {
        if (this.board[i][j]) {
            return false;
        }
        // check main diag of i, j
        if (this.diag[i-j+this.n]) {
            return false;
        }
        // check sub diag of i, j
        if (this.sub_diag[i+j]) {
            return false;
        }
        if (this.row[i]) {
            return false;
        }
        if (this.col[j]) {
            return false;
        }
        return true;
    }

    occupy(i: number, j: number): boolean {
        if (this.can_occupy(i, j)) {
            this.board[i][j] = true;
            this.diag[i-j+this.n] = true;
            this.sub_diag[i+j] = true;
            this.row[i] = true;
            this.col[j] = true;
            return true;
        }
        return false;
    }
}

export class Board extends Container {
    app: Application

    board: Graphics
    selection: Graphics
    hint: Graphics
    queen: Sprite

    cell_size: number
    config: any
    field_size: number
    inner_board: InnerBoard

    n: number

    constructor(app: Application, n: number) {
        super();

        this.app = app;
        this.n = n;

        this.inner_board = new InnerBoard(n)

        const rect = new Graphics();
        this.addChild(rect);

        
        // draw the square
        rect.beginFill(config.bg_field_color);
        const field_size = config.cell_size*n;
        this.field_size = field_size;
        rect.drawRect(0, 0, field_size, field_size);
        rect.endFill();

        // make mask
        const mask = new Graphics();
        mask.beginFill(0xffffff);
        mask.drawRect(0, 0, field_size, field_size);
        mask.endFill();
        this.mask = mask;
        
        // draw the lines
        const draw_line = function(graphics: Graphics, from_x: number, from_y: number, to_x: number, to_y: number) {
            graphics.moveTo(from_x, from_y);
            graphics.lineTo(to_x, to_y);
        }
        rect.lineStyle(config.line_width, config.line_color)
        for (let i = config.cell_size; i < field_size; i+=config.cell_size) {
            draw_line(rect, 0, i, field_size, i);
            draw_line(rect, i, 0, i, field_size);
        }

        // init selection rect
        const selection_rect = new Graphics();
        rect.addChild(selection_rect);
        selection_rect.visible = false;
        const bw = config.selection_border_width;
        selection_rect
            .beginFill(config.selection_color)
            .drawRect(0, 0, config.cell_size, config.cell_size)
            .beginHole()
            .drawRect(bw, bw, config.cell_size - 2*bw, config.cell_size - 2*bw)
            .endHole();
        
        this.selection = selection_rect

        // init queen's hint
        const hint = new Graphics();
        // const hint = rect;
        hint.lineStyle(config.hint_border_width, config.hint_color);
        for (let i = -field_size; i <= field_size; i+=config.cell_size) {
            for (let j = -field_size; j <=field_size; j+=config.cell_size) {
                if (i == 0 && j == 0) {
                    continue;
                }
                let a = 5
                if ((i-j) == 0 || (i+j) == 0 || i == 0 || j == 0) {
                    draw_line(hint, i + a, j + a, i+config.cell_size - a, j+config.cell_size - a);
                    draw_line(hint, i + a, j+config.cell_size - a, i+config.cell_size - a, j + a);
                }
            }
        }
        this.hint = hint;
        selection_rect.addChild(hint)

        // init queen
        // TODO: refactor
        const queen = Sprite.from('assets/queen.png');
        queen.anchor.set(0.5, 0.5);
        queen.x = config.cell_size/2;
        queen.y = config.cell_size/2;
        queen.width = config.cell_size - 5;
        queen.height = config.cell_size - 5;
        this.queen = queen;
        hint.addChild(queen);
        
        
        // event handlers
        this.interactive = true
        this.on('mousemove', this.mouse_move)
        this.on('mouseover', this.mouse_over)
        this.on('mouseout', this.mouse_out)
        this.on('click', this.mouse_click)

        // init properties
        this.config = config;
        this.board = rect;
        this.cell_size = config.cell_size;
    }

    global_to_cell(x: number, y: number) : number[] {
        const i = Math.floor(x/this.cell_size);
        const j = Math.floor(y/this.cell_size);
        if (0 <= i && i < this.n && 0 <= j && j < this.n) {
            return [i, j]
        }
        return []
    }

    highlight_square(x: number, y: number) {
        let square_x = this.cell_size*(Math.floor(x/this.cell_size));
        let square_y = this.cell_size*(Math.floor(y/this.cell_size));
        this.selection.setTransform(square_x, square_y);      
    }

    mouse_move(event: interaction.InteractionEvent) {
        if (!this.selection.visible) {
            return;
        }
        const local = event.data.global;
        this.highlight_square(local.x, local.y);
    }

    mouse_over(event: interaction.InteractionEvent) {
        this.selection.visible = true;
    }
    
    mouse_out(event: interaction.InteractionEvent) {
        this.selection.visible = false;
    }

    mouse_click(event: interaction.InteractionEvent) {
        // TODO: refactor
        const coords = this.global_to_cell(event.data.global.x, event.data.global.y);
        if (coords.length == 0) {  //  out of box do nothing
            return;
        }
        if (!this.inner_board.can_occupy(coords[0], coords[1])) {
            return;
        }
        this.inner_board.occupy(coords[0], coords[1]);
        const t = RenderTexture.create({width: this.field_size, height: this.field_size});
        
        this.app.renderer.render(this.hint, t, false, this.selection.transform.worldTransform)
        let s = Sprite.from(t);
        this.addChild(s);
    }
}
