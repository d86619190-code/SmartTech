import * as React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { CLIENT_CHAT_TEMPLATES } from "@/entities/clientChat";
import {
  getClientOrderMetaApi,
  getOrderMessagesApi,
  markOrderMessagesReadApi,
  postOrderTyping,
  rateClientOrderApi,
  sendOrderMessageApi,
  type ChatMessage,
  type ClientOrderMeta,
} from "@/shared/lib/clientInboxApi";
import { readAuthSession } from "@/shared/lib/authSession";
import { pickPhotosOrVideos } from "@/shared/lib/deviceFiles";
import { streamStatusLabel } from "@/shared/lib/realtime/streamStatusLabel";
import { useUserPresence } from "@/shared/lib/realtime/useUserPresence";
import { useOrderMessagesSse } from "@/shared/lib/realtime/useSseStreams";
import { useStatusToast } from "@/shared/lib/useStatusToast";
import { ChatAttachment } from "@/shared/ui/ChatAttachment";
import { StatusToast } from "@/shared/ui/StatusToast/StatusToast";
import { TypingIndicator } from "@/shared/ui/TypingIndicator";
import { PageHeader } from "@/widgets/PageHeader";
import cls from "./clientPages.module.css";

export const ChatPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const auth = readAuthSession();
  const [orderMeta, setOrderMeta] = React.useState<ClientOrderMeta | null>(null);
  const [orderMetaLoading, setOrderMetaLoading] = React.useState(true);
  const [orderMissing, setOrderMissing] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [text, setText] = React.useState("");
  const [pendingAttachment, setPendingAttachment] = React.useState<{ name: string; dataUrl: string } | null>(null);
  const [picking, setPicking] = React.useState(false);
  const [ratingBusy, setRatingBusy] = React.useState(false);
  const { toast, showToast, closeToast } = useStatusToast();
  const presence = useUserPresence();
  const [sseServiceTyping, setSseServiceTyping] = React.useState<boolean | undefined>(undefined);
  const typingPingRef = React.useRef<number | undefined>(undefined);

  const streamStatus = useOrderMessagesSse(orderId, setMessages, (meta) => {
    setSseServiceTyping(meta.serviceTyping);
  });

  React.useEffect(() => {
    setSseServiceTyping(undefined);
  }, [orderId]);

  React.useEffect(() => {
    if (!orderId) return;
    let mounted = true;
    const load = async () => {
      setOrderMetaLoading(true);
      try {
        const meta = await getClientOrderMetaApi(orderId);
        if (!mounted) return;
        setOrderMeta(meta);
        setOrderMissing(false);
      } catch {
        if (mounted) {
          setOrderMissing(true);
          setOrderMeta(null);
        }
      } finally {
        if (mounted) setOrderMetaLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [orderId]);

  React.useEffect(() => {
    if (!orderId) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getOrderMessagesApi(orderId);
        if (!mounted) return;
        setMessages(data);
        await markOrderMessagesReadApi(orderId);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Не удалось загрузить чат";
        showToast("error", msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [orderId, showToast]);

  React.useEffect(() => {
    if (!orderId) return;
    if (presence !== "online") return;
    if (!messages.some((m) => m.from === "service")) return;
    const t = window.setTimeout(() => {
      void markOrderMessagesReadApi(orderId);
    }, 250);
    return () => window.clearTimeout(t);
  }, [orderId, messages, presence]);

  const reloadMeta = React.useCallback(async () => {
    if (!orderId) return;
    try {
      const meta = await getClientOrderMetaApi(orderId);
      setOrderMeta(meta);
    } catch {
      // noop
    }
  }, [orderId]);

  const submitRating = React.useCallback(
    async (stars: number) => {
      if (!orderId || ratingBusy) return;
      setRatingBusy(true);
      try {
        await rateClientOrderApi(orderId, stars);
        showToast("success", "Спасибо за оценку");
        await reloadMeta();
        const data = await getOrderMessagesApi(orderId);
        setMessages(data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Не удалось сохранить оценку";
        showToast("error", msg);
      } finally {
        setRatingBusy(false);
      }
    },
    [orderId, ratingBusy, reloadMeta, showToast],
  );

  const send = async () => {
    if (!orderId || sending) return;
    const t = text.trim();
    if (!t && !pendingAttachment) return;
    setSending(true);
    try {
      const next = await sendOrderMessageApi(orderId, t, pendingAttachment ?? undefined);
      setMessages((prev) => [...prev, next]);
      setText("");
      setPendingAttachment(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не удалось отправить сообщение";
      showToast("error", msg);
    } finally {
      setSending(false);
    }
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

  const masterName = React.useMemo(
    () => messages.find((m) => m.from === "service")?.senderName ?? "Сервис",
    [messages],
  );
  const masterAvatar = React.useMemo(
    () => messages.find((m) => m.from === "service")?.senderAvatarUrl,
    [messages],
  );
  const userName = auth?.user.name?.trim() || "Вы";
  const userAvatar = auth?.user.avatarUrl?.trim() || "";
  const userAvatarSrc = userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;

  const serviceTyping =
    sseServiceTyping !== undefined ? sseServiceTyping : Boolean(orderMeta?.serviceTyping);
  const masterOnlineDot = Boolean(orderMeta?.counterpartOnline);

  if (!orderId) {
    return <Navigate to="/messages" replace />;
  }
  if (orderMissing) {
    return <Navigate to="/messages" replace />;
  }

  return (
    <div className={cls.shell}>
      <PageHeader
        title={orderMetaLoading ? "…" : orderMeta?.deviceLabel ?? "Чат"}
        subtitle={orderMetaLoading ? "" : `${masterName} · ${orderMeta?.issueSummary ?? ""}`}
      />
      <div className={cls.body}>
        <Link to="/messages" className={cls.backCircle} aria-label="К списку диалогов" title="К списку диалогов">
          ←
        </Link>
        {!orderMetaLoading && orderMeta ? (
          <div className={cls.chatParticipants} aria-label="Участники чата">
            <div className={cls.participant}>
              <img className={cls.participantAvatar} src={userAvatarSrc} alt="" />
              <div>
                <div className={cls.participantRole}>Вы</div>
                <div className={cls.participantName}>{userName}</div>
              </div>
            </div>
            <div className={cls.participantDivider} aria-hidden />
            <div className={cls.participant}>
              <div className={cls.avatarWrap}>
                <img
                  className={cls.participantAvatar}
                  src={masterAvatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(masterName)}`}
                  alt=""
                />
                {masterOnlineDot ? <span className={cls.onlineDot} title="Мастер на связи" /> : null}
              </div>
              <div>
                <div className={cls.participantRole}>Мастер</div>
                <div className={cls.participantName}>{masterName}</div>
              </div>
            </div>
          </div>
        ) : null}

        <div className={cls.chatShell}>
          <div className={cls.chatHeaderSticky}>
            <p className={[cls.streamStatus, cls.streamStatusLine].join(" ")}>
              <span>{streamStatusLabel(streamStatus)} ·</span>
              {loading ? (
                <span>Загрузка…</span>
              ) : serviceTyping ? (
                <TypingIndicator variant="inline" label="Мастер печатает" />
              ) : (
                <span>{presence === "online" ? "вы в сети" : "оффлайн"}</span>
              )}
            </p>
          </div>
          <div className={cls.chatScroll}>
            {!orderMetaLoading && orderMeta?.canRateOrder ? (
              <div className={cls.ratingPrompt}>
                <p className={cls.ratingTitle}>Заказ выдан. Оцените работу сервиса:</p>
                <div className={cls.starRow} role="group" aria-label="Оценка от 1 до 5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={cls.starBtn}
                      disabled={ratingBusy}
                      aria-label={`${n} из 5`}
                      onClick={() => void submitRating(n)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {!orderMetaLoading && orderMeta?.myRating ? (
              <p className={cls.ratedNote} role="status">
                Ваша оценка: {orderMeta.myRating} из 5
              </p>
            ) : null}
            {messages.map((m, i) => (
              <div
                key={`${m.id}-${i}`}
                className={[cls.bubbleRow, m.from === "user" ? cls.bubbleRowUser : cls.bubbleRowService].join(" ")}
              >
                <img
                  className={cls.msgAvatar}
                  src={
                    m.senderAvatarUrl ??
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.senderName)}`
                  }
                  alt=""
                />
                <div className={cls.bubbleColumn}>
                  <div className={cls.bubbleSender}>{m.senderName}</div>
                  <div className={[cls.bubble, m.from === "user" ? cls.bubbleUser : cls.bubbleService].join(" ")}>
                    {m.text.trim() ? m.text : null}
                    {m.attachment ? (
                      <ChatAttachment attachment={{ dataUrl: m.attachment.dataUrl, name: m.attachment.name }} />
                    ) : null}
                    <div className={cls.bubbleMeta}>
                      {new Date(m.at).toLocaleString("ru-RU")}
                      {m.from === "user" ? (
                        <span className={cls.tickStatus}>
                          {m.readByService ? (
                            <span className={cls.tickRead} title="Прочитано мастером">
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
            ))}
          </div>
          <div className={cls.templates}>
            {CLIENT_CHAT_TEMPLATES.map((tpl) => (
              <button key={tpl} type="button" className={cls.templateBtn} onClick={() => setText((p) => (p ? `${p}\n${tpl}` : tpl))}>
                {tpl}
              </button>
            ))}
          </div>
          {pendingAttachment ? (
            <div className={cls.pendingAttach}>
              <span>Готово к отправке: {pendingAttachment.name || "вложение"}</span>
              <button type="button" className={cls.pendingAttachClear} onClick={() => setPendingAttachment(null)}>
                Убрать
              </button>
            </div>
          ) : null}
          <div className={cls.chatFooter}>
            <textarea
              className={cls.chatTextarea}
              value={text}
              onChange={(e) => {
                const v = e.target.value;
                setText(v);
                if (!orderId) return;
                window.clearTimeout(typingPingRef.current);
                if (!v.trim()) return;
                typingPingRef.current = window.setTimeout(() => {
                  void postOrderTyping(orderId).catch(() => {});
                }, 400);
              }}
              placeholder="Напишите сообщение…"
              rows={2}
            />
            <div className={cls.chatInputTools}>
              <button
                type="button"
                className={cls.chatCircleBtn}
                onClick={() => void onPickMedia()}
                disabled={picking || sending}
                aria-label="Добавить фото или видео"
                title="Добавить фото или видео"
              >
                📎
              </button>
              <button
                type="button"
                className={[cls.chatCircleBtn, cls.chatCircleBtnPrimary].join(" ")}
                onClick={send}
                disabled={sending || (!text.trim() && !pendingAttachment)}
                aria-label="Отправить сообщение"
                title="Отправить сообщение"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      </div>
      {toast ? <StatusToast tone={toast.tone} message={toast.message} onClose={closeToast} /> : null}
    </div>
  );
};
