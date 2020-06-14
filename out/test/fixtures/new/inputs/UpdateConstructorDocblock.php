<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    private $rank;

    /**
     * @param $rank Rank
     */
    public function __construct($rank)
    {
        $this->rank = $rank;
    }
}
