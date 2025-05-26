<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250526174333 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE team_invitations (id SERIAL NOT NULL, team_id INT NOT NULL, invited_user_id INT NOT NULL, status VARCHAR(20) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_C817FFE3296CD8AE ON team_invitations (team_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_C817FFE3C58DAD6E ON team_invitations (invited_user_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE team_invitations ADD CONSTRAINT FK_C817FFE3296CD8AE FOREIGN KEY (team_id) REFERENCES team (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE team_invitations ADD CONSTRAINT FK_C817FFE3C58DAD6E FOREIGN KEY (invited_user_id) REFERENCES "user" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE SCHEMA public
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE team_invitations DROP CONSTRAINT FK_C817FFE3296CD8AE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE team_invitations DROP CONSTRAINT FK_C817FFE3C58DAD6E
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE team_invitations
        SQL);
    }
}
