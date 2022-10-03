export const useIPFS = () => {
  const resolveLink = (url) => {
    if (!url || !url.includes("ipfs://")) return url;
    return url.replace("ipfs://", "https://cf-ipfs.com/ipfs/"); //cf-ipfs.com || gateway.ipfs.io
  };

  // error 429 too many requests.

  return { resolveLink };
};
