<?php

namespace Blah;

class TraitUsageResolver
{
    /**
     * @var string
     */
    private $prop1;

    private $name;

    public function __construct($name)
    {
        $this->name = $name;
    }

    public function foo()
    {
        return new class {
            public function __construct()
            {
            }
        };
    }
}
