import { CalendarDays, Trophy, User, Users } from "lucide-react";
import { useState } from "react";
import styled from "styled-components";

import SectionHeading from "../../components/reusable/SectionHeading";
import { TranslationKey, t } from "../../i18n";
import { useAppSelector } from "../../store/hooks";
import MatchesAdmin from "./sections/MatchesAdmin";
import PlayersAdmin from "./sections/PlayersAdmin";
import SeasonsAdmin from "./sections/SeasonsAdmin";
import TeamsAdmin from "./sections/TeamsAdmin";

const Tabs = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 6px;
  margin-bottom: 24px;
  width: fit-content;
`;

const TabButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  cursor: pointer;
  padding: 10px 18px;
  border-radius: 12px;
  font-family: "Sora", sans-serif;
  font-size: 0.87rem;
  font-weight: 600;
  transition: all 0.15s ease;
  background: ${({ $active }) =>
    $active ? "var(--accent)" : "transparent"};
  color: ${({ $active }) =>
    $active ? "var(--accent-contrast)" : "var(--text-secondary)"};

  &:hover {
    color: ${({ $active }) =>
      $active ? "var(--accent-contrast)" : "var(--text-primary)"};
  }
`;

type AdminTab = "matches" | "teams" | "players" | "seasons";

const TABS: { key: AdminTab; label: TranslationKey; icon: typeof Users }[] = [
  { key: "matches", label: "admin.tabMatches", icon: CalendarDays },
  { key: "teams", label: "admin.tabTeams", icon: Users },
  { key: "players", label: "admin.tabPlayers", icon: User },
  { key: "seasons", label: "admin.tabSeasons", icon: Trophy },
];

const Admin = () => {
  const language = useAppSelector((state) => state.i18n.language);
  const [tab, setTab] = useState<AdminTab>("matches");

  return (
    <>
      <SectionHeading
        title={t(language, "admin.title")}
        subtitle={t(language, "admin.subtitle")}
      />
      <Tabs>
        {TABS.map(({ key, label, icon: Icon }) => (
          <TabButton
            key={key}
            $active={tab === key}
            onClick={() => setTab(key)}
          >
            <Icon size={16} />
            {t(language, label)}
          </TabButton>
        ))}
      </Tabs>

      {tab === "matches" && <MatchesAdmin />}
      {tab === "teams" && <TeamsAdmin />}
      {tab === "players" && <PlayersAdmin />}
      {tab === "seasons" && <SeasonsAdmin />}
    </>
  );
};

export default Admin;
