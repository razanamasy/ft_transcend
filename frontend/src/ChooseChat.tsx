import {useEffect, useRef} from 'react';


import {Button, Divider, ListItem, Grid} from "@mui/material"
import { Fragment, useState} from 'react';

import  { Socket } from 'socket.io-client'
import { useAuth } from './hook/useAuth';
import { useSocket } from './hook/useSocket';
import useAxiosPrivate from './hook/useAxiosPrivate';

import ListItemButton from '@mui/material/ListItemButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Stack from '@mui/material/Stack';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import * as React from 'react';

import {useNavigate } from "react-router-dom";

import { TransitionProps } from '@mui/material/transitions';
import Slide from '@mui/material/Slide';

import { Friends } from './Friends';
import { MyChannel } from './MyChannel';
import { ListChannels } from './ListChannels';
import { MemoizedFriends } from './Friends';
import './Chat.css';

interface getAllDTO
{
		name: string
		status: number
		nickname: string
}

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
            children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export function ChooseChat({socket, login} : {socket : Socket, login : string})
{
		const [users, setusers] = useState<{name : string, status: number, nickname: string}[]>([]);
		const [curlabel, setcurlabel] = useState<string>("allpub")
		const {auth} = useAuth();
		const {socketPong} = useSocket();
		const [isp, setisp] = useState<boolean>(true);
		const [openmode, setopenmode] = useState<boolean>(false);
		const [invited, setinvited] = useState<string>("");
		const privfriend = useRef("");
		const privnick = useRef("pilou");

		const navigate = useNavigate();

		const axiosPrivate = useAxiosPrivate();

		const closemode = () => {
				setopenmode(false);
		};

		const handleInviteToPlay = (invitedName: string, mode: string) => {
						socketPong.emit('sendInvitation', {inviter: auth.name, invited: invitedName, modeGame: mode}, (data: any) => {
						if (!data.status)
						{
								window.alert(data.msg);
						}
						else
						{
								navigate("/Pong");
						}
				})
		}

		const getusers = (resp : getAllDTO[]) =>
		{
				setusers(resp);
		}

		const createprivconv = async (login : string, u : string) =>
		{
			const label = login > u ? login + '$' + u : u + '$' + login;

				await axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/sc/addchan" , JSON.stringify({data: {owner : login, pass : "", name : label, ispublic : 'privatemessage', invitelist : [u]}}))

		}

		const controller = new AbortController();

		const listfriends = users.map((u, index) =>
				<div key ={index}>
						<ListItem >
                            <Grid container spacing={1} alignItems="center">
                        <Grid item xs>
						{/*<Stack alignItems="baseline"  direction="row" spacing={2}>*/}
								<ListItemButton onClick={() => {createprivconv(login, u.name).then(() => {privfriend.current = u.name; privnick.current = u.nickname ; socket.emit("joinchatroom", { proom: curlabel, label: login > u.name ? login + '$' + u.name : u.name + '$' + login});
			setisp(true);
			setcurlabel(login > u.name ? login + '$' + u.name : u.name + '$' + login);})}}>
										<MemoizedFriends socket={socket} name={u.name} />
								</ListItemButton>
                                </Grid>
								{
                                    u.status == 1 ?
                                    <Grid item xs>
									<Button onClick={() => {setopenmode(true) ; setinvited(u.name)}} size='small' variant="outlined" startIcon={<PlayArrowIcon/>}>
											play
									</Button>
                                    </Grid>: null
								}
								{/*</Stack>*/}
                                </Grid>
						</ListItem>
						<Divider variant="inset" component="li" />
				</div>
		);


		const getAllFriends = async () => {
				try {
						const ret = await axiosPrivate.get("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/friendss/" + auth.name, 
								{
										params: { name: auth.name },
										signal: controller.signal,
								},
						);
						getusers(ret.data);
				}
				catch (e) {
				}
		}
		useEffect(() => {
				getAllFriends();
				socket.on('kicked', (resp : string) => {
					socket.emit('leavechatroom', {label : resp})
					setcurlabel('allpub');
					socket.emit('refreshchan', {room : login + 'Chat'});
		
				})
				return () => {
					socket.off('kicked');
				}
		}, [])

		return(
				<div>
						<Fragment>
								<Grid className ='max' container >
										<Grid item xs={8}>
												<MyChannel prv={privfriend.current} nick={privnick.current} set={setcurlabel} isp={isp} socket={socket} login={login} label={curlabel}/>
										</Grid>
										<Grid item xs={4}>
												<ListChannels label={curlabel} socket={socket} setisp={setisp} setcurlabel={setcurlabel} listusers={users} listfriends={listfriends}/>
										</Grid>
								</Grid>
						</Fragment>

						<Dialog
								open={openmode}
								TransitionComponent={Transition}
								keepMounted
								onClose={closemode}
								aria-describedby="alert-dialog-slide-description"
						>
								<DialogTitle>{"Select your mode"}</DialogTitle>
								<DialogContent>
										<Stack direction='row'>
												<Button onClick={() => {handleInviteToPlay(invited, "Standard")}} color='primary' variant="contained">Standard</Button>
												<Button onClick={() => {handleInviteToPlay(invited, "Speedy")}} color='error' variant="contained">Speedy</Button>
												<Button onClick={() => {handleInviteToPlay(invited, "Teleport")}} color='warning' variant="contained">Teleport</Button>
										</Stack>
								</DialogContent>
								<DialogActions>
										<Button onClick={closemode}>Cancel</Button>
								</DialogActions>
						</Dialog>
				</div>
		);
}
