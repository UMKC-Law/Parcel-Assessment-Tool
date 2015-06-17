var map;
var currentParcelData;

function main(){

  var options = {
    center: [39.08, -94.55],
    zoom: 14, 
    zoomControl: false,  // dont add the zoom overlay (it is added by default)
    loaderControl: false, //dont show tiles loader
    query: 'SELECT * FROM data'

  };
  
  map = new L.Map('map', options );
    
  L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: 'Positron'
  }).addTo(map);
  
  new L.Control.Zoom({ position: 'topright' }).addTo(map);

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
}

function openpanel(){
  $('.cd-panel').addClass('is-visible');
  console.log("panel should have opened");
}

jQuery(document).ready(function($){
  main();

  $('.cd-panel').on('click', function(event){
    if( $(event.target).is('.cd-panel') || $(event.target).is('.cd-panel-close') ) {
      $('.cd-panel').removeClass('is-visible');
      event.preventDefault();
    }
  });

  $(document).on('click', '#openpanel', function(event){
    $('.cd-panel').addClass('is-visible');
  });

});

