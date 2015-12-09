# Create Zoning Codes JSON file.

This program reads in a Excel .xls file and creates a 
representation in JSON.

The format of the spread sheet is as follows:

Tab 3 contains the Zoning Codes, Standards, and value associated with the standard.

Tab 4 contains Zoning Codes, and the Use Codes they can be applied to.

## Creating the file

If you input spread sheet `Zoning_Code_v17.xls`
is in the same directory and
you want to create the file zoning_codes.json you would execute the following command

````
php create_codes.php -i=Zoning_Code_v17.xls -o=zoning_codes.json
````

## Output format

There are six tables creates.

### Zoning

This represents the headers of Tab 3 - Lot_Requirements

````
    [Zoning] => Array
        (
            [Res Conventional] => Array
                (
                    [R80] => 4
                    [R10] => 5
                    [R7.5] => 6
                    [R6] => 7
                    [R5] => 8
                    [R2.5] => 9
                    [R1.5] => 10
                    [R.5] => 11
                    [R.3] => 12
                )
                .
                .
                .
````

### Standards

These are the lables for the rows of Tab 3 - Lot_Requirements.
````
    [Standards] => Array
        (
            [4] => Open_Space_Percent
            [5] => Min_Lot_SF
            [6] => Min_Lot_Per_Unit
            [7] => Lot_Min_Res_Mixed_AboveGnd
            [8] => Min_Lot_Width
            [9] => FAR
            [10] => Front_SB_Percent_Depth
         .
         .
         .
````

### Zoning2Standard

For each Zone this contains the values in Tab 3 of the spread sheet.

````
    [Zoning2Standard] => Array
        (
            [4] => Array
                (
                    [4] => 
                    [5] => 80,000
                    [6] => 80,000
                    [7] => 
                    [8] => 150
                    [9] => 
                    [10] => 25
                    [11] => 
                    [12] => 25
                    .
                    .
                    .
````

### UseGroups  - SHOULD THIS BE Zoning by Groups

Represents the headers of Tab 4 - Carlson_Use_Table.  
These are the zones boken down by type.

````
    [UseGroups] => Array
        (
            [Residential] => Array
                (
                    [AG-R] => 2
                    [R-80] => 3
                    [R-10] => 4
                    [R-7.5] => 5
                    [R-6] => 6
                    [R-5] => 7
                    [R-2.5] => 8
                .
                .
                .
````

###  Types

These are the labels for the rows of Tab 4 
````
    [Types] => Array
        (
            [Residential] => Array
                (
                    [Household Living] => 5
                    [Household Living in single-purpose residential building] => 6
                    [Household Living above ground floor in mixed use building] => 7
                    [Group Living] => 8
                    [Group homes] => 9
                    [Nursing home] => 10
                )
                .
                .
                .
````

### Use2Types

For each Zone in the UseGroup is a value indicating how the Type can be used.
````
    [Use2Types] => Array
        (
            [2] => Array
                (
                    [5] => P
                    [6] => P
                    [7] => -
                    [8] => -
                    [9] => -
                    [10] => -
                    [12] => -
                    [13] => p
                    [14] => p
                    [15] => p
                     .
                     .
                     .
````



 
