<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    private $name;

    private $rank;

    public function __construct(string $name, $rank)
    {
        $this->name = $name;
        $this->rank = $rank;
    }
}
