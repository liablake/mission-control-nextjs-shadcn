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

export type DailyOpsQueueRow = {
  itemId: string;
  title: string;
  owner: string;
  stage: PipelineStage;
  versionLabel?: string;
  approvalGate: JourneyRow["approvalGate"];
  unresolvedComments: number;
  oldestOpenCommentHours?: number;
  dueInHours?: number;
  urgencyScore: number;
  urgency: "normal" | "attention" | "critical";
};

export type ReviewerWorkloadRow = {
  owner: string;
  itemsInReview: number;
  unresolvedComments: number;
  criticalItems: number;
};

function stageIndex(stage: PipelineStage) {
  return journeyOrder.indexOf(stage);
}

function priorityScore(priority: JourneyRow["priority"]) {
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return 1;
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

export function buildDailyOpsQueue(data: MissionDataset): DailyOpsQueueRow[] {
  const now = Date.now();
  const journey = buildJourneyRows(data);
  const openCommentsByAsset = new Map(
    data.assets.map((asset) => {
      const openComments = data.comments.filter((comment) => comment.assetVersionId === asset.id && !comment.resolved);
      const oldestOpen = openComments
        .map((comment) => new Date(comment.createdAt).getTime())
        .sort((a, b) => a - b)[0];

      return [
        asset.id,
        {
          unresolved: openComments.length,
          oldestOpenCommentHours: oldestOpen ? Math.round((now - oldestOpen) / (1000 * 60 * 60)) : undefined,
        },
      ] as const;
    })
  );

  const latestAssetByItem = new Map(
    data.items.map((item) => {
      const latest = data.assets
        .filter((asset) => asset.contentItemId === item.id)
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0];
      return [item.id, latest] as const;
    })
  );

  return journey
    .map((row) => {
      const item = data.items.find((candidate) => candidate.id === row.itemId);
      const latestAsset = latestAssetByItem.get(row.itemId);
      const openCommentStats = latestAsset ? openCommentsByAsset.get(latestAsset.id) : undefined;
      const dueInHours = item?.dueAt ? Math.round((new Date(item.dueAt).getTime() - now) / (1000 * 60 * 60)) : undefined;

      const urgencyScore =
        priorityScore(row.priority) * 2 +
        row.unresolvedComments * 2 +
        (row.approvalGate === "needs_review" ? 3 : row.approvalGate === "blocked" ? 2 : 0) +
        ((openCommentStats?.oldestOpenCommentHours ?? 0) >= 24 ? 3 : (openCommentStats?.oldestOpenCommentHours ?? 0) >= 8 ? 2 : 0) +
        (dueInHours !== undefined ? (dueInHours < 0 ? 4 : dueInHours <= 24 ? 3 : dueInHours <= 48 ? 1 : 0) : 0);

      const urgency: DailyOpsQueueRow["urgency"] = urgencyScore >= 14 ? "critical" : urgencyScore >= 8 ? "attention" : "normal";

      return {
        itemId: row.itemId,
        title: row.title,
        owner: row.owner,
        stage: row.currentStage,
        versionLabel: row.latestVersionLabel,
        approvalGate: row.approvalGate,
        unresolvedComments: row.unresolvedComments,
        oldestOpenCommentHours: openCommentStats?.oldestOpenCommentHours,
        dueInHours,
        urgencyScore,
        urgency,
      };
    })
    .sort((a, b) => b.urgencyScore - a.urgencyScore);
}

export function buildReviewerWorkload(queue: DailyOpsQueueRow[]): ReviewerWorkloadRow[] {
  const byOwner = new Map<string, ReviewerWorkloadRow>();

  for (const row of queue) {
    const current = byOwner.get(row.owner) ?? {
      owner: row.owner,
      itemsInReview: 0,
      unresolvedComments: 0,
      criticalItems: 0,
    };

    if (row.stage === "review" || row.approvalGate === "needs_review") {
      current.itemsInReview += 1;
    }

    current.unresolvedComments += row.unresolvedComments;
    if (row.urgency === "critical") {
      current.criticalItems += 1;
    }

    byOwner.set(row.owner, current);
  }

  return [...byOwner.values()].sort((a, b) => b.unresolvedComments - a.unresolvedComments);
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
