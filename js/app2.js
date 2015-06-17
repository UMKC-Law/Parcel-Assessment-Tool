var map;
var currentParcelData;


function openPanel(event){
  $('.cd-panel').addClass('is-visible');
  console.log("Hello");
}

//window.onload = main;

//panel related code
jQuery(document).ready(function($){

  var options = {
    center: [39.08, -94.55],
    zoom: 14, 
    zoomControl: false,  // dont add the zoom overlay (it is added by default)
    loaderControl: false, //dont show tiles loader
    query: 'SELECT * FROM data'

  };
  
    map = new L.Map('map', options );
    
        // add a nice baselayer from Stamen 
        //L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
        //  attribution: 'Stamen'
        //}).addTo(map);

        // #1
        //L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
        //  attribution: 'Dark matter'
        //}).addTo(map);

  /*      
        L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
          attribution: 'positron_lite_rainbow'
        }).addTo(map);

        L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
          attribution: 'dark_matter_lite_rainbow'
        }).addTo(map);
       
 */        
        L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
          attribution: 'Positron'
        }).addTo(map);
        
        new L.Control.Zoom({ position: 'topright' }).addTo(map);

/*
        var layers = ['https://code4kc.cartodb.com/api/v2_1/viz/8167c2b8-0cf3-11e5-8080-0e9d821ea90d/viz.json',
             'https://code4kc.cartodb.com/api/v2_1/viz/97d27fda-0d15-11e5-8183-0e0c41326911/viz.json'];
        var q = queue(3);

        layers.forEach(function(vizjson) {
          q.defer(function(vizjson, callback) {
            cartodb.createLayer(map, vizjson, function(layer) { callback(null, layer); })
          }, vizjson);


        })
*/

        var datalayer = 'https://code4kc.cartodb.com/api/v2_1/viz/8167c2b8-0cf3-11e5-8080-0e9d821ea90d/viz.json';

        cartodb.createLayer(map, datalayer).addTo(map).on('done', function(layer){
          var sublayer = layer.getSubLayer(2); //sublayer generated from the data.json file
          sublayer.infowindow.set('template', $('#infowindow_template').html());
          sublayer.setInteraction(true);
          //add more data as needed:
          sublayer.setInteractivity('cartodb_id, address, apn, kivapin, land_ban30, land_ban_6, land_ban_4, land_ban_6, land_ban_7, land_ban10, land_ban36, land_ban56, land_ban60, land_bank_, own_name');
          sublayer.on('featureClick', function(e, latlng, pos, data, layer) {
            currentParcelData = data;
          });
        }).on('error', function(){
          console.log("Error");
        });

        
  $('.cd-panel').on('click', function(event){
    if( $(event.target).is('.cd-panel') || $(event.target).is('.cd-panel-close') ) {
      $('.cd-panel').removeClass('is-visible');
      event.preventDefault();
    }
  });
//        q.await(function() {
//          var leafletLayers = Array.prototype.slice.call(arguments, 1);
//          leafletLayers.forEach(function(lyr) {
//            lyr.addTo(map);
//          });
//        })





  $('.cd-panel').on('click', function(event){
    if( $(event.target).is('.cd-panel') || $(event.target).is('.cd-panel-close') ) {
      $('.cd-panel').removeClass('is-visible');
      event.preventDefault();
    }
  });
});

