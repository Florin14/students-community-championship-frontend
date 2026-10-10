import { CalendarDays, Flag, Trophy, User, UserCog, Users } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";

import SectionHeading from "../../components/reusable/SectionHeading";
import { TranslationKey, t } from "../../i18n";
import { useAppSelector } from "../../store/hooks";
import FieldsAdmin from "./sections/FieldsAdmin";
import MatchesAdmin from "./sections/MatchesAdmin";
import PlayersAdmin from "./sections/PlayersAdmin";
import SeasonsAdmin from "./sections/SeasonsAdmin";
import TeamsAdmin from "./sections/TeamsAdmin";
import UsersAdmin from "./sections/UsersAdmin";

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
  font-family: var(--font-heading);
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

type AdminTab =
  | "matches"
  | "teams"
  | "players"
  | "seasons"
  | "fields"
  | "users";

const TABS: { key: AdminTab; label: TranslationKey; icon: typeof Users }[] = [
  { key: "matches", label: "admin.tabMatches", icon: CalendarDays },
  { key: "teams", label: "admin.tabTeams", icon: Users },
  { key: "players", label: "admin.tabPlayers", icon: User },
  { key: "seasons", label: "admin.tabSeasons", icon: Trophy },
  { key: "fields", label: "admin.tabFields", icon: Flag },
  { key: "users", label: "admin.tabUsers", icon: UserCog },
];

const Admin = () => {
  const language = useAppSelector((state) => state.i18n.language);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = TABS.find((item) => item.key === searchParams.get("tab"))?.key ?? "matches";

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
            onClick={() => setSearchParams((params) => { params.set("tab", key); return params; })}
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
      {tab === "fields" && <FieldsAdmin />}
      {tab === "users" && <UsersAdmin />}
    </>
  );
};

export default Admin;
