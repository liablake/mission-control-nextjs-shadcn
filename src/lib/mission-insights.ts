import { type MissionDataset, type PipelineStage } from "@/lib/mission-data";

const journeyOrder: PipelineStage[] = ["ideation", "planning", "production", "review", "publishing"];

type JourneyStepState = "done" | "active" | "pending";

export type JourneyStep = {
  stage: PipelineStage;
  state: JourneyStepState;
};

export type JourneyRow = {
  itemId: string;
  title: string;
  owner: string;
  priority: "low" | "medium" | "high";
  currentStage: PipelineStage;
  unresolvedComments: number;
  latestVersionLabel?: string;
  latestAssetStatus?: "pending" | "changes_requested" | "approved";
  latestPreviewUrl?: string;
  approvedChannels: number;
  totalChannels: number;
  approvalGate: "ready" | "needs_review" | "blocked";
  steps: JourneyStep[];
};

export type ReviewSlaRow = {
  assetVersionId: string;
  itemTitle: string;
  versionLabel: string;
  reviewerLoad: number;
  unresolvedComments: number;
  oldestOpenCommentHours?: number;
  risk: "low" | "medium" | "high";
};

function stageIndex(stage: PipelineStage) {
  return journeyOrder.indexOf(stage);
}

export function buildJourneyRows(data: MissionDataset): JourneyRow[] {
  return data.items.map((item) => {
    const assets = data.assets
      .filter((asset) => asset.contentItemId === item.id)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    const latestAsset = assets[0];
    const relatedComments = latestAsset ? data.comments.filter((comment) => comment.assetVersionId === latestAsset.id) : [];
    const unresolvedComments = relatedComments.filter((comment) => !comment.resolved).length;

    const slots = data.publishSlots.filter((slot) => slot.contentItemId === item.id);
    const approvedChannels = slots.filter((slot) => slot.status === "scheduled" || slot.status === "published").length;

    const approvalGate: JourneyRow["approvalGate"] =
      unresolvedComments > 0
        ? "needs_review"
        : latestAsset?.status === "approved" && approvedChannels > 0
          ? "ready"
          : "blocked";

    const currentIndex = stageIndex(item.stage);
    const steps: JourneyStep[] = journeyOrder.map((stage, idx) => ({
      stage,
      state: idx < currentIndex ? "done" : idx === currentIndex ? "active" : "pending",
    }));

    return {
      itemId: item.id,
      title: item.title,
      owner: item.owner,
      priority: item.priority,
      currentStage: item.stage,
      unresolvedComments,
      latestVersionLabel: latestAsset?.versionLabel,
      latestAssetStatus: latestAsset?.status,
      latestPreviewUrl: latestAsset?.previewUrl,
      approvedChannels,
      totalChannels: slots.length,
      approvalGate,
      steps,
    };
  });
}

export function buildReviewSlaRows(data: MissionDataset): ReviewSlaRow[] {
  const itemById = new Map(data.items.map((item) => [item.id, item]));

  return data.assets.map((asset) => {
    const itemTitle = itemById.get(asset.contentItemId)?.title ?? asset.contentItemId;
    const comments = data.comments.filter((comment) => comment.assetVersionId === asset.id);
    const openComments = comments.filter((comment) => !comment.resolved);
    const oldestOpen = openComments
      .map((comment) => new Date(comment.createdAt).getTime())
      .sort((a, b) => a - b)[0];

    const oldestOpenCommentHours = oldestOpen
      ? Math.round((Date.now() - oldestOpen) / (1000 * 60 * 60))
      : undefined;

    const reviewerLoad = new Set(openComments.map((comment) => comment.author)).size;
    const unresolvedComments = openComments.length;

    let risk: ReviewSlaRow["risk"] = "low";
    if (unresolvedComments >= 3 || (oldestOpenCommentHours ?? 0) >= 24) {
      risk = "high";
    } else if (unresolvedComments >= 1 || (oldestOpenCommentHours ?? 0) >= 8) {
      risk = "medium";
    }

    return {
      assetVersionId: asset.id,
      itemTitle,
      versionLabel: asset.versionLabel,
      reviewerLoad,
      unresolvedComments,
      oldestOpenCommentHours,
      risk,
    };
  });
}

export function buildStageCycleHours(data: MissionDataset) {
  const eventsByItem = new Map<string, MissionDataset["stageEvents"]>();

  for (const event of data.stageEvents) {
    const existing = eventsByItem.get(event.contentItemId) ?? [];
    existing.push(event);
    eventsByItem.set(event.contentItemId, existing);
  }

  return data.items.map((item) => {
    const ordered = (eventsByItem.get(item.id) ?? []).sort(
      (a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime(),
    );

    const firstTimestamp = ordered[0] ? new Date(ordered[0].changedAt).getTime() : new Date(item.createdAt).getTime();
    const lastTimestamp = ordered[ordered.length - 1]
      ? new Date(ordered[ordered.length - 1].changedAt).getTime()
      : new Date(item.createdAt).getTime();

    const cycleHours = Math.max(0, Math.round((lastTimestamp - firstTimestamp) / (1000 * 60 * 60)));

    return {
      itemId: item.id,
      title: item.title,
      currentStage: item.stage,
      transitions: ordered.length,
      cycleHours,
    };
  });
}
