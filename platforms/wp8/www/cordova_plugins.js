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
        "file": "plugins/io.litehelpers.cordova.sqlite/www/SQLitePlugin.js",
        "id": "io.litehelpers.cordova.sqlite.SQLitePlugin",
        "clobbers": [
            "SQLitePlugin"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.device/www/device.js",
        "id": "org.apache.cordova.device.device",
        "clobbers": [
            "device"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.splashscreen/www/splashscreen.js",
        "id": "org.apache.cordova.splashscreen.SplashScreen",
        "clobbers": [
            "navigator.splashscreen"
        ]
    },
    {
        "file": "plugins/com.suarez.cordova.mapsforge/www/mapsforge.js",
        "id": "com.suarez.cordova.mapsforge.mapsforge_plugin",
        "clobbers": [
            "mapsforge.plugin"
        ]
    },
    {
        "file": "plugins/com.suarez.cordova.mapsforge/www/mapsforgeNative.js",
        "id": "com.suarez.cordova.mapsforge.mapsforge_native",
        "clobbers": [
            "mapsforge.embedded"
        ]
    },
    {
        "file": "plugins/com.suarez.cordova.mapsforge/www/mapsforgeOfflineCache.js",
        "id": "com.suarez.cordova.mapsforge.mapsforge_cache",
        "clobbers": [
            "mapsforge.cache"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-whitelist": "1.0.0",
    "org.apache.cordova.dialogs": "0.3.0",
    "io.litehelpers.cordova.sqlite": "0.7.10",
    "org.apache.cordova.device": "0.3.0",
    "org.apache.cordova.splashscreen": "1.0.0",
    "com.suarez.cordova.mapsforge": "0.1.1"
}
// BOTTOM OF METADATA
});