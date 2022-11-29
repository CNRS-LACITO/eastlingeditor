import axios from 'axios';
import authHeader from './auth-header';
import globalParameters from '../global_parameters';

const API_URL = globalParameters.API_URL;

class HelperService {

	getLangISOCodes(input) {

		return new Promise((resolve, reject) => {
	    axios.get(API_URL + "langisocodes/"+input,{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });

	}

}

export default new HelperService();
