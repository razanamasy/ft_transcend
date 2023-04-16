import './styles/GameCanevas.css'
import {  useState, useEffect} from 'react';
import { useAuth } from './hook/useAuth'
import { useSocket } from './hook/useSocket';
import useAxiosPrivate from './hook/useAxiosPrivate';
import { useLocation, useNavigate } from "react-router-dom";
import ReactDOM from 'react-dom';
import Countdown from 'react-countdown';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
// var socket = io();
var anim : any;
var canvas: any;
let intervalID: any;

const PLAYER_HEIGHT = 100;
const PLAYER_WIDTH = 5;
const MAX_SPEED = 12;


export const GameCanevas = (props: any) => {


		const {auth} = useAuth();
		const {socketPong} = useSocket();
		const {socketConnexion} = useSocket();
		const [score, setscore] = useState<{one : number, two : number}>({one: 0, two : 0})
		const [start, setStart] = useState<boolean>(false)
		const [waitMsg, setWaitMsg] = useState<boolean>(false)
		const [stop, setStop] = useState<boolean>(false)
		const [onGoing, setOnGoing] = useState<boolean>(true)
		const [alreadyWaitingMsg, setAlreadyWaitingMsg] = useState<boolean>(false)
//		const [intervalID, setIntervalID] = useState(0);
		const [callMonitor, setCallMonitor] = useState(0);
		const [endMessage, setEndMessage] = useState(false);
		const [showSpinner, setShowSpinner] = useState(false);

		const axiosPrivate = useAxiosPrivate();
		var anim : any;

		//Check if the waiting MSG has to be set or not arriving in the game if yes, we toggle the timeout
		//Else need to initplay() to display the match
		useEffect(() => {
				const checkStatus = async () => {
							const myStatus = await axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/getstatus" , JSON.stringify({info: {name : auth.name}}))
							if (myStatus.data.status != 2)
							{
								setWaitMsg(true);
								//Finnaly we toggle the timer on acceptInvitation AND foundAGame on the back
								//socketPong.emit("toggleTimeOut", {player1: props.infos.player1, player2: props.infos.player2, roomName: props.infos.roomName})
							}
							else
								init_play();
				}
				checkStatus();
		}, []);

		//Calling the monitor if callMonitor is true (setCallMonitor in ledzgo)
		useEffect(() => {

			const callMonitorFct = () => {
							if (callMonitor == 1)
							{
											intervalID = setInterval(() => {
												socketPong.emit("gameMonitor", {player1: props.infos.player1, player2: props.infos.player2, roomName: props.infos.roomName})
											}, 1000);
							}
							else
							{
									clearInterval(intervalID)
									return () => {clearInterval(intervalID)};
							}
			}
			callMonitorFct();
		}, [callMonitor]);

		//If call monitor trigger to 2 so the game has already been delete and all, reload (4000 to see the end message the time everything's done before come again and have the message Ready again)
		useEffect(() => {
			if (callMonitor == 2)
				setTimeout(function () {window.location.reload()}, 4000);

		}, [callMonitor])

		//Get the info LEDZGO
		useEffect(() => {
				
				socketPong.on("ledzgo", async (data: any) => 
					{
						//Trigger the countdown
						setStart(true);
									

						//Hide wait modaml
						setWaitMsg(false)

						//Call monitor
						setCallMonitor(1)

						//To fit with the countdown reder
						setTimeout(async function() { 
							setStart(false) 
							init_play()
						},3000);
				});

		}, []);





		//Socket receive when ledzgo cause it trigger the socket emit back, and so the socket on front
		//It also listen to the monitor (victory) and some ToggleTimeout Residues (victory) --> but protect from any action in back
		useEffect(() => {

								
								socketPong.on('goal', (data : any) => 
								{
										setscore(data.score)
								})

								//If a window is on a wainting list it hideThe waitMessage for other window of same user (in game Player match 1 or 2)
								socketPong.on('hideWait', (data : any) => 
								{
										if (data?.score != undefined )
											setscore(data.score)
								})

								//In back, every infos is delete before we receive this	
								socketPong.on('victory', (data : any) => 
								{

										//	setOnGoing(false);
											setEndMessage(true);

											//Try to shut down monitor if it doesn't work it act only when onGoingGame map exist on back so only the first then no
											setCallMonitor(2);


											setStop(true);

										//Do it in the back  
									//	await handleStatus({name: auth.name, status:1})
											reset();
											setscore(data.score) ; 
											draw();
											return (window.cancelAnimationFrame(anim)); 
								})

								socketPong.on('ballPosition', (data : any) => 
								{
										if (canvas?.game)
											canvas.game.ball.x = data.ball.x; canvas.game.ball.y = data.ball.y; 
								})

								//it is receive only after calling racketPosition AND onGiongGameMap in the back but it is deleted before we receive victory
						//so after victory we shouldn't receive it
								socketPong.on('racketPosition', (data : any) => 
								{
										if (canvas?.game)
											canvas.game.computer.y = data.position;
								})
		}, []);

		const handleStatus = async (info: {name: string, status: number}) => {

				try {
				const data = await axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/updatestatus", 
						{
								info
						},
						{
								withCredentials: true,
								headers: 
								{
										'Content-Type' : 'application/json'
								}
						}
				);
				}
				catch (e)
				{
				}
				socketConnexion.emit('changestatus', {name: info.name, status:info.status});
		}


		function init_play()
		{
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
				setTimeout(() => {
						canvas.addEventListener('mousemove', playerMove, false);
						play();
				}, 2000)

		}

		function playerMove(mousemove: any) {
				// Get the mouse location in the canvas
				var canvasLocation = canvas.getBoundingClientRect();
				var mouseLocation = mousemove.clientY - canvasLocation.top;

				var height = canvasLocation.bottom - canvasLocation.top;

				var ratio = 600 / height;


				var pos = Math.round((mouseLocation) * ratio - (PLAYER_HEIGHT / 2) * ratio);

				if (pos < 0)
				{
						canvas.game.player.y = 0;
				}
				else if (pos > 500)
				{
						canvas.game.player.y = 500;
				}
				else
				{
						canvas.game.player.y = Math.round((mouseLocation) * ratio - (PLAYER_HEIGHT / 2) * ratio);
				} 
		}



		function play(){
				anim = undefined
				draw();
				if (props.infos.player1 == auth.name)
				{

						socketPong.emit('racketPosition', {mode: props?.infos?.modeGame, player: 'player1' , myname : auth?.name, opponant: props?.infos?.player2, position: canvas?.game?.player?.y, roomName: props?.infos?.roomName, onGoing: onGoing}, (resp : any) => 
								{
										if (resp.msg == 'finish')
										{
												setCallMonitor(2);
												canvas.removeEventListener('mousemove', playerMove, false);
												setscore(resp.score) ; 
												reset();
												draw();
												window.cancelAnimationFrame(anim);
										}
								})

				}
				else
				{

						socketPong.emit('racketPosition', {mode: props?.infos?.modeGame, player: 'player2', myname : auth?.name, opponant: props?.infos?.player1, position: canvas?.game?.player?.y, roomName: props?.infos?.roomName, onGoing: onGoing}, (resp: any) =>
								{
										if (resp.msg == 'finish')
										{

												setCallMonitor(2);
												canvas.removeEventListener('mousemove', playerMove, false);
												setscore(resp.score) ; 
												reset();
												draw();
												window.cancelAnimationFrame(anim);
										}
								});
				}

						anim = window.requestAnimationFrame(play);

		}



		function draw() {
								var context = canvas?.getContext('2d');

								// Draw field
								if (context?.fillStyle)
								{
								context.fillStyle = 'green';
								context.fillRect(0, 0, canvas.width, canvas.height);
								context.fillStyle = 'black';
								context.fillRect(1, 1, (canvas.width -2), (canvas.height - 2));
								//context.fillStyle = 'rgba(0, 0, 0, 0.2)';
								//context.fillStyle = 'black';
								context.fillStyle = `rgba(0, 0, 0, 0.3)`;
								context.fillRect(1, 1, (canvas.width -2), (canvas.height - 2));
								// Draw middle line
								context.strokeStyle = 'white';
								context.beginPath();
								context.moveTo(canvas.width / 2, 0);
								context.lineTo(canvas.width / 2, canvas.height);
								context.stroke();

								// Draw players
								context.fillStyle = 'white';

								if (props.infos.player1 == auth.name)
								{
										context.fillRect(0, canvas.game.player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
										context.fillRect(canvas.width - PLAYER_WIDTH, canvas.game.computer.y, PLAYER_WIDTH, PLAYER_HEIGHT);
								}
								else
								{
										context.fillRect(0, canvas.game.computer.y, PLAYER_WIDTH, PLAYER_HEIGHT);
										context.fillRect(canvas.width - PLAYER_WIDTH, canvas.game.player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
								}

								//Draw ball
								context.beginPath();

								if (props.infos.modeGame == 'Speedy')
								{
										const color = `hsl(${Math.random() * 360}, 40%, 55%)`
										context.fillStyle = color;
								}


								//context.fillStyle = `hsl(0, 40%, 55%)`
								context.arc(canvas.game.ball.x, canvas.game.ball.y, canvas.game.ball.radius, 0, Math.PI * 2, false);
								context.fill();
								}
		}

		/*function stop()
		{
				canvas.removeEventListener('mousemove', playerMove, false);
				reset();
				handleStatus({name: auth.name, status:1});
				draw();
		}*/

		function reset()
		{
				// Set ball and players to the center
				if (canvas?.game)
				{
					canvas.game.ball.x = canvas.width / 2;
					canvas.game.ball.y = canvas.height / 2;
					canvas.game.player.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
					canvas.game.computer.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
				}

		}

		const handleClose = () => {
				window.location.reload();
		}

		const handleReady = async () => {

					const myStatus = await axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/getstatus" , JSON.stringify({info: {name : auth.name}}))
					const ret = await axiosPrivate.get("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/onGoingGame/" + auth.name);

					//en cliquant on envoi le premier arrivant, au back si ce sont les même il ne fera rien de plus 
					if (myStatus.data.status == 1) 
					{
									//Normalement pas besoin mais au cas ou le jeu s'est delete trop tard ça s'affiche quand même (happened once)
									if (!ret.data[0])
												window.location.reload();
									else {
												setShowSpinner(true);
									socketPong.emit("playerReady", {username: auth.name, readyName: props.infos.roomName, player1: props.infos.player1, player2: props.infos.player2, infos: props.infos}, (data: any) => { if (data.msg == 'myself') setAlreadyWaitingMsg(true) ; //this is for ALL window not only me
													});
									}
					}
					if (myStatus.data.status == 2) // Pour ceux qui viennent apres mais en vrai il pourront même pas cliquer dessus pcq le modal s'affichage pas 
					{
						if (ret.data[0])
							init_play();
					}
		}


		return (
				<div id="pong">

							<Modal
								show={waitMsg}
								backdrop="static"
								keyboard={false}
							>
								<Modal.Header >
									<Modal.Title>Are you ready ?</Modal.Title>
								</Modal.Header>
								<Modal.Body>
										
								if you and your opponant don't show in 10s <br/>
								the match is over<br/>
								{
									showSpinner ? 
										<Spinner animation="grow" />
											:
											<div></div>
								}
								{
												alreadyWaitingMsg ? 'You are already waiting' : '' 
								}

								</Modal.Body>
								<Modal.Footer>
									<Button variant="secondary" onClick={handleReady}>
										I'm Ready !
									</Button>
								</Modal.Footer>
							</Modal>

							<Modal
								show={endMessage}
								onHide={handleClose}
								backdrop="static"
								keyboard={false}
							>
								<Modal.Header closeButton>
									<Modal.Title>Match end !</Modal.Title>
								</Modal.Header>
								<Modal.Body>
										
						{props.infos ? props.infos.nickname1 : "Nobody"} {score.one}
							<br/>
						{props.infos ? props.infos.nickname2 : "Nobody"} {score.two}

								</Modal.Body>
								<Modal.Footer>
									<Button variant="secondary" onClick={handleClose}>
										Ok!
									</Button>
								</Modal.Footer>
							</Modal>

							{start ? 
						  	<Countdown date={Date.now() + 3000} />
								:
								<div></div>
							}

						<h1>Pong game {auth?.nickname} </h1>
						<p id="scores">{props.infos ? props.infos.nickname1 : "Nobody"} <em id="player-score">{score.one}</em> - {props.infos ? props.infos.nickname2 : "Nobody"} : <em id="computer-score">{score.two}</em> Mode {props.infos.modeGame} </p>
						<div id="area">
						<canvas id="canvas" width="800" height="600"></canvas>
						</div>
				</div>
		)
}




