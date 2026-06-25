import {Composition} from "remotion";
import {ProductBumper} from "./ProductBumper";

export const RemotionRoot = () => {
  return (
    <Composition
      id="ProductBumper"
      component={ProductBumper}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        title: "MacBook Air",
        subtitle: "Thin. Light. Quietly fast.",
      }}
    />
  );
};
