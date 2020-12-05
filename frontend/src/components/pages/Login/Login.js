import React from "react";
import {Link, Redirect } from "react-router-dom";
import Util from "../../../util/Util";


class Login extends React.Component {
    constructor(props) {
        super(props);

        if(this.props.currentUser) {
            this.state = {
                redirect: true,
            }
        } else {
            this.state = {
                redirect: false,
            }
        }
    }

    render = () => {
        if(this.state.redirect) {
            return(
                <Redirect to="/"/>
            )
        }

        return(
            <div className="text-center">
                <h1 className="mb">Connexion</h1>
                <p className="mb2">Tu n'as pas encore de compte ? <Link to="/register">Inscription</Link></p>
                <form id="login-form" onSubmit={this.onLoginFormSubmit}>
                    <div className="mb3 mt3">
                        <input className="full-width" id="username-input" name="username" placeholder="Nom d'utilisateur ou adresse email" autoFocus autoComplete="username" required/>
                    </div>
                    <div className="mb3">
                        <input className="full-width" id="password-input" type="password" name="password" placeholder="Mot de passe" autoComplete="current-password" required/>
                    </div>
                    <div className="mb3 text-left">
                        <label className="checkbox">
                            <input type="checkbox" id="stay-logged-in-checkbox" name="stayLoggedIn"/>
                            <span>Rester connecté</span>
                        </label>
                    </div>
                    <button type="submit" className="button green mb3">Connexion</button>
                </form>
            </div>
        )
    }

    onLoginFormSubmit = async (e) => {
        e.preventDefault();

        // TODO make an automatic form serialization function in Util.js ?

        const username = document.getElementById('username-input').value;
        const password = document.getElementById('password-input').value;
        const stayLoggedIn =  document.getElementById('stay-logged-in-checkbox').checked;

        const response = await Util.sendJsonToAPI('/auth/login', {
            username,
            password,
            stayLoggedIn,
        });

        const responseJson = await response.json()

        if(response.status === 200) {
            Util.verbose('Login successful');
            Util.setAccesstoken(responseJson.accessToken);
            Util.setRefreshToken(responseJson.refreshToken);

            this.props.setUser(Util.accessTokenPayload.user);

            this.setState({
                redirect: true,
            })
        }

        // TODO display error
    }
}

export default Login;