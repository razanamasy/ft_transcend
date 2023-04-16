import {useEffect} from 'react';
import {Box} from "@mui/system"
import {Container, Button,  Paper, Divider, List, ListItem, Typography} from "@mui/material"
import {useState} from 'react';

import{ Socket } from 'socket.io-client'

import { useSocket } from './hook/useSocket';
import { useAuth } from './hook/useAuth';
import useAxiosPrivate from './hook/useAxiosPrivate';

import ListItemButton from '@mui/material/ListItemButton';
import Dialog from '@mui/material/Dialog';

import * as React from 'react';

import { GoodChannel } from './GoodChannel';
import { ChannelForm } from './ChannelForm';
import { PassForm } from './PassForm';

export function ListChannels({socket, label, setisp, setcurlabel, listusers, listfriends} : 
    { label: string,
            socket : Socket, 
            setisp : any, 
            setcurlabel : any, 
            listusers : {name: string, status: number, nickname : string}[], 
            listfriends : any}) {

    const [openchanform, setopenchanform] = useState<boolean>(false);
    const [openpass, setopenpass] = useState<boolean>(false);
    const [goodchanlist, setgoodchan] = useState<{label : string, status : number}[]>([]);
    const [curchan, setcurchan] = useState<string>("")
    const {auth} = useAuth();
    const axiosPrivate = useAxiosPrivate();

    const opencform = () =>
    {
            setopenchanform(true);
    }

    const closecform = () =>
    {
            setopenchanform(false);
    }

    const openp = () =>
    {
            setopenpass(true);
    }

    const closep = () =>
    {
            setopenpass(false);
    }

    useEffect(() => {
            listchan();
            socket.on('refreshchan', async () =>
            {
                setTimeout(() => {
                        listchan();
                }, 100);

            })
            return () => {
                socket.off('refreshchan');
            }
    }, [])

    const listchan = async () =>
    {
        const	ret = await axiosPrivate.post("http://" + process.env.REACT_APP_HOSTNAME42 + ":3000/api/user/chanfromuser/" ,JSON.stringify({data: {name :auth.name}}))
            if (ret != null)
            {
                    setgoodchan(ret.data);
            }
    }

    const clickOnChan = (proom: string, label : string, status : number) =>
    {
        if (proom == label)
                return ;
            setcurchan(label);
            if (status == 2 || status == 3)
            {
                    openp();
            }
            else
            {
                    setisp(false);
                    setcurlabel(label);
            }
            socket.emit("joinchatroom", { proom: proom, label: label} )
    }

    const goodchan = goodchanlist.map((chan, index) =>
            <div key={index} >
                    <ListItem >
                            <ListItemButton onClick={() => {clickOnChan(label, chan.label, chan.status)}}>
                                    <GoodChannel  name={chan.label} status={chan.status}/>
                            </ListItemButton>
                    </ListItem>
                    <Divider variant="inset" component="li" />
            </div>
    );

    return (    
            <div>
                    <Container>
                            <Paper sx = {{border : 1}} id='channel-list' elevation={5}>
                                <Box sx = {{m : 1}}>
                                {
                                        listfriends.length != 0 ? <div>
                                    <Typography  align='center' variant='h4' gutterBottom>
                                            Friends
                                    </Typography> 
                                    <List sx={{width: '100%', maxWidth: 360 }} >
                                            {listfriends}
                                    </List> </div>: null
                                }
                                </Box>
                                    <Typography align='center' variant='h4' gutterBottom>
                                            Channels
                                    </Typography>
                                    <List sx={{width: '100%', maxWidth: 360 }} >
                                            {goodchan}
                                    </List>

                                    <Box textAlign='center'>
                                            <Button  onClick={opencform} variant="outlined">NEW CHANNEL</Button>
                                    </Box>
                            </Paper >
                            <Dialog open={openchanform} onClose={closecform}>
                                    <ChannelForm listusers={listusers} closecform={closecform}/>
                            </Dialog>
                            <Dialog open={openpass} onClose={closep}>
                                    <PassForm setisp={setisp} setcurlabel={setcurlabel} closep={closep} label={curchan}/>
                            </Dialog>
                    </Container>
            </div>)
}
