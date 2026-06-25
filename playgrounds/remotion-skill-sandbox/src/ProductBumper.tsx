import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type ProductBumperProps = {
  title: string;
  subtitle: string;
};

export const ProductBumper = ({title, subtitle}: ProductBumperProps) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const introEnd = 1.8 * fps;
  const eyebrowStart = 0.22 * fps;
  const eyebrowEnd = 0.8 * fps;
  const titleStart = 0.5 * fps;
  const titleEnd = 1.3 * fps;
  const subtitleStart = 0.95 * fps;
  const subtitleEnd = 1.7 * fps;
  const highlightStart = 0.55 * fps;
  const highlightEnd = 2.6 * fps;
  const fadeOutStart = 5.45 * fps;
  const fadeOutEnd = 6 * fps;

  const sceneOpacity = interpolate(
    frame,
    [0, 0.18 * fps, fadeOutStart, fadeOutEnd],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    }
  );

  const deviceIntro = spring({
    fps,
    frame,
    config: {
      damping: 18,
      stiffness: 82,
      mass: 0.9,
    },
  });

  const deviceX = interpolate(frame, [0, introEnd], [260, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const deviceY = interpolate(frame, [0, introEnd], [88, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const deviceRotate = interpolate(frame, [0, introEnd], [-16, -10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const titleOpacity = interpolate(frame, [titleStart, titleEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleY = interpolate(frame, [titleStart, titleEnd], [44, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const eyebrowOpacity = interpolate(frame, [eyebrowStart, eyebrowEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const eyebrowY = interpolate(frame, [eyebrowStart, eyebrowEnd], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const subtitleOpacity = interpolate(frame, [subtitleStart, subtitleEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ruleScale = interpolate(frame, [subtitleStart - 0.15 * fps, subtitleStart + 0.45 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const highlightX = interpolate(frame, [highlightStart, highlightEnd], [-240, 860], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const ambientDrift = interpolate(frame, [0, fadeOutEnd], [-6, 8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 22% 18%, rgba(255,255,255,0.98), rgba(246,246,243,1) 38%, rgba(236,236,232,1) 100%)",
        color: "#111111",
        fontFamily:
          "SF Pro Display, SF Pro Text, Inter, Helvetica Neue, Arial, sans-serif",
        opacity: sceneOpacity,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 70% 44%, rgba(214,220,230,0.22), rgba(214,220,230,0) 30%)",
          transform: `translateX(${ambientDrift}px)`,
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          transform: `translate(${deviceX}px, ${deviceY}px) scale(${0.925 + deviceIntro * 0.075})`,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 980,
            height: 560,
            transform: `perspective(1800px) rotateX(61deg) rotateZ(${deviceRotate}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "74px 70px 148px 70px",
              borderRadius: 34,
              background:
                "linear-gradient(180deg, rgba(254,254,255,0.98), rgba(230,233,238,0.98) 26%, rgba(191,196,204,0.96) 100%)",
              boxShadow:
                "0 34px 88px rgba(18,20,26,0.16), inset 0 1px 0 rgba(255,255,255,0.94), inset 0 -1px 0 rgba(104,109,117,0.14)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "14px 18px auto",
                height: 8,
                borderRadius: 999,
                background: "rgba(255,255,255,0.5)",
                filter: "blur(1px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: 180,
                left: highlightX,
                transform: "skewX(-18deg)",
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.34) 48%, rgba(255,255,255,0) 100%)",
                mixBlendMode: "screen",
              }}
            />
          </div>

          <div
            style={{
              position: "absolute",
              left: 96,
              right: 96,
              bottom: 114,
              height: 56,
              borderRadius: 999,
              background:
                "linear-gradient(180deg, rgba(210,214,220,0.98), rgba(168,173,182,0.98))",
              boxShadow:
                "0 16px 30px rgba(18,20,26,0.15), inset 0 1px 0 rgba(255,255,255,0.72)",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: 136,
              right: 136,
              bottom: 34,
              height: 140,
              borderRadius: 999,
              background:
                "radial-gradient(circle, rgba(0,0,0,0.18), rgba(0,0,0,0.02) 62%, rgba(0,0,0,0) 100%)",
              filter: "blur(22px)",
              transform: "translateZ(-1px)",
            }}
          />
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          paddingLeft: 148,
          paddingRight: 148,
          paddingBottom: 148,
          gap: 22,
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            color: "rgba(17,17,17,0.54)",
            opacity: eyebrowOpacity,
            transform: `translateY(${eyebrowY}px)`,
          }}
        >
          Introducing
        </div>
        <div
          style={{
            fontSize: 148,
            fontWeight: 600,
            lineHeight: 0.94,
            letterSpacing: "-0.08em",
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          {title}
        </div>
        <div
          style={{
            width: 340,
            height: 1,
            background: "rgba(17,17,17,0.22)",
            transform: `scaleX(${ruleScale})`,
            transformOrigin: "left center",
          }}
        />
        <div
          style={{
            fontSize: 34,
            fontWeight: 400,
            letterSpacing: "-0.03em",
            color: "rgba(17,17,17,0.64)",
            opacity: subtitleOpacity,
          }}
        >
          {subtitle}
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0) 22%, rgba(0,0,0,0) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
