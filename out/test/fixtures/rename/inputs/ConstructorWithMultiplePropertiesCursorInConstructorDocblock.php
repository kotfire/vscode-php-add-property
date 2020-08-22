<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    /** @var string */
    private $name;

    /** @var Rank */
    private $rank;

    /**
     * @param $name string
     * @param $rank Rank
     */
    public function __construct($name, $rank)
    {
        $this->name = $name;
        $this->rank = $rank;
    }
}
