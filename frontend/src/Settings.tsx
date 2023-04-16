import { GenerateQRCode } from './generateQRCode';
import { UploadPicture } from './UploadPicture';
import { ChangeNickname } from './ChangeNickname';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

export const Settings = () => {

	return (
	<div className="smallContainer">
	<h2> SETTINGS </h2>
				<Tabs
					defaultActiveKey="nickname"
					transition={false}
					id="noanim-tab-example"
				>
					<Tab className="nickname" eventKey="nickname" title="Change nickname">
							<ChangeNickname />
					</Tab>
					<Tab eventKey="2FA" className="2FA" title="2FA Settings">
							<GenerateQRCode />
					</Tab>
					<Tab eventKey="picture" className="picture" title="Upload Avatar">
							<UploadPicture />
					</Tab>
				</Tabs>
	</div>
	);
}
