<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    private $class;

    private $name;

    private $rank;

    /**
     * @param mixed $class 
     * @param string $name 
     * @param mixed $rank
     */
    public function __construct($class, string $name, $rank)
    {
        $this->class = $class;
        $this->name = $name;
        $this->rank = $rank;
    }
}
