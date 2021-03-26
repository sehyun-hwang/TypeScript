// Import stylesheets
import "./style.css";
import { getMedia, getBox, AppState, BoxPayload } from "./Hello";
import "./style.css";

import { fromEvent } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, filter } from "rxjs/operators";
import { CustomElement, Watch } from 'custom-elements-ts';
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

fetch("https://www.hwangsehyun.com/webrtc-onvif/webrtc/config.json")
  .then(res => res.json())
  .then(console.log);




@CustomElement({
  tag: 'cctv-bbox',
  templateUrl: 'counter-element.html',
  styleUrl: 'bbox.scss'
})
class extends HTMLElement   {
  event: Observable<any>;

  @Watch('src')
  srcChanged() {
    // trigger when color property color changes
    // either via property or attribute
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
