import React, { useEffect, useState } from "react";
import { Tabs } from "@heroui/tabs";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";
import { useTeamStore } from "@/store/teamStore";
import { getTeamMembers, updateTeamName } from "@/api/team";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarDays, Home, Settings, Users } from "lucide-react";
import { User } from "@/types/user";
import { useAsyncList } from "@react-stately/data";

type TeamModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function TeamModal({ isOpen, onOpenChange }: TeamModalProps) {
  const [selected, setSelected] = useState(0);
  const [editedTeamName, setEditedTeamName] = useState("");
  const { teams, selectedTeam, fetchTeams, selectTeam } = useTeamStore();
  const [teamName, setTeamName] = useState("");
  const [slug, setSlug] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [members, setMembers] = useState<User[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const tabs = [
    { label: "General", icon: <Settings size={20} /> },
    { label: "Members", icon: <Users size={20} /> },
    { label: "Agenda", icon: <CalendarDays size={20} /> },
  ];

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  useEffect(() => {
    const team = teams.find((t) => t.id.toString() === selectedTeam);
    if (team) {
      setEditedTeamName(team.name || "");
      setSlug(team.slug || "");
      setCreatedAt(team.createdAt || "");
    }
  }, [selectedTeam, teams]);

  useEffect(() => {
    const fetchMembers = async () => {
      if (selected === 1 && selectedTeam) {
        setLoadingMembers(true);
        setMembersError(null);
        try {
          const data = await getTeamMembers(selectedTeam);
          setMembers(data);
        } catch (err: any) {
          setMembersError(err.message || "Erreur inconnue");
        } finally {
          setLoadingMembers(false);
        }
      }
    };

    fetchMembers();
  }, [selected, selectedTeam]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      //   backdrop="opaque"
      //   classNames={{
      //     backdrop:
      //       "bg-gradient-to-t from-zinc-100 to-transparent backdrop-blur-sm backdrop-opacity-30",
      //   }}
    >
      <ModalContent className="w-[1150px] max-w-[calc(100vw-100px)] h-[calc(100vh-100px)] max-h-[calc(100vh-100px) !my-0">
        {(onClose) => (
          <>
            {/* Corps principal en deux colonnes */}
            <div className="flex h-full">
              {/* Sidebar */}
              <div className="h-full bg-gray-50 border-r grow-0 shrink-0 w-60">
                <div className="px-2 flex flex-col space-y-1 h-full">
                  <div className="pt-4 pb-6 overflow-auto">
                    <div className="text-xs mb-px text-gray-600 font-semibold h-6 px-3 items-center flex">
                      Team
                    </div>
                    {tabs.map((tab, index) => (
                      <button
                        key={tab.label}
                        className={`my-px text-left w-full px-3 py-1 rounded text-sm leading-4 text-stone-800 flex items-center justify-between ${
                          selected === index ? "bg-gray-200 " : ""
                        }`}
                        onClick={() => setSelected(index)}
                      >
                        <div className="flex items-center">
                          <div className="mr-2">{tab.icon}</div>
                          <div
                            className={`${
                              selected === index ? "font-semibold" : ""
                            }`}
                          >
                            {tab.label}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contenu principal + footer */}
              <div className="flex-1 flex flex-col">
                <ModalHeader>
                  {selected === 0 && <>Général</>}
                  {selected === 1 && <>Members</>}
                  {selected === 2 && <>Agenda</>}
                </ModalHeader>
                {/* Body */}
                <ModalBody className="overflow-y-auto flex-1 px-6 py-4">
                  {selectedTeam && selected === 0 && (
                    <>
                      <div>
                        <label className="block text-sm font-medium">
                          Teamname
                        </label>
                        <Input
                          value={editedTeamName}
                          disabled={!selectedTeam}
                          onChange={(e) => setEditedTeamName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">
                          Slug
                        </label>
                        <Input value={slug} isDisabled />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">
                          Created at
                        </label>
                        <Input value={formattedDate} isDisabled />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">
                          Logo
                        </label>
                        <Input type="file" />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          color="danger"
                          variant="bordered"
                          className="hover:bg-rose-100"
                        >
                          Supprimer l'équipe
                        </Button>
                      </div>
                    </>
                  )}

                  {selected === 1 && (
                    <div>
                      {loadingMembers ? (
                        <p>Chargement des membres...</p>
                      ) : membersError ? (
                        <p className="text-red-600">{membersError}</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableColumn key="email" allowsSorting>
                              Email
                            </TableColumn>
                            <TableColumn key="role" allowsSorting>
                              Rôle
                            </TableColumn>
                          </TableHeader>

                          <TableBody isLoading={loadingMembers} items={members}>
                            {(member) => (
                              <TableRow key={member.id}>
                                {(columnKey) => (
                                  <TableCell>
                                    {columnKey === "email"
                                      ? member.email
                                      : columnKey === "role"
                                        ? member.roles.join(", ")
                                        : null}
                                  </TableCell>
                                )}
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  )}

                  {selected === 2 && <div>Agenda à afficher ici</div>}
                </ModalBody>

                {/* Footer aligné avec le body */}
                <ModalFooter className="justify-start px-6 ">
                  {selected === 0 && (
                    <Button
                      color="primary"
                      onPress={async () => {
                        const teamId = selectedTeam;
                        if (teamId && editedTeamName.trim()) {
                          await updateTeamName(teamId, editedTeamName.trim());
                          await fetchTeams();
                        }
                      }}
                    >
                      Sauvegarder
                    </Button>
                  )}
                </ModalFooter>
              </div>
            </div>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
