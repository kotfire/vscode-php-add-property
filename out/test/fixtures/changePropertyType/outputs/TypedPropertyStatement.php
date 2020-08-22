<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    private Name $name;

    public function __construct(Name $name)
    {
        $this->name = $name;
    }
}
