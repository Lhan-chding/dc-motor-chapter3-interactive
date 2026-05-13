import { useState } from "react";
import { DemoFrame, MotorSketch, Readout, useDemoClock } from "./shared";

export default function DcMotorOverviewDemo() {
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(45);
  const [layer, setLayer] = useState<"all" | "flux" | "current" | "torque">("all");
  const [hover, setHover] = useState<string | null>(null);
  const { time, reset } = useDemoClock(playing, speed / 45);

  const status = hover ?? (layer === "all" ? "磁场、电流、换向器共同形成持续转矩" : layer === "flux" ? "蓝色磁通从 N 极穿过气隙到 S 极" : layer === "current" ? "红色路径表示电刷向电枢供电" : "绿色力箭头合成为旋转转矩");

  return (
    <DemoFrame
      status={status}
      playing={playing}
      onToggle={() => setPlaying((value) => !value)}
      onReset={() => {
        reset();
        setSpeed(45);
        setLayer("all");
      }}
      sliders={[{ label: "演示转速", symbol: "n", value: speed, min: 10, max: 120, step: 5, unit: "rpm", onChange: setSpeed }]}
      actions={
        <div className="segmented">
          <button type="button" className={layer === "all" ? "is-active" : ""} onClick={() => setLayer("all")}>整体</button>
          <button type="button" className={layer === "flux" ? "is-active" : ""} onClick={() => setLayer("flux")}>磁通路径</button>
          <button type="button" className={layer === "current" ? "is-active" : ""} onClick={() => setLayer("current")}>能量流</button>
          <button type="button" className={layer === "torque" ? "is-active" : ""} onClick={() => setLayer("torque")}>转矩</button>
        </div>
      }
      readouts={
        <>
          <Readout label="励磁" value="建立磁通" tone="blue" />
          <Readout label="电枢" value="承载电流" tone="red" />
          <Readout label="换向器" value="保持方向" tone="amber" />
        </>
      }
    >
      <MotorSketch
        angle={time * speed}
        showFlux={layer === "all" || layer === "flux"}
        showCurrent={layer === "all" || layer === "current"}
        showTorque={layer === "all" || layer === "torque"}
        onPartHover={setHover}
      />
    </DemoFrame>
  );
}
