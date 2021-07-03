import React from 'react';
import {BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom';
import * as ROUTES from '../constants/routes';
import Signup from './Signup';
import MainRoom from './MainRoom';
import Signin from './Signin';
import CallRoom2 from './CallRoom2';
import { AuthProvider,useAuth } from '../services/AuthContext';

function App() {
    const authUser = useAuth();

    return (
        <Router>
            <AuthProvider>
                <Switch>
                    <Route exact path={ROUTES.SIGNIN}>
                        <Signin />
                    </Route>
                    <Route exact path={ROUTES.SIGNUP}>
                        <Signup />
                    </Route>
                    <Route exact path={ROUTES.MAINROOM}>
                        <MainRoom />
                    </Route>
                    <Route path={ROUTES.CALL}>
                        <CallRoom2 />
                    </Route>
                    <Route exact path="/">
                        {authUser?<Redirect to={ROUTES.MAINROOM}/>:<Redirect to={ROUTES.SIGNIN}/>}
                    </Route>

                </Switch>
            </AuthProvider>
        </Router>      
    );
}

export default App