import axios from 'axios';
import authHeader from './auth-header';
import globalParameters from '../global_parameters';

const API_URL = globalParameters.API_URL;

class DocumentService {

	import(xmlFile, docId) {
	    let formData = new FormData();
	    formData.append("file", xmlFile);
	    formData.append("docId", docId);

	    authHeader['Content-Type'] = 'multipart/form-data';

	    return new Promise((resolve, reject) => {
	    axios.post(API_URL + "import", formData,{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });

  	}

	get(docId) {
	    return axios.get(API_URL + 'documents/' + docId, { headers: authHeader() })
	      .then(response => response.data);
	  }

	getByOAI(oaiPrimary,oaiSecondary) {
	    return axios.get(API_URL + 'documents/oai/'+ oaiPrimary + "/" + oaiSecondary, { headers: authHeader() })
	      .then(response => response.data);
	  }

//???????????????TODO : reporter dans une seule requête vers l'API et tout traiter en PHP ? oui car pas d'interactions avec le user !!!

/////////////////////////////////////////////////

  	create(lang, type) {
  		let formData = new FormData();
	    formData.append("lang", lang);
	    formData.append("type", type);

	    authHeader['Content-Type'] = 'application/x-www-form-urlencoded';

	    return new Promise((resolve, reject) => {
	    axios.post(API_URL + "documents", formData,{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });
  	}

  	update(docId,data) {

	    authHeader['Content-Type'] = 'application/json';

	    return new Promise((resolve, reject) => {
	    axios.put(API_URL + "documents/" + docId, data,{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });
  	}


  	delete(docId) {

	    return new Promise((resolve, reject) => {
	    axios.delete(API_URL + "documents/" + docId,{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });
  	}

  	getAnnotations(docId) {
  		var headers = authHeader();
  		headers['Content-Type'] = 'application/json';

	    return axios.get(API_URL + 'documents/' + docId + '/annotations', { headers: headers })
	      .then(response => response);
	  }

  	getAnnotationsXML(docId) {
  		var headers = authHeader();
  		headers['Content-Type'] = 'xml';

	    return axios.get(API_URL + 'documents/' + docId + '/annotationsxml', { headers: headers })
	      .then(response => response);
	  }

	getAnnotationsJSON4LATEX(docId) {
  		var headers = authHeader();
  		headers['Content-Type'] = 'application/json';

	    return axios.get(API_URL + 'documents/' + docId + '/annotationsjson4latex', { headers: headers })
	      .then(response => response);
	  }
}

export default new DocumentService();
