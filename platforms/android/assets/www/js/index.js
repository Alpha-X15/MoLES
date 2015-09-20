/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    cons:
    {
      // SERVER_URL: 'http://141.83.80.180/',
      SERVER_URL: 'http://molescore.mesh.de/',
      LOGIN_URL: 'users/canLogin.json',
      GAMELIST_URL: 'gameInstances/index/index.json',
      LOCATION_URL: 'gameInstanceLocations/getUserLastLocations/instance:1.json',
      LOCATION_URL2: 'gameInstanceLocations/add.json',
      // ALLMISSIONS_URL: '/games/view/{GameID}.json',
      ALLMISSIONS_URL: '/games/view/{GameID}.json',
    },

    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        // navigator.splashscreen.show();
        app.receivedEvent('deviceready');
		    app.report(device.platform);

        //Set Database
        // var db = window.sqlitePlugin.openDatabase("LOGIN", "1.0", "LOGIN", 100);
        // var db = window.sqlitePlugin.openDatabase({name: "DB"});

        // setupTable();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        app.report('Received Event: ' + id);

        // Test for getting OS and version
        app.report(window.device.platform);
        app.report(window.device.version);

        $(document).on("pageshow","#maps_page",function(){ // When entering pagetwo
            // alert("pagetwo is now shown");
            initializeMap();
            // map.invalidateSize();
        });

        $(document).on('click', '#submitButton', function()
        {
            localStorage.setItem('_userID', '0');
            app.report("User: "+$('input[name=username]').val());
            app.report("User: "+$('input[name=password]').val());

            $.ajax({
                url: app.cons.SERVER_URL + app.cons.LOGIN_URL,
                dataType: 'json',
                xhrFields:
                {
                    withCredentials: true
                },
                crossDomain: true,
                beforeSend: function(xhr)
                {
                    navigator.notification.activityStart('Login..', 'loading');
                    xhr.setRequestHeader('Authorization', getAuth($('input[name=username]').val(), $('input[name=password]').val()));
                    xhr.setRequestHeader('pragma', 'no-cache');
                    xhr.setRequestHeader('Cache-Control', 'no-cache,max-age=0');
                    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                },
                success: function(msg)
                {
                  // app.report(JSON.stringify(msg, null, 4));
                  if(msg.data.valid == true)
                  {
                    localStorage.setItem('_userID', msg.data.id);
                    localStorage.setItem('_loggedIn', "true");
                    localStorage.setItem('_authToken', getAuth($('input[name=username]').val(), $('input[name=password]').val()));

                    getGameList();
                  }

                }
            })
            .fail(function(jqXHR, textStatus)
            {
                app.report("Status: " + jqXHR.status);
                app.report("Login request failed: " + textStatus);
                navigator.notification.activityStop();
              // if(jqXHR.status == 403 || (jqXHR.status == 404 && jqXHR.responseJSON.data == 'Invalid post data')) $('div.alert.alert1').show();
              // else $('div.alert.alert2').show();
              // setContentVisibility(true);
            });
        });
    },
    report: function(id)
    {
        console.log("Report: "+ id);
    }
};

//LOGIN DATABASE BEGIN //
// Create Table
function setupTable(tx)
{
	tx.executeSql('DROP TABLE IF EXISTS LOGIN');
	tx.executeSql('CREATE TABLE IF NOT EXISTS LOGIN (id unique, username, status)');
	app.report("SetupTaple");
}

//Database Errorhandling
function dbErrorHandler(tx, err){
	app.report("DB Error: "+err.message + "\nCode="+err.code);
}

//Get Database Entries
function getEntries() {
	dbShell.transaction(function(tx) {
		tx.executeSql("select id, status",[],getLogin,dbErrorHandler);
	}, dbErrorHandler);
	app.report("GetEntries");
}

function getLogin(tx,results)
{
  if(results.rows.item(0).status)
	{
		getGameList();
	}
	else
	{
			app.report("No Entries");
	}
}

//Insert into Database LOGIN
function saveUser(node, cb) {
	  app.report("Node-Save: " + node.id + " - " + node.user);
	  app.report("SaveNode");
	  dbShell.transaction(function(tx) {
		if(node.id == "")
			tx.executeSql('INSERT INTO LOGIN(username,status) VALUES (node.user, true)');
		else
			app.report("Fail to save!");
	}, dbErrorHandler,cb);
}
//LOGIN DATABASE END //

function getAuth(name, pwd)
{
    var bytes = Crypto.charenc.Binary.stringToBytes(name+':'+pwd);
    var base64 = Crypto.util.bytesToBase64(bytes);
    app.report(base64);
    return "Basic " + base64;
}

function getGameList()
{
    $.ajax(
    {
        url: app.cons.SERVER_URL + app.cons.GAMELIST_URL,
        dataType: 'json',
        xhrFields:
        {
            withCredentials: true
        },
        crossDomain: true,
        type: 'GET',
        beforeSend: function(xhr)
        {
            // app.report("Authtoken: "+localStorage.getItem('_authToken'));
            xhr.setRequestHeader('Authorization', localStorage.getItem('_authToken'));
            xhr.setRequestHeader('pragma', 'no-cache');
            xhr.setRequestHeader('Cache-Control', 'no-cache,max-age=0');
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
    })
    .done(function(data, textStatus, jqXHR)
    {
        var gameInstances = data.data.gameInstances;
        var gamesListContent = '';
        for(var i = 0; i<gameInstances.length; i++)
        {
            gamesListContent += '<li id="'+gameInstances[i]["GameInstance"]["game_id"]+'-'+gameInstances[i]["GameInstance"]["name"]+'"><a href="javaScript:void(0)">'+gameInstances[i]["GameInstance"]["name"]+'</a></li>';
        }
        $('#gameList').append(gamesListContent);
        $('#gameList').delegate('li', 'click', function()
        {
          var cgame = $(this).attr('id').split('-');
          setGameSelection(cgame[0], cgame[1]);
        });

        navigator.notification.activityStop();
        $.mobile.changePage($('#games_page'));
    })
    .fail(function(jqXHR, textStatus)
    {
        app.report("StatusCode: "+jqXHR.status);
        app.report("Status: "+textStatus);
        app.report("Failed loading the GameList");
        navigator.notification.activityStop();
    });
}

function getLocationList()
{
    app.report("locationlist for "+localStorage.getItem('_gameID'));

    $.ajax(
    {
        url: app.cons.SERVER_URL + app.cons.ALLMISSIONS_URL.replace("{GameID}", localStorage.getItem('_gameID')),
        dataType: 'json',
        xhrFields:
        {
            withCredentials: true
        },
        crossDomain: true,
        type: 'GET',
        beforeSend: function(xhr)
        {
            navigator.notification.activityStart('LoadLocationList..', 'loading');
            xhr.setRequestHeader('Authorization', localStorage.getItem('_authToken'));
            xhr.setRequestHeader('pragma', 'no-cache');
            xhr.setRequestHeader('Cache-Control', 'no-cache,max-age=0');
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
    })
    .done(function(data, textStatus, jqXHR)
    {
        app.report("LocationList Loaded");
        // app.report(textStatus);
        // app.report(JSON.stringify(data.data.game, null, 4));
        var placeInstances = data.data.game;
        // app.report(JSON.stringify(placeInstances["Mission"]));

        $('#placesTitle').append(localStorage.getItem('_gameName'));
        $('#placesText').append(placeInstances["Game"]["description"]);

        // app.report(JSON.stringify(placeInstances["Mission"][0]["Question"]));

        var placesListContent = '';
        for(var i = 0; i<placeInstances["Mission"].length; i++)
        {
            placesListContent += '<li><a>'+placeInstances["Mission"][i]["name"]+'</a></li>';
        }
        $('#placesList').append(placesListContent);

        navigator.notification.activityStop();
        $.mobile.changePage($('#places_page'));
    })
    .fail(function(jqXHR, textStatus)
    {
        app.report("StatusCode: "+jqXHR.status);
        app.report("Status: "+textStatus);
        app.report("Failed loading the LocationList");
    });
}

function setGameSelection(game_id, name)
{
    app.report("Should set game selection with id="+game_id+' and name='+name);
    localStorage.setItem('_gameID', game_id);
    localStorage.setItem('_gameName', name);

    getLocationList();
}

function initializeMap()
{
    var map = L.map('map',{
      center: [51.505, -0.09],
      zoom: 13
    });
    //
    // L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   maxZoom: 18
    // }).addTo(map);

    L.tileLayer('http://{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg',{
      maxZoom: 18
    }).addTo(map);
}
