import React, { Component } from "react";
import Form from "react-validation/build/form";
//import Input from "react-validation/build/input";

import AuthService from "../services/auth.service";
import CircularProgress from '@material-ui/core/CircularProgress';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://eastling.huma-num.fr">
        Matthew DEO / LACITO (C.N.R.S)
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const styles = (theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
});


const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

const required = value => {
  if (!value) {
    return (
      <div className="alert alert-danger" role="alert">
        This field is required!
      </div>
    );
  }
};

class Login extends Component {

  constructor(props) {
    super(props);
    this.handleLogin = this.handleLogin.bind(this);
    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.handleClickShowPassword = this.handleClickShowPassword.bind(this);


    this.state = {
      username: "",
      password: "",
      loading: false,
      message: "",
      showPassword: false
    };
  }

  onChangeUsername(e) {
    this.setState({
      username: e.target.value
    });
  }

  onChangePassword(e) {
    this.setState({
      password: e.target.value
    });
  }

  handleClickShowPassword(e){
    this.setState({
      showPassword: !(this.state.showPassword)
    });
  };

  handleLogin(e) {
    e.preventDefault();

    this.setState({
      message: "",
      loading: true
    });

    this.form.validateAll();

      AuthService.login(this.state.username, this.state.password).then(
        () => {
          if(window.intendedUrl){
            this.props.history.push(window.intendedUrl);
            //window.location.href=window.intendedUrl;

          }else{
            this.props.history.push("/documents");
          }
          window.intendedUrl = null;
          window.location.reload();

        },
        error => {
          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();

          this.setState({
            loading: false,
            message: resMessage
          });
        }
      );

    
  }

  render() {
  	const { classes } = this.props;
    return (
        <Container component="main" maxWidth="xs">
	      <CssBaseline />
	      <div className={classes.paper}>
	        <Avatar className={classes.avatar}>
	          <LockOutlinedIcon />
	        </Avatar>
	        <Typography component="h1" variant="h5">
	          Sign in
	        </Typography>
	        
	        <Form
            className={classes.form}
            onSubmit={this.handleLogin}
            ref={c => {
              this.form = c;
            }}
          >
	          <TextField
	            variant="outlined"
	            margin="normal"
	            required
	            fullWidth
	            id="username"
	            label="Username"
	            name="username"
	            autoComplete="username"
	            autoFocus
                value={this.state.username}
                onChange={this.onChangeUsername}
                validations={[required]}
	          />
	          <OutlinedInput
	            variant="outlined"
	            margin="normal"
	            required
	            fullWidth
	            name="password"
	            label="Password"
	            type={this.state.showPassword ? 'text' : 'password'}
	            id="password"
	            autoComplete="current-password"
                className="form-control"
                value={this.state.password}
                onChange={this.onChangePassword}
                validations={[required]}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={this.handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
	          />
	          

            {this.state.loading && 
              <Container >

                  <CircularProgress />

              </Container>
            }
            {!this.state.loading && 
              <div>
                <FormControlLabel
                  control={<Checkbox value="remember" color="primary" />}
                  label="Remember me"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                >
                  Sign In
                </Button>
                <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="#" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </div>
            }

	          
	        </Form>
	      </div>
	      <Box mt={8}>
	        <Copyright />
	      </Box>

	    </Container>
    );
  }
}

export default withStyles(styles)(Login);
