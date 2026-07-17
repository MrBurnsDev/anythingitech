/**
 * WebRTC NAT / UDP probe (browser-only).
 *
 * Queries two independent STUN servers and compares the public (server-
 * reflexive) port each reports. Same port from both = endpoint-independent
 * mapping (cone NAT, friendly to calls); different ports = symmetric NAT
 * (usually needs a TURN relay). Getting any server-reflexive candidate at all
 * proves UDP egress works.
 */

export interface NatProbeResult {
  udpWorks: boolean;
  symmetricNat: boolean | null;
  publicIp: string | null;
  mappedPorts: number[];
}

const DEFAULT_STUN = ["stun:stun.l.google.com:19302", "stun:stun.cloudflare.com:3478"];

interface Srflx {
  ip: string;
  port: number;
}

function getSrflx(stunUrl: string, timeoutMs = 5000): Promise<Srflx | null> {
  return new Promise((resolve) => {
    let pc: RTCPeerConnection;
    try {
      pc = new RTCPeerConnection({ iceServers: [{ urls: stunUrl }] });
    } catch {
      resolve(null);
      return;
    }
    let done = false;
    const finish = (v: Srflx | null) => {
      if (done) return;
      done = true;
      try {
        pc.close();
      } catch {
        /* ignore */
      }
      resolve(v);
    };

    pc.onicecandidate = (e) => {
      if (!e.candidate) {
        finish(null); // gathering complete, no srflx seen
        return;
      }
      const cand = e.candidate.candidate;
      // "candidate:<foundation> <component> udp <priority> <ip> <port> typ srflx ..."
      if (/ typ srflx /.test(cand)) {
        const parts = cand.split(" ");
        const ip = parts[4];
        const port = Number(parts[5]);
        if (ip && Number.isFinite(port)) finish({ ip, port });
      }
    };

    try {
      pc.createDataChannel("probe");
      pc.createOffer()
        .then((o) => pc.setLocalDescription(o))
        .catch(() => finish(null));
    } catch {
      finish(null);
    }

    setTimeout(() => finish(null), timeoutMs);
  });
}

export async function probeNat(stunServers: string[] = DEFAULT_STUN): Promise<NatProbeResult> {
  if (typeof RTCPeerConnection === "undefined") {
    return { udpWorks: false, symmetricNat: null, publicIp: null, mappedPorts: [] };
  }

  const [a, b] = await Promise.all([
    getSrflx(stunServers[0]),
    getSrflx(stunServers[1] ?? stunServers[0]),
  ]);

  const found = [a, b].filter((x): x is Srflx => x !== null);
  const udpWorks = found.length > 0;
  const publicIp = found[0]?.ip ?? null;
  const mappedPorts = found.map((x) => x.port);

  let symmetricNat: boolean | null = null;
  if (a && b) symmetricNat = a.port !== b.port;

  return { udpWorks, symmetricNat, publicIp, mappedPorts };
}
