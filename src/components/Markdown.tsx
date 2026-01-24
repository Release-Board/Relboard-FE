"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import styled from "styled-components";

const MarkdownWrap = styled.div`
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.7;
  font-size: ${({ theme }) => theme.fontSizes.sm};

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
  }

  pre {
    background: ${({ theme }) => theme.colors.surfaceRaised};
    padding: 12px;
    border-radius: ${({ theme }) => theme.radii.md};
    overflow: auto;
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
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {content}
      </ReactMarkdown>
    </MarkdownWrap>
  );
}
