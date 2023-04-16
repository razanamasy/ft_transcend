import React, { useState } from 'react';
import './App.css';
import { useAuth } from './hook/useAuth';
import useAxiosPrivate from './hook/useAxiosPrivate'
import { ListOnGoingGame } from './ListOnGoingGame';
import { GameSpectator } from './GameSpectator';
import { SearchForMatch } from './SearchForMatch';

//Bootstrap
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export const PongReceptionRoom = (props: any) => {
	const { auth } = useAuth();
	const axiosPrivate = useAxiosPrivate();
	const [gameInfo, setGameInfo] = useState();

	return (
    <Container>
      <Row  >
        <Col sm={8}><GameSpectator infos={gameInfo} setGameInfo={setGameInfo} /></Col>

    	  <Col sm={4}>
     	   <Row ><ListOnGoingGame infos={gameInfo}  setGameInfo={setGameInfo} setShow={props.setShow} setShowDecline={props.setShowDecline} /></Row>
     	   <Row ><SearchForMatch show={props.show} setShow={props.setShow} showDecline={props.showDecline} setShowDecline={props.setShowDecline} /></Row>
      	</Col>
      </Row>
    </Container>
	);
}
