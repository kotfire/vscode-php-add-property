<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    private string $name;

    public function __construct(string $name)
    {
        $this->name = $name;
    }
}
