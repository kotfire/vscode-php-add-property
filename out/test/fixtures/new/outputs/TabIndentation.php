<?php
declare(strict_types=1);

namespace StarWars;

class Jedi
{
	private $rank;

	private $name;

	public function __construct($rank, $name)
	{
		$this->rank = $rank;
		$this->name = $name;
	}
}
