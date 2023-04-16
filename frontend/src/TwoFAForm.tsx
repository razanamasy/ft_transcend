import { useState, useEffect} from 'react';
import axios from 'axios';
import { useAuth } from './hook/useAuth'
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from './hook/useAxiosPrivate';

export const TwoFAForm = () => {
		//For 2FA PART
		const axiosPrivate = useAxiosPrivate();
		const {setAuth} = useAuth();
		const {auth} = useAuth();
		const [validationCode, setValidationCode] = useState('');
		const [msg, setMsg] = useState('');
		const [preName, setPreName] = useState('');
		const navigate = useNavigate();


		useEffect(() => {
						const test2Wait = async () => {
										try {
											await axios.get("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/2FAProtection" ,
															{
																			withCredentials: true,
																			headers: 
																			{
																					'Content-Type' : 'application/json'
																			}
															}
											)
										}
										catch (e)
										{
														navigate('/Login', { replace: true })
										}
						}
						test2Wait();

		}, [])

		const handle2FA = async (e: any) => {

						e.preventDefault();
						try {
							const	ret = await axios.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/login/2FA/" ,
											JSON.stringify({twoFactorAuthenticationCode : validationCode}),
											{
															withCredentials: true,
															headers: 
															{
																	'Content-Type' : 'application/json'
															}
											}

							)
								if (!ret.data.status)
								{

												setAuth({enable2FA: false, name: '', nickname:'', passLog: false})
												navigate('/Login')
								}

								setMsg(ret.data.msg);

								if (ret?.data?.msg)
														setAuth({enable2FA: auth.enable2FA, name: preName, nickname:'', passLog: auth.passLog})

								ret?.data?.msg
								? navigate('/Dashboard', { replace: true })
								: navigate('/Login');
						} catch (e) 
						{
										setAuth({enable2FA: false, name: '', nickname:'', passLog: false})
										navigate('/Login')
						}
		}

		return (
												<section>
															<h1>Renseigner votre code Google Authenticator {auth.name}</h1>
															<form onSubmit={handle2FA}>
																			<label htmlFor="enableInput">
																					<p>{msg ? msg : ''}</p>
																			<p>Enter your code </p>
																			</label>
																			<input
																					type="text"
																					id="enableInput"
																					autoComplete="off"
																					required
																					onChange={(e) => setValidationCode(e.target.value)}
																					value={validationCode}
																			/>
																			<button disabled={((validationCode.length == 6)) ? false : true} >Enable </button>
															</form>

												</section>
		)
}
