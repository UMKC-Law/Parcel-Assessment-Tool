/******************************************************************************
	Summary: Functions and table based on equations from the spreadsheet file
	GSsf = Gross Square Footage/ "Gross Site Area"
	LC = Lot Coverage Ratio
	St = # of Stories
	PI = Parking Index?
	PS = Parking Stalls
	PF = Parkingfloors
	BSF = Building Square Footage (maximum)
******************************************************************************/

//Building Square Footage Maximum
function calculateBSF(GSsf, LC, St, PI, PS, PF){
	return (GSsf * LC)/ ((1/St) + ((1/(1000/PI))*(PS/PF)));
}

//Allocation of site functions
function calculateBFootprint(BSF, St){
	return BSF/St;
}

function calculatePFootprint(BSF, PS, PF){
	return BSF * (PS/PF);
}

function CalculateOpenSpace(GSSF, LC){
	return GSSF * (1-LC);
}

//temporary lookup table for values until we get the database setup
var ZoneTable = {
  "B1-1": {
    "height": 40,
    "LC": 0.6,
    "far": 1.4,         
    "maxheight": 40,
    "St": 2,
    "PI": 3.00,
    "PF": 1, //placeholder
    "PS": 300 //placeholder
  },
  "B3-2": {
    "height": 55,
    "LC": 0.6,
    "far": 2.5,
    "maxheight": 55,
    "St": 2,
    "PI": 4.00,
    "PF": 1, //placeholder
    "PS": 300 //placeholder
  },
  "B4-2": {
    //all are placeholder
    "height": 99,
    "LC": 0.99,
    "far": 0.99,
    "maxheight": 99,
    "St": 99,
    "PI": 0.99,
    "PF": 1, //placeholder
    "PS": 300 //placeholder
  },
  "B4-5": {
    //all are placeholder
    "height": 99,
    "LC": 0.99,
    "far": 0.99,
    "maxheight": 99,
    "St": 99,
    "PI": 0.99,
    "PF": 1, //placeholder
    "PS": 300 //placeholder
  },
  "R-0.5":{
    //all are placeholder
    "height": 99,
    "LC": 0.99,
    "far": 0.99,
    "maxheight": 99,
    "St": 99,
    "PI": 0.99,
    "PF": 1, //placeholder
    "PS": 300 //placeholder
  },
  "R-1.5": {
    "height": 45,
    "LC": 0.48,
    "far": 1,
    "maxheight": 45,
    "St": 3,
    "PI": 0.25,
    "PF": 1, //placeholder
    "PS": 300 //placeholder
  },
  "R-2.5": {
  //all are placeholder
    "height": 99,
    "LC": 0.99,
    "far": 0.99,
    "maxheight": 99,
    "St": 99,
    "PI": 0.99,
    "PF": 1, //placeholder
    "PS": 300 //placeholder
  },
  "M1-5": {
    //all are placeholder
    "height": 99,
    "LC": 0.99,
    "far": 0.99,
    "maxheight": 99,
    "St": 99,
    "PI": 0.99,
    "PF": 1, //placeholder
    "PS": 300 //placeholder
  },
  "MPD": {
    //all are placeholder
    "height": 99,
    "LC": 0.99,
    "far": 0.99,
    "maxheight": 99,
    "St": 99,
    "PI": 0.99,
    "PF": 1, //placeholder
    "PS": 300 //placeholder
  },
  "UR": {
    //all are placeholder
    "height": 99,
    "LC": 0.99,
    "far": 0.99,
    "maxheight": 99,
    "St": 99,
    "PI": 0.99,
    "PF": 1, //placeholder
    "PS": 300 //placeholder
  }
};
