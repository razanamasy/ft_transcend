import {useEffect, useState, useRef} from 'react';
import './App.css';
import {Container, IconButton, Button, Divider, FormControl, Grid, Typography} from "@mui/material"
import './Chat.css'
import useAxiosPrivate from './hook/useAxiosPrivate';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Stack from '@mui/material/Stack';
import { userApi } from './api/user.api';
import LockIcon from '@mui/icons-material/Lock';
import DeleteIcon from '@mui/icons-material/Delete';
import * as React from 'react';
import { useSocket } from './hook/useSocket';
import {useNavigate } from "react-router-dom";

export function Superlabel({prv, nick, isp, set, login, label} :{prv : string, nick: string, isp: boolean, set: any, login : string, label : string})
{
		const [isown, setisown] = useState<boolean>(false);
		const [openpass, setopenpass] = useState<boolean>(false);
		const [password, setpassword] = useState<string>("");
		const [showPassword, setshoPassWord] = useState<boolean>(false);
		const axiosPrivate = useAxiosPrivate();
        const [prvnick, setprvnick] = useState<string>("") 
		const {socket} = useSocket();
        const [blockbutton, setblockbutton] = useState<boolean>(false);

		useEffect(() => {
			socket.on('quitingchan', () => {

				socket.emit('leavechatroom', {label : label});
				set("allpub");

			})

            if (!isp)
			{

				axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/sc/isOwner" ,JSON.stringify({data:{label : label, username : login}})).then((resp : any) => {setisown(resp.data)})
			}

            if (isp)
            {

            socket.on('refreshblock', () => {
                loadblockbutton(prv);
            })

            loadblockbutton(prv);
            }

			return () => {
				socket.off('quitingchan');
                if (isp)
                {
                    socket.off('refreshblock');
                }
			}

		}, [label])

        const loadblockbutton = async (prv : string) =>
        {
            try {
                const res = await axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/isblocked" ,JSON.stringify({data: {user : login, blockedornot : prv}})).then( (ret :any) => { setblockbutton(ret.data);})

            } catch (e) 
            {
            }

        }

/*        const getNickName = async () => {

            const ret = await axiosPrivate.get("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/" + prv, 
            {
                    params: { name: prv },
            },
            );
            setprvnick(ret.data.nickname);
				}*/

		const clickShowPassword = () => {
				setshoPassWord(!showPassword);
		};

		const mouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
				event.preventDefault();
		};

		const openpform = () =>
		{
				setopenpass(true);
		}

		const closepform = () =>
		{
				setopenpass(false);
		}

		const updatepass = async (npass : string) =>
		{

				const userInfo = await userApi.getRefreshToken();

				if (userInfo?.data?.name)
				{

					await axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/sc/updatepassword" ,JSON.stringify({data: {label : label, newpassword : npass}})).then(() => {
								closepform();
						})
				}
		}

		const navigate = useNavigate();

		const quitchat = async () => 
		{

			await axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/sc/deleteUser" ,JSON.stringify({data: {label : label, username : login}})).then( () =>
				{
					socket.emit('refreshchan', {room : login + 'Chat'});
					socket.emit('refreshusers', {label : label}); //room login + Chat ?
					socket.emit('quitingchan', {room : login + 'Chat'});
				})
		}


        const block = (prv : string) =>
        {
            axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/addblock" ,JSON.stringify({data: {user : login, blocked : prv}})).then(
                () => 
                {
                    socket.emit('refreshblock', {room: login, label : label});
                }
            )
        }

        const unblock =  (prv : string) =>
        {
            axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/unblock" ,JSON.stringify({data: {user : login, unblocked : prv}})).then(
                () => 
                {
                    socket.emit('refreshblock', {room: login, label : label});
                }
            )
        }

        

		return (
				<div>
						<Grid sx={{ borderBottom: 1 }} container spacing ={2}>
						
								<Grid item xs={8}>
									
									<Stack direction='row' spacing={2}>
												<Typography  align='center' variant="h4">
														{isp ? nick : label}
												</Typography>
												{
														isown && !isp ? <IconButton onClick={openpform} aria-label="lock"> <LockIcon /> </IconButton>: null
												}
												{
													isp ? <Button onClick={() => {socket.emit('leavechatroom', {label : label}); navigate('/Dashboard/Friend/' + prv)}} variant="text">Profile</Button> 
															: null
												}
                                                {
                                                    isp && !blockbutton ? <Button onClick={() => { block(prv) }}>Block</Button>: null
                                                }
                                                {
                                                    isp && blockbutton ? <Button onClick={() => {  unblock(prv) }}>Unblock</Button>: null
                                                }

												</Stack>
												</Grid>
												<Grid item xs={4}>
																					{
											!isp ? <Button onClick={() => quitchat()} size ="small" variant="outlined" color="error" endIcon={<DeleteIcon />} >Quit</Button> : null
											
										}
									</Grid>
										
									
								</Grid>

						

						<Dialog open={openpass} onClose={closepform}>
								<DialogContent>
										<Container>
												<Stack spacing={1}>
														<DialogTitle> Password modification</DialogTitle>
														<DialogContentText>
																Please enter the new password of your channel, or dissable it.

														</DialogContentText>
														<Divider/>

														<FormControl sx={{ m: 2, width: '100%' }} variant="outlined">
																<InputLabel htmlFor="outlined-adornment-password">new password</InputLabel>
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
												</Stack>
										</Container>
								</DialogContent>
								<DialogActions>
										<Button onClick={closepform}>Cancel</Button>
										<Button onClick={() => {updatepass(password).then(() => {{socket.emit('refreshchan', {room : login + 'Chat'})}})}}>Submit</Button>
								</DialogActions>
						</Dialog>
				</div>
		)
}

export const MemoizedSuperLabel = React.memo(Superlabel);
