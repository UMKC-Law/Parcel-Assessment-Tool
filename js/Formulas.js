/******************************************************************************
	Summary: Functions and table based on equations from the spreadsheet file
	GSsf = Gross Square Footage/ "Gross Site Area" (N2)
	LC = Lot Coverage Ratio (N2)
	St = # of Stories (N6)
	PI = Parking Index (N9)
	PS = Parking Stalls (N16)
    SA = Parking Stall Area (N10)
	PF = Parkingfloors (N11)
	BSF = Maximum Building Area (Building Square Footage Maximum box) 
    BC = Building Component (N14)
    PC = Parking Component (N15)
    FAR = FAR maximum (N4)
    BFP = Building Footprint (N22)
    PFP = PArking Footprint (N23)
    OS = Open Space (N24)
    TS = Total Site Area (N25)
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

function calculateOpenSpace(GSsF, LC){
	return GSsF * (1-LC);
}

function calculateParkingStalls(PC, PA){
    return PC/PA;
}

function calculateBuildingComponent(GSsF, LC, St, PI, SA, PF, FAR){
    var a = (GSsF * LC)/((1/St)+(1/(1000/PI))*(SA/PF));
    var b = (GSsF * FAR);

    if(a > b) return b;
    else return a;
}

function calculateParkingComponent(BC, PI, SA){
    return (BC/(1000/PI))*SA;
}

function calculateBuildingFootprint(BC, St)
{
    return BC/St;
}

function calculateParkingFootprint(PC, PF)
{
    return PC/PF;
}

function calculateOpenSpace(GSsF, LC)
{
    return GSsF*(1-LC);
}

function calculateTotalSite(BF, PF, OS)
{
    return BF + PF + OS;
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
    "SA": 300 //placeholder
  },
  "B3-2": {
    "height": 60,
    "LC": 0.8,
    "far": 3.0,
    "maxheight": 60,
    "St": 2,
    "PI": 4.00,
    "PF": 1, //placeholder
    "SA": 300 //placeholder
  },
  "B3-3": {
    "height": 60,
    "LC": 0.8,
    "far": 3.0,
    "maxheight": 60,
    "St": 2,
    "PI": 4.00,
    "PF": 1, //placeholder
    "SA": 300 //placeholder
  },
  "B4-2": {
    "height": 70,
    "LC": 0.80,
    "far": 4.0,
    "maxheight": 70,
    "St": 2,
    "PI": 0.25,
    "PF": 1, //placeholder
    "SA": 300 //placeholder
  },
  "B4-5": {
    "height": 70,
    "LC": 0.80,
    "far": 4.0,
    "maxheight": 70,
    "St": 2,
    "PI": 0.25,
    "PF": 1, //placeholder
    "SA": 300 //placeholder
  },
  "R-0.5":{
    "height": 164,
    "LC": 0.60,
    "far": 1.00,
    "maxheight": 164,
    "St": 2,
    "PI": 1.00,
    "PF": 1, //placeholder
    "SA": 300 //placeholder
  },
  "R-1.5": {
    "height": 45,
    "LC": 0.60,
    "far": 1,
    "maxheight": 45,
    "St": 2,
    "PI": 0.25,
    "PF": 1, //placeholder
    "SA": 300 //placeholder
  },
  "R-2.5": {
    "height": 40,
    "LC": 0.60,
    "far": 1,
    "maxheight": 40,
    "St": 2,
    "PI": 1.00,
    "PF": 1, //placeholder
    "SA": 300 //placeholder
  },
  "M1-5": {
    "height": 80,
    "LC": 0.80,
    "far": 5,
    "maxheight": 80,
    "St": 2,
    "PI": 0.25,
    "PF": 1, //placeholder
    "SA": 300 //placeholder
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
    "SA": 300 //placeholder
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
    "SA": 300 //placeholder
  }
};
