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

/** api: (define)
 *  module = gxp.plugins
 *  class = Legend
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: Legend(config)
 *
 *    Provides an action to display a legend in a new window.
 */
gxp.plugins.PrintSimple = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_legend */
    ptype: "app_printsimple",

    /** api: config[menuText]
     *  ``String``
     *  Text for legend menu item (i18n).
     */
    buttonText: "Print",
    
    /** api: config[menuText]
     *  ``String``
     *  Text for legend menu item (i18n).
     */
    menuText: "Print",

    /** api: config[tooltip]
     *  ``String``
     *  Text for legend action tooltip (i18n).
     */
    tooltip: "Printer friendly",

    /** api: config[sessionStorage]
     *  ``String`` 
     *  Name of the the sessionstorage
     */
    sessionStorage: "printconfigGeoAtlas",
    
    /** api: config[printPage]
     *  ``String`` 
     *  Location of the print page
     */
    printPage: "../print.html",

    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.PrintSimple.superclass.constructor.apply(this, arguments);
    },

    /** api: method[addActions]
     */
    addActions: function() {

        var actions = gxp.plugins.PrintSimple.superclass.addActions.apply(this, [{
            menuText: this.menuText,
            buttonText: this.buttonText,
            iconCls: "gxp-icon-print",
            tooltip: this.tooltip,
            handler: function(button, state) {
                this.printMap();
             },
            scope: this
        }]);

        return actions;
    },

    /** private: method[getState]
     *  :returns: ``Object`` the state of the viewer
     */
    getcurrentState: function() {
        var state = this.target.getState();
        // Don't persist tools
        delete state.tools;
        delete state.viewerTools;
        delete state.composerTools;
        delete state.printService;
        delete state.modified;
        delete state.created;

        // remove because of serialization issues with controls
        delete state.portalConfig;
        delete state.map.controls;
        return Ext.util.JSON.encode(state);
    },

    /** api: method[toggleLegendOverlay]
     *  :returns: ``GeoExt.LegendPanel``
     *
     *  Get the legend panel associated with this legend plugin.
     */
    printMap: function() {
        var state = this.getcurrentState();
        window.sessionStorage.setItem(this.sessionStorage, state);

        window.open(this.printPage);
    }
});

Ext.preg(gxp.plugins.PrintSimple.prototype.ptype, gxp.plugins.PrintSimple);
