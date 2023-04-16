import {useEffect} from 'react';
import {Container, Box, Button, Divider, ListItem, Typography} from "@mui/material"
import { useState} from 'react';
import  { Socket } from 'socket.io-client'
import { useAuth } from './hook/useAuth';
import useAxiosPrivate from './hook/useAxiosPrivate';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import * as React from 'react';
import './Chat.css'

export function Listuser({set, label, socket} : {set : any, label : string, socket : Socket})
{

		const {auth} = useAuth();
		const [isopenmenu, setisopenmenu] = React.useState<null | HTMLElement>(null);
		const [curmember, setcurmember] = useState<{name : string, ismuted : boolean, isbanned : boolean, isAdmin: boolean, isOwner: boolean}>({name: 'name', isbanned : false, ismuted : false, isAdmin: false, isOwner: false })

		const [users, setusers] = useState< {name : string, nick: string, ismuted : boolean, isbanned: boolean, isAdmin: boolean, isOwner: boolean }[]>([])
		const [blocked, setblocked] = useState<boolean>(false);


		const axiosPrivate = useAxiosPrivate();
		const loadusers = async () =>
		{

				try {
					const res = await axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/sc/findUsers" ,JSON.stringify({data: {label : label}})).then( (ret :any) => { setusers(ret.data);})

				} catch (e) 
				{
				}
		}

		useEffect(() => {
				if (label != 'allpub')
				{
						loadusers();
						
						socket.on('refreshusers', (curlabel : string) =>
								{
									if (curlabel == label)
									{
												loadusers();
									}
								})
							
	
				}
				return () => {
					if (label != 'allpub')
					{
						socket.off('refreshusers');
					}
				}
		}, [label])

		const iamAdmin = ()  : boolean =>
		{
				const usr = users.find((e : any) => e.name == auth.name)
				if (usr)
				{
						if (usr.isAdmin == true)
								return (true);
						return (false);
				}
				return (false);
		}


		const openmenu = (event: React.MouseEvent<HTMLButtonElement>, usr : any) => {
				setisopenmenu(event.currentTarget);
				axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/isblocked" ,JSON.stringify({data: {user : auth.name, blockedornot : event.currentTarget.id}})).then((ret : any) => {
						setblocked(ret.data);})
				setcurmember({name : event.currentTarget.id, ismuted : usr.ismuted, isbanned : usr.isbanned, isAdmin: usr.isAdmin, isOwner: usr.isOwner });
		}

		const closemenu = () =>
		{
				setisopenmenu(null);
		}

		//MUTE
		const mute = async ( usr: {name : string, ismuted: boolean, isbanned : boolean, isAdmin : boolean, isOwner: boolean }) =>
		{
				if (!usr.ismuted)
				{
						setcurmember({name : usr.name, ismuted : !usr.ismuted, isbanned : usr.isbanned, isAdmin: usr.isAdmin, isOwner: usr.isOwner});

				try {

					await axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/sc/muteUser" ,JSON.stringify({data: {label : label, muted : usr.name}})).then( () => {
						
						socket.emit('refreshusers', {label : label})});
						socket.emit('delayedrefreshusers', {label : label});
						
				} catch (e) 
				{
				}				




				}
				else
				{
						setcurmember({name : usr.name, ismuted : !usr.ismuted, isbanned : usr.isbanned, isAdmin: usr.isAdmin, isOwner: usr.isOwner});
						
						await axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/sc/unmuteUser" ,JSON.stringify({data: {label : label, muted : usr.name}})).then( () => {
								socket.emit('refreshusers', {label : label});
						})
				}
		}

		//BLOCK

		const block = (usr : {name : string, ismuted : boolean, isbanned : boolean, isOwner: boolean}) =>
		{
				if (!blocked)
				{
						setcurmember({name : curmember.name, ismuted : curmember.ismuted, isbanned : curmember.isbanned, isAdmin: curmember.isAdmin, isOwner: usr.isOwner});
						
						axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/addblock" ,JSON.stringify({data: {user : auth.name, blocked : usr.name}})).then( () => {
								socket.emit('refreshusersblock', {name : auth.name, label : label});
						})
				}
				else
				{
						setcurmember({name : curmember.name, ismuted : curmember.ismuted, isbanned : curmember.isbanned, isAdmin: curmember.isAdmin, isOwner: usr.isOwner});

						axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/unblock" ,JSON.stringify({data: {user : auth.name, unblocked : usr.name}})).then(() =>
								{
									socket.emit('refreshusersblock', {name : auth.name, label : label});
								}
						)
				}
		}

		//BAN
		const ban = async (usr : {name : string, ismuted : boolean, isbanned : boolean }) =>
		{
				if (!usr.isbanned)
				{
						setcurmember({name : curmember.name, ismuted : curmember.ismuted, isbanned : !curmember.isbanned, isAdmin: curmember.isAdmin, isOwner: curmember.isOwner});
						
								await axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/sc/banUser" ,JSON.stringify({data: {label : label, banned : usr.name}})).then( () => {
								setTimeout(() => {
									socket.emit('refreshusers', {label : label});
									socket.emit('kicked', {label : label, name: usr.name});
									}, 100);

						})
				}
				else
				{
						setcurmember({name : curmember.name, ismuted : curmember.ismuted, isbanned : !curmember.isbanned, isAdmin: curmember.isAdmin, isOwner: curmember.isOwner});
						
						await axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/sc/unbanUser" ,JSON.stringify({data: {label : label, banned : usr.name}})).then(() =>
								{
										socket.emit('refreshusers', {label : label})
								}
						)
				}
		}

		//ADMIN
		const handleAdmin = async (usr : {name : string, ismuted : boolean, isbanned : boolean, isAdmin : boolean }) =>
		{
				if (!usr.isAdmin)
				{
						setcurmember({name : curmember.name, ismuted : curmember.ismuted, isbanned : curmember.isbanned, isAdmin: !curmember.isAdmin, isOwner: curmember.isOwner});
						
						await axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/sc/addAdmin" ,JSON.stringify({data: {label : label, username : usr.name}})).then( () => {
								socket.emit('refreshusers', {label : label})
						})
				}
				else
				{
						setcurmember({name : curmember.name, ismuted : curmember.ismuted, isbanned : curmember.isbanned, isAdmin: !curmember.isAdmin, isOwner: curmember.isOwner});
						
						
						await axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/sc/removeAdmin" ,JSON.stringify({data: {label : label, username : usr.name}})).then( () => {
								socket.emit('refreshusers', {label : label})
						})
				}
		}

		const open = Boolean(isopenmenu);

		const listuser = users.map((usr) =>
				<div key={usr.name}>
						<ListItem >
								<Button
										id={usr.name}
										color={usr.isOwner ? 'info' : usr.isAdmin ? 'secondary' : 'primary'}
										aria-controls={open ? 'basic-menu' : undefined}
										aria-haspopup="true"
										aria-expanded={open ? 'true' : undefined}
										onClick={(e : any) => openmenu(e, usr)}
								>
										{usr.nick}
								</Button>
						</ListItem>
						<Divider/>
				</div>
		);



		return (

				<Container>
					<Box sx={{ m: 2 }} >
						<Typography variant='h6' align='center'>Members</Typography>
                        
						{listuser}
                        
						</Box>
						{
								iamAdmin() && auth.name != curmember.name && !curmember.isOwner ?
										<Menu
												id="basic-menu"
												anchorEl={isopenmenu}
												open={open}
												onClose={closemenu}
												MenuListProps={{
														'aria-labelledby': 'basic-button',
												}}
										>

												<MenuItem onClick={() => {mute(curmember) ; closemenu()}}>{curmember.ismuted ? "Unmute" : "Mute"}</MenuItem>
												<MenuItem onClick={() => {ban(curmember) ; closemenu()}}>{curmember.isbanned ? "Unban" : "Ban"}</MenuItem>
												<MenuItem onClick={() => {handleAdmin(curmember) ; closemenu()}}>{curmember.isAdmin ? "Remove Admin" : "Add Admin"}</MenuItem>
												<MenuItem onClick={() => {block(curmember); closemenu()}}>{blocked ? "Unblock" : "Block"}</MenuItem>

											
										</Menu>

										: auth.name != curmember.name && !curmember.isOwner ? <Menu
												id="basic-menu"
												anchorEl={isopenmenu}
												open={open}
												onClose={closemenu}
												MenuListProps={{
														'aria-labelledby': 'basic-button',
												}}
										>
												<MenuItem onClick={() => {block(curmember); closemenu()}}>{blocked ? "Unblock" : "Block"}</MenuItem>
										</Menu>
																					: null
											}

						
				</Container>
		)
}

export const MemoizedListUsers = React.memo(Listuser);
