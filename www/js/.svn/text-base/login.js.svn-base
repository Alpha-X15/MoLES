var app = {
	
	initialize: function() {
        this.bindEvents();
    },
	bindEvents: function() {
		document.addEventListener("deviceready", this.deviceReady, true);
		console.log("INIT!!!");
	},
	deviceReady: function() {
		console.log("deviceReady");
		$("#loginPage").on("pageinit",function() {
			console.log("pageinit run");
			$("#loginForm").on("submit",this.handleLogin);
			checkPreAuth();
		});
		$.mobile.changePage("#loginPage");
	},
	handleLogin: function() {
		console.log('HandleForm');
	    var form = $("#loginForm");    
	    //disable the button so we can't resubmit while we wait
	    $("#submitButton",form).attr("disabled","disabled");
	    var u = $("#username", form).val();
	    var p = $("#password", form).val();
	    if(u != '' && p!= '') {
	        $.post("http://molescore.mesh.de/users/canLogin.json", {username:u,password:p}, function(res) {
	            if(res == true) {
	                //store
	                window.localStorage["username"] = u;
	                window.localStorage["password"] = p;             
	                $.mobile.changePage("data/games.html");
	            } else {
	                navigator.notification.alert("Your login failed", function() {});
	            }
	         $("#submitButton").removeAttr("disabled");
	        },"json");
	    } else {
	        navigator.notification.alert("You must enter a username and password", function() {});
	        $("#submitButton").removeAttr("disabled");
	    }
	    return false;
	}
};

function checkPreAuth() {
		console.log("checkPreAuth");
	    var form = $("#loginForm");
	    if(window.localStorage["username"] != undefined && window.localStorage["password"] != undefined) {
	        $("#username", form).val(window.localStorage["username"]);
	        $("#password", form).val(window.localStorage["password"]);
	        this.handleLogin();
	    }
};