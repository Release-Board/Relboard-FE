"use client";

import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useQuery, useMutation } from "@tanstack/react-query";
import Link from "next/link";

import { useAuthStore } from "@/lib/store/authStore";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";
import {
  fetchMyProfile,
  updateMyProfile,
  uploadProfileImage,
  deleteProfileImage,
  type ProfileUpdatePayload,
} from "@/lib/api/relboard";
import { useToast } from "@/lib/hooks/useToast";

const Section = styled.section`
  display: grid;
  gap: 20px;
`;

const Heading = styled.div`
  display: grid;
  gap: 6px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.text};
`;

const Sub = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Card = styled.div`
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 20px;
  display: grid;
  gap: 16px;
  box-shadow: ${({ theme }) => theme.shadows.soft};
`;

const Grid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
`;

const Field = styled.label`
  display: grid;
  gap: 6px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Textarea = styled.textarea`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  min-height: 120px;
  resize: vertical;
`;

const Row = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
`;

const Avatar = styled.img`
  width: 64px;
  height: 64px;
  border-radius: ${({ theme }) => theme.radii.md};
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const AvatarFallback = styled.div`
  width: 64px;
  height: 64px;
  border-radius: ${({ theme }) => theme.radii.md};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accentStrong};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Button = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.accentStrong};
  background: ${({ theme }) => theme.colors.accentStrong};
  color: #ffffff;
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  transition: all 160ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    border-color: ${({ theme }) => theme.colors.accent};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const GhostButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  transition: all 160ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceRaised};
  }
`;

const Helper = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
`;

const StateMessage = styled.div`
  padding: 24px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.muted};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const LoginLink = styled(Link)`
  color: ${({ theme }) => theme.colors.accentStrong};
  font-weight: 600;
  text-decoration: none;
`;

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { t } = useStableTranslation();
  const toast = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["my-profile"],
    queryFn: fetchMyProfile,
    enabled: Boolean(user),
  });

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [profileImageType, setProfileImageType] = useState<"URL" | "DEFAULT" | "FILE">(
    "DEFAULT"
  );

  useEffect(() => {
    if (!data) return;
    setNickname(data.nickname ?? "");
    setEmail(data.email ?? "");
    setBio(data.bio ?? "");
    setGithubUrl(data.githubUrl ?? "");
    setWebsiteUrl(data.websiteUrl ?? "");
    setProfileImageUrl(data.profileImageUrl ?? null);
    setProfileImageType((data.profileImageType ?? "DEFAULT") as "URL" | "DEFAULT" | "FILE");
  }, [data]);

  const uploadMutation = useMutation({
    mutationFn: uploadProfileImage,
    onSuccess: (result) => {
      setProfileImageUrl(result.profileImageUrl);
      setProfileImageType("FILE");
    },
    onError: () => toast(t("profile.uploadError"), { tone: "error" }),
  });

  const deleteImageMutation = useMutation({
    mutationFn: deleteProfileImage,
    onSuccess: () => {
      setProfileImageUrl(null);
      setProfileImageType("DEFAULT");
    },
    onError: () => toast(t("profile.deleteImageError"), { tone: "error" }),
  });

  const updateMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: async () => {
      toast(t("profile.saved"), { tone: "success" });
      const updated = await refetch();
      if (updated.data) {
        setUser(updated.data);
      }
    },
    onError: () => toast(t("profile.saveError"), { tone: "error" }),
  });

  const canSave = useMemo(() => nickname.trim().length > 0, [nickname]);

  const handleSave = () => {
    if (!canSave) return;
    const payload: ProfileUpdatePayload = {
      nickname: nickname.trim(),
      email: email.trim() || null,
      bio: bio.trim() || null,
      githubUrl: githubUrl.trim() || null,
      websiteUrl: websiteUrl.trim() || null,
    };

    if (profileImageType === "URL") {
      const url = profileImageUrl?.trim();
      if (url) {
        payload.profileImageType = "URL";
        payload.profileImageUrl = url;
      } else {
        payload.profileImageType = "DEFAULT";
        payload.profileImageUrl = null;
      }
    }

    if (profileImageType === "DEFAULT") {
      payload.profileImageType = "DEFAULT";
      payload.profileImageUrl = null;
    }

    updateMutation.mutate(payload);
  };

  if (!user) {
    return (
      <Section>
        <Heading>
          <Title>{t("profile.title")}</Title>
          <Sub>{t("profile.subtitle")}</Sub>
        </Heading>
        <StateMessage>
          {t("profile.loginPrompt")}{" "}
          <LoginLink href="/login">{t("profile.loginLink")}</LoginLink>
        </StateMessage>
      </Section>
    );
  }

  return (
    <Section>
      <Heading>
        <Title>{t("profile.title")}</Title>
        <Sub>{t("profile.subtitle")}</Sub>
      </Heading>

      <Card>
        <Row>
          {profileImageUrl ? (
            <Avatar src={profileImageUrl} alt={nickname} />
          ) : (
            <AvatarFallback>{nickname.trim().slice(0, 1) || "U"}</AvatarFallback>
          )}
          <div>
            <Helper>{t("profile.avatar")}</Helper>
            <Row>
              <Input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    uploadMutation.mutate(file);
                  }
                }}
              />
              <GhostButton
                type="button"
                onClick={() => deleteImageMutation.mutate()}
                disabled={deleteImageMutation.isPending}
              >
                {t("profile.useDefault")}
              </GhostButton>
            </Row>
            <Helper>{t("profile.imageUrl")}</Helper>
            <Input
              type="url"
              value={profileImageType === "URL" ? profileImageUrl ?? "" : ""}
              placeholder="https://"
              onChange={(event) => {
                setProfileImageType("URL");
                setProfileImageUrl(event.target.value);
              }}
            />
          </div>
        </Row>

        <Grid>
          <Field>
            {t("profile.nickname")}
            <Input value={nickname} onChange={(event) => setNickname(event.target.value)} />
          </Field>
          <Field>
            {t("profile.email")}
            <Input value={email} onChange={(event) => setEmail(event.target.value)} />
          </Field>
          <Field>
            {t("profile.githubUrl")}
            <Input value={githubUrl} onChange={(event) => setGithubUrl(event.target.value)} />
          </Field>
          <Field>
            {t("profile.websiteUrl")}
            <Input value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} />
          </Field>
        </Grid>

        <Field>
          {t("profile.bio")}
          <Textarea value={bio} onChange={(event) => setBio(event.target.value)} />
        </Field>

        <Row>
          <Button type="button" onClick={handleSave} disabled={!canSave || updateMutation.isPending}>
            {updateMutation.isPending ? t("profile.saving") : t("profile.save")}
          </Button>
        </Row>
      </Card>

      {isLoading && <StateMessage>{t("common.loading")}</StateMessage>}
    </Section>
  );
}
