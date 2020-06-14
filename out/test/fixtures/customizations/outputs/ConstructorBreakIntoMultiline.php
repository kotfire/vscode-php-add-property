<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
    private $rank;

    private $lightSaberColor;

    private $class;

    private $isCouncilMember;

    private $isHighCouncilMember;

    private $occupation;

    private $name;

    public function __construct(
        $rank,
        $lightSaberColor,
        $class,
        $isCouncilMember,
        $isHighCouncilMember,
        $occupation,
        $name
    ) {
        $this->rank = $rank;
        $this->lightSaberColor = $lightSaberColor;
        $this->class = $class;
        $this->isCouncilMember = $isCouncilMember;
        $this->isHighCouncilMember = $isHighCouncilMember;
        $this->occupation = $occupation;
        $this->name = $name;
    }
}
