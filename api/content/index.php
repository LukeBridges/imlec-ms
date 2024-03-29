<?php

namespace api\content;

require '../../vendor/autoload.php';
require '../../utils/web/Cors.php';
require '../../utils/xlsx/XlsxReader.php';

use utils\web\Cors;

Cors::SendHeaders();

header('Content-Type: application/json');

echo
'{
	"welcome": {
		"body": "<h1>IMLEC 2021 - Maidstone Model Engineering Society</h1> <h2>20th - 22nd August 2021</h2> <p> The Maidstone Model Engineering society was founded in 1929, and construction started on the track located in Mote Park in 1949. We have expanded a bit over the years, and facilities have improved somewhat. As a club we have decided that it was time that we should present our facilities for the use of IMLEC (the International Model Locomotive Efficiency Competition). Unfortunately our 90th anniversary already had a host, although we were able to offer a home for the competition for 2020 - but due to Covid-19 this will now be 2021 - <b>20th - 22nd August 2021</b>. </p> <p> We would like to take this opportunity to invite all to apply to take part in the competition, or to come along to watch. We will endeavour to accommodate all entries, potentially commencing the competition on Friday afternoon if deemed necessary. </p> <p> For the competition we will run in our usual anti clockwise direction of our 1826 foot long dual gauge aluminium raised level track. The minimum radius on the running line is 50ft, and the maximum gradient is approximately 1 in 80 for a short section, predominantly 1 in100 for much of the climb. </p> <p> The track can be a demanding drive, with the climb starting around the first bend, although varying in grade, the climb stops at the exit of the far end loop, before commencing the long descent back to the station. </p> <p> The intention is for the final run of the competition to be early afternoon on Sunday, leaving time for those travelling a long distance to have a comfortable journey home, also we will be passenger hauling for the public after the competition has come to an end. Visitors are welcome to participate in public running should they wish to, although spark arrestors will be required for those that do.</p> <p>With plenty for visitors to the 450 acre park to enjoy, it’s a great location to visit for all the family, regardless of whether or not you are entering. There is a leisure centre located within the park and a large, recently refurbished, children’s play area, a watersports centre etc. </p>"
	}
}';
