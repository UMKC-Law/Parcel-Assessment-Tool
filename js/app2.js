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
function initAutocomplete(map, subLayer) {

	var sql = cartodb.SQL({ user: 'codeforkansascity' });
	$( ".cartodb-searchbox .text" ).autocomplete({
		source: function( request, response ) {
			sql.execute("SELECT cartodb_id, address, the_geom \
                FROM kcmo_parcels_6_18_2015_wendell_phillips \
                WHERE address LIKE '" + request.term + "%' ORDER BY address")
			.done(function(data) {
				response(data.rows.map(function(r) {
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
            sql.execute("SELECT ST_X(ST_Centroid(the_geom)) as X, ST_Y(ST_Centroid(the_geom)) as Y \
                FROM kcmo_parcels_6_18_2015_wendell_phillips \
                WHERE address LIKE '" + ui.item.value + "%'")
            .done(function(data){

                map.panTo({lng: data.rows[0].x, lat: data.rows[0].y});
                map.setZoom(18);

                var geomQuery = "WITH query_geom AS (SELECT the_geom AS geom FROM kcmo_parcels_6_18_2015_wendell_phillips WHERE address LIKE '" + ui.item.value + "%') SELECT parcels.* FROM kcmo_parcels_6_18_2015_wendell_phillips AS parcels, query_geom WHERE ST_DWithin(query_geom.geom::geography, parcels.the_geom::geography, 5)"

                subLayer.setSQL(geomQuery);
                
            });	
		}
	});

};

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

function attachMapLayers(map){

    //google maps info window
    var infoWindow = new google.maps.InfoWindow();
    infoWindowClosing = false;

    //prevent another info window from opening at the close button
    google.maps.event.addListener(infoWindow, 'closeclick', function(){
        infoWindowClosing = true;
        window.setTimeout(function(){infoWindowClosing = false;}, 500);
    });

    cartodb.createLayer(map, {
        user_name: 'codeforkansascity',
        type: 'cartodb',
        sublayers: [{
            sql: "SELECT * FROM kcmo_parcels_6_18_2015_wendell_phillips",
            cartocss: '#kcmo_parcels_6_18_2015_wendell_phillips{ polygon-fill: #5CA2D1; polygon-opacity: 0.7; line-color: #0F3B82; line-width: 1; line-opacity: 1; }'
        }]
    }).addTo(map, 0).on('done', function(layer){
		var v = cdb.vis.Overlay.create('search', map.viz, {});
		v.show();
		$('#map').append(v.render().el);

        //enable interactivity with the sublayer
        var subLayer = layer.getSubLayer(0); //sublayer generated from this data
        subLayer.setInteraction(true);
        subLayer.setInteractivity('apn');

        //use the pointer cursor on featurehover
        subLayer.on('featureOver', function(e, latlon, pxPos, data, layer){
            map.setOptions({ draggableCursor: 'pointer' });
        });

        subLayer.on('featureOut', function(m, layer){
            map.setOptions({ draggableCursor: '' });
        })

        //enable pop up on parcel click
        subLayer.on('featureClick', function(e, latlng, pos, data, layer){
            //do nothing if the infoWindow was just closed
            if(infoWindowClosing) return;

            var request = createCORSRequest(
                "get", 
                "http://address-api.codeforkc.org/jd_wp/" + data.apn
            );

            var api_data = null;

            if (request) {
                request.onload = function () {
                    api_data = JSON.parse(request.responseText);

                    if (api_data) {

                        data = api_data;
                    } else {

                        console.log("no data found for parcel with apn" + data.apn);
                    }

                };
                request.send();

                $('#addtofolder').off('click'); 
                position = new google.maps.LatLng(latlng[0], latlng[1], false);
                infoWindow.setContent("<button type='button' " +
                                      "class='btn btn-primary'" + 
                                      "id='addtofolder'>Add to Folder</button>");
                infoWindow.setPosition(position);
                infoWindow.open(map);

                $('#addtofolder').on('click', function () {
                    addParcel(data);
                    $('.cd-panel').addClass('is-visible');
                });
            }
        });

        //render the search box
        initAutocomplete(map, subLayer);

    })
    .on('error', function(){
    	cartodb.log.log("Error");
    });

}

function initMap(useGMaps){
	$('#mainclass').html("<div id='map'></div>");
		map = createGoogleMap();
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
        newSqft = calculateBuildingComponent(BSFMax, ZoneTable[zone]["LC"], $(this[this.selectedIndex]).val(), ZoneTable[zone]["PI"], ZoneTable[zone]["SA"], ZoneTable[zone]["PF"], ZoneTable[zone]["far"]);
        console.log(newSqft);
        $('#selsqft').html(newSqft);
        //TODO: not implemented yet
    });
}

function initPanel(){

	savedParcels = 0;

	if(savedParcels === 0) {
		$('#ParcelContent').html('<div id="No-Parcels"><p>No Parcels selected!</p><p>To begin select a Parcel on the Map!</p></div>');
	}else{
		//TODO: Add a way to save the parcels the user has opened (Cookies.js?)
	};
}

function addParcel(Parcel){
	exists = false;
	$('.parceltab').each(function(){
		if(Parcel.county_apn_link === $(this).data("Parcel").county_apn_link){ 
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
	$('#ParcelTabs').append("<li role='presentation' class='parceltab' id='" + Parcel.county_apn_link + "Tab'><a href='#" + Parcel.county_apn_link + "' aria-controls='" + Parcel.county_apn_link + "' role='tab' data-toggle='tab'>" + Parcel.jrd_address + " <span class='close-tab glyphicon glyphicon-remove'></span></a></li>");
	$('#' + Parcel.county_apn_link + 'Tab').data("Parcel", Parcel);

	$('a[data-toggle="tab"]').off();
    //have to re-initialize this for new tabs to be noticed
	$('a[data-toggle="tab"]').on('show.bs.tab', function (e, focus) {
		selectParcel($(e.target).parent().data("Parcel"));
	});
	$('.close-tab').off();
	$('.close-tab').on('click', function(e){
		var tab = $($(e.target).parent()).parent();
		removeParcel(tab);
		e.preventDefault();
	});


	$('#' + Parcel.county_apn_link + 'Tab').tab('show');
    //above command doesn't seem to actually propagate the bs.tab.show event properly.
	selectParcel(Parcel);
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


    $('#AddressTitle').text(data.jrd_address);
    var zone = data.zoning;
    ParcelArea = data.square_feet;
    buildEnvelope(zone);

    //build the general tab
    var template = $('#generalbox_template').html();
    var rendered = Mustache.render(template, {
        owner: data.owner,
        landuse: data.land_use,
        zone: zone,
        council: data.council_district,
        school: data.school_distrct,
        neighborhood: data.census_neigh_borhood,
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
        kivapin: data.kiva_pin
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


