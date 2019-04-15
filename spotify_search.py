#Basically just the code for making a song/artist search

import spotipy
import sys
import pprint

if len(sys.argv) > 1:
    search_str = sys.argv[1]
else:
    search_str = 'Artist/Song'

sp = spotipy.Spotify()
result = sp.search(search_str)
pprint.pprint(result)
