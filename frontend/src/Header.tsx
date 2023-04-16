import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useAuth } from './hook/useAuth';
import { Stat } from './Stat';
import { CustomAvatar } from './CustomAvatar';

export const Header = () => {

	//Every user info to add in auth -> useauth
	const { auth } = useAuth();
	return (
		<Container>
			<Row>
				<Col xs lg="2">
					<CustomAvatar name={auth.name} />
				</Col>
				<Col>
					<h2>
						{auth.nickname}
						<br/>
						<Stat/>
					</h2>
				</Col>
			</Row>
		</Container>
	)
}
