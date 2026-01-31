import styled from "styled-components";

export const CommentItemWrap = styled.div`
  position: relative;
`;

export const VerticalGuide = styled.div`
  position: absolute;
  left: -12px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: ${({ theme }) => theme.colors.border};
`;

export const CommentRow = styled.div`
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 12px;
  position: relative;
`;

export const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const AvatarFallback = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.accentStrong};
  background: rgba(47, 107, 255, 0.12);
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const CommentBody = styled.div`
  display: grid;
  gap: 4px;
  position: relative;
`;

export const AuthorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Author = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

export const Timestamp = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.xs};
`;

export const Content = styled.p<{ $muted?: boolean }>`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme, $muted }) => ($muted ? theme.colors.muted : theme.colors.text)};
  line-height: 1.5;
  white-space: pre-wrap;
`;

export const Prefix = styled.span`
  font-weight: 700;
`;

export const Actions = styled.div`
  display: inline-flex;
  gap: 12px;
  opacity: 0;
  transition: opacity 160ms ease;
  margin-top: 2px;
`;

export const ActionButton = styled.button`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.accentStrong};
  }
`;

export const CommentWrapper = styled.div`
  &:hover ${Actions} {
    opacity: 1;
  }
`;

export const ChildList = styled.div`
  margin-left: 15.5px;
  padding-left: 16px;
  border-left: 2px solid ${({ theme }) => theme.colors.border};
  display: grid;
  gap: 12px;
  margin-top: 8px;
  padding-top: 4px;
`;

export const CollapseButton = styled.button`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

export const InlineToggle = styled.button`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.surfaceRaised};
  }

  svg {
    stroke-width: 2;
  }
`;

export const Editor = styled.textarea`
  width: 100%;
  min-height: 72px;
  resize: vertical;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 10px 12px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
`;

export const InlineActions = styled.div`
  display: flex;
  gap: 8px;
`;

export const InlineButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  cursor: pointer;
  transition: all 160ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceRaised};
  }
`;
