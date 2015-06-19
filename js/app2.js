var map;
var templates;

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
    sublayer.setInteractivity('cartodb_id, address, apn, kivapin, land_ban30, land_ban_6, land_ban_4, land_ban_6, land_ban_7, land_ban10, land_ban36, land_ban56, land_ban60, land_bank_, own_name, landusecod, land_ban32, land_ban_3');
    sublayer.on('featureClick', function(e, latlng, pos, data, layer) {
      populatePanel(data);

      $('.cartodb-infowindow').on('click', '#openpanel' ,function(){
        $('.cd-panel').addClass('is-visible');
      });
    });
  }).on('error', function(){
    console.log("Error");
  });
}

function populatePanel(data){
  $('#AddressTitle').text(data.land_ban60);

  //build the building envelope panel
    var template = $('#envelope_template').html();
    var rendered = Mustache.render(template, {
      maxfootprint: calculateBFootprint(1,1),
      maxfloors: "n/a",
      maxsqftg: calculateBSF(1,1,1,1,1,1),
      minstalls: "n/a"
    });
    $('#envelope').html(rendered);

  //build the general tab
    template = $('#generalbox_template').html();
    rendered = Mustache.render(template, {
      owner: data.own_name, 
      landuse: data.land_bank_, 
      landusecode: data.landusecod,
      sqrft: data.land_ban30,
      council: data.land_ban_7,
      school: data.land_ban10,
      neighborhood: data.land_ban_6,
      bff: "n/a",
      date: "n/a",
      assland: "n/a",
      assimprove: "n/a",
      exland: "n/a",
      eximprove: "n/a",
      acres: "n/a",
      perimeter: "n/a",
      plss: "n/a"

  });
  $('#general').html(rendered);

  //build the tax tab
  template = $('#taxbox_template').html();
  var rendered = Mustache.render(template, {
    assessedvalue: "n/a",
    taxvalue: "n/a",
    levy: "n/a",
    prevyear: "2014",
    prevtax: "n/a",
    lastassessed: "n/a"
  });
  $('#tax').html(rendered);

  //build the neighborhood tab
  template = $('#nhoodbox_template').html();
  rendered = Mustache.render(template);
  $('#neighborhood').html(rendered);

  //build the plan tab
  template = $('#planbox_template').html();
  rendered = Mustache.render(template);
  $('#plan').html(rendered);

  //build the incentives tab
  template = $('#incentivesbox_template').html();
  rendered = Mustache.render(template);
  $('#incentives').html(rendered);

  //build the links tab
  template = $('#linksbox_template').html();
  rendered = Mustache.render(template, {
    kivapin: data.kivapin
  });
  $('#links').html(rendered);

  //populate the zoning select
  var zoningselect = $('#ZoningSelect');
  zoningselect.empty();
  zoningselect.append($("<option \>").val(data.land_ban_3).text(data.land_ban_3));

  //TODO: fill in the other select boxes, zoning select should probably have more options, and the fill in the building evelope

}


jQuery(document).ready(function($){
  main();

  $('.cd-panel').on('click', function(event){
    if( $(event.target).is('.cd-panel') || $(event.target).is('.cd-panel-close') ) {
      $('.cd-panel').removeClass('is-visible');
      event.preventDefault();
    }
  });

});

