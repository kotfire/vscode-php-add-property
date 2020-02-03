<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    private $name;

    /**
     * Constructor.
     * @param  $name
     */
    public function __construct($name)
    {
        $this->name = $name;
    }
}
