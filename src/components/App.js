import React from 'react';
import {BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom';
import * as ROUTES from '../constants/routes';
import Signup from './Signup';
import MainRoom from './MainRoom';
import Signin from './Signin';
import CallRoom from './CallRoom';
import { AuthProvider,useAuth } from '../services/AuthContext';
import ContactCallRoom from './ContactCallRoom';

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
                    <Route exact path={ROUTES.CALL}>
                        <CallRoom />
                    </Route>
                    <Route exact path={ROUTES.CONTACT_CALL}>
                        <ContactCallRoom />
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