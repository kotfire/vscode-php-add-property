<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    /** @var string */
    private $class;

    /** @var Name */
    private $name;

    public function __construct(string $class, Name $name)
    {
        $this->class = $class;
        $this->name = $name;
    }
}
