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
 * @requires plugins/FeatureEditorGrid.js
 * @requires GeoExt/widgets/Popup.js
 * @requires OpenLayers/Control/WMSGetFeatureInfo.js
 * @requires OpenLayers/Format/WMSGetFeatureInfo.js
 * @requires OpenLayers/Control/DragFeature.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = WMSGetFeatureInfoDialog
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: WMSGetFeatureInfoDialog(config)
 *
 *    This plugins provides an action which, when active, will issue a
 *    GetFeatureInfo request to the WMS of all layers on the map. The output
 *    will be displayed in a popup.
 */
gxp.plugins.WMSGetFeatureInfoDialog = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = app_wmsgetfeatureinfo_dialog */
    ptype: "app_wmsgetfeatureinfo_dialog",

    popup: null,

    /** api: config[infoActionTip]
     *  ``String``
     *  Text for feature info action tooltip (i18n).
     */
    infoActionTip: "Get Feature Info",

    /** api: config[popupTitle]
     *  ``String``
     *  Title for info popup (i18n).
     */
    popupTitle: "Feature Info",

    /** api: config[text]
     *  ``String`` Text for the GetFeatureInfo button (i18n).
     */
    buttonText: "Identify",

    /** api: config[format]
     *  ``String`` Either "html" or "grid". If set to "grid", GML will be
     *  requested from the server and displayed in an Ext.PropertyGrid.
     *  Otherwise, the html output from the server will be displayed as-is.
     *  Default is "html".
     */
    format: "html",

    /** api: config[layersVisible]
     *  ``String``
     *  Text for layer properties action tooltip (i18n).
     */
    infoPanelVisible: false,

    /** api: config[outputTarget]
     *  ``Object`` or ``String`` or ``Array`` Where to place the tool's actions
     *  (e.g. buttons or menus)? Use null as the default since our tool has both 
     *  output and action(s).
     */
    outputTarget: "info",

    symboollayer: null,

    queryableLayers: null,

    //xy: new OpenLayers.Pixel(0, 0),

    /** api: config[vendorParams]
     *  ``Object``
     *  Optional object with properties to be serialized as vendor specific
     *  parameters in the requests (e.g. {buffer: 10}).
     */

    /** api: config[layerParams]
     *  ``Array`` List of param names that should be taken from the layer and
     *  added to the GetFeatureInfo request (e.g. ["CQL_FILTER"]).
     */

    /** api: config[itemConfig]
     *  ``Object`` A configuration object overriding options for the items that
     *  get added to the popup for each server response or feature. By default,
     *  each item will be configured with the following options:
     *
     *  .. code-block:: javascript
     *
     *      xtype: "propertygrid", // only for "grid" format
     *      title: feature.fid ? feature.fid : title, // just title for "html" format
     *      source: feature.attributes, // only for "grid" format
     *      html: text, // responseText from server - only for "html" format
     */

    /** api: method[addActions]
     */
    addActions: function () {
        //target = this.target;

        var actions = gxp.plugins.WMSGetFeatureInfoDialog.superclass.addActions.call(this, [{
            tooltip: this.infoActionTip,
            iconCls: "gxp-icon-getfeatureinfo",
            buttonText: this.buttonText,
            toggleGroup: this.toggleGroup,
            enableToggle: true,
            pressed: this.infoPanelVisible,
            toggleHandler: function (button, pressed) {
                this.togglePanel(pressed);
                toggleControls(pressed);
            },
            scope: this
        }]);


        var toggleControls = function(state) {
            for (var i = 0, len = info.controls.length; i < len; i++) {
                if (state) {
                    info.controls[i].activate();
                } else {
                    info.controls[i].deactivate();
                }
            }
        };

        this.target.on("ready", function() {
            this.togglePanel(this.infoPanelVisible);
            toggleControls(this.infoPanelVisible);
            if(this.lon && this.lat) {
                var map = this.target.mapPanel.map;
                setTimeout(
                    map.events.triggerEvent("click", {xy: map.getPixelFromLonLat(this.lon, this.lat)}),2000);
            }
        }, this);

        var infoButton = this.actions[0].items[0];
        var info = {
            controls: []
        };
        var updateInfo = function () {
            queryableLayers = this.target.mapPanel.layers.queryBy(function (x) {
                return x.get("queryable");
            });

            var map = this.target.mapPanel.map;
            if (this.symboollayer) {
                map.setLayerIndex(this.symboollayer, map.layers.length-1);
            }
            
            var control;
            for (var i = 0, len = info.controls.length; i < len; i++) {
                control = info.controls[i];
                control.deactivate(); // TODO: remove when http://trac.openlayers.org/ticket/2130 is closed
                control.destroy();
            }

            info.controls = [];
            queryableLayers.each(function (x) {
                var layer = x.getLayer();
                var vendorParams = Ext.apply({}, this.vendorParams),
                    param;
                if (this.layerParams) {
                    for (var i = this.layerParams.length - 1; i >= 0; --i) {
                        param = this.layerParams[i].toUpperCase();
                        vendorParams[param] = layer.params[param];
                    }
                }
                var infoFormat = x.get("infoFormat");
                if (infoFormat === undefined) {
                    // TODO: check if chosen format exists in infoFormats array
                    // TODO: this will not work for WMS 1.3 (text/xml instead for GML)
                    infoFormat = this.format == "html" ? "text/html" : "application/vnd.ogc.gml";
                }
                var control = new OpenLayers.Control.WMSGetFeatureInfo(Ext.applyIf({
                    url: layer.url,
                    queryVisible: true,
                    layers: [layer],
                    drillDown: true,
                    infoFormat: infoFormat,
                    vendorParams: vendorParams,
                    eventListeners: {
                        getfeatureinfo: function (evt) {
                            var title = x.get("title") || x.get("name");
                            if (infoFormat == "text/html") {
                                var match = evt.text.match(/<body[^>]*>([\s\S]*)<\/body>/);
                                if (match && !match[1].match(/^\s*$/)) {
                                    this.addPopup(evt, title, match[1], null, x.id);
                                }
                            } else if (infoFormat == "text/plain") {
                                this.addPopup(evt, title, '<pre>' + evt.text + '</pre>', null, x.id);
                            } else if (evt.features && evt.features.length > 0) {
                                this.addPopup(evt, title, null, x.get("getFeatureInfo"));
                            }
                        },
                        beforegetfeatureinfo: this.beforeGetFeatureInfo,
                        scope: this
                    }
                }, this.controlOptions));
                map.addControl(control);
                info.controls.push(control);
                if (infoButton.pressed) {
                    control.activate();
                }
            }, this);

        };

        this.target.mapPanel.layers.on("update", updateInfo, this);
        this.target.mapPanel.layers.on("add", updateInfo, this);
        this.target.mapPanel.layers.on("remove", updateInfo, this);

        return actions;
    },

    togglePanel: function(state) {
        try {
            var infoCmp = Ext.getCmp(this.outputTarget);
            if(state) {
                infoCmp.setTitle(this.popupTitle);
                infoCmp.show();
                infoCmp.expand();
                this.initPopup();
                this.addInfoLayer();
            } else {
                if (this.popup) {
                    this.popup.removeAll();
                }
                if (this.symboollayer) {
                    this.symboollayer.setVisibility(false);
                }
                infoCmp.hide();
                infoCmp.collapse();
            } 
        } catch(err) {}
    },

    addInfoLayer: function() {

        if (!this.symboollayer) {
            var vectorLayer = new OpenLayers.Layer.Vector("Info", {
                name: "info",
                geometryType: OpenLayers.Geometry.Point,
                styleMap: new OpenLayers.StyleMap({
                    // Set the external graphic and background graphic images.
                    // Source: https://www.iconfinder.com/icons/73017/ball_base_map_marker_pink_icon#size=64
                    externalGraphic: "data:image/png;base64,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",
                    graphicXOffset: -32,
                    graphicYOffset: -64,
                    pointRadius: 32
                }),
                displayInLayerSwitcher: false
            });

            this.target.mapPanel.layers.map.addLayers([vectorLayer]);
            this.symboollayer = vectorLayer;

        } else {
            this.symboollayer.setVisibility(true);
            this.symboollayer.removeAllFeatures();
        }
    },

    beforeGetFeatureInfo: function (evt) {
        if (!(evt.xy === this.xy)) {
            this.xy = evt.xy;
            this.addInfoLayer();
            this.drawPointer(evt.xy);
            this.initPopup();
        }
    },

    drawPointer: function (xy) {

        var location = this.target.mapPanel.map.getLonLatFromViewPortPx(xy);
        var feature = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(location.lon, location.lat)
        );

        //this.symboollayer.removeAllFeatures();
        this.symboollayer.addFeatures([feature]);
        this.symboollayer.redraw();
    },

    /** private: method[addPopup]
     * :arg evt: the event object from a
     *     :class:`OpenLayers.Control.GetFeatureInfo` control
     * :arg title: a String to use for the title of the results section
     *     reporting the info to the user
     * :arg text: ``String`` Body text.
     */
    addPopup: function (evt, title, text, featureinfo, id) {
        var itemPanel = Ext.getCmp(id);
        itemPanel.body.update(text);
        itemPanel.show();
    },

    initPopup: function() {

        this.itemConfig = {
            autoScroll: true,
            titleCollapse: true,
            collapsible: true
        };

        if (!this.popup) {
            this.popup = this.addOutput({
                xtype: "panel",
                defaults: {
                    bodyStyle: 'padding:5px',
                    border: false
                }
            });
        } else {
            this.popup.removeAll();
        }
        queryableLayers.each(function (x) {

            this.popup.insert(0, Ext.apply({
                id: x.id,
                title: x.get("title") || x.get("name"),
                collapsed: x.collapsed ? x.collapsed : false,
                hidden: true,
                listeners: {
                  collapse: function() {x.collapsed = true},
                  expand:   function() {x.collapsed = false}
               }
            }, this.itemConfig));
        }, this);

        this.popup.doLayout();
        this.popup.show();
    }

});

Ext.preg(gxp.plugins.WMSGetFeatureInfoDialog.prototype.ptype, gxp.plugins.WMSGetFeatureInfoDialog);