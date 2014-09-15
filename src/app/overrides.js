/**
 * Copyright (c) 2013 Baas geo-information
 *
 * Published under the GPL license.
 * See https://raw.github.com/bartbaas/geoatlas/master/license.txt for the full text
 * of the license.
 *
 * Author: Bart Baas <info@baasgeo.com>
 */

 /*Added to handle pink tiles */
OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
OpenLayers.Util.onImageLoadErrorColor = 'transparent'; 
OpenLayers.ImgPath = "externals/openlayers/img/";

Ext.BLANK_IMAGE_URL = "theme/app/img/blank.gif";
Ext.USE_NATIVE_JSON = true;
Ext.QuickTips.init();
Ext.form.Field.prototype.msgTarget = 'side';

// Fixes problem with OpenLayers.Projection.defaults and RD EPSG
OpenLayers.Projection.defaults = {
    "EPSG:28992": {
        units: "m",
        maxExtent: [-285401.92, 22598.08, 595401.9199999999, 903401.9199999999],
        yx: false
    },
    "EPSG:4326": {
        units: "degrees",
        maxExtent: [-180, -90, 180, 90],
        yx: true
    },
    "CRS:84": {
        units: "degrees",
        maxExtent: [-180, -90, 180, 90]
    },
    "EPSG:3857": {
        units: "m",
        maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34]
    },
    "EPSG:102113": {
        units: "m",
        maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34]
    },
    "EPSG:900913": {
        units: "m",
        maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34]
    }
};

// http://www.sencha.com/forum/showthread.php?141254-Ext.Slider-not-working-properly-in-IE9
// TODO re-evaluate once we move to Ext 4
Ext.override(Ext.dd.DragTracker, {
    onMouseMove: function (e, target) {
        if (this.active && Ext.isIE && !Ext.isIE9 && !e.browserEvent.button) {
            e.preventDefault();
            this.onMouseUp(e);
            return;
        }
        e.preventDefault();
        var xy = e.getXY(),
            s = this.startXY;
        this.lastXY = xy;
        if (!this.active) {
            if (Math.abs(s[0] - xy[0]) > this.tolerance || Math.abs(s[1] - xy[1]) > this.tolerance) {
                this.triggerStart(e);
            } else {
                return;
            }
        }
        this.fireEvent('mousemove', this, e);
        this.onDrag(e);
        this.fireEvent('drag', this, e);
    }
});

Ext.util.base64 = {

    base64s : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",

    encode: function(decStr){
        if (typeof btoa === 'function') {
            return btoa(decStr);
        }
        var base64s = this.base64s;
        var bits;
        var dual;
        var i = 0;
        var encOut = "";
        while(decStr.length >= i + 3){
            bits = (decStr.charCodeAt(i++) & 0xff) <<16 | (decStr.charCodeAt(i++) & 0xff) <<8 | decStr.charCodeAt(i++) & 0xff;
            encOut += base64s.charAt((bits & 0x00fc0000) >>18) + base64s.charAt((bits & 0x0003f000) >>12) + base64s.charAt((bits & 0x00000fc0) >> 6) + base64s.charAt((bits & 0x0000003f));
        }
        if(decStr.length -i > 0 && decStr.length -i < 3){
            dual = Boolean(decStr.length -i -1);
            bits = ((decStr.charCodeAt(i++) & 0xff) <<16) |    (dual ? (decStr.charCodeAt(i) & 0xff) <<8 : 0);
            encOut += base64s.charAt((bits & 0x00fc0000) >>18) + base64s.charAt((bits & 0x0003f000) >>12) + (dual ? base64s.charAt((bits & 0x00000fc0) >>6) : '=') + '=';
        }
        return(encOut);
    },

    decode: function(encStr){
        if (typeof atob === 'function') {
            return atob(encStr);
        }
        var base64s = this.base64s;
        var bits;
        var decOut = "";
        var i = 0;
        for(; i<encStr.length; i += 4){
            bits = (base64s.indexOf(encStr.charAt(i)) & 0xff) <<18 | (base64s.indexOf(encStr.charAt(i +1)) & 0xff) <<12 | (base64s.indexOf(encStr.charAt(i +2)) & 0xff) << 6 | base64s.indexOf(encStr.charAt(i +3)) & 0xff;
            decOut += String.fromCharCode((bits & 0xff0000) >>16, (bits & 0xff00) >>8, bits & 0xff);
        }
        if(encStr.charCodeAt(i -2) == 61){
            return(decOut.substring(0, decOut.length -2));
        }
        else if(encStr.charCodeAt(i -1) == 61){
            return(decOut.substring(0, decOut.length -1));
        }
        else {
            return(decOut);
        }
    }

};

Ext.namespace("gxp");

(function () {

    var originalAddLayersaddActions = gxp.plugins.AddLayers.prototype.addActions;
    Ext.override(gxp.plugins.AddLayers, {
        addButtonText: "Add layers",
        addActions: function () {
            //call the original function
            var button = originalAddLayersaddActions.apply(this, arguments);
            if (this.showButtonText == true) {
                button[0].setText(this.addButtonText);
            }
            return button;
        }
    });

    var originalZoomToLayerExtentaddActions = gxp.plugins.ZoomToLayerExtent.prototype.addActions;
    Ext.override(gxp.plugins.ZoomToLayerExtent, {
        menuText: "Zoom to layer extent",
        addActions: function () {
            //call the original function
            var button = originalZoomToLayerExtentaddActions.apply(this, arguments);
            button[0].setText(this.menuText);
            return button;
        }
    });

    var originalZoomToExtentaddActions = gxp.plugins.ZoomToExtent.prototype.addActions;
    Ext.override(gxp.plugins.ZoomToExtent, {
        buttonText: "Zoom extend",
        addActions: function () {
            //call the original function
            var button = originalZoomToExtentaddActions.apply(this, arguments);
            if (this.showButtonText == true) {
                button[0].setText(this.buttonText);
            } else {
                button[0].setText(null);
            }
            return button;
        }
    });

    Ext.override(gxp.plugins.Measure, {
        showButtonText: false,
        buttonText: "Measure",
        addActions: function () {
            this.activeIndex = 0;
            this.button = new Ext.SplitButton({
                iconCls: "gxp-icon-measure",
                tooltip: this.measureTooltip,
                text: this.showButtonText ? this.buttonText : null,
                enableToggle: true,
                toggleGroup: this.toggleGroup,
                allowDepress: true,
                handler: function (button, event) {
                    if (button.pressed) {
                        button.menu.items.itemAt(this.activeIndex).setChecked(true);
                    }
                },
                scope: this,
                listeners: {
                    toggle: function (button, pressed) {
                        // toggleGroup should handle this
                        if (!pressed) {
                            button.menu.items.each(function (i) {
                                i.setChecked(false);
                            });
                        }
                    },
                    render: function (button) {
                        // toggleGroup should handle this
                        Ext.ButtonToggleMgr.register(button);
                    }
                },
                menu: new Ext.menu.Menu({
                    items: [
                        new Ext.menu.CheckItem(
                            new GeoExt.Action({
                                text: this.lengthMenuText,
                                iconCls: "gxp-icon-measure-length",
                                toggleGroup: this.toggleGroup,
                                group: this.toggleGroup,
                                listeners: {
                                    checkchange: function (item, checked) {
                                        this.activeIndex = 0;
                                        this.button.toggle(checked);
                                        if (checked) {
                                            this.button.setIconClass(item.iconCls);
                                        }
                                    },
                                    scope: this
                                },
                                map: this.target.mapPanel.map,
                                control: this.createMeasureControl(
                                    OpenLayers.Handler.Path, this.lengthTooltip
                                )
                            })
                        ),
                        new Ext.menu.CheckItem(
                            new GeoExt.Action({
                                text: this.areaMenuText,
                                iconCls: "gxp-icon-measure-area",
                                toggleGroup: this.toggleGroup,
                                group: this.toggleGroup,
                                allowDepress: false,
                                listeners: {
                                    checkchange: function (item, checked) {
                                        this.activeIndex = 1;
                                        this.button.toggle(checked);
                                        if (checked) {
                                            this.button.setIconClass(item.iconCls);
                                        }
                                    },
                                    scope: this
                                },
                                map: this.target.mapPanel.map,
                                control: this.createMeasureControl(
                                    OpenLayers.Handler.Polygon, this.areaTooltip
                                )
                            })
                        )
                    ]
                })
            });

            return gxp.plugins.Measure.superclass.addActions.apply(this, [this.button]);
        }
    });


    var originalNavigationaddActions = gxp.plugins.Navigation.prototype.addActions;
    Ext.override(gxp.plugins.Navigation, {
        buttonText: "Pan",
        addActions: function () {
            //call the original function
            var button = originalNavigationaddActions.apply(this, arguments);
            if (this.showButtonText == true) {
                button[0].setText(this.buttonText);
            }
            return button;
        }
    });

    var originalNavigationHistoryaddActions = gxp.plugins.NavigationHistory.prototype.addActions;
    Ext.override(gxp.plugins.NavigationHistory, {
        previousButtonText: "Zoom Previous",
        nextButtonText: "Zoom Next",
        addActions: function () {
            //call the original function
            var button = originalNavigationHistoryaddActions.apply(this, arguments);
            if (this.showButtonText == true) {
                button[0].setText(this.previousButtonText);
                button[1].setText(this.nextButtonText);
            }
            return button;
        }
    });

    var originalWMSSourcecreateLayerRecord = gxp.plugins.WMSSource.prototype.createLayerRecord;
    Ext.override(gxp.plugins.WMSSource, {
        createLayerRecord: function (config) {
        	var record = originalWMSSourcecreateLayerRecord.apply(this, arguments);
        	try {
				record.data.layer.transitionEffect = null;
        	}
        	finally {
        		return record;
        	}
        }
    });

})();