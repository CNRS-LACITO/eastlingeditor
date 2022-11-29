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
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import MenuIcon from '@material-ui/icons/Menu';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Box from '@material-ui/core/Box';

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
      main: 'rgb(0, 120, 183)',
    },
    secondary: {
      main: '#dddddd',
    },
    background: {
      default: '#f7f7f8',
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
      openUserMenu:false,
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
    this.props.history.push('/login',null);
    window.location.reload();

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

  redirect = () => {
    window.location.href = this.state.notificationLink;
  }

  render() {
    const { openMenu, anchorRef } = this.state;
    const logoPath = (typeof this.state.currentUser === 'undefined') ? (window.location.origin+"/editor/img/Eastling_Bleu_BASELINE_2022.png"):(window.location.origin+"/editor/img/Eastling_Bleu_BASELINE_2022.png");
    const logoHeight= (typeof this.state.currentUser === 'undefined') ? 100 : 54;

    return (
      <MuiThemeProvider theme={theme}>
      <div>
        <AppBar 
          position="static"
          style={{backgroundColor:"#ffffff",boxShadow:"none"}}
          >
          <Toolbar>
            <Box
              component="img"
              sx={{height: logoHeight}}
              alt="Eastling logo"
              src={logoPath}
            />

            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-control="menu-user"
              aria-haspopup="true"
            >
              <ProfileIcon />
            </IconButton>
             <Menu
                id="menu-user"
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem>My account</MenuItem>
                <MenuItem>Log out</MenuItem>
              </Menu>

          </Toolbar>
        </AppBar>

        <Button
          ref={anchorRef}
          aria-controls={openMenu ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={this.handleToggle}
          title="Menu"
          style={{position:'absolute'}}
        >
          <MenuIcon />
        </Button>
        <Popper style={{zIndex:99999}} open={openMenu}  role={undefined} anchorEl={anchorRef.current} transition disablePortal>
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
