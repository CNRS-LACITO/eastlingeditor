var globalParameters = {
  //'API_URL': (window.location.hostname==='localhost')?'http://localhost:8000/api/':'https://eastling.huma-num.fr/api/'
  'API_URL': (window.location.hostname==='localhost')?'http://localhost:8000/api/':((window.location.hostname==='huma-num.fr')?'https://eastling.huma-num.fr/api/':'https://eastling.fr/api/')

}

export default globalParameters;