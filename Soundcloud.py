#code to reference soundcloud API
<script src="https://connect.soundcloud.com/sdk/sdk-3.3.2.js"></script>
<script>
SC.initialize({
  client_id: 'YOUR_CLIENT_ID',
  redirect_uri: 'http://example.com/callback'
});

// initiate auth popup
SC.connect().then(function() {
  return SC.get('/me');
}).then(function(me) {
  alert('Hello, ' + me.username);
});
</script>

#Log in possibilities
import soundcloud

# create client object with app credentials
client = soundcloud.Client(client_id='YOUR_CLIENT_ID',
                           client_secret='YOUR_CLIENT_SECRET',
                           redirect_uri='http://example.com/callback')

# redirect user to authorize URL
redirect client.authorize_url()
