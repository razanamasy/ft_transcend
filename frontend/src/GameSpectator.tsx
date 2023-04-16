//import './styles/GameCanevas.css'
import {  useState, useEffect} from 'react';
import { useAuth } from './hook/useAuth'
import { useSocket } from './hook/useSocket';
// var socket = io();
var canvas: any;

const PLAYER_HEIGHT = 100;
const PLAYER_WIDTH = 5;

export const GameSpectator = (props: any) => {


	const {auth} = useAuth();
	const {socketPong} = useSocket();
	const [score, setscore] = useState<{one : number, two : number}>({one: 0, two : 0})
	const [once, setonce] = useState<boolean>(false)
//	const roomName = auth.name + "Game"
	//INITIALISATION AVEC START

				
	useEffect(() => {
				socketPong.on('endOfMatch', (data : any) => 
				{
						setscore(data.score)
				})
				socketPong.on('goal', (data : any) => 
				{
						setscore(data.score)
				})
	}, []);

	useEffect(() => {
			if (once == false)
			{
				init_play()
				setonce(true);
			}
			socketPong.on('racketSpect', (data : any) => {
				canvas.game.ball.x = data.ball.x; canvas.game.ball.y = data.ball.y;
				if (data.player == 'player1')
				{
					canvas.game.player.y = data.position;
				}
				else
				{
					canvas.game.computer.y = data.position;
				}
		})
	}, []);
 


	function init_play()
	{
	if (once == true)
		return ;
	interface n_player
	{
		x: number;
		y: number;
		score: number;
		ratio: number
	};

	interface n_ball
	{
		radius: number,
		x: number;
		y: number;
		speed_x: number;
		speed_y: number;
	};
	canvas = document.getElementById('canvas');
	let m_player:n_player = {x:0, y:canvas.height / 2 - PLAYER_HEIGHT / 2, score:0, ratio:1};
	let m_computer:n_player = {x:(canvas.width - PLAYER_WIDTH), y:(canvas.height / 2 - PLAYER_HEIGHT / 2), score:0, ratio:0.75};
	let m_ball:n_ball = {radius:5, x:canvas.width/2, y:(canvas.height / 2), speed_x:3, speed_y:Math.random() * 3};

	interface game
	{
		player: n_player;
		computer: n_player;
		ball: n_ball;
	};
	let m_game:game = {player:m_player, computer:m_computer, ball:m_ball};
	canvas.game = m_game;
	draw();
	play();

	}

	function playerMove(mousemove: any) {
	// Get the mouse location in the canvas
	var canvasLocation = canvas.getBoundingClientRect();
	var mouseLocation = mousemove.clientY - canvasLocation.top;

	if (mouseLocation < PLAYER_HEIGHT / 2) 
	{
		canvas.game.player.y = 0;
	} 
	else if (mouseLocation > canvas.height - PLAYER_HEIGHT / 2) 
	{
		canvas.game.player.y = canvas.height - PLAYER_HEIGHT;
	} 
	else 
	{
		canvas.game.player.y = mouseLocation - PLAYER_HEIGHT / 2;
	}
	}


	function play(){

		setInterval(() => {draw()}, 50);
	}

	function draw() {
	var context = canvas.getContext('2d');


	// Draw field
	context.fillStyle = 'greenyellow';
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = 'black';
	context.fillRect(1, 1, (canvas.width -2), (canvas.height - 2));
	// Draw middle line
	context.strokeStyle = 'white';
	context.beginPath();
	context.moveTo(canvas.width / 2, 0);
	context.lineTo(canvas.width / 2, canvas.height);
	context.stroke();

	// Draw players
	context.fillStyle = 'white';


	context.fillRect(0, canvas.game.player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
	context.fillRect(canvas.width - PLAYER_WIDTH, canvas.game.computer.y, PLAYER_WIDTH, PLAYER_HEIGHT);



	 //Draw ball
	   	context.beginPath();
	context.fillStyle = 'white';
	/*
	if (props.infos.modeGame == 'Speedy')
	{
		const color = `hsl(${Math.random() * 360}, 40%, 55%)`
		context.fillStyle = color;
	}
	*/

	context.arc(canvas.game.ball.x, canvas.game.ball.y, canvas.game.ball.radius, 0, Math.PI * 2, false);
	context.fill();
	}


	function reset()
	{
	// Set ball and players to the center
	canvas.game.ball.x = canvas.width / 2;
	canvas.game.ball.y = canvas.height / 2;
	canvas.game.player.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
	canvas.game.computer.y = canvas.height / 2 - PLAYER_HEIGHT / 2;

	}


    return (
	<div id="pong">
	<h1>you are watching this</h1>
			<p id="scores">{props.infos ? props.infos.nickname1 : "Nobody"} <em id="player-score">{score?.one}</em> - {props.infos ? props.infos.nickname2 : "Nobody"} : <em id="computer-score">{score?.two}</em>Mode {props.infos?.modeGame}  </p>
    <canvas id="canvas" width="800" height="600"></canvas>   
    </div>
	)
}
