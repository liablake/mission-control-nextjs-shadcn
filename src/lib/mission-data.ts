import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

export type PipelineStage = "ideation" | "planning" | "production" | "review" | "publishing";
export type ReviewStatus = "pending" | "changes_requested" | "approved";
export type Channel = "youtube" | "instagram" | "tiktok";

export type ContentItem = {
  id: string;
  title: string;
  stage: PipelineStage;
  owner: string;
  priority: "low" | "medium" | "high";
  dueAt?: string;
  createdAt: string;
};

export type AssetVersion = {
  id: string;
  contentItemId: string;
  versionLabel: string;
  format: string;
  durationSec?: number;
  status: ReviewStatus;
  uploadedAt: string;
};

export type ReviewComment = {
  id: string;
  assetVersionId: string;
  author: string;
  body: string;
  timecodeSec?: number;
  resolved: boolean;
  createdAt: string;
};

export type PublishSlot = {
  id: string;
  contentItemId: string;
  channel: Channel;
  scheduledFor: string;
  status: "draft" | "scheduled" | "published";
  checklistScore: number;
};

export type MissionDataset = {
  items: ContentItem[];
  assets: AssetVersion[];
  comments: ReviewComment[];
  publishSlots: PublishSlot[];
};

const sampleData: MissionDataset = {
  items: [
    {
      id: "c1",
      title: "Guia rápido: Hooks que seguram retenção",
      stage: "review",
      owner: "Ana",
      priority: "high",
      dueAt: "2026-03-05T14:00:00Z",
      createdAt: "2026-03-01T09:00:00Z",
    },
    {
      id: "c2",
      title: "Bastidores do setup de captação",
      stage: "production",
      owner: "Leo",
      priority: "medium",
      dueAt: "2026-03-06T17:00:00Z",
      createdAt: "2026-03-02T11:30:00Z",
    },
    {
      id: "c3",
      title: "Checklist de publicação multiplataforma",
      stage: "planning",
      owner: "Shark",
      priority: "high",
      createdAt: "2026-03-03T10:15:00Z",
    },
    {
      id: "c4",
      title: "Trend breakdown da semana",
      stage: "ideation",
      owner: "Ana",
      priority: "low",
      createdAt: "2026-03-03T19:00:00Z",
    },
  ],
  assets: [
    {
      id: "a1",
      contentItemId: "c1",
      versionLabel: "v3",
      format: "16:9",
      durationSec: 402,
      status: "changes_requested",
      uploadedAt: "2026-03-03T20:10:00Z",
    },
    {
      id: "a2",
      contentItemId: "c1",
      versionLabel: "v2",
      format: "9:16",
      durationSec: 58,
      status: "approved",
      uploadedAt: "2026-03-02T15:00:00Z",
    },
    {
      id: "a3",
      contentItemId: "c2",
      versionLabel: "v1",
      format: "16:9",
      durationSec: 515,
      status: "pending",
      uploadedAt: "2026-03-03T22:42:00Z",
    },
  ],
  comments: [
    {
      id: "r1",
      assetVersionId: "a1",
      author: "Fernando",
      body: "Abrir com frame mais forte nos primeiros 2s.",
      timecodeSec: 1,
      resolved: false,
      createdAt: "2026-03-03T20:15:00Z",
    },
    {
      id: "r2",
      assetVersionId: "a1",
      author: "Ana",
      body: "Lower third cobre rosto no 00:00:12.",
      timecodeSec: 12,
      resolved: false,
      createdAt: "2026-03-03T20:17:00Z",
    },
    {
      id: "r3",
      assetVersionId: "a2",
      author: "Fernando",
      body: "Aprovado para Reels/TikTok.",
      resolved: true,
      createdAt: "2026-03-02T16:00:00Z",
    },
  ],
  publishSlots: [
    {
      id: "p1",
      contentItemId: "c1",
      channel: "youtube",
      scheduledFor: "2026-03-05T18:00:00Z",
      status: "scheduled",
      checklistScore: 86,
    },
    {
      id: "p2",
      contentItemId: "c1",
      channel: "instagram",
      scheduledFor: "2026-03-05T18:10:00Z",
      status: "draft",
      checklistScore: 72,
    },
    {
      id: "p3",
      contentItemId: "c2",
      channel: "tiktok",
      scheduledFor: "2026-03-06T19:00:00Z",
      status: "draft",
      checklistScore: 55,
    },
  ],
};

export async function getMissionDataset(): Promise<MissionDataset> {
  const supabase = getSupabaseClient();

  if (!supabase || !hasSupabaseEnv) {
    return sampleData;
  }

  const [{ data: items }, { data: assets }, { data: comments }, { data: slots }] = await Promise.all([
    supabase.from("content_items").select("*").order("created_at", { ascending: false }),
    supabase.from("asset_versions").select("*").order("uploaded_at", { ascending: false }),
    supabase.from("review_comments").select("*").order("created_at", { ascending: false }),
    supabase.from("publish_slots").select("*").order("scheduled_for", { ascending: true }),
  ]);

  return {
    items:
      items?.map((row) => ({
        id: row.id,
        title: row.title,
        stage: row.stage,
        owner: row.owner,
        priority: row.priority,
        dueAt: row.due_at ?? undefined,
        createdAt: row.created_at,
      })) ?? sampleData.items,
    assets:
      assets?.map((row) => ({
        id: row.id,
        contentItemId: row.content_item_id,
        versionLabel: row.version_label,
        format: row.format,
        durationSec: row.duration_sec ?? undefined,
        status: row.status,
        uploadedAt: row.uploaded_at,
      })) ?? sampleData.assets,
    comments:
      comments?.map((row) => ({
        id: row.id,
        assetVersionId: row.asset_version_id,
        author: row.author,
        body: row.body,
        timecodeSec: row.timecode_sec ?? undefined,
        resolved: row.resolved,
        createdAt: row.created_at,
      })) ?? sampleData.comments,
    publishSlots:
      slots?.map((row) => ({
        id: row.id,
        contentItemId: row.content_item_id,
        channel: row.channel,
        scheduledFor: row.scheduled_for,
        status: row.status,
        checklistScore: row.checklist_score,
      })) ?? sampleData.publishSlots,
  };
}
