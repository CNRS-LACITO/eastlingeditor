import React, { Component  } from "react";
import { Switch, Route, Link } from "react-router-dom";
import { BrowserRouter, withRouter } from "react-router-dom";
import "./App.css";

import AuthService from "./services/auth.service";

import Login from "./components/login.component";
import Register from "./components/register.component";
import Home from "./components/home.component";
import Profile from "./components/profile.component";
import Documents from "./components/documents.component";
import Document from "./components/document.component";

import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import MenuIcon from '@material-ui/icons/Menu';

import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';

import CloseIcon from '@material-ui/icons/Close';
import LogIcon from '@material-ui/icons/ExitToApp';
import RegisterIcon from '@material-ui/icons/AssignmentInd';
import ProfileIcon from '@material-ui/icons/AccountCircle';
import DocumentsIcon from '@material-ui/icons/FolderOpen';

import {
  createMuiTheme,
  MuiThemeProvider
} from "@material-ui/core/styles";


const theme = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#1d2654',
    },
    secondary: {
      main: '#00a096',
    },
    background: {
      default: '#ede7f6',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Chivo"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),

  }
});

class App extends Component {
  constructor(props) {
    super(props);
    this.logOut = this.logOut.bind(this);

    this.state = {
      currentUser: undefined,
      openMenu: false,
      anchorRef: React.createRef()
    };
  }

  componentDidMount() {
    const user = AuthService.getCurrentUser();

    if (user) {
      this.setState({
        currentUser: user,
        //showModeratorBoard: user.roles.includes("ROLE_MODERATOR"),
        //showAdminBoard: user.roles.includes("ROLE_ADMIN"),
      });
    }
  }

  logOut() {
    AuthService.logout();
    this.props.history.push('/login');
  }

  handleToggle = () => {
    this.setState({
        openMenu: true
      });
  };

  handleCloseMenu = (event) => {
    this.setState({
        openMenu: false
      });
  };

  handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      this.setState({
        openMenu: false
      });
    }
  }

  redirect=()=> {
    window.location.href = this.state.notificationLink;
  }

  render() {
    const { openMenu,openNotification,notification, anchorRef } = this.state;

    return (
      <MuiThemeProvider theme={theme}>
      <div>
        <Button
          ref={anchorRef}
          aria-controls={openMenu ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={this.handleToggle}
        >
          <MenuIcon />
        </Button>
        <Popper open={openMenu}  role={undefined} anchorEl={anchorRef.current} transition disablePortal>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
            >
              <Paper>
                <ClickAwayListener onClickAway={this.handleCloseMenu}>
                  <MenuList autoFocusItem={openMenu} id="menu-list-grow" onKeyDown={this.handleListKeyDown}>
                    { 
                      typeof this.state.currentUser === 'undefined' ?
                      <div>
                        <MenuItem>
                          <Button
                            component={Link}
                            to='/login'
                            startIcon={<LogIcon />}
                            disableElevation
                          >
                            Login
                          </Button>
                        </MenuItem>
                        <MenuItem>
                          <Button
                            component={Link}
                            to='/register'
                            startIcon={<RegisterIcon />}
                            disableElevation
                          >
                            Sign Up
                          </Button>
                        </MenuItem>
                      </div>
                    :
                    <div>
                      <MenuItem >
                        <Button
                            component={Link}
                            to='/profile'
                            startIcon={<ProfileIcon />}
                            disableElevation
                            onClick={this.handleCloseMenu}
                          >
                          My Profile
                        </Button>
                      </MenuItem>
                      <MenuItem >
                        <Button
                            component={Link}
                            to='/documents'
                            startIcon={<DocumentsIcon />}
                            disableElevation
                            onClick={this.handleCloseMenu}
                          >
                          My documents
                        </Button>
                      </MenuItem>
                      <MenuItem>
                        <Button
                            component={Link}
                            startIcon={<LogIcon />}
                            disableElevation
                            onClick={this.logOut}
                          >
                          Logout
                        </Button>
                      </MenuItem>
                    </div>
                  }
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>

        <Container className="container mt-3">
            <Switch>
              <Route exact path={["/", "/home"]} component={Home} />
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <Route path="/profile" component={Profile} />
              <Route path="/documents/:docId" component={Document} />
              <Route path="/documents" component={Documents} />
            </Switch>

          
        </Container>

      </div>

      </MuiThemeProvider>
    );
  }
}

export default withRouter(App);
