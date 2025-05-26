<?php

namespace App\Repository;

use App\Entity\Team;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use App\Entity\User;

/**
 * @extends ServiceEntityRepository<Team>
 */
class TeamRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Team::class);
    }

    public function findTeamsByUser(User $user): array
    {
        return $this->createQueryBuilder('t')
            ->innerJoin('t.teamMembers', 'tm')
            ->where('tm.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();
    }
}
