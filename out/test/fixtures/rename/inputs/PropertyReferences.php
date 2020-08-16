<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    private $name;

    public function __construct()
    {
        $this->name = "Yoda";
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getFormattedName(): string
    {
        $title = self::getTitle($this->name);

        return "{$title} {$this->name}";
    }

    public function setName(string $name)
    {
        $this->name = $name;
    }

    public static function getTitle(string $name): string
    {
        return $name === "Yoda" ? "Master" : "";
    }
}
