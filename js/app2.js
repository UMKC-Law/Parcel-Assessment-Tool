var map;
var templates;

/* From http://www.nczonline.net/blog/2010/05/25/cross-domain-ajax-with-cross-origin-resource-sharing/ */

function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        xhr = null;
    }
    return xhr;
}

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

  var datalayer = 'https://code4kc.cartodb.com/api/v2/viz/8167c2b8-0cf3-11e5-8080-0e9d821ea90d/viz.json';

  cartodb.createLayer(map, datalayer).addTo(map).on('done', function(layer){
    var sublayer = layer.getSubLayer(2); //sublayer generated from the data.json file
    sublayer.infowindow.set('template', $('#infowindow_template').html());
    sublayer.setInteraction(true);
    //add more data as needed:
    sublayer.setInteractivity('cartodb_id, address, apn, kivapin, land_ban30, land_ban_6, land_ban_4, land_ban_6, land_ban_7, land_ban10, land_ban36, land_ban56, land_ban60, land_bank_, own_name, landusecod, land_ban32, land_ban_3');
    sublayer.on('featureClick', function(e, latlng, pos, data, layer) {


var request_jd_wp = createCORSRequest("get", "http://address-api.localhost/jd_wp/" + data.apn);
var api_data = null;
if (request_jd_wp) {
    request_jd_wp.onload = function () {
        api_data = JSON.parse(request_jd_wp.responseText);
        console.dir(api_data);


    if ( api_data ) {
      data.blvd_front_footage = api_data.blvd_front_footage;
      data.assessed_land = api_data.assessed_land;
      data.assessed_improve = api_data.assessed_improve;
      data.exempt_improve = api_data.exempt_improve;
      data.acres = api_data.acres;
      data.perimeter = api_data.perimeter;
      data.assessed_value = api_data.assessed_value;
      data.api_id = api_data.id;
    } else {

      data.blvd_front_footage = '';
      data.assessed_land = '';
      data.assessed_improve = '';
      data.exempt_improve = '';
      data.acres = '';
      data.perimeter = '';
      data.assessed_value = '';
      data.api_id = '';
    }

      populatePanel(data);

      $('.cartodb-infowindow').on('click', '#openpanel' ,function(){
        $('.cd-panel').addClass('is-visible');
      });


    };
    request_jd_wp.send();
}


    });
  }).on('error', function(){
    console.log("Error");
  });
}

var ParcelArea;

function buildEnvelope(zone){

  var template = $('#envelope_template').html();
  //store some variables:
  var BSFMax = calculateBSF(ParcelArea, ZoneTable[zone]["LC"], ZoneTable[zone]["St"], ZoneTable[zone]["PI"], ZoneTable[zone]["SA"], ZoneTable[zone]["PF"]);
  var BuildingComponent = calculateBuildingComponent(BSFMax, ZoneTable[zone]["LC"], ZoneTable[zone]["St"], ZoneTable[zone]["PI"], ZoneTable[zone]["SA"], ZoneTable[zone]["PF"], ZoneTable[zone]["far"]);
  var ParkingComponent = calculateParkingComponent(BuildingComponent, ZoneTable[zone]["PI"], ZoneTable[zone]["SA"]);

  //populate the template
  var rendered = Mustache.render(template, {
    maxfootprint: Math.floor(calculateBFootprint(BSFMax, ZoneTable[zone]["St"])),
    maxfloors: ZoneTable[zone]["St"],
    maxsqftg: Math.floor(BSFMax),
    minstalls: Math.floor(calculateParkingStalls(ParkingComponent, ZoneTable[zone]["SA"]))
  });
  $('#envelope').html(rendered);

}

function populatePanel(data){
  $('#AddressTitle').text(data.land_ban60);
  var zone = data.land_ban_3;
  ParcelArea = data.land_ban30;
  buildEnvelope(zone);

  //build the general tab
  var template = $('#generalbox_template').html();
  var rendered = Mustache.render(template, {
    owner: data.own_name, 
    landuse: data.land_bank_, 
    landusecode: data.landusecod,
    zone: data.land_ban_3,
    council: data.land_ban_7,
    school: data.land_ban10,
    neighborhood: data.land_ban_6,
    bff: data.blvd_front_footage,
    assland: data.assessed_land,
    assimprove: data.assessed_improve,
    eximprove: data.exempt_improve,
    acres: data.acres,
    perimeter: data.perimeter,
    plss: "n/a" 
  });
  $('#general').html(rendered);

  //build the tax tab
  template = $('#taxbox_template').html();
  var rendered = Mustache.render(template, {
    assessedvalue: data.assessed_value,
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

  /*populate the zoning select
  
  The drop downs will need to be modified later to accomodate building type and business type options

  var zoningselect = $('#ZoningSelect');
  zoningselect.empty();
  zoningselect.append($("<option \>").val(data.land_ban_3).text(data.land_ban_3));

  */
  
  $("select#ZoningSelect").val(zone);
  //switch back to the general tab (otherwise it will leave the last active tab for the last parcel active)
  $("#general").collapse('show');

}


jQuery(document).ready(function($){
  $("select#ZoningSelect").on('change', function(){
    buildEnvelope($("select#ZoningSelect").find(":selected").val())
  });

  main();

  $('.cd-panel').on('click', function(event){
    if( $(event.target).is('.cd-panel') || $(event.target).is('.cd-panel-close') ) {
      $('.cd-panel').removeClass('is-visible');
      event.preventDefault();
    }
  });

});

