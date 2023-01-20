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
/*
	    let formDataCloudConvert = new FormData();
	    formDataCloudConvert.append("file", resourceFile);
	    formDataCloudConvert.append("filename", name);


	    authHeader['Content-Type'] = 'multipart/form-data';

	    var authHeaderCloudConvert = { 
	    	Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMzM4OTgzYThmMWYwNjhmNjcyNWVhMGRjNzljMzA1OTg0MDY2NTEwNjcwOGRhNjRiZGQ5YmVjNzRmMjFhZWZkZWNhNzgyNDQ0NzBjYjE0ZTYiLCJpYXQiOjE2NzM1MTQ1MDAuNTUwNTM5LCJuYmYiOjE2NzM1MTQ1MDAuNTUwNTQsImV4cCI6NDgyOTE4ODEwMC41NDQ0NDEsInN1YiI6IjQ5Mzk5MjQ4Iiwic2NvcGVzIjpbInVzZXIucmVhZCIsInVzZXIud3JpdGUiLCJ0YXNrLnJlYWQiLCJ0YXNrLndyaXRlIiwid2ViaG9vay5yZWFkIiwid2ViaG9vay53cml0ZSIsInByZXNldC5yZWFkIiwicHJlc2V0LndyaXRlIl19.ERJ_NTNcbYcCPocnf7bk5zp5H8Av92DQRtaAJy-Fbt7UPts6OFsnigi60MgPhoVH7je6lmaGO-TtgK_zCDcgEqFdpLZgfPY7QS4pXyM9oAZXfrD_YWMRAAAPby4OQ-_jpdSxZwhuNDc1-nq9lMoUiKRqMOgV54I4uHqcFKTVO_rI9xkMhJV5p4xOfM2p4hxXi9grUqI21TwoBxrVoSoCHlEOYP0kNYAywCnNtFQM5PPINt9lYauEZ_7o1fcFxL6nL8TN60kr0Xe8TnYM39tC7xt818WxBPWQnKs3EVqLRa8Bl6Xmra2dm7JQ0ClJIjJffxZ86CAvp98JsiKl1_S0-5X5fPfuIZ-y6Yeye-49Cwfj7yS6AMqYcjf_U68gDQjZrRia-a4AxOVg1yTou-i-SXcpGZfOZ2s7b2ho2ZxI2Upd67pLSlSDmVRm9k58dDzw9CSmhUt9FdtzyYHib1498KzJRXpUb7Ivo_mwOagC8I_9bmYrh3VrdAUk1DYncLEsKGx3USwx4fl5bUfX1Qn1lAU0Bs9JCdy_BjbFDHAkIbPGhEo1HGgf91rgdbPYjwWD_7zUFUNn0Fzv0nd5SbZxV6fUCSoGQQf1oIH7FfzcmFvlFgJpOUrO6dovBvNmmOrgwWEoIAFfof3L93rpQWEOsPnFvJAaxWJrcY_bL6t39zQ',
	    	'Content-Type':'multipart/form-data'
	    };

	    return new Promise((resolve, reject) => {
	    axios.post("https://api.cloudconvert.com/v2/import/upload",formDataCloudConvert,{headers: authHeaderCloudConvert})
	      .then(res => { resolve(res) })
	      .catch(err => { reject(err) })
	    });
	    */

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
