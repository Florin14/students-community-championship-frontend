import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { imageSrc } from "../../utils/images";

const Card = styled(motion(Link))`
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
  margin-bottom: 22px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background:
    radial-gradient(
      420px 160px at 100% 50%,
      var(--accent-soft),
      transparent 70%
    ),
    var(--bg-card);
  box-shadow: var(--shadow-card);
  transition: border-color 0.15s ease;

  &:hover {
    border-color: var(--border-strong);
  }
`;

const Rank = styled.div`
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  color: var(--accent-contrast);
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: 0.8rem;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Text = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Eyebrow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-heading);
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--accent);
`;

const Name = styled.div`
  font-family: var(--font-heading);
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Team = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
`;

const Figure = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1;

  strong {
    font-family: var(--font-heading);
    font-size: 2rem;
    font-weight: 800;
    color: var(--accent);
  }

  span {
    font-family: var(--font-heading);
    font-size: 0.64rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-secondary);
    margin-top: 4px;
  }
`;

interface TopScorerHeroProps {
  playerId?: number | null;
  name: string;
  teamName?: string | null;
  avatar?: string | null;
  goals: number;
  eyebrow: string;
  unit: string;
}

const TopScorerHero = ({
  playerId,
  name,
  teamName,
  avatar,
  goals,
  eyebrow,
  unit,
}: TopScorerHeroProps) => {
  const src = imageSrc(avatar);
  return (
    <Card
      to={playerId ? `/players/${playerId}` : "/players"}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Rank>{src ? <img src={src} alt={name} /> : "#1"}</Rank>
      <Text>
        <Eyebrow>
          <Crown size={12} />
          {eyebrow}
        </Eyebrow>
        <Name>{name}</Name>
        {teamName && <Team>{teamName}</Team>}
      </Text>
      <Figure>
        <strong>{goals}</strong>
        <span>{unit}</span>
      </Figure>
    </Card>
  );
};

export default TopScorerHero;
