type CSSProperties = CSSStyleDeclaration;

export interface BoxPayload {
  cctv: number;
  timestamp?: Date;
  boxs: [
    {
      id: string;
      box: {
        top: number;
        bottom: number;
        left: number;
        right: number;
      };
      style?: {[prop in keyof CSSProperties]?: string};
      comment?: string;
    }
  ];
}

export const PAYLOAD: BoxPayload = {
  cctv: 0,
  boxs: [
    {
      id: "person-1",
      box: {
        top: 0.1,
        bottom: 0.2,
        left: 0.3,
        right: 0.4
      },
      style: {
        color: "red"
      }
    }
  ]
};

export interface AppState {
  id: string;
  src?: string;
  style: CSSProperties;
  comment: string;
}

/*export const getMedia = ({ src }) =>
  src ? (
    <video src={src} />
  ) : (
    <img src="https://i2-prod.belfastlive.co.uk/incoming/article13722455.ece/ALTERNATES/s615/1PNG.png" />
  );
const defaultBorderColor = getComputedStyle(document.body)
  .getPropertyValue(
    "--default-box-border"
  );
export const getBox = ({ id, style }) => {
  return (
    <div style={style}>
      <span style={{ background: style.borderColor || defaultBorderColor }}>
        <span className="mix-blend">{id}</span>
      </span>
    </div>
  );
};*/
