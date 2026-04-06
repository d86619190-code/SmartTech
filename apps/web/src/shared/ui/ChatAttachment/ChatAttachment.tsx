import * as React from "react";
import { downloadDataUrl, isImageMime, isVideoMime, mimeFromDataUrl } from "@/shared/lib/deviceFiles";
import cls from "./ChatAttachment.module.css";

export type ChatAttachmentPayload = {
  dataUrl: string;
  name?: string;
};

type ChatAttachmentProps = {
  attachment: ChatAttachmentPayload;
  className?: string;
};

export const ChatAttachment: React.FC<ChatAttachmentProps> = ({ attachment, className }) => {
  const mime = mimeFromDataUrl(attachment.dataUrl);
  const baseName = attachment.name?.trim() || (isVideoMime(mime) ? "video" : "photo");
  const ext = isVideoMime(mime) ? "mp4" : isImageMime(mime) ? "jpg" : "bin";

  const onDownload = () => {
    downloadDataUrl(attachment.dataUrl, `${baseName}.${ext}`);
  };

  return (
    <div className={[cls.wrap, className].filter(Boolean).join(" ")}>
      {isImageMime(mime) ? (
        <img className={cls.media} src={attachment.dataUrl} alt="" loading="lazy" />
      ) : isVideoMime(mime) ? (
        <video className={cls.media} src={attachment.dataUrl} controls playsInline />
      ) : (
        <p className={cls.fallback}>Attachment</p>
      )}
      <button type="button" className={cls.downloadBtn} onClick={onDownload}>
        Save to device
      </button>
    </div>
  );
};
