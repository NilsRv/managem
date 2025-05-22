<?php
namespace App\Controller\Api;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

#[Route('/api/register', name: 'api_register', methods: ['POST'])]
class RegisterController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface      $em,
        private UserPasswordHasherInterface $hasher,
        private ValidatorInterface          $validator,
        private JWTTokenManagerInterface    $jwtManager,
    ) {}

    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function __invoke(
        Request $request,
        UserRepository $userRepository,
        ValidatorInterface $validator,
        JWTTokenManagerInterface $jwtManager
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;

        if (!$email || !$password) {
            return $this->json(['errors' => ['Email et mot de passe requis']], 400);
        }

        if ($userRepository->findOneBy(['email' => $email])) {
            return $this->json(['errors' => ['Un compte avec cet email existe déjà']], 409);
        }

        $user = new User();
        $user->setEmail($email);
        $user->setPassword($this->hasher->hashPassword($user, $password));

        $errors = $validator->validate($user);
        if (count($errors) > 0) {
            return $this->json(['errors' => [(string) $errors]], 400);
        }

        $this->em->persist($user);
        $this->em->flush();

        $token = $jwtManager->create($user);

        return $this->json(['token' => $token], 201);
    }
}

