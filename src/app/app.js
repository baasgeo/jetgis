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
 * @require plugins/PrintSimple.js
 * @require plugins/StreetView.js
 * @require plugins/ZoomBox.js
 * @require plugins/ZoomControl.js
 * @require overrides.js
 */

var app;

//Ext.onReady(function() {
//    requestConfig({
//        onLoad: function(clientConfig, propertyDataInit) {
//            onConfigurationLoaded(clientConfig, propertyDataInit);
//        }
//    })
//});

Ext.onReady(function() {

    var getPortalConfig = function () {

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

        return pconfig = {
            layout: "border",
            region: "center",

            // by configuring items here, we don't need to configure portalItems
            // and save a wrapping container
            items: [
                {
                    id: "northpanel",
                    //xtype: "container",
                    //style: "background-color: #FFFFFF;",
                    layout: "fit",
                    region: "north",
                    html: "<div id='top'>" +
                        "<a href='javascript:history.go(0)'>" +
                        "<div id='logo'></div>" +
                        "</a>" +
                        "<div id='headnav'>" +
                        "<a href='#' onclick='app.displayAppInfo(); return false;'>Info</a>" +
                        "<a href='mailto:geo-informatie@zaanstad.nl?subject=ZaanAtlas'>Contact</a>" +
                        "<a href='#' id='login-link' onclick='app.authenticate(); return false;'>Login</a>" +
                        "</div>" +
                        "</div>",
                    height: 70 + 60,
                    bbar: [
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
                    width: 300
                },
                {
                    id: "eastpanel",
                    xtype: "container",
                    layout: "fit",
                    region: "east",
                    split: true,
                    collapsible: true,
                    hidden: true,
                    width: 200
                }
            ],
            bbar: {id: "mybbar"}
        };

    };

    var getTools = function () {
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
                outputTarget: "westpanel",
                actionTarget: ["tree.tbar", "tree.contextMenu"]
            },
            {
                ptype: "app_printsimple",
                showButtonText: true,
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
                ptype: "gxp_wmsgetfeatureinfo",
                layerParams: ["CQL_FILTER"],
                vendorParams: {buffer: 10},
                showButtonText: true,
                actionTarget: {target: "groupInformation"}
            },
            {
                ptype: "gxp_measure", toggleGroup: this.toggleGroup,
                controlOptions: {immediate: true},
                showButtonText: true,
                actionTarget: {target: "groupInformation"}
            },
            {
                ptype: "app_streetview",
                showButtonText: true,
                actionTarget: {target: "groupInformation"}
            },
            {
                ptype: "app_googlegeocoder",
                showButtonText: true,
                outputTarget: "northpanel.bbar"
            }
        ];
    };

app = new GeoAtlas({
    //mapUrl: 'http://gis.tristate-engineering.com:8080/geoexplorer/maps/1',
    mapUrl: 'testconfiglite.json',
    about: {
        title: "Tristate beta viewer",
        abstract: "This is a demonstration of GeoAtlas, an application for assembling and publishing web based maps.",
        contact: "info@baasgeo.com"
    },
    proxy: "proxy/?url=",
    portalConfig: new getPortalConfig(),
    // layer sources
    sources: {
        local: {
            ptype: "gxp_wmscsource",
            url: "/geoserver/wms",
            projection: "EPSG:102113",
            version: "1.1.1"
        },
        osm: {
            ptype: "gxp_osmsource"
        },
        bing: {
            ptype: "gxp_bingsource"
        },
        google: {
            ptype: "gxp_googlesource"
        }
    },
    tools: new getTools(),
    // map and layers
    map: {
        id: "mymap", // id needed to reference map in portalConfig above
        projection: "EPSG:900913",
        center: [-10764594.758211, 4523072.3184791],
        zoom: 13,
        controls: [
            //new OpenLayers.Control.ZoomToMaxExtent(),
            //new OpenLayers.Control.Zoom(),
            new OpenLayers.Control.Attribution(),
            new OpenLayers.Control.Navigation(),
            new OpenLayers.Control.TouchNavigation({dragPanOptions: {enableKinetic: true}})
            ],
        layers: [{
            source: "google",
            name: "HYBRID",
            title: "Google Hybrid",
            visibility: true,
            opacity: 1,
            group: "background",
            fixed: true,
            selected: false,
            format: "image/png",
            tiled: true
        }],
        items: [{
            xtype: "app_zoomcontrol",
            zoomWheelEnabled: true
        }]
    }
});

});