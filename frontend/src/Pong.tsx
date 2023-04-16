import React, { useState, useEffect } from 'react';
import { useSocket } from './hook/useSocket';
import './App.css';
import { useAuth } from './hook/useAuth';
import useAxiosPrivate from './hook/useAxiosPrivate'
import { GameCanevas } from './GameCanevas';
import { PongReceptionRoom } from './PongReceptionRoom';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useLocation } from 'react-router-dom';

export const Pong = () => {

	const { auth } = useAuth();
	const { isInviter } = useAuth();
	const { myInvited } = useAuth();
	const { inInviteProcess} = useAuth();
	const {socketPong} = useSocket();
	const axiosPrivate = useAxiosPrivate();
	const [gameInfos, setGameInfos] = useState();
	const [status, setStatus] = useState(0); // 1) player 0) else
//	const [isAccepted, setIsAccepted] = useState(false);
//	const [msgAccepted, setMsgAccept] = useState("");

	const [show, setShow] = useState(false);
	const [showDecline, setShowDecline] = useState(false);


//	const [wait, setWait] = useState(false);
	const { state } = useLocation();

	useEffect(() => {

			socketPong.on('isAccepted', (data: any) => {
				setShow(false);
		})
		return () => {
			socketPong.off('isAccepted');
		};
	}, []);

	//Handle clone decline alert
	const handleCloseDecline = () => {
		setShowDecline(false)
	};

	//SOCKET EMIT CANCEL INVIT
	const handleClose = () => {

		socketPong.emit("cancelInvitation", {inviter: auth.name, invited: myInvited});
		setShow(false)
	};

	//SOCKET ON IS ACCEPTED DANS LA NAVBAR

	useEffect(() => {

		const checkInvitation = async () => {

				const isInviteProcess = await axiosPrivate.get("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/isInviteProcess/" + auth.name)
				const isInviter = isInviteProcess.data.isInviter;
				const isInvited = isInviteProcess.data.isInvited;

				if (isInviter)
				{
					setShow(true);
				}
		}
		checkInvitation();
	}, [])


	//USE EFFECT FOR THE MODAL
	useEffect(() => {
		if ((inInviteProcess && isInviter))
		{
			setShow(true);
		}
	}, [])

	//USE EFFECT THAT FETCH IF THERE'S ON GOING GAME --> SWITCH TO GAME CANEVAS 
	//DEPEND OF IS ACCEPTED (SOCKET ON PLUS HAUT)
	useEffect(() => {
		const getOnGoingGame = async () => {
			try {

				const ret = await axiosPrivate.get("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/pong/onGoingGameByPlayer/" + auth.name);

				if (ret.data[0])
				{
					if (ret?.data?.msg != 'no games')
					{
					setShow(false)
					setGameInfos(ret.data[0]);
					setStatus(1);
					}
				}	
			}
			catch (e) {
			}
		}
		getOnGoingGame();
	}, [])

	



	return (
		<div>

			<Modal
				show={showDecline}
				onHide={handleCloseDecline}
				backdrop="static"
				keyboard={false}
			>
				<Modal.Header closeButton>
					<Modal.Title>Decline your invitation</Modal.Title>
				</Modal.Header>
				<Modal.Body>
						Please decline your invitation before starting a game
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleCloseDecline}>
						ok
					</Button>
				</Modal.Footer>
			</Modal>

			<Modal
				show={show}
				onHide={handleClose}
				backdrop="static"
				keyboard={false}
			>
				<Modal.Header closeButton>
					<Modal.Title>CHANGED YOUR MIND ?</Modal.Title>
				</Modal.Header>
				<Modal.Body>
						Cancel invitation (X or button) 
						or patient for your opponant :)
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleClose}>
						Cancel invitation
					</Button>
				</Modal.Footer>
			</Modal>
			{
				status ? 
					<div id='area'>
					<GameCanevas infos={gameInfos} status={status} setStatus={setStatus}/>
					</div>
					:
					<PongReceptionRoom  show={show} setShow={setShow} showDecline={showDecline} setShowDecline={setShowDecline} />
			}
		</div>);
}
