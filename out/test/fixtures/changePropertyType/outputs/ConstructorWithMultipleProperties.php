<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    private $class;

    private $name;

    private $rank;

    public function __construct($class, Name $name, $rank)
    {
        $this->class = $class;
        $this->name = $name;
        $this->rank = $rank;
    }
}
