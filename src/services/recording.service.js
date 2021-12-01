import axios from 'axios';
import authHeader from './auth-header';
import globalParameters from '../global_parameters';

const API_URL = globalParameters.API_URL;

class RecordingService {


  	create(resourceFile, type, name, document_id) {

		let formData = new FormData();
	    formData.append("resourceFile", resourceFile);
	    formData.append("type", type);
	    formData.append("filename", name);
	    formData.append("name", name);
	    formData.append("document_id", document_id);

	    authHeader['Content-Type'] = 'multipart/form-data';

	    return new Promise((resolve, reject) => {
	    axios.post(API_URL + "recordings",formData,{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });
  	}

  	delete(id) {
	    return new Promise((resolve, reject) => {
	    axios.delete(API_URL + "recordings/" + id,{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });
  	}
}

export default new RecordingService();
