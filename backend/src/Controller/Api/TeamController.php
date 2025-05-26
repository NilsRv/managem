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
use App\Repository\TeamInvitationRepository;
use App\Entity\TeamInvitation;

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
        TeamInvitationRepository $invitationRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $team = $teams->find($id);
        if (!$team) {
            return $this->json(['error' => 'Equipe non trouvée'], Response::HTTP_NOT_FOUND);
        }

        if ($team->getOwner()->getId() !== $this->getUser()->getId()) {
            return $this->json(['error' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }

        $payload = json_decode($req->getContent(), true);
        $userId = $payload['userId'] ?? null;
        if (!$userId) {
            return $this->json(['error' => 'userId requis'], Response::HTTP_BAD_REQUEST);
        }

        $user = $users->find($userId);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        if ($team->getMembers()->contains($user)) {
            return $this->json(['message' => 'Utilisateur déjà membre'], Response::HTTP_OK);
        }

        $existingInvitation = $invitationRepo->findOneBy([
            'team' => $team,
            'invitedUser' => $user,
            'status' => 'pending',
        ]);

        if ($existingInvitation) {
            return $this->json(['message' => 'Invitation déjà envoyée'], Response::HTTP_OK);
        }

        $invitation = new TeamInvitation();
        $invitation->setTeam($team);
        $invitation->setInvitedUser($user);
        $invitation->setStatus('pending');
        $em->persist($invitation);
        $em->flush();

        return $this->json(['message' => 'Invitation envoyée'], Response::HTTP_OK);
    }

    #[Route('/{id}/invite', name: 'invite_respond', methods: ['PATCH'])]
    #[IsGranted('ROLE_USER')]
    public function respondInvitation(
        int $id,
        Request $request,
        TeamInvitationRepository $invitationRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $invitation = $invitationRepo->find($id);
        if (!$invitation) {
            return $this->json(['error' => 'Invitation non trouvée'], Response::HTTP_NOT_FOUND);
        }

        if ($invitation->getInvitedUser()->getId() !== $this->getUser()->getId()) {
            return $this->json(['error' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }

        if ($invitation->getStatus() !== 'pending') {
            return $this->json(['message' => 'Invitation déjà traitée'], Response::HTTP_BAD_REQUEST);
        }

        $data = json_decode($request->getContent(), true);
        $action = $data['action'] ?? null;

        if (!in_array($action, ['accept', 'reject'])) {
            return $this->json(['error' => 'Action invalide. Utilisez accept ou reject'], Response::HTTP_BAD_REQUEST);
        }

        if ($action === 'accept') {
            $team = $invitation->getTeam();
            $team->addMember($this->getUser());
            $invitation->setStatus('accepted');
        } else {
            $invitation->setStatus('rejected');
        }

        $em->flush();

        return $this->json([
            'message' => 'Invitation ' . ($action === 'accept' ? 'acceptée' : 'refusée') . ' avec succès'
        ]);
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

    #[Route('/{id}', name: 'delete', methods:['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function delete (
        int $id, 
        TeamRepository $teams,
        EntityManagerInterface $em
    ): JsonResponse {
        $team = $teams->find($id);
        if (!$team) {
            return $this->json(['error' => 'Equipe non trouvée'], Response::HTTP_NOT_FOUND);
        }

        if ($team->getOwner()->getId() !== $this->getUser()->getId()) {
            return $this->json(['error' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }

        if ($team->isDeleted()) {
            return $this->json(['message' => 'Équipe déjà supprimée'], Response::HTTP_OK);
        }

        $team->setDeletedAt(new \DateTimeImmutable());
        $em->flush();

        return $this->json(['message' => 'Équipe supprimée avec succès'], Response::HTTP_OK);
    }

    #[Route('/{id}/restore', name: 'restore', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function restore(int $id, TeamRepository $teams, EntityManagerInterface $em): JsonResponse
    {
        $team = $teams->find($id);
        if (!$team || !$team->isDeleted()) {
            return $this->json(['error' => 'Équipe non trouvée ou déjà active'], Response::HTTP_BAD_REQUEST);
        }

        if ($team->getOwner()->getId() !== $this->getUser()->getId()) {
            return $this->json(['error' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }

        $team->setDeletedAt(null);
        $em->flush();

        return $this->json(['message' => 'Équipe restaurée avec succès']);
    }

}
