<?php

namespace App\Entity;

use App\Repository\ScrimPostRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ScrimPostRepository::class)]
class ScrimPost
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'scrimPosts')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Team $team = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private ?\DateTimeImmutable $dateTime = null;

    #[ORM\Column(length: 255)]
    private ?string $format = null;

    #[ORM\Column(length: 255)]
    private ?string $region = null;

    #[ORM\Column]
    private ?int $rank = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $status = 'open';

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    /**
     * @var Collection<int, Booking>
     */
    #[ORM\OneToMany(targetEntity: Booking::class, mappedBy: 'ScrimPost')]
    private Collection $bookings;

    public function __construct()
    {
        $this->bookings = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
        $this->status = 'open';
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

    public function getDateTime(): ?\DateTimeImmutable
    {
        return $this->dateTime;
    }

    public function setDateTime(\DateTimeInterface $dateTime): static
    {
        $this->dateTime = \DateTimeImmutable::createFromInterface($dateTime);
        return $this;
    }

    public function getFormat(): ?string
    {
        return $this->format;
    }

    public function setFormat(string $format): static
    {
        $this->format = $format;

        return $this;
    }

    public function getRegion(): ?string
    {
        return $this->region;
    }

    public function setRegion(string $region): static
    {
        $this->region = $region;

        return $this;
    }

    public function getRank(): ?int
    {
        return $this->rank;
    }

    public function setRank(int $rank): static
    {
        $this->rank = $rank;

        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTime $createdAt): static
    {
        $this->createdAt = $createdAt;

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
            $booking->setScrimPost($this);
        }

        return $this;
    }

    public function removeBooking(Booking $booking): static
    {
        if ($this->bookings->removeElement($booking)) {
            // set the owning side to null (unless already changed)
            if ($booking->getScrimPost() === $this) {
                $booking->setScrimPost(null);
            }
        }

        return $this;
    }
    public function getUser(): ?User
    {
        return $this->user;
    }
    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }
}
