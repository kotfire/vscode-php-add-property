<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    private $rank;

    public function __construct($rank)
    {
        $this->rank = $rank;
    }
}
