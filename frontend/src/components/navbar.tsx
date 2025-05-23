import React, { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Select, SelectItem } from "@heroui/select";
import { Avatar } from "@heroui/avatar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@heroui/dropdown";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { SearchIcon } from "@/components/icons";
import { Logo } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";
import { Team } from "@/types/team";
import { getMyTeams, createTeam, updateTeamName } from "@/api/team";
import { useTeamStore } from "@/store/teamStore";
import { ThemeSwitch } from "./theme-switch";

export const Navbar = () => {
  const { getUserEmail } = useAuth();
  const userEmail = getUserEmail();
  const { teams, selectedTeam, fetchTeams, selectTeam } = useTeamStore();
  const [newTeamName, setNewTeamName] = useState("");
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedTeamName, setEditedTeamName] = useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isTeamModalOpen,
    onOpen: openTeamModal,
    onOpenChange: onTeamModalChange,
  } = useDisclosure();

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    const created = await createTeam(newTeamName);
    if (created) {
      await fetchTeams();
      setNewTeamName("");
    }
  };

  const searchInput = (
    <Input
      aria-label="Search"
      placeholder="Rechercher..."
      type="search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
    />
  );

  const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      >
        <path d="M6 12h12" />
        <path d="M12 18V6" />
      </g>
    </svg>
  );

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      {/* Brand */}
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link className="flex items-center gap-1" color="foreground" href="/">
            <Logo />
            <p className="font-bold text-inherit">Mana Gemm</p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* Team Selector & Avatar */}
      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <ThemeSwitch />
        {/* Team Selector intégré dans un Dropdown */}
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button variant="bordered" size="sm">
              {teams.find((t) => t.id.toString() === selectedTeam)?.name ??
                "Choisir une équipe"}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            disabledKeys={["__header__"]}
            disallowEmptySelection
            selectedKeys={selectedTeam?.toString()}
            selectionMode="single"
            variant="flat"
            aria-label="Team Selector"
            onAction={(key) => {
              if (key === "__create__") onOpen();
              else if (key === "__teamModal__") openTeamModal();
              else if (typeof key === "string") selectTeam(key);
            }}
            className="min-w-[200px]"
          >
            <DropdownSection showDivider aria-label="Équipe sélectionnée">
              <DropdownItem
                key="__header__"
                isReadOnly
                className="gap-2 opacity-100"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-foreground">
                    {teams.find((t) => t.id.toString() === selectedTeam)
                      ?.name ?? "Équipe inconnue"}
                  </span>
                </div>
              </DropdownItem>
              <DropdownItem
                key="__teamModal__"
                className="text-primary font-medium"
              >
                Voir les détails
              </DropdownItem>
            </DropdownSection>

            {/* --- Body section --- */}
            <DropdownSection showDivider aria-label="Mes équipes">
              {teams.length > 0 ? (
                teams.map((team) => (
                  <DropdownItem key={team.id} className="capitalize">
                    {team.name}
                  </DropdownItem>
                ))
              ) : (
                <DropdownItem
                  key="__no_teams__"
                  isReadOnly
                  className="italic text-default-500"
                >
                  Aucune équipe disponible
                </DropdownItem>
              )}
            </DropdownSection>

            {/* --- Footer section --- */}
            <DropdownSection aria-label="Actions">
              <DropdownItem
                key="__create__"
                className="text-primary font-medium"
                endContent={<PlusIcon />}
              >
                Créer une équipe
              </DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>

        {/* User dropdown */}
        <NavbarItem className="hidden md:flex">
          {userEmail ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  as="button"
                  name={userEmail[0].toUpperCase()}
                  size="sm"
                  color="primary"
                  className="transition-transform"
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="User Menu" variant="flat">
                <DropdownItem key="email" className="font-semibold">
                  {userEmail}
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  color="danger"
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                  }}
                >
                  Déconnexion
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <Link href="/login" className="text-sm text-default-500">
              Se connecter
            </Link>
          )}
        </NavbarItem>
      </NavbarContent>

      {/* Modal création d’équipe */}
      <Modal backdrop="blur" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Créer une nouvelle équipe</ModalHeader>
              <ModalBody>
                {selectedTeam ? (
                  <>
                    {editMode ? (
                      <Input
                        label="Nom de l'équipe"
                        value={editedTeamName}
                        onChange={(e) => setEditedTeamName(e.target.value)}
                      />
                    ) : (
                      <>
                        <p className="font-semibold">
                          {
                            teams.find((t) => t.id.toString() === selectedTeam)
                              ?.name
                          }
                        </p>
                        <p className="text-sm text-default-500 mt-2">
                          ID: {selectedTeam}
                        </p>
                      </>
                    )}
                  </>
                ) : (
                  <p>Chargement...</p>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Fermer
                </Button>
                {editMode ? (
                  <Button
                    color="primary"
                    onPress={async () => {
                      const teamId = selectedTeam;
                      if (teamId && editedTeamName.trim()) {
                        await updateTeamName(teamId, editedTeamName.trim());
                        await fetchTeams();
                        setEditMode(false);
                      }
                    }}
                  >
                    Enregistrer
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    onPress={() => {
                      const team = teams.find(
                        (t) => t.id.toString() === selectedTeam
                      );
                      if (team) setEditedTeamName(team.name);
                      setEditMode(true);
                    }}
                  >
                    Modifier
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        backdrop="blur"
        isOpen={isTeamModalOpen}
        onOpenChange={onTeamModalChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Détails de l’équipe</ModalHeader>
              <ModalBody>
                {selectedTeam ? (
                  <>
                    {editMode ? (
                      <Input
                        label="Nom de l'équipe"
                        value={editedTeamName}
                        onChange={(e) => setEditedTeamName(e.target.value)}
                      />
                    ) : (
                      <>
                        <p className="font-semibold">
                          {
                            teams.find((t) => t.id.toString() === selectedTeam)
                              ?.name
                          }
                        </p>
                      </>
                    )}
                  </>
                ) : (
                  <p>Chargement...</p>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Fermer
                </Button>
                {editMode ? (
                  <Button
                    color="primary"
                    onPress={async () => {
                      const teamId = selectedTeam;
                      if (teamId && editedTeamName.trim()) {
                        await updateTeamName(teamId, editedTeamName.trim());
                        await fetchTeams();
                        setEditMode(false);
                      }
                    }}
                  >
                    Enregistrer
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    onPress={() => {
                      const team = teams.find(
                        (t) => t.id.toString() === selectedTeam
                      );
                      if (team) setEditedTeamName(team.name);
                      setEditMode(true);
                    }}
                  >
                    Modifier
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Menu mobile */}
      <NavbarMenu>
        {searchInput}
        {/* Ajoute ici les éléments de menu si besoin */}
      </NavbarMenu>
    </HeroUINavbar>
  );
};
