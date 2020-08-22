<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    /** @var string */
    private $class;

    /** @var string */
    private $name;

    public function __construct(string $class, string $name)
    {
        $this->class = $class;
        $this->name = $name;
    }
}
