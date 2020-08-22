<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    /** @var string */
    private $newName;

    /** @var Rank */
    private $rank;

    /**
     * @param $newName string
     * @param $rank Rank
     */
    public function __construct($newName, $rank)
    {
        $this->newName = $newName;
        $this->rank = $rank;
    }
}
