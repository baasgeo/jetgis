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
 * Add all your dependencies here.
 *
 * @require overrides/override-ext-ajax.js
 * @require widgets/CrumbPanel.js
 * @require widgets/Viewer.js
 * @require widgets/WMSLayerPanel.js
 * @require plugins/AddLayers.js
 * @require plugins/BingSource.js
 * @require plugins/CSWCatalogueSource.js
 * @require plugins/GoogleSource.js
 * @require plugins/LayerManager.js
 * @require plugins/LayerProperties.js
 * @require plugins/MapBoxSource.js
 * @require plugins/MapQuestSource.js
 * @require plugins/Measure.js
 * @require plugins/Navigation.js
 * @require plugins/NavigationHistory.js
 * @require plugins/OLSource.js
 * @require plugins/OSMSource.js
 * @require plugins/Print.js
 * @require plugins/RemoveLayer.js
 * @require plugins/WMSSource.js
 * @require plugins/WMSCSource.js
 * @require plugins/WMSGetFeatureInfo.js
 * @require plugins/Zoom.js
 * @require plugins/ZoomToExtent.js
 * @require plugins/ZoomToLayerExtent.js
 * @require RowExpander.js
 *
 * Custom tools
 * @require GeoAtlas.js
 * @require plugins/GoogleGeocoder.js
 * @require plugins/LoginControl.js
 * @require plugins/OpenLayers.Control.Legend.js
 * @require plugins/PrintSimple.js
 * @require plugins/StreetView.js
 * @require plugins/WMSGetFeatureInfoDialog.js
 * @require plugins/ZoomBox.js
 * @require plugins/ZoomControl.js
 * @require overrides.js
 */

/**
 * api: (define)
 * module = GeoAtlas
 * extends = gxp.Viewer
 */

/** api: constructor
 *  .. class:: GeoAtlas(config)
 *     Create a new GeoAtlas application.
 *
 *     Parameters:
 *     config - {Object} Optional application configuration properties.
 *
 *     Valid config properties:
 *     map - {Object} Map configuration object.
 *     sources - {Object} An object with properties whose values are WMS endpoint URLs
 *
 *     Valid map config properties:
 *         projection - {String} EPSG:xxxx
 *         units - {String} map units according to the projection
 *         maxResolution - {Number}
 *         layers - {Array} A list of layer configuration objects.
 *         center - {Array} A two item array with center coordinates.
 *         zoom - {Number} An initial zoom level.
 *
 *     Valid layer config properties (WMS):
 *     name - {String} Required WMS layer name.
 *     title - {String} Optional title to display for layer.
 */
var GeoAtlas = Ext.extend(gxp.Viewer, {

    // Begin i18n.
    appInfoText: "GeoAtlas",
    aboutText: "About GeoAtlas",
    mapInfoText: "Map Info",
    titleText: "About",
    descriptionText: "Description",
    contactText: "Contact",
    aboutThisMapText: "About this Map",
    loadConfigErrorText: "Trouble reading saved configuration: <br />",
    loadConfigErrorDefaultText: "Server Error.",
    xhrTroubleText: "Communication Trouble: Status ",
    // End i18n.

    /**
     * private: property[mapPanel]
     * the :class:`GeoExt.MapPanel` instance for the main viewport
     */
    mapPanel: null,

    toggleGroup: "toolGroup",

    constructor: function (config) {

        if (config.portalConfig == null) {
            config.portalConfig = new this.setPortalConfig();
        }
        if (config.tools == null) {
            config.tools = new this.setTools();
        }

        GeoAtlas.superclass.constructor.apply(this, arguments);

        this.on(
            "portalready", function () {
                window.document.title = this.about.title || 'GeoAtlas';
            }, this);
    },

    setPortalConfig: function () {
        var MapView = new Ext.ButtonGroup({
            id: 'groupMap',
            defaults: {
                iconAlign: 'top',
                rowspan: '2',
                scale: 'medium'
            },
            layout: 'table',
            hidden: true,
            items: []
        });
        var Information = new Ext.ButtonGroup({
            id: 'groupInformation',
            defaults: MapView.defaults,
            layout: MapView.layout,
            hidden: MapView.hidden,
            items: []
        });
        var Navigate = new Ext.ButtonGroup({
            id: 'groupNavigate',
            defaults: MapView.defaults,
            layout: MapView.layout,
            hidden: MapView.hidden,
            items: []
        });

        return {
            layout: "border",
            region: "center",
            // by configuring items here, we don't need to configure portalItems
            // and save a wrapping container
            items: [
                {
                    id: "northpanel",
                    layout: "fit",
                    region: "north",
                    //height: 90,
                    html: "<div id='title'>Joplin GIS Data Viewer</div>" +
                        "<div id='headnav'>" +
                        "<a href='#' onclick='app.displayAppInfo(); return false;'>Info</a>" +
                        "<a href='mailto:info@baasgeo.com?subject=GeoAtlas'>Contact</a>" +
                        "<a href='#' id='login-link' onclick='app.logout(); return false;'>Logout</a>" +
                        "</div>",
                    bbar: [
                        {xtype: 'container',
                            html: "<a href='javascript:history.go(0)'>" +
                            "<div id='logo'></div>" +
                            "</a>"},
                        MapView,
                        Information,
                        Navigate,
                        "->"
                    ]
                },
                {
                    id: "centerpanel",
                    xtype: "panel",
                    layout: "fit",
                    region: "center",
                    border: false,
                    items: ["mymap"]
                },
                {
                    id: "westpanel",
                    xtype: "gxp_crumbpanel",
                    region: "west",
                    collapsible: true,
                    collapseMode: "mini",
                    hideCollapseTool: true,
                    split: true,
                    width: 320
                },
                {
                    id: "eastpanel",
                    xtype: "panel",
                    region: "east",
                    collapsible: true,
                    collapseMode: "mini",
                    hideCollapseTool: true,
                    split: true,
                    hidden: true,
                    header: true,
                    autoScroll: true,
                    width: 320
                }
            ],
            bbar: {id: "mybbar"}
        };

    },

    setTools: function () {
        return [
            {
                ptype: "gxp_layermanager",
                outputConfig: {
                    id: "tree",
                    title: "Layers",
                    border: true,
                    autoScroll: true,
                    tbar: [] // we will add buttons to "tree.bbar" later
                },
                outputTarget: "westpanel"
            },
            {
                ptype: "gxp_addlayers",
                outputTarget: "westpanel",
                actionTarget: "tree.tbar"
            },
            {
                ptype: "gxp_removelayer",
                actionTarget: ["tree.tbar", "tree.contextMenu"]
            },
            {
                ptype: "gxp_zoomtolayerextent",
                actionTarget: ["tree.contextMenu"]
            },
            {
                ptype: "gxp_layerproperties",
                id: "layerproperties",
                outputTarget: "westpanel",
                actionTarget: ["tree.tbar", "tree.contextMenu"]
            },
            {
                ptype: "app_printsimple",
                showButtonText: true,
                printPage: "print.html",
                actionTarget: {target: "groupMap"}
            },
            {
                ptype: "gxp_navigation",
                toggleGroup: "navigation",
                showButtonText: true,
                actionTarget: {target: "groupNavigate"}
            },
            {
                ptype: "app_zoombox",
                toggleGroup: "navigation",
                controlOptions: {zoomOnClick: false},
                showButtonText: true,
                actionTarget: {target: "groupNavigate"}
            },
            {
                ptype: "gxp_zoomtoextent",
                showButtonText: true,
                actionTarget: {target: "groupNavigate"}
            },
            {
                ptype: "app_wmsgetfeatureinfo_dialog",
                layerParams: ["CQL_FILTER"],
                vendorParams: {buffer: 15},
                toggleGroup: "info",
                showButtonText: true,
                outputTarget: "eastpanel",
                actionTarget: {target: "groupInformation"}
            },
            {
                ptype: "gxp_measure",
                controlOptions: {immediate: true},
                toggleGroup: "info",
                showButtonText: true,
                actionTarget: {target: "groupInformation"}
            },
            {
                ptype: "app_streetview",
                toggleGroup: "info",
                showButtonText: true,
                actionTarget: {target: "groupInformation"}
            },
            {
                actionTarget: "map",
                ptype: "app_logincontrol",
                timeout: 15
            },
            {
                ptype: "app_googlegeocoder",
                outputTarget: "northpanel.bbar"
            }
        ];
    },

    loadConfig: function (config) {

        if (config.mapUrl) {
            Ext.Ajax.request({
                url: config.mapUrl,
                success: function (request) {
                    var remoteConfig = Ext.util.JSON.decode(request.responseText);
                    // Use some settings, not all
                    Ext.apply(config.about, remoteConfig.about);
                    Ext.apply(config.sources, remoteConfig.sources);
                    Ext.apply(config.map, remoteConfig.map);
                    this.applyConfig(config);
                },
                failure: function (request) {
                    var obj;
                    try {
                        obj = Ext.util.JSON.decode(request.responseText);
                    } catch (err) {
                        // pass
                    }
                    var msg = this.loadConfigErrorText;
                    if (obj && obj.error) {
                        msg += obj.error;
                    } else {
                        msg += this.loadConfigErrorDefaultText;
                    }
                    this.on({
                        ready: function () {
                            this.displayXHRTrouble(msg, request.status);
                        },
                        scope: this
                    });
                    delete this.id;
                    //window.location.hash = "";
                    this.applyConfig(config);
                },
                scope: this
            });
        } else {
            this.applyConfig(config);
        }
    },

    displayXHRTrouble: function (msg, status) {

        Ext.Msg.show({
            closable: false,
            title: this.xhrTroubleText + status,
            msg: msg,
            icon: Ext.MessageBox.WARNING,
            buttons: Ext.Msg.OK
        });
    },

    displayMsg: function (msg, status) {

        Ext.Msg.show({
            closable: false,
            title: status,
            msg: msg,
            icon: Ext.MessageBox.INFO,
            buttons: Ext.Msg.OK
        });
    },

    getToolbar: function () {
        // The main toolbar containing tools to be activated / deactivated on login/logout
        // TODO: determine if this is still relevant
        return app.centerpanel.toolbars[0];
    },

    /** api: method[getBookmark]
     *  :return: ``String``
     *
     *  Generate a bookmark for an unsaved map.
     */
    getBookmark: function () {
        var params = Ext.apply(
            OpenLayers.Util.getParameters(), {
                q: Ext.util.JSON.encode(this.getState())
            }
        );

        // disregard any hash in the url, but maintain all other components
        var url =
            document.location.href.split("?").shift() +
            "?" + Ext.urlEncode(params);

        return url;
    },

    /** private: method[displayAppInfo]
     * Display an informational dialog about the application.
     */
    displayAppInfo: function () {
        var appInfo = new Ext.Panel({
            title: this.appInfoText,
            html: "<iframe style='border: none; height: 100%; width: 100%' src='about.html' frameborder='0'><a target='_blank' href='about.html'>" + this.aboutText + "</a></iframe>"
        });

        var about = Ext.applyIf(this.about, {
            title: '',
            "abstract": '',
            contact: ''
        });

        var mapInfo = new Ext.Panel({
            title: this.mapInfoText,
            html: '<div style="padding:10px;">' +
                '<h2>' + this.titleText + '</h2><p>' + about.title +
                '</p><h2>' + this.descriptionText + '</h2><p>' + about['abstract'] +
                '</p> <h2>' + this.contactText + '</h2><p>' + about.contact + '</p></div>',
            height: 'auto',
            width: 'auto'
        });

        var tabs = new Ext.TabPanel({
            activeTab: 0,
            items: [mapInfo, appInfo]
        });

        var win = new Ext.Window({
            title: this.aboutText,
            modal: true,
            layout: "fit",
            width: 500,
            height: 600,
            items: [tabs]
        });
        win.show();
    },

    logout: function () {
        window.document.cookie = "joplinagreed=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        //http://demo.geoatlas.nl/geoserver/j_spring_security_logout
        Ext.Ajax.request({
            url: "/geoserver/j_spring_security_logout?",
            method: "POST",
            success: function () {
                window.location.replace("login.html");
            }
        });
    },

    /** private: method[getState]
     *  :returns: ``Òbject`` the state of the viewer
     */
    getState: function () {
        var state = GeoAtlas.superclass.getState.apply(this, arguments);
        // Don't persist tools
        delete state.tools;
        // remove because of serialization issues with controls
        delete state.map.controls;
        return state;
    }
});