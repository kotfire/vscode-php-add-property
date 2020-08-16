<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    private $class;

    public function __construct($class)
    {
        $this->class = $class;
    }
}
