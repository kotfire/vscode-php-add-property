<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    private $newName;

    public function __construct()
    {
        $this->newName = "Yoda";
    }

    public function getName(): string
    {
        return $this->newName;
    }

    public function getFormattedName(): string
    {
        $title = self::getTitle($this->newName);

        return "{$title} {$this->newName}";
    }

    public function setName(string $name)
    {
        $this->newName = $name;
    }

    public static function getTitle(string $name): string
    {
        return $name === "Yoda" ? "Master" : "";
    }
}
