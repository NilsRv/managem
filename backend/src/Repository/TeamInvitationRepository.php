<?php

namespace App\Repository;

use App\Entity\TeamInvitation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class TeamInvitationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TeamInvitation::class);
    }
    
    public function findPendingInvitationsForUser(int $userId): array
    {
        return $this->createQueryBuilder('i')
            ->andWhere('i.invitedUser = :userId')
            ->andWhere('i.status = :status')
            ->setParameter('userId', $userId)
            ->setParameter('status', 'pending')
            ->getQuery()
            ->getResult();
    }
}
