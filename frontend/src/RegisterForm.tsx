import { useRef, useState, useEffect } from 'react';
import './RegisterForm.css';
import { useNavigate } from "react-router-dom";

import {InitBar} from './NavBar';
import { useSocket } from './hook/useSocket';

import useAxiosPrivate from './hook/useAxiosPrivate';


//Bootstrap
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


const NAME_REGEX = /^[a-zA-Z][a-zA-z0-9-_]{3,15}$/;

var PASS_REGEX = new RegExp("^((?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[\\ -/:-@\\[-`{-~]))(?=.{10,})");

export const	RegisterForm = () => {

		const axiosPrivate = useAxiosPrivate();
		const navigate = useNavigate();
		const nameRef = useRef<HTMLInputElement>(null);
		const errRef = useRef(null);
		const {socketPong} = useSocket();

		//STATE FIELD
		//1) name
		const [name, setName] = useState('');
		const [validName, setValidName] = useState(false);
		const [nameFocus, setNameFocus] = useState(false);

		//2) pass
		const [pass, setPass] = useState('');
		const [validPass, setValidPass] = useState(false);
		const [passFocus, setPassFocus] = useState(false);

		//3) match pass
		const [match, setMatch] = useState('');
		const [validMatch, setValidMatch] = useState(false);
		const [matchFocus, setMatchFocus] = useState(false);

		//STATE ERROR
		const [errMsg, setErrMsg] = useState('');
		const [success, setSuccess] = useState(false);

		useEffect(() => {
				if (nameRef.current != null)
				{
						nameRef.current.focus();
				}
		}, [])

		//When validate name test regex // ValidName will be check in aria-invalid
		useEffect(() => {
				const result = NAME_REGEX.test(name);
				setValidName(result);
		}, [name])

		//When validate pass test regex and compare with match
		//will be trigger when changing pass AND match (better id anyone change, validMatch is false)
		useEffect(() => {
				const result = PASS_REGEX.test(pass);
				setValidPass(result);

				const isMatch = pass === match;
				setValidMatch(isMatch);
		}, [pass, match])

		useEffect(() => {
				setErrMsg('');
		}, [name, pass, match])


		const handleSubmit = async (e: any) => {
			//here the POST request

			e.preventDefault();
			//Test again if someone hack the prevent default
			const reTest1 = NAME_REGEX.test(name);
			const reTest2 = PASS_REGEX.test(pass);
			if (!reTest1 || !reTest2)
			{
					setErrMsg('invalid credentials');
					return;
			}
			try {
				const	UserData = await axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user" ,JSON.stringify({status : 0, level:[1200], mdp : pass, name: name, enable2FA: false }))


							if (!UserData.data)
							{

								setErrMsg('User ' + name + ' already exist ')
								return ;
							}
							else
							{
							setSuccess(true);

							}
			}
			catch(err) {
							setErrMsg('Fail register ' + err)
			}
		}

		const navigateToLogin = () => {
						navigate('/Login');
		}

return (

			<div>
			<InitBar  />
			<Container>
							{success ? 
											<Container id="if-register-sucess">
															<h1>Success registration ! Now sing in</h1>
															<Button onClick={navigateToLogin} >Let's login </Button>
											</Container> 
								:
									<Container >
											<Row className="justify-content-md-center">
														<Col  lg="4" md="5" sm="8"  xs="10">										
																<p className={errMsg ? "errmsg" : "hide"} >{errMsg}</p>
																<h1>Register </h1>
																<Form onSubmit={handleSubmit} >
																			<Form.Label htmlFor="NameInput">
																					<span>
																							<div className={ validName ? "valid" : "hide" }>✅</div>
																							<div className={ validName || !name ?  "hide" : "invalid" }>⛔️</div>
																					</span>
																			</Form.Label>
																			<Form.Control
																					placeholder="Login-Name@"
																					id="NameInput"	
																					type="text" 
																					name="name" 
																					autoComplete="off"
																					ref={nameRef}
																					onChange={(e) =>setName(e.target.value)} 
																					required
																					aria-invalid={validName ? "false" : "true"}
																					aria-describedby="uidnote" 
																					onFocus={() => setNameFocus(true)}
																					onBlur={() => setNameFocus(false)}
																			/>
																			<p 	id="uidnote" //si on est focus sur le champ + le nom a une err + on a rentré un name --> indications
																					className={name && nameFocus && !validName ? "err_instruction" : "out"}
																			>
																							Bad Format username : 4 to 15 letters, nb underscore hyphen allowed
																			</p> 

																			<Form.Label htmlFor="PassInput">
																					<br/>
																					<span>
																							<div className={ validPass ? "valid" : "hide" }>✅</div>
																							<div className={ validPass || !pass ?  "hide" : "invalid" }>⛔️</div>
																					</span>
																			</Form.Label>
																			<Form.Control 
																					placeholder="Password@"
																					id="PassInput"	
																					type="password" 
																					name="pass" 
																					onChange={(e) =>setPass(e.target.value)} 
																					required
																					aria-invalid={validPass ? "false" : "true"}
																					aria-describedby="passnote" 
																					onFocus={() => setPassFocus(true)}
																					onBlur={() => setPassFocus(false)}
																			/>
																			<p 	id="passnote" //si on est focus sur le champ + le nom a une err + on a rentré un name --> indications
																					className={pass && passFocus && !validPass ? "err_instruction" : "out"}
																			>
																							Bad Format password : 10 letters minimum, lower/uppercase number and special charactere 
																			</p> 


																			<Form.Label htmlFor="MatchInput">
																					<br/>
																					<span>
																							<div className={ validMatch && match ? "valid" : "hide" }>✅</div>
																							<div className={ validMatch || !match ?  "hide" : "invalid" }>⛔️</div>
																					</span>
																			</Form.Label>
																			<Form.Control 
																					placeholder="Confirm Pass"
																					id="MatchInput"	
																					type="password" 
																					name="match" 
																					onChange={(e) =>setMatch(e.target.value)} 
																					required
																					aria-invalid={validMatch ? "false" : "true"}
																					aria-describedby="matchnote"
																					onFocus={() => setMatchFocus(true)}
																					onBlur={() => setMatchFocus(false)}
																			/>
																			<p 	id="matchnote" //si on est focus sur le champ + le nom a une err + on a rentré un name --> indications
																					className={match && matchFocus && !validMatch ? "err_instruction" : "out"}
																			>
																							Pass doesn't match 
																			</p> 
																			<br/>


																				<Button variant="primary" type="submit"  disabled={ !validName || !validPass || !validMatch ? true : false } >Submit</Button>


																</Form>
																<p>
																		Already registered ? <br />
																		<Button  variant="outline-dark" type="submit" onClick={navigateToLogin} >Login</Button>
																</p>
													</Col>
											</Row>
									</Container>

							}
			</Container>
			</div>
)
}
