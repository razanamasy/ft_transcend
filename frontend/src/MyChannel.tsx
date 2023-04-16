import {useEffect, useRef, Fragment, useState } from 'react';

import {Box} from "@mui/system"
import {Container, IconButton, TextField, Paper, Divider, FormControl, List, ListItem, ListItemText, Grid, Typography} from "@mui/material"
import './Chat.css'
import SendIcon from '@mui/icons-material/Send'
import { Socket } from 'socket.io-client'
import useAxiosPrivate from './hook/useAxiosPrivate';
import * as React from 'react';
import {Avatar} from '@mui/material';
import Snackbar from '@mui/material/Snackbar';

import { Superlabel } from './Superlabel';

import { Listuser } from './Listuser';
//import { withStyles } from "@mui/styles";
import { MemoizedSuperLabel } from './Superlabel';

import { useAuth } from './hook/useAuth';

interface Message
{
		name: string
		text: string
}

/*
const BlackTextTypography = withStyles({
	root: {
	  color: "#000000"
	}
  })(Typography);
*/


export function PleaseChooseChat()
{
		return(
				<Fragment>
						<Container>
								<Paper sx={{border : 1}} elevation={5}>
                                        <Box sx={{m : 2}}>
										    <Typography  variant='h2' align='center'>Welcome in the chat</Typography>
                                        </Box>
                                        <Box>
                                        <Typography variant='h4' align='center'>
                                                Please select a channel
                                            </Typography>
                                        </Box>
										<Grid  container spacing={4} alignItems="center">
												<Grid id="welcome-window" xs={12} item>

												</Grid>
										</Grid>
								</Paper>
						</Container>
				</Fragment>
		)
}

export function MyChannel({prv, nick, set, isp, socket, login, label} : {prv: string, nick: string, set : any, isp : boolean, socket: Socket, login : string, label : string})
{
	const [messages, setmessages] = useState<Message[]>([])
	const [message, setmessage] = useState<string>("")
	const axiosPrivate = useAxiosPrivate();
	const avatar_url = "http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/avatar/" + login + ".png";
	const msg = useRef('default');
	const sending = useRef(false);
	const [opens, setopens] = useState<boolean>(false);


	const  { auth } = useAuth();

	const ENTER_KEY = 13;

	const listmess = messages.map((message, index) =>
		<div key={index}>
			<ListItem >
				<ListItemText primary={`${message.name} : ${message.text}`}/>
			</ListItem>
			<Divider variant="inset" component="li" />
		</div>
	);

	const refresh_messages = async () =>
	{

		await axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/sc/loadmessage/" ,JSON.stringify({data: {label : label, user : login}})).then((resp : any) => {setmessages(resp.data)});

	}

		useEffect(() => {
				if (label && label != 'allpub')
				{
						refresh_messages();
				}

		socket.on('pubmessage', async (resp : any) =>
		{
			if (resp == label)
			{
				setTimeout( () => {
				refresh_messages().then( () => {
					var element = document.getElementById("chat-messages");
					if (element)
						element.scrollTop = element.scrollHeight + 10;
				});
			}, 60);
			}
		})
		return () => {
			socket.off('pubmessage');
			socket.emit('leavechatroom', {label : label});
		}
	}, [label])


	const clicked = async () =>
	{
		sending.current = true;
		let msgcopy = '';
		if (message)
		{
			msgcopy = message;
			setmessage("");
			if (msgcopy.length > 142)
			{
				msg.current = 'Message too large';
				setopens(true);
			}
			else
			{
				await axiosPrivate.post(
					"http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/sc/addmsginchan",
					JSON.stringify({
						data: {
							name: login,
							text : msgcopy,
							label : label
						}
					})
				).then( () => {
					//setTimeout(() => socket.emit('chatToserver', {room : label}), 100);
					socket.emit('chatToserver', {room : label});
				})
			}
		}
		msgcopy = '';
		sending.current = false;
	}

	const pressenter = (e : any) => {
		if (e.keyCode === ENTER_KEY )
		{
			clicked();
		}
	}

	if (label == 'allpub')
	{
		return(<PleaseChooseChat/>)
	}

	const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
		if (reason === 'clickaway') {
			return;
		}
		setopens(false);
	}

		return(
				<Fragment>
						<Snackbar open={opens} autoHideDuration={3000}  anchorOrigin={{ vertical: 'top', horizontal: 'right' }} onClose={handleClose} message={msg.current}></Snackbar>
						<Container>
								<Paper sx={{ border: 1 }}  elevation={5}>
										<Grid  container spacing={1} >
												{
														!isp  ?
														<div>
																<Grid  item={true} xs={1}>
																		<Listuser set={set} label={label} socket={socket} />
																</Grid>
																<Grid item={true}  xs = {2}>
																		<Divider orientation="vertical"/>
																</Grid>
														</div> : null
												}
												<Grid item={true} xs> 
														<Box p={3}>
																<Superlabel prv={prv} nick={nick} isp={isp} set={set} login={login} label={label}/>
																	<Divider />
																		<Grid container spacing={4} alignItems="center">
																			<Grid item={true} id="chat-window" xs={12} >
																				<List id="chat-messages">
																						{listmess}
																				</List>
																			</Grid>
																		<Grid item={true} xs={1} >
																			<Avatar src={avatar_url}></Avatar>
																		<Grid/>
																		</Grid>
																		<Grid item={true} xs={9} >
																				<FormControl fullWidth>
																						<TextField onChange={(e : any) => {setmessage(e.target.value)}} onKeyDown={pressenter}
																								value={message}
																								label= { auth.nickname + " says ..." }
																								variant="outlined"/>
																				</FormControl>
																		</Grid>
																		<Grid item={true} xs={1} >
																		<IconButton onClick={clicked} aria-label="send" color="primary"/>
																		<SendIcon onClick={clicked}/>

																		</Grid>
																			</Grid>
																			</Box>

																		</Grid>


					</Grid>
				</Paper>
			</Container>
		</Fragment>
	)
}
