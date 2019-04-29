var express = require('express');
var request = require('request');

var client_id = '301fd822abf147a0badff531fa8f0acc';
var client_secret = 'a2163df35d514829945fc215e5a49936';
var redirect_uri = 'https://www.spotify.com';

var app = express();

app.get('/authorize', function(req, res)){

  var refresh_token = req.query.refresh_token;
  var scope = 'playlist-modify-public';
  
});
