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
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);

        $(document).on('submit', '#loginForm', function() 
        {
            app.report("Before ajax");
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
                    app.report("beforeSend");
                    app.report("Auth: "+getAuth($('input[name=username]').val(), $('input[name=password]').val()));
                    xhr.setRequestHeader('Authorization', getAuth($('input[name=username]').val(), $('input[name=password]').val()));
                    xhr.setRequestHeader('pragma', 'no-cache');
                    xhr.setRequestHeader('Cache-Control', 'no-cache,max-age=0');
                    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                }
            })
            .done(function(data, textStatus, jqXHR) 
            {
                localStorage.setItem('_userID', data.data.id);
                localStorage.setItem('_loggedIn', "true");
                localStorage.setItem('_authToken', getAuth($('input[name=username]').val(), $('input[name=password]').val()));
                // app.report("Data: "+data.data.id);
                getGameList();
                window.location = "data/games.html";
            })
            .fail(function(jqXHR, textStatus) 
            {
                app.report("Status: " + jqXHR.status);
                app.report("Login request failed: " + textStatus);
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

function getAuth(name, pwd) 
{
    var bytes = Crypto.charenc.Binary.stringToBytes(name+':'+pwd);
    var base64 = Crypto.util.bytesToBase64(bytes);
    console.log(base64);
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
        beforeSend: function(xhr) 
        {
            xhr.setRequestHeader('Authorization', localStorage.getItem('_authToken'));
            xhr.setRequestHeader('pragma', 'no-cache');
            xhr.setRequestHeader('Cache-Control', 'no-cache,max-age=0');
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
    })
    .done(function(data, textStatus, jqXHR) 
    {
        app.report("GameList Loaded");
        app.report(data.data.gameInstances);
    })
    .fail(function(jqXHR, textStatus) 
    {
        // app.report("StatusCode: "+jqXHR.status);
        // app.report("Status: "+textStatus);
        app.report("Failed loading the GameList");
    });
}