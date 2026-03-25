import * as React from "react";
import cls from "./Skeleton.module.css";

type BoneProps = {
  className?: string;
  style?: React.CSSProperties;
};

export const SkeletonBone: React.FC<BoneProps> = ({ className, style }) => (
  <span className={[cls.bone, className].filter(Boolean).join(" ")} style={style} aria-hidden />
);

export const SkeletonCard: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className={cls.card}>
    <SkeletonBone className={cls.titleLine} />
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonBone key={i} className={cls.line} style={{ width: i === rows - 1 ? "72%" : "100%" }} />
    ))}
  </div>
);

export const SkeletonOrderRows: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className={cls.card} style={{ padding: 0 }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={cls.row} style={{ padding: "16px 20px" }}>
        <SkeletonBone className={cls.rowAvatar} />
        <div className={cls.rowBody}>
          <SkeletonBone className={cls.line} style={{ width: "40%", marginBottom: 8 }} />
          <SkeletonBone className={cls.lineSm} style={{ width: "88%" }} />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonThreadList: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className={cls.card} style={{ padding: 0 }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={cls.row} style={{ padding: "18px 20px" }}>
        <div className={cls.rowBody}>
          <SkeletonBone className={cls.line} style={{ width: "55%", marginBottom: 10 }} />
          <SkeletonBone className={cls.lineSm} style={{ width: "100%" }} />
          <SkeletonBone className={cls.lineSm} style={{ width: "35%", marginTop: 8, marginBottom: 0 }} />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonTrackingCards: React.FC<{ count?: number }> = ({ count = 2 }) => (
  <div className={cls.grid2}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={cls.card}>
        <SkeletonBone className={cls.titleLine} />
        <div style={{ display: "flex", gap: 16 }}>
          <SkeletonBone className={cls.thumb} style={{ maxWidth: 120 }} />
          <div style={{ flex: 1 }}>
            <SkeletonBone className={cls.line} style={{ width: "70%", marginBottom: 12 }} />
            <SkeletonBone className={cls.lineSm} style={{ width: "100%", marginBottom: 8 }} />
            <SkeletonBone className={cls.lineSm} style={{ width: "90%" }} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonKpiGrid: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className={cls.gridKpi}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonBone key={i} className={cls.kpi} />
    ))}
  </div>
);

export const SkeletonProfileHero: React.FC = () => (
  <div className={cls.card}>
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <SkeletonBone style={{ width: 72, height: 72, borderRadius: 22, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <SkeletonBone className={cls.titleLine} style={{ marginBottom: 12 }} />
        <SkeletonBone className={cls.lineSm} style={{ width: "60%" }} />
      </div>
    </div>
  </div>
);
