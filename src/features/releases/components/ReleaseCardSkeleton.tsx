"use client";

import styled, { keyframes } from "styled-components";

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const Card = styled.article`
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 24px;
  display: grid;
  gap: 12px;
`;

const SkeletonLine = styled.div<{ $width?: string }>`
  height: 12px;
  width: ${({ $width }) => $width ?? "100%"};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: linear-gradient(
    90deg,
    rgba(47, 107, 255, 0.08) 0%,
    rgba(47, 107, 255, 0.18) 50%,
    rgba(47, 107, 255, 0.08) 100%
  );
  background-size: 400px 100%;
  animation: ${shimmer} 1.4s ease infinite;
`;

const SkeletonRow = styled.div`
  display: flex;
  gap: 10px;
`;

export default function ReleaseCardSkeleton() {
  return (
    <Card>
      <SkeletonRow>
        <SkeletonLine $width="120px" />
        <SkeletonLine $width="80px" />
      </SkeletonRow>
      <SkeletonLine $width="70%" />
      <SkeletonLine $width="40%" />
      <SkeletonRow>
        <SkeletonLine $width="60px" />
        <SkeletonLine $width="60px" />
        <SkeletonLine $width="60px" />
      </SkeletonRow>
    </Card>
  );
}
