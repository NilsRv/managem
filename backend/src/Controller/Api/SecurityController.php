<?php
// src/Controller/Api/SecurityController.php
namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class SecurityController extends AbstractController
{
    #[Route(
        path: '/api/login',
        name: 'api_login',
        methods: ['POST']
    )]
    public function login(): void
    {
        // Ne devrait jamais être exécuté : 
        // le firewall json_login intercepte /api/login en amont.
        throw new \LogicException('Cette méthode ne doit pas être appelée, le security layer doit l’intercepter.');
    }
}
