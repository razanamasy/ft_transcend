import { useAuth } from './hook/useAuth';
import { useLogout } from './hook/useLogout';
import { SearchFriend } from './SearchFriend';
import {  useState, useEffect} from 'react';
import './styles/NavBar.css';
import axios from 'axios';

import * as React from 'react';
import { useSocket } from './hook/useSocket';
import useAxiosPrivate from './hook/useAxiosPrivate'

//Bootstrap
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';

import {

	useLocation,
	useNavigate,
} from "react-router-dom";


export const NavBar = () => {

	const location = useLocation();
	const { modeInvitation } = useAuth();
	const { setModeInvitation } = useAuth();
	const { setMyInvited } = useAuth();
	const { myInviter } = useAuth();
	const { setMyInviter } = useAuth();
	const [pongNavigation, setPongNavigation] = useState(false);
	const logout = useLogout();
	const { auth } = useAuth();
	const { inInviteProcess} = useAuth();
	const { setInInviteProcess} = useAuth();
	const { isInvited} = useAuth();
	const { setIsInvited} = useAuth();
	const {socket} = useSocket();
	const {socketPong} = useSocket();
	const {socketConnexion} = useSocket();
	const navigate = useNavigate();
	const axiosPrivate = useAxiosPrivate();


	const customPrivate = auth?.name?.length ? "display" : "hide";
	const customPublic = auth?.name?.length ? "hide" : "display";
	const PrivClass = ` ${customPrivate}`
	const PublicClass = ` ${customPublic}`

//SOCKET ON GET INVITED
	useEffect(() => {

			socketPong.on('getInvited', (data: any) => {

			if (data.invited)
			{
				setMyInvited(data.invited);
				setMyInviter(data.inviter);
				setModeInvitation(data.modeGame);
				setInInviteProcess(true);
				setIsInvited(true);
			}
		})


		return () => {
			socketPong.off('getInvited');
		};
	}, []);

	//SOCKET ON IS ACCEPTED fir inviter
	useEffect(() => {

			socketPong.on('isAccepted', (data: any) => {

			if (data.status)
			{
				setTimeout(letNavigate, 2000);
				//letNavigate();
			}
		})
		return () => {
			socketPong.off('isAccepted');
		};
	}, []);

	//SOCKET ON HAVEACCEPT for invited
	useEffect(() => {

			socketPong.on('haveAccept', (data: any) => {

			setInInviteProcess(false)
			setIsInvited(false)
		})
		return () => {
			socketPong.off('isAccepted');
		};
	}, []);



//SOCKET ON INVITATION IS CANCELED (for the invited) 
	useEffect(() => {
		// ...

			socketPong.on('invitationIsCanceled', (data: any) => {

			setInInviteProcess(false);
			setIsInvited(false);
		})


		return () => {
			socketPong.off('invitationIsCanceled');
		};
	}, []);


		//USE EFFECT TO NAVIGATE TO THE PONG IF PONG NAVIGATION IS TRUE (On accepte only) --> Directly the callback accepted know
	useEffect(() => {
		// ...

		if (pongNavigation)
		{
			if(location.pathname === "/Pong")
			{

				window.location.reload()
			}
			else
				navigate('/Pong', {state:{isAccepted:true}})
		}
	}, [pongNavigation]);


	//SOCKT ON GET THE OTHER WINDOW TO LOGOUT
	useEffect(() => {

		socketPong.on('getLogout',  async () => {
			//	navigate('/Register', {state:{isAccepted:true}})
				 const ret = await axios.get("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/eraseCookie")

				setTimeout(function () {window.location.reload()}, 500)
		})


		return () => {
			socketPong.off('getLogout');
		};
	}, []);

	const letNavigate = () => {
		setPongNavigation(true);
	}

	const handleAccept = async () => {
		setInInviteProcess(false);
		setIsInvited(false);
		setModeInvitation("");
		socketPong.emit('StopSearchForPlayer', {user: auth.name})
		socketPong.emit("acceptInvitation", {inviter: myInviter, invited: auth.name, mode: modeInvitation });
		setTimeout(letNavigate, 500);
	}

	const handleDecline = async () => {
		setInInviteProcess(false);
		setIsInvited(false);
		setModeInvitation("");
		await socketPong.emit("declineInvitation", {inviter: myInviter, invited: auth.name});
	}

	const emitLogout = () => {
		socketPong.emit('Disconnect', {username: auth.name})
		socketConnexion.emit('Disconnect', {username: auth.name})
		socket.emit('Disconnect', {username: auth.name})
	}


	const handleLogout = async () => {
			logout().then(async () => {

				await socketPong.emit('LogoutAllWindows', {username: auth.name});
	
	
				setTimeout(emitLogout, 3000);
				navigate('/Login');
			})
	}


	const renderSwitch = (mode: string) => {
  switch(mode) {
    case 'Standard':
      return (
								<div className={PrivClass}>
									<Button variant={"primary"} onClick={handleAccept}>Accept </Button>
									<Button variant={"primary"} onClick={handleDecline}>Decline</Button>
								</div>
			);
    case 'Speedy':
      return (
								<div className={PrivClass}>
									<Button variant={"danger"}  onClick={handleAccept}>Accept </Button>
									<Button variant={"danger"} onClick={handleDecline}>Decline</Button>
								</div>
			);
    case 'Teleport':
      return (			
								<div className={PrivClass}>
									<Button variant={"warning"} onClick={handleAccept}>Accept </Button>
									<Button variant={"warning"} onClick={handleDecline}>Decline</Button>
								</div>
			);
    default:
      return (
								<div className={PrivClass}>
									<Button variant={"primary"} onClick={handleAccept}>Accept </Button>
									<Button variant={"primary"} onClick={handleDecline}>Decline</Button>
								</div>
			);
  }
}
 

	return (
		<Navbar  collapseOnSelect expand="lg xs"  className="theme" >

			<Container>
				<Navbar.Brand className="textNav">Ft_transcendance</Navbar.Brand>
				{

						(inInviteProcess && isInvited)
										?
					<div className="blink_me">
						<Navbar.Toggle className={"collapseButton"} aria-controls="responsive-navbar-nav" />
					</div>
										:
					<Navbar.Toggle className={"collapseButton"} aria-controls="responsive-navbar-nav" />
				}
					<Navbar.Collapse  id="responsive-navbar-nav">

							
				<Nav className="me-auto">
					<Nav.Item className={PrivClass} >
						<Nav.Link className="textNav"  href="/Dashboard">Dashboard</Nav.Link>
					</Nav.Item>
					<Nav.Item className={PrivClass} >
						<Nav.Link  className="textNav" href="/Chat">Chat</Nav.Link>
					</Nav.Item>
					<Nav.Item className={PrivClass} >
						<Nav.Link  className="textNav" href="/Pong">Pong</Nav.Link>
					</Nav.Item>
					<Nav.Item className={PrivClass} >
						<Nav.Link  className="textNav" href="/Settings">Settings</Nav.Link>
					</Nav.Item>
					<Nav.Item className={PrivClass} >
						<Nav.Link  className="textNav" href="/MatchHistory">MatchHistory</Nav.Link>
					</Nav.Item>
					<Nav.Item  className={PrivClass}>
						<Nav.Link  className="textNav" onClick={handleLogout}>
							Logout
						</Nav.Link>
					</Nav.Item>


					                    <Nav.Item className={PublicClass} >
                                                <Nav.Link  className="textNav" href="/Login">Login</Nav.Link>
                                        </Nav.Item>



					{
						(inInviteProcess && isInvited ) 
								?
								<div>
								{
											renderSwitch(modeInvitation)	
								}
								</div>
								:
								<div></div>

					}	
				</Nav>

				<Nav className="me-auto">

					<Nav.Item  className={PrivClass}>
						<SearchFriend/>
					</Nav.Item>
				</Nav>

       </Navbar.Collapse>
			</Container>

		</Navbar>

	);
}




export function InitBar() {
  return (
		<Navbar bg="dark" variant="dark" >
      <Container>
				<Navbar.Brand href="/Dashboard">Ft_transcendance</Navbar.Brand>
      </Container>
    </Navbar>
  );
}


export function NavTest() {
  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <Container>
        <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#features">Features</Nav.Link>
            <Nav.Link href="#pricing">Pricing</Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link href="#deets">More deets</Nav.Link>
            <Nav.Link eventKey={2} href="#memes">
              Dank memes
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

