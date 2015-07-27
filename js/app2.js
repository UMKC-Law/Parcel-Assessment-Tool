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

/*end from*/

function initAutocomplete() {
//	function log( message ) {
//		$( "<div>" ).text( message ).prependTo( "#log" );
//		$( "#log" ).scrollTop( 0 );
//	}
	var sql = cartodb.SQL({ user: 'codeforkansascity' });
	$( ".cartodb-searchbox .text" ).autocomplete({
		source: function( request, response ) {
			var s
			sql.execute("SELECT cartodb_id, address, the_geom FROM codeforkansascity.kcmo_parcels_6_18_2015_kiva_nbrhd WHERE address LIKE '" + request.term + "%' ORDER BY address")
			.done(function(data) {
				response(data.rows.map(function(r) {
            		//console.log(r);
					return {
						label: r.address,
						value: r.address
					}
				}))
			})
		},
		minLength: 2,
		select: function( event, ui ) {
			console.log("Selected: " + ui.item.value);
			//var bounds = new google.maps.LatLngBounds();
			//for(i=0;i<r.length;i++) {
			//	bounds.extend(r[i].getPosition());
			//}
			//map.fitBounds(bounds);
			// "Nothing selected, input was " + this.value );
		}
	});

};
//console.log("SELECT cartodb_id, address FROM codeforkansascity.kcmo_parcels_6_18_2015_kiva_nbrhd WHERE address LIKE '" + request.term + "%' ORDER BY address");

function createGoogleMap(){
	var map;

	// create google maps map
	var mapOptions = {
		zoom: 15,
		center: new google.maps.LatLng(39.082981, -94.557747),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
    map = new google.maps.Map(document.getElementById('map'),  mapOptions);

    return map;
}

function createLeafletMap(){
	var map;

	var options = {
	    center: [39.082981, -94.557747],
	    zoom: 15,
	    zoomControl: false,  // dont add the zoom overlay (it is added by default)
	    loaderControl: false, //dont show tiles loader
	    query: 'SELECT * FROM data'

	};

    map = new L.Map('map', options);

	L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
	    attribution: 'Positron'
	}).addTo(map);

	new L.Control.Zoom({position: 'bottomright'}).addTo(map);
    
	return map;
}

function attachMapLayers(map){

    var datalayer = 'https://code4kc.cartodb.com/api/v2/viz/8167c2b8-0cf3-11e5-8080-0e9d821ea90d/viz.json';
    var geomlayer = 'https://codeforamerica.cartodb.com/u/codeforkansascity/api/v2/viz/4e032b12-1dfe-11e5-8ca7-0e49835281d6/viz.json'

    cartodb.createLayer(map, geomlayer).addTo(map, 0).on('done', function(layer){
		var v = cdb.vis.Overlay.create('search', map.viz, {})
		v.show();
		$('#map').append(v.render().el);
		initAutocomplete();
    })
    .on('error', function(){
    	cartodb.log.log("Error");
    });

    cartodb.createLayer(map, datalayer).addTo(map, 1).on('done', function (layer) {
        var sublayer = layer.getSubLayer(1); //sublayer generated from the data.json file
        sublayer.infowindow.set('template', $('#infowindow_template').html());
        sublayer.setInteraction(true);
        //add more data as needed:
        sublayer.setInteractivity('cartodb_id, address, apn, kivapin, land_ban30, land_ban_6, land_ban_4, land_ban_6, land_ban_7, land_ban10, land_ban36, land_ban56, land_ban60, land_bank_, own_name, landusecod, land_ban32, land_ban_3');
        sublayer.on('featureClick', function (e, latlng, pos, data, layer) {

            var request_jd_wp = createCORSRequest("get", "http://address-api.codeforkc.org/jd_wp/" + data.apn);
            var api_data = null;
            if (request_jd_wp) {
                request_jd_wp.onload = function () {
                    api_data = JSON.parse(request_jd_wp.responseText);

                    if (api_data) {
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

                    $('.cartodb-infowindow').off('click', '#addtofolder'); 
                    $('.cartodb-infowindow').on('click', '#addtofolder', function () {
                    	addParcel(data);
                        $('.cd-panel').addClass('is-visible');
                    });


                };
                request_jd_wp.send();
            }

        });
    }).on('error', function () {
        console.log("Error");
    });
}


function initMap(useGMaps){
	$('#mainclass').html("<div id='map'></div>");
	map = useGMaps ? createGoogleMap() : createLeafletMap();
	attachMapLayers(map)
}

var ParcelArea;

function buildEnvelope(zone) {

    var template = $('#envelope_template').html();
    //store some variables:
    if (ZoneTable[zone]) {
        var maxfloors = Math.floor((ZoneTable[zone]["maxheight"]/10));
        var BSFMax = calculateBSF(ParcelArea, ZoneTable[zone]["LC"], 1.00, ZoneTable[zone]["PI"], ZoneTable[zone]["SA"], ZoneTable[zone]["PF"]);
        var BuildingComponent = calculateBuildingComponent(BSFMax, ZoneTable[zone]["LC"], 1.00, ZoneTable[zone]["PI"], ZoneTable[zone]["SA"], ZoneTable[zone]["PF"], ZoneTable[zone]["far"]);
        var ParkingComponent = calculateParkingComponent(BuildingComponent, ZoneTable[zone]["PI"], ZoneTable[zone]["SA"]);

        //populate the template
        var rendered = Mustache.render(template, {
            maxfootprint: calculateBFootprint(BSFMax, maxfloors),
            maxsqftg: Math.floor(BSFMax),
            minstalls: Math.ceil(calculateParkingStalls(ParkingComponent, ZoneTable[zone]["SA"]))
        });
    }
    $('#envelope').html(rendered);

    floorselect = $('#userfloors');
    floorselect.empty();
    for(i =0; i <= maxfloors; i++){
      floorselect.append($('<option>', {
        value: i,
        text: i,
      }));
    };
    //TODO: the results of these values need to be checked
    floorselect.change(function(){
      //TODO: not implemented yet
    });
}

function initPanel(){

	savedParcels = 0;

	if(savedParcels === 0) {
		$('#ParcelContent').html('<div id="No-Parcels"><p>No Parcels selected!</p><p>To begin select a Parcel on the Map!</p></div>');
	}else{
		//TODO: Add a way to save the parcels the user has opened (Cookies.js?)
		//SavedParcels.forEach(function(parcel){
		//	publishParcel(parcel);
		//	selectParcelTab(parcel);
		//});
	};
}

function addParcel(Parcel){
	exists = false;
	$('.parceltab').each(function(){
		if(Parcel.apn === $(this).data("Parcel").apn){ 
			exists = true; 
			return;
		}
	});
	
	if(exists)
	{ 
		return;
	}

	publishParcel(Parcel);

}

function publishParcel(Parcel){
	$('#ParcelTabs').append("<li role='presentation' class='parceltab' id='" + Parcel.apn + "Tab'><a href='#" + Parcel.apn + "' aria-controls='" + Parcel.apn + "' role='tab' data-toggle='tab'>" + Parcel.address + " <span class='close-tab glyphicon glyphicon-remove'></span></a></li>");
	$('#' + Parcel.apn + 'Tab').data("Parcel", Parcel);

	$('a[data-toggle="tab"]').off();
	$('a[data-toggle="tab"]').on('show.bs.tab', function (e, focus) { //have to re-initialize this for new tabs to be noticed
		selectParcel($(e.target).parent().data("Parcel"));
	});
	$('.close-tab').off();
	$('.close-tab').on('click', function(e){
		var tab = $($(e.target).parent()).parent();
		removeParcel(tab);
		e.preventDefault();
	});


	$('#' + Parcel.apn + 'Tab').tab('show');
	selectParcel(Parcel); //above command doesn't seem to actually propagate the bs.tab.show event properly.
}

function removeParcel(Parceltab){
	if($('.parceltab').length > 1)
	{
		if(Parceltab.hasClass('active')){
			var i = Parceltab.index() - 1;
			activateTab = $('#ParcelTabs li:eq(' + i + ')');
			$(activateTab).tab('show');
			selectParcel($(activateTab).data('Parcel'));
		}
	}
	else
	{
		$('#ParcelContent').html('<div id="No-Parcels"><p>No Parcels selected!</p><p>To begin select a Parcel on the Map!</p></div>');
	}

	$(Parceltab).remove();
}

function selectParcel(data) {

	//todo: clean this code up
	var template = $('#parcel_template').html();
	var rendered = Mustache.render(template);
	$('#ParcelContent').html(rendered);


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

    $("select#ZoningSelect").val(zone);

    $("select#ZoningSelect").on('change', function () {
    	buildEnvelope($("select#ZoningSelect").find(":selected").val())
    });

}

jQuery(document).ready(function ($) {

	$('#openModal').modal();

	initPanel();
	initMap(false);

	$('.btn-toggle#maptoggle').click(function(){
		$(this).find('.btn').toggleClass('active');
		$(this).find('.btn').toggleClass('btn-primary');
		$(this).find('.btn').toggleClass('btn-default');
		($(this).find('.active').attr('id') == "leafletbutton") ? initMap(false) : initMap(true);
	});

	$('.cd-panel-content').on("swipeleft", function(){
		$('.cd-panel').removeClass('is-visible');
	});

	$("#ParcelTabs").sortable({axis: "x", containment: "parent"});

	$("#HamburgerButton").click(function(){
		$('.cd-panel').addClass('is-visible');
	});

    $(document).keydown(function(e){
        if(e.keyCode == 27){ //escape key
            ($(document).find('.modal.in').length > 0) 
                ? $('#openModal').modal('hide') 
                : $('.cd-panel').removeClass('is-visible');

            e.preventDefault();
        }
    });

});


