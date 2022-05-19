import React from "react";
import Button from "../button/button.jsx";

export default class LoginComponent extends React.Component {
    render() {
        return (
            <div>
                <Button color="primary">
                    Login
                </Button>
            </div>
        );
    }
}