"use client";
/**
 * ConnectAccountCard — a provider with status, connect/disconnect and last sync.
 * Deps: react, lucide-react, lib/*, ui/card, ui/badge, ui/button, ui/confirm-dialog.
 */
import { RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { formatRelativeTime } from "../../lib/format";
import { useRecipe } from "../../lib/skin";
import type { ClassNames, StyleProps, Tone } from "../../lib/types";
import { Badge } from "../badge";
import { Button } from "../button";
import { Card, CardBody } from "../card";
import { ConfirmDialog } from "../confirm-dialog";
import { connectAccountCardRecipe } from "./connect-account-card.recipe";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "syncing" | "error";

const STATUS_TONE: Record<ConnectionStatus, Tone> = { disconnected: "neutral", connecting: "info", connected: "success", syncing: "info", error: "danger" };

export interface ConnectAccountLabels {
  status: Record<ConnectionStatus, string>;
  connect: string;
  disconnect: string;
  reconnect: string;
  sync: string;
  lastSync: (relative: string) => string;
  neverSynced: string;
  confirmTitle: (provider: string) => string;
  confirmDescription: (provider: string) => string;
  confirmAction: string;
  cancel: string;
}

const DEFAULT_LABELS: ConnectAccountLabels = {
  status: { disconnected: "Not connected", connecting: "Connecting…", connected: "Connected", syncing: "Syncing…", error: "Needs attention" },
  connect: "Connect",
  disconnect: "Disconnect",
  reconnect: "Reconnect",
  sync: "Sync now",
  lastSync: (rel) => `Last synced ${rel}`,
  neverSynced: "Not synced yet",
  confirmTitle: (p) => `Disconnect ${p}?`,
  confirmDescription: (p) => `We will stop reading from ${p}. Evidence already verified stays in your profile.`,
  confirmAction: "Disconnect",
  cancel: "Cancel",
};

export interface ConnectAccountCardProps extends StyleProps {
  provider: string;
  icon?: ReactNode;
  description?: ReactNode;
  status: ConnectionStatus;
  /** Connected account handle, e.g. "@asha". */
  account?: string;
  lastSyncedAt?: Date | string | number;
  error?: ReactNode;
  onConnect?: () => void | Promise<void>;
  onDisconnect?: () => void | Promise<void>;
  onSync?: () => void;
  /** Ask before disconnecting (default true). */
  confirmDisconnect?: boolean;
  labels?: Partial<ConnectAccountLabels>;
  classNames?: ClassNames<"root" | "info" | "actions">;
}

export function ConnectAccountCard({
  provider,
  icon,
  description,
  status,
  account,
  lastSyncedAt,
  error,
  onConnect,
  onDisconnect,
  onSync,
  confirmDisconnect = true,
  labels: labelOverrides,
  className,
  classNames,
}: ConnectAccountCardProps) {
  const r = useRecipe("connectAccountCard", connectAccountCardRecipe);
  const labels = { ...DEFAULT_LABELS, ...labelOverrides, status: { ...DEFAULT_LABELS.status, ...labelOverrides?.status } };
  const busy = status === "connecting" || status === "syncing";
  const connected = status === "connected" || status === "syncing" || status === "error";

  const disconnectButton = (
    <Button variant="outline" tone="neutral" disabled={busy} onClick={confirmDisconnect ? undefined : () => void onDisconnect?.()}>
      {labels.disconnect}
    </Button>
  );

  return (
    <Card className={cn(className, classNames?.root)}>
      <CardBody className={r.body()}>
        {icon ? <div className={r.logo()} aria-hidden>{icon}</div> : null}
        <div className={cn(r.info(), classNames?.info)}>
          <div className={r.nameRow()}>
            <span className={r.name()}>{provider}</span>
            <Badge tone={STATUS_TONE[status]} dot size="sm">
              {labels.status[status]}
            </Badge>
          </div>
          {description ? <p className={r.description()}>{description}</p> : null}
          {connected ? (
            <div className={r.meta()}>
              {account ? <span>{account}</span> : null}
              <span>{lastSyncedAt ? labels.lastSync(formatRelativeTime(lastSyncedAt)) : labels.neverSynced}</span>
            </div>
          ) : null}
          {status === "error" && error ? (
            <p role="alert" className={r.error()}>
              {error}
            </p>
          ) : null}
        </div>
        <div className={cn(r.actions(), classNames?.actions)}>
          {!connected ? (
            <Button loading={status === "connecting"} onClick={() => void onConnect?.()}>
              {labels.connect}
            </Button>
          ) : (
            <>
              {status === "error" ? (
                <Button variant="soft" tone="danger" onClick={() => void onConnect?.()}>
                  {labels.reconnect}
                </Button>
              ) : onSync ? (
                <Button variant="outline" tone="neutral" loading={status === "syncing"} leading={<RefreshCw className="size-4" aria-hidden />} onClick={onSync}>
                  {labels.sync}
                </Button>
              ) : null}
              {onDisconnect ? (
                confirmDisconnect ? (
                  <ConfirmDialog
                    tone="danger"
                    trigger={disconnectButton}
                    title={labels.confirmTitle(provider)}
                    description={labels.confirmDescription(provider)}
                    confirmLabel={labels.confirmAction}
                    cancelLabel={labels.cancel}
                    onConfirm={() => onDisconnect()}
                  />
                ) : (
                  disconnectButton
                )
              ) : null}
            </>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
