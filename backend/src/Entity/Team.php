<?php

namespace App\Entity;

use App\Repository\TeamRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use App\Entity\User;
use App\Entity\TeamMember;
use App\Entity\ScrimPost;
use App\Entity\Booking;

#[ORM\Entity(repositoryClass: TeamRepository::class)]
class Team
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(length: 255, unique: true)]
    private ?string $slug = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $deletedAt = null;

    /**
     * @var Collection<int, TeamMember>
     */
    #[ORM\OneToMany(mappedBy: 'team', targetEntity: TeamMember::class, cascade: ['persist'], orphanRemoval: true)]
    private Collection $teamMembers;

    /**
     * @var Collection<int, ScrimPost>
     */
    #[ORM\OneToMany(mappedBy: 'team', targetEntity: ScrimPost::class)]
    private Collection $scrimPosts;

    /**
     * @var Collection<int, Booking>
     */
    #[ORM\OneToMany(mappedBy: 'team', targetEntity: Booking::class)]
    private Collection $bookings;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'ownedTeams')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $owner = null;

    public function __construct()
    {
        $this->teamMembers = new ArrayCollection();
        $this->scrimPosts  = new ArrayCollection();
        $this->bookings    = new ArrayCollection();
        $this->createdAt   = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): static
    {
        $this->slug = $slug;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getDeletedAt(): ?\DateTimeInterface
    {
        return $this->deletedAt;
    }
    
    public function setDeletedAt(?\DateTimeInterface $deletedAt): self
    {
        $this->deletedAt = $deletedAt;
        return $this;
    }

    public function isDeleted(): bool
    {
        return $this->deletedAt !== null;
    }


    /**
     * @return Collection<int, TeamMember>
     */
    public function getTeamMembers(): Collection
    {
        return $this->teamMembers;
    }

    public function addTeamMember(TeamMember $teamMember): static
    {
        if (!$this->teamMembers->contains($teamMember)) {
            $this->teamMembers->add($teamMember);
            $teamMember->setTeam($this);
        }
        return $this;
    }

    public function removeTeamMember(TeamMember $teamMember): static
    {
        if ($this->teamMembers->removeElement($teamMember)) {
            if ($teamMember->getTeam() === $this) {
                $teamMember->setTeam(null);
            }
        }
        return $this;
    }

    /**
     * Ajoute directement un User en tant que membre (convenience method).
     */
    public function addMember(User $user): static
    {
        $teamMember = new TeamMember();
        $teamMember
            ->setUser($user)
            ->setTeam($this)
        ;
        return $this->addTeamMember($teamMember);
    }

    /**
     * @return Collection<int, User>
     */
    public function getMembers(): Collection
    {
        return $this->teamMembers->map(fn(TeamMember $tm) => $tm->getUser());
    }

    /**
     * @return Collection<int, ScrimPost>
     */
    public function getScrimPosts(): Collection
    {
        return $this->scrimPosts;
    }

    public function addScrimPost(ScrimPost $scrimPost): static
    {
        if (!$this->scrimPosts->contains($scrimPost)) {
            $this->scrimPosts->add($scrimPost);
            $scrimPost->setTeam($this);
        }
        return $this;
    }

    public function removeScrimPost(ScrimPost $scrimPost): static
    {
        if ($this->scrimPosts->removeElement($scrimPost)) {
            if ($scrimPost->getTeam() === $this) {
                $scrimPost->setTeam(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Booking>
     */
    public function getBookings(): Collection
    {
        return $this->bookings;
    }

    public function addBooking(Booking $booking): static
    {
        if (!$this->bookings->contains($booking)) {
            $this->bookings->add($booking);
            $booking->setTeam($this);
        }
        return $this;
    }

    public function removeBooking(Booking $booking): static
    {
        if ($this->bookings->removeElement($booking)) {
            if ($booking->getTeam() === $this) {
                $booking->setTeam(null);
            }
        }
        return $this;
    }

    public function getOwner(): ?User
    {
        return $this->owner;
    }

    public function setOwner(User $owner): static
    {
        $this->owner = $owner;
        return $this;
    }
}
