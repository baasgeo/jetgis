/**
 * Copyright (c) 2014 Baas geo-information
 *
 * Published under the GPL license.
 * See https://raw.github.com/bartbaas/geoatlas/master/license.txt for the full text
 * of the license.
 *
 * Author: Bart Baas <info@baasgeo.com>
 */

/**
 * @requires plugins/Tool.js
 */

Ext.namespace("gxp");

gxp.plugins.LoginControl = Ext.extend(gxp.plugins.Tool, {

    ptype: "app_logincontrol",
    timeoutID: null,
    timeout: 15, // 15 minutes

    addActions: function () {
        var map = this.target.mapPanel.map;
        this.bind(map);
        this.target.on("ready", this.setupTimer, this);
        this.on("beforedestroy", this.unbind, this);
    },

    // define custom map event listeners
    setupTimer: function () {
        this.cancel();
        var self = this;
        this.timeoutID = window.setTimeout(function() {
            self.logout();
        }, this.timeout * 1000 * 60); // 1000 milisec = 1 sec
    },

    logout: function () {
        this.cancel();
        this.target.logout();
    },

    cancel: function () {
        if (typeof this.timeoutID == "number") {
            window.clearTimeout(this.timeoutID);
            delete this.timeoutID;
        }
    },

    /** private: method[bind]
     *  :param map: ``OpenLayers.Map``
     */
    bind: function (map) {
        this.map = map;
        map.events.register('moveend', this, this.setupTimer);
    },

    /** private: method[unbind]
     */
    unbind: function () {
        if (this.map && this.map.events) {
            this.map.events.unregister('moveend', this, this.setupTimer);
        }
    }

});

Ext.preg(gxp.plugins.LoginControl.prototype.ptype, gxp.plugins.LoginControl);