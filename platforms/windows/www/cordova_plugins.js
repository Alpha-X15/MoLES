cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/org.apache.cordova.dialogs/www/notification.js",
        "id": "org.apache.cordova.dialogs.notification",
        "merges": [
            "navigator.notification"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.dialogs/src/windows/NotificationProxy.js",
        "id": "org.apache.cordova.dialogs.NotificationProxy",
        "merges": [
            ""
        ]
    },
    {
        "file": "plugins/io.litehelpers.cordova.sqlite/www/SQLitePlugin.js",
        "id": "io.litehelpers.cordova.sqlite.SQLitePlugin",
        "clobbers": [
            "SQLitePlugin"
        ]
    },
    {
        "file": "plugins/io.litehelpers.cordova.sqlite/src/windows/SQLiteProxy.js",
        "id": "io.litehelpers.cordova.sqlite.SQLiteProxy",
        "merges": [
            ""
        ]
    },
    {
        "file": "plugins/io.litehelpers.cordova.sqlite/src/windows/SQLite3-WinRT/SQLite3JS/js/SQLite3.js",
        "id": "io.litehelpers.cordova.sqlite.SQLite3",
        "merges": [
            ""
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-whitelist": "1.0.0",
    "org.apache.cordova.dialogs": "0.3.0",
    "io.litehelpers.cordova.sqlite": "0.7.10"
}
// BOTTOM OF METADATA
});