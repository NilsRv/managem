<?php
namespace App\Controller\Api;

use App\Entity\Booking;
use App\Entity\ScrimPost;
use App\Entity\Team;
use App\Repository\ScrimPostRepository;
use App\Repository\TeamRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class BookingController extends AbstractController
{
    #[Route('/api/book-scrim/{id}', name: 'book_scrim', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function bookScrim(
        int $id,
        Request $request,
        ScrimPostRepository $scrimPostRepo,
        TeamRepository $teamRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $user = $this->getUser();

        // 1. Trouver le ScrimPost
        $scrimPost = $scrimPostRepo->find($id);
        if (!$scrimPost) {
            return $this->json(['error' => 'Scrim post not found'], 404);
        }

        // 2. Trouver l'équipe du user (par exemple en tant que propriétaire)
        $data = json_decode($request->getContent(), true);
        $teamId = $data['teamId'] ?? null;

        if (!$teamId) {
            return $this->json(['error' => 'teamId is required'], 400);
        }

        $team = $teamRepo->find($teamId);
        if (!$team) {
            return $this->json(['error' => 'Team not found'], 404);
        }

        // Optionnel : vérifier que le user est bien membre de l'équipe
        if (!$team->getMembers()->contains($user)) {
            return $this->json(['error' => 'You are not a member of this team'], 403);
        }

        // 3. Vérifier qu'on ne booke pas notre propre scrim
        if ($scrimPost->getTeam()->getId() === $team->getId()) {
            return $this->json(['error' => 'You cannot book your own scrim'], 400);
        }

        // 4. Créer et persister le Booking
        $booking = new Booking();
        $booking->setTeam($team);
        $booking->setScrimPost($scrimPost);
        $booking->setStatus('pending'); // ou 'requested'

        $em->persist($booking);
        $em->flush();

        return $this->json([
            'message' => 'Scrim booked successfully',
            'booking_id' => $booking->getId()
        ]);
    }
}
