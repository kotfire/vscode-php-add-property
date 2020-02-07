<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    public function stealth()
    {
        return new class {
            private $name;

            public function __construct($name)
            {
                $this->name = $name;
            }
        };
    }
}
