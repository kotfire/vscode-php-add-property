<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    private string $name2, $newName;

    public function __construct($newName)
    {
        $this->newName = $newName;
    }
}
