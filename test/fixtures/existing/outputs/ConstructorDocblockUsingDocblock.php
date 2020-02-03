<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    /** @var string */
    private $name;

    /**
     * Constructor.
     * @param string $name
     */
    public function __construct(string $name)
    {
        $this->name = $name;
    }
}
