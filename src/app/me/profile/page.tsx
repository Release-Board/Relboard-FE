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

const FieldLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const DirtyDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accentStrong};
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.18);
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

const AvatarSection = styled.div`
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 16px;
  align-items: start;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const AvatarBlock = styled.div`
  display: grid;
  gap: 8px;
  justify-items: start;
`;

const AvatarControls = styled.div`
  display: grid;
  gap: 12px;
`;

const SourceToggle = styled.div`
  display: inline-flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const SourceButton = styled.button<{ $active: boolean }>`
  border: 1px solid ${({ theme, $active }) =>
    $active ? theme.colors.accentStrong : theme.colors.border};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceRaised : theme.colors.surface};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.text : theme.colors.muted};
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  transition: all 160ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const UploadButton = styled.label`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  transition: all 160ms ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceRaised};
  }
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

const UnsavedRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [profileImageType, setProfileImageType] = useState<"URL" | "DEFAULT" | "FILE">(
    "DEFAULT"
  );
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false);

  useEffect(() => {
    if (!data) return;
    setNickname(data.nickname ?? "");
    setEmail(data.email ?? "");
    setBio(data.bio ?? "");
    setGithubUrl(data.githubUrl ?? "");
    setWebsiteUrl(data.websiteUrl ?? "");
    setProfileImageUrl(data.profileImageUrl ?? null);
    setPreviewUrl(null);
    setProfileImageType((data.profileImageType ?? "DEFAULT") as "URL" | "DEFAULT" | "FILE");
    setPendingFile(null);
    setPendingDelete(false);
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
      setPreviewUrl(null);
      setPendingFile(null);
      setPendingDelete(false);
    },
    onError: () => toast(t("profile.saveError"), { tone: "error" }),
  });

  const hasUnsavedChanges = useMemo(() => {
    if (!data) return false;
    if (nickname.trim() !== (data.nickname ?? "")) return true;
    if ((email.trim() || "") !== (data.email ?? "")) return true;
    if ((bio.trim() || "") !== (data.bio ?? "")) return true;
    if ((githubUrl.trim() || "") !== (data.githubUrl ?? "")) return true;
    if ((websiteUrl.trim() || "") !== (data.websiteUrl ?? "")) return true;
    if (pendingFile || pendingDelete) return true;
    if (profileImageType === "URL") {
      const currentUrl = (profileImageUrl ?? "").trim();
      const savedUrl = (data.profileImageUrl ?? "").trim();
      if (currentUrl !== savedUrl) return true;
      if (data.profileImageType !== "URL") return true;
    }
    if (profileImageType === "DEFAULT" && data.profileImageType !== "DEFAULT") return true;
    if (profileImageType === "FILE" && data.profileImageType !== "FILE") return true;
    return false;
  }, [
    data,
    nickname,
    email,
    bio,
    githubUrl,
    websiteUrl,
    profileImageType,
    profileImageUrl,
    pendingFile,
    pendingDelete,
  ]);

  const isNicknameDirty = useMemo(
    () => Boolean(data && nickname.trim() !== (data.nickname ?? "")),
    [data, nickname]
  );
  const isEmailDirty = useMemo(
    () => Boolean(data && (email.trim() || "") !== (data.email ?? "")),
    [data, email]
  );
  const isGithubDirty = useMemo(
    () => Boolean(data && (githubUrl.trim() || "") !== (data.githubUrl ?? "")),
    [data, githubUrl]
  );
  const isWebsiteDirty = useMemo(
    () => Boolean(data && (websiteUrl.trim() || "") !== (data.websiteUrl ?? "")),
    [data, websiteUrl]
  );
  const isBioDirty = useMemo(
    () => Boolean(data && (bio.trim() || "") !== (data.bio ?? "")),
    [data, bio]
  );
  const isAvatarDirty = useMemo(() => {
    if (!data) return false;
    if (pendingFile || pendingDelete) return true;
    if (profileImageType === "URL") {
      const currentUrl = (profileImageUrl ?? "").trim();
      const savedUrl = (data.profileImageUrl ?? "").trim();
      if (currentUrl !== savedUrl) return true;
      if (data.profileImageType !== "URL") return true;
    }
    if (profileImageType === "DEFAULT" && data.profileImageType !== "DEFAULT") return true;
    if (profileImageType === "FILE" && data.profileImageType !== "FILE") return true;
    return false;
  }, [data, profileImageType, profileImageUrl, pendingFile, pendingDelete]);

  const canSave = useMemo(
    () => nickname.trim().length > 0 && hasUnsavedChanges,
    [nickname, hasUnsavedChanges]
  );

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSave = async () => {
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
      if (pendingDelete || data?.profileImageType === "FILE") {
        try {
          await deleteImageMutation.mutateAsync();
        } catch {
          return;
        }
      }
      payload.profileImageType = "DEFAULT";
      payload.profileImageUrl = null;
    }

    if (profileImageType === "FILE" && pendingFile) {
      try {
        await uploadMutation.mutateAsync(pendingFile);
      } catch {
        return;
      }
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
        <AvatarSection>
          <AvatarBlock>
            {previewUrl || profileImageUrl ? (
              <Avatar src={previewUrl ?? profileImageUrl ?? ""} alt={nickname} />
            ) : (
              <AvatarFallback>{nickname.trim().slice(0, 1) || "U"}</AvatarFallback>
            )}
            <Helper>
              <FieldLabel>
                {t("profile.avatar")}
                {isAvatarDirty && <DirtyDot />}
              </FieldLabel>
            </Helper>
          </AvatarBlock>
          <AvatarControls>
            <SourceToggle>
              <SourceButton
                type="button"
                $active={profileImageType === "FILE"}
                onClick={() => {
                  setProfileImageType("FILE");
                  setPendingDelete(false);
                }}
              >
                FILE
              </SourceButton>
              <SourceButton
                type="button"
                $active={profileImageType === "URL"}
                onClick={() => {
                  setProfileImageType("URL");
                  if (!profileImageUrl) {
                    setProfileImageUrl("");
                  }
                  setPendingFile(null);
                  setPendingDelete(false);
                  setPreviewUrl(null);
                }}
              >
                URL
              </SourceButton>
              <SourceButton
                type="button"
                $active={profileImageType === "DEFAULT"}
                onClick={() => {
                  setProfileImageType("DEFAULT");
                  setProfileImageUrl(null);
                  setPendingFile(null);
                  setPendingDelete(true);
                  setPreviewUrl(null);
                }}
              >
                DEFAULT
              </SourceButton>
            </SourceToggle>
            <Row>
              <HiddenFileInput
                id="profile-upload"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    setPendingFile(file);
                    setPendingDelete(false);
                    setProfileImageType("FILE");
                    setPreviewUrl(URL.createObjectURL(file));
                  }
                }}
              />
              {profileImageType === "FILE" && (
                <UploadButton htmlFor="profile-upload">{t("profile.upload")}</UploadButton>
              )}
              {profileImageType === "DEFAULT" && (
                <GhostButton
                  type="button"
                  onClick={() => {
                    setPendingDelete(true);
                    setPendingFile(null);
                    setPreviewUrl(null);
                  }}
                  disabled={deleteImageMutation.isPending}
                >
                  {t("profile.useDefault")}
                </GhostButton>
              )}
            </Row>
            {profileImageType === "URL" && (
              <Field>
                <FieldLabel>
                  {t("profile.imageUrl")}
                  {isAvatarDirty && <DirtyDot />}
                </FieldLabel>
                <Input
                  type="url"
                  value={profileImageUrl ?? ""}
                  placeholder="https://"
                  onChange={(event) => {
                    setProfileImageUrl(event.target.value);
                  }}
                />
              </Field>
            )}
          </AvatarControls>
        </AvatarSection>

        <Grid>
          <Field>
            <FieldLabel>
              {t("profile.nickname")}
              {isNicknameDirty && <DirtyDot />}
            </FieldLabel>
            <Input value={nickname} onChange={(event) => setNickname(event.target.value)} />
          </Field>
          <Field>
            <FieldLabel>
              {t("profile.email")}
              {isEmailDirty && <DirtyDot />}
            </FieldLabel>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} />
          </Field>
          <Field>
            <FieldLabel>
              {t("profile.githubUrl")}
              {isGithubDirty && <DirtyDot />}
            </FieldLabel>
            <Input value={githubUrl} onChange={(event) => setGithubUrl(event.target.value)} />
          </Field>
          <Field>
            <FieldLabel>
              {t("profile.websiteUrl")}
              {isWebsiteDirty && <DirtyDot />}
            </FieldLabel>
            <Input value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} />
          </Field>
        </Grid>

        <Field>
          <FieldLabel>
            {t("profile.bio")}
            {isBioDirty && <DirtyDot />}
          </FieldLabel>
          <Textarea value={bio} onChange={(event) => setBio(event.target.value)} />
        </Field>

        <UnsavedRow>
          <Button type="button" onClick={handleSave} disabled={!canSave || updateMutation.isPending}>
            {updateMutation.isPending ? t("profile.saving") : t("profile.save")}
          </Button>
        </UnsavedRow>
      </Card>

      {isLoading && <StateMessage>{t("common.loading")}</StateMessage>}
    </Section>
  );
}
