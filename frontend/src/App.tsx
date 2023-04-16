import {LoginForm} from './LoginForm';
import {TwoFAForm} from './TwoFAForm';
import {Chat} from './Chat';
import {GlobalMatchHistory} from './GlobalMatchHistory';
import {Dashboard} from './Dashboard';
import {DashboardFriend} from './DashboardFriend';
import {Pong} from './Pong';
import {Missing} from './Missing';
import {Settings} from './Settings';
import {RequireAuth} from './RequireAuth';
import { useAuth } from './hook/useAuth';
import { PersistLogin } from './PersistLogin';
import { PersistNotLogin } from './PersistNotLogin';
import './styles/app.css'



import 'bootstrap/dist/css/bootstrap.min.css';


import {
  Routes,
  Route,
	Navigate,
} from "react-router-dom";



const App = () => {


	const { auth } = useAuth();

  return (


		  <div className="main-app">

			<Routes>
							{/*	<Route path="/" element={<Layout />}> */}


							{/*Public*/}
							<Route element={<PersistNotLogin />}>

							 <Route
                path="/"
                element={ 
                      auth.name ?
                      <Navigate to="/Dashboard" /> :
                      <Navigate to="/Login" />
                }
            	  />

									<Route path="Login" element={<LoginForm/>}/>
									<Route path="Login2FA" element={<TwoFAForm/>}/>
							</Route>

							{/*Private*/}
							<Route element={<PersistLogin />}>
									<Route element={<RequireAuth />}>
											<Route path="Pong" element={<Pong/>}/>
									</Route>

									<Route element={<RequireAuth />}>
											<Route path="MatchHistory" element={<GlobalMatchHistory/>}/>
									</Route>

									<Route element={<RequireAuth />}>
											<Route path="Chat" element={<Chat/>}/>
									</Route>

									<Route element={<RequireAuth />}>
											<Route path="Dashboard" element={<Dashboard/>}/>
									</Route>

									<Route element={<RequireAuth />}>
											<Route path="Settings" element={<Settings/>}/>
									</Route>
									<Route element={<RequireAuth />}>
											<Route path="Dashboard/Friend/:friendName" element={<DashboardFriend/>}/>
									</Route>

									{/*Catch all 404*/}
									<Route path="*" element={<Missing />}/>

							</Route>

							{/*		</Route>  */}
			</Routes>
	</div>
	);
}

export default App;
