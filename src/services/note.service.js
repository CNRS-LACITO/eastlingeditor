import axios from 'axios';
import authHeader from './auth-header';
import globalParameters from '../global_parameters';

const API_URL = globalParameters.API_URL;

class NoteService {

  	create(lang, text, parent_type, parent_id) {

		let data = {lang:lang,text:text};
	    authHeader['Content-Type'] = 'application/json';

	    return new Promise((resolve, reject) => {
	    axios.post(API_URL + parent_type +"s/" + parent_id + "/notes", data,{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });
  	}

  	//update(id,lang,text){
  	update(id,lang,text){
  		let formData = new FormData();
	    formData.append("lang", lang);
	    formData.append("text", text);

	    let form = {lang:lang,text:text};

	    authHeader['Content-Type'] = 'application/json';

	    return new Promise((resolve, reject) => {
	    axios.put(API_URL + "notes/" +id, form,{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });
  	}

  	delete(id) {

	    return new Promise((resolve, reject) => {
	    axios.delete(API_URL + "notes/" + id,{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });
  	}
}

export default new NoteService();
