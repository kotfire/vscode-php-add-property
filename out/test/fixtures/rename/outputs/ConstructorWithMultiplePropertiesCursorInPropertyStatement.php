<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    private $class;

    private $newName;

    private $rank;

    public function __construct($class, string $newName, $rank)
    {
        $this->class = $class;
        $this->newName = $newName;
        $this->rank = $rank;
    }
}
