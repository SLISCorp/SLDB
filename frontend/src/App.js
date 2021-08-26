import React, { Component } from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import {
  showAlert,
  showDangerToast,
  showToast,
} from "./components/toastMessage";
import deviceIfo from "../src/helpers/deviceInfo";
// import { askForPermissioToReceiveNotifications, onMessageListener } from './push-notification';
import "./scss/style.scss";

const loading = () => (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
);

// Containers
const DefaultLayout = React.lazy(() => import("./containers/TheLayout"));

// Pages
const Login = React.lazy(() => import("./views/pages/login/Login"));
const ResetPassword = React.lazy(() => import("./views/pages/reset/Reset"));
const Page404 = React.lazy(() => import("./views/pages/page404/Page404"));

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount = async () => {
    if (Notification.permission !== "granted") {
      await Notification.requestPermission();
    }
    // var token = await askForPermissioToReceiveNotifications();
    let deviceDetail = deviceIfo();
    // if (token) {
    //   deviceDetail.fcmToken = token
    // }
    // onMessageListener().then(payload => {
    //   console.log("payload ----->", payload);
    //   this.notifyMe(payload.notification)
    // }).catch(err => console.log('failed: ', err));

    this.props.storeDevice(deviceDetail);
  };

  notifyMe = (notification) => {
    if (Notification.permission !== "granted")
      Notification.requestPermission();
    else {
      var notification = new Notification(notification.title, {
        icon: notification.icon,
        body: notification.body,
      });

      notification.onclick = function () {
        window.open(notification.click_action);
      };
    }
  }

  render() {
    return (
      <BrowserRouter>
        <React.Suspense fallback={loading()}>
          <Switch>
            <Route
              exact
              path="/admin/login"
              name="Login"
              render={(props) => <Login {...props} />}
            />
            <Route
              exact
              path="/reset-password/:id"
              name="Reset Password"
              render={(props) => <ResetPassword {...props} />}
            />
            <Route
              path="/admin"
              exact
              name="Home"
              render={(props) => <Redirect to="/admin/dashboard" />}
            />
            <Route
              path="/admin/*"
              name="Home"
              render={(props) =>
                this.props.user ? (
                  <DefaultLayout {...props} />
                ) : (
                    <Redirect to="/admin/login" />
                  )
              }
            />
            <Route
              path="/"
              exact={true}
              name="Admin"
              render={(props) => <Redirect to="/admin/dashboard" />}
            />
            <Route path="/*" exact render={(props) => <Page404 {...props} />} />
          </Switch>
        </React.Suspense>
      </BrowserRouter>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    deviceInfo: state.deviceInfo,
    loading: state.loading,
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    storeDevice: (data) => {
      dispatch({ type: "update", payload: data });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
