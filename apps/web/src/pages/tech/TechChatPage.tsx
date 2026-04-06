import * as React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { techApi } from "@/shared/lib/techApi";
import { streamStatusLabel } from "@/shared/lib/realtime/streamStatusLabel";
import { useUserPresence } from "@/shared/lib/realtime/useUserPresence";
import { useTechThreadSse } from "@/shared/lib/realtime/useSseStreams";
import { useStatusToast } from "@/shared/lib/useStatusToast";
import { pickPhotosOrVideos } from "@/shared/lib/deviceFiles";
import { ChatAttachment } from "@/shared/ui/ChatAttachment";
import { StatusToast } from "@/shared/ui/StatusToast/StatusToast";
import { TypingIndicator } from "@/shared/ui/TypingIndicator";
import { TechPageHeader } from "@/widgets/technician";
import chatCls from "@/pages/client/clientPages.module.css";

type TechMsg = {
  id: string;
  from: "client" | "tech";
  text: string;
  at: string;
  senderName?: string;
  senderAvatarUrl?: string;
  attachment?: string;
  read_by_client_at?: number;
  read_by_tech_at?: number;
};

function dicebear(seed: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

function formatMsgAt(at: string): string {
  const t = Date.parse(at);
  if (!Number.isNaN(t)) return new Date(t).toLocaleString("ru-RU");
  return at;
}

export const TechChatPage: React.FC = () => {
  const { threadId } = useParams();
  const [thread, setThread] = React.useState<{
    id: string;
    clientName: string;
    clientAvatarUrl?: string;
    orderPublicId: string;
    masterName?: string;
    masterAvatarUrl?: string;
    clientTyping?: boolean;
    clientOnline?: boolean;
  } | null>(null);
  const typingPingRef = React.useRef<number | undefined>(undefined);
  const [baseMessages, setBaseMessages] = React.useState<TechMsg[]>([]);
  const [templates, setTemplates] = React.useState<string[]>([]);
  const [text, setText] = React.useState("");
  const [pendingAttachment, setPendingAttachment] = React.useState<{ name: string; dataUrl: string } | null>(null);
  const [picking, setPicking] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [messagesLoading, setMessagesLoading] = React.useState(true);
  const [profile, setProfile] = React.useState<{ name?: string; avatar_url?: string } | null>(null);
  const { toast, showToast, closeToast } = useStatusToast();
  const presence = useUserPresence();

  const loadThread = React.useCallback(async () => {
    if (!threadId) return;
    const [threadRes, templatesRes] = await Promise.all([techApi.getThreadById(threadId), techApi.getTemplates()]);
    setThread(threadRes.thread);
    setBaseMessages(threadRes.messages as TechMsg[]);
    setTemplates(templatesRes.rows);
  }, [threadId]);

  React.useEffect(() => {
    if (!threadId) return;
    let mounted = true;
    void (async () => {
      setMessagesLoading(true);
      try {
        await loadThread();
      } catch {
        if (mounted) setThread(null);
      } finally {
        if (mounted) setMessagesLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [threadId, loadThread]);

  React.useEffect(() => {
    void techApi.getProfile().then((r) => setProfile(r.profile));
  }, []);

  const onThreadStream = React.useCallback(
    (payload: { thread: unknown; messages: unknown[] }) => {
      if (payload.thread)
        setThread(
          payload.thread as {
            id: string;
            clientName: string;
            clientAvatarUrl?: string;
            orderPublicId: string;
            masterName?: string;
            masterAvatarUrl?: string;
            clientTyping?: boolean;
            clientOnline?: boolean;
          }
        );
      if (Array.isArray(payload.messages)) {
        const next = payload.messages as TechMsg[];
        setBaseMessages((prev) => {
          if (next.length < prev.length) return prev;
          return next;
        });
      }
    },
    [],
  );

  const streamStatus = useTechThreadSse(threadId, onThreadStream);

  React.useEffect(() => {
    if (!threadId) return;
    const timer = window.setInterval(() => {
      void loadThread();
    }, 3000);
    return () => window.clearInterval(timer);
  }, [threadId, loadThread]);

  React.useEffect(() => {
    if (!threadId) return;
    if (presence !== "online") return;
    if (!baseMessages.some((m) => m.from === "client" && !m.read_by_tech_at)) return;
    const t = window.setTimeout(() => {
      void techApi.markThreadRead(threadId);
      void loadThread();
    }, 250);
    return () => window.clearTimeout(t);
  }, [threadId, baseMessages, presence, loadThread]);

  if (!threadId) return <Navigate to="/tech/messages" replace />;

  if (!thread) {
    return (
      <>
        <TechPageHeader title="Chat" subtitle="Loading…" />
        <div className={chatCls.body}>
          <p className={chatCls.streamStatus}>Loading…</p>
        </div>
      </>
    );
  }

  const messages = baseMessages;
  const masterName = thread.masterName ?? profile?.name ?? "Master";
  const masterAvatar = thread.masterAvatarUrl ?? profile?.avatar_url ?? dicebear(masterName);
  const clientAvatar = thread.clientAvatarUrl ?? dicebear(thread.clientName);

  const send = async () => {
    const t = text.trim();
    if ((!t && !pendingAttachment) || isSending) return;
    setIsSending(true);
    try {
      await techApi.sendThreadMessage(
        thread.id,
        t,
        pendingAttachment ? { name: pendingAttachment.name, dataUrl: pendingAttachment.dataUrl } : undefined,
      );
      setText("");
      setPendingAttachment(null);
      await loadThread();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to send";
      showToast("error", msg);
    } finally {
      setIsSending(false);
    }
  };

  const insertTemplate = (tpl: string) => {
    setText((prev) => (prev ? `${prev}\n${tpl}` : tpl));
  };

  const onPickMedia = async () => {
    setPicking(true);
    try {
      const picked = await pickPhotosOrVideos(false);
      const first = picked[0];
      if (first) setPendingAttachment({ name: first.file.name, dataUrl: first.dataUrl });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to select file";
      showToast("error", msg);
    } finally {
      setPicking(false);
    }
  };

  const showClientTyping = Boolean(thread.clientTyping);
  const clientOn = Boolean(thread.clientOnline);

  return (
    <>
      <TechPageHeader title={thread.clientName} subtitle={`Order ${thread.orderPublicId} · leads ${masterName}`} />
      <div className={chatCls.body}>
        <Link
          to="/tech/messages"
          className={chatCls.backCircle}
          aria-label="To the list of dialogues"
          title="To the list of dialogues"
        >
          ←
        </Link>
        <div className={chatCls.chatParticipants} aria-label="Chat participants">
          <div className={chatCls.participant}>
            <div className={chatCls.avatarWrap}>
              <img className={chatCls.participantAvatar} src={clientAvatar} alt="" />
              {clientOn ? <span className={chatCls.onlineDot} title="Client in touch" /> : null}
            </div>
            <div>
              <div className={chatCls.participantRole}>Client</div>
              <div className={chatCls.participantName}>{thread.clientName}</div>
            </div>
          </div>
          <div className={chatCls.participantDivider} aria-hidden />
          <div className={chatCls.participant}>
            <img className={chatCls.participantAvatar} src={masterAvatar} alt="" />
            <div>
              <div className={chatCls.participantRole}>You</div>
              <div className={chatCls.participantName}>{masterName}</div>
            </div>
          </div>
        </div>

        <div className={chatCls.chatShell}>
          <div className={chatCls.chatHeaderSticky}>
            <p className={[chatCls.streamStatus, chatCls.streamStatusLine].join(" ")}>
              <span>{streamStatusLabel(streamStatus)} ·</span>
              {messagesLoading ? (
                <span>Loading…</span>
              ) : showClientTyping ? (
                <TypingIndicator variant="inline" label="Client prints" />
              ) : (
                <span>{presence === "online" ? "you are online" : "offline"}</span>
              )}
            </p>
          </div>
          <div className={chatCls.chatScroll}>
            {messages.map((m, i) => {
              const isTech = m.from === "tech";
              const name = m.senderName ?? (isTech ? masterName : thread.clientName);
              const avatar = m.senderAvatarUrl ?? (isTech ? masterAvatar : clientAvatar);
              return (
                <div
                  key={`${m.id}-${i}`}
                  className={[chatCls.bubbleRow, isTech ? chatCls.bubbleRowUser : chatCls.bubbleRowService].join(" ")}
                >
                  <img className={chatCls.msgAvatar} src={avatar} alt="" />
                  <div className={chatCls.bubbleColumn}>
                    <div className={chatCls.bubbleSender}>{name}</div>
                    <div className={[chatCls.bubble, isTech ? chatCls.bubbleUser : chatCls.bubbleService].join(" ")}>
                      {m.text.trim() ? m.text : null}
                      {m.attachment ? <ChatAttachment attachment={{ dataUrl: m.attachment }} /> : null}
                      <div className={chatCls.bubbleMeta}>
                        {formatMsgAt(m.at)}
                        {isTech ? (
                          <span className={chatCls.tickStatus}>
                            {m.read_by_client_at ? (
                              <span className={chatCls.tickRead} title="Read by client">
                                ✓✓
                              </span>
                            ) : (
                              <span title="Delivered">✓✓</span>
                            )}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className={chatCls.templates}>
            {templates.map((tpl) => (
              <button key={tpl} type="button" className={chatCls.templateBtn} onClick={() => insertTemplate(tpl)}>
                {tpl}
              </button>
            ))}
          </div>
          {pendingAttachment ? (
            <div className={chatCls.pendingAttach}>
              <span>Ready to send: {pendingAttachment.name ||"attachment"}</span>
              <button type="button" className={chatCls.pendingAttachClear} onClick={() => setPendingAttachment(null)}>
                Put away
              </button>
            </div>
          ) : null}
          <div className={chatCls.chatFooter}>
            <textarea
              className={chatCls.chatTextarea}
              value={text}
              onChange={(e) => {
                const v = e.target.value;
                setText(v);
                if (!threadId) return;
                window.clearTimeout(typingPingRef.current);
                if (!v.trim()) return;
                typingPingRef.current = window.setTimeout(() => {
                  void techApi.postThreadTyping(threadId).catch(() => {});
                }, 400);
              }}
              placeholder="Write a message..."
              rows={2}
            />
            <div className={chatCls.chatInputTools}>
              <button
                type="button"
                className={chatCls.chatCircleBtn}
                onClick={() => void onPickMedia()}
                disabled={picking || isSending}
                aria-label="Add a photo or video"
                title="Add a photo or video"
              >
                📎
              </button>
              <button
                type="button"
                className={[chatCls.chatCircleBtn, chatCls.chatCircleBtnPrimary].join(" ")}
                onClick={send}
                disabled={isSending || (!text.trim() && !pendingAttachment)}
                aria-label="Send message"
                title="Send message"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      </div>
      {toast ? <StatusToast tone={toast.tone} message={toast.message} onClose={closeToast} /> : null}
    </>
  );
};
