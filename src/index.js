import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";
import { Provider } from 'react-translated';
import translation from './translation';


if(!window.location.pathname.includes("/login")){
  window.intendedUrl = window.location.pathname.replace("/editor","") + window.location.search;
}


var lang = unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape('lang').replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));

if(lang.length===0) lang="en";


ReactDOM.render(
  <BrowserRouter basename="/editor">
    <Provider language={lang} translation={translation}>
      <App />
    </Provider>
  </BrowserRouter>,
  document.getElementById("root")
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
