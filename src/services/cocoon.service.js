import axios from 'axios';
import authHeader from './auth-header';
import globalParameters from '../global_parameters';

const COCOON_PARSER_URL = globalParameters.COCOON_PARSER_URL;

class CocoonService {

	import(xmlFile, docId) {
	    let formData = new FormData();
	    formData.append("file", xmlFile);
	    formData.append("docId", docId);

	    authHeader['Content-Type'] = 'multipart/form-data';

	    return new Promise((resolve, reject) => {
	    axios.post(COCOON_PARSER_URL + "import", formData,{headers: authHeader()})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });
  	}

	getOai(oai,type) {
	    return axios.get(COCOON_PARSER_URL + '?oai_'+type+'='+ oai)
	      .then(response => response);
	  }

}

export default new CocoonService();
