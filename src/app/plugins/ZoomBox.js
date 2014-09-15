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
 * @require OpenLayers/Control/ZoomBox.js
 * @require GeoExt/widgets/Action.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = ZoomBox
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: Zoom(config)
 *
 *    Provides actions for box zooming, zooming in and zooming out.
 */
gxp.plugins.ZoomBox = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_zoombox */
    ptype: "app_zoombox",

    /** api: config[zoomButtonText]
     *  ``String``
     *  Text for zoom box button item (i18n).
     */
    zoomButtonText: "Zoom Box",

    /** api: config[zoomMenuText]
     *  ``String``
     *  Text for zoom box menu item (i18n).
     */
    zoomMenuText: "Zoom Box",

    /** api: config[zoomInTooltip]
     *  ``String``
     *  Text for zoom box action tooltip (i18n).
     */
    zoomTooltip: "Zoom by dragging a box",
    
    /** api: config[toggleGroup]
     *  ``String`` Toggle group for this plugin's Zoom action.
     */
    
    /** api: config[showZoomBoxAction]
     * {Boolean} If true, the tool will have a Zoom Box button as first action.
     * The zoom box will be provided by an OpenLayers.Control.ZoomBox, and
     * :obj:`controlOptions` configured for this tool will apply to the ZoomBox
     * control.
     * If set to false, only Zoom In and Zoom Out buttons will be created.
     * Default is false.
     */

    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.ZoomBox.superclass.constructor.apply(this, arguments);
    },

    /** api: method[addActions]
     */
    addActions: function() {
        var actions = new GeoExt.Action({
            menuText: this.zoomMenuText,
            buttonText: this.zoomButtonText,
            iconCls: "gxp-icon-zoom",
            tooltip: this.zoomTooltip,
            control: new OpenLayers.Control.ZoomBox(this.controlOptions),
            map: this.target.mapPanel.map,
            enableToggle: true,
            allowDepress: false,
            toggleGroup: this.toggleGroup
            }); 

        return gxp.plugins.ZoomBox.superclass.addActions.apply(this, [actions]);
    }
        
});

Ext.preg(gxp.plugins.ZoomBox.prototype.ptype, gxp.plugins.ZoomBox);
