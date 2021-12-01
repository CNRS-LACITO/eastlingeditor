import axios from 'axios';
import authHeader from './auth-header';
import globalParameters from '../global_parameters';

const API_URL = globalParameters.API_URL;

class ContributorService {

  	create(data) {

	    authHeader['Content-Type'] = 'application/json';

	    return new Promise((resolve, reject) => {
	    axios.post(API_URL + "contributors", data,{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });
  	}

  	delete(id) {
	    return new Promise((resolve, reject) => {
	    axios.delete(API_URL + "contributors/" + id,{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });
  	}

  	getDocumentContributors(id) {
	    return new Promise((resolve, reject) => {
	    axios.get(API_URL + "documents/" + id + "/contributors",{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });
  	}
}

export default new ContributorService();
