<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    public $name;

    public function __construct($name)
    {
        $this->name = $name;
    }
}
