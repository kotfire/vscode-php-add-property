<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    private $class;

    private $name;

    /**
     * @param mixed $class
     * @param string $name
     */
    public function __construct($class, string $name)
    {
        $this->class = $class;
        $this->name = $name;
    }
}
