var globalParameters = {
  //'API_URL': (window.location.hostname==='localhost')?'http://localhost:8000/api/':'https://eastling.huma-num.fr/api/'
  'API_URL': (window.location.hostname==='localhost')?'http://localhost:8000/api/':((window.location.hostname==='eastling.huma-num.fr')?'https://eastling.huma-num.fr/api/':'https://eastling.fr/api/'),
  'COCOON_PARSER_URL': 'https://eastling.huma-num.fr/player/parserMySQL.php'

}

export default globalParameters;