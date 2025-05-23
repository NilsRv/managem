<?php
namespace App\Controller\Api;

use App\Entity\ScrimPost;
use App\Repository\TeamRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/scrims', name: 'api_scrims_')]
class ScrimController extends AbstractController
{
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $scrimRepository = $em->getRepository(ScrimPost::class);

        // On récupère tous les scrims (ou ajouter un tri par dateTime par ex)
        $scrims = $scrimRepository->findBy([], ['dateTime' => 'ASC']);

        // On formate la réponse au format JSON
        $result = array_map(function (ScrimPost $scrim) {
            return [
                'id' => $scrim->getId(),
                'team' => $scrim->getTeam()->getName(),
                'format' => $scrim->getFormat(),
                'region' => $scrim->getRegion(),
                'rank' => $scrim->getRank(),
                // On extrait l'heure en "HH:mm" depuis la DateTime
                'time' => $scrim->getDateTime()->format('H:i'),
                'date' => $scrim->getDateTime()->format('Y-m-d'),
                'status' => $scrim->getStatus(),
                'createdAt' => $scrim->getCreatedAt()->format(\DateTime::ATOM),
            ];
        }, $scrims);

        return $this->json($result);
    }

    #[Route('/create', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function create(
        Request $req,
        TeamRepository $teams,
        EntityManagerInterface $em,
        ValidatorInterface $validator
    ): JsonResponse {
        $payload = json_decode($req->getContent(), true);

        // Champs obligatoires
        $requiredFields = ['teamId', 'format', 'date', 'time', 'region', 'rank'];
        foreach ($requiredFields as $field) {
            if (empty($payload[$field])) {
                return $this->json(['error' => "Le champ '$field' est requis"], Response::HTTP_BAD_REQUEST);
            }
        }

        // Recherche de l'équipe
        $team = $teams->find($payload['teamId']);
        if (!$team) {
            return $this->json(['error' => 'Équipe non trouvée'], Response::HTTP_NOT_FOUND);
        }

        $user = $this->getUser();

        // Vérifier que l'utilisateur est membre ou propriétaire de l'équipe
        if (
            !$team->getMembers()->contains($user)
            && $team->getOwner()->getId() !== $user->getId()
        ) {
            return $this->json(['error' => 'Accès refusé : vous devez être membre ou propriétaire de l’équipe'], Response::HTTP_FORBIDDEN);
        }

        // Construction de la date et heure du scrim
        try {
            $dateTime = new \DateTimeImmutable($payload['date'] . ' ' . $payload['time']);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Date ou heure invalide'], Response::HTTP_BAD_REQUEST);
        }

        // Création du ScrimPost
        $scrimPost = new ScrimPost();
        $scrimPost
            ->setTeam($team)
            ->setUser($user)
            ->setFormat($payload['format'])
            ->setRegion($payload['region'])
            ->setRank((int) $payload['rank'])
            ->setDateTime($dateTime);

        // Validation Symfony
        $errors = $validator->validate($scrimPost);
        if (count($errors) > 0) {
            $errs = [];
            foreach ($errors as $error) {
                $errs[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json(['errors' => $errs], Response::HTTP_BAD_REQUEST);
        }

        // Persister et flush
        $em->persist($scrimPost);
        $em->flush();

        return $this->json([
            'id' => $scrimPost->getId(),
            'team' => [
                'id' => $team->getId(),
                'name' => $team->getName(),
            ],
            'format' => $scrimPost->getFormat(),
            'region' => $scrimPost->getRegion(),
            'rank' => $scrimPost->getRank(),
            'dateTime' => $scrimPost->getDateTime()->format(\DateTime::ATOM),
            'status' => $scrimPost->getStatus(),
            'createdAt' => $scrimPost->getCreatedAt()->format(\DateTime::ATOM),
        ], Response::HTTP_CREATED);
    }
}