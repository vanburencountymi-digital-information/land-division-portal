import React, { useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import * as firebaseui from "firebaseui";
import { auth } from "../firebase/firebase"; // adjust the path if needed
import { useNavigate } from "react-router-dom";
import "../styles/AuthUI.css";

const AuthUI = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Get an instance of FirebaseUI or create a new one
        const ui =
        firebaseui.auth.AuthUI.getInstance() ||
        new firebaseui.auth.AuthUI(auth);

        const uiConfig = {
            signInOptions: [
                {
                provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
                requireDisplayName: false,
                },
                {
                provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID
                },
            ],
            callbacks: {
                signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                    // User successfully signed in.
                    navigate("/dashboard");
                    return false;
                },
            },
            signInFlow: 'popup',
            tosUrl: '<your-tos-url>',
            privacyPolicyUrl: '<your-privacy-policy-url>'
        };

        ui.start("#firebaseui-auth-container", uiConfig);
    }, [navigate]);

  return <div id="firebaseui-auth-container"></div>;
};

export default AuthUI;