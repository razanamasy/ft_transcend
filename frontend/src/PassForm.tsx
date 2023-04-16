import {Container, IconButton, Button,  Divider, FormControl, Typography} from "@mui/material"
import { useState} from 'react';
import useAxiosPrivate from './hook/useAxiosPrivate';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import * as React from 'react';


export function PassForm({setisp, setcurlabel, closep, label} : {setisp : any, setcurlabel : any , closep : () => void, label : string})
{
		const [showPassword, setshoPassWord] = useState<boolean>(false);
		const [password, setpassword] = useState<string>("");
		const [wrong, setwrong] = useState<boolean>(false);
		const axiosPrivate = useAxiosPrivate();

		const clickShowPassword = () => {
				setshoPassWord(!showPassword);
		};

		const mouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
				event.preventDefault();
		};

		const checkPassword = async () =>
		{

			await axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/sc/checkPassword" ,JSON.stringify({data: {password, label}})).then((ret) =>
						{
								if (ret.data == true)
								{
										setisp(false);
										setcurlabel(label);
										closep();
								}
								else
										setwrong(true);
						})
		}

		return (<div>
				<Container>
						<DialogTitle>PASSWORD REQUIRED</DialogTitle>
						<DialogContent>
								<DialogContentText>
										This channel is protected, please enter its password :
								</DialogContentText>

								<FormControl sx={{ m: 1, width: '100%' }} variant="outlined">
										<InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
										<OutlinedInput
												id="outlined-adornment-password"
												type={showPassword ? 'text' : 'password'}
												value={password}
												onChange={(e : any) => {setpassword(e.target.value)}}
												endAdornment={
														<InputAdornment position="end">
																<IconButton
																		aria-label="toggle password visibility"
																		onClick={clickShowPassword}
																		onMouseDown={mouseDownPassword}
																		edge="end"
																>
																		{showPassword ? <VisibilityOff /> : <Visibility />}
																</IconButton>
														</InputAdornment>
												}
												label="Password"/>
								</FormControl>

								{
										wrong ? <Typography>The password is incorrect</Typography>: null
								} 

						</DialogContent>
						<DialogActions>
								<Button onClick={closep}>Cancel</Button>
								<Button onClick={checkPassword}>Ok</Button>
						</DialogActions>
				</Container>

		</div>)
}
