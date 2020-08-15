<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    private $newName;

    public function __construct($newName)
    {
        $this->newName = $newName;
    }
}
