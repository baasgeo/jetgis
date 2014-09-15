/**
 * Copyright (c) 2014 Baas geo-information
 * 
 * Published under the GPL license.
 * See https://raw.github.com/bartbaas/geoatlas/master/license.txt for the full text
 * of the license.
 *
 * Author: Bart Baas <info@baasgeo.com>
 */

/* 
 * @require OpenLayers/Control/Zoom.js
 * @require OpenLayers/Control/TouchNavigation.js
 * @require OpenLayers/Kinetic.js
 */

/** api: (define)
 *  module = gxp
 *  class = ZoomControl
 *  base_link = `Ext.Panel <http://dev.sencha.com/deploy/dev/docs/?class=Ext.Panel>`_
 */
Ext.namespace("gxp");

/** api: constructor
 *  .. class:: ZoomControl(config)
 *
 *      Create a panel for showing a ScaleLine control and a combobox for
 *      selecting the map scale.
 */
gxp.ZoomControl = Ext.extend(Ext.Panel, {

    /** api: config[map]
     *  ``OpenLayers.Map`` or :class:`GeoExt.MapPanel`
     *  The map for which to show the scale info.
     */
    map: null,

    zoomWheelEnabled: true,

    /** private: method[initComponent]
     *  Initialize the component.
     */
    initComponent: function () {

        gxp.ZoomControl.superclass.initComponent.call(this);
        if (this.map) {
            if (this.map instanceof GeoExt.MapPanel) {
                this.map = this.map.map;
            }
            this.bind(this.map);
        }
        this.on("beforedestroy", this.unbind, this);
    },

    /** private: method[addToMapPanel]
     * :param panel: :class:`GeoExt.MapPanel`
     *
     * Called by a MapPanel if this component is one of the items in the panel.
     */
    addToMapPanel: function (panel) {
        this.on({
            afterrender: function () {
                this.bind(panel.map);
            },
            scope: this
        });
    },

    /** private: method[bind]
     *  :param map: ``OpenLayers.Map``
     */
    bind: function (map) {
        this.map = map;
        map.addControl(new OpenLayers.Control.Zoom());
        map.zoomDuration = 10; //To match Google’s zoom animation better with OpenLayers animated zooming
        /*map.addControl(new OpenLayers.Control.TouchNavigation({
                dragPanOptions: {
                enableKinetic: true
            }
        }));*/

        var nav = map.getControlsByClass("OpenLayers.Control.Navigation")[0];
        if (this.zoomWheelEnabled) {
            nav.handlers.wheel.cumulative = false;
            nav.handlers.wheel.interval = 40;
        } else {
            nav.disableZoomWheel();
        }
    },

    /** private: method[unbind]
     */
    unbind: function () {
        if (this.map) {
            //this.control.destroy();
        }
    }

});

/** api: xtype = app_zoomcontrol */
Ext.reg('app_zoomcontrol', gxp.ZoomControl);