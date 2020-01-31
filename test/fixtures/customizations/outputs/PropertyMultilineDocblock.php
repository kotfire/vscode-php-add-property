<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    /**
     * @var 
     */
    private $name;

    public function __construct($name)
    {
        $this->name = $name;
    }
}
