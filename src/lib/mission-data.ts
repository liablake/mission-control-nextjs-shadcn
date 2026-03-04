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
  previewUrl?: string;
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

export type StageEvent = {
  id: string;
  contentItemId: string;
  fromStage?: PipelineStage;
  toStage: PipelineStage;
  actor: string;
  note?: string;
  changedAt: string;
};

export type MissionDataset = {
  items: ContentItem[];
  assets: AssetVersion[];
  comments: ReviewComment[];
  publishSlots: PublishSlot[];
  stageEvents: StageEvent[];
};

export type MissionDataQuality = {
  source: "supabase" | "sample";
  fetchedAt: string;
  checks: Array<{
    label: string;
    ok: boolean;
    details: string;
  }>;
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
      previewUrl: "https://example.com/previews/c1-v3",
      uploadedAt: "2026-03-03T20:10:00Z",
    },
    {
      id: "a2",
      contentItemId: "c1",
      versionLabel: "v2",
      format: "9:16",
      durationSec: 58,
      status: "approved",
      previewUrl: "https://example.com/previews/c1-v2",
      uploadedAt: "2026-03-02T15:00:00Z",
    },
    {
      id: "a3",
      contentItemId: "c2",
      versionLabel: "v1",
      format: "16:9",
      durationSec: 515,
      status: "pending",
      previewUrl: "https://example.com/previews/c2-v1",
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
  stageEvents: [
    {
      id: "e1",
      contentItemId: "c1",
      fromStage: "ideation",
      toStage: "planning",
      actor: "Ana",
      note: "Aprovado briefing + CTA principal.",
      changedAt: "2026-03-01T10:00:00Z",
    },
    {
      id: "e2",
      contentItemId: "c1",
      fromStage: "planning",
      toStage: "production",
      actor: "Leo",
      note: "Roteiro congelado para gravação.",
      changedAt: "2026-03-01T18:20:00Z",
    },
    {
      id: "e3",
      contentItemId: "c1",
      fromStage: "production",
      toStage: "review",
      actor: "Leo",
      note: "Export v3 enviado para revisão.",
      changedAt: "2026-03-03T20:10:00Z",
    },
    {
      id: "e4",
      contentItemId: "c2",
      fromStage: "planning",
      toStage: "production",
      actor: "Shark",
      note: "Plano de captação validado.",
      changedAt: "2026-03-03T08:40:00Z",
    },
  ],
};

export async function getMissionDataset(): Promise<MissionDataset> {
  const supabase = getSupabaseClient();

  if (!supabase || !hasSupabaseEnv) {
    return sampleData;
  }

  const [{ data: items }, { data: assets }, { data: comments }, { data: slots }, { data: stageEvents }] = await Promise.all([
    supabase.from("content_items").select("*").order("created_at", { ascending: false }),
    supabase.from("asset_versions").select("*").order("uploaded_at", { ascending: false }),
    supabase.from("review_comments").select("*").order("created_at", { ascending: false }),
    supabase.from("publish_slots").select("*").order("scheduled_for", { ascending: true }),
    supabase.from("pipeline_stage_events").select("*").order("changed_at", { ascending: false }),
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
        previewUrl: row.preview_url ?? undefined,
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
    stageEvents:
      stageEvents?.map((row) => ({
        id: row.id,
        contentItemId: row.content_item_id,
        fromStage: row.from_stage ?? undefined,
        toStage: row.to_stage,
        actor: row.actor,
        note: row.note ?? undefined,
        changedAt: row.changed_at,
      })) ?? sampleData.stageEvents,
  };
}

export function buildMissionDataQuality(dataset: MissionDataset): MissionDataQuality {
  const checks: MissionDataQuality["checks"] = [
    {
      label: "Integridade relacional de comentários",
      ok: dataset.comments.every((comment) => dataset.assets.some((asset) => asset.id === comment.assetVersionId)),
      details: `${dataset.comments.length} comentários validados contra ${dataset.assets.length} versões`,
    },
    {
      label: "Checklist score dentro de 0-100",
      ok: dataset.publishSlots.every((slot) => slot.checklistScore >= 0 && slot.checklistScore <= 100),
      details: `${dataset.publishSlots.length} slots auditados`,
    },
    {
      label: "Rastreamento por etapa presente",
      ok: dataset.stageEvents.length >= Math.max(1, Math.floor(dataset.items.length / 2)),
      details: `${dataset.stageEvents.length} eventos para ${dataset.items.length} itens`,
    },
    {
      label: "Preview disponível para revisão",
      ok: dataset.assets.filter((asset) => asset.status !== "approved").every((asset) => Boolean(asset.previewUrl)),
      details: `${dataset.assets.filter((asset) => Boolean(asset.previewUrl)).length}/${dataset.assets.length} versões com preview`,
    },
  ];

  return {
    source: hasSupabaseEnv ? "supabase" : "sample",
    fetchedAt: new Date().toISOString(),
    checks,
  };
}
