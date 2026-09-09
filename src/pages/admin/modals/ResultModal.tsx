import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
} from "@mui/material";
import { Plus, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import StyledSelect from "../../../components/reusable/StyledSelect";
import StyledTextField from "../../../components/reusable/StyledTextField";
import { t } from "../../../i18n";
import api from "../../../api/config";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { showSnackbar } from "../../../store/slices/snackbarSlice";
import {
  fetchMatches,
  setMatchResultThunk,
} from "../../../store/slices/thunks/matchesThunks";
import type { CardType, Match, MatchDetails } from "../../../types";
import { IconAction } from "../adminUi";

const ScoreRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
`;

const TeamLabel = styled.div<{ $align: "left" | "right" }>`
  font-family: "Sora", sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-primary);
  text-align: ${({ $align }) => $align};
`;

const ScoreInputs = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  input {
    width: 54px;
    text-align: center;
    font-family: "Sora", sans-serif;
    font-size: 1.2rem;
    font-weight: 800;
  }
`;

const GroupTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: "Sora", sans-serif;
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--text-primary);
  margin: 18px 0 10px;
`;

const EventRow = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 1.3fr 1.3fr 76px 36px;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Hint = styled.div`
  font-size: 0.78rem;
  color: var(--text-disabled);
  margin-bottom: 6px;
`;

interface GoalRow {
  teamId: number;
  scorerId: number | "";
  assistPlayerId: number | "";
  minute: string;
}

interface CardRow {
  teamId: number;
  playerId: number | "";
  cardType: CardType;
  minute: string;
}

interface ResultModalProps {
  open: boolean;
  match: Match | null;
  seasonId: number | null;
  onClose: () => void;
}

const ResultModal = ({ open, match, seasonId, onClose }: ResultModalProps) => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);
  const { players } = useAppSelector((state) => state.players);

  const [scoreHome, setScoreHome] = useState("0");
  const [scoreAway, setScoreAway] = useState("0");
  const [goals, setGoals] = useState<GoalRow[]>([]);
  const [cards, setCards] = useState<CardRow[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !match) return;
    setScoreHome(match.scoreHome !== null && match.scoreHome !== undefined ? String(match.scoreHome) : "0");
    setScoreAway(match.scoreAway !== null && match.scoreAway !== undefined ? String(match.scoreAway) : "0");
    setGoals([]);
    setCards([]);

    // Prefill existing goals/cards when editing an already finished match
    api
      .get<MatchDetails>(`/matches/${match.id}`)
      .then((response) => {
        const details = response.data;
        setGoals(
          details.goals.map((goal) => ({
            teamId: goal.teamId,
            scorerId: goal.scorerId ?? "",
            assistPlayerId: goal.assistPlayerId ?? "",
            minute:
              goal.minute !== null && goal.minute !== undefined
                ? String(goal.minute)
                : "",
          }))
        );
        setCards(
          details.cards.map((card) => ({
            teamId: card.teamId,
            playerId: card.playerId ?? "",
            cardType: card.cardType,
            minute:
              card.minute !== null && card.minute !== undefined
                ? String(card.minute)
                : "",
          }))
        );
      })
      .catch(() => {
        // keep empty rows if the fetch fails
      });
  }, [open, match]);

  const teamOptions = useMemo(
    () =>
      match
        ? [
            { id: match.homeTeamId, name: match.homeTeamName ?? "" },
            { id: match.awayTeamId, name: match.awayTeamName ?? "" },
          ]
        : [],
    [match]
  );

  const playersOfTeam = (teamId: number) =>
    players.filter((player) => player.teamId === teamId);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!match) return;
    setSaving(true);

    const action = await dispatch(
      setMatchResultThunk({
        id: match.id,
        data: {
          scoreHome: Number(scoreHome),
          scoreAway: Number(scoreAway),
          goals: goals
            .filter((goal) => goal.scorerId !== "")
            .map((goal) => ({
              teamId: goal.teamId,
              scorerId: goal.scorerId === "" ? null : goal.scorerId,
              assistPlayerId:
                goal.assistPlayerId === "" ? null : goal.assistPlayerId,
              minute: goal.minute === "" ? null : Number(goal.minute),
            })),
          cards: cards
            .filter((card) => card.playerId !== "")
            .map((card) => ({
              teamId: card.teamId,
              playerId: card.playerId as number,
              cardType: card.cardType,
              minute: card.minute === "" ? null : Number(card.minute),
            })),
        },
      })
    );
    setSaving(false);

    if (setMatchResultThunk.fulfilled.match(action)) {
      dispatch(
        showSnackbar({
          message: t(language, "admin.matches.resultSaved"),
          severity: "success",
        })
      );
      dispatch(fetchMatches(seasonId ? { seasonId } : undefined));
      onClose();
    } else {
      dispatch(
        showSnackbar({
          message: String(action.payload ?? t(language, "admin.saveFailed")),
          severity: "error",
        })
      );
    }
  };

  if (!match) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 700 }}>
          {t(language, "admin.matches.resultTitle")}
        </DialogTitle>
        <DialogContent sx={{ pt: "10px !important" }}>
          <ScoreRow>
            <TeamLabel $align="right">{match.homeTeamName}</TeamLabel>
            <ScoreInputs>
              <StyledTextField
                type="number"
                value={scoreHome}
                onChange={(event) => setScoreHome(event.target.value)}
                inputProps={{ min: 0 }}
                required
              />
              <span style={{ color: "var(--text-disabled)" }}>:</span>
              <StyledTextField
                type="number"
                value={scoreAway}
                onChange={(event) => setScoreAway(event.target.value)}
                inputProps={{ min: 0 }}
                required
              />
            </ScoreInputs>
            <TeamLabel $align="left">{match.awayTeamName}</TeamLabel>
          </ScoreRow>

          <GroupTitle>
            {t(language, "admin.matches.goalsSection")}
            <Button
              size="small"
              startIcon={<Plus size={14} />}
              onClick={() =>
                setGoals((rows) => [
                  ...rows,
                  {
                    teamId: match.homeTeamId,
                    scorerId: "",
                    assistPlayerId: "",
                    minute: "",
                  },
                ])
              }
            >
              {t(language, "admin.matches.addGoal")}
            </Button>
          </GroupTitle>
          {goals.length === 0 && (
            <Hint>{t(language, "admin.matches.noGoalRows")}</Hint>
          )}
          {goals.map((goal, index) => (
            <EventRow key={index}>
              <StyledSelect
                size="small"
                value={goal.teamId}
                onChange={(event) =>
                  setGoals((rows) =>
                    rows.map((row, i) =>
                      i === index
                        ? {
                            ...row,
                            teamId: Number(event.target.value),
                            scorerId: "",
                            assistPlayerId: "",
                          }
                        : row
                    )
                  )
                }
              >
                {teamOptions.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </StyledSelect>
              <StyledSelect
                size="small"
                value={goal.scorerId}
                displayEmpty
                onChange={(event) =>
                  setGoals((rows) =>
                    rows.map((row, i) =>
                      i === index
                        ? {
                            ...row,
                            scorerId:
                              event.target.value === ""
                                ? ""
                                : Number(event.target.value),
                          }
                        : row
                    )
                  )
                }
              >
                <MenuItem value="">
                  {t(language, "admin.matches.scorer")}
                </MenuItem>
                {playersOfTeam(goal.teamId).map((player) => (
                  <MenuItem key={player.id} value={player.id}>
                    {player.name}
                  </MenuItem>
                ))}
              </StyledSelect>
              <StyledSelect
                size="small"
                value={goal.assistPlayerId}
                displayEmpty
                onChange={(event) =>
                  setGoals((rows) =>
                    rows.map((row, i) =>
                      i === index
                        ? {
                            ...row,
                            assistPlayerId:
                              event.target.value === ""
                                ? ""
                                : Number(event.target.value),
                          }
                        : row
                    )
                  )
                }
              >
                <MenuItem value="">
                  {t(language, "admin.matches.noAssist")}
                </MenuItem>
                {playersOfTeam(goal.teamId)
                  .filter((player) => player.id !== goal.scorerId)
                  .map((player) => (
                    <MenuItem key={player.id} value={player.id}>
                      {player.name}
                    </MenuItem>
                  ))}
              </StyledSelect>
              <StyledTextField
                size="small"
                type="number"
                placeholder={t(language, "admin.matches.minute")}
                value={goal.minute}
                onChange={(event) =>
                  setGoals((rows) =>
                    rows.map((row, i) =>
                      i === index
                        ? { ...row, minute: event.target.value }
                        : row
                    )
                  )
                }
                inputProps={{ min: 0, max: 150 }}
              />
              <IconAction
                type="button"
                $tone="danger"
                onClick={() =>
                  setGoals((rows) => rows.filter((_, i) => i !== index))
                }
              >
                <Trash2 size={15} />
              </IconAction>
            </EventRow>
          ))}

          <GroupTitle>
            {t(language, "admin.matches.cardsSection")}
            <Button
              size="small"
              startIcon={<Plus size={14} />}
              onClick={() =>
                setCards((rows) => [
                  ...rows,
                  {
                    teamId: match.homeTeamId,
                    playerId: "",
                    cardType: "YELLOW",
                    minute: "",
                  },
                ])
              }
            >
              {t(language, "admin.matches.addCard")}
            </Button>
          </GroupTitle>
          {cards.map((card, index) => (
            <EventRow key={index}>
              <StyledSelect
                size="small"
                value={card.teamId}
                onChange={(event) =>
                  setCards((rows) =>
                    rows.map((row, i) =>
                      i === index
                        ? {
                            ...row,
                            teamId: Number(event.target.value),
                            playerId: "",
                          }
                        : row
                    )
                  )
                }
              >
                {teamOptions.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </StyledSelect>
              <StyledSelect
                size="small"
                value={card.playerId}
                displayEmpty
                onChange={(event) =>
                  setCards((rows) =>
                    rows.map((row, i) =>
                      i === index
                        ? {
                            ...row,
                            playerId:
                              event.target.value === ""
                                ? ""
                                : Number(event.target.value),
                          }
                        : row
                    )
                  )
                }
              >
                <MenuItem value="">
                  {t(language, "admin.matches.player")}
                </MenuItem>
                {playersOfTeam(card.teamId).map((player) => (
                  <MenuItem key={player.id} value={player.id}>
                    {player.name}
                  </MenuItem>
                ))}
              </StyledSelect>
              <StyledSelect
                size="small"
                value={card.cardType}
                onChange={(event) =>
                  setCards((rows) =>
                    rows.map((row, i) =>
                      i === index
                        ? { ...row, cardType: event.target.value as CardType }
                        : row
                    )
                  )
                }
              >
                <MenuItem value="YELLOW">
                  {t(language, "admin.matches.yellowCard")}
                </MenuItem>
                <MenuItem value="RED">
                  {t(language, "admin.matches.redCard")}
                </MenuItem>
              </StyledSelect>
              <StyledTextField
                size="small"
                type="number"
                placeholder={t(language, "admin.matches.minute")}
                value={card.minute}
                onChange={(event) =>
                  setCards((rows) =>
                    rows.map((row, i) =>
                      i === index
                        ? { ...row, minute: event.target.value }
                        : row
                    )
                  )
                }
                inputProps={{ min: 0, max: 150 }}
              />
              <IconAction
                type="button"
                $tone="danger"
                onClick={() =>
                  setCards((rows) => rows.filter((_, i) => i !== index))
                }
              >
                <Trash2 size={15} />
              </IconAction>
            </EventRow>
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            {t(language, "common.cancel")}
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {t(language, "admin.matches.saveResult")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ResultModal;
