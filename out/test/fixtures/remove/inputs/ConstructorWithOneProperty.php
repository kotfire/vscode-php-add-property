<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    private $initialized = false;

    private $name;

    public function __construct($name)
    {
        $this->name = $name;
        $this->initialized = true;
    }
}
