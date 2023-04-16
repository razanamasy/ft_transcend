import { useRef, useState, useEffect} from 'react';
import './RegisterForm.css';
import { useAuth } from './hook/useAuth'
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosPrivate from './hook/useAxiosPrivate';
import { Navigate } from "react-router-dom";
import {InitBar} from './NavBar';
import { useSocket } from './hook/useSocket';

//Bootstrap
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';

import './styles/Login.css'



export const	LoginForm = () => {


		const codeRef = useRef<HTMLInputElement>(null);

		const [msg, setMsg] = useState('');
		const [preName, setPreName] = useState('');
		useEffect(() => {
				if (codeRef.current != null)
				{
						codeRef.current.focus();
				}
		}, [])

		const axiosPrivate = useAxiosPrivate();

		const navigate = useNavigate();
		const location = useLocation();
		const from = location.state?.from?.pathname || "/Dashboard"

		const {setAuth} = useAuth();
		const {auth} = useAuth();
		const {socket} = useSocket();
		const {socketPong} = useSocket();
		const {socketConnexion} = useSocket();
		const nameRef = useRef<HTMLInputElement>(null);
		const errRef = useRef(null);

		const [name, setName] = useState('');
		const [pass, setPass] = useState('');
		const [errMsg, setErrMsg] = useState('');

		useEffect(() => {
				if (nameRef.current != null)
				{
						nameRef.current.focus();
				}
		}, [])

		useEffect(() => {
				setErrMsg('');
		}, [name, pass])


		const handleSubmit = async (e: any) => {
				e.preventDefault();
				try {
						const credential = {name: name, mdp: pass}
						const	ret = await axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/login/" ,JSON.stringify(credential));
						if (ret.data.msg == "fail")
						{
							window.alert("Bad username or password");
							return ;
						}

						if (ret.data.enable2FA)
						{
										setAuth({enable2FA: ret.data.enable2FA, name: "", nickname:"", passLog: false});
								setPreName(ret.data.name);
						}
						else
						{
										setAuth({enable2FA: ret.data.enable2FA, name: ret.data.name, nickname: ret.data.nickname,  passLog: false});

						}
						setName('');
						setPass('');
						ret.data.enable2FA 
								? navigate('/Login', { replace: true })
								: navigate(from, { replace: true });

				} catch(err) {
						setAuth({enable2FA: false, name: '', nickname:'', passLog: false});
						setName('');
						setPass('');
						setErrMsg('Fail login ' + err);
				}
		}
        /*
		const navigateToRegister = () => {
				navigate('/Register');
		}
        */

		return (

				<div >
				<InitBar  />
				<Container  >
						{
								!auth?.enable2FA ?
										<Container >
												<Row className="justify-content-md-center">
														<Col  lg="10" md="10" sm="10"  xs="10">
															<Alert className="myAlert" variant='light'>
																	<div>	Meet your friends to chat and play games of Pong  </div>
																	<br/>
																	<br/>

																		<Row className="justify-content-md-center">
																						<Button href={process.env.REACT_APP_REDIRECT_URI} rel="noreferrer">Connect with intra42</Button>

																		</Row>
															</Alert>


														</Col>
												</Row>
										</Container>

										:
										<Navigate to="/Login2FA" replace={true} />
						}
				</Container>
				</div>


		)
}
