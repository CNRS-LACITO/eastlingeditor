import axios from 'axios';
import authHeader from './auth-header';
import globalParameters from '../global_parameters';

const API_URL = globalParameters.API_URL;

class ImageService {


  	create(resourceFile, rank, filename, name, document_id) {

		let formData = new FormData();
	    formData.append("resourceFile", resourceFile);
	    formData.append("rank", rank);
	    formData.append("filename", filename);
	    formData.append("name", name);
	    formData.append("document_id", document_id);


	    authHeader['Content-Type'] = 'multipart/form-data';

	    return new Promise((resolve, reject) => {
	    axios.post(API_URL + "images",formData,{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });
  	}

  	delete(id) {
	    return new Promise((resolve, reject) => {
	    axios.delete(API_URL + "images/" + id,{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });
  	}
}

export default new ImageService();
