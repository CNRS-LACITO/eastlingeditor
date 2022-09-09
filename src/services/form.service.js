import axios from 'axios';
import authHeader from './auth-header';
import globalParameters from '../global_parameters';

const API_URL = globalParameters.API_URL;

class FormService {

	getAnnotationForms(annotation_id) {

		return new Promise((resolve, reject) => {
	    axios.get(API_URL + "annotations/"+annotation_id+"/forms",{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });

	}

	get(id) {
		return new Promise((resolve, reject) => {
	    axios.get(API_URL + "forms/" + id,{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });
	}

  	create(kindOf, text, annotation_id) {

		let data = {kindOf:kindOf,text:text,annotation_id:annotation_id};
	    authHeader['Content-Type'] = 'application/json';

	    return new Promise((resolve, reject) => {
	    axios.post(API_URL + "forms", data,{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });
  	}

  	//update(id,kindOf,text){
  	update(id,kindOf,text){

	    let data = {kindOf:kindOf,text:text};

	    authHeader['Content-Type'] = 'application/json';

	    return new Promise((resolve, reject) => {
	    axios.put(API_URL + "forms/" +id, data,{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });
  	}

  	delete(id) {
	    return new Promise((resolve, reject) => {
	    axios.delete(API_URL + "forms/" + id,{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });
  	}
}

export default new FormService();
