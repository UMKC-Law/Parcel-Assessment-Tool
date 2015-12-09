<?php


include( "../../library/excel_reader2.php" );

class Extract {

    var $data = null;

    /**
     * Tab 3 - Lot-Requirements
     */
    var $standards = array();                   // Columns
    var $standards_column = 1;
    var $standards_start_row = 4;
    var $standards_end_row = 27;

    var $zoning = array();                      // [ Res Conventional | Res OpenSpace | res Conservation | Office Business | Downtown | Manufacturing ][ Standard ]
    var $zoning_standards_map = array();
    var $zoning_positions = array(
            'CD' => array(
                'name' => 'Res Conventional',
                'table_num_column' => 3,
                'start_column' => 4,
                'end_column' => 12
            ),
            'OS' => array(
                'name' => 'Res OpenSpace',
                'table_num_column' => 14,
                'start_column' => 15,
                'end_column' => 23
            ),
            'CO' => array(
                'name' => 'Res Conservation',
                'table_num_column' => 25,
                'start_column' => 26,
                'end_column' => 34
            ),
            'OB' => array(
                'name' => 'Office Business',
                'table_num_column' => 37,
                'start_column' => 38,
                'end_column' => 44
            ),
            'DT' => array(
                'name' => 'Downtown',
                'table_num_column' => -1,
                'start_column' => 47,
                'end_column' => 53
            ),
            'CV' => array(
                'name' => 'Conventional_Development',
                'table_num_column' => 56,
                'start_column' => 57,
                'end_column' => 61
            ),
        );



    /**
     * Tab 4 - Carlson_use_table
     */
    var $use_groups = array();
    var $use_group_start_column = 2;
    var $use_group_category_row = 2;
    var $use_group_sub_category_row = 3;

    var $types = array();
    var $type_start_column = 1;

    var $use_group_type_map = array();

    function __construct()
    {

        $shortopts = "";
        $shortopts .= "i::";  // Optional value
        $shortopts .= "o::"; // Optional value
        $shortopts .= "h"; // Optional value


        $longopts = array(
            "input::",     // Optional value
            "output::",    // Optional value
            "help",

        );
        $options = getopt($shortopts, $longopts);

        if (empty($options)
            || array_key_exists('h', $options)
        ) {
            $this->help();
        } else {

            $missing_a_value = false;

            $input_file = '';
            $output_file = '';

            foreach ($options AS $opt => $val) {
                switch ($opt) {
                    case 'i':
                    case 'input':
                        if ($val === false) {
                            $missing_a_value = true;
                        } else {
                            $input_file = $val;
                        }
                        break;

                    case 'o':
                    case 'output':
                        if ($val === false) {
                            $missing_a_value = true;
                        } else {
                            $output_file = $val;
                        }
                        break;

                }
            }

            if ( $missing_a_value ) {
                $this->help( $input_file, $output_file);
            } else {
                //   $STDOUT = fopen("php://stdout", "w");
                if ( file_exists( $input_file ) ) {
                    if ( empty( $output_file ) ) {
                        $output_file = "php://stdout";
                    }

                    $this->process_file( $input_file, $output_file );

                } else {
                    print "ERROR: Input file not found";
                }

            }

        }

    }

    /**
     * Display help on CLI usage, if input or output file name a given put them in the example.
     * @param string $input_file
     * @param string $output_file
     */
    function help( $input_file = "input-spreadsheet.xls", $output_file = "output.json") {

        global $argv;

        $input_file = empty($input_file) ? "input-spreadsheet.xls" : $input_file;
        $output_file = empty($output_file) ? "output-spreadsheet.xls" : $output_file;

        print $argv[0] . " --input=$input_file --output=$output_file\n";
        print $argv[0] . " -i=$input_file -o=$output_file\n";
    }

    /**
     * Main logic, processes all of the tabs, and areas in the spreadsheet
     * @param $file_name
     */
    function process_file( $input_filename, $output_filename ) {
        $this->data = new Spreadsheet_Excel_Reader( $input_filename, true );

        $this->get_standards( 3 );
        $this->get_zoning( 3 );

        $this->get_use_groups( 4 );
        $this->get_use_categories( 4 );

        $a = array(
            'Zoning' => $this->zoning,
            'Standards' => $this->standards,
            'Zoning2Standard' => $this->zoning_standards_map,
            'UseGroups' => $this->use_groups,
            'Types' => $this->types,
            'Use2Types' => $this->use_group_type_map
        );

        print_r($a);

        file_put_contents($output_filename, json_encode($a));

    }



    /**
     * get_standards
     * Get a list of standards for a zoning code.
     * Normaly first column of the third tab
     * @param int $sheet
     */
    function get_standards( $sheet = 3 ) {
        for ( $row = $this->standards_start_row; $row < $this->standards_end_row ; $row++) {
            $this->standards[ $row ] =  $this->data->val( $row, $this->standards_column, $sheet );
        }
    }

    /**
     * get_zoning
     * For each zoning, get name, and the value to use for the standard
     * @param int $sheet
     */

    function get_zoning( $sheet = 4 ) {
        foreach ($this->zoning_positions AS $alias => $vars ) {

            $name = $vars[ 'name'];
            $start_column = $vars[ 'start_column' ];
            $end_column = $vars[ 'end_column' ];

            for ( $column = $start_column; $column <= $end_column; $column++ ) {        //

                $zoning_name = $this->get_zoning_id(2, $column, $sheet);
                $this->zoning[ $name ][ $zoning_name ] = $column;

                foreach ($this->standards AS $standard_id => $standard_name) {

                    $val = $this->data->val( $standard_id, $column, $sheet );
                    $this->zoning_standards_map[ $column ][ $standard_id ] = $val;
                }
            }
        }
    }

    /**
     * get_zoning_id
     * @param $row
     * @param $column
     * @param $sheet
     * @return Zoning ID with some characters striped out
     */
    function get_zoning_id( $row, $column, $sheet ) {
        $val = $this->data->val( $row, $column, $sheet );
        return preg_replace('/CD|OS|CO/', '', $val);
    }

    function get_use_categories( $sheet = 4 ) {

        $last_type_category = '';

        for ( $row = 4; $row < $this->data->rowcount( $sheet ) ; $row++) {
            $color      = $this->data->bgColor( $row, 1, $sheet );
            $type_name  = $this->data->val( $row, 1, $sheet );

            if ( empty( $type_name ) ) continue;                            // Skip lines with no name

            if ( $color != '' ) {                                           // New type category
                if ( !empty( $last_type_category )) {                       // If we are at the end of a type
                    $this->types[ $last_type_category ] = $sub_types;
                }
                $sub_types = array();
                $last_type_category = $type_name;
                
            } else {

                $sub_types[ $type_name ] = $row;

                for ( $i = $this->use_group_start_column ; $i < $this->data->colcount( $sheet ) ; $i++ ) { // For each data column

                        $val = $this->data->val( $row, $i, $sheet );
                        $this->use_group_type_map[ $i ][ $row ] = $val;                                     // This is Col, Row but should make processing easier
                }
            }
        }

        $this->types[ $last_type_category ] = $sub_types;

    }

    function get_use_groups ( $sheet = 4 ) {

        /* Get the column headings and store in $use_groups */

        $last_category_name = '';


        for ( $i = $this->use_group_start_column ; $i < $this->data->colcount( $sheet ) ; $i++ ) {                  // For each column in the heading

            $color    = $this->data->bgColor( $this->use_group_category_row, $i, $sheet );
            $category = $this->data->val( $this->use_group_category_row, $i, $sheet );

            if ( $color != '' ) {                                                       // We only process cells with non non transparent background
                if ( !empty( $category ) ) {                                            // We have a new category
                    if ( !empty( $last_category_name ) ) {                              // If we are at the end of a category
                        $this->use_groups[ $last_category_name ] = $sub_cats;
                    }
                    $sub_cats = array();
                    $last_category_name = $category;
                }
                $sub_category_name = $this->data->val( $this->use_group_sub_category_row, $i, $sheet );
                $sub_cats[ $sub_category_name ] = $i;
            }
        }
        $this->use_groups[ $last_category_name ] = $sub_cats;

    }

}





$e = new Extract();
