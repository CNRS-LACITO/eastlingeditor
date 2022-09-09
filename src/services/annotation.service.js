import axios from 'axios';
import authHeader from './auth-header';
import globalParameters from '../global_parameters';

const API_URL = globalParameters.API_URL;

class AnnotationService {

	getDocumentAnnotations(document_id) {

		return new Promise((resolve, reject) => {
	    axios.get(API_URL + "documents/"+document_id+"/annotations",{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });

	}

	getAnnotationChildren(id) {

		return new Promise((resolve, reject) => {
	    axios.get(API_URL + "annotations/"+id+"/children",{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });

	}

	getAnnotationNotes(id) {

		return new Promise((resolve, reject) => {
	    axios.get(API_URL + "annotations/"+id+"/notes",{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });

	}

	//SECURITE : ne retourner une réponse que si l'annotation appartient bien au document
  	get(docId,id) {
	    /*return axios.get(API_URL + 'annotations/' + id, { headers: authHeader() })
	      .then(response => response.data);*/

	     return axios.get(API_URL + 'documents/'+docId+'/annotations/' + id, { headers: authHeader() })
	      .then(response => response.data);


	 }

	 update(id,data){
/*
	    let data = {
	    	audioStart:audioStart,
	    	audioEnd:audioEnd,
	    	image_id:imageId,
	    	areaCoords:areaCoords
	    };
*/
	    authHeader['Content-Type'] = 'application/json';

	    return new Promise((resolve, reject) => {
	    axios.put(API_URL + "annotations/" +id, data,{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });
  	}

  	create(data) {

	    authHeader['Content-Type'] = 'application/json';

	    return new Promise((resolve, reject) => {
	    axios.post(API_URL + "annotations",data,{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });
  	}

  	delete(id) {
	    return new Promise((resolve, reject) => {
	    axios.delete(API_URL + "annotations/" + id,{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });
  	}
}

export default new AnnotationService();
