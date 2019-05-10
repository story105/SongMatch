var timeout;
var xmlHttp = null;
var audio;
var artistplaying;
var playing;
var songplaying;
var arraychosen = {
    artists: []
};
var allsongs = [];
var deletedsongs = [];
var interval;

window.onclick = function(event) {
    if (!$(event.target).hasClass("fa-caret-down") && !$(event.target).hasClass("artistname")) {
        $(".drop-menu").each(function() {
            var curr = $(this);
            if ($(this).hasClass("show")) $(this).removeClass("show");
        });
    }
}

function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    } else {
        begin += 2;
        var end = document.cookie.indexOf(";", begin);
        if (end == -1) {
            end = dc.length;
        }
    }
    return decodeURI(dc.substring(begin + prefix.length, end));
}

function setCookie(name, value, seconds) {
    var date = new Date();
    date.setTime(date.getTime() + seconds * 1000);
    var expires = "; expires=" + date.toGMTString();
    document.cookie = name + "=" + value + expires + ";";
}

function remove(array, element) {
    var index = array.indexOf(element);

    if (index !== -1) {
        array.splice(index, 1);
    }
}

function isInArray(array, element) {
    return array.indexOf(element) > -1;
}

function fadeIn(element) {
    var elem = document.getElementsByClassName(element)[0];
    $(elem).animate({
        opacity: "1"
    }, 500);
}

function createPage() {
    $(".navbar-nav [page='create']").addClass("active");
    $(".navbar-nav [page='playlists']").removeClass("active");
    $(".navbar-nav [page='generator']").removeClass("active");
}

function playlistsPage() {
    $(".navbar-nav [page='playlists']").addClass("active");
    $(".navbar-nav [page='create']").removeClass("active");
    $(".navbar-nav [page='generator']").removeClass("active");
}

function generatorPage() {
    $(".navbar-nav [page='generator']").addClass("active");
    $(".navbar-nav [page='playlists']").removeClass("active");
    $(".navbar-nav [page='create']").removeClass("active");
}

function searching() {
    if (timeout != undefined) clearTimeout(timeout);
    timeout = setTimeout(createSearch, 500);
}

$(document).on("click", ".preview", function() {
    var button = $(this);
    var plyorps = button.attr("class").split(" ")[4];
    var song = $(button).attr("songurl");

    if (plyorps == "fa-play-circle-o") {
        if (playing != null) {
            audio.pause();
            $(playing).removeClass("fa-pause-circle-o").addClass("fa-play-circle-o");
        }
        $(button).removeClass("fa-play-circle-o").addClass("fa-pause-circle-o");
        audio = new Audio("https://p.scdn.co/mp3-preview/" + song);
        audio.play();
        playing = button;
        songplaying = song;
        artistplaying = $(button).parent().parent().parent().attr("artistid");
    } else {
        $(playing).removeClass("fa-pause-circle-o").addClass("fa-play-circle-o");
        audio.pause();
        audio = null;
        playing = null;
        songplaying = null;
        artistplaying = null;
    }
});

$(document).on("click", ".artistname", function() {
    $(this).next().click();
});

$(document).on("click", ".dropdownArtist", function() {
    var list = $(this).parent().children(".drop-menu");

    $(".drop-menu").each(function() {
        var curr = $(this);
        if ($(curr).hasClass("show") && (($(curr).attr("artistid") != $(list).attr("artistid")) || ($(curr).attr("songid") != $(list).attr("songid")))) $(curr).removeClass("show");
    });

    $(list).toggleClass("show");
});

$(document).on("click", ".removeFrom", function() {
    var artistid = $(this).parent().parent().attr("artistid");

    $(".song").each(function() {
        song = $(this);

        var songArtists = $(song).attr("allart").split(",");

        if (isInArray(songArtists, artistid)) {
            var songid = $(song).attr("songid");
            remove(allsongs, songid);

            for (var j = 0; j < songArtists.length; j++) {
                for (var k = 0; k < arraychosen.artists.length; k++) {
                    if (arraychosen.artists[k].name == songArtists[j]) {
                        remove(arraychosen.artists[k].songs, songid);
                    }
                }
            }

        }
    });

    $("#chosen").children(".song").each(function() {
        if ($(this).attr("allart").indexOf(artistid) > -1) {
            $(this).animate({
                height: "0px"
            }, 400, function() {
                $(this).remove();
                showButtons();
            });
        }
    });

    songCount();
});

$(document).on("click", ".moreFrom", function() {
    var artistid = $(this).parent().parent().attr("artistid");
    songsToAdd(artistid, function(songs) {
        var chosen = document.getElementById("chosen");

        var spacer = $("<div></div>", {
            "class": "col-sm-1"
        }).appendTo("#container");

        var artsongs = $("div></div>", {
            "id": "songs",
            "class": "col-xs-12 col-sm-12",
        });

        if (songs.tracks.length == 0) alert("No more songs to add from the selected artist!");
        for (var i = 0; i < songs.tracks.length; i++) {
            var currentSong = songs.tracks[i];

            var allArtists = "";
            for (var j = 0; j < currentSong.artists.length; j++) allArtists += currentSong.artists[j].artid + ",";

            var songdiv = $("<div></div>", {
                "class": "song col-xs-12 col-sm-12",
                "songid": currentSong.id,
                "artistid": artistid,
                "allart": allArtists.substring(0, allArtists.length - 1)
            });

            var play = $("<span></span>", {
                "class": "preview col-xs-1 col-sm-1 fa fa-play-circle-o",
                "aria-hidden": "true"
            }).html("&nbsp;");

            if (currentSong.preview_url != null) {
                var song = currentSong.preview_url;
                $(play).attr("songurl", song.split("/")[4]);
                play.attr("title", "Play Preview");
            } else {
                $(play).attr("songurl", "null");
                $(play).css("color", "gray");
                $(play).attr("title", "Preview Unavailable");
            }

            $(play).appendTo($(songdiv));

            var songinfo = $("<span></span>", {
                "class": "col-xs-9 col-sm-9"
            });

            var songname = $("<span></span>", {
                "class": "songname col-xs-12 col-sm-12"
            }).html(currentSong.name);

            var songart = $("<span></span>", {
                "class": "songart col-xs-12 col-sm-12"
            });

            for (var j = 0; j < currentSong.artists.length; j++) {
                var artistwrap = $("<span></span>");

                var artistname = $("<span></span>", {
                    "class": "artistname"
                }).html(currentSong.artists[j].name).appendTo($(artistwrap));

                var dropdownArtist = $("<span></span>", {
                    "class": "dropdownArtist fa fa-caret-down",
                    "aria-hidden": "true",
                }).html("&nbsp;").appendTo($(artistwrap));

                var dropmenu = $("<ul></ul>", {
                    "class": "drop-menu",
                    "artistid": currentSong.artists[j].artid,
                    "songid": currentSong.id
                }).html("<li>" +
                    "<a class=\"dropmenuelement removeFrom\">" +
                    "<span>Remove songs from " + currentSong.artists[j].name + "</span>" +
                    "</a>" +
                    "</li>" +
                    "<li>" +
                    "<a class=\"dropmenuelement moreFrom\">" +
                    "<span>More songs from " + currentSong.artists[j].name + "</span>" +
                    "</a>" +
                    "</li>" +
                    "<li>" +
                    "<a class=\"dropmenuelement relatedTo\">" +
                    "<span>Songs from similar artist to " + currentSong.artists[j].name + "</span>" +
                    "</a>" +
                    "</li>").appendTo($(artistwrap));

                $(artistwrap).appendTo($(songart));
                $(songart).html($(songart).html() + ", ");
            }

            $(songart).html($(songart).html().substring(0, $(songart).html().length - 2));

            $(songname).appendTo($(songinfo));
            $(songart).appendTo($(songinfo));
            $(songinfo).appendTo($(songdiv));

            var songdlt = $("<span></span>", {
                "class": "fa fa-minus songdlt col-xs-1 col-sm-1",
                "aria-hidden": "true"
            }).html("&nbsp;").appendTo($(songdiv));

            $(chosen).prepend($(songdiv));
            var tarHeight = $(songdiv).height();
            $(songdiv).height(0).animate({
                height: tarHeight
            }, 300);
            for (var j = 0; j < currentSong.artists.length; j++) {
                var artistArray = arraychosen.artists.filter(artist => artist.name === currentSong.artists[j].artid);
                if (artistArray.length != 0) {

                } else {
                    arraychosen.artists.push({
                        name: currentSong.artists[j].artid,
                        songs: []
                    });
                }

                for (var k = 0; k < arraychosen.artists.length; k++) {
                    if (arraychosen.artists[k].name == currentSong.artists[j].artid) {
                        arraychosen.artists[k].songs.push(currentSong.id);

                    }
                }
            }
        }
        $("#searchbar").val("");
        $("#results").html("");
        showButtons();
        songCount();
    });
});

$(document).on("click", ".relatedTo", function() {
    var artistid = $(this).parent().parent().attr("artistid");
    relatedToArray(artistid, function(songs) {

        var chosen = document.getElementById("chosen");

        var spacer = $("<div></div>", {
            "class": "col-sm-1"
        }).appendTo("#container");

        var artsongs = $("div></div>", {
            "id": "songs",
            "class": "col-xs-12 col-sm-12",
        });

        if (songs.tracks.length == 0) alert("No more songs to add from the selected artist!");
        for (var i = 0; i < songs.tracks.length; i++) {
            var currentSong = songs.tracks[i];

            var allArtists = "";
            for (var j = 0; j < currentSong.artists.length; j++) allArtists += currentSong.artists[j].artid + ",";

            var songdiv = $("<div></div>", {
                "class": "song col-xs-12 col-sm-12",
                "songid": currentSong.id,
                "artistid": artistid,
                "allart": allArtists.substring(0, allArtists.length - 1)
            });

            var play = $("<span></span>", {
                "class": "preview col-xs-1 col-sm-1 fa fa-play-circle-o",
                "aria-hidden": "true"
            }).html("&nbsp;");

            if (currentSong.preview_url != null) {
                var song = currentSong.preview_url;
                $(play).attr("songurl", song.split("/")[4]);
                play.attr("title", "Play Preview");
            } else {
                $(play).attr("songurl", "null");
                $(play).css("color", "gray");
                $(play).attr("title", "Preview Unavailable");
            }

            $(play).appendTo($(songdiv));

            var songinfo = $("<span></span>", {
                "class": "col-xs-9 col-sm-9"
            });

            var songname = $("<span></span>", {
                "class": "songname col-xs-12 col-sm-12"
            }).html(currentSong.name);

            var songart = $("<span></span>", {
                "class": "songart col-xs-12 col-sm-12"
            });

            for (var j = 0; j < currentSong.artists.length; j++) {
                var artistwrap = $("<span></span>");

                var artistname = $("<span></span>", {
                    "class": "artistname"
                }).html(currentSong.artists[j].name).appendTo($(artistwrap));

                var dropdownArtist = $("<span></span>", {
                    "class": "dropdownArtist fa fa-caret-down",
                    "aria-hidden": "true",
                }).html("&nbsp;").appendTo($(artistwrap));

                var dropmenu = $("<ul></ul>", {
                    "class": "drop-menu",
                    "artistid": currentSong.artists[j].artid,
                    "songid": currentSong.id
                }).html("<li>" +
                    "<a class=\"dropmenuelement removeFrom\">" +
                    "<span>Remove songs from " + currentSong.artists[j].name + "</span>" +
                    "</a>" +
                    "</li>" +
                    "<li>" +
                    "<a class=\"dropmenuelement moreFrom\">" +
                    "<span>More songs from " + currentSong.artists[j].name + "</span>" +
                    "</a>" +
                    "</li>" +
                    "<li>" +
                    "<a class=\"dropmenuelement relatedTo\">" +
                    "<span>Songs from similar artist to " + currentSong.artists[j].name + "</span>" +
                    "</a>" +
                    "</li>").appendTo($(artistwrap));

                $(artistwrap).appendTo($(songart));
                $(songart).html($(songart).html() + ", ");
            }

            $(songart).html($(songart).html().substring(0, $(songart).html().length - 2));

            $(songname).appendTo($(songinfo));
            $(songart).appendTo($(songinfo));
            $(songinfo).appendTo($(songdiv));

            var songdlt = $("<span></span>", {
                "class": "fa fa-minus songdlt col-xs-1 col-sm-1",
                "aria-hidden": "true"
            }).html("&nbsp;").appendTo($(songdiv));

            $(chosen).prepend($(songdiv));
            var tarHeight = $(songdiv).height();
            $(songdiv).height(0).animate({
                height: tarHeight
            }, 300);
            for (var j = 0; j < currentSong.artists.length; j++) {
                var artistArray = arraychosen.artists.filter(artist => artist.name === currentSong.artists[j].artid);
                if (artistArray.length != 0) {

                } else {
                    arraychosen.artists.push({
                        name: currentSong.artists[j].artid,
                        songs: []
                    });
                }

                for (var k = 0; k < arraychosen.artists.length; k++) {
                    if (arraychosen.artists[k].name == currentSong.artists[j].artid) {
                        arraychosen.artists[k].songs.push(currentSong.id);

                    }
                }
            }
        }
        $("#searchbar").val("");
        $("#results").html("");
        showButtons();
        songCount();
    });
});

$(document).on("click", ".searchres", function() {
    var artistid = $(this).attr("artistid");

    songsToAdd(artistid, function(songs) {
        var chosen = document.getElementById("chosen");

        var spacer = $("<div></div>", {
            "class": "col-sm-1"
        }).appendTo("#container");

        var artsongs = $("div></div>", {
            "id": "songs",
            "class": "col-xs-12 col-sm-12",
        });

        if (songs.tracks.length == 0) alert("No more songs to add from the selected artist!");
        for (var i = 0; i < songs.tracks.length; i++) {
            var currentSong = songs.tracks[i];
            var allArtists = "";
            for (var j = 0; j < currentSong.artists.length; j++) allArtists += currentSong.artists[j].artid + ",";

            var songdiv = $("<div></div>", {
                "class": "song col-xs-12 col-sm-12",
                "songid": currentSong.id,
                "artistid": artistid,
                "allart": allArtists.substring(0, allArtists.length - 1)
            });

            var play = $("<span></span>", {
                "class": "preview col-xs-1 col-sm-1 fa fa-play-circle-o",
                "aria-hidden": "true"
            }).html("&nbsp;");

            if (currentSong.preview_url != null) {
                var song = currentSong.preview_url;
                $(play).attr("songurl", song.split("/")[4]);
                play.attr("title", "Play Preview");
            } else {
                $(play).attr("songurl", "null");
                $(play).css("color", "gray");
                $(play).attr("title", "Preview Unavailable");
            }

            $(play).appendTo($(songdiv));

            var songinfo = $("<span></span>", {
                "class": "col-xs-9 col-sm-9"
            });

            var songname = $("<span></span>", {
                "class": "songname col-xs-12 col-sm-12"
            }).html(currentSong.name);

            var songart = $("<span></span>", {
                "class": "songart col-xs-12 col-sm-12"
            });

            for (var j = 0; j < currentSong.artists.length; j++) {
                var artistwrap = $("<span></span>");

                var artistname = $("<span></span>", {
                    "class": "artistname"
                }).html(currentSong.artists[j].name).appendTo($(artistwrap));

                var dropdownArtist = $("<span></span>", {
                    "class": "dropdownArtist fa fa-caret-down",
                    "aria-hidden": "true",
                }).html("&nbsp;").appendTo($(artistwrap));

                var dropmenu = $("<ul></ul>", {
                    "class": "drop-menu",
                    "artistid": currentSong.artists[j].artid,
                    "songid": currentSong.id
                }).html("<li>" +
                    "<a class=\"dropmenuelement removeFrom\">" +
                    "<span>Remove songs from " + currentSong.artists[j].name + "</span>" +
                    "</a>" +
                    "</li>" +
                    "<li>" +
                    "<a class=\"dropmenuelement moreFrom\">" +
                    "<span>More songs from " + currentSong.artists[j].name + "</span>" +
                    "</a>" +
                    "</li>" +
                    "<li>" +
                    "<a class=\"dropmenuelement relatedTo\">" +
                    "<span>Songs from similar artist to " + currentSong.artists[j].name + "</span>" +
                    "</a>" +
                    "</li>").appendTo($(artistwrap));

                $(artistwrap).appendTo($(songart));
                $(songart).html($(songart).html() + ", ");
            }

            $(songart).html($(songart).html().substring(0, $(songart).html().length - 2));

            $(songname).appendTo($(songinfo));
            $(songart).appendTo($(songinfo));
            $(songinfo).appendTo($(songdiv));

            var songdlt = $("<span></span>", {
                "class": "fa fa-minus songdlt col-xs-1 col-sm-1",
                "aria-hidden": "true"
            }).html("&nbsp;").appendTo($(songdiv));

            $(chosen).prepend($(songdiv));
            var tarHeight = $(songdiv).height();
            $(songdiv).height(0).animate({
                height: tarHeight
            }, 300);
            for (var j = 0; j < currentSong.artists.length; j++) {
                var artistArray = arraychosen.artists.filter(artist => artist.name === currentSong.artists[j].artid);
                if (artistArray.length != 0) {

                } else {
                    arraychosen.artists.push({
                        name: currentSong.artists[j].artid,
                        songs: []
                    });
                }

                for (var k = 0; k < arraychosen.artists.length; k++) {
                    if (arraychosen.artists[k].name == currentSong.artists[j].artid) {
                        arraychosen.artists[k].songs.push(currentSong.id);

                    }
                }
            }
        }
        $("#searchbar").val("");
        $("#results").html("");
        showButtons();
        songCount();
    });
});

$(document).on("focus", "#searchbar", function() {
    var res = $("#results");
    res.css("visibility", "visible").css("height", "");
    //res.css("height","");
});

$(document).on("keydown", "#searchbar", function() {
    var searchword = $("#searchbar").val();
    var results = $("#results");

    if (searchword != "" && typeof searchword != undefined) {
        searchArtists(searchword, function(totable) {
            $(results).html("");
            for (var i in totable.artists.items) {
                var newartist = $("<div></div>", {
                    "class": "searchres col-xs-12 col-sm-12",
                    "artist": totable.artists.items[i].name.replace(/ /g, '_'),
                    "artistid": totable.artists.items[i].id
                });

                var artistimg = $("<span></span>", {
                    "class": "artpica col-xs-1"
                });

                var img = $("<img></img>", {
                    "class": "artpic col-xs-12"
                });
                if (totable.artists.items[i].images[0] != undefined) {
                    $(img).attr("src", totable.artists.items[i].images[0].url);
                } else {
                    $(img).attr("src", "../img/qmark.png");
                }

                $(img).appendTo($(artistimg));
                $(artistimg).appendTo($(newartist));

                var artistnm = $("<span></span>", {
                    "class": "tart col-xs-11 col-sm-8"
                }).html(totable.artists.items[i].name).appendTo($(newartist));

                var artistgen = $("<span></span>", {
                    "class": "tgenr hidden-xs col-sm-3"
                });

                if (totable.artists.items[i].genres[0] != undefined)
                    artistgen.html(totable.artists.items[i].genres[0]);
                $(artistgen).appendTo($(newartist));

                $(newartist).appendTo($(results));
            }
        });
    } else {
        results.html("");
        songCount();
    }
});

$(document).on("focusout", "#searchbar", function() {
    var timeout = setTimeout(function() {
        var res = $("#results");
        res.css("visibility", "hidden").css("height", "0px");
        $(".fa-search").css("color", "black");
        clearTimeout(timeout);
    }, 200);
});

$(document).on("click", "#create", function() {
    var public = null;
    var next = true;
    var name = $("#playlistname").val();
    //document.getElementById("playlistname").value;
    if ($("#public").is(':checked')) public = true;
    else if ($("#private").is(':checked')) public = false;
    if (arraychosen.artists[0] != "" && typeof name != 'undefined') {
        if (name != "" && typeof name != 'undefined') {
            if (public != null) {
                $(".create").attr('disabled', 'disabled');
                createPlaylist(name, public, function(playlistinfo) {
                    alert("Hello");
                    addToPlaylist(name, playlistinfo, 0);
                });
            } else {
                alert("Choose if your playlist is public or private!");
            }
        } else {
            alert("Please pick a name for your playlist!");
        }
    }
});

$(document).on("click", "#cancel", function() {
    $('.overlay').animate({
        top: '-100%'
    }, 200, function() {
        $('.overlay').css('display', 'none');
    });
});

$(document).on("input", "#speed", function() {
    $("#rangeprog").attr({
        x2: $("#speed").val() * ($("#speed").width() / 100.0) - (1 * ($("#speed").val()) / 10)
    });
});

$(document).on("resize", function() {
    $("#rangeprog").attr({
        x2: $("#speed").val() * ($("#speed").width() / 100.0) - (1 * ($("#speed").val()) / 10)
    });
});

$(document).on("load", function() {
    $("#rangeprog").attr({
        x2: $("#speed").val() * ($("#speed").width() / 100.0) - (1 * ($("#speed").val()) / 10)
    });
});

$(document).on("click", ".songdlt", function() {
    var song = $(this).parent();
    var sngid = $(song).attr("songid");
    var artids = $(song).attr("allart").split(",");

    remove(allsongs, sngid);
    for (var i = 0; i < artids.length; i++) {
        for (var j = 0; j < arraychosen.artists.length; j++) {
            var theArtist = arraychosen.artists[j];
            if (theArtist.name == artids[i]) {
                if (songplaying == $(song).children(".preview").attr("songurl")) {
                    audio.pause();
                    audio = null;
                    playing = null;
                    songplaying = null;
                }
                if (theArtist.songs.length == 1) {
                    arraychosen.artists.splice(j, 1);
                    deletedsongs.push(sngid);
                    $(song).animate({
                            height: "0px"
                        }, 400, function()

                        {

                            $(song).remove();

                            showButtons();

                        });
                } else {
                    remove(theArtist.songs, sngid);
                    deletedsongs.push(sngid);
                    $(song).animate({
                        height: "0px"
                    }, 200, function() {
                        $(song).remove();
                    });
                }

            }
        }
    }
    songCount();
});

$(document).on("click", "#createplay", function() {
    if (songCount() != 0) {
        $("#cancel").animate({
            opacity: "1"
        }, 500);
        $("#create").animate({
            opacity: "1"
        }, 500);
        $(".overlay").css("display", "block").animate({
            top: "0%"
        }, 200);
    } else {
        alert("Please select artists before creating your playlist!");
    }
});

$(document).on("click", "#clearchosen", function() {
    arraychosen.artists.length = 0;
    allsongs.length = 0;
    $('#chosen').animate({
        height: '0px'
    }, $("#chosen").height(), function() {
        $("#chosen").html("");
        $("#chosen").css('height', '');
        $("#artists").html("");
        $("#artists").css('height', '');
    });
    showButtons();
    songCount();
});

function relatedToArray(artistid, _callback) {
    var toAdd = {
        tracks: []
    };

    searchRelatedArtists(artistid, function(relArts) {
        var i = 0;

        var loopArray = function() {
            var artist;
            var theArtist;

            artist = Math.floor(Math.random() * (relArts.length - 1));
            theArtist = relArts[artist];

            searchArtistsTopTracks(theArtist, function(songs) {
                var artistsInfo = [];

                var song;
                var theSong = undefined;

                while (theSong == undefined || alreadyExists(toAdd, theSong.id)) {
                    song = Math.floor(Math.random() * (songs.tracks.length - 1));
                    theSong = songs.tracks[song];

                }

                allsongs.push(theSong.id);
                for (j = 0; j < theSong.artists.length; j++) {
                    artistsInfo.push({
                        artid: theSong.artists[j].id,
                        name: theSong.artists[j].name
                    });
                }

                toAdd.tracks.push({
                    image: theSong.album.images[0].url,
                    id: theSong.id,
                    name: theSong.name,
                    preview_url: theSong.preview_url,
                    artists: artistsInfo
                });

                i++;
                if (i < 5) loopArray();
                else _callback(toAdd);
            });
        }

        loopArray();
    });
}

function playlistDone() {
    if (audio != null) {
        audio.pause();
        audio = null;
        playing = null;
        songplaying = null;
        artistplaying = null;
    }

    $('.overlay').animate({
        top: '-100%'
    }, 200, function() {
        $("#public").prop("checked", "false");
        $("#private").prop("checked", "false");
        $("#playlistname").val("");

        /*document.getElementById("public").checked = false;
        document.getElementById("private").checked = false;
        document.getElementById("playlistname").value = "";*/
        $('.overlay').css('display', 'none');
        $(".create").removeAttr('disabled');

        arraychosen.artists.length = 0;
        allsongs.length = 0;
        deletedsongs.length = 0;
        $('#chosen').animate({
            height: '0px'
        }, $("#chosen").height(), function() {
            $("#chosen").html("");
            $("#chosen").css('height', '');
            $("#artists").html("");
            $("#artists").css('height', '');
        });
        showButtons();
        songCount();
    });

}

function showButtons() {
    if (songCount() != 0) {
        $("#createplay").css("display", "block").animate({
            opacity: "1"
        }, 500);
        $("#clearchosen").css("display", "block").animate({
            opacity: "1"
        }, 500);
    } else {
        $("#createplay").animate({
            opacity: "0"
        }, 200, function() {
            $("#createplay").css("display", "none");
        });
        $("#clearchosen").animate({
            opacity: "0"
        }, 200, function() {
            $("#clearchosen").css("display", "none");
        });

    }
}

function getNewToken(_callback) {
    if (getCookie("access_token") == null) {
        if (xmlHttp != null) {
            xmlHttp.abort();
            xmlHttp = null;
        }

        xmlHttp = $.ajax({
            type: "POST",
            url: "scripts/refreshTokens.php",
            success: function(msg) {
                xmlHttp = null;
                accessToken = msg;
                setCookie("access_token", msg, 3600);
                _callback();
                return accessToken;
            }
        });
    } else {
        _callback();
    }
    return getCookie("access_token");
}

function searchArtistAlbums(searchQuer, _callback) {
    accessToken = getNewToken(function() {
        if (searchQuer != "" && typeof searchQuer != 'undefined') {
            $.ajax({
                type: "GET",
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", "Bearer " + accessToken);
                    request.setRequestHeader("Accept", "application/json");
                },
                url: "https://api.spotify.com/v1/artists/" + searchQuer + "/albums",
                success: function(msg) {
                    var allAlbums = "";
                    jQuery.each(msg.items, function() {
                        allAlbums += this.id + ",";
                    });
                    allAlbums = allAlbums.substring(0, allAlbums.length - 1);
                    _callback(allAlbums);
                    xmlHttp = null;
                }
            });
        } else {

        }
    });

}

function searchAlbumSongs(searchQuer, _callback) {
    accessToken = getNewToken(function() {
        if (searchQuer != "" && typeof searchQuer != 'undefined') {
            $.ajax({
                type: "GET",
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", "Bearer " + accessToken);
                    request.setRequestHeader("Accept", "application/json");
                },
                url: "https://api.spotify.com/v1/albums?ids=" + searchQuer,
                success: function(msg) {
                    _callback(msg);
                    xmlHttp = null;
                }
            });
        } else {

        }
    });
}

function searchRelatedArtists(searchQuer, _callback) {
    accessToken = getNewToken(function() {
        if (searchQuer != "" && typeof searchQuer != 'undefined') {
            $.ajax({
                type: "GET",
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", "Bearer " + accessToken);
                    request.setRequestHeader("Accept", "application/json");
                },
                url: "https://api.spotify.com/v1/artists/" + searchQuer + "/related-artists",
                success: function(relArts) {
                    var relarts = [];

                    for (var i = 0; i < relArts.artists.length; i++) {
                        relarts.push(relArts.artists[i].id);
                    }
                    _callback(relarts);
                }
            });
        } else {}

    });
}

function searchArtists(searchQuer, _callback) {
    accessToken = getNewToken(function() {
        if (xmlHttp != null) {
            xmlHttp.abort();
            xmlHttp = null;
        }

        if (searchQuer != "" && typeof searchQuer != 'undefined') {
            var search = searchQuer.replace(" ", "%20");

            xmlHttp = $.ajax({
                type: "GET",
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", "Bearer " + accessToken);
                    request.setRequestHeader("Accept", "application/json");
                },
                url: "https://api.spotify.com/v1/search?q=" + search + "*&type=artist",
                success: function(msg) {
                    xmlHttp = null;
                    _callback(msg);
                }
            });
        } else {

        }

    });
}

function searchSongs(searchQuer, _callback) {
    accessToken = getNewToken(function() {
        if (xmlHttp != null) {
            xmlHttp.abort();
            xmlHttp = null;
        }

        if (searchQuer != "" && typeof searchQuer != 'undefined') {
            var search = searchQuer.replace(" ", "%20");

            xmlHttp = $.ajax({
                type: "GET",
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", "Bearer " + accessToken);
                    request.setRequestHeader("Accept", "application/json");
                },
                url: "https://api.spotify.com/v1/search?q=" + search + "*&type=song",
                success: function(msg) {
                    xmlHttp = null;
                    _callback(msg);
                }
            });
        } else {

        }

    });
}

function searchArtistsTopTracks(searchQuer, _callback) {
    accessToken = getNewToken(function() {
        if (searchQuer != "" && typeof searchQuer != 'undefined') {
            var search = searchQuer.replace(" ", "%20");

            $.ajax({
                type: "GET",
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", "Bearer " + accessToken);
                    request.setRequestHeader("Accept", "application/json");
                },
                url: "https://api.spotify.com/v1/artists/" + search + "/top-tracks?country=" + countryCode,
                success: function(msg) {
                    _callback(msg);
                }
            });
        } else {

        }

    });
}

function URIList() {
    var uristring = "spotify%3Atrack%3A";
    var songURI = "";
    var songs = [];
    var songcount = 0;
    for (var i = 0; i < allsongs.length; i++) {
        if (songcount < 98) {
            songURI += (uristring + allsongs[i] + ",");
            songcount++;
        } else {
            songs.push(songURI.substring(0, songURI.length - 1));
            songcount = 0;
            songURI = "";
        }

    }
    songs.push(songURI.substring(0, songURI.length - 1));
    return songs;
}

function createPlaylist(playName, playPublic, _callback) {
    accessToken = getNewToken(function() {
        var toPass = {
            name: playName,
            public: playPublic
        };
        var pass = JSON.stringify(toPass);
        $.ajax({
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: pass,
            beforeSend: function(request) {
                request.setRequestHeader("Authorization", "Bearer " + accessToken);
                request.setRequestHeader("Accept", "application/json");
            },
            url: "https://api.spotify.com/v1/users/" + userId + "/playlists",
            success: function(msg) {
                _callback(msg);
            }
        });

    });
    ß
}

function addToPlaylist(name, playlistinfo, which) {
    URI = URIList();
    alert("Hello2");
    accessToken = getNewToken(function() {
        $.ajax({
            type: "POST",
            beforeSend: function(request) {
                request.setRequestHeader("Authorization", "Bearer " + accessToken);
                request.setRequestHeader("Accept", "application/json");
            },
            url: "https://api.spotify.com/v1/users/" + userId + "/playlists/" + playlistinfo.id + "/tracks?uris=" + URI[which],
            success: function(msg) {
                //console.log(JSON.parse(msg));
                if (typeof URI[which + 1] == "undefined") {
                    alert("Your playlist " + name + " has been successfully created!");
                    playlistDone();
                } else {
                    addToPlaylist(name, playlistinfo, which + 1);
                }
            },

            error: function(msg) {
                console.log(JSON.parse(msg));
            }
        });

    });
}

function removeArtist() {

    var btn = event.target.parentNode;
    var id = $(btn).attr("artistid");
    for (var i = 0; i < arraychosen.artists.length; i++) {
        if (arraychosen.artists[i].name == id) {
            if (id == artistplaying) {
                audio.pause();
                audio = null;
                playing = null;
                songplaying = null;
                artistplaying = null;
            }


            arraychosen.artists.splice(i, 1);

            $(btn).animate({
                    height: "0px"
                }, 400, function()

                {

                    $(btn).remove();

                    showButtons();

                });

            $("#chosen").children("#song").each(function()

                {

                    if ($(this).attr("artistid") == id)

                    {

                        $(this).animate({
                                height: "0px"
                            }, 400, function()

                            {

                                $(this).remove();

                                showButtons();

                            });

                    }

                });
        }
    }
    songCount();
}

function alreadyExists(toAdd, value) {
    if (isInArray(allsongs, value) || isInArray(deletedsongs, value)) return true;

    for (var i = 0; i < toAdd.tracks.length; i++) {
        if (toAdd.tracks[i].id == value) return true;
    }

    return false;
}

function songsToAdd(artId, _callback) {
    var toAdd = {
        tracks: []
    };
    var numArt = 0;
    var numTop = 0;
    var numOther = 0;
    var numRel = 0;

    numTop = 2;
    numOther = 3;

    searchArtistsTopTracks(artId, function(songs) {
        var count = songs.tracks.length - 1;

        for (i = 0; i < numTop; i++) {
            var tooLong = false;

            var artistsInfo = [];
            var songToAdd = Math.floor(Math.random() * count);


            var numInWhile = 0;

            while (songs.tracks[songToAdd] == undefined || alreadyExists(toAdd, songs.tracks[songToAdd].id)) {
                if (numInWhile == 5) {
                    tooLong = true;
                    break;
                    numTop--;
                    numOther++;
                }

                numInWhile++;
                songToAdd = Math.floor(Math.random() * count);
            }

            if (numInWhile == 5 && tooLong == true) continue;

            allsongs.push(songs.tracks[songToAdd].id);

            for (j = 0; j < songs.tracks[songToAdd].artists.length; j++) {
                artistsInfo.push({
                    artid: songs.tracks[songToAdd].artists[j].id,
                    name: songs.tracks[songToAdd].artists[j].name
                });
            }

            toAdd.tracks.push({
                image: songs.tracks[songToAdd].album.images[0].url,
                id: songs.tracks[songToAdd].id,
                name: songs.tracks[songToAdd].name,
                preview_url: songs.tracks[songToAdd].preview_url,
                artists: artistsInfo,
                fromartist: artId
            });

            delete songs.tracks[songToAdd];
        }

        searchArtistAlbums(artId, function(albums) {
            searchAlbumSongs(albums, function(allSongs) {

                for (i = 0; i < numOther; i++) {
                    var artistsInfo = [];

                    var album;
                    var theAlbum;

                    var song;
                    var theSong = undefined;

                    var numInWhile = 0;

                    while (theSong == undefined || alreadyExists(toAdd, theSong.id)) {
                        if (numInWhile == 5) break;
                        numInWhile++;
                        album = Math.floor(Math.random() * (allSongs.albums.length - 1));
                        theAlbum = allSongs.albums[album];

                        song = Math.floor(Math.random() * (theAlbum.tracks.items.length - 1));
                        theSong = theAlbum.tracks.items[song];

                    }

                    if (numInWhile == 5 && theSong == undefined) break;

                    allsongs.push(theSong.id);

                    for (j = 0; j < theSong.artists.length; j++) {
                        artistsInfo.push({
                            artid: theSong.artists[j].id,
                            name: theSong.artists[j].name
                        });
                    }

                    toAdd.tracks.push({
                        image: theAlbum.images[0].url,
                        id: theSong.id,
                        name: theSong.name,
                        preview_url: theSong.preview_url,
                        artists: artistsInfo
                    });

                    delete allSongs.albums[album].tracks.items[song];
                }
                _callback(toAdd);
            });
        });
    });
}

function existingArtist(id) {
    for (var i = 0; i < arraychosen.artists.length; i++) {
        if (arraychosen.artists[i].name == id) {

            return true;
        }
    }
    return false;
}

function songCount() {
    $("#songcount").html(allsongs.length);
    return allsongs.length;
}

function doLoadOut() {
    fadeIn("login");
    fadeIn("logo");
}

function doLoadIn() {
    fadeIn("logout");
    fadeIn("profpic");
    fadeIn("logname");
}
