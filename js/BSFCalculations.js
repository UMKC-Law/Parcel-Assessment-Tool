/******************************************************************
	Summary: Functions based on equations from the spreadsheet file
	GSsf = Gross Square Footage/ "Gross Site Area"
	LC = Lot Coverage Ratio
	St = # of Stories
	PI = Parking Index?
	PS = Parking Stalls
	PF = Parkingfloors
	BSF = Building Square Footage (maximum)
*******************************************************************/


//Building Square Footage Maximum
function calculateBSF(GSsf, LC, St, PI, PS, PF){
	return (1/St) + ((1/1000/PI)*(PS/PF))
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

