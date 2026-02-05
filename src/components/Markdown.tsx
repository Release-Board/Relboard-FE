"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkGemoji from "remark-gemoji";
import rehypeSanitize from "rehype-sanitize";
import styled from "styled-components";

const MarkdownWrap = styled.div`
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.7;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  max-width: 100%;
  overflow-x: auto;
  overflow-wrap: anywhere;
  -webkit-overflow-scrolling: touch;

  h1,
  h2,
  h3 {
    margin: 18px 0 8px;
    line-height: 1.3;
  }

  h1 {
    font-size: 22px;
  }

  h2 {
    font-size: 18px;
  }

  h3 {
    font-size: 16px;
  }

  p {
    margin: 0 0 12px;
    word-break: break-word;
  }

  ul,
  ol {
    padding-left: 20px;
    margin: 0 0 12px;
  }

  code {
    font-family: ${({ theme }) => theme.fonts.mono};
    background: ${({ theme }) => theme.colors.surfaceRaised};
    padding: 2px 6px;
    border-radius: ${({ theme }) => theme.radii.sm};
    word-break: break-word;
  }

  pre {
    background: ${({ theme }) => theme.colors.surfaceRaised};
    padding: 12px;
    border-radius: ${({ theme }) => theme.radii.md};
    overflow: auto;
    max-width: 100%;
    overflow-wrap: normal;
  }

  table {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    border-collapse: collapse;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  a {
    color: ${({ theme }) => theme.colors.accent};
    text-decoration: underline;
  }

  blockquote {
    margin: 0 0 12px;
    padding: 12px 16px;
    border-left: 3px solid ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.surfaceRaised};
    color: ${({ theme }) => theme.colors.muted};
  }
`;

type Props = {
  content: string;
};

export default function Markdown({ content }: Props) {
  return (
    <MarkdownWrap>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkGemoji]} rehypePlugins={[rehypeSanitize]}>
        {content}
      </ReactMarkdown>
    </MarkdownWrap>
  );
}
