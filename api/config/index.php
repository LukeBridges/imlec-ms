<?php

namespace api\config;

require '../../vendor/autoload.php';
require '../../utils/web/Cors.php';
require '../../utils/xlsx/XlsxReader.php';

use utils\web\Cors;

Cors::SendHeaders();

header('Content-Type: application/json');

echo
'{
	"primaryColour": "#3f51b5",
	"features": {
		"applicationForm": false,
		"scoreboard": true,
		"listings": true,
		"fullListings": true,
		"rules": true
	}
}';
