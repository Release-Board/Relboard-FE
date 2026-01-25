"use client";

import styled from "styled-components";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { logout } from "@/lib/api/client";
import { useEffect, useState } from "react";

const HeaderWrap = styled.header`
  height: 60px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: ${({ theme }) => theme.colors.surface};
`;

const Logo = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Button = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  
  &:hover {
    background: ${({ theme }) => theme.colors.surfaceRaised};
  }
`;

const PrimaryButton = styled(Link)`
  background: #fee500;
  color: #000;
  border: none;
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  text-decoration: none;
  
  &:hover {
    opacity: 0.9;
  }
`;

const Profile = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: ${({ theme }) => theme.fontSizes.sm};
`;

export default function Header() {
    const { user, isInitialized } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = "/";
        } catch (e) {
            console.error(e);
        }
    };

    if (!mounted) return <HeaderWrap><Logo href="/">RelBoard</Logo></HeaderWrap>;

    return (
        <HeaderWrap>
            <Logo href="/">RelBoard</Logo>
            <Actions>
                {user ? (
                    <>
                        <Profile>
                            {/* 
                 TODO: If user.profileImage exists, show Avatar. 
                 Using nickname for now. 
                */}
                            <span>{user.nickname}님</span>
                        </Profile>
                        <Button onClick={handleLogout}>로그아웃</Button>
                    </>
                ) : (
                    <PrimaryButton href="/login">카카오 로그인</PrimaryButton>
                )}
            </Actions>
        </HeaderWrap>
    );
}
