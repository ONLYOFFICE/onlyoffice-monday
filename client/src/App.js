import React from "react";
import mondaySdk from "monday-sdk-js";
import "typeface-roboto";
import AppContainerComponent from "./components/app-container/app-container-component";
import LoginComponent from "./components/login/login-component";
const monday = mondaySdk();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isLoggedIn: true, settings: {}, context: {} };
  }

  componentDidMount() {
    monday.listen("settings", this.getSettings);
    monday.listen("context", this.getContext);
  }

  getSettings = (res) => {
    console.log("settings: ");
    console.log(res.data);
    this.setState({ settings: res.data });
  };

  getContext = (res) => {
    console.log(monday.storage);
    console.log("ctx: ");
    console.log(res.data);
    // Check auth, display login page
    this.setState({ context: res.data });
  };

  render() {
    console.log("rendering");
    const { isLoggedIn, context } = this.state;
    return (
      <div className="monday-app">
        {isLoggedIn ? <AppContainerComponent context={context} /> : <LoginComponent />}
      </div>
    );
  }
}

export default App;
