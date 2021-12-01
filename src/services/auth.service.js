import axios from "axios";
import globalParameters from '../global_parameters';

const API_URL = globalParameters.API_URL + 'auth/';

class AuthService {
  login(username, password) {
  	
    return axios
      .post(API_URL + "login", {
        username,
        password
      })
      .then(response => {
        if (response.data.token) {

          localStorage.setItem("user", JSON.stringify(response.data));

        }

        return response.data;
      });
  }

  logout() {
    localStorage.removeItem("user");
  }

  register(username, email, password) {
    return axios.post(API_URL + "signup", {
      username,
      email,
      password
    });
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }
}

export default new AuthService();
