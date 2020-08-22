<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    /** @var Name */
    private $name;

    public function __construct(Name $name)
    {
        $this->name = $name;
    }
}
