export const useIPFS = () => {
  const resolveLink = (url) => {
    if (!url || !url.includes("ipfs://")) return url;
    return url.replace("ipfs://", "https://demuse.infura-ipfs.io/ipfs/"); //cf-ipfs.com || gateway.ipfs.io || cloudflare-ipfs.com
  };

  // error 429 too many requests.

  return { resolveLink };
};
