import { type Channel, type MissionDataset, type PipelineStage } from "@/lib/mission-data";

const journeyOrder: PipelineStage[] = ["ideation", "planning", "production", "review", "publishing"];

const thresholdByStage: Record<PipelineStage, number> = {
  ideation: 24,
  planning: 24,
  production: 48,
  review: 24,
  publishing: 12,
};

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

export type PublishingCalendarRow = {
  dateKey: string;
  dateLabel: string;
  channels: Record<
    Channel,
    {
      total: number;
      scheduled: number;
      published: number;
      avgChecklist: number;
      titles: string[];
    }
  >;
};

export type ChannelHealthRow = {
  channel: Channel;
  totalSlots: number;
  scheduledOrPublished: number;
  published: number;
  avgChecklist: number;
  readyRate: number;
  missedSlots: number;
};

export type FeedbackLoopRow = {
  assetVersionId: string;
  itemTitle: string;
  versionLabel: string;
  openComments: number;
  resolvedComments: number;
  participants: number;
  oldestOpenCommentHours?: number;
  feedbackVelocity: "fast" | "moderate" | "slow";
  blocking: boolean;
};

export type OpsDeliverySnapshot = {
  throughputPublished7d: number;
  scheduleAdherenceRate: number;
  reviewClosureRate: number;
  avgChecklistScore: number;
  stageHandoffs: number;
};

export type ReviewCoverageSnapshot = {
  assetsWithPreview: number;
  pendingWithoutPreview: number;
  commentsWithTimecodeRate: number;
  avgOpenCommentsPerAsset: number;
};

export type ReleaseControlRow = {
  itemId: string;
  title: string;
  stage: PipelineStage;
  latestVersionLabel?: string;
  latestAssetStatus?: "pending" | "changes_requested" | "approved";
  openComments: number;
  channelsPlanned: number;
  channelsReady: number;
  channelsPublished: number;
  scheduleConfidence: number;
  pipelineRisk: "low" | "medium" | "high";
  nextAction: string;
};

export type StageSlaBreachRow = {
  itemId: string;
  title: string;
  owner: string;
  stage: PipelineStage;
  thresholdHours: number;
  hoursInStage: number;
  breachByHours: number;
};

export type StageSlaComplianceRow = {
  stage: PipelineStage;
  items: number;
  thresholdHours: number;
  avgHoursInStage: number;
  withinSlaRate: number;
  breaches: number;
};

export type EndToEndFlowSnapshot = {
  totalItems: number;
  stageCounts: Record<PipelineStage, number>;
  completionRate: number;
  reviewToPublishRate: number;
  blockedRate: number;
  bottleneckStage: PipelineStage;
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

export function buildPublishingCalendarRows(data: MissionDataset): PublishingCalendarRow[] {
  const itemById = new Map(data.items.map((item) => [item.id, item.title]));
  const grouped = new Map<string, PublishingCalendarRow>();
  const channels: Channel[] = ["youtube", "instagram", "tiktok"];

  for (const slot of data.publishSlots) {
    const dateKey = slot.scheduledFor.slice(0, 10);
    const row =
      grouped.get(dateKey) ??
      {
        dateKey,
        dateLabel: new Date(slot.scheduledFor).toLocaleDateString("pt-BR", { timeZone: "UTC" }),
        channels: {
          youtube: { total: 0, scheduled: 0, published: 0, avgChecklist: 0, titles: [] },
          instagram: { total: 0, scheduled: 0, published: 0, avgChecklist: 0, titles: [] },
          tiktok: { total: 0, scheduled: 0, published: 0, avgChecklist: 0, titles: [] },
        },
      };

    const channelRow = row.channels[slot.channel];
    channelRow.total += 1;
    channelRow.scheduled += slot.status === "scheduled" ? 1 : 0;
    channelRow.published += slot.status === "published" ? 1 : 0;
    channelRow.avgChecklist = Math.round(((channelRow.avgChecklist * (channelRow.total - 1)) + slot.checklistScore) / channelRow.total);
    channelRow.titles.push(itemById.get(slot.contentItemId) ?? slot.contentItemId);

    grouped.set(dateKey, row);
  }

  return [...grouped.values()].sort((a, b) => a.dateKey.localeCompare(b.dateKey)).map((row) => ({
    ...row,
    channels: channels.reduce((acc, channel) => {
      acc[channel] = row.channels[channel];
      return acc;
    }, {} as PublishingCalendarRow["channels"]),
  }));
}

export function buildChannelHealthRows(data: MissionDataset): ChannelHealthRow[] {
  const now = Date.now();
  const channels: Channel[] = ["youtube", "instagram", "tiktok"];

  return channels.map((channel) => {
    const slots = data.publishSlots.filter((slot) => slot.channel === channel);
    const published = slots.filter((slot) => slot.status === "published").length;
    const scheduledOrPublished = slots.filter((slot) => slot.status === "scheduled" || slot.status === "published").length;
    const avgChecklist = slots.length ? Math.round(slots.reduce((acc, slot) => acc + slot.checklistScore, 0) / slots.length) : 0;
    const missedSlots = slots.filter((slot) => slot.status !== "published" && new Date(slot.scheduledFor).getTime() < now).length;

    return {
      channel,
      totalSlots: slots.length,
      scheduledOrPublished,
      published,
      avgChecklist,
      readyRate: slots.length ? Math.round((scheduledOrPublished / slots.length) * 100) : 0,
      missedSlots,
    };
  });
}

export function buildFeedbackLoopRows(data: MissionDataset): FeedbackLoopRow[] {
  const itemById = new Map(data.items.map((item) => [item.id, item.title]));
  const now = Date.now();

  return data.assets.map((asset) => {
    const comments = data.comments.filter((comment) => comment.assetVersionId === asset.id);
    const openComments = comments.filter((comment) => !comment.resolved);
    const resolvedComments = comments.filter((comment) => comment.resolved);
    const participants = new Set(comments.map((comment) => comment.author)).size;
    const oldestOpen = openComments
      .map((comment) => new Date(comment.createdAt).getTime())
      .sort((a, b) => a - b)[0];

    const oldestOpenCommentHours = oldestOpen ? Math.round((now - oldestOpen) / (1000 * 60 * 60)) : undefined;
    const blocking = openComments.length > 0 && (asset.status === "changes_requested" || asset.status === "pending");

    let feedbackVelocity: FeedbackLoopRow["feedbackVelocity"] = "fast";
    if ((oldestOpenCommentHours ?? 0) >= 24 || openComments.length >= 3) {
      feedbackVelocity = "slow";
    } else if ((oldestOpenCommentHours ?? 0) >= 8 || openComments.length >= 1) {
      feedbackVelocity = "moderate";
    }

    return {
      assetVersionId: asset.id,
      itemTitle: itemById.get(asset.contentItemId) ?? asset.contentItemId,
      versionLabel: asset.versionLabel,
      openComments: openComments.length,
      resolvedComments: resolvedComments.length,
      participants,
      oldestOpenCommentHours,
      feedbackVelocity,
      blocking,
    };
  });
}

export function buildOpsDeliverySnapshot(data: MissionDataset): OpsDeliverySnapshot {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  const throughputPublished7d = data.publishSlots.filter(
    (slot) => slot.status === "published" && new Date(slot.scheduledFor).getTime() >= sevenDaysAgo,
  ).length;

  const pastDueSlots = data.publishSlots.filter((slot) => new Date(slot.scheduledFor).getTime() <= now);
  const publishedPastDue = pastDueSlots.filter((slot) => slot.status === "published").length;

  const totalComments = data.comments.length;
  const closedComments = data.comments.filter((comment) => comment.resolved).length;

  return {
    throughputPublished7d,
    scheduleAdherenceRate: pastDueSlots.length ? Math.round((publishedPastDue / pastDueSlots.length) * 100) : 0,
    reviewClosureRate: totalComments ? Math.round((closedComments / totalComments) * 100) : 0,
    avgChecklistScore: data.publishSlots.length
      ? Math.round(data.publishSlots.reduce((acc, slot) => acc + slot.checklistScore, 0) / data.publishSlots.length)
      : 0,
    stageHandoffs: data.stageEvents.length,
  };
}

export function buildReviewCoverageSnapshot(data: MissionDataset): ReviewCoverageSnapshot {
  const assetsWithPreview = data.assets.filter((asset) => Boolean(asset.previewUrl)).length;
  const pendingWithoutPreview = data.assets.filter(
    (asset) => asset.status !== "approved" && !asset.previewUrl,
  ).length;

  const commentsWithTimecode = data.comments.filter((comment) => comment.timecodeSec !== undefined).length;
  const commentsWithTimecodeRate = data.comments.length
    ? Math.round((commentsWithTimecode / data.comments.length) * 100)
    : 0;

  const totalOpen = data.comments.filter((comment) => !comment.resolved).length;
  const avgOpenCommentsPerAsset = data.assets.length ? Number((totalOpen / data.assets.length).toFixed(1)) : 0;

  return {
    assetsWithPreview,
    pendingWithoutPreview,
    commentsWithTimecodeRate,
    avgOpenCommentsPerAsset,
  };
}

export function buildReleaseControlRows(data: MissionDataset): ReleaseControlRow[] {
  const journeyRows = buildJourneyRows(data);

  return journeyRows
    .map((row) => {
      const slots = data.publishSlots.filter((slot) => slot.contentItemId === row.itemId);
      const channelsReady = slots.filter((slot) => slot.status === "scheduled" || slot.status === "published").length;
      const channelsPublished = slots.filter((slot) => slot.status === "published").length;
      const avgChecklist = slots.length
        ? Math.round(slots.reduce((acc, slot) => acc + slot.checklistScore, 0) / slots.length)
        : 0;

      const scheduleConfidence = Math.max(
        0,
        Math.min(
          100,
          avgChecklist +
            (row.approvalGate === "ready" ? 15 : row.approvalGate === "needs_review" ? -10 : -20) +
            (slots.length ? Math.round((channelsReady / slots.length) * 20) : -10) -
            row.unresolvedComments * 8,
        ),
      );

      let pipelineRisk: ReleaseControlRow["pipelineRisk"] = "low";
      if (row.approvalGate === "blocked" || row.unresolvedComments >= 3 || scheduleConfidence < 50) {
        pipelineRisk = "high";
      } else if (row.approvalGate === "needs_review" || row.unresolvedComments >= 1 || scheduleConfidence < 75) {
        pipelineRisk = "medium";
      }

      const nextAction =
        row.approvalGate === "blocked"
          ? "Aprovar versão final e completar checklist por canal"
          : row.approvalGate === "needs_review"
            ? "Resolver comentários abertos antes de agendar"
            : channelsPublished < slots.length
              ? "Executar publicação nos canais já prontos"
              : "Monitorar performance e manter cadência";

      return {
        itemId: row.itemId,
        title: row.title,
        stage: row.currentStage,
        latestVersionLabel: row.latestVersionLabel,
        latestAssetStatus: row.latestAssetStatus,
        openComments: row.unresolvedComments,
        channelsPlanned: slots.length,
        channelsReady,
        channelsPublished,
        scheduleConfidence,
        pipelineRisk,
        nextAction,
      };
    })
    .sort((a, b) => {
      const riskWeight = { high: 3, medium: 2, low: 1 } as const;
      if (riskWeight[b.pipelineRisk] !== riskWeight[a.pipelineRisk]) {
        return riskWeight[b.pipelineRisk] - riskWeight[a.pipelineRisk];
      }
      return a.scheduleConfidence - b.scheduleConfidence;
    });
}

export function buildStageSlaBreachRows(data: MissionDataset): StageSlaBreachRow[] {
  const now = Date.now();

  const eventsByItem = new Map<string, MissionDataset["stageEvents"]>();
  for (const event of data.stageEvents) {
    const existing = eventsByItem.get(event.contentItemId) ?? [];
    existing.push(event);
    eventsByItem.set(event.contentItemId, existing);
  }

  return data.items
    .map((item) => {
      const ordered = (eventsByItem.get(item.id) ?? []).sort(
        (a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime(),
      );

      const enteredCurrentStageAt = [...ordered]
        .reverse()
        .find((event) => event.toStage === item.stage)?.changedAt ?? item.createdAt;

      const hoursInStage = Math.max(0, Math.round((now - new Date(enteredCurrentStageAt).getTime()) / (1000 * 60 * 60)));
      const thresholdHours = thresholdByStage[item.stage];
      const breachByHours = Math.max(0, hoursInStage - thresholdHours);

      return {
        itemId: item.id,
        title: item.title,
        owner: item.owner,
        stage: item.stage,
        thresholdHours,
        hoursInStage,
        breachByHours,
      };
    })
    .filter((row) => row.breachByHours > 0)
    .sort((a, b) => b.breachByHours - a.breachByHours);
}

export function buildStageSlaComplianceRows(data: MissionDataset): StageSlaComplianceRow[] {
  const now = Date.now();
  const breachRows = buildStageSlaBreachRows(data);
  const breachByItem = new Map(breachRows.map((row) => [row.itemId, row]));

  return journeyOrder.map((stage) => {
    const itemsInStage = data.items.filter((item) => item.stage === stage);

    const stageHours = itemsInStage.map((item) => {
      const breach = breachByItem.get(item.id);
      if (breach) {
        return breach.hoursInStage;
      }

      const enteredAt = data.stageEvents
        .filter((event) => event.contentItemId === item.id && event.toStage === stage)
        .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())[0]?.changedAt ?? item.createdAt;

      return Math.max(0, Math.round((now - new Date(enteredAt).getTime()) / (1000 * 60 * 60)));
    });

    const breaches = itemsInStage.filter((item) => breachByItem.has(item.id)).length;
    const avgHoursInStage = stageHours.length ? Math.round(stageHours.reduce((acc, value) => acc + value, 0) / stageHours.length) : 0;
    const withinSlaRate = itemsInStage.length ? Math.round(((itemsInStage.length - breaches) / itemsInStage.length) * 100) : 100;

    return {
      stage,
      items: itemsInStage.length,
      thresholdHours: thresholdByStage[stage],
      avgHoursInStage,
      withinSlaRate,
      breaches,
    };
  });
}

export function buildEndToEndFlowSnapshot(data: MissionDataset): EndToEndFlowSnapshot {
  const journeyRows = buildJourneyRows(data);
  const stageCounts = journeyOrder.reduce((acc, stage) => {
    acc[stage] = data.items.filter((item) => item.stage === stage).length;
    return acc;
  }, {} as Record<PipelineStage, number>);

  const reviewOrBeyond = stageCounts.review + stageCounts.publishing;
  const publishingCount = stageCounts.publishing;
  const blocked = journeyRows.filter((row) => row.approvalGate === "blocked").length;
  const completionRate = data.items.length ? Math.round((publishingCount / data.items.length) * 100) : 0;
  const reviewToPublishRate = reviewOrBeyond ? Math.round((publishingCount / reviewOrBeyond) * 100) : 0;
  const blockedRate = data.items.length ? Math.round((blocked / data.items.length) * 100) : 0;

  const bottleneckStage = journeyOrder.reduce((worst, stage) =>
    stageCounts[stage] > stageCounts[worst] ? stage : worst
  , "ideation");

  return {
    totalItems: data.items.length,
    stageCounts,
    completionRate,
    reviewToPublishRate,
    blockedRate,
    bottleneckStage,
  };
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
