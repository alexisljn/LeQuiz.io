import React from "react";
import {Link} from "react-router-dom";
import Util from "../../../util/Util";

import Toastr from "toastr2";
const toastr = new Toastr();

/**
 * Component displayed when the user wants to receive an email to reset his/her password
 */
class ForgotPassword extends React.Component {
    constructor(props) {
        super(props);

        Util.UserAccess.componentRequiresRole(Util.UserAccess.ROLES.GUEST_ONLY);
    }

    render = () => {
        return(
            <div className="text-center">
                <h1 className="mb">Mot de passe oublié</h1>
                <p className="mb2"><Link to="/login">Retour</Link></p>
                <form id="forgot-password-form" onSubmit={this.onForgotPasswordFormSubmit}>
                    <div className="mb3 mt3">
                        <input className="full-width" id="username-input" name="username" placeholder="Nom d'utilisateur ou adresse email" autoFocus autoComplete="username" required/>
                    </div>
                    <button type="submit" className="button green mb2">Réinitialiser le mot de passe</button>
                </form>
            </div>
        );
    }

    onForgotPasswordFormSubmit = async (e) => {
        e.preventDefault();

        // TODO make an automatic form serialization function in Util.js ?

        const username = document.getElementById('username-input').value;

        const response = await Util.sendJsonToAPI('/auth/forgot-password', {
            username,
        });

        const responseJson = await response.json();

        switch(response.status) {
            case 200:
                Util.verbose('Forgot password request successfully sent');
                toastr.success('Un email vous a été envoyé pour réinitialiser votre mot de passe.');
                break;
            case 404:
                toastr.error('Aucun utilisateur ne correspond à ce nom ou cette adresse email.');
                break;
            case 429:
                toastr.error(`Veuillez patienter ${responseJson.minutesToWait} minute${responseJson.minutesToWait > 1 ? 's' : ''} avant de demander un nouvel email de réinitialisation.`);
                break;
        }

        console.log(response.status, responseJson)
    }
}

export default ForgotPassword;