/**
 * Copyright (c) 2014 Baas geo-information
 *
 * Published under the GPL license.
 * See https://raw.github.com/bartbaas/geoatlas/master/license.txt for the full text
 * of the license.
 *
 * Author: Bart Baas <info@baasgeo.com>
 */

OpenLayers.Control.Legend =
  OpenLayers.Class(OpenLayers.Control, {

    /**
     * in der Eigenschaft div wird eine
     * Referenz auf das <div> gespeichert.
     */
    div: null,

    legend_options: null,

    draw: function() {
      // wird initial aufgerufen und
      // delegiert die eigentliche Arbeit an redraw
      this.redraw();
    },

    clearLegendDiv: function(){
      // Legendenelemente entfernen:
      if ( this.div.hasChildNodes() ) {
        while ( this.div.childNodes.length >= 1 ) {
          this.div.removeChild( this.div.firstChild );
        }
      }
    },

    redraw: function() {
      // Nur wenn die Control aktiv ist, soll neugezeichnet werden
      if (this.active === true) {
        // bestehende Legendenbilder entfernen
        this.clearLegendDiv();
        // Alle neu erzeugen
        //for (layer_idx in map.layers) {
        for(var layer_idx=map.layers.length-1; layer_idx>=0; --layer_idx) {
          var layer = map.layers[layer_idx];
          if ( layer instanceof OpenLayers.Layer.WMS && layer.visibility ) {
            // Ein WMS-Layer in OpenLayers kann aus
            // mehreren kommagetrennten WMS-Layern bestehen
            var url_layers_string = layer.params.LAYERS;
            var url_layers = url_layers_string.split(',');
            var url_styles_string = layer.params.STYLES;
            var url_styles = url_styles_string.split(',');
            for(var part_idx=url_layers.length-1; part_idx>=0; --part_idx) {
              var singlelayer = url_layers[part_idx];
              var style = url_styles[part_idx];
              // hole legende
              var url = layer.url;
              url += ( url.indexOf('?') === -1 ) ? '?' : '';
              url += '&SERVICE=WMS';
              url += '&VERSION=1.1.1';
              url += '&REQUEST=GetLegendGraphic';
              url += '&FORMAT=image/png';
              url += '&legend_options=' + this.legend_options;
              url += '&STYLE=' + style;
              url += '&SCALE=' + map.getScale();
              url += '&LAYER=' + singlelayer;
              var img = document.createElement("img");
              img.src = url;
              var divTitle = document.createElement("div");
              divTitle.innerHTML = layer.name;
              this.div.appendChild(divTitle);
              this.div.appendChild(img);
            }
          }
        }
      }
    },

    setMap: function(map) {
      // Zun?chst die Elternmethode aufrufen
      OpenLayers.Control.prototype.setMap.apply(this, arguments);
      // Events registrieren
      this.map.events.on({
        "zoomend": this.redraw,
        scope: this
      });
      // Control initial aktiveren
      this.active = true;
    },

    deactivate: function() {
      // Zun?chst die Elternmethode aufrufen
      OpenLayers.Control.prototype.deactivate.apply(this, arguments);
      // bestehende Legendenbilder entfernen
      this.clearLegendDiv();
    },

    activate: function( doRedraw ) {
      // Zun?chst die Elternmethode aufrufen
      OpenLayers.Control.prototype.activate.apply(this, arguments);
      // Neuzeichnen des divs
      this.redraw();
    },

    CLASS_NAME: "OpenLayers.Control.Legend"
  }
);