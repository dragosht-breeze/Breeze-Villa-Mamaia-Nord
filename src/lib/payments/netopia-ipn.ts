import {
  createHash,
  createPublicKey,
  timingSafeEqual,
  verify as verifySignature,
} from "node:crypto";

type JwtHeader = {
  alg?: string;
  typ?: string;
};

type JwtClaims = {
  iss?: string;
  aud?: string | string[];
  sub?: string;
  exp?: number;
  nbf?: number;
};

export type NetopiaIpnPayload = {
  order?: {
    orderID?: string;
    amount?: number;
    currency?: string;
  };
  payment?: {
    ntpID?: string | number;
    status?: number;
  };
};

const algorithms: Record<string, string> = {
  RS256: "RSA-SHA256",
  RS384: "RSA-SHA384",
  RS512: "RSA-SHA512",
};

function decodeJsonPart<T>(part: string): T {
  return JSON.parse(Buffer.from(part, "base64url").toString("utf8")) as T;
}

function equalStrings(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function normalizeCertificate(value: string) {
  return value.replace(/\\n/g, "\n").trim();
}

export function verifyNetopiaIpn(input: {
  rawBody: string;
  verificationToken: string;
  certificate: string;
  expectedPosSignature: string;
}) {
  const parts = input.verificationToken.split(".");
  if (parts.length !== 3) throw new Error("Invalid verification token");

  const [encodedHeader, encodedClaims, encodedSignature] = parts;
  const header = decodeJsonPart<JwtHeader>(encodedHeader);
  const claims = decodeJsonPart<JwtClaims>(encodedClaims);
  const cryptoAlgorithm = header.alg ? algorithms[header.alg] : undefined;

  if (!cryptoAlgorithm) throw new Error("Unsupported verification algorithm");

  const publicKey = createPublicKey(normalizeCertificate(input.certificate));
  const signatureIsValid = verifySignature(
    cryptoAlgorithm,
    Buffer.from(`${encodedHeader}.${encodedClaims}`),
    publicKey,
    Buffer.from(encodedSignature, "base64url")
  );

  if (!signatureIsValid) throw new Error("Invalid verification signature");
  if (claims.iss !== "NETOPIA Payments") throw new Error("Invalid token issuer");

  const audiences = Array.isArray(claims.aud)
    ? claims.aud
    : claims.aud
      ? [claims.aud]
      : [];
  if (!audiences.includes(input.expectedPosSignature)) {
    throw new Error("Invalid token audience");
  }

  const now = Math.floor(Date.now() / 1000);
  if (typeof claims.exp === "number" && claims.exp <= now) {
    throw new Error("Expired verification token");
  }
  if (typeof claims.nbf === "number" && claims.nbf > now) {
    throw new Error("Verification token is not active");
  }

  const payloadHash = createHash("sha512")
    .update(Buffer.from(input.rawBody))
    .digest("base64");
  if (!claims.sub || !equalStrings(payloadHash, claims.sub)) {
    throw new Error("Payload hash mismatch");
  }

  const payload = JSON.parse(input.rawBody) as NetopiaIpnPayload;
  return { payload, claims };
}

