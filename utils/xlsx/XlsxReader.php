<?php

namespace utils\xlsx;

require '../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Reader;

class XlsxReader
{
    /**
     * @param $fileName
     * @param string $from
     * @return array
     * @throws \Exception
     */
    public static function getContents($fileName, $from = 'A2'): array
    {
        if (!$fileName) {
            throw new \Exception('No filename');
        }

        $spreadsheet = (new Reader\Xlsx())->load($fileName);
        $worksheet = $spreadsheet->getActiveSheet();
        $lastRow = $worksheet->getHighestDataRow('A');
        $lastColumn = $worksheet->getHighestColumn();

        return array_values($worksheet->rangeToArray($from . ':' . $lastColumn . $lastRow, null, true, true, true));
    }
}
