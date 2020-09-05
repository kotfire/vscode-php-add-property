<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    /** @var string|null */
    private $name;

    public function __construct(?string $name)
    {
        $this->name = $name;
    }
}
