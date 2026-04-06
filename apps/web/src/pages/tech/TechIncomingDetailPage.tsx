import * as React from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { techApi } from "@/shared/lib/techApi";
import { downloadDataUrl, mimeFromDataUrl, pickPhotos } from "@/shared/lib/deviceFiles";
import { SkeletonCard } from "@/shared/ui/Skeleton";
import { Button } from "@/shared/ui/Button/Button";
import { AdminInput, AdminSelect } from "@/widgets/admin";
import { TechCard, TechModal, TechPageHeader } from "@/widgets/technician";
import cls from "./techPages.module.css";

type LocalPhoto = { id: string; name: string; dataUrl: string };

export const TechIncomingDetailPage: React.FC = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [req, setReq] = React.useState<any | null>(null);
  const [modal, setModal] = React.useState<"accept" | "decline" | null>(null);
  const [availability, setAvailability] = React.useState("today");
  const [slotNote, setSlotNote] = React.useState("");
  const [clientPhotos, setClientPhotos] = React.useState<LocalPhoto[]>([]);
  const [picking, setPicking] = React.useState(false);
  const [chatThreadId, setChatThreadId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!requestId) return;
    void (async () => {
      try {
        const res = await techApi.getIncomingById(requestId);
        setReq(res.row);
        setChatThreadId(res.row?.chatThreadId ?? null);
        const seeded = (res.row?.photoDataUrls ?? []) as string[];
        setClientPhotos(
          seeded.map((u, i) => ({
            id: `server-${i}`,
            name: `client-${i + 1}.jpg`,
            dataUrl: u,
          }))
        );
      } catch {
        setReq(null);
      }
    })();
  }, [requestId]);

  const onAddClientPhotos = async () => {
    setPicking(true);
    try {
      const picked = await pickPhotos(true);
      if (!picked.length) return;
      setClientPhotos((prev) => [
        ...prev,
        ...picked.map((p) => ({
          id: crypto.randomUUID(),
          name: p.file.name || "photo.jpg",
          dataUrl: p.dataUrl,
        })),
      ].slice(0, 12));
    } catch {
      /* cancel */
    } finally {
      setPicking(false);
    }
  };

  const removePhoto = (id: string) => {
    setClientPhotos((prev) => prev.filter((x) => x.id !== id));
  };

  if (!requestId) return <Navigate to="/tech/incoming" replace />;
  if (!req) {
    return (
      <>
        <TechPageHeader title="Incoming request" subtitle="Loading…" />
        <SkeletonCard rows={6} />
      </>
    );
  }

  const confirmAccept = async () => {
    setModal(null);
    await techApi.acceptIncoming(req.id);
    navigate("/tech/tasks");
  };

  const confirmDecline = async () => {
    setModal(null);
    await techApi.declineIncoming(req.id);
    navigate("/tech/incoming");
  };

  return (
    <>
      <TechPageHeader
        title={req.publicId}
        subtitle="Application details before hiring."
        actions={
          <>
            <Link to={chatThreadId ? `/tech/messages/${chatThreadId}` : "/tech/messages"}>
              <Button type="button" variant="outline">
                Chat with a client
              </Button>
            </Link>
            <Button type="button" variant="outline" onClick={() => setModal("decline")}>
              Reject
            </Button>
            <Button type="button" onClick={() => setModal("accept")}>
              Accept
            </Button>
          </>
        }
      />
      <div className={cls.twoCol}>
        <TechCard style={{ padding: 24 }}>
          <p className={cls.blockTitle}>Device</p>
          <div className={cls.rowFlex}>
            <div className={cls.thumb}>{req.thumb}</div>
            <div>
              <p className={cls.p}>
                <strong>{req.device}</strong>
              </p>
              <p className={cls.muted}>
                Type:{" "}
                {req.deviceType === "phone" ? "Telephone" : req.deviceType === "tablet" ? "Tablet" : "Laptop"}
              </p>
            </div>
          </div>
        </TechCard>
        <TechCard style={{ padding: 24 }}>
          <p className={cls.blockTitle}>Client</p>
          <div className={cls.rowFlex}>
            {req.clientAvatarUrl ? (
              <img
                src={req.clientAvatarUrl}
                alt=""
                style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--color-order-row-border)" }}
              />
            ) : null}
            <p className={cls.p}>
              {req.clientName}
              <br />
              {req.clientPhone}
            </p>
          </div>
        </TechCard>
      </div>
      <TechCard style={{ padding: 24, marginBottom: 20 }}>
        <p className={cls.blockTitle}>Description</p>
        <p className={cls.p}>{req.issueShort}</p>
        <p className={cls.blockTitle} style={{ marginTop: 20 }}>
          Photo from the client
        </p>
        <p className={cls.muted} style={{ marginTop: 0, marginBottom: 10 }}>Photos from the client's request + can be added locally for verification.</p>
        <div className={cls.photoGrid}>
          <button type="button" className={cls.photoStub} onClick={() => void onAddClientPhotos()} disabled={picking}>
            {picking ? "…" : "+ From device"}
          </button>
          {clientPhotos.map((p, i) => (
            <div key={p.id} className={cls.photoCell}>
              <img className={cls.photoThumb} src={p.dataUrl} alt="" />
              <button
                type="button"
                className={cls.photoDownload}
                onClick={() => {
                  const ext = mimeFromDataUrl(p.dataUrl).includes("png") ? "png" : "jpg";
                  downloadDataUrl(p.dataUrl, p.name.endsWith(".png") || p.name.endsWith(".jpg") ? p.name : `client-${i + 1}.${ext}`);
                }}
              >
                Save
              </button>
              <button type="button" className={cls.photoRemoveSmall} onClick={() => removePhoto(p.id)}>
                Put away
              </button>
            </div>
          ))}
        </div>
        <p className={cls.muted} style={{ marginTop: 12 }}>
          Difficulty rating: medium (we will clarify after inspection).
        </p>
      </TechCard>
      <Link className={cls.link} to="/tech/incoming">
        ← To inbox
      </Link>

      <TechModal
        open={modal === "accept"}
        onClose={() => setModal(null)}
        title="Accept application"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={confirmAccept}>
              Confirm
            </Button>
          </>
        }
      >
        <p className={cls.p} style={{ marginBottom: 16 }}>
          Specify availability and the client will receive a notification.
        </p>
        <AdminSelect label="Availability" value={availability} onChange={(e) => setAvailability(e.target.value)}>
          <option value="today">Today</option>
          <option value="tomorrow">Tomorrow</option>
          <option value="later">Later (I’ll clarify)</option>
        </AdminSelect>
        <div style={{ marginTop: 14 }}>
          <AdminInput label="Time comment (optional)" value={slotNote} onChange={(e) => setSlotNote(e.target.value)} placeholder="For example: after 16:00" />
        </div>
      </TechModal>

      <TechModal
        open={modal === "decline"}
        onClose={() => setModal(null)}
        title="Reject application"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={confirmDecline}>
              Reject
            </Button>
          </>
        }
      >
        <p className={cls.p}>The request will return to the dispatcher's queue. Continue?</p>
      </TechModal>
    </>
  );
};
