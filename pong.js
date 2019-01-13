class ParOrdenado
{
	constructor(x = 0, y = 0)
	{
		this.x = x;
		this.y = y;
	}
	get len()
	{
		return Math.sqrt(this.x*this.x + this.y*this.y);
	}
	set len(value)
	{
		const fact = value / this.len;
		this.x *= fact;
		this.y *= fact;
	}
}

class Rectangulo
{
	constructor(w, h) 
	{
		this.posicion = new ParOrdenado;
		this.size = new ParOrdenado(w, h);
	}
	get left()
	{
		return this.posicion.x - this.size.x / 2;
	}
	get right()
	{
		return this.posicion.x + this.size.x / 2;
	}
	get top()
	{
		return this.posicion.y - this.size.y / 2;
	}
	get bottom()
	{
		return this.posicion.y + this.size.y / 2;
	}
}

class Ball extends Rectangulo
{
	constructor() 
	{
		super(10, 10);
		this.velocidad = new ParOrdenado;
	}
}

class Player extends Rectangulo
{
	constructor()
	{
		super(20, 100);
		this.score = 0;
	}
}

class Pong
{
	constructor(canvas)
	{
		this._canvas = canvas;
		this._context = canvas.getContext('2d');

		this.ball = new Ball;


		this.players = [
			new Player,
			new Player,
		];

		this.players[0].posicion.x = 40;
		this.players[1].posicion.x = this._canvas.width - 40;
		this.players.forEach(player => {
			player.posicion.y = this._canvas.height / 2;
		});

		let lastTime;
		const callback = (millis) => 
		{
			if(lastTime) 
			{
				this.update((millis - lastTime) / 1000);
			}
			lastTime = millis;
			requestAnimationFrame(callback);
		};
		callback();

		//ARRAY OF CANVASES
		// - por cada string crea un canvas
		// - en cada canvas dibujamos un cuadrado blanco por cada caracter
		this.CHAR_PIXEL = 10;
		this.CHARS = [

            '111101101101111',
            '010010010010010',
            '111001111100111',
            '111001111001111',
            '101101111001001',
            '111100111001111',
            '111100111101111',
            '111001001001001',
            '111101111101111',
            '111101111001111',

        ].map(str => {
            const canvas = document.createElement('canvas');
            canvas.width = this.CHAR_PIXEL * 3;
            canvas.height = this.CHAR_PIXEL * 5;
            const context = canvas.getContext('2d');
            context.fillStyle = '#fff';

            str.split('').forEach((fill, i) => {
                if (fill === '1') 
                {
                    context.fillRect(
                    	(i % 3) * this.CHAR_PIXEL, 
                    	(i/3 | 0) * this.CHAR_PIXEL, 
                    	this.CHAR_PIXEL, this.CHAR_PIXEL);
                }
            });
            return canvas;
        });

		this.reset();
	}

	collide(player, ball)
	{
		if(player.left < ball.right && player.right > ball.left)
		{
			if(player.top < ball.bottom && player.bottom > ball.top)
			{
				const len = ball.velocidad.len;
				ball.velocidad.x = -ball.velocidad.x;
				ball.velocidad.y += 300*(Math.random() -0.5);
				ball.velocidad.len * 1.05;
			}
		}
	}

	draw()
	{
		this._context.fillStyle = '#000';
		this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);

		this.drawRectangle(this.ball);
		this.players.forEach(player => this.drawRectangle(player));		
		this.drawScore();
	}
    drawScore()
    {
        const align = this._canvas.width / 3;
        const cw = this.CHAR_PIXEL * 4;

        this.players.forEach((player, index) => {
            const chars = player.score.toString().split('');
            const offset = align * (index + 1) - (cw * chars.length / 2) + this.CHAR_PIXEL / 2;
            
            chars.forEach((char, pos) => {
                this._context.drawImage(this.CHARS[char|0], offset + pos * cw, 20);
            });
        });
    }
	drawRectangle(rectangulo)
	{
		this._context.fillStyle = '#fff';
		this._context.fillRect(rectangulo.left, rectangulo.top, 
			                   rectangulo.size.x, rectangulo.size.y);
	}



	reset()
	{
		this.ball.posicion.x = this._canvas.width / 2;
		this.ball.posicion.y = this._canvas.height / 2;

		this.ball.velocidad.x = 0;
		this.ball.velocidad.y = 0;
	}

	start()
	{
		if(this.ball.velocidad.x === 0 && this.ball.velocidad.y === 0)
		{
			this.ball.velocidad.x = 300 * (Math.random() > .5 ? 1 : -1);
			//console.log(this.ball.velocidad.x);
			this.ball.velocidad.y = 300 * (Math.random() * 2 -1);
			//console.log(this.ball.velocidad.y);
			this.ball.velocidad.len = 200;
			//console.log(this.ball.velocidad.len);
			//console.log(this.ball.velocidad.x);
			//console.log(this.ball.velocidad.y);


		}
	}

	update(deltaTime) 
	{
		this.ball.posicion.x += this.ball.velocidad.x * deltaTime;
		this.ball.posicion.y += this.ball.velocidad.y * deltaTime;
		
		if(this.ball.left < 0 || this.ball.right > this._canvas.width) 
		{
			const playerId =  this.ball.velocidad.x < 0 | 0;
			this.players[playerId].score++;
			this.reset();
		}

		if(this.ball.top < 0 || this.ball.bottom > this._canvas.height) 
		{
			this.ball.velocidad.y =  -this.ball.velocidad.y;
		}

		this.players[1].posicion.y = this.ball.posicion.y;
		this.players.forEach(player => this.collide(player, this.ball));
		this.draw();
	}
}

const canvas = document.getElementById('pong');
const pong = new Pong(canvas);

canvas.addEventListener('mousemove', event => {
	pong.players[0].posicion.y = event.offsetY;
});


canvas.addEventListener('click', event => {
	pong.start();
});
