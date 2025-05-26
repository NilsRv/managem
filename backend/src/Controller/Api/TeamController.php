<?php

namespace App\Controller\Api;

use App\Entity\Team;
use App\Repository\TeamRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\String\Slugger\SluggerInterface;

#[Route('/api/teams', name: 'api_teams_')]
class TeamController extends AbstractController
{
    #[Route('', name: 'list', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function list(TeamRepository $teams): JsonResponse
    {
        $user = $this->getUser();
        $myTeams = $teams->findTeamsByUser($user);

        $data = array_map(fn(Team $t) => [
            'id'        => $t->getId(),
            'name'      => $t->getName(),
            'slug'      => $t->getSlug(),
            'createdAt' => $t->getCreatedAt()->format(\DateTime::ATOM),
        ], $myTeams);

        return $this->json($data);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function create(
        Request $req,
        EntityManagerInterface $em,
        ValidatorInterface $validator,
        SluggerInterface $slugger
    ): JsonResponse {
        $payload = json_decode($req->getContent(), true);
        if (empty($payload['name'])) {
            return $this->json(['error' => 'Le nom est requis'], Response::HTTP_BAD_REQUEST);
        }

        $team = new Team();
        $team
            ->setName($payload['name'])
            ->setSlug(\strtolower($slugger->slug($payload['name'])))
            ->setOwner($this->getUser())
            ->addMember($this->getUser())
        ;

        $errors = $validator->validate($team);
        if (count($errors) > 0) {
            $errs = [];
            foreach ($errors as $e) {
                $errs[$e->getPropertyPath()] = $e->getMessage();
            }
            return $this->json(['errors' => $errs], Response::HTTP_BAD_REQUEST);
        }

        $em->persist($team);
        $em->flush();

        return $this->json([
            'id'        => $team->getId(),
            'name'      => $team->getName(),
            'slug'      => $team->getSlug(),
            'createdAt' => $team->getCreatedAt()->format(\DateTime::ATOM),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}/invite', name: 'invite', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function invite(
        int $id,
        Request $req,
        TeamRepository $teams,
        UserRepository $users,
        EntityManagerInterface $em
    ): JsonResponse {
        $team = $teams->find($id);
        if (!$team) {
            return $this->json(['error' => 'Équipe non trouvée'], Response::HTTP_NOT_FOUND);
        }

        if ($team->getOwner()->getId() !== $this->getUser()->getId()) {
            return $this->json(['error' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }

        $payload = json_decode($req->getContent(), true);
        $email = $payload['email'] ?? null;
        if (!$email) {
            return $this->json(['error' => 'Email requis'], Response::HTTP_BAD_REQUEST);
        }

        $user = $users->findOneBy(['email' => $email]);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        if ($team->getMembers()->contains($user)) {
            return $this->json(['message' => 'Utilisateur déjà membre'], Response::HTTP_OK);
        }

        $team->addMember($user);
        $em->flush();

        return $this->json(['message' => 'Invitation envoyée'], Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function update(
        int $id,
        Request $req,
        TeamRepository $teams,
        EntityManagerInterface $em,
        ValidatorInterface $validator,
        SluggerInterface $slugger
    ): JsonResponse {
        $team = $teams->find($id);
        if (!$team) {
            return $this->json(['error' => 'Équipe non trouvée'], Response::HTTP_NOT_FOUND);
        }

        if ($team->getOwner()->getUserIdentifier() !== $this->getUser()->getUserIdentifier()) {
            return $this->json(['error' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }

        $payload = json_decode($req->getContent(), true);
        $newName = $payload['name'] ?? null;

        if (!$newName) {
            return $this->json(['error' => 'Le nom est requis'], Response::HTTP_BAD_REQUEST);
        }

        $team->setName($newName);
        $team->setSlug(\strtolower($slugger->slug($newName)));

        $errors = $validator->validate($team);
        if (count($errors) > 0) {
            $errs = [];
            foreach ($errors as $e) {
                $errs[$e->getPropertyPath()] = $e->getMessage();
            }
            return $this->json(['errors' => $errs], Response::HTTP_BAD_REQUEST);
        }

        $em->flush();

        return $this->json([
            'id'        => $team->getId(),
            'name'      => $team->getName(),
            'slug'      => $team->getSlug(),
            'createdAt' => $team->getCreatedAt()->format(\DateTime::ATOM),
        ]);
    }



}
