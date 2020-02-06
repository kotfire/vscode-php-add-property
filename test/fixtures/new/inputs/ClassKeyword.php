<?php

namespace Blah;

class TraitUsageResolver
{
    /**
     * @var string
     */
    private $prop1;

    public function foo()
    {
        return new class {
            public function __construct()
            {
            }
        };
    }
}
