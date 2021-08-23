<?php

namespace api\scores;

require '../../vendor/autoload.php';
require '../../utils/web/Cors.php';
require '../../utils/xlsx/XlsxReader.php';

use utils\web\Cors;
use utils\xlsx\XlsxReader;

Cors::SendHeaders();

header('Content-Type: application/json');

try {
    echo \json_encode(XlsxReader::getContents('../../data/Entries.xlsx'));
} catch (\Exception $e) {
    echo \json_encode([]);
}
