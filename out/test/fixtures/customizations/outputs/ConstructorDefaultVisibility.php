<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    private $name;

    private function __construct($name)
    {
        $this->name = $name;
    }
}
