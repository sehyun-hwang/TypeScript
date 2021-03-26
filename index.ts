// Import stylesheets
import "./style.css";
import { getMedia, getBox, AppState, BoxPayload } from "./Hello";
import "./style.css";

import { fromEvent } from "rxjs";
import { map, filter } from "rxjs/operators";

// @ts-ignore
import { io } from "socket.io-client";

interface AppProps {
  src?: string;
}

const socketio = (() => {
  const socket = io("wss://proxy.hwangsehyun.com/webrtc-onvif", {
    transports: ["websocket"]
  });
  const boxEvent = fromEvent(socket, "box");

  const payloadEvent = boxEvent.pipe(
    map(([id, payload]: [number, BoxPayload]) =>
      payload.boxs.map(({ id, box, style = {} }) => {
        Object.entries(box).forEach(
          ([key, value]) => (style[key] = 100 * value + "%")
        );

        return {
          id,
          style,
          comment: "Start editing to see some magic happen :)"
        };
      })
    )
  );

  const subscribePayload = (_id: number) =>
    payloadEvent.pipe(filter(({ id }) => id === _id));

  return { subscribePayload };
})();

class App extends HTMLDivElement {
  src: string;

  boxStates: AppState[];

  constructor() {
    super();
    socketio.subscribePayload(0);
  }

  connectedCallback() {
    console.log("Custom square element added to page.");
  }

  disconnectedCallback() {
    console.log("Custom square element removed from page.");
  }

  render() {
    const { src } = this;
    /*return this.state ? (
      <div className="box">
        {getMedia({ src })}
        {this.boxStates.map(getBox)}
      </div>
    ) : (
      <div />
    );*/
  }
}

//render(<App />, document.getElementById("root"));
