<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    private $class;

    private $rank;

    /**
     * @param mixed $class
     * @param mixed $rank
     */
    public function __construct($class, $rank)
    {
        $this->class = $class;
        $this->rank = $rank;
    }
}
