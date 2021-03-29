// Import stylesheets
import "./style.css";
import { AppState, BoxPayload } from "./bbox";
import "./style.css";

import { fromEvent } from "rxjs";
import { Observable } from "rxjs/Observable";
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

fetch("https://www.hwangsehyun.com/webrtc-onvif/webrtc/config.json")
  .then(res => res.json())
  .then(console.log);

class CCTVBBox extends HTMLElement {
  boxStates: AppState[];
  video: HTMLVideoElement;
  event: Observable<any>;
  boxes: HTMLDivElement[];

  constructor(){
    super();
    //setInterval(() => this.setAttribute("src", Math.random().toString()), 1000);
    return this;
  }

  connectedCallback() {
    this.innerHTML = `<img src="https://i2-prod.belfastlive.co.uk/incoming/article13722455.ece/ALTERNATES/s615/1PNG.png" />`

    this.event = socketio.subscribePayload(0);
    console.log("Custom square element added to page.");
  }

  disconnectedCallback() {
    console.log("Custom square element removed from page.");
  }


  static get observedAttributes() {
    return ['src'];
  }


  srcCallback() {
    const video = document.createElement('video');
    video.autoplay = true;
    video.src = cur;
    this.querySelector('img').replaceWith(video);
  }

  attributeChangedCallback(attribute, prev, cur) {
    if (!cur)
      return;

    this.srcCallback(src);
  }



  render() {
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

customElements.define('cctv-bbox',CCTVBBox);

