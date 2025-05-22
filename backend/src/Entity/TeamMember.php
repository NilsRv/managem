<?php
// src/Entity/TeamMember.php

namespace App\Entity;

use App\Repository\TeamMemberRepository;
use Doctrine\ORM\Mapping as ORM;
use App\Entity\Team;
use App\Entity\User;

#[ORM\Entity(repositoryClass: TeamMemberRepository::class)]
#[ORM\Table(name: 'team_member')]
#[ORM\UniqueConstraint(name: 'team_user_unique', columns: ['team_id', 'user_id'])]
class TeamMember
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Team::class, inversedBy: 'teamMembers')]
    #[ORM\JoinColumn(nullable: false, name: 'team_id', referencedColumnName: 'id')]
    private ?Team $team = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'teamMembers')]
    #[ORM\JoinColumn(nullable: false, name: 'user_id', referencedColumnName: 'id')]
    private ?User $user = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private ?\DateTimeImmutable $joinedAt = null;

    public function __construct()
    {
        $this->joinedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTeam(): ?Team
    {
        return $this->team;
    }

    public function setTeam(?Team $team): static
    {
        $this->team = $team;
        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(User $user): static
    {
        $this->user = $user;
        return $this;
    }

    public function getJoinedAt(): ?\DateTimeImmutable
    {
        return $this->joinedAt;
    }

    public function setJoinedAt(\DateTimeImmutable $joinedAt): static
    {
        $this->joinedAt = $joinedAt;
        return $this;
    }
}
