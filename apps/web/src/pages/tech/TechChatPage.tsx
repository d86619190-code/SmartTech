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
import { AdminInput } from "@/widgets/admin";
import { TechPageHeader } from "@/widgets/technician";
import cls from "./techPages.module.css";

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

export const TechChatPage: React.FC = () => {
  const { threadId } = useParams();
  const [thread, setThread] = React.useState<{
    id: string;
    clientName: string;
    clientAvatarUrl?: string;
    orderPublicId: string;
    masterName?: string;
    masterAvatarUrl?: string;
  } | null>(null);
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
          }
        );
      if (Array.isArray(payload.messages)) {
        const next = payload.messages as TechMsg[];
        setBaseMessages((prev) => {
          /** Не затираем список устаревшим снимком (до фикса сигнатуры на бэке возможна гонка). */
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
  if (!thread) return <TechPageHeader title="Загрузка..." subtitle="Чат" />;
  const messages = baseMessages;

  /** В моке у каждого треда свой мастер; профиль панели — общий (часто Алексей). Показываем мастера треда. */
  const masterName = thread.masterName ?? profile?.name ?? "Мастер";
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
      const msg = e instanceof Error ? e.message : "Не удалось отправить";
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
      const msg = e instanceof Error ? e.message : "Не удалось выбрать файл";
      showToast("error", msg);
    } finally {
      setPicking(false);
    }
  };

  return (
    <>
      <TechPageHeader title={thread.clientName} subtitle={`Заказ ${thread.orderPublicId} · ведёт ${masterName}`} />
      <Link className={cls.backCircle} to="/tech/messages" aria-label="К списку диалогов" title="К списку диалогов">
        ←
      </Link>
      <div className={cls.chatParticipants} aria-label="Участники чата">
        <div className={cls.participant}>
          <img className={cls.participantAvatar} src={clientAvatar} alt="" />
          <div>
            <div className={cls.participantRole}>Клиент</div>
            <div className={cls.participantName}>{thread.clientName}</div>
          </div>
        </div>
        <div className={cls.participantDivider} aria-hidden />
        <div className={cls.participant}>
          <img className={cls.participantAvatar} src={masterAvatar} alt="" />
          <div>
            <div className={cls.participantRole}>Вы</div>
            <div className={cls.participantName}>{masterName}</div>
          </div>
        </div>
      </div>
      <div className={cls.chatShellSingle}>
        <div className={cls.chatPane}>
          <div className={cls.chatHead}>Переписка</div>
          <div className={cls.chatBody}>
            <p className={cls.streamStatus}>
              {streamStatusLabel(streamStatus)} · {presence === "online" ? "вы в сети" : "оффлайн"}
            </p>
            {messagesLoading ? <p className={cls.muted}>Загрузка...</p> : null}
            {messages.map((m, i) => {
              const isTech = m.from === "tech";
              const name = m.senderName ?? (isTech ? masterName : thread.clientName);
              const avatar =
                m.senderAvatarUrl ?? (isTech ? masterAvatar : clientAvatar);
              return (
                <div
                  key={`${m.id}-${i}`}
                  className={[cls.bubbleRow, isTech ? cls.bubbleRowTech : cls.bubbleRowClient].join(" ")}
                >
                  <img className={cls.msgAvatar} src={avatar} alt="" />
                  <div className={cls.bubbleColumn}>
                    <div className={cls.bubbleSender}>{name}</div>
                    <div className={[cls.bubble, isTech ? cls.bubbleTech : cls.bubbleClient].join(" ")}>
                      {m.text.trim() ? m.text : null}
                      {m.attachment ? <ChatAttachment attachment={{ dataUrl: m.attachment }} /> : null}
                      <div className={cls.bubbleMeta}>
                        {m.at}
                        {isTech ? (
                          <span className={cls.tickStatus}>
                            {m.read_by_client_at ? (
                              <span className={cls.tickRead} title="Прочитано клиентом">
                                ✓✓
                              </span>
                            ) : (
                              <span title="Доставлено">✓✓</span>
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
          <div className={cls.quickReplies}>
            {templates.map((tpl) => (
              <button
                key={tpl}
                type="button"
                onClick={() => insertTemplate(tpl)}
                className={cls.quickReplyBtn}
              >
                {tpl}
              </button>
            ))}
          </div>
          {pendingAttachment ? (
            <div className={cls.pendingAttachRow}>
              К отправке: {pendingAttachment.name || "вложение"}{" "}
              <button
                type="button"
                onClick={() => setPendingAttachment(null)}
                className={cls.pendingAttachClear}
              >
                Убрать
              </button>
            </div>
          ) : null}
          <div className={cls.chatInputRow}>
            <div className={cls.chatInputGrow}>
              <AdminInput placeholder="Сообщение…" value={text} onChange={(e) => setText(e.target.value)} />
            </div>
            <button
              type="button"
              className={cls.chatCircleBtn}
              onClick={() => void onPickMedia()}
              disabled={picking || isSending}
              aria-label="Добавить фото или видео"
              title="Добавить фото или видео"
            >
              📎
            </button>
            <button
              type="button"
              className={[cls.chatCircleBtn, cls.chatCircleBtnPrimary].join(" ")}
              onClick={send}
              disabled={isSending || (!text.trim() && !pendingAttachment)}
              aria-label="Отправить сообщение"
              title="Отправить сообщение"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
      {toast ? <StatusToast tone={toast.tone} message={toast.message} onClose={closeToast} /> : null}
    </>
  );
};
