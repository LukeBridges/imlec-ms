<?php

namespace utils\web;

class Cors
{
    static function SendHeaders()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST');
        header("Access-Control-Allow-Headers: *");
    }
}
