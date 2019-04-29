var name = 'Get Name from a Form';
var limit = 5;

curl -X "GET" "https://api.spotify.com/v1/search?q=" + name +
"&type=track%2Cartist%2Cplaylist&limit=5" -H "Accept: application/json"
-H "Content-Type: application/json";

//Im not sure how to make the command above run, but that is
// how you run this search function with spotify and make the
// search return a JSON style that'll be easy to search through
