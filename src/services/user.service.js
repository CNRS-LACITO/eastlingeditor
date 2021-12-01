 import axios from 'axios';
import authHeader from './auth-header';
import globalParameters from '../global_parameters';

const API_URL = globalParameters.API_URL;

class UserService {
  getUserDocuments() {
  	//si un code 401 Unauthorized est renvoyé par cette requête, cela signifie que :
  	// - le token n'est plus valable
  	// - l'utilisateur n'est pas connecté
  	// dans les 2 cas il faut le rediriger vers la page de login
   return new Promise((resolve, reject) => {
    axios.get(API_URL + 'documents', { headers: authHeader() })
      .then(res => { resolve(res) })
      .catch(err => { reject(err) })
    });

  }

}

export default new UserService();
